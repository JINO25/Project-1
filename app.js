/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */

const express = require('express');
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const pug = require('pug')
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require("bcrypt");

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouter');
const reviewRoute = require('./routes/reviewRoutes');
const bookingRoute = require('./routes/bookingRoutes');
const viewRoute = require('./routes/viewRoutes')
const globalError = require('./controller/errorController');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const scriptSrcUrls = [
    'https://localhost:3000/success/cash',
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://cdnjs.cloudflare.com',
    'https://*.cloudflare.com',
    'https://*.stripe.com',
    'https://*.js.stripe.com',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

const styleSrcUrls = [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

const fontSrcUrls = [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/'
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'http://127.0.0.1:3000/*', 'https://localhost:3000'],
            connectSrc: ["'self'", 'https://js.stripe.com/v3/',
                'http://127.0.0.1:3000',
                'http://localhost:3000',
                'ws://127.0.0.1:3000/',
                `ws://localhost:3000/`,
                'https://checkout.stripe.com',
                'https://api.stripe.com',
                'https://maps.googleapis.com', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'],
            scriptSrc: ["'self'", "'nonce-yourNonce'",
                "'sha256-ajGjo5eD0JzFPdnpuutKT6Sb5gLu+Q9ru594rwJogGQ='",
                "'unsafe-eval'",
                ...scriptSrcUrls],
            styleSrc: styleSrcUrls,
            fontSrc: fontSrcUrls,
            imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'https://*.stripe.com'],
            frameSrc: ["'self'", 'https://*.stripe.com', 'https://*.js.stripe.com'],
            objectSrc: ["'none'"],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ["'self'", 'blob:'],
            upgradeInsecureRequests: []
        }
    })
);



app.use(cookieParser());
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set to true if using HTTPS
// }));

app.use(passport.initialize());
// app.use(passport.session())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json());

app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter)
app.use('/api/v1/review', reviewRoute)
app.use('/api/v1/booking', bookingRoute)
app.use('/', viewRoute);
app.use(globalError);

module.exports = app;


