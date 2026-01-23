import { Router } from "express";
import {
  LoginUserHandler,
  LogoutUserHandler,
  LogoutAllHandler,
  LogoutSessionHandler,
  GetSessionsHandler,
  CreateUserHandler,
  getMeHandler,
} from "./auth.controller.js";
import { registerAuthOpenApi } from "./auth.openapi.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  loginSchema,
  logoutFromSpecificSchema,
  registerSchema,
} from "./auth.schema.js";
import { requireSession } from "../../middleware/validateSession.middleware.js";

const router = Router();
registerAuthOpenApi();

router.post("/register", validate(registerSchema, "body"), CreateUserHandler);
router.post("/login", validate(loginSchema, "body"), LoginUserHandler);
router.post("/logout", requireSession, LogoutUserHandler);
router.delete("/logout-all", requireSession, LogoutAllHandler);
router.delete(
  "/logout/:session_id",
  requireSession,
  validate(logoutFromSpecificSchema, "params"),
  LogoutSessionHandler,
);
router.get("/sessions", requireSession, GetSessionsHandler);
router.get("/me", requireSession, getMeHandler);

export default router;
