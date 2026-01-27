import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { UpdateProfileHandler } from "./profile.controller.js";
import { registerProfileOpenApi } from "./profile.openapi.js";

const route = Router();
registerProfileOpenApi();

route.put("/", requireAuth, UpdateProfileHandler);

export default route;
