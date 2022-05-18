const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  WalletAddress: {
    type: String,
    unique: true,
    require: true,
  },
  UserName: {
    type: String,
    default: "",
  },
  Name: {
    Firstname: String,
    Lastname: String,
  },
  FullName: {
    type: String,
  },
  Email: {
    type: String,
  },
  Password:{
    type: String,
  },
  ProfilePicUrl: String,
  PhoneNo: String,
  Role: {
    type: String,
    enum: ["user","admin","creator", "superadmin"],
    default: "user",
  },
  Status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  Bio: String,
  Website: String,
  user_followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  user_followers_size: { type: Number, default: 0 },
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
module.exports = mongoose.model("User", userSchema);
