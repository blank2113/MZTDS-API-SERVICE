import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { registerToken, sendToUser } from "./push.service.js";

export const registerFcmToken = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const { token, platform = "web" } = req.body;

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }
    await registerToken(token, user_id, platform);

    res.json({ success: true });
  },
);

export const sendNotification = catchAsync(
  async (req: Request, res: Response) => {
    const { user_id, title, body, data } = req.body;

    if (!user_id || !title || !body) {
      return res
        .status(400)
        .json({ message: "userId, title and body are required" });
    }

    await sendToUser({ user_id, title, body, data });

    res.json({ success: true });
  },
);
