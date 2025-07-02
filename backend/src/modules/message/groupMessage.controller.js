// File: backend/module/message/groupMessage.controller.js

import prisma from "../../config/db.js";

export const sendGroupMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const senderId = req.user.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Verify user is part of the group chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(chatId),
        users: { some: { id: senderId } },
      },
    });

    if (!chat) {
      return res.status(403).json({ message: "Not part of the chat" });
    }

    // Create and save message
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId: 0, // optional, not needed for group messages
        chatId: parseInt(chatId),
      },
    });

    // Emit to group
    req.io?.to(`chat-${chatId}`).emit("group-message", message);

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Group Message Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
