import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../types/common.js";

export async function generateTgLink(user_id: number): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const token = crypto.randomUUID();
    const user = await tx.user.findUnique({
      where: { id: user_id },
    });

    if (!user) throw new ApiError("User does not exist", 404);

    await tx.tgLinkToken.deleteMany({
      where: {
        email: user.email,
        expiresAt: { gt: new Date() },
      },
    });

    await prisma.tgLinkToken.create({
      data: {
        token,
        email: user.email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return `https://t.me/WorkflowMinzifaTravel_bot?start=${token}`;
  });
}
