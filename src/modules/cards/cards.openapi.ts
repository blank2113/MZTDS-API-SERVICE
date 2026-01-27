import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerCardsOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/cards/{column_id}`,
    tags: ["Cards"],
    summary: "Get all cards in  columns ",
    description: "Returns all cards in columns",
    parameters: [
      {
        name: "column_id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "All cards in columns",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  column_id: { type: "number" },
                  id: { type: "number" },
                  data: { type: "object" },
                  updated_at: { type: "string" },
                  created_at: { type: "string" },
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
    path: `${prefix}/cards/{column_id}/{id}`,
    tags: ["Cards"],
    summary: "Get card in column",
    description: "Returns card in column",
    parameters: [
      {
        name: "column_id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "table_id",
      },
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "card_id",
      },
    ],
    responses: {
      200: {
        description: "Card in column",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                column_id: { type: "number" },
                id: { type: "number" },
                data: { type: "object" },
                updated_at: { type: "string" },
                created_at: { type: "string" },
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
    path: `${prefix}/cards/{column_id}`,
    tags: ["Cards"],
    summary: "Add card  in column",
    description: "Add card in column",
    parameters: [
      {
        name: "column_id",
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
                data: {
                  type: "object",
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
                column_id: { type: "number" },
                id: { type: "number" },
                data: { type: "object" },
                updated_at: { type: "string" },
                created_at: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });

  registry.registerPath({
    method: "put",
    path: `${prefix}/cards/{id}`,
    tags: ["Cards"],
    summary: "Update card in column",
    description: "Update card in column",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "card_id",
      },
    ],
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                },
                column_id: { type: "number" },
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
                id: { type: "number" },
                data: { type: "object" },
                column_id: { type: "number" },
                updated_at: { type: "string" },
                created_at: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
  registry.registerPath({
    method: "delete",
    path: `${prefix}/cards/{id}`,
    tags: ["Cards"],
    summary: "Delete card in column",
    description: "Delete card in column",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "card_id",
      },
    ],
    responses: {
      200: {
        description: "Card in column",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: `Card 4 was deleted` },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
