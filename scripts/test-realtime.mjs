/**
 * Тест realtime (Socket.IO) — запускается через:
 *   node scripts/test-realtime.mjs
 * Требует: сервер уже запущен на localhost:3000
 */
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";
const STEP_TIMEOUT = 3000;
let passed = 0,
  failed = 0;

function log(ok, label, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? " — " + detail : ""}`);
  ok ? passed++ : failed++;
}

function waitForEvent(socket, event, ms = STEP_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      socket.off(event, h);
      reject(new Error(`Timeout: ${event}`));
    }, ms);
    function h(data) {
      clearTimeout(t);
      resolve(data);
    }
    socket.once(event, h);
  });
}

async function run() {
  const socket = io(SERVER_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: { tableIds: [] },
    reconnection: false,
    timeout: STEP_TIMEOUT,
  });

  try {
    await waitForEvent(socket, "connect");
    log(true, "WebSocket connected", `id=${socket.id}`);
  } catch {
    log(false, "WebSocket connect", "не удалось подключиться");
    return summary();
  }

  // 1. ping → pong
  socket.emit("ping");
  try {
    const d = await waitForEvent(socket, "pong");
    log(typeof d?.ts === "number", "ping → pong", `ts=${d?.ts}`);
  } catch {
    log(false, "ping → pong", "timeout");
  }

  // 2. subscribe.table без сессии → UNAUTHORIZED
  socket.emit("subscribe.table", 9999);
  try {
    const e = await waitForEvent(socket, "realtime.error");
    log(
      e?.code === "UNAUTHORIZED",
      "subscribe.table без сессии → UNAUTHORIZED",
      `code=${e?.code}`,
    );
  } catch {
    log(false, "subscribe.table без сессии", "timeout");
  }

  // 3. subscribe.user на чужой id → USER_ACCESS_DENIED
  socket.emit("subscribe.user", 9999);
  try {
    const e = await waitForEvent(socket, "realtime.error");
    log(
      e?.code === "USER_ACCESS_DENIED",
      "subscribe.user чужой id → USER_ACCESS_DENIED",
      `code=${e?.code}`,
    );
  } catch {
    log(false, "subscribe.user чужой id", "timeout");
  }

  // 4. subscribe.table с невалидным id → INVALID_TABLE_ID
  socket.emit("subscribe.table", "not_a_number");
  try {
    const e = await waitForEvent(socket, "realtime.error");
    log(
      e?.code === "INVALID_TABLE_ID",
      "subscribe.table нечисло → INVALID_TABLE_ID",
      `code=${e?.code}`,
    );
  } catch {
    log(false, "subscribe.table нечисло", "timeout");
  }

  socket.close();
  summary();
}

function summary() {
  console.log(`\n──────────────────────────────`);
  console.log(`Passed: ${passed}  Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
