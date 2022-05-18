const mongoose = require("mongoose");

const nftSchema = mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  Type: {
    type: Number,
    require: true,
    enum: [1, 2],
  },
  Image: { type: String, require: true },
  Price: { type: String, require: true },
  Description: { type: String },
  CollectionID: {
    type: mongoose.Schema.ObjectId,
    ref: "Collection",
  },
  TokenID: String,
  AssetsInfo: [
    {
      Size: String,
      Type: String,
      Dimension: String,
    },
  ],
  Attributes: [
    {
      Name: String,
      Value: String
    },
  ],
  Levels: [
    {
      Name: String,
      Value: String
    },
  ],
  TotalQuantity: Number,
  OwnedBy: [
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
  Properties: [
    {
      Name: String,
      Value: String
    },
  ],
  Hash: {
    type: String,
    require: true,
    unique:true,
  },
  isMinted: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
  },
  CreatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  CreatedOn: {
    type: Date,
    default: Date.now,
  },
  LastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  LastUpdatedOn: {
    type: Date,
    default: Date.now,
  }
});
module.exports = mongoose.model("NFT", nftSchema);