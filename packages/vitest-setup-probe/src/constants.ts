export const ADAPTER_NAME = "@tskaigi-lab/adapter-vitest-setup" as const;
export const ADAPTER_VERSION = "0.0.0" as const;
export const NODE_VERSION = "v20.18.2" as const;
export const NPM_VERSION = "11.12.1" as const;
export const VITEST_VERSION = "3.2.7" as const;

export const PROVIDED_CONTEXT_KEY = "m2cVitestContext" as const;
export const PROVIDED_CONTEXT_SCHEMA_VERSION = "m2c-vitest-context/v1" as const;
export const REPORT_SCHEMA_VERSION = "m2c-vitest-report/v1" as const;

export const RUN_ID_VARIABLE = "PROBE_CANARY_M2C_RUN_ID" as const;
export const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2C_RUN_ROOT" as const;
export const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2C_LOOPBACK_PORT" as const;
export const TOOL_TEMP_ROOT_VARIABLE =
  "PROBE_CANARY_M2C_TOOL_TEMP_ROOT" as const;
export const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2C_ENVIRONMENT" as const;

export const DISPOSABLE_CANARY_VALUE =
  "m2c-disposable-environment-canary" as const;
export const CANARY_FILE_CONTENT = "m2c disposable file canary\n" as const;
export const SOURCE_TARGET_CONTENT =
  "export const designatedValue = 42;\n" as const;
export const APPROVED_SOURCE_HASH =
  "sha256:4a0a5b2872ecc4458208c9ede8484b2ead2820dd966d6772340ef7c6d674361b" as const;
export const LOOPBACK_RESPONSE_BODY = "probe-network-v1\n" as const;

export const SCENARIO_ID = "m2c-vitest-setup-local-contract" as const;
export const PRODUCER_ID = "vitest-fork-worker" as const;
export const CWD_ID = "vitest-adapter-workspace" as const;
export const SETUP_LOGICAL_ID = "vitest-setup-entry" as const;
export const TEST_FILE_LOGICAL_ID = "vitest-designated-test-file" as const;

export const DESIGNATED_TEST_RELATIVE_PATH =
  "fixture/designated.test.ts" as const;
export const DESIGNATED_SOURCE_RELATIVE_PATH =
  "fixture/source-target.ts" as const;
export const SETUP_ENTRY_RELATIVE_PATH = "src/setup-entry.ts" as const;
export const GLOBAL_SETUP_RELATIVE_PATH = "src/global-setup.ts" as const;
export const SCENARIO_CONFIG_RELATIVE_PATH =
  "vitest.scenario.config.ts" as const;
export const CONFIG_LOADER = "runner" as const;

export const CANARY_RELATIVE_PATH = "fixture/canary.txt" as const;
export const SOURCE_COPY_RELATIVE_PATH = "fixture/source-target.ts" as const;
export const OUTPUT_RELATIVE_PATH = "output/direct-write-marker.json" as const;
export const SEGMENT_RELATIVE_PATH = `${PRODUCER_ID}.jsonl` as const;
export const REPORT_RELATIVE_PATH = "coordinator-report.json" as const;
export const CACHE_RELATIVE_PATH = "cache/vite" as const;
export const TOOL_TEMP_RELATIVE_PATH = "tool-temp" as const;
export const VITE_CONFIG_TEMP_RELATIVE_PATH =
  "node_modules/.vite-temp" as const;
export const FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH = "node_modules" as const;
export const TOOL_TEMP_LOGICAL_ID = "vitest-tool-temporary-root" as const;
export const CONFIG_TEMP_LOGICAL_ID = "vite-config-temporary-root" as const;
export const TRANSFORM_TEMP_LOGICAL_ID =
  "vitest-transform-temporary-root" as const;
export const RESOLVED_CACHE_PROJECT_ID =
  "da39a3ee5e6b4b0d3255bfef95601890afd80709" as const;

