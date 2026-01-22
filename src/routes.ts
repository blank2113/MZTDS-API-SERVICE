import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;
