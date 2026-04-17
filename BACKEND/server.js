const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// 👇 FIX: Model collision error thadukka intha validation
const MessageSchema = new mongoose.Schema({
  transactionId: String,
  sender: String,
  senderId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'https://project-ft.vercel.app', 'https://aroundu.online', 'https://www.aroundu.online', /\.vercel\.app$/];

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

const onlineUsers = new Map();

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use("/api/user", require("./routes/user"));
app.use("/api/product", require("./routes/product"));
app.use("/api/transaction", require("./routes/transaction"));
// 👇 PUDHUSA ADD PANNA AI ROUTE ITHUTHAN 👇
app.use("/api/ai", require("./routes/ai"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit('user_status_change', Array.from(onlineUsers.keys()));
  });

  socket.on('get_online_users', () => {
    socket.emit('user_status_change', Array.from(onlineUsers.keys()));
  });

  socket.on('join_chat', async (transactionId) => {
    socket.join(transactionId);
    console.log(`💬 Joined Room: ${transactionId}`);
    try {
      const history = await Message.find({ transactionId }).sort({ timestamp: 1 });
      socket.emit('chat_history', history);
    } catch (err) { console.log(err); }
  });

  socket.on('send_message', async (data) => {
    // 🚀 FIX 1: DB-la save aagurathuku munnadiye OPPOSTE aaluku INSTANT ah send pannu
    socket.to(data.transactionId).emit('receive_message', data);

    // 🚀 FIX 2: Background-la DB-la save pannu (Mitham irukka process)
    try {
      const newMessage = new Message({
        transactionId: data.transactionId,
        sender: data.sender,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp || new Date()
      });
      await newMessage.save();
    } catch (err) {
      console.log("Chat DB Save Error:", err);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_status_change', Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

app.set('io', io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });