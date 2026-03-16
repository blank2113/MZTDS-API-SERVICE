import { Resend } from "resend";
import { logger } from "../../logs/logger.js";

export interface TemplateButton {
  text: string;
  url: string;
}

export interface TemplateMetaItem {
  label: string;
  value: string;
}

export interface TemplateOptions {
  preheader?: string;
  badge?: string;
  title: string;
  greeting?: string;
  message: string;
  messageHtml?: string;
  brandName?: string;
  brandColor?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
  logoUrl?: string;
  primaryButton?: TemplateButton;
  secondaryButton?: TemplateButton;
  bulletPoints?: string[];
  metaItems?: TemplateMetaItem[];
  footerNote?: string;
  supportEmail?: string;
}

export interface SendCustomMailOptions {
  to: string;
  subject: string;
  template: TemplateOptions;
}

export class MailService {
  private readonly resend: Resend;

  private readonly resendFrom: string =
    process.env.RESEND_FROM_EMAIL?.trim() || "Workspace <info@workspace.com>";

  private readonly defaultBrandColor = "#0f172a";
  private readonly defaultBackgroundFrom = "#eff6ff";
  private readonly defaultBackgroundTo = "#f8fafc";

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  private normalizeColor(value: string | undefined, fallback: string): string {
    if (!value) {
      return fallback;
    }

    const color = value.trim();
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
    return isHex ? color : fallback;
  }

