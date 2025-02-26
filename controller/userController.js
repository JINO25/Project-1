/* eslint-disable */
const User = require('../models/userModel');
const CreateError = require('../utils/CreateError');
const catchAsync = require('../middlewares/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.Cloudinary_NAME,
    api_key: process.env.Cloudinary_API,
    api_secret: process.env.Cloudinary_SECRET
});

//storage file as buffer
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


const uploadPhotoCloudinary = async (fileBuffer) => {
    try {
        const uploadResult = await new Promise((resolve) => {
            cloudinary.uploader.upload_stream({
                folder: 'users'
            }, (error, uploadResult) => {
                if (error) {
                    console.log("Cloudinary Upload Error:", error)
                    return reject(error);
                }
                return resolve(uploadResult);
            }).end(fileBuffer);
        });
        return uploadResult;
    } catch (error) {
        console.log(error)
    }
}

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const photoURL = await uploadPhotoCloudinary(req.file.buffer);
    req.file.filename = photoURL.url;
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

    const filteredBody = filterObj(req.body, 'name', 'phone');
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
