import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerProfileOpenApi() {
  registry.registerPath({
    method: "put",
    path: `${prefix}/profile/`,
    tags: ["User profile"],
    summary: "Update User data",
    description: "Returns updated user data",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "test" },
                email: { type: "string", example: "example@gmail.com" },
                telegram_id: { type: "string", example: "32145552332" },
                notification: { type: "boolean", example: "false" },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "User updated data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                name: { type: "string", example: "test" },
                email: { type: "string", example: "test@gmail.com" },
                role: { type: "string", example: "VIEWER" },
                telegram_id: { type: "number", example: "3454123213" },
                notification: { type: "boolean", example: "false" },
                updated_at: { type: "string", example: "" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
