import express from "express";
import compression from "compression";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes.js";
import { generateOpenApiDocument } from "./config/openapi.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionConfig } from "./config/session.config.js";
import { requestLogger } from "./middleware/logger.middleware.js";

export const app = express();

app.use(sessionConfig);
app.use(
  cors({
    origin:
      process.env.NODE_ENV !== "development"
        ? (origin, callback) => {
            if (!origin) return callback(null, true);
            if (
              (process.env.ALLOWED_ORIGINS || "")
                .split(",")
                .map((o) => o.trim())
                .includes(origin)
            ) {
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
app.use(`${process.env.PREFIX}`, routes);
app.use(requestLogger);
app.use(
  "/docs",
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
