import winston from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.join(process.cwd(), "logs");
fs.mkdirSync(logsDir, { recursive: true });

export const logFilePath = path.join(logsDir, "app.log");

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: logFilePath }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
