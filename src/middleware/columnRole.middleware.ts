import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { TableRole } from "../generated/prisma/enums.js";
import { ApiError } from "../types/common.js";

/**
 * Middleware для проверки доступа пользователя к колонке
 * Проверка идет через таблицу, к которой принадлежит колонка
 */
export const columnAccess =
  (allowedRoles: TableRole[] = [TableRole.OWNER]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user_id;
      const columnId = Number(
        req.params.column_id ?? req.body.id ?? req.params.id,
      );

      if (!userId) {
        throw new ApiError("Unauthorized", 401);
      }

      if (!columnId || Number.isNaN(columnId)) {
        throw new ApiError("Column ID is required", 400);
      }

      // 1️⃣ Находим колонку + таблицу
      const column = await prisma.column.findUnique({
        where: { id: columnId },
        select: {
          table_id: true,
        },
      });

      if (!column) {
        throw new ApiError("Column not found", 404);
      }

      // 2️⃣ Проверяем роль пользователя в таблице
      const userTableRole = await prisma.userToTable.findUnique({
        where: {
          user_id_table_id: {
            user_id: userId,
            table_id: column.table_id,
          },
        },
      });

      if (!userTableRole) {
        throw new ApiError("Access denied", 403);
      }

      // 3️⃣ Проверка роли
      if (!allowedRoles.includes(userTableRole.role)) {
        throw new ApiError("Forbidden", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
