import path from "node:path";
import { fileURLToPath } from "node:url";

import type { TestProject } from "vitest/node";

import {
  CACHE_RELATIVE_PATH,
  CONFIG_LOADER,
  DESIGNATED_TEST_RELATIVE_PATH,
  EXPECTED_SETUP_FILE_COUNT,
  GLOBAL_SETUP_RELATIVE_PATH,
  RESOLVED_CACHE_PROJECT_ID,
  SCENARIO_CONFIG_RELATIVE_PATH,
  SETUP_ENTRY_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
  VITEST_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { FixedProvidedContext } from "./types.js";

export const ADAPTER_ROOT = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);

function exactArray(
  actual: readonly unknown[] | undefined,
  expected: readonly unknown[],
): boolean {
  return (
    actual !== undefined &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function disabledApi(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const api = value as Record<string, unknown>;
  return api.middlewareMode === true && api.port === undefined;
}

export function assertProvidedBindingPaths(
  context: FixedProvidedContext,
  expectedRunRoot: string,
): void {
  const pathBindings = context.runtimeBindings.bindings.filter(
    (binding) => binding.kind === "path",
  );
  if (
    pathBindings.length !== 4 ||
    pathBindings.some((binding) => binding.rootPath !== expectedRunRoot)
  ) {
    throw new AdapterError("M2C_BINDING_INVALID");
  }
}

export function assertResolvedConfigContract(
  project: TestProject,
  runRoot: string,
  runtimeVitestVersion: string,
  runtimeTemporaryRoot: string,
): void {
  const config = project.config;
  const viteConfig = project.vite.config;
  const forks = config.poolOptions?.forks;
  const optimizer = config.deps?.optimizer;
  const projectFilter = config.project;
  const globalSetup = config.globalSetup;
  const expectedConfigPath = path.join(
    ADAPTER_ROOT,
    SCENARIO_CONFIG_RELATIVE_PATH,
  );
  const expectedSetupPath = path.join(ADAPTER_ROOT, SETUP_ENTRY_RELATIVE_PATH);
  const expectedGlobalSetupPath = path.join(
    ADAPTER_ROOT,
    GLOBAL_SETUP_RELATIVE_PATH,
  );
  const expectedCacheDir = path.join(runRoot, CACHE_RELATIVE_PATH);
  const expectedToolTempRoot = path.join(runRoot, TOOL_TEMP_RELATIVE_PATH);
  const expectedResolvedCacheDir = path.join(
    expectedCacheDir,
    "vitest",
    RESOLVED_CACHE_PROJECT_ID,
  );
  const projectTemporaryDirectory = (
    project as unknown as { readonly tmpDir?: unknown }
  ).tmpDir;
  const inlineConfig = viteConfig.inlineConfig;

  if (
    runtimeVitestVersion !== VITEST_VERSION ||
    config.root !== ADAPTER_ROOT ||
    config.config !== expectedConfigPath ||
    config.watch !== false ||
    config.cache !== false ||
    config.pool !== "forks" ||
    config.minWorkers !== 1 ||
    config.maxWorkers !== 1 ||
    config.fileParallelism !== false ||
    config.isolate !== true ||
    forks?.singleFork !== true ||
    forks.minForks !== 1 ||
    forks.maxForks !== 1 ||
    config.retry !== 0 ||
    config.bail !== 0 ||
    config.maxConcurrency !== 1 ||
    config.sequence.shuffle !== false ||
    config.sequence.concurrent !== false ||
    config.sequence.setupFiles !== "list" ||
    config.update !== false ||
    config.coverage.enabled !== false ||
    config.typecheck.enabled !== false ||
    !disabledApi(config.api) ||
    config.ui !== false ||
    config.open !== false ||
    config.browser.enabled !== false ||
    config.passWithNoTests !== false ||
    config.allowOnly !== false ||
    config.testTimeout !== 2_000 ||
    config.hookTimeout !== 2_000 ||
    config.teardownTimeout !== 5_000 ||
    !exactArray(config.include, [DESIGNATED_TEST_RELATIVE_PATH]) ||
    !exactArray(config.setupFiles, [expectedSetupPath]) ||
    config.setupFiles.length !== EXPECTED_SETUP_FILE_COUNT ||
    !Array.isArray(globalSetup) ||
    !exactArray(globalSetup, [expectedGlobalSetupPath]) ||
    !Array.isArray(projectFilter) ||
    !exactArray(projectFilter, []) ||
    optimizer?.web?.enabled !== false ||
    optimizer.ssr?.enabled !== false ||
    inlineConfig.configLoader !== CONFIG_LOADER ||
    runtimeTemporaryRoot !== expectedToolTempRoot ||
    typeof projectTemporaryDirectory !== "string" ||
    path.dirname(projectTemporaryDirectory) !== expectedToolTempRoot ||
    !/^[\w-]{21}$/u.test(path.basename(projectTemporaryDirectory)) ||
    viteConfig.cacheDir !== expectedResolvedCacheDir ||
    viteConfig.optimizeDeps.disabled !== undefined ||
    viteConfig.optimizeDeps.noDiscovery !== true ||
    !exactArray(viteConfig.optimizeDeps.include, [])
  ) {
    throw new AdapterError("M2C_CONFIG_MISMATCH");
  }
}
