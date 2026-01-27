import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import UsersRoutes from "./modules/users/users.routes.js";
import TablesRoutes from "./modules/tables/tables.routes.js";
import ColumnsRoutes from "./modules/columns/columns.routes.js";
import CardsRoutes from "./modules/cards/cards.routes.js";
import ProfileRoutes from "./modules/profile/profile.routes.js";
import TgLinkRoutes from "./modules/TgLink/TgLink.routes.js";
import NotificationRoutes from "./modules/notification/notification.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/tables", TablesRoutes);
router.use("/users", UsersRoutes);
router.use("/columns", ColumnsRoutes);
router.use("/cards", CardsRoutes);
router.use("/profile", ProfileRoutes);
router.use("/tg_link", TgLinkRoutes);
router.use("/notification", NotificationRoutes);

export default router;
