import z from "zod";

export const PushSchema = z.object({
  topic: z.string().min(3),
  notification: z.object({
    title: z.string(),
    body: z.string(),
  }),
});

export type PushDTO = z.infer<typeof PushSchema>;
