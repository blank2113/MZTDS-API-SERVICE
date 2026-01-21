import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export const registerAuthOpenApi = () => {
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/register`,
    tags: ["Auth"],
    summary: "Register a new user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "John" },
                email: { type: "string", example: "john@mail.com" },
                password: { type: "string", example: "1234567" },
              },
              required: ["name", "email", "password"],
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  });
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/login`,
    tags: ["Auth"],
    summary: "Login in system",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", example: "john@mail.com" },
                password: { type: "string", example: "1234567" },
              },
              required: ["email", "password"],
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
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
    },
  });
  registry.registerPath({
    method: "post",
    path: `${prefix}/auth/logout`,
    tags: ["Auth"],
    summary: "Logout in system",
    responses: {
      200: {
        description: "Category deleted successfully",
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
      500: {
        description: "Logout failed!",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: `/`,
    tags: ["Test"],
    summary: "Get default route",
    // security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Current user info",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Server is ok!!" },
              },
            },
          },
        },
      },
    },
  });
};
