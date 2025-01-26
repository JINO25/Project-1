/* eslint-disable prettier/prettier */
const validator = require("validator");
const { default: mongoose } = require("mongoose");

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: function () {
            return !this.isGuest;
        }
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    guestName: {
        type: String,
        required: function () {
            return this.isGuest;
        }
    },
    guestEmail: {
        type: String,
        required: function () {
            return this.isGuest;
        },
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    guestPhone: {
        type: String,
        required: function () {
            return this.isGuest;
        }
    },
    guestAddress: {
        type: String
    },
    date: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    methodPayment: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price.']
    },
    quantity: {
        type: Number,
        require: true
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;