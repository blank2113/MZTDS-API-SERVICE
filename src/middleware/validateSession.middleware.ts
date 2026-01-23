import type { Request, Response, NextFunction } from "express";

export const requireSession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session || !req.session.user_id) {
    return res.status(401).json({
      error: "Unauthorized: session missing",
    });
  }
  next();
};
