import { vi } from "vitest";

vi.mock("firebase-admin", () => {
  return {
    credential: { cert: vi.fn() },
    initializeApp: vi.fn(),
    apps: [],
    messaging: () => ({
      send: vi.fn().mockResolvedValue({}), // пуш просто "успешно"
    }),
  };
});
