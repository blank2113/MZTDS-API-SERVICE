import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // setupFiles: ["./src/"],
    globals: true,
    sequence: {
      concurrent: false,
    },
  },
});
