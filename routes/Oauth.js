/* eslint-disable */
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

}

passport.use(new GoogleStrategy({
    clientID: process.env.GgClient_ID,
    clientSecret: process.env.GgClient_Secret,
    callbackURL: 'http://localhost:3000/api/v1/user/login/google/callback',
    scope: ['profile']
},
    (accessToken, refreshToken, profile, done) => {
        if (profile.id) {
            User.findOne({ email: profile.emails[0].value }).then((el) => {
                if (el) {
                    console.log(`accessToken: ${accessToken}`)
                    console.log(`refreshToken: ${refreshToken}`)
                    done(null, el)
                } else {
                    const randomPass = crypto.randomBytes(20).toString('hex');

                    new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        photo: profile.photos[0].value,
                        password: randomPass,
                        passwordConfirm: randomPass,
                        authProvider: 'google'
                    }).save().then(user => {
                        console.log('save successfully');
                        done(null, user)
                    })
                }
            }).catch(err => console.log(err));
        }
    }
));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('id: ', id);
    User.findById(id)
        .then(user => {
            done(null, user);
        })
});

exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', (err, user) => {
        if (err || !user) {
            return res.redirect('http://localhost:3000/login')
        } else {
            sendToken(user, 201, res);
            res.redirect('http://localhost:3000/')
        }
    })(req, res, next)
}
// googleAuth(req, res, next)

// Calls passport.authenticate('google') as a middleware.
// Properly passes req, res, next so Express can handle the request flow.
//     googleAuthCallback(req, res, next)

// Processes the callback after Google login.
// Checks for errors and user authentication.
// Calls req.login(user, callback) to store user session and redirects.