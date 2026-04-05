const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const { uploadVideo } = require("../cloudinary");

router.post("/create", auth, async (req, res) => {
  try {
    const { productId, renterId, lenderId, totalPrice, startDate, endDate } = req.body;

    if (!productId || !lenderId || !renterId || totalPrice === undefined) {
      return res.status(400).json({ msg: "Missing required fields: productId, lenderId, renterId, or totalPrice" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(lenderId)) {
      return res.status(400).json({ msg: "Invalid or outdated ID references detected. Please refresh the page." });
    }

    const Product = require('../models/product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found in database (may have been cleared)" });
    }

    if (product.owner.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot rent your own item" });
    }

    let myPendingTx = await Transaction.findOne({
      itemId: productId,
      renterId: req.user.id,
      status: "PENDING_HANDOVER"
    });

    if (myPendingTx) {
      return res.status(200).json({ transaction: myPendingTx });
    }

    const activeTransaction = await Transaction.findOne({
      itemId: productId,
      status: { $in: ["HANDOVER_IN_PROGRESS", "ACTIVE", "RETURN_IN_PROGRESS"] }
    });

    if (activeTransaction) {
      return res.status(400).json({ msg: "Item is currently locked in an active transaction" });
    }

    const handoverOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const transaction = new Transaction({
      itemId: productId,
      itemTitle: product.title,
      renterId: req.user.id,
      ownerId: lenderId,
      startDate,
      endDate,
      totalAmount: totalPrice,
      handoverOTP,
      otpCode: handoverOTP,
      status: "PENDING_OTP"
    });

    await transaction.save();

    try {
      const User = require('../models/User');
      const { sendOtpEmail } = require('../utils/mailer');
      const owner = await User.findById(lenderId);
      if (owner && owner.email) {
        await sendOtpEmail(owner.email, owner.name, handoverOTP, product.title);
      }
    } catch (emailErr) {
      console.warn("Email dispatch failed (non-fatal):", emailErr.message);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.log("Transaction Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ renterId: req.user.id }, { ownerId: req.user.id }]
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/verify-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    console.log("===== HANDOVER OTP VERIFICATION =====");
    console.log("Transaction Renter ID:", transaction.renterId.toString());
    console.log("Logged-in User ID:   ", req.user.id);
    console.log("=====================================");

    if (transaction.renterId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only the renter can verify handover OTP" });
    }

    if (transaction.otpCode === otp) {
      // ✅ FIX: Directly set HANDOVER_IN_PROGRESS (skip OTP_VERIFIED intermediate)
      transaction.status = "HANDOVER_IN_PROGRESS";
      await transaction.save();

      const Product = require('../models/product');
      await Product.findByIdAndUpdate(transaction.itemId, {
        isAvailable: false,
        status: 'rented',
        currentTransaction: transaction._id
      });

      // ✅ Socket event to owner
      const io = req.app.get('io');
      if (io) {
        io.to(transaction.ownerId.toString()).emit('handover-ready', {
          transactionId: transaction._id,
          status: 'HANDOVER_IN_PROGRESS',
          message: 'ACTION REQUIRED: RECORD SCAN'
        });
        console.log(`🔔 Socket event sent to Owner ${transaction.ownerId.toString()}: handover-ready`);
      }

      res.json({ success: true, msg: "OTP Verified! Handover protocol initiated." });
    } else {
      res.status(400).json({ success: false, msg: "Invalid Security Cipher" });
    }
  } catch (err) {
    console.error("OTP Verification Error:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/upload-proof", auth, uploadVideo.single("video"), async (req, res) => {
  try {
    const { type } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    const videoUrl = req.file ? req.file.path : req.body.videoUrl;
    if (type === "OWNER") transaction.ownerVideoUrl = videoUrl;
    if (type === "RENTER") transaction.renterVideoUrl = videoUrl;

    if (transaction.ownerVideoUrl && transaction.renterVideoUrl) {
      transaction.status = "ACTIVE";
    }

    await transaction.save();
    res.json({ msg: "Telemetry proof uploaded successfully", transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/upload-proof-file", auth, uploadVideo.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file detected" });
    res.json({ url: req.file.path, msg: "Video synchronized with Cloudinary" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/complete", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    transaction.status = "ACTIVE";
    await transaction.save();
    res.json({ msg: "Handover protocol completed", transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/request-return", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    if (transaction.renterId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only renter can initiate return protocol" });
    }

    const returnOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
    transaction.returnOtpCode = returnOtpCode;
    transaction.status = "RETURN_IN_PROGRESS";
    await transaction.save();

    try {
      const User = require('../models/User');
      const { sendOtpEmail } = require('../utils/mailer');
      const owner = await User.findById(transaction.ownerId);
      if (owner && owner.email) {
        await sendOtpEmail(owner.email, owner.name, returnOtpCode, `${transaction.itemTitle} (RETURN)`);
      }
    } catch (emailErr) {
      console.warn("Return Email failed:", emailErr.message);
    }

    res.json({ success: true, msg: "Return OTP generated and sent", returnOtpCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});

router.patch("/:id/initiate-return", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    if (transaction.renterId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only renter can initiate return protocol" });
    }

    const returnOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
    transaction.returnOtpCode = returnOtpCode;
    transaction.status = "RETURN_INITIATED";
    await transaction.save();

    try {
      const User = require('../models/User');
      const { sendOtpEmail } = require('../utils/mailer');
      const owner = await User.findById(transaction.ownerId);
      if (owner && owner.email) {
        await sendOtpEmail(owner.email, owner.name, returnOtpCode, `${transaction.itemTitle} (RETURN)`);
      }
    } catch (emailErr) {
      console.warn("Return Email failed:", emailErr.message);
    }

    res.json({ success: true, msg: "Return OTP generated and sent", returnOtpCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});

router.post("/:id/complete-return", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    if (transaction.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only owner can confirm return" });
    }

    if (transaction.returnOtpCode === otp) {
      transaction.status = "COMPLETED";
      await transaction.save();

      const Product = require('../models/product');
      await Product.findByIdAndUpdate(transaction.itemId, {
        isAvailable: true,
        status: 'available',
        currentTransaction: null
      });

      const User = require('../models/User');
      await User.findByIdAndUpdate(transaction.renterId, { $inc: { trustScore: 5 } });
      await User.findByIdAndUpdate(transaction.ownerId, { $inc: { trustScore: 5 } });

      res.json({ success: true, msg: "Return finalized and trust scores updated" });
    } else {
      res.status(400).json({ success: false, msg: "Invalid return OTP" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    const Product = require('../models/product');
    await Product.findByIdAndUpdate(transaction.itemId, {
      status: 'available',
      isAvailable: true,
      currentTransaction: null
    });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: "Transaction deleted and product status reset" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;