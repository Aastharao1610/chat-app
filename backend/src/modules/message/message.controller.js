import prisma from "../../config/db.js";

export const createMessage = async (req, res) => {
  try {
    const { text, senderId, receiverId } = req.body;

    if (!text || !senderId || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
      },
    });

    req.io.emit("receive-message", message);

    res.status(201).json({ message });
  } catch (err) {
    console.error("Message Save Error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
};
