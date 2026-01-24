import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const createAdmin = async () => {
  const passwordHash = await bcrypt.hash("huytudaproydesh", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@admin.com",
    },
    update: {}, // можно оставить пустым
    create: {
      name: "Admin1",
      email: "admin@admin.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });
};
