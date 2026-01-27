// src/bot/bot.service.ts
import { Bot } from "grammy";
import { prisma } from "../lib/prisma.js";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not set");

export const bot = new Bot(token);

bot.api.setMyCommands([
  {
    command: "start",
    description: "Подписаться на уведомления с платформы по вашим проектам",
  },
  {
    command: "info",
    description: "Описание данного бота 🤖",
  },
]);

bot.command("start", async (ctx) => {
  const user = await ctx.getAuthor();
  const token = ctx.match?.trim();

  const existingUser = await prisma.user.findFirst({
    where: { telegram_id: String(user.user.id) },
  });

  if (existingUser && existingUser.notification) {
    return ctx.reply("✅ Вы уже подписаны на уведомления с системы");
  }

  // Если токен не передан — нельзя привязать
  if (!token) {
    return ctx.reply(
      "❌ Чтобы подписаться на уведомления, используйте ссылку в формате /start <token>",
    );
  }

  const link = await prisma.tgLinkToken.findUnique({
    where: { token },
  });

  if (!link || link.used || link.expiresAt < new Date()) {
    return ctx.reply("❌ Ссылка недействительна или устарела");
  }

  // Находим пользователя по email из токена
  const dbUser = await prisma.user.findUnique({
    where: { email: link.email },
  });

  if (!dbUser) {
    return ctx.reply("❌ Пользователь не найден в системе");
  }

  // Привязываем Telegram и помечаем токен как использованный
  await prisma.$transaction([
    prisma.user.update({
      where: { email: link.email },
      data: {
        telegram_id: String(user.user.id),
        notification: true,
      },
    }),
    prisma.tgLinkToken.update({
      where: { token },
      data: { used: true },
    }),
  ]);

  return ctx.reply("✅ Telegram успешно привязан. Вы подписаны на рассылку");
});

bot.command("ping", (ctx) => ctx.reply("pong"));
bot.command("info", (ctx) =>
  ctx.reply(
    `*📢 Информация о боте рассылок*\n\n` +
      `Этот бот предназначен для получения уведомлений от платформы *Workflow Minzifa Travel*.\n` +
      `Платформа работает по принципу системы *Jira*: задачи, уведомления и статусы проектов доступны для вашего удобства.\n\n` +
      `*Функции бота:*\n` +
      `• Получение уведомлений о новых задачах и изменениях\n` +
      `• Контроль статусов задач и событий\n` +
      `• Прямой доступ к информации из платформы через Telegram\n\n` +
      `*ℹ️ Как использовать:* \n` +
      `1️⃣ Нажмите кнопку /start и привяжите свой Telegram к аккаунту на платформе.\n` +
      `2️⃣ Все важные уведомления будут приходить прямо сюда.\n\n` +
      `*🔗 Платформа:* [Workflow Minzifa Travel](https://workflow.minzifatravel.com)`,
    { parse_mode: "Markdown" },
  ),
);

bot.on("message", (ctx) => console.log("New message:", ctx.message.text));

export async function startBot() {
  await bot.start({ onStart: () => console.log("✅ Bot Started") });
  return bot;
}
