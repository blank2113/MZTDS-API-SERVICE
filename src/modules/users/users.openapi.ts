import { registry } from "../../config/openapi.js";

const prefix = process.env.PREFIX;

export function registerUsersOpenApi() {
  registry.registerPath({
    method: "get",
    path: `${prefix}/users/{table_id}`,
    tags: ["User in Table"],
    summary: "Get all users in table",
    description: "Returns all user in your table",
    parameters: [
      {
        name: "table_id",
        in: "path",
        description: "Table id",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "All user in table",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      email: { type: "string" },
                    },
                  },
                  role: { type: "string", example: "VIEWER" },
                  addedAt: { type: "string" },
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
    path: `${prefix}/users/`,
    tags: ["Users"],
    summary: "Get all users in  the system",
    description: "Returns all users in the system",
    responses: {
      200: {
        description: "All users in the system",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      email: { type: "string" },
                    },
                  },
                  role: { type: "string", example: "VIEWER" },
                  addedAt: { type: "string" },
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
    path: `${prefix}/users/{table_id}/{user_id}`,
    tags: ["User in Table"],
    summary: "Get user in table",
    description: "Returns user in this table",
    parameters: [
      {
        name: "table_id",
        in: "path",
        description: "Table id",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "user_id",
        in: "path",
        description: "User id",
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
                user: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
                role: { type: "string", example: "VIEWER" },
                addedAt: { type: "string" },
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
    path: `${prefix}/users/`,
    tags: ["User in Table"],
    summary: "Add user in table",
    description: "Add user in this table",
    request: {
      body: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                table_id: { type: "number", example: "1" },
                user_id: { type: "number", example: "2" },
                owner_id: { type: "number", example: "1" },
                role: { type: "string", example: "VIEWER" },
              },
            },
          },
        },
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
                table_id: { type: "number", example: 1 },
                user_id: { type: "number", example: 1 },
                role: { type: "string", example: "VIWER" },
                created_at: { type: "string", example: "" },
                updated_at: { type: "string", example: "" },
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
    path: `${prefix}/users/{table_id}/{owner_id}/{user_id}`,
    tags: ["User in Table"],
    summary: "Delete user in table",
    description: "Delete user in this table",
    parameters: [
      {
        name: "table_id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "owner_id",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "user_id",
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
                table_id: { type: "number", example: 1 },
                user_id: { type: "number", example: 1 },
                role: { type: "string", example: "VIWER" },
                created_at: { type: "string", example: "" },
                updated_at: { type: "string", example: "" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  });
}
