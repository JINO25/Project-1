/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */

const mongoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name']
        },
        address: {
            type: String,
            // required: true
        },
        phone: {
            type: Number,
            // required: [true, 'Please tell us your phone']
        },
        email: {
            type: String,
            required: [true, 'Please tell us your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email!']

        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'admin'],
            default: 'user'
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (e) {
                    return e === this.password;
                },
                message: 'Passwords are not same!'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpire: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        },
        authProvider: {
            type: String,
            default: null
        }
    }
);

//Encode password to save in db
userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})

//Update when changing password
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
})

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(JWTTimestamp, changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    //if user has not changed the password
    return false;
}

userSchema.methods.createPasswordReset = function () {
    // random generate token 
    const token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');

    //it works in 10 minutes
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;