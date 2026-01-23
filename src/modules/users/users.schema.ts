import z from "zod";
import { TableRole } from "../../generated/prisma/enums.js";

export const AddUserToTableSchema = z.object({
  table_id: z.number().min(1).positive(),
  user_id: z.number().min(1).positive(),
  owner_id: z.number().min(1).positive(),
  role: z.enum(TableRole).default("VIEWER").optional(),
});

export const DeleteUserFromTableSchema = z.object({
  table_id: z.number().min(1).positive(),
  user_id: z.number().min(1).positive(),
  owner_id: z.number().min(1).positive(),
});

export const GetTableUserSchema = z.object({
  table_id: z.number().min(1).positive(),
  user_id: z.number().min(1).positive(),
});

export const GetTablesUserSchema = z.object({
  table_id: z.string().min(1),
});
export const GetTableUserSchema2 = z.object({
  table_id: z.string().min(1),
  user_id: z.string().min(1),
});
export const DeleteUserFromTableSchema2 = z.object({
  table_id: z.string().min(1),
  user_id: z.string().min(1),
  owner_id: z.string().min(1),
});

export type AddUserToTableDTO = z.infer<typeof AddUserToTableSchema>;
export type DeleteUserFromTableDTO = z.infer<typeof DeleteUserFromTableSchema>;
export type GetTableUserDTO = z.infer<typeof GetTableUserSchema>;
