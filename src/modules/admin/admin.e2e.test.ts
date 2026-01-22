import request from "supertest";
import { app } from "../../app.js"; // твой Express app
import { redisClient } from "../../redisClient.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

describe("Admin sessions API", () => {
  let adminCookie: string;
  let userCookie: string;
  let userId: number;

  beforeAll(async () => {
    // Создаем админа, если нет
    await redisClient.connect();
    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        password: await bcrypt.hash("adminpass", 10),
        role: "ADMIN",
        name: "Admin Test",
      },
    });
    console.log(admin);

    // Создаем обычного пользователя
    const user = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        email: "user@example.com",
        password: "userpass",
        role: "USER",
        name: "User Test",
      },
    });
    userId = user.id;

    // Логиним админа
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@example.com", password: "adminpass" });

    adminCookie = adminRes.headers["set-cookie"][0];

    // Логиним обычного пользователя
    const userRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@example.com", password: "userpass" });

    userCookie = userRes.headers["set-cookie"][0];

    // Создаем несколько сессий для пользователя
    await request(app)
      .post("/api/v1/auth/login")
      .set("Cookie", userCookie)
      .send({ email: "user@example.com", password: "userpass" });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["admin@example.com", "user@example.com"] } },
    });

    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));
    await redisClient.quit();
  });

  it("GET /admin/sessions/:userId - admin gets user sessions", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.sessions.length).toBeGreaterThan(0);
    res.body.sessions.forEach((s: any) => {
      expect(s.role).not.toBe("ADMIN"); // админская сессия не включается
    });
  });

  it("DELETE /admin/sessions/:userId/:sessionId - admin deletes user session", async () => {
    // Берем первую сессию пользователя
    const sessionsRes = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);

    const sessionId = sessionsRes.body.sessions[0].sessionId;

    const res = await request(app)
      .delete(`/api/v1/admin/sessions/${userId}/${sessionId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Session deleted");
  });

  it("DELETE /admin/sessions/:userId - admin deletes all user sessions", async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("All sessions deleted for user");

    // Проверим что сессий нет
    const check = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);

    expect(check.body.sessions.length).toBe(0);
  });

  it("GET /admin/sessions - admin gets all users sessions excluding admins", async () => {
    // Создаем еще пару пользователей и сессий
    const anotherRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user2@example.com", password: "user2pass" });
    console.log(anotherRes);

    const res = await request(app)
      .get("/api/v1/admin/sessions")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeInstanceOf(Array);
    res.body.users.forEach((u: any) => {
      u.sessions.forEach((s: any) => {
        expect(s.role).not.toBe("ADMIN");
      });
    });
  });

  it("Non-admin should get 403", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", userCookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });
});
