import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const openApiDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "MZTD API",
      version: "1.0.0",
    },
    servers: [{ url: process.env.API_URL || "http://localhost:3000" }],
    security: [{ sessionAuth: [] }],
  });

  openApiDoc.components = {
    securitySchemes: {
      sessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
      },
    },
  };

  return openApiDoc;
};
