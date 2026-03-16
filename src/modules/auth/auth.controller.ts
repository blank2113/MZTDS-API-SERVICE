import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { RegisterDTO, registerSchema } from "./auth.schema.js";
import { create, getMe, login, resetPassword } from "./auth.service.js";
import { redisClient } from "../../config/redisClient.js";

const MAX_SESSIONS = 3;

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
    const user = await login({ email, password });
    req.session.user_id = user.id;
    req.session.role = user.role;
    req.session.ip = req.ip;
    req.session.device = req.headers["user-agent"] || "unknown";

    const sessionId = req.sessionID;
    const sessionsKey = `user_sessions:${user.id}`;

    // Лимит сессий
    const sessionsCount = await redisClient.zCard(sessionsKey);
    if (sessionsCount >= MAX_SESSIONS) {
      const [oldest] = await redisClient.zRange(sessionsKey, 0, 0);
      if (oldest) {
        await Promise.all([
          redisClient.del(`sess:${oldest}`),
          redisClient.zRem(sessionsKey, oldest),
        ]);
      }
    }

    await redisClient.zAdd(sessionsKey, {
      score: Date.now(),
      value: sessionId,
    });

    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.status(200).json({ message: "Logged in!" });
    });
  },
);

export const LogoutUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sessionId = req.sessionID;
    const sessionsKey = `user_sessions:${userId}`;

    await Promise.all([
      redisClient.del(`sess:${sessionId}`),
      redisClient.zRem(sessionsKey, sessionId),
    ]);

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed!" });
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out!" });
    });
  },
);

export const LogoutSessionHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.user_id;
    let sessionId = req.params.session_id;

    if (Array.isArray(sessionId)) sessionId = sessionId[0];

    const sessionsKey = `user_sessions:${userId}`;
    const isMember = await redisClient.zScore(sessionsKey, sessionId);
    if (!isMember)
      return res.status(404).json({ message: "Session not found" });

    await Promise.all([
      redisClient.del(`sess:${sessionId}`),
      redisClient.zRem(sessionsKey, sessionId),
    ]);

    // Если это текущая сессия — корректно завершаем её
    if (sessionId === req.sessionID) {
      req.session.destroy(() => {});
      res.clearCookie("connect.sid");
      return res
        .status(200)
        .json({ message: "Current session logged out", current: true });
    }

    res.status(200).json({ message: "Session logged out", current: false });
  },
);

export const LogoutAllHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const sessionsKey = `user_sessions:${userId}`;
    const sessionIds = await redisClient.zRange(sessionsKey, 0, -1);

    await Promise.all(sessionIds.map((id) => redisClient.del(`sess:${id}`)));
    await redisClient.del(sessionsKey);

    req.session.destroy(() => {});
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out from all devices!" });
  },
);

export const GetSessionsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.session.user_id;

    const sessionsKey = `user_sessions:${userId}`;
    const sessionIds = await redisClient.zRange(sessionsKey, 0, -1);

    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        const sess = await redisClient.get(`sess:${id}`);
        return sess ? JSON.parse(sess) : null;
      }),
    );

    res.status(200).json({ sessions: sessions.filter(Boolean) });
  },
);

export const getMeHandler = catchAsync(async (req: Request, res: Response) => {
  const userId = req.session.user_id;
  const user = await getMe(userId);
  res.status(200).json({ user });
});

export const ResetPasswordHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    const result = await resetPassword(email, newPassword);
    res
      .status(200)
      .json({ message: "Password reset successfully", user: result });
  },
);
