import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.88:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ Connected:", userId, socket.id);
  socket.join(`user-${userId}`);

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", userId, socket.id);
  });
});

// Custom HTTP endpoint to trigger socket emits
app.post("/emit-message", (req, res) => {
  const { senderId, receiverId, message } = req.body;
  io.to(`user-${receiverId}`).emit("receive-message", message);
  io.to(`user-${senderId}`).emit("receive-message", message);
  return res.status(200).json({ success: true });
});

app.post("/messages-read", (req, res) => {
  const { chatId, readerId, senderId } = req.body;
  io.to(`user-${senderId}`).emit("messages-read", { chatId, readerId });
  return res.status(200).json({ success: true });
});
// socket.on("typing", ({ receiverId }) => {
//   io.to(`user-${receiverId}`).emit("user-typing", { senderId: userId });
// });

server.listen(4001, () => {
  console.log("📡 Socket server running on http://localhost:4001");
});
