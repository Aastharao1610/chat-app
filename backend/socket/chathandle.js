import prisma from "../src/config/db.js";

export const handleChatEvents = (socket, io, userId) => {
  socket.on(`typing`, ({ receiverId }) => {
    console.log("user is typing");
    socket.to(`user-${receiverId}`).emit("typing", { from: userId });
  });

  socket.on(`send-message`, async (data) => {
    try {
      const { chatId, receiverId, text } = data;
      const newMessage = await prisma.message.create({
        data: {
          chatId: parseInt(chatId),
          senderId: parseInt(userId),
          receiverId: parseInt(receiverId),
          text: text,
        },
      });
      //   io.to(`user-${receiverId}`).emit("receive-message", newMessage);
      //   console.log("message sent", newMessage);
      socket.emit("message-sent", newMessage);
    } catch (error) {
      console.error("message send error", error);
    }
  });
  socket.on(`stop-typing`, ({ receiverId }) => {
    socket.to(`user-${receiverId}`).emit("stop-typing", { from: userId });
  });

  socket.on(`mark-read`, async ({ chatId, readerId, senderId }) => {
    try {
      await prisma.message.updateMany({
        where: {
          chatId: chatId,
          receiverId: parseInt(readerId),
          read: false,
        },
        data: {
          read: true,
        },
      });
      io.to(`user-${senderId}`).emit("message-read", {
        chatId: parseInt(chatId),
        readerId: parseInt(readerId),
      });
      console.log(
        `✅ Read receipt sent to user-${senderId} for chat ${chatId}`,
      );
      console.log(`Messages in Chat  ${chatId} marked by ${readerId}`);
    } catch (error) {
      console.error("Mark read error", error);
    }
  });
};
