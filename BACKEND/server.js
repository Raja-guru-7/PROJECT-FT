const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS - Allow frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/product", require("./routes/product"));
app.use("/api/transaction", require("./routes/transaction"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("🔥 MongoDB Connected Successfully!");
})
.catch((err) => {
  console.log("❌ DB Connection Error:", err);
});

app.get("/", (req, res) => {
  res.send("AroundU Backend is Running! 🚀");
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});