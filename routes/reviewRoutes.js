/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
// const express = require('express');
const express = require('express');

const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authenController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(authController.restrictTo('user'),
        // reviewController.setUserIds,
        reviewController.createReview);


router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('admin', 'user'), reviewController.updateReview)
    .delete(authController.restrictTo('admin', 'user'), reviewController.deleteReview)

module.exports = router