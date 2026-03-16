import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { redisClient } from "../config/redisClient.js";

let io: Server | null = null;

const parseAllowedOrigins = (): string[] => {
  const value = process.env.ALLOWED_ORIGINS;
  if (!value) {
    return ["*"];
  }

  const origins = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return origins.length ? origins : ["*"];
};

export const tableRoom = (tableId: number | string): string =>
  `table:${tableId}`;

export const userRoom = (userId: number | string): string => `user:${userId}`;

const safeToNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value);
  }

  return null;
};

const parseCookies = (header: string | undefined): Record<string, string> => {
  if (!header) {
    return {};
  }

  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const index = pair.indexOf("=");
      if (index === -1) {
        return acc;
      }

      const key = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
};

const getSessionUserId = async (socket: Socket): Promise<number | null> => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const rawCookie = cookies["connect.sid"];
    if (!rawCookie) {
      return null;
    }

    const decoded = decodeURIComponent(rawCookie);
    const unsigned = decoded.startsWith("s:") ? decoded.slice(2) : decoded;
    const sessionId = unsigned.split(".")[0]?.trim();

    if (!sessionId) {
      return null;
    }

    const sessionRaw = await redisClient.get(`sess:${sessionId}`);
    if (!sessionRaw) {
      return null;
    }

    const sessionData = JSON.parse(sessionRaw) as {
      user_id?: unknown;
    };

    return safeToNumber(sessionData.user_id);
  } catch {
    return null;
  }
};

const getHandshakeUserId = (socket: Socket): number | null => {
  const auth = socket.handshake.auth as {
    userId?: unknown;
    tableIds?: unknown;
  };

  const query = socket.handshake.query as {
    userId?: unknown;
    tableIds?: unknown;
  };

  return safeToNumber(auth.userId ?? query.userId);
};

const resolveSocketUserId = async (socket: Socket): Promise<number | null> => {
  const sessionUserId = await getSessionUserId(socket);
  if (sessionUserId) {
    return sessionUserId;
  }

  if (process.env.NODE_ENV !== "production") {
    return getHandshakeUserId(socket);
  }

  return null;
};

const isTableMember = async (
  userId: number,
  tableId: number,
): Promise<boolean> => {
  const membership = await prisma.userToTable.findUnique({
    where: {
      user_id_table_id: {
        user_id: userId,
        table_id: tableId,
      },
    },
    select: { user_id: true },
  });

  return Boolean(membership);
};

const emitRealtimeError = (
  socket: Socket,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): void => {
  socket.emit("realtime.error", {
    code,
    message,
    ...details,
  });
};

const parseInitialTableIds = (socket: Socket): number[] => {
  const auth = socket.handshake.auth as {
    tableIds?: unknown;
  };

  const query = socket.handshake.query as {
    tableIds?: unknown;
  };

  const rawTableIds = auth.tableIds ?? query.tableIds;
  let tableIds: number[] = [];

  if (Array.isArray(rawTableIds)) {
    tableIds = rawTableIds
      .map((item) => safeToNumber(item))
      .filter((item): item is number => item !== null);
  } else if (typeof rawTableIds === "string") {
    tableIds = rawTableIds
      .split(",")
      .map((item) => safeToNumber(item))
      .filter((item): item is number => item !== null);
  }

  return tableIds;
};

const joinInitialRooms = async (
  socket: Socket,
  userId: number | null,
): Promise<void> => {
  if (!userId) {
    return;
  }

  socket.join(userRoom(userId));

  const tableIds = parseInitialTableIds(socket);

  for (const tableId of tableIds) {
    const allowed = await isTableMember(userId, tableId);
    if (!allowed) {
      emitRealtimeError(
        socket,
        "TABLE_ACCESS_DENIED",
        "You do not have access to this table room",
        { tableId },
      );
      continue;
    }

    socket.join(tableRoom(tableId));
  }
};

export const initRealtimeServer = (httpServer: HttpServer): Server => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: parseAllowedOrigins(),
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    const userId = await resolveSocketUserId(socket);
    socket.data.userId = userId;

    await joinInitialRooms(socket, userId);

    socket.on("subscribe.table", async (tableId: number | string) => {
      const parsed = safeToNumber(tableId);
      if (!parsed) {
        emitRealtimeError(socket, "INVALID_TABLE_ID", "Invalid table id", {
          tableId,
        });
        return;
      }

      const currentUserId = safeToNumber(socket.data.userId);
      if (!currentUserId) {
        emitRealtimeError(
          socket,
          "UNAUTHORIZED",
          "Authentication required for table subscription",
        );
        return;
      }

      const allowed = await isTableMember(currentUserId, parsed);
      if (!allowed) {
        emitRealtimeError(
          socket,
          "TABLE_ACCESS_DENIED",
          "You do not have access to this table room",
          { tableId: parsed },
        );
        return;
      }

      socket.join(tableRoom(parsed));
      socket.emit("subscribed.table", { tableId: parsed });
    });

    socket.on("unsubscribe.table", (tableId: number | string) => {
      const parsed = safeToNumber(tableId);
      if (!parsed) {
        return;
      }

      socket.leave(tableRoom(parsed));
    });

    socket.on("subscribe.user", (userId: number | string) => {
      const parsed = safeToNumber(userId);
      if (!parsed) {
        return;
      }

      const currentUserId = safeToNumber(socket.data.userId);
      if (!currentUserId || currentUserId !== parsed) {
        emitRealtimeError(
          socket,
          "USER_ACCESS_DENIED",
          "You can only subscribe to your own user room",
          { userId: parsed },
        );
        return;
      }

      socket.join(userRoom(parsed));
      socket.emit("subscribed.user", { userId: parsed });
    });

    socket.on("unsubscribe.user", (userId: number | string) => {
      const parsed = safeToNumber(userId);
      if (!parsed) {
        return;
      }

      const currentUserId = safeToNumber(socket.data.userId);
      if (currentUserId && currentUserId !== parsed) {
        emitRealtimeError(
          socket,
          "USER_ACCESS_DENIED",
          "You can only unsubscribe from your own user room",
          { userId: parsed },
        );
        return;
      }

      socket.leave(userRoom(parsed));
    });

    socket.on("ping", () => {
      socket.emit("pong", { ts: Date.now() });
    });
  });

  console.log("✅ Realtime socket server started");
  return io;
};

export const emitTableEvent = (
  tableId: number | string,
  event: string,
  payload: unknown,
): void => {
  if (!io) {
    return;
  }

  io.to(tableRoom(tableId)).emit(event, payload);
};

export const emitUserEvent = (
  userId: number | string,
  event: string,
  payload: unknown,
): void => {
  if (!io) {
    return;
  }

  io.to(userRoom(userId)).emit(event, payload);
};

export const emitGlobalEvent = (event: string, payload: unknown): void => {
  if (!io) {
    return;
  }

  io.emit(event, payload);
};
