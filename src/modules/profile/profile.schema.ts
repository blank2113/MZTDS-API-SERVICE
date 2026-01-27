import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.email().optional(),
  telegram_id: z.string().optional(),
  notification: z.boolean().optional(),
});

export type UpdateProfileSchemaDTO = z.infer<typeof UpdateProfileSchema>;
