import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { TgLinkHandler } from "./TgLink.controller.js";
import { registerTgLinkOpenApi } from "./TgLink.openapi.js";

const route = Router();

registerTgLinkOpenApi();
route.get("/", requireAuth, TgLinkHandler);

export default route;
