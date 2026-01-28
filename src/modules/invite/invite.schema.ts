import z from "zod";

export const InviteTableSchema = z.object({
  table_id: z.number().positive(),
  user_id: z.number().positive(),
  owner_id: z.number().positive(),
});

export type AddInviteUserToTableDTO = z.infer<typeof InviteTableSchema>;
