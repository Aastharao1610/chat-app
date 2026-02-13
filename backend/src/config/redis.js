// import "dotenv/config";
// import Redis from "ioredis";

// // const redisClient = new Redis({
// //   host: process.env.REDIS_HOST,
// //   port: Number(process.env.REDIS_PORT),
// //   password: process.env.REDIS_PASSWORD,
// //   url: process.env.REDIS_URL,
// //   tls: {},
// // });
// const redisClient = new Redis(process.env.REDIS_URL);
// // console.log(
// //   process.env.REDIS_HOST,
// //   Number(process.env.REDIS_PORT),
// //   process.env.REDIS_PASSWORD,
// // );
// redisClient.on("connect", () => {
//   console.log("Redis Connected");
// });
// redisClient.on("error", (err) => {
//   console.log("Redis is not connected", err.message);
// });

// export default redisClient;

import "dotenv/config";
import Redis from "ioredis";

console.log("REDIS_URL:", process.env.REDIS_URL);

const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

export default redisClient;
