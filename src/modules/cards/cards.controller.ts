import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import {
  createCard,
  deleteCard,
  getCard,
  getCards,
  updateCard,
} from "./cards.service.js";

export const CreateCardHandler = catchAsync(
  async (req: Request, res: Response) => {
    const column_id = Number(req.params.column_id as string);
    const result = await createCard(column_id, req.body);

    res.status(201).json(result);
  },
);

export const UpdateCardHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await updateCard(id, req.body);

    res.status(201).json(result);
  },
);
export const DeleteCardHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await deleteCard(id);

    res.status(201).json({ message: `Card ${result.id} was deleted` });
  },
);

export const GetCardsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.column_id as string);
    const result = await getCards(id);
    res.status(200).json(result);
  },
);

export const GetCardHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id as string);
    const result = await getCard(id);

    res.status(200).json(result);
  },
);
