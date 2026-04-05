const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const auth = require("../middleware/auth");
const { uploadImage } = require("../cloudinary");

// @route POST /api/product/add
router.post("/add", auth, uploadImage.single("image"), async (req, res) => {
  try {
    const { title, description, category, pricePerDay, insuranceDeposit, locationAddress, lat, lng } = req.body;

    const newProduct = new Product({
      owner: req.user.id,
      title,
      description,
      category,
      pricePerDay: Number(pricePerDay),
      insuranceDeposit: Number(insuranceDeposit) || 10,
      imageUrl: req.file ? req.file.path : '',
      location: {
        type: "Point",
        coordinates: [parseFloat(lng) || 77.7172, parseFloat(lat) || 11.3410],
        address: locationAddress || "Erode, TN"
      }
    });

    const product = await newProduct.save();
    res.json({ msg: "Product listed successfully!", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

// @route GET /api/product/nearby
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 30 } = req.query;
    const radiusInMeters = parseFloat(radius) * 1000;

    const products = await Product.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      },
      $or: [
        { status: 'available' },
        { isAvailable: true }
      ]
    }).populate("owner", "name trustScore avatar");

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

// @route GET /api/product/all
router.get("/all", async (req, res) => {
  try {
    const { category, query, status } = req.query;
    let filter = {};

    if (status === 'available') {
      filter.$or = [{ status: 'available' }, { isAvailable: true }];
    } else {
      filter.isAvailable = true;
    }

    if (category) filter.category = category;
    if (query) filter.title = { $regex: query, $options: "i" };

    const products = await Product.find(filter)
      .populate("owner", "name trustScore avatar")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message }); // ✅ Fixed
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
    res.status(500).json({ msg: err.message }); // ✅ Fixed
  }
});

module.exports = router;