import { Card, Column } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { CreateColumnDTO } from "./columns.schema.js";
import { ApiError } from "../../types/common.js";
import { emitTableEvent } from "../../realtime/realtime.server.js";

export const getColumn = async (
  id: number,
): Promise<(Column & { cards: Card[] }) | null> => {
  return prisma.column.findUnique({
    where: { id: id },
    include: {
      cards: true,
    },
  });
};

export const getColumns = async (
  table_id: number,
): Promise<(Column & { cards: Card[] })[]> => {
  return prisma.column.findMany({
    where: { table_id: table_id },
    include: {
      cards: true,
    },
  });
};

export const createColumn = async (
  table_id: number,
  data: CreateColumnDTO,
): Promise<Column | null> => {
  const column = await prisma.column.create({
    data: {
      table_id: table_id,
      data: data.data,
    },
  });

  emitTableEvent(table_id, "column.created", {
    column,
  });

  return column;
};

export const updateColumn = async (
  id: number,
  data: CreateColumnDTO,
): Promise<Column | null> => {
  const updated = await prisma.$transaction(async (tx) => {
    const existColumn = await tx.column.findUnique({
      where: { id: id },
    });
    if (!existColumn) throw new ApiError("Column not found");

    await tx.column.update({
      where: { id },
      data: data,
    });

    return tx.column.findUnique({
      where: { id: id },
    });
  });

  if (updated) {
    emitTableEvent(updated.table_id, "column.updated", {
      column: updated,
    });
  }

  return updated;
};

export const deleteColumn = async (id: number) => {
  try {
    const deleted = await prisma.column.delete({
      where: { id },
    });

    emitTableEvent(deleted.table_id, "column.deleted", {
      column_id: deleted.id,
      table_id: deleted.table_id,
    });

    return deleted;
  } catch (err) {
    // Если колонки нет — возвращаем null
    console.log(err);
  }
};
