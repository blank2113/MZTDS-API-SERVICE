import { z } from "zod";
import { Roles } from "../../generated/prisma/enums.js";

export const registerSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(Roles).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
