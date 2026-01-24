import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { TableRole } from "../../generated/prisma/enums.js";
import {
  CreateTableHandler,
  DeleteTableHandler,
  GetTableHandler,
  GetTablesHandler,
  UpdateTableHandler,
} from "./tables.controller.js";
import { registerTablesOpenApi } from "./tables.openapi.js";
import { validate } from "../../middleware/validate.middleware.js";
import { TableIdParamSchema, UpdateTableSchema } from "./tables.schema.js";
import {
  accessByTable,
  resolveTableFromTable,
} from "../../middleware/accessByTable.middleware.js";

const router = Router();
registerTablesOpenApi();

router.get("/", requireAuth, GetTablesHandler);

router.get(
  "/:table_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  validate(TableIdParamSchema, "params"),
  GetTableHandler,
);

router.post("/", requireAuth, CreateTableHandler);

router.put(
  "/:table_id",
  requireAuth,
  accessByTable(resolveTableFromTable, [TableRole.OWNER, TableRole.EDITOR]),
  validate(TableIdParamSchema, "params"),
  validate(UpdateTableSchema),
  UpdateTableHandler,
);

router.delete(
  "/:table_id",
  requireAuth,
  validate(TableIdParamSchema, "params"),
  accessByTable(resolveTableFromTable, [TableRole.OWNER]),
  DeleteTableHandler,
);

export default router;
