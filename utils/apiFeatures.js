/* eslint-disable */

class APIFeature {
    constructor(query, queryParam) {
        this.query = query;
        this.queryParam = queryParam;
    }

    filter() {
        const queryObj = { ...this.queryParam };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);

        //Replaced string gte to $gte
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryParam.sort) {
            // const sortBy = this.queryParam.sort.split(',').join(' ');
            const sortBy = Array.isArray(this.queryParam.sort) ? this.queryParam.sort.join(' ') : this.queryParam.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt _id');
        }
        return this;
    }

    limitField() {
        if (this.queryParam.fields) {
            const fields = this.queryParam.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryParam.page * 1 || 1;
        // const limit = this.queryParam.limit * 1 || 100;
        const limit = process.env.LIMITPAGE;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeature;

