import { Card } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { CreateCardDTO } from "./cards.schema.js";
import { ApiError } from "../../types/common.js";

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
  return prisma.card.create({
    data: {
      column_id: column_id,
      data: data.data,
    },
  });
};

export const updateCard = async (
  id: number,
  data: CreateCardDTO,
): Promise<Card | null> => {
  return prisma.$transaction(async (tx) => {
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
};

export const deleteCard = async (id: number): Promise<Card> => {
  return prisma.$transaction(async (tx) => {
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
};
