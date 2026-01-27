// import { prisma } from "../lib/prisma.js";
// import { bot } from "./bot.service.js";

// const defaultAdmins: number[] = [672818350, 61492836];

// async function sendWithRetry(
//   chatId: number,
//   text: string,
//   maxTries = 3,
// ): Promise<boolean> {
//   let lastError: unknown = null;

//   for (let attempt = 1; attempt <= maxTries; attempt++) {
//     try {
//       await bot.api.sendMessage(chatId, text, { parse_mode: "Markdown" });
//       return true;
//     } catch (err: any) {
//       lastError = err;
//       const status = err?.response?.status ?? err?.statusCode ?? err?.code;
//       console.warn(
//         `⚠️ Attempt ${attempt}/${maxTries} failed for ${chatId}:`,
//         err?.message ?? err,
//       );

//       if (
//         status &&
//         Number(status) >= 400 &&
//         Number(status) < 500 &&
//         Number(status) !== 429
//       )
//         break;

//       await new Promise((r) => setTimeout(r, 500 * attempt));
//     }
//   }

//   console.error(
//     `❌ Message for ${chatId} failed after ${maxTries} attempts`,
//     lastError,
//   );
//   return false;
// }

// export async function notifyThroughBot(id: number, text: string) {
//   const users = await prisma.userToTable.findMany({
//     where: {
//       table_id: id,
//     },
//     select:{

//     }
//   });

//   if (!defaultAdmins.length) return console.warn("⚠️ No admins to notify");

//   await Promise.all(
//     defaultAdmins.map(async (adminId) => {
//       if (!adminId) return;
//       const ok = await sendWithRetry(adminId, text);
//       if (ok) console.log(`✅ Notified admin ${adminId}`);
//       else console.error(`❌ Failed to notify admin ${adminId}`);
//     }),
//   );
// }
