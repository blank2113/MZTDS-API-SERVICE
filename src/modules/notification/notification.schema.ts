import { z } from "zod";

const metadataValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const notificationParamsSchema = z.object({
  table_id: z.coerce.number().int().positive(),
});

export const notificationBodySchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().min(1).max(3000).optional(),
    text: z.string().trim().min(1).max(3000).optional(),
    test: z.string().trim().min(1).max(3000).optional(),
    type: z.string().trim().min(1).max(64).optional(),
    actionText: z.string().trim().min(1).max(80).optional(),
    actionUrl: z.string().url().optional(),
    priority: z.enum(["low", "normal", "high"]).optional(),
    metadata: z.record(z.string(), metadataValueSchema).optional(),
  })
  .refine((value) => Boolean(value.message || value.text || value.test), {
    message: "At least one of message, text or test must be provided",
    path: ["message"],
  });

export type NotificationParamsDTO = z.infer<typeof notificationParamsSchema>;
export type NotificationBodyDTO = z.infer<typeof notificationBodySchema>;
