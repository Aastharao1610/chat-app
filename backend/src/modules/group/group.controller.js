// File: backend/module/group/group.controller.js
import prisma from "../../config/db.js";

export const createGroupChat = async (req, res) => {
  try {
    const { name, userIds } = req.body;
    const creatorId = req.user.id;

    if (!name || !Array.isArray(userIds) || userIds.length < 1) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    const groupChat = await prisma.chat.create({
      data: {
        isGroup: true,
        groupName: name,
        users: {
          connect: [...userIds.map((id) => ({ id })), { id: creatorId }],
        },
      },
    });

    res.status(201).json({ groupChat });
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
};
export const getAllGroupsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await prisma.chat.findMany({
      where: {
        isGroup: true,
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: true,
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
