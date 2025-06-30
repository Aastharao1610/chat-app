// controllers/chatRequest.controller.js

import prisma from "../../config/db.js";

export const sendChatRequest = async (req, res) => {
  try {
    const { senderId, receiverEmail } = req.body;

    if (!senderId || !receiverEmail) {
      return res
        .status(400)
        .json({ message: "Missing sender or receiver info" });
    }
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent duplicate requests
    const existingRequest = await prisma.chatRequest.findFirst({
      where: {
        senderId,
        receiverId: receiver.id,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = await prisma.chatRequest.create({
      data: {
        senderId,
        receiverId: receiver.id,
      },
    });

    // Optional: emit socket notification to receiver
    req.io?.emit(`chat-request-${receiver.id}`, newRequest);

    res.status(201).json({ request: newRequest });
  } catch (error) {
    console.error("Send Chat Request Error:", error);
    res.status(500).json({ message: "Failed to send request" });
  }
};
