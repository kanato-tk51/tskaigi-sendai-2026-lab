export const ADAPTER_NAME = "@tskaigi-lab/adapter-npm-lifecycle" as const;
export const ADAPTER_VERSION = "0.0.0" as const;
export const NODE_VERSION = "v24.18.0" as const;
export const NPM_VERSION = "12.0.1" as const;

export const RUN_ID_VARIABLE = "PROBE_CANARY_M2A_RUN_ID" as const;
export const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2A_RUN_ROOT" as const;
export const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2A_LOOPBACK_PORT" as const;
export const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2A_ENVIRONMENT" as const;

export const SCENARIO_ID = "m2a-npm-lifecycle" as const;
export const PRODUCER_ID = "npm-lifecycle-producer" as const;
export const CWD_ID = "npm-lifecycle-consumer" as const;
export const EVENT_TARGET_ID = "npm-lifecycle-event-segment" as const;
export const ENVIRONMENT_TARGET_ID =
  "npm-lifecycle-environment-canary" as const;
export const CANARY_FILE_TARGET_ID = "npm-lifecycle-file-canary" as const;
export const SOURCE_HASH_TARGET_ID = "npm-lifecycle-source-snapshot" as const;
export const DIRECT_OUTPUT_TARGET_ID = "npm-lifecycle-direct-output" as const;
export const LOOPBACK_TARGET_ID = "npm-lifecycle-loopback" as const;
export const CHILD_TARGET_ID = "npm-lifecycle-fixed-child" as const;

export const ROUTE_ID = "npm-lifecycle-invocation" as const;
export const ATTEMPT_IDS = Object.freeze({
  environment: "npm-lifecycle-attempt-environment",
  fileRead: "npm-lifecycle-attempt-file-read",
  fileHash: "npm-lifecycle-attempt-file-hash",
  fileWrite: "npm-lifecycle-attempt-file-write",
  loopback: "npm-lifecycle-attempt-loopback",
  child: "npm-lifecycle-attempt-child",
} as const);

export const PHASE = "install-lifecycle" as const;
export const CANARY_RELATIVE_PATH = "canary/input.txt" as const;
export const SOURCE_SNAPSHOT_RELATIVE_PATH = "input-snapshot.txt" as const;
export const OUTPUT_RELATIVE_PATH =
  "probe-output/direct-write-marker.json" as const;
export const SEGMENT_RELATIVE_PATH = `${PRODUCER_ID}.jsonl` as const;

export const ATTEMPT_TIMEOUT_MS = 2_000 as const;
export const MAX_FIXTURE_BYTES = 4_096 as const;
export const MAX_CHILD_OUTPUT_BYTES = 1_024 as const;

export const EXPECTED_ROUTE_COUNT = 1 as const;
export const EXPECTED_CAPABILITY_COUNT = 6 as const;
export const EXPECTED_TOOL_API_CHANGE_COUNT = 0 as const;
export const EXPECTED_EVENT_COUNT = 7 as const;
export const EXPECTED_PRODUCER_COUNT = 1 as const;

export const EXPECTED_EVENT_ORDER = Object.freeze([
  `route-invocation:${ROUTE_ID}`,
  `capability-attempt:${ATTEMPT_IDS.environment}`,
  `capability-attempt:${ATTEMPT_IDS.fileRead}`,
  `capability-attempt:${ATTEMPT_IDS.fileHash}`,
  `capability-attempt:${ATTEMPT_IDS.fileWrite}`,
  `capability-attempt:${ATTEMPT_IDS.loopback}`,
  `capability-attempt:${ATTEMPT_IDS.child}`,
] as const);
