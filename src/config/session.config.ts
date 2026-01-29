import { RedisStore } from "connect-redis";
import session from "express-session";
import { redisClient } from "./redisClient.js";

export const sessionConfig = session({
  store: new RedisStore({ client: redisClient, ttl: 60 * 60 * 24 }),
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax",
  },
});
