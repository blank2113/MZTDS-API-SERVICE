import { Router } from "express";
import {
  sendTableInviteHandler,
  acceptTableInviteHandler,
  getUserInvitesHandler,
  rejectInviteHandler,
} from "./invite.controller.js";
import { registerInviteOpenApi } from "./invite.openapi.js";

const router = Router();
registerInviteOpenApi();

router.get("/", getUserInvitesHandler);
router.post("/", sendTableInviteHandler);

router.post("/:inviteId/accept", acceptTableInviteHandler);

router.post("/:inviteId/reject", rejectInviteHandler);

export default router;
