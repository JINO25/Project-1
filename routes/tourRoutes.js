/* eslint-disable */

const express = require('express');

const tourController = require('./../controller/tourController');
const authenController = require('./../controller/authenController');

const router = express.Router();

router.use(authenController.protect)

router
    .route('/')
    .get(tourController.getAllTour)
    .post(authenController.restrictTo('admin'), tourController.createTour);


router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router