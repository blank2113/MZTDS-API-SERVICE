import z from "zod";

export const AdminSessionUserIdSchema = z.object({
  user_id: z.coerce.string().min(1),
});
export const AdminSessionIdAndUserSchema = z.object({
  user_id: z.coerce.string().min(1),
  session_id: z.coerce.string().min(5),
});
