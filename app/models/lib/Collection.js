const mongoose = require("mongoose");

const collectionSchema = mongoose.Schema({
  Name: {
    type: String,
    require: true,
  },
  Type: {
    type: String,
    enum: ["Single", "Multiple"],
    default: "Single",
  },
  LogoImage : { type: String },
  CoverImage : { type: String },
  Description : { type: String },
  CategoryID: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  BrandID: {
    type: mongoose.Schema.ObjectId,
    ref: "Brand",
  },
  ContractAddress: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
  },
  ChainID:{
    type : String
  },
  SalesCount: {
    type: Number,
    default : 0
  },
  NFTCount: {
      type: Number,
      default : 0
  },
  VolumeTraded: {
    type: Number,
    default : 0
  },
  PresaleStartTime:{
    type: Date,
  },
  TotalSupply: {
    type: Number,
    default : 0
  },
  nextId: {
    type: Number,
    require: true,
    default: 0,
  },
  Hash: {
    type: String,
    require: true,
    unique:true,
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
collectionSchema.methods.getNextId = function () {
  let nextIddd = this.nextId + 1;
  return nextIddd;
};
module.exports = mongoose.model("Collection", collectionSchema);