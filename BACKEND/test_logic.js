const mongoose = require("mongoose");
require("dotenv").config();
const RegisterOTP = require("./models/RegisterOTP");
const User = require("./models/User");

async function testLogic() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = "test_unit@example.com";
  const name = "Test Unit";
  const otp = "123456";

  console.log("Checking user...");
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("User already exists");
  } else {
    console.log("Creating OTP...");
    await RegisterOTP.findOneAndUpdate(
      { email },
      { otp, email },
      { upsert: true, new: true }
    );
    const found = await RegisterOTP.findOne({ email });
    console.log("OTP_CREATED_IN_DB:", found ? found.otp : "FAILED");
  }
  await mongoose.disconnect();
}

testLogic().catch(console.error);
