import express from "express";
import { createGroupChat } from "./group.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { getAllGroupsForUser } from "./getallgroup.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createGroupChat);
router.get("/my", verifyToken, getAllGroupsForUser);

export default router;
