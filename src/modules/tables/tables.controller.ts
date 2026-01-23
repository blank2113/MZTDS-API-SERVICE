import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import {
  createTable,
  deleteTable,
  getTable,
  getTables,
  updateTable,
} from "./tables.service.js";
import {
  CreateTableDTO,
  CreateTableSchema,
  UpdateTableDTO,
  UpdateTableSchema,
} from "./tables.schema.js";

export const GetTablesHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const result = await getTables(user_id);

    res.status(200).json(result);
  },
);

export const GetTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const table_id = Number(req.params.table_id);
    const result = await getTable(user_id, table_id);

    res.status(200).json(result);
  },
);

export const CreateTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const data: CreateTableDTO = CreateTableSchema.parse(req.body);
    const result = await createTable(user_id, data);

    res.status(201).json(result);
  },
);

export const UpdateTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const table_id = Number(req.params.table_id);
    const data: UpdateTableDTO = UpdateTableSchema.parse(req.body);
    const result = await updateTable(user_id, table_id, data);

    res.status(201).json(result);
  },
);

export const DeleteTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = Number(req.session.user_id);
    const table_id = Number(req.params.table_id);
    const result = await deleteTable(user_id, table_id);

    res.status(201).json({ message: `Table ${result.id} was deleted` });
  },
);
