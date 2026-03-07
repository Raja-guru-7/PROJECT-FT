const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
// Routes
app.use("/api/auth", require("./routes/auth")); // Use lowercase 'routes' to match your folder

app.use("/api/product", require("./routes/product"));
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