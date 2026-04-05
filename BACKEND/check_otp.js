const mongoose = require("mongoose");
require("dotenv").config();
const RegisterOTP = require("./models/RegisterOTP");

async function getOtp() {
  await mongoose.connect(process.env.MONGO_URI);
  const otp = await RegisterOTP.findOne({ email: "test_otp@example.com" });
  console.log("OTP_FOUND:", otp ? otp.otp : "NOT_FOUND");
  await mongoose.disconnect();
}

getOtp();
