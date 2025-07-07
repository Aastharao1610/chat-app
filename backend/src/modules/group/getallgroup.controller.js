export const getAllGroupsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ First find chatIds where user is a member
    const chatMemberships = await prisma.chatMember.findMany({
      where: { userId },
      select: { chatId: true },
    });

    const chatIds = chatMemberships.map((c) => c.chatId);

    // ✅ Fetch all group chats user is part of
    const groups = await prisma.chat.findMany({
      where: {
        isGroup: true,
        id: { in: chatIds },
      },
      include: {
        members: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    res.status(200).json({ groups });
  } catch (err) {
    console.error("Fetch Group Error:", err);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};
