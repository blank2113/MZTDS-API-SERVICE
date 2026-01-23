import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { app } from "../../app.js";
import { redisClient } from "../../redisClient.js";
import { TableRole } from "../../generated/prisma/enums.js";

describe("Users in Tables API (e2e)", () => {
  let owner: any;
  let editor: any;
  let viewer: any;
  let table: any;
  let ownerCookie: string;
  let editorCookie: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let viewerCookie: string;

  beforeAll(async () => {
    // 1️⃣ Redis подключаем
    await redisClient.connect();

    // 2️⃣ Создаем пользователей
    owner = await prisma.user.create({
      data: {
        name: "Owner",
        email: "owner@test.com",
        password: await bcrypt.hash("ownerpass", 10),
      },
    });
    editor = await prisma.user.create({
      data: {
        name: "Editor",
        email: "editor@test.com",
        password: await bcrypt.hash("editorpass", 10),
      },
    });
    viewer = await prisma.user.create({
      data: {
        name: "Viewer",
        email: "viewer@test.com",
        password: await bcrypt.hash("viewerpass", 10),
      },
    });

    // 3️⃣ Создаем таблицу
    table = await prisma.table.create({ data: { name: "Test Table" } });

    // 4️⃣ Связываем пользователей с таблицей
    await prisma.userToTable.createMany({
      data: [
        { user_id: owner.id, table_id: table.id, role: TableRole.OWNER },
        { user_id: editor.id, table_id: table.id, role: TableRole.EDITOR },
        { user_id: viewer.id, table_id: table.id, role: TableRole.VIEWER },
      ],
    });

    // 5️⃣ Логиним всех и сохраняем cookie
    const login = async (email: string, password: string) => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });
      return res.headers["set-cookie"]?.[0];
    };
    ownerCookie = await login(owner.email, "ownerpass");
    editorCookie = await login(editor.email, "editorpass");
    viewerCookie = await login(viewer.email, "viewerpass");
  });

  afterAll(async () => {
    await prisma.userToTable.deleteMany();
    await prisma.table.deleteMany();
    await prisma.user.deleteMany();

    const keys = await redisClient.keys("user_sessions:*");
    await Promise.all(keys.map((key) => redisClient.del(key)));
    await redisClient.quit();
    await prisma.$disconnect();
  });

  it("Get all users in a table", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${table.id}`)
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    res.body.forEach((u: any) => {
      expect(u).toHaveProperty("user");
      expect(u).toHaveProperty("role");
    });
  });

  it("Get specific user in a table", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${table.id}/${editor.id}`)
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.id).toBe(editor.id);
    expect(res.body).toHaveProperty("role", TableRole.EDITOR);
  });

  it("Owner adds a new user to table", async () => {
    const newUser = await prisma.user.create({
      data: {
        name: "NewUser",
        email: "newuser@test.com",
        password: await bcrypt.hash("pass123", 10),
      },
    });

    const res = await request(app)
      .post("/api/v1/users/")
      .set("Cookie", ownerCookie)
      .send({
        table_id: Number(table.id),
        user_id: Number(newUser.id),
        role: String(TableRole.VIEWER),
        owner_id: owner.id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User added successfully");
  });

  it("Owner deletes a user from table", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${table.id}/${owner.id}/${viewer.id}`)
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User removed from table");
  });

  it("Non-owner cannot delete a user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${table.id}/${editor.id}/${editor.id}`)
      .set("Cookie", editorCookie);

    expect([401, 403]).toContain(res.status); // зависит от реализации
  });
});
