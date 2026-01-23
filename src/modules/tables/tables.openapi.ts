import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerTablesOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/tables`,
    tags: ["Tables"],
    summary: "Get all users tables ",
    description: "Returns all user tables",
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
                  columns: {
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
                  id: { type: "number" },
                  name: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
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
    path: `${prefix}/tables/{table_id}`,
    tags: ["Tables"],
    summary: "Get user table",
    description: "Returns all user tables",
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
              type: "object",
              properties: {
                columns: {
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
                id: { type: "number" },
                name: { type: "string" },
                created_at: { type: "string" },
                updated_at: { type: "string" },
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
    path: `${prefix}/tables/`,
    tags: ["Tables"],
    summary: "Add user table",
    description: "Add user table",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "name of table",
                },
                columns: {
                  type: "array",
                  items: {
                    properties: {
                      data: { type: "string" },
                    },
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
      200: {
        description: "User in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "name of table",
                },
                columns: {
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
    path: `${prefix}/tables/{table_id}`,
    tags: ["Tables"],
    summary: "Delete user table",
    description: "Delete user table",
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
        description: "User in table",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Table 4 was deleted!" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
