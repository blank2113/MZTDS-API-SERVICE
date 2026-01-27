import { TableRole } from "../../generated/prisma/enums.js";

export type UserToTableSchema = {
  table_id: number;
  user_id: number;
  role: TableRole;
  created_at: Date;
  updated_at: Date;
} | null;

import { Prisma } from "../../generated/prisma/client.js";

export type UsersData = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
  };
}>;
