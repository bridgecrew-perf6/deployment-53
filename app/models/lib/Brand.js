const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    Name: {
        type: String,
        unique: true
    },
    LogoImage: String,
    CoverImage: String,
    Description: String,
    SalesCount: {
        type: Number,
        default : 0
    },
    NFTCount: {
        type: Number,
        default : 0
    },
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

module.exports = mongoose.model('Brand', brandSchema);