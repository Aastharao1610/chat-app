import axios from "axios";
import prisma from "../../config/db.js";

export const createMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;

    if (!text || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            id: { in: [senderId, receiverId] },
          },
        },
      },
      include: { users: true },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          users: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
        chatId: chat.id,
      },
    });
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
      },
    });

    await axios.post("http://localhost:4001/emit-message", {
      receiverId,
      senderId,
      message,
    });
    // io.to(`user-${receiverId}`).emit("receive-message", message);
    // io.to(`user-${senderId}`).emit("receive-message", message);

    res.status(201).json({ message });
  } catch (err) {
    console.error("Message creation error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId: parseInt(chatId) },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ✅ Mark Messages as Read
export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const updated = await prisma.message.updateMany({
      where: {
        chatId: parseInt(chatId),
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    // Find sender to notify
    const messages = await prisma.message.findMany({
      where: {
        chatId: parseInt(chatId),
        receiverId: userId,
      },
    });

    const senderId = messages?.[0]?.senderId;
    if (senderId) {
      await axios.post("http://localhost:4001/messages-read", {
        chatId: parseInt(chatId),
        readerId: userId,
        senderId,
      });
      // io.to(`user-${senderId}`).emit("messages-read", {
      //   chatId: parseInt(chatId),
      //   readerId: userId,
      // });
    }

    res.status(200).json({ success: true, count: updated.count });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update messages" });
  }
};
