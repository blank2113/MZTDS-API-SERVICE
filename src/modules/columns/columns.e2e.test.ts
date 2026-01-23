import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

describe("Columns API (e2e)", () => {
  let userEmail: string;
  let cookie: string;
  let tableId: number;
  let columnId: number;

  beforeAll(async () => {
    await redisClient.connect();

    // 🔹 создаём уникального пользователя
    userEmail = `columns_${crypto.randomUUID()}@mail.com`;
    const password = "1234567";

    await prisma.user.create({
      data: {
        name: "Columns Test User",
        email: userEmail,
        password: await bcrypt.hash(password, 10),
      },
    });

    // 🔹 логинимся
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userEmail, password });

    cookie = loginRes.headers["set-cookie"]?.[0];

    // 🔹 создаём таблицу (columns без table не живут)
    const tableRes = await request(app)
      .post("/api/v1/tables")
      .set("Cookie", cookie)
      .send({
        name: `Columns Table ${crypto.randomUUID()}`,
      });

    tableId = tableRes.body.id;
  });

  afterAll(async () => {
    await prisma.column.deleteMany({
      where: { table_id: tableId },
    });

    await prisma.table.deleteMany({
      where: { id: tableId },
    });

    await prisma.user.deleteMany({
      where: { email: userEmail },
    });

    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));

    await redisClient.quit();
    await prisma.$disconnect();
  });

  // ============================
  // CREATE COLUMN
  // ============================
  it("should create column", async () => {
    const res = await request(app)
      .post(`/api/v1/columns/${tableId}`)
      .set("Cookie", cookie)
      .send({
        data: {
          title: "Test column",
          order: 1,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.data.title).toBe("Test column");

    columnId = res.body.id;
  });

  // ============================
  // GET COLUMNS
  // ============================
  it("should get columns by table", async () => {
    const res = await request(app)
      .get(`/api/v1/columns/${tableId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ============================
  // UPDATE COLUMN
  // ============================
  it("should update column", async () => {
    const res = await request(app)
      .put(`/api/v1/columns/${columnId}`)
      .set("Cookie", cookie)
      .send({
        data: {
          title: "Updated column",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Updated column");
  });

  // ============================
  // DELETE COLUMN
  // ============================
  it("should delete column", async () => {
    const res = await request(app)
      .delete(`/api/v1/columns/${columnId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(201);
  });
});