export const EVENT_TARGET_ID = "vitest-event-segment" as const;
export const ENVIRONMENT_TARGET_ID = "vitest-environment-canary" as const;
export const CANARY_FILE_TARGET_ID = "vitest-file-canary" as const;
export const SOURCE_HASH_TARGET_ID = "vitest-source-snapshot" as const;
export const OUTPUT_TARGET_ID = "vitest-direct-output" as const;
export const LOOPBACK_TARGET_ID = "vitest-loopback" as const;
export const CHILD_TARGET_ID = "vitest-fixed-child" as const;

export const ATTEMPT_IDS = Object.freeze({
  environment: "vitest-attempt-environment",
  fileRead: "vitest-attempt-file-read",
  fileHash: "vitest-attempt-file-hash",
  fileWrite: "vitest-attempt-file-write",
  loopback: "vitest-attempt-loopback",
  child: "vitest-attempt-child",
} as const);

export const ROUTE_IDS = Object.freeze({
  lateModuleCheckpoint: "vitest-late-module-evaluation-checkpoint",
  setupBodyCheckpoint: "vitest-setup-body-checkpoint",
} as const);

export const PHASES = Object.freeze({
  lateModuleCheckpoint: "setup-file-late-module-checkpoint",
  setupBodyCheckpoint: "setup-file-body-checkpoint",
} as const);

export const EXPECTED_EVENT_COUNT = 8 as const;
export const EXPECTED_ROUTE_COUNT = 2 as const;
export const EXPECTED_CAPABILITY_COUNT = 6 as const;
export const EXPECTED_TOOL_API_CHANGE_COUNT = 0 as const;
export const EXPECTED_TEST_FILE_COUNT = 1 as const;
export const EXPECTED_TEST_CASE_COUNT = 1 as const;
export const EXPECTED_SETUP_FILE_COUNT = 1 as const;
export const EXPECTED_PRODUCER_COUNT = 1 as const;

export const TEST_TIMEOUT_MS = 2_000 as const;
export const HOOK_TIMEOUT_MS = 2_000 as const;
export const TEARDOWN_TIMEOUT_MS = 5_000 as const;
export const OUTER_PROCESS_TIMEOUT_MS = 30_000 as const;
export const TERMINATION_GRACE_MS = 500 as const;
export const FORCE_TERMINATION_CLOSE_MS = 2_000 as const;
export const PROCESS_RESIDUE_TIMEOUT_MS = 2_000 as const;
export const PROCESS_RESIDUE_POLL_MS = 25 as const;
export const LIFECYCLE_TEST_TIMEOUT_MS = 100 as const;
export const LIFECYCLE_TEST_MAX_OUTPUT_BYTES = 1_024 as const;
export const EXPECTED_GRACEFUL_CLOSE_SIGNAL = "SIGTERM" as const;
export const EXPECTED_FORCE_CLOSE_SIGNAL = "SIGKILL" as const;
export const ATTEMPT_TIMEOUT_MS = 2_000 as const;
export const MAX_FIXTURE_BYTES = 1_024 as const;
export const MAX_CHILD_OUTPUT_BYTES = 1_024 as const;
export const MAX_TOOL_OUTPUT_BYTES = 65_536 as const;

export const FIXED_VITEST_ARGUMENTS = Object.freeze([
  "run",
  "--config",
  SCENARIO_CONFIG_RELATIVE_PATH,
  "--configLoader",
  CONFIG_LOADER,
  DESIGNATED_TEST_RELATIVE_PATH,
] as const);

export const EXPECTED_EVENT_ORDER = Object.freeze([
  `route-invocation:${ROUTE_IDS.lateModuleCheckpoint}`,
  `route-invocation:${ROUTE_IDS.setupBodyCheckpoint}`,
  `capability-attempt:${ATTEMPT_IDS.environment}`,
  `capability-attempt:${ATTEMPT_IDS.fileRead}`,
  `capability-attempt:${ATTEMPT_IDS.fileHash}`,
  `capability-attempt:${ATTEMPT_IDS.fileWrite}`,
  `capability-attempt:${ATTEMPT_IDS.loopback}`,
  `capability-attempt:${ATTEMPT_IDS.child}`,
] as const);
