import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assembleFixedCodegenStaging,
  createFixedCodegenStagingPlan,
} from "../runner/codegen-staging.js";

describe("P2 fixed codegen staging", () => {
  it("has a closed argument-free 30-file inventory", () => {
    const plan = createFixedCodegenStagingPlan();
    expect(createFixedCodegenStagingPlan.length).toBe(0);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.entries)).toBe(true);
    expect(plan.entries).toHaveLength(30);
    expect(plan.stagingRoot).toMatch(
      /containers\/presentation-profiles\/staging\/codegen$/u,
    );
    expect(new Set(plan.entries.map((entry) => entry.targetPath)).size).toBe(
      30,
    );
  });

  it("stages only the selected codegen CLI runtime modules", () => {
    const targets = createFixedCodegenStagingPlan().entries.map(
      (entry) => entry.targetPath,
    );
    expect(targets.slice(0, 3)).toEqual([
      "presentation-runner.js",
      "package.json",
      "input-snapshot.txt",
    ]);
    expect(
      targets.filter((target) => target.startsWith("codegen/dist/")),
    ).toEqual([
      "codegen/dist/cli-runtime.js",
      "codegen/dist/cli.js",
      "codegen/dist/constants.js",
      "codegen/dist/coordinator-input.js",
      "codegen/dist/errors.js",
      "codegen/dist/generator.js",
      "codegen/dist/hash.js",
      "codegen/dist/manifest.js",
      "codegen/dist/scenario-context.js",
    ]);
    expect(targets.join("\n")).not.toMatch(
      /local-runner|scenario\.js|paths\.js|types\.js|\.d\.ts/u,
    );
  });

  it("stages the exact probe-core package closure including fixed child", () => {
    const targets = createFixedCodegenStagingPlan().entries.map(
      (entry) => entry.targetPath,
    );
    const packageRoot = "codegen/node_modules/@tskaigi-lab/probe-core";
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
    for (const entry of createFixedCodegenStagingPlan().entries) {
      expect(path.isAbsolute(entry.sourcePath)).toBe(true);
      expect(path.isAbsolute(entry.targetPath)).toBe(false);
      expect(entry.targetPath).not.toBe("");
      expect(entry.targetPath.split(path.sep)).not.toContain("..");
      expect(Object.isFrozen(entry)).toBe(true);
    }
  });

  it("keeps assembly fixed and import-safe", async () => {
    const source = await readFile(
      new URL("../runner/codegen-staging.js", import.meta.url),
      "utf8",
    );
    expect(assembleFixedCodegenStaging.length).toBe(0);
    expect(source).not.toContain("process.env");
    expect(source).not.toMatch(/\b(?:exec|spawn|rm)\s*\(/u);
    expect(source).not.toContain("docker.sock");
    expect(source).not.toContain("https:");
    expect(source).toContain("constants.COPYFILE_EXCL");
    expect(source).toContain("process.argv.length !== 2");
  });
});
