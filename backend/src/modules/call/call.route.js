import express from "express";
import { getCallsBetweenUsers } from "./call.controller.js";

const router = express.Router();
router.get("/:userId/:otherUserId", getCallsBetweenUsers);
export default router;
