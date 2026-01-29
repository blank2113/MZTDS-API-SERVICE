import { Request, Response } from "express";
import { catchAsync } from "../../utils/helper.js";
import { redisClient } from "../../config/redisClient.js";

export const GetUserSessionsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const targetUserId = Number(req.params.user_id);
    const sessionsKey = `user_sessions:${targetUserId}`;
    const sessionIds = await redisClient.zRange(sessionsKey, 0, -1);

    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        if (id === req.sessionID) return null;
        const sess = await redisClient.get(`sess:${id}`);
        return sess ? { sessionId: id, ...JSON.parse(sess) } : null;
      }),
    );

    res.status(200).json({ sessions: sessions.filter(Boolean) });
  },
);

export const LogoutUserSessionHandler = catchAsync(
  async (req: Request, res: Response) => {
    const targetUserId = Number(req.params.user_id);
    let sessionId = req.params.session_id;

    if (Array.isArray(sessionId)) sessionId = sessionId[0];

    const sessionsKey = `user_sessions:${targetUserId}`;
    const isMember = await redisClient.zScore(sessionsKey, sessionId);

    if (!isMember)
      return res.status(404).json({ message: "Session not found" });

    await Promise.all([
      redisClient.del(`sess:${sessionId}`),
      redisClient.zRem(sessionsKey, sessionId),
    ]);

    res.status(200).json({ message: "Session deleted" });
  },
);

export const LogoutAllUserSessionsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const targetUserId = Number(req.params.userId);
    const sessionsKey = `user_sessions:${targetUserId}`;
    const sessionIds = await redisClient.zRange(sessionsKey, 0, -1);

    await Promise.all(sessionIds.map((id) => redisClient.del(`sess:${id}`)));
    await redisClient.del(sessionsKey);

    res.status(200).json({ message: "All sessions deleted for user" });
  },
);

export const GetAllUserSessionsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userKeys = await redisClient.keys("user_sessions:*");

    const allSessions = await Promise.all(
      userKeys.map(async (key) => {
        const userId = Number(key.split(":")[1]);
        const sessionIds = await redisClient.zRange(key, 0, -1);

        const sessions = await Promise.all(
          sessionIds.map(async (id) => {
            if (id === req.sessionID) return null;
            const sess = await redisClient.get(`sess:${id}`);
            if (!sess) return null;

            const sessionData = JSON.parse(sess);
            if (sessionData.role === "ADMIN") return null;
            return { sessionId: id, ...sessionData };
          }),
        );

        return {
          userId,
          sessions: sessions.filter(Boolean),
        };
      }),
    );

    // Исключаем пользователей без сессий (например, только админы)
    const filteredUsers = allSessions.filter((u) => u.sessions.length > 0);

    res.status(200).json({ users: filteredUsers });
  },
);
