import { firebaseAdmin } from "../../config/firebase.js";
import { prisma } from "../../lib/prisma.js";

type SendToUserPayload = {
  user_id: number;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export const sendToUser = async ({
  user_id,
  title,
  body,
  data,
}: SendToUserPayload) => {
  const tokens = await prisma.userFcmToken.findMany({
    where: { user_id: user_id },
  });

  if (!tokens.length) return;

  await Promise.all(
    tokens.map((t) =>
      sendToToken(t.token, {
        title,
        body,
        data,
      }),
    ),
  );
};

export const sendToToken = async (
  token: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  },
) => {
  try {
    const admin = firebaseAdmin();

    await admin.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });
  } catch (e: any) {
    if (e.code === "messaging/registration-token-not-registered") {
      await prisma.userFcmToken.delete({ where: { token } });
    } else {
      throw e;
    }
  }
};

export const registerToken = async (
  token: string,
  user_id: number,
  platform: string = "web",
) => {
  await prisma.userFcmToken.upsert({
    where: { token },
    update: { user_id },
    create: {
      token,
      user_id,
      platform,
    },
  });
};
