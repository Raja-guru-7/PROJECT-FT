const express = require("express");
const router = express.Router();
const Product = require("../models/product"); // Your existing model
const auth = require("../middleware/auth"); // Using the middleware we just fixed!

// @route    POST api/product/add
// @desc     Add a new rental item
router.post("/add", auth, async (req, res) => {
  try {
    const { name, description, category, pricePerDay } = req.body;

    const newProduct = new Product({
      owner: req.user.id, // Comes from our JWT token!
      name,
      description,
      category,
      pricePerDay
    });

    const product = await newProduct.save();
    res.json({ msg: "Product listed successfully! 🔥", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;