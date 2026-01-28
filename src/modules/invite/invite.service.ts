import { InviteStatus, TableRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";
import { sendToUser } from "../push-notification/push.service.js";
import { AddInviteUserToTableDTO } from "./invite.schema.js";

export const inviteUserToTable = async (dto: AddInviteUserToTableDTO) => {
  return prisma.$transaction(async (tx) => {
    const [targetUser, existingInvite] = await Promise.all([
      tx.user.findUnique({ where: { id: dto.user_id }, select: { id: true } }),
      tx.tableInvite.findFirst({
        where: {
          table_id: dto.table_id,
          user_id: dto.user_id,
          status: "pending",
        },
      }),
    ]);

    if (!targetUser) throw new ApiError("User is not found", 404);
    if (existingInvite) throw new ApiError("Invite already sent", 409);

    const invite = await tx.tableInvite.create({
      data: {
        table_id: dto.table_id,
        user_id: dto.user_id,
        owner_id: dto.owner_id,
      },
    });

    await sendToUser({
      user_id: dto.user_id,
      title: "📩 Приглашение в таблицу",
      body: `Вы были приглашены в таблицу. Примите приглашение, чтобы присоединиться.`,
      data: {
        inviteId: String(invite.id),
        tableId: String(dto.table_id),
        type: "table_invite",
      },
    });

    return invite;
  });
};

export const acceptTableInvite = async (inviteId: number) => {
  const invite = await prisma.tableInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) throw new ApiError("Invite not found", 404);

  const addedUser = await prisma.userToTable.create({
    data: {
      user_id: invite.user_id,
      table_id: invite.table_id,
      role: TableRole.VIEWER,
    },
  });

  await prisma.tableInvite.delete({ where: { id: inviteId } });

  await sendToUser({
    user_id: invite.owner_id,
    title: "✅ Пользователь принял приглашение",
    body: `Пользователь присоединился к вашей таблице`,
    data: {
      tableId: String(invite.table_id),
      type: "inviteAccepted",
      userId: String(invite.user_id),
    },
  });

  return addedUser;
};

export const getUserInvites = async (userId: number) => {
  return prisma.tableInvite.findMany({
    where: {
      user_id: userId,
      status: "pending",
    },
    include: {
      table: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const rejectInvite = async (inviteId: number, userId: number) => {
  const invite = await prisma.tableInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) throw new Error("Invite not found");
  if (invite.user_id !== userId) throw new Error("Not authorized");
  if (invite.status !== "pending") throw new Error("Invite already processed");

  const updated = await prisma.tableInvite.update({
    where: { id: inviteId },
    data: { status: InviteStatus.declined },
  });

  await sendToUser({
    user_id: invite.owner_id,
    title: "❌ Приглашение отклонено",
    body: `Пользователь отказался присоединиться к таблице`,
    data: {
      inviteId: String(inviteId),
      userId: String(userId),
      tableId: String(invite.table_id),
      type: "invite_rejected",
    },
  });

  return updated;
};
