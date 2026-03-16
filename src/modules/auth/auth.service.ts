import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";
import { LoginDTO, RegisterDTO } from "./auth.schema.js";
import {
  queueWelcomeEmail,
  queueResetPasswordEmail,
} from "../mail/mail.queue.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const create = async (dto: RegisterDTO) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existingUser) throw new ApiError("Email already in user", 409);

  const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  // Queue welcome email in background
  try {
    console.log(`📬 Queueing welcome email for ${user.email}`);
    await queueWelcomeEmail(user.email, user.name);
    console.log(`✅ Welcome email queued for ${user.email}`);
  } catch (error) {
    console.error(`Failed to queue welcome email for ${user.email}:`, error);
    // Don't throw - registration should succeed even if email fails
  }

  return user;
};

export const login = async (dto: LoginDTO) => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) throw new ApiError("Invalid email or password", 401);

  const isValid = await bcrypt.compare(dto.password, user.password);

  if (!isValid) throw new ApiError("Invalid email or password", 401);

  return user;
};

export const getMe = async (id?: number) => {
  const user = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      telegram_id: true,
      notification: true,
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) throw new ApiError("User does not exist!");
  return user;
};

export const resetPassword = async (
  email: string,
  newPassword: string,
  resetLink?: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError("User not found", 404);

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { password: passwordHash },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  // Queue reset password confirmation email in background
  try {
    console.log(`📬 Queueing password reset email for ${updatedUser.email}`);
    await queueResetPasswordEmail(
      updatedUser.email,
      updatedUser.name,
      resetLink || process.env.APP_URL || "https://app.example.com",
    );
    console.log(`✅ Password reset email queued for ${updatedUser.email}`);
  } catch (error) {
    console.error(
      `Failed to queue password reset email for ${updatedUser.email}:`,
      error,
    );
    // Don't throw - password reset should succeed even if email fails
  }

  return updatedUser;
};
