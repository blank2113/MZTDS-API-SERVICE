import { Bot } from "grammy";
import { prisma } from "../../lib/prisma.js";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not set");

const PLATFORM_NAME = process.env.APP_NAME || "Workflow Minzifa Travel";
const PLATFORM_URL =
  process.env.APP_URL || "https://workflow.minzifatravel.com";

const HELP_TEXT =
  "❌ Чтобы подписаться на уведомления, используйте ссылку из профиля в формате /start <token>";

const INFO_TEXT =
  `<b>📢 ${PLATFORM_NAME}: уведомления в Telegram</b>\n\n` +
  `Этот бот отправляет ключевые события по вашим таблицам и задачам.\n\n` +
  `<b>Что умеет бот:</b>\n` +
  `• Оповещения о важных изменениях\n` +
  `• Уведомления о приглашениях и статусах\n` +
  `• Быстрые ссылки в систему\n\n` +
  `<b>Как начать:</b>\n` +
  `1) Сгенерируйте ссылку привязки в профиле\n` +
  `2) Откройте её и подтвердите /start <token>\n` +
  `3) Получайте уведомления здесь\n\n` +
  `<a href="${PLATFORM_URL}">Открыть платформу</a>`;

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
    return ctx.reply("✅ Telegram уже привязан. Уведомления активны.");
  }

  if (!token) {
    return ctx.reply(HELP_TEXT);
  }

  const link = await prisma.tgLinkToken.findUnique({
    where: { token },
  });

  if (!link || link.used || link.expiresAt < new Date()) {
    return ctx.reply(
      "❌ Ссылка недействительна или устарела. Сгенерируйте новую в профиле.",
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: link.email },
  });

  if (!dbUser) {
    return ctx.reply("❌ Пользователь не найден в системе");
  }

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

  return ctx.reply(
    "✅ Telegram успешно привязан. Теперь все важные уведомления будут приходить сюда.",
  );
});

bot.command("ping", (ctx) => ctx.reply("pong"));
bot.command("info", (ctx) => ctx.reply(INFO_TEXT, { parse_mode: "HTML" }));

bot.on("message", (ctx) => console.log("New message:", ctx.message.text));

export async function startBot() {
  await bot.start({ onStart: () => console.log("✅ Bot Started") });
  return bot;
}
