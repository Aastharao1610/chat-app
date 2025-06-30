import prisma from "../../config/db.js";

export const rejectChatRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.user.id;

    const request = await prisma.chatRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== currentUserId) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized" });
    }

    await prisma.chatRequest.delete({
      where: { id: requestId },
    });

    res.status(200).json({ message: "Chat request rejected" });
  } catch (error) {
    console.error("Reject Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
