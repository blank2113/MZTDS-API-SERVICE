import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bot } from "../modules/bot/bot.service.js";
import { sendEmailImmediately } from "../modules/mail/mail.queue.js";
import { redisOptions } from "./mailing.queue.js";

export const mailingWorker = new Worker(
  "mailing",
  async (job) => {
    // Handle email jobs (identified by job.name === "email")
    if (job.name === "email") {
      try {
        console.log(
          `📧 Processing email job ${job.id}: ${job.data.type} to ${job.data.to}`,
        );
        await sendEmailImmediately(job.data);
        console.log(`✅ Email sent: ${job.data.type} to ${job.data.to}`);
      } catch (error) {
        console.error(`❌ Failed to send email job ${job.id}:`, error);
        throw error;
      }
      return;
    }

    if (job.name !== "sendMessage") {
      console.warn(`⚠️ Skipping unknown job ${job.id} with name ${job.name}`);
      return;
    }

    // Handle telegram jobs
    const { telegram_id, text, parse_mode } = job.data;

    if (!telegram_id) {
      console.warn(`❌ Skipping job ${job.id}: telegram_id is undefined`);
      return;
    }

    if (typeof text !== "string" || !text.trim()) {
      console.warn(`❌ Skipping job ${job.id}: text is empty`);
      return;
    }

    const parseMode = parse_mode === "HTML" ? "HTML" : "Markdown";

    try {
      await bot.api.sendMessage(telegram_id.toString(), text, {
        parse_mode: parseMode,
      });
      console.log(`✅ Telegram message sent to ${telegram_id}`);
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
    connection: redisOptions,

    concurrency: 5,
    limiter: { max: 20, duration: 1000 },
  },
);
