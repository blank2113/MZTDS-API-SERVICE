import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerAdminOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/admin/sessions`,
    tags: ["Admin"],
    summary: "Get all user sessions",
    description:
      "Returns all active sessions for all users. Only accessible by ADMIN users.",
    responses: {
      200: {
        description: "List of all users with their active sessions",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                users: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "number" },
                      sessions: {
                        type: "array",
                        items: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      403: {
        description: "Forbidden – user is not ADMIN",
      },
    },
  });

  // GET /admin/sessions/:userId — админ: получить все сессии пользователя
  registry.registerPath({
    method: "get",
    path: `${prefix}/admin/sessions/{userId}`,
    tags: ["Admin"],
    summary: "Admin: Get all sessions of a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
    responses: {
      200: { description: "List of user sessions" },
      400: { description: "User ID required" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  });

  // DELETE /admin/sessions/:userId/:sessionId — админ: удалить конкретную сессию
  registry.registerPath({
    method: "delete",
    path: `${prefix}/admin/sessions/{userId}/{sessionId}`,
    tags: ["Admin"],
    summary: "Admin: Logout specific session of a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
      {
        name: "sessionId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: { description: "Session deleted" },
      400: { description: "User ID or Session ID required" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
      404: { description: "Session not found" },
    },
  });

  // DELETE /admin/sessions/:userId — админ: удалить все сессии пользователя
  registry.registerPath({
    method: "delete",
    path: `${prefix}/admin/sessions/{userId}`,
    tags: ["Admin"],
    summary: "Admin: Logout all sessions of a user",
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
    responses: {
      200: { description: "All sessions deleted" },
      400: { description: "User ID required" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  });
}
