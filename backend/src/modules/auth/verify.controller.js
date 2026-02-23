import prisma from "../../config/db.js";

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { token },
    });

    if (!pendingUser || pendingUser.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token invalid or expired" });
    }

    // Create user
    await prisma.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.hashedPassword,
      },
    });

    await prisma.pendingUser.delete({ where: { token } });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
