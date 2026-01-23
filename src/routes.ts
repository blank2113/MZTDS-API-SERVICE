import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import UsersRoutes from "./modules/users/users.routes.js";
import TablesRoutes from "./modules/tables/tables.routes.js";
import ColumnsRoutes from "./modules/columns/columns.routes.js";
import CardsRoutes from "./modules/cards/cards.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/tables", TablesRoutes);
router.use("/users", UsersRoutes);
router.use("/columns", ColumnsRoutes);
router.use("/cards", CardsRoutes);

export default router;
