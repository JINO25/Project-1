/* eslint-disable */
const express = require('express');
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authenController');

const router = express.Router();


router.post('/create-checkout-session-guest', bookingController.createCheckoutSessionGuest);
router.post('/create-checkout-cash-guest', bookingController.cashSuccess)


router.use(authController.protect);
router.post('/create-checkout-cash', bookingController.cashSuccess)
router.post('/create-checkout-session/:id', bookingController.createCheckOutSession);

router.use(authController.restrictTo('admin', 'guide'));

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;