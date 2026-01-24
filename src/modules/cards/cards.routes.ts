import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  CreateCardHandler,
  DeleteCardHandler,
  GetCardHandler,
  GetCardsHandler,
  UpdateCardHandler,
} from "./cards.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { CreateCardSchema, UpdateCardSchema } from "./cards.schema.js";
import { registerCardsOpenApi } from "./cards.openapi.js";
import { TableRole } from "../../generated/prisma/enums.js";
import {
  accessByTable,
  resolveTableFromCard,
  resolveTableFromColumn,
} from "../../middleware/accessByTable.middleware.js";

const router = Router();
registerCardsOpenApi();

router.get(
  "/:column_id",
  accessByTable(resolveTableFromColumn, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  requireAuth,
  GetCardsHandler,
);
router.get(
  "/:column_id/:id",
  accessByTable(resolveTableFromColumn, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  requireAuth,
  GetCardHandler,
);

router.post(
  "/:column_id",
  requireAuth,
  accessByTable(resolveTableFromColumn, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  validate(CreateCardSchema, "body"),
  CreateCardHandler,
);

router.put(
  "/:id",
  requireAuth,
  accessByTable(resolveTableFromCard, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  validate(UpdateCardSchema, "body"),
  UpdateCardHandler,
);

router.delete(
  "/:id",
  requireAuth,
  accessByTable(resolveTableFromCard, [
    TableRole.OWNER,
    TableRole.EDITOR,
    TableRole.VIEWER,
  ]),
  DeleteCardHandler,
);

export default router;
