const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// 1. REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists!" });

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, "aroundu_secret", { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token, msg: "User Registered Securely!" });
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 2. LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, "aroundu_secret", { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, msg: "Login Success!" });
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 3. GET USER DETAILS
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
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
    res.status(500).send("Server Error");
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
    res.status(500).send("Server Error");
  }
});


router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name trustScore kycStatus isVerified");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;