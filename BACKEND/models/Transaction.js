const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  itemTitle: { type: String, required: true },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: String },
  endDate: { type: String },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["REQUESTED", "PENDING_OTP", "OTP_VERIFIED", "PENDING_HANDOVER", "HANDOVER_IN_PROGRESS", "HANDOVER_COMPLETE", "ACTIVE", "RETURN_INITIATED", "RETURN_IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "REQUESTED"
  },
  handoverOTP: { type: String },
  otpCode: { type: String },
  returnOtpCode: { type: String },
  ownerVideoUrl: { type: String },
  renterVideoUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);