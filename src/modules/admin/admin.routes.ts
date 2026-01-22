import { Router } from "express";
import {
  GetAllUserSessionsHandler,
  GetUserSessionsHandler,
  LogoutAllUserSessionsHandler,
  LogoutUserSessionHandler,
} from "./admin.controller.js";
import { registerAdminOpenApi } from "./admin.openapi.js";

const router = Router();
registerAdminOpenApi();
router.get("/sessions", GetAllUserSessionsHandler);
router.get("/sessions/:userId", GetUserSessionsHandler);
router.delete("/sessions/:userId/:sessionId", LogoutUserSessionHandler);
router.delete("/sessions/:userId", LogoutAllUserSessionsHandler);

export default router;
