import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerTgLinkOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/tg_link/`,
    tags: ["Telegram Link "],
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
