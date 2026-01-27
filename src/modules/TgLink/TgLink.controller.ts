import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { generateTgLink } from "./TgLink.service.js";

export const TgLinkHandler = catchAsync(async (req: Request, res: Response) => {
  const user_id = Number(req.session.user_id);
  const data = await generateTgLink(user_id);

  res.status(201).json({ link: data });
});
