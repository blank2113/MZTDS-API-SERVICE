import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { RegisterDTO, registerSchema } from "./auth.schema.js";
import { create, login } from "./auth.service.js";

export const CreateUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const dto: RegisterDTO = registerSchema.parse(req.body);
    const result = await create(dto);
    res.status(201).json(result);
  },
);

export const LoginUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    const user = await login({ email, password });
    if (!user.id)
      return res.status(401).json({ message: "Invalid credentials" });

    req.session.user_id = user.id;
    req.session.role = user.role;
    res.status(200).json({ message: "Logged in!" });
  },
);

export const LogoutUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed!" });
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out!" });
    });
  },
);

// export const getMeHandler = catchAsync(async (req: Request, res: Response) => {
//   return;
// });
