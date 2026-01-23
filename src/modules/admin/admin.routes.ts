import { Router } from "express";
import {
  GetAllUserSessionsHandler,
  GetUserSessionsHandler,
  LogoutAllUserSessionsHandler,
  LogoutUserSessionHandler,
} from "./admin.controller.js";
import { registerAdminOpenApi } from "./admin.openapi.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";
import { validate } from "../../middleware/validate.moddleware.js";
import {
  AdminSessionIdAndUserSchema,
  AdminSessionUserIdSchema,
} from "./admin.schema.js";

const router = Router();
registerAdminOpenApi();

router.get("/sessions", adminAuth, GetAllUserSessionsHandler);

router.get(
  "/sessions/:user_id",
  requireAuth,
  adminAuth,
  validate(AdminSessionUserIdSchema, "params"),
  GetUserSessionsHandler,
);
router.delete(
  "/sessions/:user_id/:session_id",
  requireAuth,
  adminAuth,
  validate(AdminSessionIdAndUserSchema, "params"),
  LogoutUserSessionHandler,
);
router.delete(
  "/sessions/:user_id",
  requireAuth,
  adminAuth,
  validate(AdminSessionUserIdSchema, "params"),
  LogoutAllUserSessionsHandler,
);

export default router;
