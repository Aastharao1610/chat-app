import prisma from "../../config/db.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const getCurrentUser = async (req, res) => {
  console.log(process.env.JWT_SECRET);
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log(token, "Testing of tokennnn");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Testig od decoded ", decoded);
    const userId = decoded?.userId;
    console.log("testing of userid", userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log(user, "user in db");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in /me route:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
