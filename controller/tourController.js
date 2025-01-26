/* eslint-disable */

const Tour = require("../models/tourModel");
const CreateError = require('../utils/CreateError');
const asyncHandler = require('../middlewares/catchAsync');
const APIFeature = require('../utils/apiFeatures');

exports.createTour = asyncHandler(async (req, res, next) => {
    const doc = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: doc
        }
    });
});

exports.getAllTour = asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeature(Tour.find(filter), req.query)
        .filter()
        .sort()
        .limitField()
        .pagination()

    const docs = await features.query;

    // const docs = await Tour.find();

    // console.log(docs);

    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            tour: docs
        }
    })
});


exports.getTour = asyncHandler(async (req, res, next) => {
    const doc = await Tour.findById(req.params.id)

    res.status(200).json({
        status: 'success',
        data: {
            tour: doc
        }
    })

});

exports.updateTour = asyncHandler(async (req, res, next) => {
    const doc = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new CreateError(`No tour with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: doc
        }
    });
});

exports.deleteTour = asyncHandler(async (req, res, next) => {
    const doc = await Tour.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new CreateError(`No tour with ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

