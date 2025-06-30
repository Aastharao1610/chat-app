//chatRequest.route.js
import express from "express";
import { sendChatRequest } from "./chatRequest.controller.js";
import { acceptChatRequest } from "./chatRequestAccept.controller.js";
import { rejectChatRequest } from "./chatRequestReject.controller.js";
import { getMyRequests } from "./chatRequestList.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

// import verifyToken

const router = express.Router();
router.post("/send", verifyToken, sendChatRequest);
router.post("/accept-request", verifyToken, acceptChatRequest);
router.post("/reject-request", verifyToken, rejectChatRequest);
router.get("/my", verifyToken, getMyRequests);

export default router;
