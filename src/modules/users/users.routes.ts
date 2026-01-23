import { Router } from "express";
import { tableAccess } from "../../middleware/tableRole.middlewate.js";
import { TableRole } from "../../generated/prisma/enums.js";
import {
  AddUserToTableHandler,
  DeleteUserFromTableHandler,
  GetTableUserHandler,
  GetTableUsersHandler,
} from "./users.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { registerUsersOpenApi } from "./users.openapi.js";
import { CreateTableHandler } from "../tables/tables.controller.js";
import { validate } from "../../middleware/validate.moddleware.js";
import {
  AddUserToTableSchema,
  DeleteUserFromTableSchema2,
  GetTablesUserSchema,
  GetTableUserSchema2,
} from "./users.schema.js";

const router = Router();
registerUsersOpenApi();

router.get(
  "/:table_id",
  requireAuth,
  tableAccess([TableRole.OWNER, TableRole.EDITOR, TableRole.VIEWER]),
  validate(GetTablesUserSchema, "params"),
  GetTableUsersHandler,
);

router.get(
  "/:table_id/:user_id",
  requireAuth,
  tableAccess([TableRole.OWNER, TableRole.EDITOR, TableRole.VIEWER]),
  validate(GetTableUserSchema2, "params"),
  GetTableUserHandler,
);

router.post(
  "/",
  requireAuth,
  tableAccess([TableRole.OWNER, TableRole.EDITOR]),
  validate(AddUserToTableSchema, "body"),
  AddUserToTableHandler,
);

router.delete(
  "/:table_id/:owner_id/:user_id",
  requireAuth,
  tableAccess([TableRole.OWNER]),
  validate(DeleteUserFromTableSchema2, "params"),
  DeleteUserFromTableHandler,
);

router.post("/", requireAuth, CreateTableHandler);

export default router;
