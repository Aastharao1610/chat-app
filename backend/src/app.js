// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import authRoutes from "./modules/auth/auth.route.js";
// import messageRoutes from "./modules/message/message.route.js";

// import errorMiddleware from "./middleware/error.middleware.js";

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log("Cookies:", req.cookies);
//   next();
// });

// app.use("/api/auth", authRoutes);
// app.use("/api", messageRoutes);

// app.use(errorMiddleware);

// export default app;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import messageRoutes from "./modules/message/message.route.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// CORS + Parsers
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = app.get("io");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);

app.use(errorMiddleware);

export default app;
