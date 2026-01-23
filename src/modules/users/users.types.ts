import { TableRole } from "../../generated/prisma/enums.js";

export type UserToTableSchema = {
  table_id: number;
  user_id: number;
  role: TableRole;
  created_at: Date;
  updated_at: Date;
} | null;
