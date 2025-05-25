const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const tempUserSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    gender: String,
    phoneNumber: String,
    dateOfBirth: Date,
    otpCode: String,
    otpExpire: Date,
  });
  
  const TempUser = mongoose.model("TempUser", tempUserSchema);
  
  module.exports = TempUser;
  