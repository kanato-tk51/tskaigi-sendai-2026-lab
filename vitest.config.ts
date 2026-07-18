import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tests/**/*.test.ts",
      "packages/*/test/**/*.test.ts",
      "containers/profile-control/test/**/*.test.ts",
    ],
    passWithNoTests: false,
  },
});
