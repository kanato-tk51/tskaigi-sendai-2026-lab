import { mkdtemp, readdir, rm } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("lab-cli package root", () => {
  it("imports without starting filesystem work", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-import-");
    try {
      const before = await readdir(temporaryRoot);
      const module = await import("../src/index.js");
      expect(module.collectRun).toBeTypeOf("function");
      expect(module.regenerateFixedScenario).toBeTypeOf("function");
      expect(await readdir(temporaryRoot)).toEqual(before);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
});
