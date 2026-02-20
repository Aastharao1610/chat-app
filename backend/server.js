import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
  console.log("http://192.168.1.88:5000/");
});
