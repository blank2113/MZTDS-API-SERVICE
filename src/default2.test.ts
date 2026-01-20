import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "./app.js";

// Default test
describe("Default test2", () => {
  it("Get default route2", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
