const mongoose = require("mongoose");

const RegisterOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '5m' } }
});

module.exports = mongoose.model("RegisterOTP", RegisterOTPSchema);
