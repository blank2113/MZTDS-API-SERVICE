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
import { columnAccess } from "../../middleware/columnRole.middleware.js";
import { TableRole } from "../../generated/prisma/enums.js";
import { cardAccess } from "../../middleware/cardAccess.middleware.js";

const router = Router();
registerCardsOpenApi();

router.get(
  "/:column_id",
  columnAccess([TableRole.EDITOR, TableRole.OWNER, TableRole.VIEWER]),
  requireAuth,
  GetCardsHandler,
);
router.get(
  "/:column_id/:id",
  columnAccess([TableRole.EDITOR, TableRole.OWNER, TableRole.VIEWER]),
  requireAuth,
  GetCardHandler,
);

router.post(
  "/:column_id",
  requireAuth,
  columnAccess([TableRole.EDITOR, TableRole.OWNER, TableRole.VIEWER]),
  validate(CreateCardSchema, "body"),
  CreateCardHandler,
);

router.put(
  "/:id",
  requireAuth,
  cardAccess([TableRole.EDITOR, TableRole.OWNER]),
  validate(UpdateCardSchema, "body"),
  UpdateCardHandler,
);

router.delete(
  "/:id",
  requireAuth,
  cardAccess([TableRole.EDITOR, TableRole.OWNER]),
  DeleteCardHandler,
);

export default router;
