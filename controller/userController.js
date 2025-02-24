/* eslint-disable */
const User = require('../models/userModel');
const CreateError = require('../utils/CreateError');
const catchAsync = require('../middlewares/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error("Only images are allowed!"));
    }
};

const upload = multer({
    storage,
    fileFilter: filter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

//filterObj([name,email],[name,email])
const filterObj = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (fields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
}

exports.updateMe = catchAsync(async (req, res, next) => {

    const filteredBody = filterObj(req.body, 'name', 'email', 'phone');
    if (req.file) filteredBody.photo = req.file.filename;

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });

});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    // console.log(req.user.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
    const doc = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            users: doc
        }
    })
});

exports.getUser = catchAsync(async (req, res, next) => {
    const doc = await User.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            user: doc
        }
    })

});


exports.createUser = catchAsync(async (req, res, next) => {
    const doc = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            users: doc
        }
    })

});

exports.updateUser = catchAsync(async (req, res, next) => {
    const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc)
        return next(new CreateError('No user with ID', 404));

    res.status(200).json({
        status: 'success',
        data: {
            users: doc
        }
    })

});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const doc = await User.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new CreateError(`No tour with ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});
