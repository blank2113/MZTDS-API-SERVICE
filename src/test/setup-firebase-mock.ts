import { vi } from "vitest";

vi.mock("firebase-admin", () => {
  return {
    default: {
      initializeApp: vi.fn(),
      credential: {
        cert: vi.fn(),
      },
      messaging: () => ({
        send: vi.fn(),
      }),
      apps: [],
    },
  };
});
