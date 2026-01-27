import { Queue } from "bullmq";

export const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || undefined || "default",
  password: process.env.REDIS_PASS || undefined,
};

export const mailingQueue = new Queue("mailing", {
  connection: redisOptions, // ✅ тип ConnectionOptions
});

export async function cleanQueue() {
  await mailingQueue.drain(); // активные + ожидающие
  await mailingQueue.clean(0, 0, "completed"); // завершённые
  await mailingQueue.clean(0, 0, "failed"); // неудачные
  console.log("🧹 Mailing queue cleaned");
}
