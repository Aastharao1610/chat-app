import express from "express";
import { getMyChats } from "./chat.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", verifyToken, getMyChats);

export default router;
