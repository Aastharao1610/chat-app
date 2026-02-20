import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import messageRoutes from "./modules/message/message.route.js";
import errorMiddleware from "./middleware/error.middleware.js";
import chatRequestRoutes from "./modules/request/chatrequest.route.js";
import chatRoutes from "./modules/chat/chat.route.js";
import groupRoutes from "./modules/group/group.route.js";
import callRoutes from "./modules/call/call.route.js";

const app = express();

// CORS + Parsers
app.use(
  cors({
    origin: "*",
    // origin: "http://localhost:3000",
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = app.get("io");
  next();
});
app.get("/health", (req, res) => {
  res.send("Server running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/request", chatRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/calls", callRoutes);
app.use(errorMiddleware);

export default app;
