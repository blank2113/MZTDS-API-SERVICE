import "express-session";
import { Roles } from "../generated/prisma/enums.js";

declare module "express-session" {
  interface SessionData {
    user_id?: number;
    role?: Roles;
    device?: string;
    ip?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      table?: {
        id: number;
        role: TableRole;
        owner_id: number;
      };
    }
  }
}
