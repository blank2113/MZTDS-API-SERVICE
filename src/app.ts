import express, { Response } from "express";
import compression from "compression";
import cors from "cors";
export const app = express();

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));

// Health check
app.get("/", (_, res: Response) => {
  res.status(200).json({ message: "Server is ok!!" });
});
