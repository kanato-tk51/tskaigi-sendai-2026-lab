import path from "node:path";

import type { TestProject } from "vitest/node";
import { describe, expect, it } from "vitest";

import {
  ADAPTER_ROOT,
  assertResolvedConfigContract,
} from "../src/config-contract.js";
import {
  CACHE_RELATIVE_PATH,
  CONFIG_LOADER,
  DESIGNATED_TEST_RELATIVE_PATH,
  GLOBAL_SETUP_RELATIVE_PATH,
  RESOLVED_CACHE_PROJECT_ID,
  SCENARIO_CONFIG_RELATIVE_PATH,
  SETUP_ENTRY_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
  VITEST_VERSION,
} from "../src/constants.js";
import {
  assertExactVersion,
  verifyVersionContract,
} from "../src/version-contract.js";

function resolvedProject(runRoot: string): TestProject {
  return {
    tmpDir: path.join(
      runRoot,
      TOOL_TEMP_RELATIVE_PATH,
      "fixedProjectTemp12345",
    ),
    config: {
      root: ADAPTER_ROOT,
      config: path.join(ADAPTER_ROOT, SCENARIO_CONFIG_RELATIVE_PATH),
      watch: false,
      cache: false,
      pool: "forks",
      minWorkers: 1,
      maxWorkers: 1,
      fileParallelism: false,
      isolate: true,
      poolOptions: {
        forks: { singleFork: true, minForks: 1, maxForks: 1 },
      },
      retry: 0,
      bail: 0,
      maxConcurrency: 1,
      sequence: { shuffle: false, concurrent: false, setupFiles: "list" },
      update: false,
      coverage: { enabled: false },
      typecheck: { enabled: false },
      api: { middlewareMode: true },
      ui: false,
      open: false,
      browser: { enabled: false },
      passWithNoTests: false,
      allowOnly: false,
      testTimeout: 2_000,
      hookTimeout: 2_000,
      teardownTimeout: 5_000,
      include: [DESIGNATED_TEST_RELATIVE_PATH],
      setupFiles: [path.join(ADAPTER_ROOT, SETUP_ENTRY_RELATIVE_PATH)],
      globalSetup: [path.join(ADAPTER_ROOT, GLOBAL_SETUP_RELATIVE_PATH)],
      project: [],
      deps: { optimizer: { web: { enabled: false }, ssr: { enabled: false } } },
    },
    vite: {
      config: {
        inlineConfig: { configLoader: CONFIG_LOADER },
        cacheDir: path.join(
          runRoot,
          CACHE_RELATIVE_PATH,
          "vitest",
          RESOLVED_CACHE_PROJECT_ID,
        ),
        optimizeDeps: { noDiscovery: true, include: [] },
      },
    },
  } as unknown as TestProject;
}

describe("Vitest version and resolved config contract", () => {
  it("matches root, lockfile, installed metadata, runtime policy, and CLI entry", async () => {
    await expect(verifyVersionContract()).resolves.toEqual({
      vitestCliPath: path.resolve(
        ADAPTER_ROOT,
        "../../node_modules/vitest/vitest.mjs",
      ),
    });
    expect(() => assertExactVersion("3.2.6", VITEST_VERSION)).toThrowError(
      expect.objectContaining({ code: "M2C_VERSION_MISMATCH" }),
    );
  });

  it("accepts only the fixed forks/single-worker/disabled-mode config", () => {
    const runRoot = "/tmp/tskaigi-vitest-m2c-config";
    expect(() =>
      assertResolvedConfigContract(
        resolvedProject(runRoot),
        runRoot,
        VITEST_VERSION,
        path.join(runRoot, TOOL_TEMP_RELATIVE_PATH),
      ),
    ).not.toThrow();

    const mismatch = resolvedProject(runRoot) as unknown as {
      config: { pool: string };
    };
    mismatch.config.pool = "threads";
    expect(() =>
      assertResolvedConfigContract(
        mismatch as unknown as TestProject,
        runRoot,
        VITEST_VERSION,
        path.join(runRoot, TOOL_TEMP_RELATIVE_PATH),
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONFIG_MISMATCH" }));

    expect(() =>
      assertResolvedConfigContract(
        resolvedProject(runRoot),
        runRoot,
        VITEST_VERSION,
        "/tmp",
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONFIG_MISMATCH" }));

    const externalTransformRoot = resolvedProject(runRoot) as unknown as {
      tmpDir: string;
    };
    externalTransformRoot.tmpDir = "/tmp/unexpected-vitest-transform-temp";
    expect(() =>
      assertResolvedConfigContract(
        externalTransformRoot as unknown as TestProject,
        runRoot,
        VITEST_VERSION,
        path.join(runRoot, TOOL_TEMP_RELATIVE_PATH),
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONFIG_MISMATCH" }));
  });
});
