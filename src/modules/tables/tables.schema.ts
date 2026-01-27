import { z } from "zod";

export const CreateTableSchema = z.object({
  name: z.string().min(4),
  owner_id: z.number().positive().optional(),
});

export const TableIdParamSchema = z.object({
  table_id: z.coerce.number().int().positive(),
});

export const UpdateTableSchema = CreateTableSchema.partial();

export type CreateTableDTO = z.infer<typeof CreateTableSchema>;
export type UpdateTableDTO = z.infer<typeof UpdateTableSchema>;
