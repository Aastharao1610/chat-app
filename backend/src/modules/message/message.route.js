import express from "express";
import {
  createMessage,
  getMessagesByChatId,
  markMessagesAsRead,
} from "./message.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { sendGroupMessage } from "./groupMessage.controller.js";

const router = express.Router();

router.post("/", verifyToken, createMessage);
router.get("/:chatId", verifyToken, getMessagesByChatId);
router.post("/group/:chatId/messages", verifyToken, sendGroupMessage);
router.patch("/messages/read/:chatId", verifyToken, markMessagesAsRead);
export default router;
