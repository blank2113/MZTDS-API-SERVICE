import { Card } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { CreateCardDTO } from "./cards.schema.js";
import { ApiError } from "../../types/common.js";
import { emitTableEvent } from "../../realtime/realtime.server.js";

export const getCard = async (id: number): Promise<Card | null> => {
  return prisma.card.findUnique({
    where: { id: id },
  });
};

export const getCards = async (column_id: number): Promise<Card[] | null> => {
  return prisma.card.findMany({
    where: { column_id: column_id },
  });
};

export const createCard = async (
  column_id: number,
  data: CreateCardDTO,
): Promise<Card | null> => {
  const card = await prisma.card.create({
    data: {
      column_id: column_id,
      data: data.data,
    },
  });

  const column = await prisma.column.findUnique({
    where: { id: column_id },
    select: { table_id: true },
  });

  if (column) {
    emitTableEvent(column.table_id, "card.created", {
      card,
      table_id: column.table_id,
    });
  }

  return card;
};

export const updateCard = async (
  id: number,
  data: CreateCardDTO,
): Promise<Card | null> => {
  const updated = await prisma.$transaction(async (tx) => {
    const existCard = await tx.card.findUnique({
      where: { id: id },
    });
    if (!existCard) throw new ApiError("Card not found");

    await tx.card.update({
      where: { id },
      data: data,
    });

    return tx.card.findUnique({
      where: { id: id },
    });
  });

  if (updated) {
    const column = await prisma.column.findUnique({
      where: { id: updated.column_id },
      select: { table_id: true },
    });

    if (column) {
      emitTableEvent(column.table_id, "card.updated", {
        card: updated,
        table_id: column.table_id,
      });
    }
  }

  return updated;
};

export const deleteCard = async (id: number): Promise<Card> => {
  const deleted = await prisma.$transaction(async (tx) => {
    const cardExists = await tx.card.findFirst({
      where: {
        id: id,
      },
    });

    if (!cardExists) {
      throw new Error("Card not found or access denied");
    }

    return tx.card.delete({
      where: { id: id },
    });
  });

  const column = await prisma.column.findUnique({
    where: { id: deleted.column_id },
    select: { table_id: true },
  });

  if (column) {
    emitTableEvent(column.table_id, "card.deleted", {
      card_id: deleted.id,
      column_id: deleted.column_id,
      table_id: column.table_id,
    });
  }

  return deleted;
};
