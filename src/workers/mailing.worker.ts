/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bot } from "../bot/bot.service.js";

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

      // Если пользователь заблокировал бота
      if (err?.code === 403) {
        await prisma.user.updateMany({
          where: { telegram_id: String(telegram_id) },
          data: { notification: false },
        });
        console.log(`⚠️ User ${telegram_id} unsubscribed`);
      }

      throw err; // BullMQ попробует retry
    }
  },
  {
    // @ts-expect-error
    connection: process.env.REDIS_URL,
    concurrency: 5,
    limiter: { max: 20, duration: 1000 },
  },
);
