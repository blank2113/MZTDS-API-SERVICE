import "express-session";
import { Roles } from "../generated/prisma/enums.js";

declare module "express-session" {
  interface SessionData {
    user_id?: number;
    role?: Roles;
  }
}
