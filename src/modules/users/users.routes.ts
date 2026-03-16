import { Router } from "express";

import { TableRole } from "../../generated/prisma/enums.js";
import {
  AddUserToTableHandler,
  DeleteUserFromTableHandler,
  GetAllUserInSystemHandler,
  GetTableUserHandler,
  GetTableUsersHandler,
  UpdateProfileHandler,
} from "./users.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { registerUsersOpenApi } from "./users.openapi.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  AddUserToTableSchema,
  DeleteUserFromTableSchema2,
  GetTablesUserSchema,
  GetTableUserSchema2,
} from "./users.schema.js";
import {
  accessByTable,
  resolveTableFromTable,
} from "../../middleware/accessByTable.middleware.js";

const router = Router();
registerUsersOpenApi();

router.get(
  "/:table_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  validate(GetTablesUserSchema, "params"),
  GetTableUsersHandler,
);

router.get(
  "/:table_id/:user_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  validate(GetTableUserSchema2, "params"),
  GetTableUserHandler,
);

router.post(
  "/",
  requireAuth,
  accessByTable(resolveTableFromTable, [TableRole.OWNER, TableRole.EDITOR]),
  validate(AddUserToTableSchema, "body"),
  AddUserToTableHandler,
);

router.delete(
  "/:table_id/:owner_id/:user_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [TableRole.OWNER, TableRole.EDITOR]),
  validate(DeleteUserFromTableSchema2, "params"),
  DeleteUserFromTableHandler,
);

router.get("/", requireAuth, GetAllUserInSystemHandler);

router.put("/", requireAuth, UpdateProfileHandler);

export default router;
