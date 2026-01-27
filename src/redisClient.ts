import { createClient } from "redis";

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASS || undefined,
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("ready", () => console.log("✅ Redis ready"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
redisClient.on("reconnecting", (time) =>
  console.log(`🔄 Redis reconnecting in ${time}ms`),
);
