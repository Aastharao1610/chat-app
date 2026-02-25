import { handleCallEvents, cleanupUserCalls } from "./callhandle.js";
import { handleChatEvents } from "./chathandle.js";

export const onlineUsers = new Map();

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      onlineUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room : user-${userId} `);
      io.emit("get-online-users", Array.from(onlineUsers.keys()));
      console.log(`User ${userId} connected`);
    }

    socket.on("typing", ({ receiverId }) => {
      socket.to(`user-${receiverId}`).emit("typing", { from: userId });
    });

    socket.on("user-action", ({ targetId, roomId, actionType, data }) => {
      const destination = roomId ? roomId : `user-${targetId}`;
      socket.to(destination).emit("user-action", {
        from: userId,
        actionType,
        data,
      });
    });

    handleCallEvents(socket, io, userId);
    handleChatEvents(socket, io, userId);

    socket.on("disconnect", async () => {
      if (userId && onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit("get-online-users", Array.from(onlineUsers.keys()));

        await cleanupUserCalls(userId, io);
      }
    });
  });
};
