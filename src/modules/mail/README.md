# Mail Service

Сервис отправки писем через **Resend** с красивыми HTML шаблонами и интеграцией в очередь Bull MQ.

## 📋 Установка

Зависимость уже установлена:

```bash
npm install resend
```

## 🔐 Переменные окружения

Добавьте в `.env`:

```env
# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=Workspace <noreply@workspace.com>

# Email configuration
APP_NAME=Your App Name
APP_URL=https://app.example.com
APP_HELP_URL=https://help.example.com
SUPPORT_EMAIL=support@example.com
```

## 🚀 Использование

### 1. Очередь (рекомендуется для асинхронной отправки)

```typescript
import {
  queueWelcomeEmail,
  queueResetPasswordEmail,
  queueCustomEmail,
} from "./modules/mail/mail.queue.js";

// Отправить приветственное письмо
await queueWelcomeEmail("user@example.com", "John Doe");

// Отправить письмо для сброса пароля
await queueResetPasswordEmail(
  "user@example.com",
  "John Doe",
  "https://app.example.com/reset?token=abc123",
);

// Отправить кастомное письмо
await queueCustomEmail({
  to: "user@example.com",
  subject: "Специальное предложение",
  template: {
    title: "Эксклюзивное предложение",
    message: "Получите 50% скидку на все товары",
    badge: "Специальное",
    primaryButton: {
      text: "Использовать предложение",
      url: "https://app.example.com/promo",
    },
  },
});
```

### 2. Немедленная отправка (синхронно)

```typescript
import { mailService } from "./modules/mail/mail.queue.js";

// Приветствие
await mailService.sendWelcomeMail("user@example.com", "John Doe");

// Сброс пароля
await mailService.sendResetPasswordMail(
  "user@example.com",
  "John Doe",
  "https://app.example.com/reset?token=abc123",
);

// Кастомное письмо
await mailService.sendCustomMail({
  to: "user@example.com",
  subject: "Уведомление",
  template: {
    title: "Важное уведомление",
    message: "Ваша учетная запись обновлена",
  },
});

// Сырое HTML письмо
await mailService.sendMail("user@example.com", "Тема письма", "<h1>Hello</h1>");
```

## 🎨 API TemplateOptions

```typescript
interface TemplateOptions {
  // Основное
  title: string; // Заголовок письма
  message: string; // Основной текст

  // Опциональное
  preheader?: string; // Текст в превью письма
  badge?: string; // Бейдж (например "Новое")
  greeting?: string; // Приветствие перед сообщением
  messageHtml?: string; // HTML вместо обычного текста

  // Брендинг
  brandName?: string; // Название компании (default: APP_NAME)
  brandColor?: string; // Цвет бренда (default: #0f172a)
  logoUrl?: string; // URL логотипа
  backgroundFrom?: string; // Цвет фона от
  backgroundTo?: string; // Цвет фона к

  // Кнопки
  primaryButton?: {
    // Основная кнопка
    text: string;
    url: string;
  };
  secondaryButton?: {
    // Вторая кнопка
    text: string;
    url: string;
  };

  // Содержимое
  bulletPoints?: string[]; // Список пунктов
  metaItems?: Array<{
    // Таблица с метаинформацией
    label: string;
    value: string;
  }>;

  // Подвал
  footerNote?: string; // Текст в подвале
  supportEmail?: string; // Email поддержки
}
```

## 📧 Встроенные шаблоны

### sendWelcomeMail

Приветственное письмо с чек-листом для новых пользователей.

```typescript
await mailService.sendWelcomeMail("user@email.com", "Иван");
```

### sendResetPasswordMail

Письмо для восстановления пароля с временным лимитом.

```typescript
await mailService.sendResetPasswordMail(
  "user@email.com",
  "Иван",
  "https://app.example.com/reset?token=xxx",
);
```

## 🏗️ Интеграция в модули

### Пример: Auth модуль

```typescript
// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { queueWelcomeEmail } from "../mail/mail.queue.js";
import { create as createUser } from "./auth.service.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const user = await createUser(req.body);

    // Отправить приветственное письмо в очередь
    await queueWelcomeEmail(user.email, user.name);

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

export default router;
```

## 🔧 Продвинутые опции

### Кастомный HTML контент

```typescript
await mailService.sendTemplateEmail("user@example.com", "Subject", {
  title: "Заголовок",
  message: "Может быть проигнорировано",
  messageHtml: `
      <div style="color: red;">
        <h2>Кастомный HTML</h2>
        <p>Полная поддержка HTML/CSS</p>
      </div>
    `,
});
```

### Таблица метаинформации

```typescript
await mailService.sendCustomMail({
  to: "user@example.com",
  subject: "Квитанция платежа",
  template: {
    title: "Спасибо за покупку",
    message: "Вот детали вашего заказа",
    metaItems: [
      { label: "Номер заказа", value: "#12345" },
      { label: "Сумма", value: "$99.99" },
      { label: "Статус", value: "Подтвержден" },
    ],
  },
});
```

## 🧪 Тестирование

Для локальной разработки используйте `RESEND_API_KEY=fake_key` и проверяйте логи:

```typescript
import { logger } from "./logs/logger.js";

// Проверяйте логи при отправке
// logger.info('📧 Email sent via Resend: xxx')
```

## ⚡ Производительность

- **Очередь**: Письма отправляются асинхронно через Bull MQ (рекомендуется)
- **Синхронно**: Для критичных писем используйте прямую отправку
- **Параллелизм**: По умолчанию 5 одновременных писем

## 🐛 Обработка ошибок

```typescript
try {
  await queueWelcomeEmail("user@example.com", "Name");
} catch (error) {
  logger.error(`Failed to queue email: ${error.message}`);
  // Повторить позже или использовать fallback
}
```

## 📚 Дополнительно

- [Resend документация](https://resend.com/docs)
- Все письма HTML/CSS валидные
- Все URL и текст автоматически санитизируются
- Цвета валидируются (hex формат)
