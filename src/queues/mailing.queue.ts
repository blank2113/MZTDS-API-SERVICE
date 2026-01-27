import { Queue } from "bullmq";
import { redisClient } from "../redisClient.js";

export const mailingQueue = new Queue("mailing", {
  connection: {
    sendCommand: (...args: any) => redisClient.sendCommand(args),
  } as any,
});

export async function cleanQueue() {
  await mailingQueue.drain(); // активные + ожидающие
  await mailingQueue.clean(0, 0, "completed"); // завершённые
  await mailingQueue.clean(0, 0, "failed"); // неудачные
  console.log("🧹 Mailing queue cleaned");
}
