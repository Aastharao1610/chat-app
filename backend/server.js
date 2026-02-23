import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import prisma from "./src/config/db.js";
import app from "./src/app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const onlineUsers = new Map();
const activeCalls = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    onlineUsers.set(userId, socket.id);
    socket.join(`user-${userId}`);
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online`);
  }

  // Typing
  socket.on("typing", ({ receiverId }) => {
    io.to(`user-${receiverId}`).emit("typing", { from: userId });
  });

  // Mark read
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

      io.to(`user-${senderId}`).emit("messages-read", {
        chatId,
        readerId,
      });
    } catch (err) {
      console.error("mark-read error:", err);
    }
  });

  // Call user
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
    } catch (err) {
      console.error("call-user error:", err);
    }
  });

  // Answer call
  socket.on("answer-call", async ({ callerId, answer, type }) => {
    try {
      const key = `${callerId}_${userId}`;
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

      io.to(`user-${callerId}`).emit("call-answered", { answer, type });
    } catch (err) {
      console.error("answer-call error:", err);
    }
  });

  // ICE
  socket.on("ice-candidate", ({ to, candidate }) => {
    console.log(`📡 Routing ICE: ${userId} -> user-${to}`);
    io.to(`user-${to}`).emit("ice-candidate", { candidate });
  });
  //
  socket.on("toggle-video", ({ to, isVideoOff }) => {
    io.to(`user-${to}`).emit("toggle-video", { isVideoOff });
  });
  // End call
  socket.on("end-call", async ({ targetId, type }) => {
    try {
      const key = activeCalls.has(`${userId}_${targetId}`)
        ? `${userId}_${targetId}`
        : `${targetId}_${userId}`;

      const callId = activeCalls.get(key);

      if (callId) {
        await prisma.call.update({
          where: { id: callId },
          data: {
            status: "COMPLETED",
            endedAt: new Date(),
            endedBy: String(userId),
          },
        });

        activeCalls.delete(key);
      }

      io.to(`user-${targetId}`).emit("call-ended", {
        type,
        reason: "ended",
      });
    } catch (err) {
      console.error("end-call error:", err);
    }
  });
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
    console.log(`${type} Call ended due to timeout`);
    io.to(`user-${receiverId}`).emit("call-ended", { type });
  });
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
  // Disconnect
  socket.on("disconnect", () => {
    if (userId && onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
      io.emit("get-online-users", Array.from(onlineUsers.keys()));

      activeCalls.forEach((callId, key) => {
        if (key.includes(String(userId))) {
          const [callerId, receiverId] = key.split("_");
          const targetId = callerId === String(userId) ? receiverId : callerId;

          io.to(`user-${targetId}`).emit("call-ended", {
            reason: "disconnected",
          });
          activeCalls.delete(key);
          console.log(
            `Call ${callId} ended due to user ${userId} disconnecting`,
          );
        }
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
