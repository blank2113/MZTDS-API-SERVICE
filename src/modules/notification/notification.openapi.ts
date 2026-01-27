import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerNotificationOpenApi() {
  registry.registerPath({
    method: "post",
    path: `${prefix}/notification/{table_id}`,
    tags: ["Notification"],
    summary: "Send notification for users in this table",
    description: "Send notification for users in this table",
    parameters: [
      {
        name: "table_id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                test: {
                  type: "string",
                },
              },
            },
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Card in column",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Notification successfully sent ✅",
                },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
