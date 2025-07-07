import prisma from "../../config/db.js";
export const getMyRequests = async (req, res, next) => {
  try {
    const receiverId = req.user.id;

    const requests = await prisma.chatRequest.findMany({
      where: {
        status: "pending",
        receiverId,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};
