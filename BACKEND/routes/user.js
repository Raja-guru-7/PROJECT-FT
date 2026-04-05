const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   POST /api/user/toggle-save/:productId
router.post('/toggle-save/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!user.savedAssets) user.savedAssets = [];

    const prodObjectId = new mongoose.Types.ObjectId(productId);
    const isSaved = user.savedAssets.some(id => id.toString() === productId);

    if (isSaved) {
      user.savedAssets = user.savedAssets.filter(id => id.toString() !== productId);
    } else {
      user.savedAssets.push(prodObjectId);
    }

    await user.save();
    res.json({ msg: !isSaved ? 'Item saved!' : 'Item removed!', savedAssets: user.savedAssets });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

// @route   GET /api/user/saved-assets
router.get('/saved-assets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedAssets',  // ✅ savedAssets
      populate: { path: 'owner', select: 'name trustScore avatar' }
    });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.savedAssets || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

// @route   PATCH /api/user/settings
router.patch("/settings", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.settings) user.settings = {};

    Object.keys(req.body).forEach(key => {
      user.settings[key] = req.body[key];
    });

    user.markModified('settings');
    await user.save();
    res.json({ msg: "Settings updated!", settings: user.settings });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

// @route   PUT /api/user/settings
router.put("/settings", auth, async (req, res) => {
  try {
    const { biometricLogin, stealthMode, metadataEncryption, handoverAlerts, escrowSummaries } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.settings) user.settings = {};
    if (biometricLogin !== undefined) user.settings.biometricLogin = biometricLogin;
    if (stealthMode !== undefined) user.settings.stealthMode = stealthMode;
    if (metadataEncryption !== undefined) user.settings.metadataEncryption = metadataEncryption;
    if (handoverAlerts !== undefined) user.settings.handoverAlerts = handoverAlerts;
    if (escrowSummaries !== undefined) user.settings.escrowSummaries = escrowSummaries;

    user.markModified('settings');
    await user.save();
    res.json({ msg: "Settings saved!", settings: user.settings });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

module.exports = router;