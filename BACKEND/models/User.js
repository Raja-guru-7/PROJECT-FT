const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  trustScore: { 
    type: Number, 
    default: 30 
  }, // Project AroundU/PeerShare trust system-kaga
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);