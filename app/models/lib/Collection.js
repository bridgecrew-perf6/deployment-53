const mongoose=require("mongoose");

const collectionSchema=mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  type: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  logoImage: {
    type: String,
    require: true
  },
  coverImage: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  categoryID: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  brandID: {
    type: mongoose.Schema.ObjectId,
    ref: "Brand",
  },
  contractAddress: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
  },
  chainID: {
    type: String
  },
  salesCount: {
    type: Number,
    default: 0
  },
  nftCount: {
    type: Number,
    default: 0
  },
  volumeTraded: {
    type: Number,
    default: 0
  },
  preSaleStartTime: {
    type: Date,
  },
  totalSupply: {
    type: Number,
    default: 0
  },
  nextID: {
    type: Number,
    require: true,
    default: 0,
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
collectionSchema.methods.getNextID=function() {
  let nextIDDD=this.nextID+1;
  return nextIDDD;
};
module.exports = mongoose.model("Collection",collectionSchema);