/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5
    },
    createAt: {
        type: Date,
        default: Date.now()
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})


//calculate rating when booking a tour
reviewSchema.statics.calAvgRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId
            }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

//run when a review is saved into db
reviewSchema.post('save', function () {
    // constructor here is the model who created that document
    this.constructor.calAvgRating(this.tour);
})

//run when a review is updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    console.log(this.r);
    next();
})

//run when a review is updated or deleted
reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.r.constructor.calAvgRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;