import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
import { signup } from "./signup.controller.js";
import { verifyEmail } from "./verify.controller.js";
import { login } from "./login.controller.js";
import logout from "./logout.controller.js";
import { getCurrentUser } from "./me.route.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

export default router;
