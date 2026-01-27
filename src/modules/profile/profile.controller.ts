import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { updateProfile } from "./profile.service.js";

export const UpdateProfileHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const result = await updateProfile(user_id, req.body);
    res.status(201).json(result);
  },
);
