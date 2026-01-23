import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

describe("Tables API (e2e)", () => {
  let userEmail: string;
  let cookie: string;
  let tableId: number;

  beforeAll(async () => {
    await redisClient.connect();

    // Создаем уникального пользователя
    userEmail = `test_${crypto.randomUUID()}@mail.com`;
    const password = "1234567";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: userEmail,
        password: await bcrypt.hash(password, 10),
      },
    });

    // Логинимся и получаем cookie
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });
    cookie = res.headers["set-cookie"]?.[0];
  });

  afterAll(async () => {
    // Удаляем таблицы, созданные этим пользователем
    await prisma.table.deleteMany({
      where: { users: { some: { user: { email: userEmail } } } },
    });

    // Удаляем пользователя
    await prisma.user.deleteMany({ where: { email: userEmail } });

    // Чистим сессии Redis
    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));

    await redisClient.quit();
    await prisma.$disconnect();
  });

  it("should create a new table", async () => {
    const res = await request(app)
      .post("/api/v1/tables")
      .set("Cookie", cookie)
      .send({
        name: `Table ${crypto.randomUUID()}`,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");

    tableId = res.body.id; // сохраняем для следующих тестов
  });

  it("should get all tables for user", async () => {
    const res = await request(app).get("/api/v1/tables").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.find((t: any) => t.id === tableId)).toBeDefined();
  });

  it("should get a specific table by id", async () => {
    const res = await request(app)
      .get(`/api/v1/tables/${tableId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", tableId);
  });

  it("should update table name and columns", async () => {
    const res = await request(app)
      .put(`/api/v1/tables/${tableId}`)
      .set("Cookie", cookie)
      .send({
        name: `Updated Table ${crypto.randomUUID()}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toMatch(/Updated Table/);
  });

  it("should delete the table", async () => {
    const res = await request(app)
      .delete(`/api/v1/tables/${tableId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Table \d+ was deleted/);
  });
});
