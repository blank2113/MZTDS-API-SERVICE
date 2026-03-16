# MZTDS-API-SERVICE

[![Node.js](https://img.shields.io/badge/node-%3E%3D22.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/prisma-%3E%3D6.x-3333ff)](https://www.prisma.io/)
[![GitHub Workflow](https://img.shields.io/github/actions/workflow/status/blank2113/MZTDS-API-SERVICE/ci.yml?branch=prod)](https://github.com/blank2113/MZTDS-API-SERVICE/actions)
[![License](https://img.shields.io/github/license/blank2113/MZTDS-API-SERVICE)](LICENSE)

---

## 📌 Описание

MZTDS-API-SERVICE — это backend-сервис на **Node.js + TypeScript**, использующий **Prisma** и **PostgreSQL**.  
Сервис предназначен для управления данными, с поддержкой:

- REST API через **Express**
- Управление статусами рабочего дня
- Интеграция с Redis
- CI/CD через GitHub Actions
- Строгий контроль качества кода и проверка тестов перед merge в `prod`

---

## ⚡ Особенности

- Автоматический запуск CI/CD при push в ветки `test` / `feature`
- Обязательные проверки (`install`, `lint`, `test`, `build`) перед merge в `prod`
- Защита ветки `prod` через GitHub Rulesets
- Автоматическое удаление веток после успешного merge
- Использование TypeScript с проверкой типов
- Управление БД через Prisma ORM

---

## 🛠 Технологии

- Node.js 22.x
- TypeScript 5.x
- Express.js 5.x
- Prisma 7.x
- PostgreSQL 17
- Redis 7
- GitHub Actions (CI/CD)
- ESLint + Prettier + Vitest

---

## 🚀 Установка и запуск

1. Клонировать репозиторий:

```bash
git clone git@github.com:blank2113/MZTDS-API-SERVICE.git
cd MZTDS-API-SERVICE
```

---

## 🔌 Realtime для фронтенда (WebSocket)

На сервере используется Socket.IO. Realtime-события отправляются в комнаты:

- `table:<tableId>`
- `user:<userId>`

В production доступ к комнатам проверяется по серверной сессии (`connect.sid` + Redis).  
В production обязательно задать переменную окружения `ALLOWED_ORIGINS` (список через запятую) — без неё все WebSocket-соединения из браузеров будут отклонены на уровне CORS.

### 1. Установить клиент на фронте

```bash
npm i socket.io-client
```

### 2. Подключение к сокету

```ts
import { io, Socket } from "socket.io-client";

const API_URL = "https://api-workflow.minzifatravel.com";

export const socket: Socket = io(API_URL, {
  withCredentials: true,
  transports: ["websocket"],
  auth: {
    // Опционально: initial подписки на таблицы
    tableIds: [12, 15],
    // В dev можно передать userId как fallback,
    // но в production используется только session cookie.
    userId: 7,
  },
});

socket.on("connect", () => {
  console.log("socket connected", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("socket disconnected", reason);
});
```

### 3. Подписка/отписка на комнаты

```ts
// Подписка на таблицу
socket.emit("subscribe.table", 12);

// Отписка от таблицы
socket.emit("unsubscribe.table", 12);

// Подписка на свою user-комнату
socket.emit("subscribe.user", 7);

// Отписка от своей user-комнаты
socket.emit("unsubscribe.user", 7);
```

Сервер вернет подтверждения:

- `subscribed.table`
- `subscribed.user`

### 4. Обработка ошибок доступа

```ts
socket.on("realtime.error", (error) => {
  // { code, message, ...details }
  console.error("realtime error", error);
});
```

Коды ошибок:

- `UNAUTHORIZED` — нет валидной сессии для подписки на table-room
- `TABLE_ACCESS_DENIED` — пользователь не состоит в таблице
- `USER_ACCESS_DENIED` — попытка подписаться на чужую user-room
- `INVALID_TABLE_ID` — некорректный tableId

### 5. События, которые отправляет сервер

События для `table:<tableId>`:

- `table.updated`
- `table.deleted`
- `column.created`
- `column.updated`
- `column.deleted`
- `card.created`
- `card.updated`
- `card.deleted`
- `invite.created`
- `invite.accepted`
- `invite.rejected`
- `notification.created`

События для `user:<userId>`:

- `table.created`
- `table.deleted`
- `invite.created`
- `invite.accepted`
- `invite.rejected`

Глобальное событие:

- `table.created.global`

### 6. Рекомендуемый шаблон интеграции (React)

```ts
import { useEffect } from "react";
import { socket } from "./socket";

export function useTableRealtime(tableId: number, userId: number) {
  useEffect(() => {
    socket.emit("subscribe.user", userId);
    socket.emit("subscribe.table", tableId);

    const onTableUpdated = (payload: unknown) => {
      console.log("table.updated", payload);
      // invalidate/query refetch/update store
    };

    const onCardUpdated = (payload: unknown) => {
      console.log("card.updated", payload);
    };

    socket.on("table.updated", onTableUpdated);
    socket.on("card.updated", onCardUpdated);

    return () => {
      socket.off("table.updated", onTableUpdated);
      socket.off("card.updated", onCardUpdated);
      socket.emit("unsubscribe.table", tableId);
      socket.emit("unsubscribe.user", userId);
    };
  }, [tableId, userId]);
}
```
