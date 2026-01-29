import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerNotificationOpenApi() {
  registry.registerPath({
    method: "post",
    path: `${prefix}/notification/{table_id}`,
    tags: ["Telegram"],
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
  registry.registerPath({
    method: "get",
    path: `${prefix}/notification/tg_link`,
    tags: ["Telegram"],
    summary: "Get tg link",
    description: "Returns tg link",
    responses: {
      200: {
        description: "All user in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                link: {
                  type: "string",
                  example:
                    "https://t.me/WorkflowMinzifaTravel_bot?start=${token}",
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
