const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  trustScore: { type: Number, default: 30 },
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ["none", "pending", "verified"], default: "none" },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  successfulTransactions: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  penaltyCount: { type: Number, default: 0 },
  settings: {
    biometricLogin: { type: Boolean, default: true },
    stealthMode: { type: Boolean, default: false },
    metadataEncryption: { type: Boolean, default: true },
    handoverAlerts: { type: Boolean, default: true },
    escrowSummaries: { type: Boolean, default: false }
  }
}, { timestamps: true });

UserSchema.methods.calculateTrustScore = function () {
  const K = this.kycStatus === "verified" ? 30 : 0;
  const H = this.successfulTransactions * 5;
  const R = this.averageRating * 10;
  const P = this.penaltyCount * 50;
  this.trustScore = Math.max(0, Math.min(100, K + H + R - P + 30));
  return this.trustScore;
};

module.exports = mongoose.model("User", UserSchema);