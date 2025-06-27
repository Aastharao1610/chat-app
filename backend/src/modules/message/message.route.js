import express from "express";

const router = express.Router();

import { createMessage } from "./message.controller.js";
router.post("/messages", createMessage);

export default router;
