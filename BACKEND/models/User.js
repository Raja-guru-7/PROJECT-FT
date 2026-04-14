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

UserSchema.methods.calculateTrustScore = function () {
  const K = this.kycStatus === "verified" ? 30 : 0;
  const H = this.successfulTransactions * 5;
  const R = this.averageRating * 10;
  const P = this.penaltyCount * 50;
  this.trustScore = Math.max(0, Math.min(100, K + H + R - P + 30));
  return this.trustScore;
};

module.exports = mongoose.model("User", UserSchema);