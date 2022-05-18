const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  NFTID: {
    type: mongoose.Schema.ObjectId,
    ref: "NFT",
  },
  CollectionID: {
    type: mongoose.Schema.ObjectId,
    ref: "Collection",
  },
  BrandID: {
    type: mongoose.Schema.ObjectId,
    ref: "Brand",
  },
  BidID: {
    type: mongoose.Schema.ObjectId,
    ref: "Bid",
  },
  BuyerID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  SellerID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  Type : { 
    type: String,
    enum: ["Bid", "Cancelled", "Accepted", "Sold", "Rejected", "MakeOffer", "AcceptOffer", "RejectOffer", "CancelledOffer"],
  },
  Quantity: Number,
  Price: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  TransactionHash: {
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
  },
});

module.exports = mongoose.model("History", historySchema);
