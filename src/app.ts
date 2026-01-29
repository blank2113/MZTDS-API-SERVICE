import express from "express";
import compression from "compression";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes.js";
import { generateOpenApiDocument } from "./config/openapi.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionConfig } from "./config/session.config.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import expressBasicAuth from "express-basic-auth";

export const app = express();

const allowedOrigins = process.env
  .ALLOWED_ORIGINS!.split(",")
  .map((o) => o.trim());

app.use(sessionConfig);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          }
        : "*",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(`${process.env.PREFIX}`, routes);
app.use(
  "/docs",
  expressBasicAuth({
    users: {
      [process.env.SWAGGER_USER || "admin"]:
        process.env.SWAGGER_PASSWORD || "adminpassword",
    },
  }),
  swaggerUi.serve,
  swaggerUi.setup(generateOpenApiDocument(), {
    swaggerOptions: {
      requestInterceptor: (request: { credentials: string }) => {
        request.credentials = "include";
        return request;
      },
    },
  }),
);

app.use(errorHandler);
