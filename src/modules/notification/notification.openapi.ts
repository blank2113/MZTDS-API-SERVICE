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
              required: ["message"],
              properties: {
                title: {
                  type: "string",
                  example: "Новый комментарий в задаче",
                },
                message: {
                  type: "string",
                  example:
                    "Проверьте обновление карточки в таблице бронирований.",
                },
                type: {
                  type: "string",
                  example: "card.updated",
                },
                priority: {
                  type: "string",
                  enum: ["low", "normal", "high"],
                  example: "normal",
                },
                actionText: {
                  type: "string",
                  example: "Открыть карточку",
                },
                actionUrl: {
                  type: "string",
                  format: "uri",
                  example:
                    "https://workflow.minzifatravel.com/tables/12/cards/55",
                },
                metadata: {
                  type: "object",
                  additionalProperties: {
                    oneOf: [
                      { type: "string" },
                      { type: "number" },
                      { type: "boolean" },
                    ],
                  },
                  example: {
                    assignee: "Aziz",
                    status: "In Progress",
                  },
                },
              },
            },
          },
        },
        required: true,
      },
    },
    responses: {
      201: {
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
