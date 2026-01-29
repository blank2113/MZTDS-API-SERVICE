import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../config/redisClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

describe("Admin sessions API", () => {
  let adminCookie: string;
  let userCookie: string;
  let userId: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: number;

  beforeAll(async () => {
    await redisClient.connect();

    // уникальные email и name
    const adminEmail = `admin_${crypto.randomUUID()}@mail.com`;
    const userEmail = `user_${crypto.randomUUID()}@mail.com`;

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash("adminpass", 10),
        role: "ADMIN",
        name: `Admin_${crypto.randomUUID()}`,
      },
    });
    adminId = admin.id;

    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: await bcrypt.hash("userpass", 10),
        role: "USER",
        name: `User_${crypto.randomUUID()}`,
      },
    });
    userId = user.id;

    const loginAdmin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: adminEmail, password: "adminpass" });
    adminCookie = loginAdmin.headers["set-cookie"]?.[0];
    if (!adminCookie) throw new Error("Admin login failed");

    const loginUser = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password: "userpass" });
    userCookie = loginUser.headers["set-cookie"]?.[0];
    if (!userCookie) throw new Error("User login failed");

    // создаем дополнительную сессию для пользователя
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password: "userpass" })
      .set("Cookie", userCookie);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "user_" } } });
    await prisma.user.deleteMany({ where: { email: { contains: "admin_" } } });

    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));
    await redisClient.quit();
    await prisma.$disconnect();
  });

  it("GET /admin/sessions/:user_id - admin gets user sessions", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.sessions.length).toBeGreaterThan(0);
    res.body.sessions.forEach((s: any) => expect(s.role).not.toBe("ADMIN"));
  });

  it("DELETE /admin/sessions/:session_id - admin deletes user session", async () => {
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

    const check = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", adminCookie);
    expect(check.body.sessions.length).toBe(0);
  });

  it("Non-admin should get 403", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/sessions/${userId}`)
      .set("Cookie", userCookie);
    expect(res.status).toBe(401);
  });
});
