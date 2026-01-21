import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";

describe("Auth API (e2e)", () => {
  const password = "123456";
  let userEmail: string;
  let cookie1: string;
  let cookie2: string;
  let sessionId1: string;
  let sessionId2: string;

  beforeAll(async () => {
    userEmail = `test_${crypto.randomUUID()}@mail.com`;
    await redisClient.connect();

    // Регистрация пользователя
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: userEmail,
      password,
    });
  });

  it("Login creates multiple sessions", async () => {
    // Первая сессия
    const res1 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    expect(res1.status).toBe(200);
    cookie1 = res1.headers["set-cookie"]?.[0];
    sessionId1 = res1.body.sessionId;

    // Вторая сессия
    const res2 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    expect(res2.status).toBe(200);
    cookie2 = res2.headers["set-cookie"]?.[0];
    sessionId2 = res2.body.sessionId;

    expect(cookie1).toBeDefined();
    expect(cookie2).toBeDefined();
    expect(sessionId1).not.toBe(sessionId2);
  });

  it("should return current logged-in user", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookie1);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name", "Test User");
    expect(res.body.user).toHaveProperty("email", userEmail);
    expect(res.body.user).toHaveProperty("role");
    expect(res.body.user).toHaveProperty("created_at");
    expect(res.body.user).toHaveProperty("updated_at");
  });

  it("should return 401 if not logged in", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("Get all sessions", async () => {
    const res = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);
    expect(res.body.sessions.length).toBeGreaterThanOrEqual(2);

    // Проверка структуры сессий
    const s = res.body.sessions[0];
    expect(s).toHaveProperty("user_id");
    expect(s).toHaveProperty("role");
    expect(s).toHaveProperty("ip");
    expect(s).toHaveProperty("device");
    expect(s).toHaveProperty("cookie");
  });

  it("Logout specific session", async () => {
    // Выходим из второй сессии через первую
    const res = await request(app)
      .delete(`/api/v1/auth/logout/${sessionId2}`)
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("current", false);

    // Проверяем, что удалённая сессия больше не активна
    const res2 = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Cookie", cookie1);
    expect(
      res2.body.sessions.find((s: any) => s.id === sessionId2),
    ).toBeUndefined();
  });

  it("Logout current session", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie1);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out!");
  });

  it("Login again and logout all sessions", async () => {
    // Логинимся в 2 сессии
    const res1 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    const cookieA = res1.headers["set-cookie"]?.[0];

    const res2 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    const cookieB = res2.headers["set-cookie"]?.[0];

    const res = await request(app)
      .delete("/api/v1/auth/logout-all")
      .set("Cookie", cookieA);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out from all devices!");

    const res2Check = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Cookie", cookieB);
    expect(res2Check.status).toBe(401);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: "test_" } },
    });
    await redisClient.quit();
    await prisma.$disconnect();
  });
});
