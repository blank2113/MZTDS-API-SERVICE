import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerInviteOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/invite`,
    tags: ["Invite"],
    summary: "Get all your invites",
    description: "Get all your invites",
    responses: {
      200: {
        description: "User updated data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                table_id: { type: "number", example: 2 },
                user_id: { type: "number", example: 12 },
                owner_id: { type: "number", example: 3 },
                status: { type: "string", example: "pending" },
                createdAt: { type: "string", example: "10.02.2026" },
                table: {
                  properties: {
                    id: { type: "number", example: 1 },
                    name: { type: "string", example: "name of table" },
                  },
                },
                user: {
                  properties: {
                    id: { type: "number", example: 1 },
                    name: { type: "string", example: "name of user" },
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
    method: "post",
    path: `${prefix}/invite`,
    tags: ["Invite"],
    summary: "Send invite to user",
    description: "Send invite to user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user_id: { type: "number", example: 2 },
                table_id: { type: "number", example: 2 },
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
                id: { type: "number", example: 2 },
                table_id: { type: "number", example: 2 },
                user_id: { type: "number", example: 2 },
                owner_id: { type: "number", example: 2 },
                status: { type: "string", example: "pending" },
                createdAt: { type: "string", example: "10.12.2026" },
                userFcmTokenId: { type: "number", example: 2 },
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
    path: `${prefix}/invite/{inviteId}/accept`,
    tags: ["Invite"],
    summary: "Accept invite",
    description: "Accept invite",
    parameters: [{ name: "inviteId", in: "path", required: true }],
    responses: {
      200: {
        description: "User updated data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: 2 },
                data: {
                  type: "object",
                  properties: {
                    user_id: { type: "number", example: 1 },
                    table_id: { type: "number", example: 2 },
                    role: { type: "string", example: "VIEWER" },
                    created_at: { type: "string", example: "12.12.2026" },
                    updated_at: { type: "string", example: "12.12.2026" },
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
    method: "post",
    path: `${prefix}/invite/{inviteId}/reject`,
    tags: ["Invite"],
    summary: "Reject invite",
    description: "Reject invite",
    parameters: [{ name: "inviteId", in: "path", required: true }],
    responses: {
      200: {
        description: "User updated data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                inviteId: { type: "number", example: 2 },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
