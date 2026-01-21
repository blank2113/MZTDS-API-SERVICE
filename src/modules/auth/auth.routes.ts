import { Router } from "express";
import {
  CreateUserHandler,
  LoginUserHandler,
  LogoutUserHandler,
} from "./auth.controller.js";
import { registerAuthOpenApi } from "./auth.openapi.js";

const router = Router();
registerAuthOpenApi();

router.post("/register", CreateUserHandler);
router.post("/login", LoginUserHandler);
router.post("/logout", LogoutUserHandler);

export default router;
