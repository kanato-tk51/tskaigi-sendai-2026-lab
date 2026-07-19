import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assembleFixedViteStaging,
  createFixedViteStagingPlan,
} from "../runner/vite-staging.js";

describe("P2 fixed Vite staging", () => {
  it("has a closed argument-free 128-file inventory", () => {
    const plan = createFixedViteStagingPlan();
    expect(createFixedViteStagingPlan.length).toBe(0);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.entries)).toBe(true);
    expect(plan.entries).toHaveLength(128);
    expect(plan.stagingRoot).toMatch(
      /containers\/presentation-profiles\/staging\/vite$/u,
    );
    expect(new Set(plan.entries.map((entry) => entry.targetPath)).size).toBe(
      128,
    );
  });

  it("stages the fixed adapter source and minimal runtime closure", () => {
    const targets = createFixedViteStagingPlan().entries.map(
      (entry) => entry.targetPath,
    );
    const adapterRoot = "packages/vite-plugin-probe";
    expect(targets.slice(0, 6)).toEqual([
      "presentation-runner.js",
      "package.json",
      `${adapterRoot}/package.json`,
      `${adapterRoot}/vite.scenario.config.ts`,
      `${adapterRoot}/fixture/entry.ts`,
      `${adapterRoot}/fixture/designated.ts`,
    ]);
    expect(
      targets.filter((target) => target.startsWith(`${adapterRoot}/src/`)),
    ).toEqual([
      `${adapterRoot}/src/config-contract.ts`,
      `${adapterRoot}/src/constants.ts`,
      `${adapterRoot}/src/coordinator-input.ts`,
      `${adapterRoot}/src/errors.ts`,
      `${adapterRoot}/src/plugin-entry.ts`,
      `${adapterRoot}/src/plugin-runtime.ts`,
      `${adapterRoot}/src/scenario-context.ts`,
    ]);
    expect(
      targets.filter((target) => target.startsWith(`${adapterRoot}/dist/`)),
    ).toEqual([
      `${adapterRoot}/dist/constants.js`,
      `${adapterRoot}/dist/coordinator-input.js`,
      `${adapterRoot}/dist/errors.js`,
      `${adapterRoot}/dist/hash.js`,
      `${adapterRoot}/dist/manifest.js`,
      `${adapterRoot}/dist/plugin-entry.js`,
      `${adapterRoot}/dist/plugin-runtime.js`,
      `${adapterRoot}/dist/scenario-context.js`,
      `${adapterRoot}/dist/transform-target.js`,
      `${adapterRoot}/dist/version-contract.js`,
    ]);
    expect(targets.join("\n")).not.toMatch(
      /local-runner|scenario\.js|process-lifecycle|tool-temporary|\.d\.ts/u,
    );
  });

  it("stages exact Vite tool packages and Linux amd64 binaries", () => {
    const plan = createFixedViteStagingPlan();
    const targets = new Set(plan.entries.map((entry) => entry.targetPath));
    for (const required of [
      "node_modules/vite/bin/vite.js",
      "node_modules/vite/dist/node/cli.js",
      "node_modules/rollup/dist/es/rollup.js",
      "node_modules/rollup/dist/native.js",
      "node_modules/esbuild/lib/main.js",
      "node_modules/fdir/dist/index.mjs",
      "node_modules/picomatch/index.js",
      "node_modules/tinyglobby/dist/index.mjs",
      "node_modules/postcss/lib/postcss.mjs",
      "node_modules/nanoid/non-secure/index.cjs",
      "node_modules/picocolors/picocolors.js",
      "node_modules/source-map-js/source-map.js",
      "node_modules/@rollup/rollup-linux-x64-gnu/rollup.linux-x64-gnu.node",
      "node_modules/@esbuild/linux-x64/bin/esbuild",
    ]) {
      expect(targets.has(required), required).toBe(true);
    }
    expect(
      plan.entries
        .filter((entry) => entry.mode === 0o555)
        .map((entry) => entry.targetPath),
    ).toEqual(["node_modules/@esbuild/linux-x64/bin/esbuild"]);
    expect(targets.has("node_modules/esbuild/install.js")).toBe(false);
    expect(targets.has("node_modules/vite/README.md")).toBe(false);
  });

  it("stages the exact probe-core runtime closure including fixed child", () => {
    const targets = createFixedViteStagingPlan().entries.map(
      (entry) => entry.targetPath,
    );
    const packageRoot = "node_modules/@tskaigi-lab/probe-core";
    expect(targets.filter((target) => target.startsWith(packageRoot))).toEqual([
      `${packageRoot}/package.json`,
      `${packageRoot}/dist/attempts/child.js`,
      `${packageRoot}/dist/attempts/environment.js`,
      `${packageRoot}/dist/attempts/file.js`,
      `${packageRoot}/dist/attempts/network.js`,
      `${packageRoot}/dist/constants.js`,
      `${packageRoot}/dist/errors.js`,
      `${packageRoot}/dist/event.js`,
      `${packageRoot}/dist/file-preflight.js`,
      `${packageRoot}/dist/fixed-child.js`,
      `${packageRoot}/dist/hash.js`,
      `${packageRoot}/dist/index.js`,
      `${packageRoot}/dist/path-policy.js`,
      `${packageRoot}/dist/preparation.js`,
      `${packageRoot}/dist/safe-data.js`,
      `${packageRoot}/dist/session.js`,
      `${packageRoot}/dist/sink.js`,
      `${packageRoot}/dist/validation.js`,
    ]);
  });

  it("uses only absolute repository sources and contained relative targets", () => {
    for (const entry of createFixedViteStagingPlan().entries) {
      expect(path.isAbsolute(entry.sourcePath)).toBe(true);
      expect(path.isAbsolute(entry.targetPath)).toBe(false);
      expect(entry.targetPath).not.toBe("");
      expect(entry.targetPath.split(path.sep)).not.toContain("..");
      expect([0o444, 0o555]).toContain(entry.mode);
      expect(Object.isFrozen(entry)).toBe(true);
    }
  });

  it("keeps assembly fixed and import-safe", async () => {
    const source = await readFile(
      new URL("../runner/vite-staging.js", import.meta.url),
      "utf8",
    );
    expect(assembleFixedViteStaging.length).toBe(0);
    expect(source).not.toContain("process.env");
    expect(source).not.toMatch(/\b(?:exec|spawn|rm)\s*\(/u);
    expect(source).not.toContain("docker.sock");
    expect(source).not.toContain("https:");
    expect(source).not.toContain("readdir");
    expect(source).toContain("constants.COPYFILE_EXCL");
    expect(source).toContain("process.argv.length !== 2");
  });
});
