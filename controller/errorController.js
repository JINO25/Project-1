/* eslint-disable */

const CreateError = require('../utils/CreateError');

const handleJWTError = err => new CreateError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = err => new CreateError('Your token has expired! Please log in again.', 401);


const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new CreateError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new CreateError(message, 500);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new CreateError(message, 400);
}

const sendErrDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            statusCode: err.statusCode,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    //Render web
    console.error('Error ', err);
    return res.status(err.statusCode).render('error', {
        user: req.user,
        title: 'Something went wrong!',
        msg: err.message
    });

};

const sendErrProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/')) {
        //Operational, trusted err
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        //Programming or unknown err
        //Log err
        console.error('Error ', err);
        //Send generic mess
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        });
    }

    //Operational, trusted err
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            user: req.user,
            title: 'Something went wrong!',
            msg: err.message
        });
        //Programming or unknown err
    }
    //Log err
    console.error('Error ', err);
    //Send generic mess
    return res.status(err.statusCode).render('error', {
        user: req.user,
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });

}


module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);

        if (error.name === 'CastError') error = handleCastErrorDB(error); // it will then  return a new CreateError
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrProd(error, req, res);
    }
})