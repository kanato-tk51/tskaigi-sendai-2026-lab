import path from "node:path";

import { defineConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";

import { ADAPTER_ROOT } from "./src/config-contract.js";
import { readCoordinatorInputs } from "./src/coordinator-input.js";
import {
  CACHE_RELATIVE_PATH,
  DESIGNATED_TEST_RELATIVE_PATH,
  GLOBAL_SETUP_RELATIVE_PATH,
  HOOK_TIMEOUT_MS,
  SETUP_ENTRY_RELATIVE_PATH,
  TEARDOWN_TIMEOUT_MS,
  TEST_TIMEOUT_MS,
} from "./src/constants.js";
import { M2CReporter } from "./src/reporter.js";

const inputs = readCoordinatorInputs();

export const SCENARIO_CONFIG = {
  root: ADAPTER_ROOT,
  cacheDir: path.join(inputs.runRoot, CACHE_RELATIVE_PATH),
  optimizeDeps: {
    disabled: true,
    noDiscovery: true,
    include: [],
  },
  test: {
    watch: false,
    cache: false,
    include: [DESIGNATED_TEST_RELATIVE_PATH],
    exclude: [],
    setupFiles: [SETUP_ENTRY_RELATIVE_PATH],
    globalSetup: [GLOBAL_SETUP_RELATIVE_PATH],
    pool: "forks",
    minWorkers: 1,
    maxWorkers: 1,
    fileParallelism: false,
    isolate: true,
    poolOptions: {
      forks: {
        singleFork: true,
        minForks: 1,
        maxForks: 1,
      },
    },
    retry: 0,
    bail: 0,
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
      concurrent: false,
      setupFiles: "list",
    },
    update: false,
    coverage: { enabled: false },
    typecheck: { enabled: false },
    api: false,
    ui: false,
    open: false,
    browser: { enabled: false },
    passWithNoTests: false,
    allowOnly: false,
    testTimeout: TEST_TIMEOUT_MS,
    hookTimeout: HOOK_TIMEOUT_MS,
    teardownTimeout: TEARDOWN_TIMEOUT_MS,
    reporters: [new M2CReporter()],
    deps: {
      optimizer: {
        web: { enabled: false },
        ssr: { enabled: false },
      },
    },
  },
} satisfies UserConfig;

export default defineConfig(SCENARIO_CONFIG);
