import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { tableAccess } from "../../middleware/tableRole.middleware.js";
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
import { columnAccess } from "../../middleware/columnRole.middleware.js";

const router = Router();
registerColumnsOpenApi();

router.get(
  "/:table_id",
  requireAuth,
  tableAccess([TableRole.EDITOR, TableRole.OWNER, TableRole.VIEWER]),
  GetColumnsHandler,
);

router.get(
  "/:table_id/:id",
  requireAuth,
  tableAccess([TableRole.EDITOR, TableRole.OWNER, TableRole.VIEWER]),
  GetColumnHandler,
);

router.post(
  "/:table_id",
  requireAuth,
  tableAccess([TableRole.EDITOR, TableRole.OWNER]),
  validate(CreateColumnSchema, "body"),
  CreateColumnHandler,
);

router.put(
  "/:id",
  requireAuth,
  columnAccess([TableRole.EDITOR, TableRole.OWNER]),
  validate(UpdateColumnSchema, "body"),
  UpdateColumnHandler,
);

router.delete(
  "/:id",
  requireAuth,
  columnAccess([TableRole.EDITOR, TableRole.OWNER]),
  DeleteColumnHandler,
);

export default router;
