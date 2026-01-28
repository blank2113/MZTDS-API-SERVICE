import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import {
  acceptTableInvite,
  getUserInvites,
  inviteUserToTable,
  rejectInvite,
} from "./invite.service.js";

export const sendTableInviteHandler = catchAsync(
  async (req: Request, res: Response) => {
    const invite = await inviteUserToTable({
      user_id: req.body.user_id,
      table_id: req.body.table_id,
      owner_id: Number(req.session.user_id),
    });

    res.status(200).json({ message: "Invite sent successfully", data: invite });
  },
);

export const acceptTableInviteHandler = catchAsync(
  async (req: Request, res: Response) => {
    const inviteId = Number(req.params.inviteId);
    const addedUser = await acceptTableInvite(inviteId);

    res.status(200).json({
      message: "Invite accepted, user added to table",
      data: addedUser,
    });
  },
);

export const getUserInvitesHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const invites = await getUserInvites(user_id);

    res
      .status(200)
      .json({ message: "Invites fetched successfully", data: invites });
  },
);

export const rejectInviteHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Number(req.session.user_id);
    const inviteId = Number(req.params.inviteId);

    const invite = await rejectInvite(inviteId, userId);

    res
      .status(200)
      .json({ message: "Invite rejected successfully", data: invite });
  },
);
