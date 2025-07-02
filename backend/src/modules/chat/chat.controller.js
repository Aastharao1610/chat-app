import prisma from "../../config/db.js";

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    res.status(200).json({ chats });
  } catch (err) {
    console.error("Get Chats Error:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};
