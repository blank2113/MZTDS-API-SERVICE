import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../config/redisClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

describe("Cards API (e2e)", () => {
  let userEmail: string;
  let cookie: string;
  let tableId: number;
  let columnId: number;
  let cardId: number;

  beforeAll(async () => {
    await redisClient.connect();

    userEmail = `cards_${crypto.randomUUID()}@mail.com`;
    const password = "1234567";

    await prisma.user.create({
      data: {
        name: "Card Test User",
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
        name: `Card Table ${crypto.randomUUID()}`,
      });

    tableId = tableRes.body.id;

    const columnRes = await request(app)
      .post(`/api/v1/columns/${tableId}`)
      .set("Cookie", cookie)
      .send({
        data: { name: `Card Column ${crypto.randomUUID()}` },
      });

    columnId = columnRes.body.id;
  });

  afterAll(async () => {
    await prisma.column.deleteMany({
      where: { table_id: tableId },
    });

    await prisma.table.deleteMany({
      where: { id: tableId },
    });
    await prisma.card.deleteMany({
      where: { id: cardId },
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
  // CREATE CARD
  // ============================
  it("should create card", async () => {
    const res = await request(app)
      .post(`/api/v1/cards/${columnId}`)
      .set("Cookie", cookie)
      .send({
        data: {
          title: "Test card",
          order: 1,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.data.title).toBe("Test card");

    cardId = res.body.id;
  });

  // ============================
  // GET CARDS
  // ============================
  it("should get cards by columns", async () => {
    const res = await request(app)
      .get(`/api/v1/cards/${columnId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ============================
  // UPDATE CARD
  // ============================
  it("should update card", async () => {
    const res = await request(app)
      .put(`/api/v1/cards/${cardId}`)
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
  it("should delete card", async () => {
    const res = await request(app)
      .delete(`/api/v1/cards/${cardId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(201);
  });
});
