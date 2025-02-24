/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        trim: true,
        // maxLength: [100, 'A tour name must have less or equal then 100 characters'],
        minLength: [5, 'A tour name must have less or equal then 5 characters']
    },
    slug: String,
    description: {
        type: String,
        // required: [true, 'A tour must have description'],
        trim: true
    },
    duration: {
        type: String,
        required: [true, 'A tour must have a duration']
    },
    food: String,
    sightseeing: {
        type: String,
        required: true
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    quantity: {
        type: Number,
        required: [true, 'A tour must have quantity']
    },
    hotel: {
        type: String,
        required: [true, 'A tour must have clearly hotel']
    },
    schedule: [{
        day: String,
        description: String,
        // required: true
    }],
    imageCover: {
        type: String
    },
    images: [{
        type: String
    }],
    startLocation: {
        type: String,
        // required: true
    },
    startDate: [{
        date: String,
        time: String,
        quantity: Number
    }],
    vehicle: {
        type: String
    },
    participant: {
        type: String
    },
    guides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
