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

const router = Router();
registerAuthOpenApi();

router.post("/register", CreateUserHandler);
router.post("/login", LoginUserHandler);
router.post("/logout", LogoutUserHandler);
router.delete("/logout-all", LogoutAllHandler);
router.delete("/logout/:sessionId", LogoutSessionHandler);
router.get("/sessions", GetSessionsHandler);
router.get("/me", getMeHandler);

export default router;
