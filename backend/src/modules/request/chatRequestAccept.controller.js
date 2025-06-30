import prisma from "../../config/db.js";

export const acceptChatRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.user.id;

    // 1. Fetch the chat request
    const request = await prisma.chatRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Chat request not found" });
    }

    // 2. Validate receiver
    if (request.receiverId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    // 3. Update chat request
    await prisma.chatRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });

    // 4. Create new chat between sender and receiver
    await prisma.chat.create({
      data: {
        users: {
          connect: [{ id: request.senderId }, { id: request.receiverId }],
        },
      },
    });

    res.status(200).json({ message: "Chat request accepted" });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
