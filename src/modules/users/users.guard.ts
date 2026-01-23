import { TableRole } from "../../generated/prisma/enums.js";
import { ApiError } from "../../types/common.js";
import { UserToTableSchema } from "./users.types.js";

export const assertOwner = (userToTable: UserToTableSchema | null) => {
  if (!userToTable || userToTable.role !== TableRole.OWNER)
    throw new ApiError("Permission denied", 403);
};
