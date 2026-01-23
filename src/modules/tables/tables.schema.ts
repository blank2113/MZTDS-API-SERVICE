import { z } from "zod";

export const CreateTableSchema = z.object({
  name: z.string().min(4),
  columns: z.array(z.object({ data: z.json() })).optional(),
});

export const TableIdParamSchema = z.object({
  table_id: z.coerce.number().int().positive(),
});

export const UpdateTableSchema = CreateTableSchema.partial();

export type CreateTableDTO = z.infer<typeof CreateTableSchema>;
export type UpdateTableDTO = z.infer<typeof UpdateTableSchema>;
