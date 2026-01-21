import "express-session";
import { Roles } from "../generated/prisma/enums";

declare module "express-session" {
  interface SessionData {
    user_id?: number;
    role?: Roles;
  }
}
