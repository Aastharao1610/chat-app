import prisma from "../../config/db.js";

// ✅ Send Message
export const createMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;

    if (!text || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1. Find or Create Chat between sender and receiver
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

    // 2. Save message
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
        chatId: chat.id,
      },
    });

    // 3. Emit socket event
    console.log("🔥 Emitting to users:", receiverId, senderId);
    console.log("📡 Emitting 'receive-message' to:", `user-${receiverId}`);
    console.log("Message object being sent:", message);

    req.io.to(`user-${receiverId}`).emit("receive-message", message);
    req.io.to(`user-${senderId}`).emit("receive-message", message);
    req.io.to(`user-${receiverId}`).emit("chat-updated");
    req.io.to(`user-${senderId}`).emit("chat-updated");

    res.status(201).json({ message });
  } catch (err) {
    console.error("Message Save Error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
};

// ✅ Get Messages by Chat ID
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

    // 🔁 Emit socket to sender to update their ticks
    const messages = await prisma.message.findMany({
      where: {
        chatId: parseInt(chatId),
        receiverId: userId,
      },
    });

    const senderId = messages?.[0]?.senderId;
    if (senderId) {
      req.io.to(`user-${senderId}`).emit("messages-read", {
        chatId: parseInt(chatId),
        readerId: userId,
      });
    }
    console.log("📡 Emitting 'messages-read' to room:", `user-${senderId}`);

    res.status(200).json({ success: true, count: updated.count });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update messages" });
  }
};
