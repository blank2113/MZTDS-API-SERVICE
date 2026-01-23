import { NextFunction, Request, Response } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.role || req.session.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });
  next();
};
