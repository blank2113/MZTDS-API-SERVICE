import { Queue } from "bullmq";
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { redisClient } from "../redisClient.js";

export const mailingQueue = new Queue("mailing", {
  // @ts-expect-error
  connection: redisClient,
});

export async function cleanQueue() {
  await mailingQueue.drain(); // активные + ожидающие
  await mailingQueue.clean(0, 0, "completed"); // завершённые
  await mailingQueue.clean(0, 0, "failed"); // неудачные
  console.log("🧹 Mailing queue cleaned");
}
