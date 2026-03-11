const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

// @route POST /api/transaction/create
router.post("/create", auth, async (req, res) => {
  try {
    const { itemId, itemTitle, ownerId, startDate, endDate, totalAmount } = req.body;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const transaction = new Transaction({
      itemId,
      itemTitle,
      renterId: req.user.id,
      ownerId,
      startDate,
      endDate,
      totalAmount,
      otpCode,
      status: "REQUESTED"
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/transaction/my
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

// @route GET /api/transaction/:id
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

// @route POST /api/transaction/:id/verify-otp
router.post("/:id/verify-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    if (transaction.otpCode === otp) {
      transaction.status = "HANDOVER_IN_PROGRESS";
      await transaction.save();
      res.json({ success: true, msg: "OTP Verified!" });
    } else {
      res.status(400).json({ success: false, msg: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/transaction/:id/upload-proof
router.post("/:id/upload-proof", auth, async (req, res) => {
  try {
    const { type, videoUrl } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    if (type === "OWNER") transaction.ownerVideoUrl = videoUrl;
    if (type === "RENTER") transaction.renterVideoUrl = videoUrl;

    await transaction.save();
    res.json({ msg: "Proof uploaded!", transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/transaction/:id/complete
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    transaction.status = "ACTIVE";
    await transaction.save();
    res.json({ msg: "Transaction completed!", transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
