// socketServer.js
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";

// Standalone Express instance (not your main app.js)
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

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

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
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
