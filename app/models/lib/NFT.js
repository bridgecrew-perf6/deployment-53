const mongoose = require("mongoose");

const nftSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  type: {
    type: Number,
    require: true,
    enum: [1, 2],
  },
  image: { type: String, require: true },
  price: { type: String, require: true },
  description: { type: String },
  collectionID: {
    type: mongoose.Schema.ObjectId,
    ref: "Collection",
  },
  tokenID: String,
  assetsInfo: [
    {
      size: String,
      type: String,
      dimension: String,
    },
  ],
  attributes: [
    {
      name: String,
      value: String
    },
  ],
  levels: [
    {
      name: String,
      value: String
    },
  ],
  totalQuantity: Number,
  ownedBy: [
    {
      address: {
        type: String,
        lowercase: true,
      },
      quantity: {
        type: Number,
      },
    },
  ],
  properties: [
    {
      Name: String,
      Value: String
    },
  ],
  hash: {
    type: String,
    require: true,
    unique:true,
  },
  isMinted: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  lastUpdatedOn: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("NFT", nftSchema);