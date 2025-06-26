// // import authRoutes from "././src/modules/auth/auth.routes.js";

// import cors from "cors";
// import cookieParser from "cookie-parser";
// import app from "./src/app.js";

// const PORT = process.env.PORT || 5000;

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.get("/", (req, res) => {
//   res.send("<h1>Hello from Express!</h1>");
// });
// app.use(cookieParser());
// // app.use("/api/auth", authRoutes);
// app.listen(PORT, () => {
//   console.log(`Server is listening at http://localhost:${PORT}`);
// });

import cookieParser from "cookie-parser";
app.use(cookieParser());
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

// Add cookie parser here (since it's not yet in app.js)

app.get("/", (req, res) => {
  res.send("<h1>Hello from Express!</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
