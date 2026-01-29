import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup-firebase-mock.ts"],
    globals: true,
    sequence: {
      concurrent: false,
    },
    exclude: [
      "node_modules",
      "dist",
      "build",
      ".next",
      "src/config/**",
      "src/scripts/**",
      "src/migrations/**",
    ],
  },
});
