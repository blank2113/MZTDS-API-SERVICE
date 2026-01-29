import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../types/common.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error("🔥 UNHANDLED ERROR:", err);

  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
};
