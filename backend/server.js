import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { initializeSocket } from "./socket/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocket(io);

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`API and Socket.io running together on port ${PORT}`),
);
