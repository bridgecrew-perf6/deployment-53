const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  BidderID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  Owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  NFTID: {
    type: mongoose.Schema.ObjectId,
    ref: "NFT",
  },
  OrderId: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
  },
  BidStatus: {
    type: String,
    enum: ["Bid", "Cancelled", "Accepted", "Sold", "Rejected", "MakeOffer", "AcceptOffer", "RejectOffer", "CancelledOffer"],
  },
  BidPrice: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  BidDeadline: {
    type: Date
  },
  BidQuantity: Number,
  BuyerSignature: Array,
  isOffer: {
    type: Boolean,
    default: true,
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
  },
});

module.exports = mongoose.model("Bid", bidSchema);
