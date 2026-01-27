import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";
import { UpdateProfileSchemaDTO } from "./profile.schema.js";
import { UserProfilePayload } from "./profile.types.js";

export const updateProfile = async (
  user_id: number,
  data: UpdateProfileSchemaDTO,
): Promise<UserProfilePayload | null> => {
  return prisma.$transaction(async (tx) => {
    const existUser = await tx.user.findUnique({
      where: { id: user_id },
    });

    if (!existUser) throw new ApiError("User does not exist!");

    await tx.user.update({
      where: { id: user_id },
      data: data,
    });

    return tx.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        telegram_id: true,
        notification: true,
        role: true,
        updated_at: true,
      },
    });
  });
};
