import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { TableRole } from "../generated/prisma/enums.js";
import { ApiError } from "../types/common.js";

/**
 * Middleware для проверки доступа пользователя к таблице
 * @param allowedRoles массив допустимых ролей (по умолчанию OWNER)
 */
export const tableAccess =
  (allowedRoles: TableRole[] = [TableRole.OWNER]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user_id;
      const tableId = Number(req.params.table_id || req.body.table_id);

      if (!userId) throw new ApiError("Unauthorized", 401);
      if (!tableId) throw new ApiError("Table ID is required", 400);

      const userToTable = await prisma.userToTable.findUnique({
        where: {
          user_id_table_id: {
            user_id: userId,
            table_id: tableId,
          },
        },
        include: {
          table: true,
          user: true,
        },
      });

      if (!userToTable) throw new ApiError("Tables not found", 404);

      if (!allowedRoles.includes(userToTable.role)) {
        throw new ApiError("Insufficient permissions", 403);
      }

      req.table = {
        id: tableId,
        role: userToTable.role,
        owner_id: userToTable.user.id || 0,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
