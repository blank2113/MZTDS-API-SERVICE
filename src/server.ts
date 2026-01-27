import { app } from "./app.js";
import { startBot } from "./bot/bot.service.js";
import { createAdmin } from "./config/create.admins.js";
import { prisma } from "./lib/prisma.js";
import { redisClient } from "./redisClient.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected and ready");

    await prisma.$connect();
    console.log("✅ Database connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    createAdmin();

    server.on("error", (err) => {
      console.error("❌ Server failed to start:", err);
      process.exit(1);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 SIGINT received. Closing connections...");
      await prisma.$disconnect();
      await redisClient.quit();
      server.close(() => process.exit(0));
    });
  } catch (e) {
    console.error("❌ Failed to start server", e);
    process.exit(1);
  }
}

main();

startBot()
  .then(() => console.log("✅ Bot started"))
  .catch((err) => {
    console.error("❌ Bot failed to start:", err);
    process.exit(1); // можно решать, что делать при падении бота
  });