  private sanitizeUrl(url: string): string {
    const value = url.trim();
    return /^(https?:\/\/|mailto:)/i.test(value) ? value : "#";
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private renderButton(
    button: TemplateButton | undefined,
    variant: "primary" | "secondary",
    brandColor: string,
  ): string {
    if (!button) {
      return "";
    }

    const safeText = this.escapeHtml(button.text);
    const safeUrl = this.sanitizeUrl(button.url);
    const style =
      variant === "primary"
        ? `background:${brandColor};color:#ffffff;border:1px solid ${brandColor};`
        : `background:#ffffff;color:${brandColor};border:1px solid #cbd5e1;`;

    return `
<a href="${safeUrl}" style="${style}text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block;margin:4px;">${safeText}</a>
`;
  }

  private renderBulletPoints(points: string[] | undefined): string {
    if (!points?.length) {
      return "";
    }

    const items = points
      .map(
        (point) =>
          `<li style="margin:0 0 10px 0;">${this.escapeHtml(point)}</li>`,
      )
      .join("");

    return `
<ul style="padding-left:20px;margin:0 0 26px 0;color:#334155;font-size:14px;line-height:1.7;">
${items}
</ul>
`;
  }

  private renderMetaItems(metaItems: TemplateMetaItem[] | undefined): string {
    if (!metaItems?.length) {
      return "";
    }

    const rows = metaItems
      .map(
        (item) => `
<tr>
  <td style="padding:10px 0;color:#64748b;font-size:12px;width:42%;">${this.escapeHtml(item.label)}</td>
  <td style="padding:10px 0;color:#0f172a;font-size:13px;font-weight:600;">${this.escapeHtml(item.value)}</td>
</tr>
`,
      )
      .join("");

    return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 14px;margin-top:24px;">
${rows}
</table>
`;
  }

  private renderMessage(message: string, messageHtml?: string): string {
    if (messageHtml) {
      return messageHtml;
    }

    return this.escapeHtml(message).replace(/\n/g, "<br/>");
  }

  async sendTemplateEmail(
    to: string,
    subject: string,
    options: TemplateOptions,
  ): Promise<void> {
    const html = this.buildTemplate(options);
    return this.sendMail(to, subject, html);
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.resendFrom,
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(
          `Resend API error: ${result.error.message ?? JSON.stringify(result.error)}`,
        );
      }

      logger.info(`📧 Email sent via Resend: ${result.data?.id ?? "unknown"}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(`❌ Email send error: ${errorMessage}`);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendWelcomeMail(to: string, name: string): Promise<void> {
    await this.sendTemplateEmail(to, "Добро пожаловать!", {
      preheader: "Регистрация завершена, можно начинать работу",
      badge: "Аккаунт создан",
      title: `Добро пожаловать, ${name}!`,
      greeting: "Рады видеть вас в Workspace.",
      message:
        "Ваш профиль успешно активирован. Чтобы старт был проще, мы подготовили короткий чек-лист на первые минуты.",
      bulletPoints: [
        "Заполните основные данные профиля, чтобы коллегам было проще вас найти.",
        "Настройте уведомления под ваш рабочий ритм.",
        "Создайте первую задачу и пригласите команду.",
      ],
      primaryButton: process.env.APP_URL
        ? { text: "Открыть приложение", url: process.env.APP_URL }
        : undefined,
      secondaryButton: process.env.APP_HELP_URL
        ? { text: "Центр помощи", url: process.env.APP_HELP_URL }
        : undefined,
      footerNote: "Письмо отправлено автоматически, отвечать на него не нужно.",
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  }

  async sendResetPasswordMail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    await this.sendTemplateEmail(to, "Сброс пароля", {
      preheader: "Подтвердите смену пароля по защищенной ссылке",
      badge: "Безопасность",
      title: `Сброс пароля для ${name}`,
      greeting: "Мы получили запрос на изменение пароля.",
      message:
        "Если это были вы, нажмите на кнопку ниже. Для вашей безопасности ссылка ограничена по времени.",
      primaryButton: { text: "Сбросить пароль", url: resetLink },
      bulletPoints: [
        "Не передавайте ссылку третьим лицам.",
        "Если запрос был не от вас, смените пароль и включите 2FA.",
      ],
      metaItems: [
        { label: "Срок действия ссылки", value: "15 минут" },
        { label: "Причина письма", value: "Запрос на восстановление доступа" },
      ],
      footerNote:
        "Если вы не запрашивали смену пароля, проигнорируйте письмо и проверьте безопасность аккаунта.",
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  }

  async sendCustomMail(options: SendCustomMailOptions): Promise<void> {
    await this.sendTemplateEmail(options.to, options.subject, options.template);
  }

  private buildTemplate(options: TemplateOptions): string {
    const {
      preheader,
      badge,
      title,
      greeting,
      message,
      messageHtml,
      brandName = process.env.APP_NAME || "Workspace",
      brandColor = this.defaultBrandColor,
      backgroundFrom = this.defaultBackgroundFrom,
      backgroundTo = this.defaultBackgroundTo,
      logoUrl,
      primaryButton,
      secondaryButton,
      bulletPoints,
      metaItems,
      footerNote,
      supportEmail,
    } = options;

    const safePreheader = this.escapeHtml(preheader ?? "");
    const safeTitle = this.escapeHtml(title);
    const safeGreeting = greeting ? this.escapeHtml(greeting) : "";
    const safeBrand = this.escapeHtml(brandName);
    const safeFooter = this.escapeHtml(
      footerNote || "Это письмо отправлено автоматически.",
    );
    const safeSupportEmail = supportEmail ? this.escapeHtml(supportEmail) : "";
    const safeLogo = logoUrl ? this.sanitizeUrl(logoUrl) : "";
    const resolvedBrandColor = this.normalizeColor(
      brandColor,
      this.defaultBrandColor,
    );
    const resolvedBackgroundFrom = this.normalizeColor(
      backgroundFrom,
      this.defaultBackgroundFrom,
    );
    const resolvedBackgroundTo = this.normalizeColor(
      backgroundTo,
      this.defaultBackgroundTo,
    );
    const messageBlock = this.renderMessage(message, messageHtml);
    const badgeBlock = badge
      ? `<div style="display:inline-block;padding:6px 12px;background:#e2e8f0;color:#334155;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:16px;">${this.escapeHtml(badge)}</div>`
      : "";
    const greetingBlock = safeGreeting
      ? `<p style="margin:0 0 14px 0;font-size:15px;color:#0f172a;font-weight:600;">${safeGreeting}</p>`
      : "";
    const bulletPointsBlock = this.renderBulletPoints(bulletPoints);
    const metaItemsBlock = this.renderMetaItems(metaItems);
    const primaryButtonBlock = this.renderButton(
      primaryButton,
      "primary",
      resolvedBrandColor,
    );
    const secondaryButtonBlock = this.renderButton(
      secondaryButton,
      "secondary",
      resolvedBrandColor,
    );
    const supportBlock = safeSupportEmail
      ? `<p style="margin:16px 0 0 0;font-size:12px;color:#64748b;">Поддержка: <a href="mailto:${safeSupportEmail}" style="color:#475569;text-decoration:none;">${safeSupportEmail}</a></p>`
      : "";

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0;padding:0;background:linear-gradient(135deg,${resolvedBackgroundFrom} 0%,${resolvedBackgroundTo} 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;">
${safePreheader}
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 44px rgba(15,23,42,0.14);border:1px solid #e2e8f0;">

<tr>
<td style="background:${resolvedBrandColor};padding:28px 30px;text-align:center;color:#ffffff;font-size:20px;font-weight:700;">
  ${
    safeLogo
      ? `<img src="${safeLogo}" width="44" height="44" style="display:block;margin:0 auto 10px auto;border-radius:10px;" />`
      : ""
  }
  ${safeBrand}
</td>
</tr>

<tr>
<td style="padding:36px 34px 30px 34px;color:#1f2937;">

${badgeBlock}

<h1 style="margin:0 0 14px 0;font-size:28px;line-height:1.25;color:#0f172a;">${safeTitle}</h1>

${greetingBlock}

<p style="margin:0 0 24px 0;font-size:15px;line-height:1.75;color:#475569;">
${messageBlock}
</p>

${bulletPointsBlock}

<p style="text-align:center;margin:24px 0 0 0;">${primaryButtonBlock}${secondaryButtonBlock}</p>

${metaItemsBlock}

${supportBlock}

</td>
</tr>

<tr>
<td style="background:#f8fafc;padding:24px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
${safeFooter}
<br/><br/>
© ${new Date().getFullYear()} ${safeBrand}
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
  }
}

// Singleton instance
export const mailService = new MailService();
