import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { TableRole } from "../generated/prisma/enums.js";
import { ApiError } from "../types/common.js";

/**
 * Middleware для проверки доступа пользователя к карточке
 * Card -> Column -> Table -> UserToTable
 */
export const cardAccess =
  (allowedRoles: TableRole[] = [TableRole.OWNER]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user_id;
      const cardId = Number(req.params.id ?? req.body.id);

      if (!userId) {
        throw new ApiError("Unauthorized", 401);
      }

      if (!cardId || Number.isNaN(cardId)) {
        throw new ApiError("Card ID is required", 400);
      }

      // 1️⃣ Получаем card -> column -> table
      const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: {
          column: {
            select: {
              table_id: true,
            },
          },
        },
      });

      if (!card) {
        throw new ApiError("Card not found", 404);
      }

      const tableId = card.column.table_id;

      // 2️⃣ Проверяем участие пользователя в таблице
      const userTableRole = await prisma.userToTable.findUnique({
        where: {
          user_id_table_id: {
            user_id: userId,
            table_id: tableId,
          },
        },
      });

      if (!userTableRole) {
        throw new ApiError("Access denied", 403);
      }

      // 3️⃣ Проверяем роль
      if (!allowedRoles.includes(userTableRole.role)) {
        throw new ApiError("Forbidden", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
