export const ADAPTER_NAME = "@tskaigi-lab/adapter-codegen" as const;
export const ADAPTER_VERSION = "0.0.0" as const;
export const NODE_VERSION = "v20.18.2" as const;
export const NPM_VERSION = "11.12.1" as const;
export const CODEGEN_VERSION = "0.0.0" as const;

export const VARIANTS = Object.freeze(["observe", "api", "dry-run"] as const);
export type ScenarioVariant = (typeof VARIANTS)[number];

export const RUN_ID_VARIABLE = "PROBE_CANARY_M2E_RUN_ID" as const;
export const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2E_RUN_ROOT" as const;
export const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2E_LOOPBACK_PORT" as const;
export const VARIANT_VARIABLE = "PROBE_CANARY_M2E_VARIANT" as const;
export const SCENARIO_ID_VARIABLE = "PROBE_CANARY_M2E_SCENARIO_ID" as const;
export const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2E_ENVIRONMENT" as const;
export const DISPOSABLE_CANARY_VALUE =
  "m2e-disposable-environment-canary" as const;

export const SCENARIO_ID_PREFIX = "m2e-codegen" as const;
export const SELECTED_PROFILE_SCENARIO_IDS = Object.freeze([
  "codegen-observe-p",
  "codegen-observe-c",
] as const);
export type SelectedProfileScenarioId =
  (typeof SELECTED_PROFILE_SCENARIO_IDS)[number];
export type CodegenScenarioId =
  `${typeof SCENARIO_ID_PREFIX}-${ScenarioVariant}` | SelectedProfileScenarioId;
export const PRODUCER_ID = "codegen-cli-producer" as const;
export const CWD_ID = "codegen-adapter-workspace" as const;
export const EVENT_TARGET_ID = "codegen-event-segment" as const;
export const ENVIRONMENT_TARGET_ID = "codegen-environment-canary" as const;
export const CANARY_FILE_TARGET_ID = "codegen-file-canary" as const;
export const SOURCE_HASH_TARGET_ID = "codegen-input-snapshot" as const;
export const DIRECT_OUTPUT_TARGET_ID = "codegen-direct-output" as const;
export const LOOPBACK_TARGET_ID = "codegen-loopback" as const;
export const CHILD_TARGET_ID = "codegen-fixed-child" as const;
export const ARTIFACT_TARGET_ID = "codegen-generated-artifact" as const;

export const ROUTE_IDS = Object.freeze({
  startup: "codegen-cli-startup",
  argumentParse: "codegen-argument-parse",
  generationStart: "codegen-generation-start",
  fileWrite: "codegen-file-write",
  completion: "codegen-completion",
} as const);

export const ATTEMPT_IDS = Object.freeze({
  environment: "codegen-attempt-environment",
  fileRead: "codegen-attempt-file-read",
  fileHash: "codegen-attempt-file-hash",
  fileWrite: "codegen-attempt-file-write",
  loopback: "codegen-attempt-loopback",
  child: "codegen-attempt-child",
} as const);

export const TOOL_API_CHANGE_ID = "codegen-generation-api-change" as const;

export const PHASES = Object.freeze({
  startup: "cli-startup",
  argumentParse: "argument-parse",
  generationStart: "generation-start",
  generationApi: "generation-api",
  fileWrite: "file-write",
  completion: "completion",
} as const);

export const ENTRY_RELATIVE_PATH = "fixture/input.txt" as const;
export const INPUT_SNAPSHOT_RELATIVE_PATH = "input-snapshot.txt" as const;
export const CANARY_RELATIVE_PATH = "canary/input.txt" as const;
export const DIRECT_OUTPUT_RELATIVE_PATH =
  "probe-output/direct-write-marker.json" as const;
export const OUTPUT_RELATIVE_PATH = "out/generated-artifact.txt" as const;
export const SEGMENT_RELATIVE_PATH = `${PRODUCER_ID}.jsonl` as const;
export const OUTPUT_FILE = "generated-artifact.txt" as const;

export const INPUT_CONTENT = "m2e fixed generator input\n" as const;
export const INPUT_SNAPSHOT_CONTENT = "m2e input snapshot\n" as const;
export const GENERATED_ARTIFACT_CONTENT = "m2e generated artifact\n" as const;
export const CANARY_FILE_CONTENT = "m2e disposable file canary\n" as const;

export const EXPECTED_ROUTE_COUNT = 5 as const;
export const EXPECTED_CAPABILITY_COUNT = 6 as const;
export const EXPECTED_TOOL_API_CHANGE_COUNT = 1 as const;
export const EXPECTED_EVENT_COUNT = 12 as const;
export const EXPECTED_PRODUCER_COUNT = 1 as const;

export const EXPECTED_EVENT_ORDER = Object.freeze([
  `route-invocation:${ROUTE_IDS.startup}`,
  `route-invocation:${ROUTE_IDS.argumentParse}`,
  `route-invocation:${ROUTE_IDS.generationStart}`,
  `capability-attempt:${ATTEMPT_IDS.environment}`,
  `capability-attempt:${ATTEMPT_IDS.fileRead}`,
  `capability-attempt:${ATTEMPT_IDS.fileHash}`,
  `capability-attempt:${ATTEMPT_IDS.fileWrite}`,
  `capability-attempt:${ATTEMPT_IDS.loopback}`,
  `capability-attempt:${ATTEMPT_IDS.child}`,
  `tool-api-change:${TOOL_API_CHANGE_ID}`,
  `route-invocation:${ROUTE_IDS.fileWrite}`,
  `route-invocation:${ROUTE_IDS.completion}`,
] as const);

export const ATTEMPT_TIMEOUT_MS = 2_000 as const;
export const MAX_FIXTURE_BYTES = 4_096 as const;
export const MAX_CHILD_OUTPUT_BYTES = 1_024 as const;
export const CLI_TIMEOUT_MS = 10_000 as const;
export const CLI_OUTPUT_BYTES = 8_192 as const;
export const LOCAL_RESULT_DIRECTORY = "results/runs/m2-e-codegen" as const;
