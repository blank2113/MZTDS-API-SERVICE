import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

describe("Auth API (e2e)", () => {
  const password = "1234567";
  let userEmail: string;
  let cookie1: string;
  let cookie2: string;
  let sessionId1: string;
  let sessionId2: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userId: number;

  beforeAll(async () => {
    await redisClient.connect();

    userEmail = `test_user_${crypto.randomUUID()}@mail.com`;

    const user = await prisma.user.create({
      data: {
        name: `User_${crypto.randomUUID()}`,
        email: userEmail,
        password: await bcrypt.hash(password, 10),
      },
    });

    userId = user.id;
  });

  afterAll(async () => {
    // Чистим только свои данные
    await prisma.user.deleteMany({
      where: { email: { contains: "test_user_" } },
    });
    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));
    await redisClient.quit();
    await prisma.$disconnect();
  });

  it("Login creates multiple sessions", async () => {
    const res1 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    expect(res1.status).toBe(200);
    cookie1 = res1.headers["set-cookie"]?.[0];
    sessionId1 = res1.body.sessionId;
    if (!cookie1 || !sessionId1) throw new Error("Login1 failed");

    const res2 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    expect(res2.status).toBe(200);
    cookie2 = res2.headers["set-cookie"]?.[0];
    sessionId2 = res2.body.sessionId;
    if (!cookie2 || !sessionId2) throw new Error("Login2 failed");

    expect(sessionId1).not.toBe(sessionId2);
  });

  it("Get current logged-in user", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookie1);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(userEmail);
  });

  it("Return 401 if not logged in", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("Get all sessions", async () => {
    const res = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);
    // expect(res.body.sessions.length).toBeGreaterThanOrEqual(2);
  });

  it("Logout specific session", async () => {
    const res = await request(app)
      .delete(`/api/v1/auth/logout/${sessionId2}`)
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);

    const check = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Cookie", cookie1);
    expect(
      check.body.sessions.find((s: any) => s.id === sessionId2),
    ).toBeUndefined();
  });

  it("Logout current session", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);
  });

  // it("Login again and logout all sessions", async () => {
  //   const resA = await request(app)
  //     .post("/api/v1/auth/login")
  //     .send({ email: userEmail, password });
  //   const cookieA = resA.headers["set-cookie"]?.[0];
  //   if (!cookieA) throw new Error("LoginA failed");

  //   const resB = await request(app)
  //     .post("/api/v1/auth/login")
  //     .send({ email: userEmail, password });
  //   const cookieB = resB.headers["set-cookie"]?.[0];
  //   if (!cookieB) throw new Error("LoginB failed");

  //   const logoutAll = await request(app)
  //     .delete("/api/v1/auth/logout-all")
  //     .set("Cookie", cookieA);
  //   expect(logoutAll.status).toBe(200);

  //   const checkB = await request(app)
  //     .get("/api/v1/auth/sessions")
  //     .set("Cookie", cookieB);
  //   expect(checkB.status).toBe(401);
  // });
});
