import {
  Column,
  Table,
  TableRole,
  User,
} from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";
import {
  emitGlobalEvent,
  emitTableEvent,
  emitUserEvent,
} from "../../realtime/realtime.server.js";
import { CreateTableDTO, UpdateTableDTO } from "./tables.schema.js";

export const getTables = async (
  user_id: number,
): Promise<(Table & { columns: Column[] })[]> => {
  return prisma.table.findMany({
    where: { users: { some: { user_id } } },
    include: {
      columns: true,
    },
  });
};

export const getTable = async (
  user_id: number,
  table_id: number,
): Promise<(Table & { columns: Column[]; users: { user: User }[] }) | null> => {
  const table = await prisma.table.findFirst({
    where: { id: table_id, users: { some: { user_id } } },
    include: {
      columns: true,
      users: { include: { user: true } },
    },
  });
  if (!table) throw new ApiError("Table not found!", 404);

  return table;
};

export const createTable = async (
  user_id: number,
  data: CreateTableDTO,
): Promise<Table> => {
  const table = await prisma.$transaction(async (tx) => {
    const table = await tx.table.create({
      data: {
        name: data.name,
        owner_id: user_id,
      },
    });

    await tx.userToTable.create({
      data: {
        user_id: user_id,
        table_id: table.id,
        role: TableRole.OWNER,
      },
    });

    return table;
  });

  emitUserEvent(user_id, "table.created", {
    table,
    actor_id: user_id,
  });

  emitGlobalEvent("table.created.global", {
    table_id: table.id,
    actor_id: user_id,
  });

  return table;
};

export const updateTable = async (
  user_id: number,
  table_id: number,
  data: UpdateTableDTO,
): Promise<Table | null> => {
  const updated = await prisma.$transaction(async (tx) => {
    const table = await tx.table.findFirst({
      where: {
        id: table_id,
        users: {
          some: {
            user_id,
            role: "OWNER",
          },
        },
      },
    });

    if (!table) {
      throw new ApiError("Only owner can update table");
    }

    if (data.owner_id && data.owner_id !== user_id) {
      const newOwner = await tx.userToTable.findUnique({
        where: {
          user_id_table_id: {
            user_id: data.owner_id,
            table_id,
          },
        },
      });

      if (!newOwner) {
        throw new ApiError("New owner is not a member of this table");
      }

      await tx.userToTable.update({
        where: {
          user_id_table_id: {
            user_id,
            table_id,
          },
        },
        data: { role: "EDITOR" },
      });

      await tx.userToTable.update({
        where: {
          user_id_table_id: {
            user_id: data.owner_id,
            table_id,
          },
        },
        data: { role: "OWNER" },
      });
    }

    return tx.table.update({
      where: { id: table_id },
      data: {
        name: data.name,
        updated_at: new Date(),
        owner_id: data.owner_id ?? table.owner_id,
      },
    });
  });

  if (updated) {
    emitTableEvent(table_id, "table.updated", {
      table: updated,
      actor_id: user_id,
    });
  }

  return updated;
};

export const deleteTable = async (
  user_id: number,
  table_id: number,
): Promise<Table> => {
  const deleted = await prisma.$transaction(async (tx) => {
    const tableExists = await tx.table.findFirst({
      where: {
        id: table_id,
        users: { some: { user_id: user_id } },
      },
    });

    if (!tableExists) {
      throw new ApiError("Table not found or access denied", 404);
    }

    return tx.table.delete({
      where: { id: table_id },
    });
  });

  emitUserEvent(user_id, "table.deleted", {
    table: deleted,
    actor_id: user_id,
  });

  emitTableEvent(table_id, "table.deleted", {
    table_id: deleted.id,
    actor_id: user_id,
  });

  return deleted;
};
