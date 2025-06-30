// socketServer.js
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";

// Standalone Express instance for socket (NOT your app.js)
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

  socket.on("send-message", (data) => {
    console.log("📩 Message via socket:", data);
    socket.broadcast.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.listen(4001, () => {
  console.log("🎧 Socket.IO server running on http://localhost:4001");
});
