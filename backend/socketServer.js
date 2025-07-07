// socketServer.js
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";

// Standalone Express instance (not your main app.js)
const app = express();
const server = http.createServer(app);
const onlineUsers = new Map();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user-${userId}`);
    console.log("✅ User joined room:", `user-${userId}`);
  }
  onlineUsers.set(userId, socket.id);
  console.log("✅ Socket connected:", socket.id);

  socket.broadcast.emit("user-online", userId);

  socket.on("typing", ({ to }) => {
    socket.to(onlineUsers.get(to)).emit("typing", { from: userId });
  });
  socket.on("stop-typing", ({ to }) => {
    socket.to(onlineUsers.get(to)).emit("stop-typing", { from: userId });
  });
  // Handle 1-to-1 or group message broadcast
  socket.on("send-message", (data) => {
    console.log("📩 Message via socket:", data);

    if (data.isGroup) {
      // Emit to group room only
      io.to(`group-${data.chatId}`).emit("receive-message", data);
    } else {
      // Emit to receiver only for personal message
      io.to(`user-${data.receiverId}`).emit("receive-message", data);
    }
  });

  // Join group rooms
  socket.on("join-groups", (groupIds) => {
    groupIds.forEach((id) => {
      socket.join(`group-${id}`);
    });
  });
  socket.on("messages-read", ({ chatId, readerId }) => {
    console.log("📨 Received messages-read:", { chatId, readerId });
    socket.broadcast.emit("messages-read", { chatId, readerId });
    console.log("message read ", chatId, readerId);
  });

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    console.log(
      "🧠 join-user: socket",
      socket.id,
      "joined user room:",
      `user-${userId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected:", socket.id);
  });
});

// Attach io to the express app for backend access (if needed)
app.set("io", io);

server.listen(4001, () => {
  console.log("🎧 Socket.IO server running on http://localhost:4001");
});
