import { NotificationBodyDTO } from "./notification.schema.js";

interface TelegramMessageContext {
  tableId: number;
  tableName?: string;
  actorName?: string;
}

const PRIORITY_EMOJI: Record<"low" | "normal" | "high", string> = {
  low: "ℹ️",
  normal: "🔔",
  high: "🚨",
};

const DEFAULT_TITLE = "Новое уведомление";
const DEFAULT_MESSAGE = "Появилось новое событие в системе.";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  const value = url.trim();
  if (!/^(https?:\/\/)/i.test(value)) {
    return undefined;
  }

  return value.replace(/"/g, "%22");
}

function getMessage(payload: NotificationBodyDTO): string {
  return (
    payload.message ||
    payload.text ||
    payload.test ||
    DEFAULT_MESSAGE
  ).trim();
}

export function buildTelegramNotificationMessage(
  payload: NotificationBodyDTO,
  context: TelegramMessageContext,
): { text: string; parse_mode: "HTML" } {
  const title = (payload.title || DEFAULT_TITLE).trim();
  const message = getMessage(payload);
  const priority = payload.priority || "normal";
  const lines: string[] = [
    `${PRIORITY_EMOJI[priority]} <b>${escapeHtml(title)}</b>`,
    "",
    escapeHtml(message),
  ];

  lines.push(
    "",
    `<b>Таблица:</b> ${escapeHtml(context.tableName || `#${context.tableId}`)}`,
  );

  if (context.actorName) {
    lines.push(`<b>Инициатор:</b> ${escapeHtml(context.actorName)}`);
  }

  if (payload.type) {
    lines.push(`<b>Тип события:</b> ${escapeHtml(payload.type)}`);
  }

  if (payload.metadata && Object.keys(payload.metadata).length) {
    lines.push("", "<b>Детали:</b>");
    for (const [key, value] of Object.entries(payload.metadata)) {
      lines.push(`• ${escapeHtml(key)}: ${escapeHtml(String(value))}`);
    }
  }

  const actionUrl = sanitizeUrl(payload.actionUrl);
  if (actionUrl) {
    lines.push(
      "",
      `<a href="${actionUrl}">${escapeHtml(payload.actionText || "Открыть в системе")}</a>`,
    );
  }

  return {
    text: lines.join("\n"),
    parse_mode: "HTML",
  };
}
