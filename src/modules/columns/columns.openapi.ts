import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerColumnsOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/columns/{table_id}`,
    tags: ["Columns"],
    summary: "Get all tables columns ",
    description: "Returns all columns in tables",
    parameters: [
      {
        name: "table_id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "All user tables",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    items: {
                      properties: {
                        id: { type: "number" },
                        data: { type: "string" },
                        table_id: { type: "number" },
                        updated_at: { type: "string" },
                        created_at: { type: "string" },
                      },
                    },
                  },
                  table_id: { type: "number" },
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
    path: `${prefix}/columns/{table_id}/{id}`,
    tags: ["Columns"],
    summary: "Get column in table",
    description: "Returns column in table",
    parameters: [
      {
        name: "table_id",
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
        description: "column_id",
      },
    ],
    responses: {
      200: {
        description: "Column in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  items: {
                    properties: {
                      id: { type: "number" },
                      data: { type: "string" },
                      table_id: { type: "number" },
                      updated_at: { type: "string" },
                      created_at: { type: "string" },
                    },
                  },
                },
                table_id: { type: "number" },
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
    path: `${prefix}/columns/{table_id}`,
    tags: ["Columns"],
    summary: "Add column  in table",
    description: "Add column in table",
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
        description: "Column in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  items: {
                    properties: {
                      id: { type: "number" },
                      data: { type: "string" },
                      table_id: { type: "number" },
                      updated_at: { type: "string" },
                      created_at: { type: "string" },
                    },
                  },
                },
                table_id: { type: "number" },
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
    path: `${prefix}/columns/{id}`,
    tags: ["Columns"],
    summary: "Update column in table",
    description: "Update column in table",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "column_id",
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
        description: "Column in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  items: {
                    properties: {
                      id: { type: "number" },
                      data: { type: "string" },
                      table_id: { type: "number" },
                      updated_at: { type: "string" },
                      created_at: { type: "string" },
                    },
                  },
                },
                table_id: { type: "number" },
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
    method: "delete",
    path: `${prefix}/columns/{id}`,
    tags: ["Columns"],
    summary: "Delete column in table",
    description: "Delete column in table",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "column_id",
      },
    ],
    responses: {
      200: {
        description: "Column in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: `Column 4 was deleted` },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
