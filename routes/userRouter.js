/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable import/newline-after-import */

const express = require('express')
const router = express.Router();
const userController = require('./../controller/userController');
const authenController = require('./../controller/authenController');

router.post('/login', authenController.login);
router.post('/signup', authenController.signup);
router.get('/logout', authenController.logout);

//via email
router.post('/forgotPassword', authenController.forgotPassword);
router.patch('/resetPassword/:token', authenController.resetPassword);

router.use(authenController.protect);
router.patch('/updatePassword', authenController.updatePassword);
router.delete('/deleteMe', userController.deleteMe);
// router.get('/me', userController.getMe, userController.getUser);
//upload image for user
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

router.use(authenController.restrictTo('admin'));
router
    .route('/')
    .get(userController.getAllUser)
    .post(userController.createUser)


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;