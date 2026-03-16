import { InviteStatus, TableRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import {
  emitTableEvent,
  emitUserEvent,
} from "../../realtime/realtime.server.js";
import { ApiError } from "../../types/common.js";
import { queueCustomEmail } from "../mail/mail.queue.js";
import { sendToUser } from "../push-notification/push.service.js";
import { AddInviteUserToTableDTO } from "./invite.schema.js";

export const inviteUserToTable = async (dto: AddInviteUserToTableDTO) => {
  return prisma.$transaction(async (tx) => {
    const [targetUser, ownerUser, table, existingInvite] = await Promise.all([
      tx.user.findUnique({
        where: { id: dto.user_id },
        select: { id: true, email: true, name: true },
      }),
      tx.user.findUnique({
        where: { id: dto.owner_id },
        select: { name: true },
      }),
      tx.table.findUnique({
        where: { id: dto.table_id },
        select: { name: true },
      }),
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

    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    const inviteUrl = appUrl
      ? `${appUrl}/invites?inviteId=${invite.id}`
      : "https://app.example.com";

    try {
      await queueCustomEmail({
        to: targetUser.email,
        subject: "Вас пригласили в таблицу",
        template: {
          preheader: "Новое приглашение в рабочую таблицу",
          badge: "Приглашение",
          title: "Вас пригласили в таблицу",
          greeting: `Здравствуйте, ${targetUser.name}!`,
          message:
            "Для вас создано приглашение. Откройте приглашение и примите его, чтобы получить доступ.",
          primaryButton: {
            text: "Открыть приглашение",
            url: inviteUrl,
          },
          secondaryButton: appUrl
            ? {
                text: "Открыть приложение",
                url: appUrl,
              }
            : undefined,
          metaItems: [
            {
              label: "Таблица",
              value: table?.name || `#${dto.table_id}`,
            },
            {
              label: "Пригласил",
              value: ownerUser?.name || `Пользователь #${dto.owner_id}`,
            },
          ],
          footerNote:
            "Если вы не ожидали это письмо, просто проигнорируйте его.",
          supportEmail: process.env.SUPPORT_EMAIL,
        },
      });
    } catch (error) {
      console.error(
        `Failed to queue invite email for ${targetUser.email}:`,
        error,
      );
    }

    emitTableEvent(dto.table_id, "invite.created", {
      invite,
      actor_id: dto.owner_id,
      target_user_id: dto.user_id,
    });

    emitUserEvent(dto.user_id, "invite.created", {
      invite,
      table_name: table?.name,
      actor_name: ownerUser?.name,
    });

    return invite;
  });
};

export const acceptTableInvite = async (inviteId: number) => {
  const invite = await prisma.tableInvite.findUnique({
    where: { id: inviteId },
    include: {
      table: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
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

  const ownerUser = await prisma.user.findUnique({
    where: { id: invite.owner_id },
    select: { email: true, name: true },
  });

  const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
  const tableUrl = appUrl
    ? `${appUrl}/tables/${invite.table_id}`
    : "https://app.example.com";

  if (ownerUser?.email) {
    try {
      await queueCustomEmail({
        to: ownerUser.email,
        subject: "Приглашение принято",
        template: {
          preheader: "Участник принял приглашение",
          badge: "Приглашение",
          title: "Пользователь принял приглашение",
          greeting: ownerUser.name
            ? `Здравствуйте, ${ownerUser.name}!`
            : "Здравствуйте!",
          message:
            "Пользователь принял ваше приглашение и теперь подключен к таблице.",
          primaryButton: {
            text: "Открыть таблицу",
            url: tableUrl,
          },
          secondaryButton: appUrl
            ? {
                text: "Открыть приложение",
                url: appUrl,
              }
            : undefined,
          metaItems: [
            {
              label: "Таблица",
              value: invite.table?.name || `#${invite.table_id}`,
            },
            {
              label: "Пользователь",
              value: invite.user?.name || `Пользователь #${invite.user_id}`,
            },
          ],
          supportEmail: process.env.SUPPORT_EMAIL,
        },
      });
    } catch (error) {
      console.error(
        `Failed to queue invite accepted email for ${ownerUser.email}:`,
        error,
      );
    }
  }

  emitTableEvent(invite.table_id, "invite.accepted", {
    invite_id: invite.id,
    table_id: invite.table_id,
    user_id: invite.user_id,
    actor_id: invite.user_id,
  });

  emitUserEvent(invite.owner_id, "invite.accepted", {
    invite_id: invite.id,
    table_id: invite.table_id,
    user_id: invite.user_id,
    user_name: invite.user?.name,
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
    include: {
      table: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!invite) throw new ApiError("Invite not found", 404);
  if (invite.user_id !== userId) throw new ApiError("Not authorized", 403);
  if (invite.status !== "pending") {
    throw new ApiError("Invite already processed", 409);
  }

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

  const ownerUser = await prisma.user.findUnique({
    where: { id: invite.owner_id },
    select: { email: true, name: true },
  });

  const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
  const tableUrl = appUrl
    ? `${appUrl}/tables/${invite.table_id}`
    : "https://app.example.com";

  if (ownerUser?.email) {
    try {
      await queueCustomEmail({
        to: ownerUser.email,
        subject: "Приглашение отклонено",
        template: {
          preheader: "Участник отклонил приглашение",
          badge: "Приглашение",
          title: "Пользователь отклонил приглашение",
          greeting: ownerUser.name
            ? `Здравствуйте, ${ownerUser.name}!`
            : "Здравствуйте!",
          message:
            "Пользователь отклонил ваше приглашение и не был добавлен в таблицу.",
          primaryButton: {
            text: "Открыть таблицу",
            url: tableUrl,
          },
          secondaryButton: appUrl
            ? {
                text: "Открыть приложение",
                url: appUrl,
              }
            : undefined,
          metaItems: [
            {
              label: "Таблица",
              value: invite.table?.name || `#${invite.table_id}`,
            },
            {
              label: "Пользователь",
              value: invite.user?.name || `Пользователь #${invite.user_id}`,
            },
            {
              label: "Invite ID",
              value: String(inviteId),
            },
          ],
          supportEmail: process.env.SUPPORT_EMAIL,
        },
      });
    } catch (error) {
      console.error(
        `Failed to queue invite rejected email for ${ownerUser.email}:`,
        error,
      );
    }
  }

  emitTableEvent(invite.table_id, "invite.rejected", {
    invite_id: invite.id,
    table_id: invite.table_id,
    user_id: invite.user_id,
    actor_id: userId,
  });

  emitUserEvent(invite.owner_id, "invite.rejected", {
    invite_id: invite.id,
    table_id: invite.table_id,
    user_id: invite.user_id,
    user_name: invite.user?.name,
  });

  return updated;
};
