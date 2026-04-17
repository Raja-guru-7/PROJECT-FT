const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const { uploadVideo } = require("../cloudinary");

router.post("/create", auth, async (req, res) => {
  try {
    const { productId, renterId, lenderId, totalPrice, startDate, endDate } = req.body;
    if (!productId || !lenderId || !renterId || totalPrice === undefined) return res.status(400).json({ msg: "Missing fields" });

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(lenderId)) return res.status(400).json({ msg: "Invalid ID" });

    const Product = require('../models/product');
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.owner.toString() === req.user.id) return res.status(400).json({ msg: "You cannot rent your own item" });

    const activeTransaction = await Transaction.findOne({ itemId: productId, status: { $in: ["HANDOVER_IN_PROGRESS", "ACTIVE", "RETURN_IN_PROGRESS"] } });
    if (activeTransaction) return res.status(400).json({ msg: "Item is currently locked" });

    const handoverOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const transaction = new Transaction({
      itemId: productId, itemTitle: product.title, renterId: req.user.id, ownerId: lenderId,
      startDate, endDate, totalAmount: totalPrice, handoverOTP, otpCode: handoverOTP, status: "PENDING_OTP"
    });
    await transaction.save();

    try {
      const User = require('../models/User');
      const { sendOtpEmail } = require('../utils/mailer');
      const owner = await User.findById(lenderId);
      if (owner && owner.email) await sendOtpEmail(owner.email, owner.name, handoverOTP, product.title);
    } catch (err) { }
    res.status(201).json(transaction);
  } catch (error) { res.status(500).json({ msg: "Server Error", error: error.message }); }
});

router.get("/my", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ $or: [{ renterId: req.user.id }, { ownerId: req.user.id }] }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) { res.status(500).send("Server Error"); }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Not found" });
    res.json(transaction);
  } catch (err) { res.status(500).send("Server Error"); }
});

router.post("/:id/verify-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (transaction.renterId.toString() !== req.user.id) return res.status(403).json({ msg: "Only renter can verify" });

    if (transaction.otpCode === otp) {
      transaction.status = "HANDOVER_IN_PROGRESS";
      await transaction.save();

      const Product = require('../models/product');
      await Product.findByIdAndUpdate(transaction.itemId, { isAvailable: false, status: 'rented', currentTransaction: transaction._id });
      res.json({ success: true, msg: "OTP Verified!" });
    } else {
      res.status(400).json({ success: false, msg: "Invalid Code" });
    }
  } catch (err) { res.status(500).send("Server Error"); }
});

router.post("/:id/upload-proof", auth, uploadVideo.single("video"), async (req, res) => {
  try {
    const { type } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    const videoUrl = req.file ? req.file.path : req.body.videoUrl;

    if (type === "OWNER") transaction.ownerVideoUrl = videoUrl;
    if (type === "RENTER") transaction.renterVideoUrl = videoUrl;
    await transaction.save();

    res.json({ msg: "Uploaded", transaction });
  } catch (err) { res.status(500).send("Server Error"); }
});

router.post("/:id/complete", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    transaction.status = "ACTIVE";
    await transaction.save();
    res.json({ msg: "Completed", transaction });
  } catch (err) { res.status(500).send("Server Error"); }
});

router.post("/:id/verify-return-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (transaction.ownerId.toString() !== req.user.id) return res.status(403).json({ msg: "Only owner can verify" });

    if (transaction.returnOtpCode === otp) {
      transaction.status = "RETURN_IN_PROGRESS";
      await transaction.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, msg: "Invalid OTP" });
    }
  } catch (err) { res.status(500).send("Server Error"); }
});

// 🚀 BULLETPROOF RETURN INITIATE ROUTE (FIXED)
router.patch("/:id/initiate-return", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    // Type-safe check to ensure ONLY the RENTER can initiate the return
    if (transaction.renterId.toString() !== req.user.id.toString()) {
      console.log("❌ Blocked: User is not the true renter!");
      return res.status(403).json({ msg: "Only renter can initiate return" });
    }

    const returnOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
    transaction.returnOtpCode = returnOtpCode;
    transaction.status = "RETURN_INITIATED";
    await transaction.save();

    try {
      const User = require('../models/User');
      const { sendOtpEmail } = require('../utils/mailer');
      const renter = await User.findById(transaction.renterId);

      if (renter && renter.email) {
        await sendOtpEmail(renter.email, renter.name, returnOtpCode, transaction.itemTitle);
        console.log(`✅ Return OTP Mail Sent Successfully to Renter: ${renter.email}`);
      } else {
        console.log("⚠️ Renter email not found in DB!");
      }
    } catch (mailErr) {
      console.error("❌ Failed to send Return OTP mail:", mailErr);
    }

    res.json({ success: true, returnOtpCode });
  } catch (err) {
    console.error("🔥 Server Error in initiate-return:", err);
    res.status(500).json({ success: false });
  }
});

router.post("/:id/complete-return", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction.ownerId.toString() !== req.user.id) return res.status(403).json({ msg: "Only owner" });

    transaction.status = "COMPLETED";
    await transaction.save();

    const Product = require('../models/product');
    await Product.findByIdAndUpdate(transaction.itemId, { isAvailable: true, status: 'available', currentTransaction: null });

    const User = require('../models/User');
    await User.findByIdAndUpdate(transaction.renterId, { $inc: { trustScore: 5 } });
    await User.findByIdAndUpdate(transaction.ownerId, { $inc: { trustScore: 5 } });

    res.json({ success: true, msg: "Return finalized" });
  } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;