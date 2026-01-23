import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  <T>(schema: ZodType<T>, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        code: "VALIDATION_ERROR",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[property] = result.data as T;
    next();
  };
