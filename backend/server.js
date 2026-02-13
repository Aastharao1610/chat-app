import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ store io on app so middleware can use it
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("send-message", (data) => {
    console.log("Message via socket:", data);
    socket.broadcast.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

// import http from "http";
// import app from "./src/app.js";
// import redisClient from "./src/config/redis.js";
// import "dotenv/config";

// const server = http.createServer(app);

// (async () => {
//   await redisClient.set("test", "hello-redis");
//   const value = await redisClient.get("test");
//   console.log("Redis test Value", value);
// })();

// server.listen(5000, () => {
//   console.log(`🚀 Backend API running on ${process.env.NEXT_PUBLIC_BACKEND}`);
// });
