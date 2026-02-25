import prisma from "../../config/db.js";

export const createMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;
    const io = req.app.get("io");

    if (!text || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1. Find or create the 1-on-1 chat
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: { id: { in: [senderId, receiverId] } },
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          users: { connect: [{ id: senderId }, { id: receiverId }] },
        },
      });
    }

    // 2. Create the message
    const message = await prisma.message.create({
      data: {
        text, // Ensure frontend uses 'text' or map it to 'content'
        senderId,
        receiverId,
        chatId: chat.id,
      },
    });

    // 3. Update chat timestamp for sorting chat lists
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    // 4. EMIT: This makes it appear on the other person's screen instantly
    if (io) {
      io.to(`user-${receiverId}`).emit("receive-message", message);
      console.log(
        ` Message emitted to user-${receiverId} , messageId: ${message.id} , ${message.text}`,
      );
    }

    return res.status(201).json({ message });
  } catch (err) {
    console.error("Message creation error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId: parseInt(chatId) },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Fetch messages error:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// NOTE: markMessagesAsRead has been removed.
// Logic moved to socket/chathandle.js for real-time performance.
// Mark Messages as Read
export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const io = req.app.get("io");

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
      // await axios.post("http://localhost:4001/messages-read", {
      //   chatId: parseInt(chatId),
      //   readerId: userId,
      //   senderId,
      // });
      io.to(`user-${senderId}`).emit("messages-read", {
        chatId: parseInt(chatId),
        readerId: userId,
      });
      console.log(`Message has been read ${userId}`);
      console.log(`Read receipt sent to user-${senderId}`);
    }

    res.status(200).json({ success: true, count: updated.count });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update messages" });
  }
};
