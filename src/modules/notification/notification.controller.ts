import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { createNotification, generateTgLink } from "./notification.service.js";

export const CreateNotificationHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const table_id = Number(req.params.table_id);

    await createNotification(user_id, table_id, req.body);

    res.status(201).json({
      message: "Notification successfully sent ✅",
    });
  },
);

export const TgLinkHandler = catchAsync(async (req: Request, res: Response) => {
  const user_id = Number(req.session.user_id);
  const data = await generateTgLink(user_id);

  res.status(201).json({ link: data });
});
