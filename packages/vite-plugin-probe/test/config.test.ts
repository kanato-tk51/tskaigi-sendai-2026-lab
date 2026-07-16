import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONFIG_RELATIVE_PATH,
  FIXED_VITE_ARGUMENTS,
  VITE_ENV_PREFIX,
} from "../src/constants.js";
import { FIXED_ADAPTER_ROOT } from "../src/paths.js";

describe("fixed Vite config and invocation", () => {
  it("contains the approved build-only resolved options", async () => {
    const source = await readFile(
      path.join(FIXED_ADAPTER_ROOT, CONFIG_RELATIVE_PATH),
      "utf8",
    );
    for (const required of [
      'command !== "build"',
      'mode !== "production"',
      "publicDir: false",
      "envDir: false",
      `envPrefix: VITE_ENV_PREFIX`,
      "watch: null",
      "write: true",
      "emptyOutDir: true",
      "copyPublicDir: false",
      "manifest: false",
      "ssrManifest: false",
      "sourcemap: false",
      "minify: false",
      "modulePreload: false",
      "assetsInlineLimit: 0",
      "reportCompressedSize: false",
      "cache: false",
      "noDiscovery: true",
      "include: []",
      'format: "es"',
      "inlineDynamicImports: true",
    ]) {
      expect(source).toContain(required);
    }
    expect(source).not.toContain("optimizeDeps.disabled");
    expect(source).not.toMatch(/\bcache:\s*false[\s\S]*\bbuild:/u);
    expect(VITE_ENV_PREFIX).toMatch(/^PROBE_CANARY_/u);
  });

  it("has no dev, serve, preview, watch, HMR, or arbitrary CLI path", () => {
    expect(FIXED_VITE_ARGUMENTS).toEqual([
      "build",
      "--config",
      "vite.scenario.config.ts",
      "--configLoader",
      "runner",
      "--mode",
      "production",
    ]);
    expect(FIXED_VITE_ARGUMENTS).not.toEqual(
      expect.arrayContaining(["serve", "dev", "preview", "--watch", "hmr"]),
    );
  });
});
