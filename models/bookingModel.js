/* eslint-disable prettier/prettier */
const validator = require("validator");
const mongoose = require('mongoose');
const CreateError = require('../utils/CreateError');

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

bookingSchema.methods.updateTourQuantity = async function () {
    const tour = await mongoose.model('Tour').findById(this.tour);


    if (!tour) {
        return new CreateError('Tour not found', 404);
    }

    const selectedDate = tour.startDate.find(d => d.date === this.date);

    if (!selectedDate) {
        return new CreateError('Selected date is not available for this tour', 404);
    }

    if (selectedDate.quantity < this.quantity) {
        return new CreateError('Quantity is not enough for this tour', 400);
    }

    selectedDate.quantity -= this.quantity;
    await tour.save();
}

bookingSchema.post('save', async function () {
    await this.updateTourQuantity();
})

bookingSchema.methods.cancelBookingTourQuantity = async function () {
    const tour = await mongoose.model('Tour').findById(this.tour);

    if (!tour) {
        return new CreateError('Tour not found', 404);
    }

    const selectedDate = tour.startDate.find(d => d.date === this.date);

    selectedDate.quantity += this.quantity;
    await tour.save();
}

bookingSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    await this.cancelBookingTourQuantity();
    next();
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;