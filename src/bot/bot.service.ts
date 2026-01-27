// src/bot/bot.service.ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not set");

export const bot = new Bot(token);
bot.api.setMyCommands([
  {
    command: "start",
    description: "Подписаться на уведомления с платформы по вашим проектам",
  },
]);

bot.command("start", async (ctx) => {
  const user = await ctx.getAuthor();
  const chatId = user?.user?.id;

  await ctx.reply(
    `👋 Привет! Чтобы получать уведомления от сервиса, выполните следующие шаги:\n\n` +
      `1️⃣ Скопируйте ваш Chat ID: \`${chatId}\`\n` +
      `2️⃣ Перейдите в настройки сервиса.\n` +
      `3️⃣ Вставьте ваш Chat ID в поле "Telegram Chat ID".\n\n` +
      `✅ После этого вы начнете получать уведомления прямо сюда!`,
    { parse_mode: "Markdown" },
  );
});
bot.command("ping", (ctx) => ctx.reply("pong"));

bot.on("message", (ctx) => console.log("New message:", ctx.message.text));

export async function startBot() {
  await bot.start({ onStart: () => console.log("✅ Bot Started") });
  return bot;
}
