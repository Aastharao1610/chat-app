// // backend/controllers/login.js
// import prisma from "../../config/db.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// export const login = async (req, res) => {
//   try {
//     console.log("Login route hit");
//     console.log("NODE_ENV:", process.env.NODE_ENV);

//     const { email, password } = req.body;
//     console.log("Body:", req.body);

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     // 1. Try to find user in verified users table
//     const existingUser = await prisma.user.findUnique({ where: { email } });

//     // 2. If not found in User table, check PendingUser table
//     if (!existingUser) {
//       const pendingUser = await prisma.pendingUser.findUnique({
//         where: { email },
//       });
//       if (pendingUser) {
//         return res
//           .status(403)
//           .json({ message: "Email not verified. Please check your inbox." });
//       } else {
//         return res.status(404).json({ message: "User not found" });
//       }
//     }

//     // 3. Verify password
//     const isPasswordValid = await bcrypt.compare(
//       password,
//       existingUser.password,
//     );
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Incorrect password" });
//     }

//     // 4. Generate tokens
//     const accessToken = jwt.sign(
//       { userId: existingUser.id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN },
//     );

//     const refreshToken = jwt.sign(
//       { userId: existingUser.id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: process.env.REFRESH_SECRET_EXPIRES },
//     );

//     await prisma.refreshToken.create({
//       data: {
//         token: refreshToken,
//         userId: existingUser.id,
//         expiresAt: new Date(Date.now() + 70 * 240 * 60 * 60 * 1000),
//       },
//     });

//     // 5. Set cookies
//     res.cookie("token", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // Automatically false on local, true on Vercel
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       // secure: false,
//       // sameSite: "lax",
//       maxAge: 60 * 60 * 1000,
//       path: "/",
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // Automatically false on local, true on Vercel
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       // secure: false,
//       // sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: "/",
//     });
//     console.log(refreshToken, "refresh TOken");
//     console.log("access Token", accessToken);
//     // 6. Respond
//     res.status(200).json({
//       message: "Logged in successfully",
//       accessToken,
//       user: {
//         id: existingUser.id,
//         email: existingUser.email,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Login error" });
//   }
// };

// backend/controllers/login.js
import prisma from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 1. Find user ONLY in the main verified users table
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 3. Generate tokens
    const accessToken = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const refreshToken = jwt.sign(
      { userId: existingUser.id },
      process.env.REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_SECRET_EXPIRES },
    );

    // 4. Save Refresh Token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Set cookies (Works for both Local and Vercel)
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    res.cookie("token", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login error" });
  }
};
