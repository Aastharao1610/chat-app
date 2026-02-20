import prisma from "../../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../services/mail.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in verified users
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Wrap everything in a transaction
    await prisma.$transaction(async (tx) => {
      const existingPending = await tx.pendingUser.findUnique({
        where: { email },
      });

      if (existingPending) {
        await tx.pendingUser.update({
          where: { email },
          data: {
            name,
            hashedPassword,
            token,
            expiresAt,
            verified: false,
          },
        });
      } else {
        await tx.pendingUser.create({
          data: {
            name,
            email,
            hashedPassword,
            token,
            expiresAt,
            verified: false,
          },
        });
      }

      await sendEmail({
        to: email,
        subject: "Verify your Email",
        html: `<p>Click the link to verify your email:</p>
               <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>`,
      });
      // Only after DB update, try sending email
    });

    res.status(201).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
