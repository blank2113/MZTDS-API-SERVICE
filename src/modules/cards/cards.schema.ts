import z from "zod";

export const CreateCardSchema = z.object({
  data: z.any(),
  column_id: z.number().positive().optional(),
});

export const UpdateCardSchema = CreateCardSchema.partial();

export type CreateCardDTO = z.infer<typeof CreateCardSchema>;
export type UpdateCardDTO = z.infer<typeof UpdateCardSchema>;
