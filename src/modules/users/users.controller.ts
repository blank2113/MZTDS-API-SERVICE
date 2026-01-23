import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import {
  addUserToTable,
  deleteUserFromTable,
  getTableUser,
  getTableUsers,
} from "./users.service.js";

export const GetTableUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const table_id = Number(req.params.table_id);
    const user_id = Number(req.params.user_id);
    const result = await getTableUser({ table_id, user_id });
    res.status(200).json(result);
  },
);

export const GetTableUsersHandler = catchAsync(
  async (req: Request, res: Response) => {
    const table_id = Number(req.params.table_id);
    const result = await getTableUsers(table_id);
    res.status(200).json(result);
  },
);

export const AddUserToTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await addUserToTable(req.body);
    res.status(200).json({ message: "User added successfully", data: result });
  },
);

export const DeleteUserFromTableHandler = catchAsync(
  async (req: Request, res: Response) => {
    const table_id = Number(req.params.table_id);
    const user_id = Number(req.params.user_id);
    const owner_id = Number(req.params.owner_id);
    const result = await deleteUserFromTable({ table_id, user_id, owner_id });
    res.status(200).json(result);
  },
);
