const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const RegisterOTP = require("../models/RegisterOTP");
const { sendOtpEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "aroundu_secret"; // ✅ One place define pannrom

console.log("Route Registered: /send-otp");

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const record = await RegisterOTP.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ msg: "Invalid or expired Verification Code" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists!" });

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    await RegisterOTP.deleteOne({ email });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => { // ✅
      if (err) throw err;
      res.status(201).json({ token, msg: "User Registered Securely!" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 1.1. SEND REGISTRATION OTP
router.post('/send-otp', async (req, res) => {
  const { email, name } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  console.log("-------------------------------");
  console.log("VERIFICATION CODE FOR", email, "IS:", otp);
  console.log("-------------------------------");

  try {
    await RegisterOTP.findOneAndUpdate(
      { email },
      { email, otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    try {
      await sendOtpEmail(email, name || "User", otp, "Registration Verification");
    } catch (mailError) {
      console.error("Mailer Error:", mailError);
      return res.status(200).json({ msg: "OTP generated but email failed. Check terminal log.", mailError: true });
    }

    return res.status(200).json({ msg: "OTP sent successfully (Check Terminal/Email)" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = loginOtp;
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, loginOtp, "Login Verification");
    } catch (e) {
      console.error("Email failed:", e);
    }

    res.json({ msg: "OTP sent to email!", otp: loginOtp, userId: user._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 2.1 VERIFY LOGIN OTP
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.loginOtp = undefined;
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user._id, user, msg: "Login Success!" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});


// 2.2 SEND LOGIN OTP (verify password first)
router.post("/send-login-otp", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const loginOtp = Math.floor(1000 + Math.random() * 9000).toString();
    user.loginOtp = loginOtp;
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, loginOtp, "Login Verification");
    } catch (e) {
      console.error("Email failed:", e);
    }

    res.json({ msg: "OTP sent to email!" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// 3. GET USER
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 4. UPDATE SETTINGS
router.put("/settings", auth, async (req, res) => {
  try {
    const { biometricLogin, stealthMode, metadataEncryption, handoverAlerts, escrowSummaries } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.settings) user.settings = {};
    if (biometricLogin !== undefined) user.settings.biometricLogin = biometricLogin;
    if (stealthMode !== undefined) user.settings.stealthMode = stealthMode;
    if (metadataEncryption !== undefined) user.settings.metadataEncryption = metadataEncryption;
    if (handoverAlerts !== undefined) user.settings.handoverAlerts = handoverAlerts;
    if (escrowSummaries !== undefined) user.settings.escrowSummaries = escrowSummaries;

    user.markModified('settings');
    await user.save();
    res.json({ msg: "Settings saved!", settings: user.settings });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 4.1. UPDATE PROFILE
router.patch("/update-profile", auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updateData = {};
    if (name && String(name).trim()) updateData.name = String(name).trim();
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "No update data provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: err.message });
  }
});

// 5. CHANGE PASSWORD
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect!" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password changed successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 6. GOOGLE AUTH
router.post("/google", async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name, email, googleId, avatar,
        password: googleId + "aroundu_secret",
        trustScore: 0,
        isVerified: false,
        kycStatus: 'none'
      });
      await user.save();
      return res.json({
        token: null,
        userId: user._id,
        needsKYC: true,
        redirectTo: '/kyc-verification'
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      if (user.kycStatus !== 'verified') {
        return res.json({
          token: null,
          userId: user._id,
          needsKYC: true,
          redirectTo: '/kyc-verification'
        });
      }
      const payload = { user: { id: user._id } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // ✅
      return res.json({
        token,
        userId: user._id,
        needsKYC: false,
        redirectTo: '/explore'
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 7. KYC STEP 1
router.post("/kyc/send-otp", async (req, res) => {
  try {
    const { aadharNumber, userId } = req.body;
    const clean = aadharNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(clean)) {
      return res.status(400).json({ msg: 'Invalid Aadhar number' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    user.aadharNumber = clean;
    user.kycOtp = generatedOtp;
    user.kycOtpVerified = false;
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, generatedOtp, "KYC Verification");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ msg: 'Failed to send OTP email. Try again.' });
    }

    res.json({ msg: 'Real OTP sent to your mobile successfully!', otp: generatedOtp });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 8. KYC STEP 2
router.post("/kyc/verify-otp", async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!user.kycOtp || user.kycOtp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP. Please check your email and try again.' });
    }

    user.kycOtpVerified = true;
    user.kycOtp = undefined;
    await user.save();

    res.json({ msg: 'OTP verified successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 8.1. RESEND KYC OTP
router.post("/kyc/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.kycOtpVerified) {
      return res.status(400).json({ msg: 'OTP already verified.' });
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    user.kycOtp = newOtp;
    user.kycOtpVerified = false;
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, newOtp, "KYC Verification");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ msg: 'Failed to send OTP mobile. Try again.' });
    }

    res.json({ msg: 'New OTP sent to your mobile successfully!', otp: newOtp });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 9. KYC STEP 3
router.post("/kyc/set-password", async (req, res) => {
  try {
    const { password, userId } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!user.kycOtpVerified) {
      return res.status(400).json({ msg: 'OTP not verified. Please verify OTP first.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.kycStatus = 'verified';
    user.isVerified = true;
    user.trustScore = 30;
    user.kycOtpVerified = false;
    await user.save();

    res.json({ msg: 'Password created! KYC complete. Please login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 10. GET USER BY ID
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name avatar trustScore kycStatus isVerified livenessStatus phoneVerified successfulTransactions"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 11. LIVENESS VERIFICATION
router.post("/verify-liveness", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.livenessStatus = true;
    if (user.kycStatus === 'verified' && user.phoneVerified) {
      user.isVerified = true;
    }
    await user.save();
    res.json({ msg: "Liveness check passed!", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 12. PHONE VERIFICATION
router.post("/verify-phone", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.phoneVerified = true;
    if (user.kycStatus === 'verified' && user.livenessStatus) {
      user.isVerified = true;
    }
    await user.save();
    res.json({ msg: "Phone verified successfully!", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 13. KYC VERIFICATION
router.post("/verify-kyc", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.kycStatus = 'verified';
    if (user.livenessStatus && user.phoneVerified) {
      user.isVerified = true;
    }
    await user.save();
    res.json({ msg: "KYC Verified!", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;