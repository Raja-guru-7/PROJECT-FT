const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://project-ft.vercel.app',
  'https://aroundu.online',
  'https://www.aroundu.online',
  /\.vercel\.app$/
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use("/api/user", require("./routes/user"));
app.use("/api/product", require("./routes/product"));
app.use("/api/transaction", require("./routes/transaction"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("AroundU Backend is Running! 🚀");
});

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});