import { prisma } from "../../lib/prisma.js";
import { mailingQueue } from "../../queues/mailing.queue.js";
import crypto from "crypto";
import { ApiError } from "../../types/common.js";

export const createNotification = async (
  user_id: number,
  table_id: number,
  text: string,
) => {
  const users = await prisma.userToTable.findMany({
    where: {
      table_id,
      NOT: {
        user_id: user_id,
      },
    },
    select: {
      user: {
        select: {
          telegram_id: true,
        },
      },
    },
  });

  const jobs = users
    .map((u) => u.user.telegram_id)
    .filter((id): id is string => !!id && /^\d+$/.test(id))
    .map((telegram_id) => ({
      name: "sendMessage",
      data: { telegram_id, text },
    }));

  if (!jobs.length) {
    console.log(`⚠️ No valid telegram_id for table ${table_id}`);
    return;
  }

  await mailingQueue.addBulk(jobs);
  console.log(
    `✅ Added ${jobs.length} jobs to mailing queue for table ${table_id}`,
  );
};

export async function generateTgLink(user_id: number): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const token = crypto.randomUUID();
    const user = await tx.user.findUnique({
      where: { id: user_id },
    });

    if (!user) throw new ApiError("User does not exist", 404);

    await tx.tgLinkToken.deleteMany({
      where: {
        email: user.email,
        expiresAt: { gt: new Date() },
      },
    });

    await prisma.tgLinkToken.create({
      data: {
        token,
        email: user.email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return `https://t.me/WorkflowMinzifaTravel_bot?start=${token}`;
  });
}
