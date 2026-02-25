import prisma from "../src/config/db.js";
export const activeCalls = new Map();

export const handleCallEvents = (socket, io, userId) => {
  // call start

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
      activeCalls.set(`${userId}-${receiverId}`, newCall.id);

      io.to(`user-${receiverId}`).emit("incoming-call", {
        callerId: userId,
        offer,
        callId: newCall.id,
        type,
      });
    } catch (error) {
      console.error("Call user error", error);
    }
  });
  // signalling
  socket.on(`ice-candidate`, ({ to, candidate }) => {
    io.to(`user-${to}`).emit("ice-candidate", { candidate, from: userId });
  });

  socket.on("answer-call", async ({ callerId, answer, type }) => {
    try {
      const key = `${callerId}-${userId}`; // Hyphen to match Map
      const callId = activeCalls.get(key);

      if (callId) {
        await prisma.call.update({
          where: { id: callId },
          data: { status: "CONNECTED", answeredAt: new Date() },
        });
      }

      // FIX: Use 'io' to emit, and notify the caller
      io.to(`user-${callerId}`).emit("call-answered", {
        answer,
        receiverId: userId,
        type,
      });
      console.log("call is answered");
    } catch (error) {
      console.error("Answer call error:", error);
    }
  });

  socket.on(`end-call`, async ({ targetId, type }) => {
    const key = activeCalls.has(`${userId}-${targetId}`)
      ? `${userId}-${targetId}`
      : `${targetId}-${userId}`;
    await finalizeCall(key, userId, "COMPLETED");
    io.to(`user-${targetId}`).emit(`call-ended`, { type });
  });

  socket.on("reject-call", async ({ callerId, type }) => {
    const key = `${callerId}-${userId}`;
    await finalizeCall(key, userId, "REJECTED");
    io.to(`user-${callerId}`).emit("call-rejected", { type });
  });
};

async function finalizeCall(key, userId, defaultStatus) {
  const callId = activeCalls.get(key);
  if (!callId) {
    console.warn(`No active call found for key: ${key}`);
    return;
  }
  try {
    const call = await prisma.call.findUnique({ where: { id: callId } });
    if (call) {
      const endedAt = new Date();
      const start = call.answeredAt
        ? new Date(call.answeredAt).getTime()
        : null;
      const duration = start
        ? Math.floor((endedAt.getTime() - start) / 1000)
        : 0;

      let status = defaultStatus;
      if (!call.answeredAt) {
        start =
          String(userId) === String(call.callerId) ? "MISSED" : "REJECTED";
      }
      await prisma.call.update({
        where: {
          id: callId,
        },
        data: {
          status: status,
          endedAt,
          duration: duration,
          endedBy: String(userId),
        },
      });
    }
    activeCalls.delete(key);
  } catch (error) {
    console.error("FINALISE ERROR", error);
  }
}

export const cleanupUserCalls = async (userId, io) => {
  for (const [key, callId] of activeCalls.entries()) {
    if (key.includes(String(userId))) {
      const [cId, rId] = key.split("_");
      const targetId = cId === String(userId) ? rId : cId;
      await finalizeCall(key, userId, "COMPLETED");
      io.to(`user-${targetId}`).emit("call-ended", { reason: "disconnected" });
    }
  }
};
