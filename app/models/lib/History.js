const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  nftId: {
    type: mongoose.Schema.ObjectId,
    ref: "NFT",
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    enum: ["Bids", "Purchase", "Transfer", "Marketplace", "Creation"],
  },
  actionMeta: {
    type: String,
    enum: ["Default","Accept", "Listed", "Unlisted"],
  },
  message: {
    type: String,
  },
  sCreated: {
    type: Date,
    // default: Date.now,
  },
});

module.exports = mongoose.model("History", historySchema);
