/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const CreateError = require('../utils/CreateError');
const catchAsync = require('../middlewares/catchAsync');
const Email = require('../utils/email');

const generateToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRIES
    });


const sendToken = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const cookieOption = {
        expire: new Date(
            Date.now() + process.env.JWT_EXPIRIES * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwtCookie', token, cookieOption);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });

}

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //1) Getting token and check it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwtCookie) {
        token = req.cookies.jwtCookie;
    }

    if (!token) return next(new CreateError('You are not log in, please login again!'), 401);

    //2) Verification token
    const result = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    //3) Check if user still exists
    const currentUser = await User.findById(result.id);


    if (!currentUser) return next(new CreateError('The user doest not longer exist!'));

    //4) Check if user change password after the JWT was issued
    if (currentUser.changedPasswordAfter(result.iat)) {
        return next(new CreateError('User recently changed password! Please log in again', 401));
    }

    //GRANT ACCESS TO PROTECT THE ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLogin = async (req, res, next) => {
    if (req.cookies.jwtCookie) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwtCookie,
                process.env.JWT_SECRET_KEY
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CreateError('You do not have permission to perform this action', 403));
        }

        next();
    }
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new CreateError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new CreateError('Invalid email or password!', 401));
    }

    // console.log(user);
    sendToken(user, 201, res);
});

exports.logout = (req, res) => {
    res.cookie('jwtCookie', 'out', {
        expire: new Date(Date.now + 10 * 1000), //10 is 10 seconds
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}


exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await bcrypt.compare(req.body.passwordCurrent, user.password))) {
        return next(new CreateError('Your password is wrong', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    sendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on Posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new CreateError('There is no user with email!', 404));
    // console.log(user);
    //2) Generate the random reset token
    const resetToken = user.createPasswordReset();
    await user.save({ validateBeforeSave: false });
    //3) Send it to user' email
    // console.log(resetToken);

    try {
        // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;
        const resetURL = `localhost:3000/api/v1/user/resetPassword/${resetToken}`;
        // console.log(resetURL);

        await new Email(user, resetURL).sendResetPassword();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new CreateError('There was an error sending the email. Try again later!', 500));
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token (update() is used to provide a new hash object)
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() }
    });

    //2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new CreateError('Token is invalid or has expired', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    //3) Update changePasswordAt property for the user (userModel) (userModel has set when changing password)
    //4) Log the user in, send JWT
    sendToken(user, 200, res);
});