import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerPushOpenApi() {
  registry.registerPath({
    method: "post",
    path: `${prefix}/fcm/register`,
    tags: ["FCM"],
    summary: "Register token fcm for user",
    description: "Register token fcm for user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string", example: "sadsadsaf2asfsf" },
                platform: { type: "string", example: "web" },
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
                success: { type: "string", example: true },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
  registry.registerPath({
    method: "post",
    path: `${prefix}/fcm/send`,
    tags: ["FCM"],
    summary: "Send message through FCM",
    description: "Send message through FCM",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user_id: { type: "number", example: 2 },
                title: { type: "string", example: "test title" },
                body: { type: "string", example: "test body" },
                data: {
                  type: "object",
                  properties: {
                    table_id: { type: "string", example: "2" },
                    type: { type: "string", example: "invite" },
                  },
                },
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
                success: { type: "string", example: true },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
