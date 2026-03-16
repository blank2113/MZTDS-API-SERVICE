import { prisma } from "../../lib/prisma.js";
import { mailingQueue } from "../../queues/mailing.queue.js";
import crypto from "crypto";
import { ApiError } from "../../types/common.js";
import { buildTelegramNotificationMessage } from "./notification.formatter.js";
import { NotificationBodyDTO } from "./notification.schema.js";
import { emitTableEvent } from "../../realtime/realtime.server.js";

export const createNotification = async (
  user_id: number,
  table_id: number,
  payload: NotificationBodyDTO,
) => {
  const [users, table, actor] = await Promise.all([
    prisma.userToTable.findMany({
      where: {
        table_id,
        NOT: {
          user_id,
        },
      },
      select: {
        user: {
          select: {
            telegram_id: true,
          },
        },
      },
    }),
    prisma.table.findUnique({
      where: { id: table_id },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: user_id },
      select: { name: true },
    }),
  ]);

  const message = buildTelegramNotificationMessage(payload, {
    tableId: table_id,
    tableName: table?.name,
    actorName: actor?.name,
  });

  const jobs = users
    .map((u) => u.user.telegram_id)
    .filter((id): id is string => !!id && /^\d+$/.test(id))
    .map((telegram_id) => ({
      name: "sendMessage",
      data: {
        telegram_id,
        text: message.text,
        parse_mode: message.parse_mode,
      },
    }));

  if (!jobs.length) {
    console.log(`⚠️ No valid telegram_id for table ${table_id}`);
    emitTableEvent(table_id, "notification.created", {
      table_id,
      actor_id: user_id,
      queued_jobs: 0,
      payload,
    });
    return;
  }

  await mailingQueue.addBulk(jobs);
  console.log(
    `✅ Added ${jobs.length} jobs to mailing queue for table ${table_id}`,
  );

  emitTableEvent(table_id, "notification.created", {
    table_id,
    actor_id: user_id,
    queued_jobs: jobs.length,
    payload,
  });
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

    await tx.tgLinkToken.create({
      data: {
        token,
        email: user.email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return `https://t.me/WorkflowMinzifaTravel_bot?start=${token}`;
  });
}
