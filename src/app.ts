import express, { Response } from "express";
import compression from "compression";
import cors from "cors";
import { RedisStore } from "connect-redis";
import swaggerUi from "swagger-ui-express";
import session from "express-session";
import routes from "./routes.js";
import { redisClient } from "./redisClient.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { generateOpenApiDocument } from "./config/openapi.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 день
      sameSite: "lax",
    },
  }),
);

app.use(compression());
app.use(express.json({ limit: "20mb" }));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(`${process.env.PREFIX}`, routes);
const openApiDocument = generateOpenApiDocument();
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    swaggerOptions: {
      requestInterceptor: (request: { credentials: string }) => {
        request.credentials = "include";
        return request;
      },
    },
  }),
);

app.get("/", requireAuth, (_, res: Response) => {
  res.status(200).json({ message: "Server is ok!!" });
});

app.get("/health", requireAuth, (_, res: Response) => {
  res.status(200).json({ message: "Server is health!!" });
});

app.use(errorHandler);
