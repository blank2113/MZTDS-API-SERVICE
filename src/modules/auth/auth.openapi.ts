import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerAuthOpenApi() {
  // ================== GET ALL SESSIONS ==================
  registry.registerPath({
    method: "get",
    path: `${prefix}/auth/sessions`,
    tags: ["Auth"],
    summary: "Get all active sessions",
    description:
      "Returns all active sessions for the current user, including device info, IP, and cookie metadata.",
    responses: {
      200: {
        description: "Active sessions",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      cookie: {
                        type: "object",
                        properties: {
                          originalMaxAge: { type: "number", example: 86400000 },
                          expires: {
                            type: "string",
                            format: "date-time",
                            example: "2026-01-22T17:56:13.775Z",
                          },
                          secure: { type: "boolean", example: false },
                          httpOnly: { type: "boolean", example: true },
                          path: { type: "string", example: "/" },
                          sameSite: { type: "string", example: "lax" },
                        },
                      },
                      user_id: { type: "number", example: 2 },
                      role: { type: "string", example: "USER" },
                      ip: { type: "string", example: "::1" },
                      device: { type: "string", example: "Chrome on MacBook" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
  registry.registerPath({
    method: "get",
    path: `${prefix}/auth/me`,
    tags: ["Auth"],
    summary: "Get current authenticated user",
    description:
      "Returns the information of the currently logged-in user based on the session.",
    responses: {
      200: {
        description: "User info retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 1 },
                    name: { type: "string", example: "John Doe" },
                    email: { type: "string", example: "john@mail.com" },
                    role: { type: "string", example: "USER" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                  },
                  required: [
                    "id",
                    "name",
                    "email",
                    "role",
                    "created_at",
                    "updated_at",
                  ],
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized — no active session",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Unauthorized" },
              },
            },
          },
        },
      },
    },
  });
  // ================== REGISTER ==================
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/register`,
    tags: ["Auth"],
    summary: "Register a new user",
    description: "Creates a new user account with name, email, and password.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string", example: "John Doe" },
              email: { type: "string", example: "john@example.com" },
              password: { type: "string", example: "1234567" },
            },
            required: ["name", "email", "password"],
          },
        },
      },
    },
    responses: {
      201: { description: "User created successfully" },
      400: { description: "Invalid input data" },
    },
  });

  // ================== LOGIN ==================
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/login`,
    tags: ["Auth"],
    summary: "Login user",
    description: "Logs in a user and creates a session. Returns session ID.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", example: "john@example.com" },
              password: { type: "string", example: "1234567" },
            },
            required: ["email", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Logged in successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Logged in!" },
              },
            },
          },
        },
      },
      401: { description: "Invalid credentials" },
    },
  });

  // ================== LOGOUT CURRENT SESSION ==================
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/logout`,
    tags: ["Auth"],
    summary: "Logout current session",
    description: "Logs out the current session and clears the cookie.",
    responses: {
      200: {
        description: "Logged out successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Logged out!" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      500: { description: "Logout failed" },
    },
  });

  // ================== LOGOUT ALL SESSIONS ==================
  registry.registerPath({
    method: "delete",
    path: `${prefix}/auth/logout-all`,
    tags: ["Auth"],
    summary: "Logout all sessions",
    description: "Logs out user from all devices and clears all sessions.",
    responses: {
      200: {
        description: "Logged out from all devices",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Logged out from all devices!",
                },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });

  // ================== LOGOUT SPECIFIC SESSION ==================
  registry.registerPath({
    method: "delete",
    path: `${prefix}/auth/logout/{session_id}`,
    tags: ["Auth"],
    summary: "Logout specific session",
    description:
      "Logs out a specific session by session ID. If sessionId equals current session, cookie will be cleared.",
    parameters: [
      {
        name: "session_id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "ID of the session to logout",
      },
    ],
    responses: {
      200: {
        description: "Session logged out successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Session logged out" },
                current: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      400: {
        description: "Session ID required or cannot logout last active session",
      },
      401: { description: "Unauthorized" },
      404: { description: "Session not found" },
    },
  });
}
