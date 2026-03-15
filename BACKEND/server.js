const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://project-ft.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/product", require("./routes/product"));
app.use("/api/transaction", require("./routes/transaction"));

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