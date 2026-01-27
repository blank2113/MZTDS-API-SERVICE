import { Queue, Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bot } from "../bot/bot.service.js";

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASS || undefined,
};

export const mailingQueue = new Queue("mailing", {
  connection: redisOptions,
});

// Worker
export const mailingWorker = new Worker(
  "mailing",
  async (job) => {
    const { telegram_id, text } = job.data;

    if (!telegram_id) {
      console.warn(`❌ Skipping job ${job.id}: telegram_id is undefined`);
      return;
    }

    try {
      await bot.api.sendMessage(telegram_id.toString(), text, {
        parse_mode: "Markdown",
      });
      console.log(`✅ Message sent to ${telegram_id}`);
    } catch (err: any) {
      console.error(`❌ Failed to send message to ${telegram_id}:`, err);

      if (err?.code === 403) {
        await prisma.user.updateMany({
          where: { telegram_id: String(telegram_id) },
          data: { notification: false },
        });
        console.log(`⚠️ User ${telegram_id} unsubscribed`);
      }

      throw err;
    }
  },
  {
    connection: redisOptions, // ✅ только конфигурация, не открытый клиент
    concurrency: 5,
    limiter: { max: 20, duration: 1000 },
  },
);
export async function cleanQueue() {
  await mailingQueue.drain(); // активные + ожидающие
  await mailingQueue.clean(0, 0, "completed"); // завершённые
  await mailingQueue.clean(0, 0, "failed"); // неудачные
  console.log("🧹 Mailing queue cleaned");
}
