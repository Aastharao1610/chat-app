// import dotenv from "dotenv";

// dotenv.config();
// import express from "express";
// import cors from "cors";
// import authRoutes from "./modules/auth/auth.route.js";
// import errorMiddleware from "./middleware/error.middleware.js";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);

// // Error handler (must be last)
// app.use(errorMiddleware);

// export default app;

import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import authRoutes from "./modules/auth/auth.route.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Use CORS here with your frontend origin and credentials
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);
  next();
});

// Error handler (must be last)
app.use(errorMiddleware);

export default app;
