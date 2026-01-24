import { NextFunction, Request, Response } from "express";
import { TableRole } from "../generated/prisma/enums.js";
import { ApiError, ResourceResolver } from "../types/common.js";
import { prisma } from "../lib/prisma.js";

export const accessByTable =
  (
    resolveTableId: ResourceResolver,
    allowedRoles: TableRole[] = [TableRole.OWNER],
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user_id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const tableId = await resolveTableId(req);

      const access = await prisma.userToTable.findUnique({
        where: {
          user_id_table_id: {
            user_id: userId,
            table_id: Number(tableId),
          },
        },
      });

      if (!access) throw new ApiError("Access denied", 403);
      if (!allowedRoles.includes(access.role))
        throw new ApiError("Forbidden", 403);

      next();
    } catch (e) {
      next(e);
    }
  };

export const resolveTableFromTable = async (req: Request) => {
  const table_id = Number(
    req.params.table_id ?? req.params.id ?? req.body.table_id ?? req.body.id,
  );
  if (!table_id) throw new ApiError("Table ID required", 400);
  return table_id;
};

export const resolveTableFromColumn = async (req: Request) => {
  const columnId = Number(req.params.column_id ?? req.params.id);
  if (!columnId) throw new ApiError("Column ID required", 400);

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { table_id: true },
  });

  if (!column) throw new ApiError("Column not found", 404);
  return column.table_id;
};

export const resolveTableFromCard = async (req: Request) => {
  const cardId = Number(req.params.card_id ?? req.params.id);
  if (!cardId) throw new ApiError("Card ID required", 400);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: {
      column: { select: { table_id: true } },
    },
  });

  if (!card) throw new ApiError("Card not found", 404);
  return card.column.table_id;
};
