const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const auth = require("../middleware/auth");
const { uploadVideo } = require("../cloudinary");

// @route POST /api/product/add
router.post("/add", auth, uploadVideo.single("video"), async (req, res) => {
  try {
    const { name, description, category, pricePerDay, depositAmount, insuranceFee, lat, lng, address } = req.body;

    const newProduct = new Product({
      owner: req.user.id,
      name,
      description,
      category,
      pricePerDay: Number(pricePerDay),
      depositAmount: Number(depositAmount) || 0,
      insuranceFee: Number(insuranceFee) || 0,
      videoProofUrl: req.file ? req.file.path : null,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng) || 77.7172, parseFloat(lat) || 11.3410],
        address: address || "Erode, TN"
      }
    });

    const product = await newProduct.save();
    res.json({ msg: "Product listed successfully! 🔥", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/product/nearby
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    const radiusInMeters = parseFloat(radius) * 1000;

    const products = await Product.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      },
      isAvailable: true
    }).populate("owner", "name trustScore avatar");

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/product/all
router.get("/all", async (req, res) => {
  try {
    const { category, query } = req.query;
    let filter = { isAvailable: true };
    if (category) filter.category = category;
    if (query) filter.name = { $regex: query, $options: "i" };

    const products = await Product.find(filter)
      .populate("owner", "name trustScore avatar")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/product/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("owner", "name trustScore avatar");
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;