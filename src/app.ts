import express, { Response } from "express";
import compression from "compression";
import cors from "cors";
import { RedisStore } from "connect-redis";
import swaggerUi from "swagger-ui-express";
import session from "express-session";
import routes from "./routes.js";
import bodyParser from "body-parser";
import { redisClient } from "./redisClient.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { generateOpenApiDocument } from "./config/openapi.js";

export const app = express();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 день
      sameSite: "lax",
    },
  }),
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(`${process.env.PREFIX}`, routes);
const openApiDocument = generateOpenApiDocument();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check
app.get("/", requireAuth, (_, res: Response) => {
  res.status(200).json({ message: "Server is ok!!" });
});

app.get("/health", requireAuth, (_, res: Response) => {
  res.status(200).json({ message: "Server is health!!" });
});
