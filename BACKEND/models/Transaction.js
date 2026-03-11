const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemTitle: { type: String, required: true },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: String },
  endDate: { type: String },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["REQUESTED","ESCROW_HELD","HANDOVER_IN_PROGRESS","ACTIVE","RETURN_IN_PROGRESS","COMPLETED","DISPUTED"],
    default: "REQUESTED"
  },
  otpCode: { type: String },
  ownerVideoUrl: { type: String },
  renterVideoUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);