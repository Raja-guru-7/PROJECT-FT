const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  insuranceDeposit: {
    type: Number,
    default: 10
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [77.7172, 11.3410]
    },
    address: {
      type: String,
      default: ''
    }
  }
}, { timestamps: true });

ProductSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Product", ProductSchema);