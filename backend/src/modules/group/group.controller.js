// File: backend/module/group/group.controller.js
import prisma from "../../config/db.js";

export const createGroupChat = async (req, res) => {
  try {
    const { name, userIds } = req.body;
    const creatorId = req.user.id;

    if (!name || !Array.isArray(userIds) || userIds.length < 1) {
      return res
        .status(400)
        .json({ message: "Group name and members required" });
    }

    // ✅ Check if all selected users have accepted request
    const acceptedUsers = await prisma.chatRequest.findMany({
      where: {
        status: "accepted",
        OR: [
          { senderId: creatorId, receiverId: { in: userIds } },
          { senderId: { in: userIds }, receiverId: creatorId },
        ],
      },
    });

    const acceptedUserIds = new Set();
    for (const req of acceptedUsers) {
      acceptedUserIds.add(
        req.senderId === creatorId ? req.receiverId : req.senderId
      );
    }

    const validMembers = userIds.filter((id) => acceptedUserIds.has(id));

    if (validMembers.length !== userIds.length) {
      return res.status(403).json({
        message: "Some users haven't accepted your chat request yet.",
      });
    }

    // ✅ Create group
    const groupChat = await prisma.chat.create({
      data: {
        isGroup: true,
        groupName: name,
      },
    });

    // ✅ Add members to ChatMember table (mark creator as admin)
    const membersToAdd = [
      ...validMembers.map((id) => ({
        userId: id,
        chatId: groupChat.id,
        isAdmin: false,
      })),
      {
        userId: creatorId,
        chatId: groupChat.id,
        isAdmin: true,
      },
    ];

    await prisma.chatMember.createMany({ data: membersToAdd });

    res.status(201).json({ groupChat });
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
};
