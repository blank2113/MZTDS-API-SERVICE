import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";
import { LoginDTO, RegisterDTO } from "./auth.schema.js";

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

  return user;
};

export const login = async (dto: LoginDTO) => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) throw new ApiError("Invalid email or password", 401);

  const isValid = bcrypt.compare(dto.password, user.password);

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
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) throw new ApiError("User does not exist!");
  return user;
};
