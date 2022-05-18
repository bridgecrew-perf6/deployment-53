const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  NFTID: {
    type: mongoose.Schema.ObjectId,
    ref: "NFT",
  },
  CollectionAddress: {
    type: String,
    require: true
  },
  SellerID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  SalesType: {
    type: Number,
    enum: [0, 1], // 0-Fixed Sale 1-Timed Auction
  },
  Quantity: {
    address: {
      type: String,
      lowercase: true,
    },
    quantity: {
      type: Number,
    },
  },
  Price: {
    type: Number,
  },
  TokenID: {
    type: String,
  },
  TokenAddress: {
    type: String,
  },
  Deadline: {
    type: Date,
  },
  PaymentToken: {
    type: String,
  },
  Salt: {
    type: String,
  },
  Signature: {
    type: String,
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
module.exports = mongoose.model("Order", orderSchema);