import { User } from "../../generated/prisma/client.js";
import { TableRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";

import {
  AddUserToTableDTO,
  DeleteUserFromTableDTO,
  GetTableUserDTO,
} from "./users.schema.js";

export const addUserToTable = async (dto: AddUserToTableDTO) => {
  return prisma.$transaction(async (tx) => {
    const [targetUser, existing] = await Promise.all([
      tx.user.findUnique({ where: { id: dto.user_id }, select: { id: true } }),
      tx.userToTable.findUnique({
        where: {
          user_id_table_id: { user_id: dto.user_id, table_id: dto.table_id },
        },
      }),
    ]);

    if (!targetUser) throw new ApiError("User is not found", 404);
    if (existing) throw new ApiError("User already added to this table", 409);

    const addedUser = await tx.userToTable.create({
      data: {
        user_id: dto.user_id,
        table_id: dto.table_id,
        role: dto.role ?? TableRole.VIEWER,
      },
    });

    await tx.auditLog.create({
      data: {
        data: {
          action: "ADD_USER_TO_TABLE",
          performedBy: dto.owner_id,
          targetUser: dto.user_id,
          tableId: dto.table_id,
        },
      },
    });

    return addedUser;
  });
};

export const deleteUserFromTable = async (dto: DeleteUserFromTableDTO) => {
  const { owner_id, table_id, user_id } = dto;

  if (user_id === owner_id) {
    throw new ApiError("Cannot remove the owner from the table", 403);
  }

  return prisma.$transaction(async (tx) => {
    const target = await tx.userToTable.findUnique({
      where: { user_id_table_id: { user_id: user_id, table_id } },
    });

    if (!target) throw new ApiError("User not found in table", 404);

    await tx.userToTable.delete({
      where: { user_id_table_id: { user_id: user_id, table_id } },
    });

    await tx.auditLog.create({
      data: {
        data: {
          action: "REMOVE_USER_FROM_TABLE",
          performedBy: owner_id,
          targetUser: user_id,
          tableId: table_id,
        },
      },
    });

    return { message: "User removed from table" };
  });
};

export const getTableUser = async (dto: GetTableUserDTO) => {
  const userToTable = await prisma.userToTable.findUnique({
    where: {
      user_id_table_id: { user_id: dto.user_id, table_id: dto.table_id },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!userToTable) throw new ApiError("User not found in table", 404);

  return {
    user: userToTable.user,
    role: userToTable.role,
    addedAt: userToTable.created_at,
  };
};

export const getTableUsers = async (table_id: number) => {
  const users = await prisma.userToTable.findMany({
    where: { table_id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { role: "desc" },
  });

  return users.map((u) => ({
    user: u.user,
    role: u.role,
    addedAt: u.created_at,
  }));
};

export const getAllUserExpectAdmins = async (
  user_id: number,
): Promise<User[]> => {
  return prisma.$transaction(async (ts) => {
    const users = await ts.user.findMany({
      where: {
        NOT: { id: user_id },
        role: "USER",
      },
    });
    return users;
  });
};
