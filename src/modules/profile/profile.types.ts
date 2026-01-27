import { Prisma } from "../../generated/prisma/client.js";

export type UserProfilePayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    telegram_id: true;
    notification: true;
    role: true;
    updated_at: true;
  };
}>;
