import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import {
  createColumn,
  deleteColumn,
  getColumn,
  getColumns,
  updateColumn,
} from "./columns.service.js";

export const CreateColumnHandler = catchAsync(
  async (req: Request, res: Response) => {
    const table_id = Number(req.params.table_id as string);
    const result = await createColumn(table_id, req.body);

    res.status(201).json(result);
  },
);

export const UpdateColumnHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await updateColumn(id, req.body);

    res.status(201).json(result);
  },
);
export const DeleteColumnHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await deleteColumn(id);

    res.status(201).json({ message: `Column ${result.id} was deleted` });
  },
);

export const GetColumnsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const table_id = Number(req.params.table_id as string);
    const result = await getColumns(table_id);

    res.status(200).json(result);
  },
);

export const GetColumnHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await getColumn(id);

    res.status(200).json(result);
  },
);
