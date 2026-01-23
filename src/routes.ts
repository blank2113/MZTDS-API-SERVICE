import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import UsersRoutes from "./modules/users/users.routes.js";
import TablesRoutes from "./modules/tables/tables.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/tables", TablesRoutes);
router.use("/users", UsersRoutes);

export default router;
