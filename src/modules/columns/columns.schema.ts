import z from "zod";

export const CreateColumnSchema = z.object({
  data: z.any(),
});

export const UpdateColumnSchema = CreateColumnSchema.partial();

export type CreateColumnDTO = z.infer<typeof CreateColumnSchema>;
export type UpdateColumnDTO = z.infer<typeof UpdateColumnSchema>;
