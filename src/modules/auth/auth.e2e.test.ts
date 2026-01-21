import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";

describe("Auth API (e2e)", () => {
  let userEmail: string;
  const password = "123456";
  let cookie: string;

  beforeAll(async () => {
    userEmail = `test_${crypto.randomUUID()}@mail.com`;
    await redisClient.connect();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: userEmail,
      password,
    });
  });

  // Тест на регистрацию
  it("POST /auth/register → should create a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Another User",
        email: `test_${crypto.randomUUID()}@mail.com`,
        password,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      role: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  // Тест на логин
  it("POST /auth/login → should login the user and return session cookie", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: userEmail,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged in!");

    // Сохраняем cookie для дальнейших запросов
    cookie = res.headers["set-cookie"]?.[0];
    expect(cookie).toBeDefined();
  });

  it("POST /auth/logout → should logout the user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie);

    console.log("Used cookie:", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out!");
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: "test_" },
      },
    });
    await redisClient.quit();
    await prisma.$disconnect();
  });
});
