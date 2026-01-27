import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "http://localhost:6379",
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("ready", () => console.log("✅ Redis ready"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
redisClient.on("reconnecting", (time) =>
  console.log(`🔄 Redis reconnecting in ${time}ms`),
);
