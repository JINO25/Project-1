/* eslint-disable prettier/prettier */
// const express = requrie('express');
const Review = require("../models/reviewModel");
const CreateError = require('../utils/CreateError');
const asyncHandler = require('../middlewares/catchAsync');

exports.setUserIds = (req, res, next) => {
    //Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

exports.createReview = asyncHandler(async (req, res, next) => {
    const doc = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAllReview = asyncHandler(async (req, res, next) => {
    const docs = await Review.find();

    res.status(200).json({
        status: 'success',
        data: {
            data: docs
        }
    })
});


exports.getReview = asyncHandler(async (req, res, next) => {
    const doc = await Review.findById(req.params.id)

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })

});

exports.updateReview = asyncHandler(async (req, res, next) => {
    const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    if (!doc) {
        return next(new CreateError(`No review with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
    const doc = await Review.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new CreateError(`No review with ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

