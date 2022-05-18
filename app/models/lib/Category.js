const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Name: {
        type: String,
        unique: true
    },
    Image: String,
    CreatedBy: {
        type: mongoose.Schema.ObjectId
    },
    CreatedOn: {
        type: Date,
        default: Date.now,
    },
    LastUpdatedBy: {
        type: mongoose.Schema.ObjectId
    },
    LastUpdatedOn: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Category', categorySchema);