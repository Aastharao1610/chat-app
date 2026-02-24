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
      console.log(`${receiverId} receiving ${type} call from ${userId}`);
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
        const call = await prisma.call.findUnique({ where: { id: callId } });
        const endedAt = new Date();

        // If call was never answered, it shouldn't be "COMPLETED"
        let finalStatus = "COMPLETED";
        if (!call.answeredAt) {
          // If the person hanging up is the caller, it's a MISSED call
          // If the receiver hangs up (rejects), it's REJECTED
          finalStatus = userId == call.callerId ? "MISSED" : "REJECTED";
        }
        const startCall = new Date(call.answeredAt).getTime();
        const endCall = endedAt.getTime();
        const duration = call.answeredAt
          ? Math.floor((endCall - startCall) / 1000)
          : 0;
        console.log(duration, "duration logging in backend ");
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

      io.to(`user-${targetId}`).emit("call-ended", {
        type,
        reason: "ended",
      });
      console.log(`Call ended by ${userId} for user-${targetId} (${type})`);
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
  // socket.on("disconnect", () => {
  //   if (userId && onlineUsers.get(userId) === socket.id) {
  //     onlineUsers.delete(userId);
  //     io.emit("get-online-users", Array.from(onlineUsers.keys()));

  //     activeCalls.forEach((callId, key) => {
  //       if (key.includes(String(userId))) {
  //         const [callerId, receiverId] = key.split("_");
  //         const targetId = callerId === String(userId) ? receiverId : callerId;

  //         io.to(`user-${targetId}`).emit("call-ended", {
  //           reason: "disconnected",
  //         });
  //         activeCalls.delete(key);
  //         console.log(
  //           `Call ${callId} ended due to user ${userId} disconnecting`,
  //         );
  //       }
  //     });
  //   }
  // });
  socket.on("disconnect", async () => {
    if (userId && onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
      io.emit("get-online-users", Array.from(onlineUsers.keys()));

      // Process any active calls the disconnected user was part of
      for (const [key, callId] of activeCalls.entries()) {
        if (key.includes(String(userId))) {
          const [callerId, receiverId] = key.split("_");
          const targetId = callerId === String(userId) ? receiverId : callerId;

          try {
            const call = await prisma.call.findUnique({
              where: { id: callId },
            });

            if (call) {
              const endedAt = new Date();
              let finalStatus = "COMPLETED"; // Default for active calls
              let duration = 0;

              // If the call was never answered before the refresh, it's a MISSED call
              if (!call.answeredAt) {
                finalStatus = "MISSED";
              } else {
                // Calculate duration for the active call segment
                const startCall = new Date(call.answeredAt).getTime();
                duration = Math.floor((endedAt.getTime() - startCall) / 1000);
              }

              await prisma.call.update({
                where: { id: callId },
                data: {
                  status: finalStatus,
                  endedAt: endedAt,
                  duration: duration,
                  endedBy: String(userId),
                },
              });
            }
          } catch (err) {
            console.error("Error updating call status on disconnect:", err);
          }

          // Notify the other peer to close their UI
          io.to(`user-${targetId}`).emit("call-ended", {
            reason: "disconnected",
          });

          activeCalls.delete(key);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
