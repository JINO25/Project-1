/* eslint-disable */

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../middlewares/catchAsync');
const CreateError = require('../utils/CreateError');
const mongoose = require('mongoose')
const APIFeature = require('../utils/apiFeatures');

exports.getOverview = catchAsync(async (req, res) => {

    const features = new APIFeature(Tour.find(), req.query).sort();

    const tours = await features.query;

    res.status(200).render('tour', {
        user: res.locals.user,
        title: 'All Tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {

    let tour = await Tour.findOne({
        $or: [
            { slug: req.params.slug },
            { _id: mongoose.Types.ObjectId.isValid(req.params.slug) ? req.params.slug : null }
        ]
    }).populate({
        path: 'reviews',
        select: 'review rating user'
    });

    if (tour === undefined) {
        return next(new CreateError('No tour found with that name', 404));
    }

    //find the reviews of users
    const users = await User.find();

    let booked = false;
    let reviewed = false;

    if (res.locals.user) {
        // If logged in, check if the user has booked the tour
        const booking = await Booking.findOne({
            user: res.locals.user._id,
            tour: tour._id
        });
        // If booking is an object(truthy), !!booking becomes true.
        // If booking is null(falsy), !!booking becomes false.
        booked = !!booking;

        //check user has reviewed or not

        const review = await Review.findOne({
            user: res.locals.user._id,
            tour: tour._id
        })

        reviewed = !!review;
        // console.log(review, reviewed, booked, res.locals.user);
    }

    res.status(200).render('tour_details', {
        user: res.locals.user,
        title: "Tour Details",
        users,
        tour,
        booked,
        reviewed,
    });
});

exports.getSearching = catchAsync(async (req, res, next) => {
    const { destination, dateFrom, minPrice, maxPrice } = req.query;

    const features = new APIFeature(Tour.find({
        $or: [
            { name: { $regex: destination, $options: 'i' } },
            { startDate: { $elemMatch: { date: dateFrom } } },
            { price: { $gte: minPrice, $lte: maxPrice } }
        ],

    }), req.query).sort();

    const tours = await features.query;

    // const tours = await Tour.find({
    //     $or: [
    //         { name: { $regex: destination, $options: 'i' } },
    //         { startDate: { $elemMatch: { date: dateFrom } } },
    //         { price: { $gte: minPrice, $lte: maxPrice } }
    //     ],

    // });

    if (tours.length == 0) {
        return res.status(404).render('404', {
            title: 'Tours Searching',
            msg: `Hiện tại chúng tôi đang cập nhật dữ liệu quý khách tìm, mong quý khách thông cảm.`
        });
    }

    res.status(200).render('tour', {
        user: res.locals.user,
        title: 'Tours Searching',
        tours,
    });

});

exports.getLogin = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: "Login your account"
    });
});

exports.getAccount = catchAsync(async (req, res, next) => {
    const user = req.user;
    let booked = false;
    const bookings = await Booking.find({ user: req.user.id });
    booked = !!bookings;

    // console.log(booked, bookings)

    res.status(200).render('account', {
        user,
        bookings,
        booked,
        title: "Account"
    });
});

function isThreeDaysDifference(createdAt) {
    const now = new Date();
    const [day, month, year] = createdAt.split('/').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    console.log(bookingDate)
    const differenceInMilliseconds = bookingDate - now;
    console.log(differenceInMilliseconds)

    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    console.log(differenceInDays)

    return Math.round(differenceInDays);
}

exports.cancelBookingTour = (async (req, res) => {
    const { bookingId } = req.query;
    const user = req.user;

    const data = await Booking.findOne({ _id: bookingId, user: user.id });

    const check = isThreeDaysDifference(data.date);

    if (check > 4) {
        await data.deleteOne();

        return res.status(200).json({
            status: 'success'
        })
    }

    return res.status(400).json({
        status: 'fail'
    })
});

exports.getSuccess = (req, res) => {
    res.status(200).render('successful');
};

exports.getBooking = (async (req, res) => {
    let tour = await Tour.findOne({ _id: req.params.id });

    let quantities = await Booking.find({ tour: req.params.id }).select('quantity').exec();

    let quantity = 0;
    quantities.map((el) => {
        quantity += el.quantity;
    });

    let tourQuantity = tour.quantity - quantity;

    res.status(200).render('booking', {
        title: "Booking Tour",
        user: res.locals.user,
        tour,
        tourQuantity
    });
});

exports.getForgotPassword = async (req, res) => {
    res.status(200).render('forgotPassword');
}

exports.getResetPassword = (req, res) => {
    res.status(200).render('resetPassword');
}