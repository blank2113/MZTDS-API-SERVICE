import admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;

export function firebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    // 💡 ВАЖНО: в тестах и CI просто не поднимаем Firebase
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  }

  const serviceAccount = JSON.parse(raw);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseApp;
}
