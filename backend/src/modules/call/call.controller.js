import prisma from "../../config/db.js";

export const getCallsBetweenUsers = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const user1Id = Number(req.params.userId);
    const user2Id = Number(req.params.otherUserId);

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          {
            callerId: user1Id,
            receiverId: user2Id,
          },
          {
            callerId: user2Id,
            receiverId: user1Id,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    return res.status(500).json({ error: "Failed to fetch calls" });
  }
};
