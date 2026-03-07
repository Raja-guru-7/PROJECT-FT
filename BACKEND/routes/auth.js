const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); // Move this to the TOP!

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
    jwt.sign(payload, "aroundu_secret", { expiresIn: "1h" }, (err, token) => {
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
    jwt.sign(payload, "aroundu_secret", { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, msg: "Login Success!" });
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 3. GET USER DETAILS (Protected Route)
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;