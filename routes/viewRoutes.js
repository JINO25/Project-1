/* eslint-disable */

const express = require('express');
const viewsController = require('../controller/viewController');
const authController = require('../controller/authenController');
const bookingController = require('../controller/bookingController');
const router = express.Router();

router.get('/', authController.isLogin, viewsController.getOverview);
router.get('/tour/:slug', authController.isLogin, viewsController.getTour);

router.get('/search', authController.isLogin, viewsController.getSearching);

// router.get('/tour/:slug', authController.isLoggedIn, bookingController.createBookingCheckout, viewsController.getTour);
router.get('/login', authController.isLogin, viewsController.getLogin);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/booking/:id', authController.isLogin, viewsController.getBooking);

router.get('/forgotPassword', viewsController.getForgotPassword);
router.get('/resetPassword/:token', viewsController.getResetPassword);



router.get(
    '/success',
    // authController.protect,
    bookingController.paymentSuccess,
    viewsController.getSuccess);

router.get(
    '/success/cash',
    viewsController.getSuccess);

router.delete(
    '/cancelTour',
    authController.protect,
    viewsController.cancelBookingTour
)

module.exports = router;