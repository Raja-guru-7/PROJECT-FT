const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  googleId: { type: String },
  aadharNumber: { type: String, default: '' },
  trustScore: { type: Number, default: 30 },
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ["none", "pending", "verified"], default: "none" },
  kycOtp: { type: String },
  kycOtpVerified: { type: Boolean, default: false },
  loginOtp: { type: String },
  livenessStatus: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  // 🔥 TRUST ALGORITHM METRICS
  successfulTransactions: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  penaltyCount: { type: Number, default: 0 },

  settings: {
    biometricLogin: { type: Boolean, default: true },
    stealthMode: { type: Boolean, default: false },
    metadataEncryption: { type: Boolean, default: true },
    handoverAlerts: { type: Boolean, default: true },
    escrowSummaries: { type: Boolean, default: false }
  },
  paymentMethod: {
    cardType: { type: String, default: '' },
    last4: { type: String, default: '' },
    expiry: { type: String, default: '' }
  },
  savedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// 🔥 DYNAMIC SOCIAL TRUST ALGORITHM METHOD
UserSchema.methods.calculateTrustScore = function () {
  // K = 30 if KYC Verified
  const K = this.kycStatus === "verified" ? 30 : 0;

  // H = 5 points per successful return
  const H = this.successfulTransactions * 5;

  // R = 10 points * average rating (Max 50 points if rating is 5.0)
  // Default to giving them a starting base of 3 if they have no ratings yet, 
  // or you can leave it strictly as formula dictates.
  const ratingToUse = this.averageRating > 0 ? this.averageRating : 0;
  const R = ratingToUse * 10;

  // P = 50 points per penalty (violations/disputes)
  const P = this.penaltyCount * 50;

  // T = K + H + R - P (Starting base of 30 if entirely new user without KYC is up to you, 
  // but as per your formula, we just use the raw variables + base 30 initial limit)
  let rawScore = 30 + K + H + R - P;

  // 🔥 Strict Limits: Min 0, Max 100
  this.trustScore = Math.max(0, Math.min(100, rawScore));

  return this.trustScore;
};

module.exports = mongoose.model("User", UserSchema);