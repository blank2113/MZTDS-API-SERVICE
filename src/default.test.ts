import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "./app.js";

describe("Default test", () => {
  it("Get default route", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
