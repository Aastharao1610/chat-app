import prisma from "../../config/db.js";

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  // console.log(req);
  // console.log("Cookies received:", req.cookies, "req-cookies");
  // console.log("Refresh Token:", refreshToken);

  try {
    // 1. No refresh token? Send error
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token found" });
    }

    // 2. Delete refresh token from DB if exists
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    // 3. Clear cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    // 4. Send success response
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default logout;
