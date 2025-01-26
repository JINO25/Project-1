/* eslint-disable */

const catchAsync = require('../middlewares/catchAsync');
const CreateError = require('../utils/CreateError');
const APIFeature = require('../utils/apiFeatures');
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.create(req.body);
    // console.log(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: doc,
        },
    });
});

exports.getBooking = catchAsync(async (req, res, next) => {
    const doc = Booking.findById(req.params.id);

    if (!doc) {
        return next(new CreateError('No document found with ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        },
    });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {

    const doc = await Booking.find();

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        },
    });

});

exports.updateBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) {
        return next(new CreateError('No document found with ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        },
    });

});


exports.deleteBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new CreateError('No document found with ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

//handle payment Stripe
exports.createCheckOutSession = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id);
    const { quantity, date } = req.body;
    const session = await Stripe.checkout.sessions.create({
        line_items: [
            {
                quantity: quantity,
                price_data: {
                    currency: 'VND',
                    unit_amount: tour.price * 1,
                    product_data: {
                        name: tour.name,
                        description: tour.description,
                        images: [`http://localhost:3000/img/tour/${tour.imageCover}`]
                    },
                },
            },
        ],
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: req.user.email,
        client_reference_id: req.params.id,
        success_url: `${req.protocol}://${req.get('host')}/success/?tour=${tour._id}&user=${req.user._id}&price=${tour.price}&quantity=${quantity}&date=${date}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.createCheckoutSessionGuest = catchAsync(async (req, res) => {
    const { tourId, guestName, guestEmail, guestPhone, guestAddress, quantity, methodPayment, date } = req.body;
    const tour = await Tour.findById(tourId);
    const guestUser = {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        address: guestAddress,
        methodPayment
    }
    const session = await Stripe.checkout.sessions.create({
        line_items: [
            {
                quantity: quantity,
                price_data: {
                    currency: 'VND',
                    unit_amount: tour.price * 1,
                    product_data: {
                        name: tour.name,
                        description: tour.description,
                    },
                },
            },
        ],
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: guestEmail,
        client_reference_id: tourId,
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent encodeURIComponent => encoding string
        success_url: `${req.protocol}://${req.get('host')}/success/?tour=${tourId}&user=${encodeURIComponent(JSON.stringify(guestUser))}&price=${tour.price}&quantity=${quantity}&date=${date}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});


exports.paymentSuccess = catchAsync(async (req, res, next) => {
    const { tour, user, price, quantity, date } = req.query;
    let isGuest = false;

    if (typeof user === 'string' && user.startsWith('{')) {

        const guestUser = JSON.parse(user);
        const { name, email, phone, address, methodPayment } = guestUser;
        isGuest = true;

        if (!tour && !user && !price) return next();
        await Booking.create({
            tour,
            guestName: name,
            guestEmail: email,
            guestPhone: phone,
            guestAddress: address,
            isGuest,
            methodPayment,
            price,
            quantity,
            date: date
        });

        res.redirect(req.originalUrl.split('?')[0]);

    } else {

        if (!tour && !user && !price) return next();
        await Booking.create({ tour, user, price, quantity, methodPayment: 'Card', date: date });
        res.redirect(req.originalUrl.split('?')[0]);
    }

});

exports.cashSuccess = catchAsync(async (req, res, next) => {
    const { tourId, data, date } = req.query
    let isGuest = false;
    const tour = await Tour.findById(tourId);
    const price = tour.price;
    if (typeof data === 'string' && data.startsWith('{')) {

        const guestUser = JSON.parse(data);
        const { guestName, guestEmail, guestPhone, guestAddress, quantity, methodPayment, date } = guestUser;
        isGuest = true;

        if (!tourId && !guestName && !guestEmail && !guestPhone && !price) return next();
        await Booking.create({
            tour: tourId,
            guestName,
            guestEmail,
            guestPhone,
            guestAddress,
            isGuest,
            methodPayment,
            price,
            quantity,
            paid: false,
            date: date
        });

        return res.status(200).json({
            status: 'success'
        })

    } else {
        const user = req.user._id;
        const { quantity } = req.query
        if (!tourId && !user && !price) return next();
        await Booking.create({ tour, user, price, quantity, methodPayment: 'tiền mặt', paid: false, date: date });

        return res.status(200).json({
            status: 'success'
        })
    }
});
