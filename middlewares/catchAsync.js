/* eslint-disable prettier/prettier */
/* eslint-disable arrow-body-style */
const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

module.exports = asyncHandler;