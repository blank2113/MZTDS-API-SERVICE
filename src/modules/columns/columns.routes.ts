import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { TableRole } from "../../generated/prisma/enums.js";
import {
  CreateColumnHandler,
  DeleteColumnHandler,
  GetColumnHandler,
  GetColumnsHandler,
  UpdateColumnHandler,
} from "./columns.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { CreateColumnSchema, UpdateColumnSchema } from "./columns.schema.js";
import { registerColumnsOpenApi } from "./columns.openapi.js";
import {
  accessByTable,
  resolveTableFromColumn,
  resolveTableFromTable,
} from "../../middleware/accessByTable.middleware.js";

const router = Router();
registerColumnsOpenApi();

router.get(
  "/:table_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  GetColumnsHandler,
);

router.get(
  "/:table_id/:id",
  requireAuth,
  accessByTable(resolveTableFromTable, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  GetColumnHandler,
);

router.post(
  "/:table_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [TableRole.OWNER, TableRole.EDITOR]),
  validate(CreateColumnSchema, "body"),
  CreateColumnHandler,
);

router.put(
  "/:id",
  requireAuth,
  accessByTable(resolveTableFromColumn, [TableRole.OWNER, TableRole.EDITOR]),
  validate(UpdateColumnSchema, "body"),
  UpdateColumnHandler,
);

router.delete(
  "/:id",
  requireAuth,
  accessByTable(resolveTableFromColumn, [TableRole.OWNER, TableRole.EDITOR]),
  DeleteColumnHandler,
);

export default router;
