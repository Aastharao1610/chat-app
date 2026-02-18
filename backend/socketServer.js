import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import prisma from "./src/config/db.js";

const app = express();
const server = http.createServer(app);
const onlineUsers = new Map();
const activeCalls = new Map();

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

  if (userId && userId !== "undefined") {
    onlineUsers.set(userId, socket.id);
    socket.join(`user-${userId}`);

    // Notify everyone of the current online list
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined room: user-${userId}`);
    console.log(`User ${userId}  is online`);
  }

  //  Typing Logic
  socket.on("typing", ({ receiverId }) => {
    io.to(`user-${receiverId}`).emit("typing", { from: userId });
    console.log(`User is typing ...`);
  });
  //mark read
  socket.on("mark-read", async ({ chatId, readerId, senderId }) => {
    try {
      await prisma.message.updateMany({
        where: {
          chatId,
          receiverId: readerId,
          read: false,
        },
        data: { read: true },
      });

      // Notify sender
      io.to(`user-${senderId}`).emit("messages-read", {
        chatId,
        readerId,
      });
    } catch (error) {
      console.error("mark-read error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
      }
      io.emit("get-online-users", Array.from(onlineUsers.keys()));
      console.log(`User ${userId} disconnected`);
    }
  });
  // --- WebRTC Logic (Keep as is, it's correct) ---
  socket.on("call-user", async ({ receiverId, offer, type }) => {
    try {
      const newCall = await prisma.call.create({
        data: {
          callerId: parseInt(userId),
          receiverId: parseInt(receiverId),
          status: "RINGING",
          type: type || "AUDIO",
        },
      });
      activeCalls.set(`${userId}_${receiverId}`, newCall.id);
      io.to(`user-${receiverId}`).emit("incoming-call", {
        callerId: userId,
        offer,
        callId: newCall.id,
        type,
      });
    } catch (Error) {
      console.error("Error creating call in DB : ", Error);
    }
  });
  // 1. listen for the answers and sned it back to the caller
  socket.on("answer-call", async ({ callerId, answer, type }) => {
    try {
      const key = callerId + "_" + userId;
      const callId = activeCalls.get(key);
      if (callId) {
        await prisma.call.update({
          where: { id: callId },
          data: {
            status: "CONNECTED",
            answeredAt: new Date(),
          },
        });
      }
      console.log(`Sending answer from ${userId} to ${callerId}`);
      io.to(`user-${callerId}`).emit("call-answered", { answer, type });
    } catch (error) {
      console.error("Error in sotring detials of answered call");
    }
  });

  // 2. Listen for ICE Candidates and send them to the other user
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(`user-${to}`).emit("ice-candidate", { candidate });
  });

  // 3. Listen for End Call and notify the other user
  socket.on("end-call", async ({ targetId, type }) => {
    try {
      const key = activeCalls.has(`${userId}_${targetId}`)
        ? `${userId}_${targetId}`
        : `${targetId}_${userId}`;
      const callId = activeCalls.get(key);
      if (callId) {
        const call = await prisma.call.findUnique({ where: { id: callId } });
        const endedAt = new Date();

        // If call was never answered, it shouldn't be "COMPLETED"
        let finalStatus = "COMPLETED";
        if (!call.answeredAt) {
          // If the person hanging up is the caller, it's a MISSED call
          // If the receiver hangs up (rejects), it's REJECTED
          finalStatus = userId == call.callerId ? "MISSED" : "REJECTED";
        }

        const duration = call.answeredAt
          ? Math.floor((endedAt - new Date(call.answeredAt)) / 1000)
          : 0;
        await prisma.call.update({
          where: { id: callId },
          data: {
            status: finalStatus,
            endedAt,
            duration,
            endedBy: String(userId),
          },
        });
        activeCalls.delete(key);
      }
      console.log(`Call ended by ${userId} for ${(targetId, type)}`);
      io.to(`user-${targetId}`).emit("call-ended", type);
    } catch (error) {
      console.error("Error in storing aansered call details");
    }
  });
  // missed call (call timeout)
  socket.on("call-timeout", async ({ receiverId, type }) => {
    const key = `${userId}_${receiverId}`;
    const callId = activeCalls.get(key);

    if (callId) {
      await prisma.call.update({
        where: { id: callId },
        data: { status: "MISSED", endedAt: new Date() },
      });
      activeCalls.delete(key);
    }
    io.to(`user-${receiverId}`).emit("call-ended", type);
  });
  // 4. reject
  socket.on("reject-call", async ({ callerId, type }) => {
    const key = callerId + "_" + userId;
    const callId = activeCalls.get(key);

    if (callId) {
      await prisma.call.update({
        where: { id: callId },
        data: {
          status: "REJECTED",
          endedAt: new Date(),
        },
      });

      activeCalls.delete(key);
    }

    io.to(`user-${callerId}`).emit("call-rejected", { type });
    console.log("call rejected by", userId);
  });
});
app.post("/emit-message", (req, res) => {
  const { senderId, receiverId, message } = req.body;

  // CRITICAL: Ensure these room names match the socket.join names exactly
  io.to(`user-${receiverId}`).emit("receive-message", message);
  io.to(`user-${senderId}`).emit("receive-message", message);

  return res.status(200).json({ success: true });
});
app.post("/emit-message", (req, res) => {
  const { senderId, receiverId, message } = req.body;
  // Send to both so both UIs update in real-time
  io.to(`user-${receiverId}`).emit("receive-message", message);
  io.to(`user-${senderId}`).emit("receive-message", message);
  console.log(`message sent to ${receiverId} from ${senderId}`);
  return res.status(200).json({ success: true });
});
app.post("/messages-read", (req, res) => {
  const { chatId, readerId, senderId } = req.body;
  io.to(`user-${senderId}`).emit("messages-read", { chatId, readerId });
  console.log(`message read by ${readerId}`);
  return res.status(200).json({ success: true });
});

server.listen(4001, () => {
  console.log("Server running on port 4001");
});
