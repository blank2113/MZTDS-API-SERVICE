import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/globalSetup.ts"],
    globals: true,
    retry: 3,
    pool: "forks",
    testTimeout: 10000,

    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    exclude: ["node_modules", "dist"],
  },
});
