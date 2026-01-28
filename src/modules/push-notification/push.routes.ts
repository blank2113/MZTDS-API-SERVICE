import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { registerFcmToken, sendNotification } from "./push.controller.js";
import { registerPushOpenApi } from "./push.openapi.js";

const router = Router();
registerPushOpenApi();
router.post("/register", requireAuth, registerFcmToken);
router.post("/send", requireAuth, sendNotification);

export default router;
