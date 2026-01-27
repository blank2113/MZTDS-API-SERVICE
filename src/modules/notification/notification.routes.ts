import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { CreateNotificationHandler } from "./notification.controller.js";
import { registerNotificationOpenApi } from "./notification.openapi.js";

const route = Router();
registerNotificationOpenApi();
route.post("/:table_id", requireAuth, CreateNotificationHandler);

export default route;
