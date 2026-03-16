import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  CreateNotificationHandler,
  TgLinkHandler,
} from "./notification.controller.js";
import { registerNotificationOpenApi } from "./notification.openapi.js";
import {
  notificationBodySchema,
  notificationParamsSchema,
} from "./notification.schema.js";

const route = Router();
registerNotificationOpenApi();
route.get("/tg_link", requireAuth, TgLinkHandler);
route.post(
  "/:table_id",
  requireAuth,
  validate(notificationParamsSchema, "params"),
  validate(notificationBodySchema, "body"),
  CreateNotificationHandler,
);

export default route;
