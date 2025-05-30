/* eslint-disable */
const mongoose = require('mongoose');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB)
    .then(() => {
        console.log('✅ DB connected');
        process.exit(0); // Thành công
    })
    .catch((err) => {
        console.error('❌ DB connection failed:', err);
        process.exit(1); // Báo lỗi
    });
