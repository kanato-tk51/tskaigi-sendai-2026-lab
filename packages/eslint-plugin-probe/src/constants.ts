export const ADAPTER_NAME = "@tskaigi-lab/adapter-eslint" as const;
export const ADAPTER_VERSION = "0.0.0" as const;
export const ESLINT_VERSION = "9.39.5" as const;
export const NPM_VERSION = "11.12.1" as const;

export const SCENARIO_MODES = ["lint-only", "fix"] as const;
export const FIXTURE_FILE_COUNT = 1 as const;
export const FIXTURE_LOGICAL_ID = "fixture-main" as const;
export const FIXTURE_INITIAL_SOURCE = "const answer = 41;\n" as const;
export const FIXTURE_FIXED_SOURCE = "const answer = 42;\n" as const;
export const FIX_REPLACEMENT = "42" as const;
export const RULE_ID = "probe/fixed-answer" as const;

export const ENVIRONMENT_VARIABLE = "PROBE_CANARY_ESLINT_M2B" as const;
export const DISPOSABLE_CANARY_VALUE = "m2b-disposable-canary" as const;
export const CANARY_FILE_CONTENT = "m2b disposable file canary\n" as const;
export const SOURCE_SNAPSHOT_CONTENT = "m2b source snapshot\n" as const;

export const PRODUCER_ID = "eslint-producer" as const;
export const EVENT_TARGET_ID = "eslint-event-segment" as const;
export const ENVIRONMENT_TARGET_ID = "eslint-env-canary" as const;
export const CANARY_FILE_TARGET_ID = "eslint-file-canary" as const;
export const SOURCE_HASH_TARGET_ID = "eslint-source-snapshot" as const;
export const OUTPUT_TARGET_ID = "eslint-direct-output" as const;
export const LOOPBACK_TARGET_ID = "eslint-loopback" as const;
export const CHILD_TARGET_ID = "eslint-fixed-child" as const;
export const TOOL_SOURCE_TARGET_ID = "eslint-source-target" as const;

export const ATTEMPT_IDS = Object.freeze({
  environment: "eslint-attempt-environment",
  fileRead: "eslint-attempt-file-read",
  fileHash: "eslint-attempt-file-hash",
  fileWrite: "eslint-attempt-file-write",
  loopback: "eslint-attempt-loopback",
  child: "eslint-attempt-child",
} as const);

export const ROUTE_IDS = Object.freeze({
  moduleEvaluation: "eslint-module-evaluation",
  pluginInitialization: "eslint-plugin-initialization",
  ruleCreate: "eslint-rule-create",
  visitorCallback: "eslint-program-visitor",
  fixerCallback: "eslint-fixer-callback",
} as const);

export const TOOL_API_CHANGE_ID = "eslint-source-fix" as const;

export const PHASES = Object.freeze({
  moduleEvaluation: "module-evaluation",
  pluginInitialization: "plugin-initialization",
  ruleCreate: "rule-create",
  visitorCallback: "visitor-callback",
  fixerCallback: "fixer-callback",
  officialApiChange: "official-api-change",
} as const);

export const CAPABILITY_ATTEMPT_COUNT = 6 as const;
export const LOOPBACK_TIMEOUT_MS = 2_000 as const;
export const CHILD_TIMEOUT_MS = 2_000 as const;
export const MAX_FIXTURE_BYTES = 1_024 as const;
export const MAX_CHILD_OUTPUT_BYTES = 1_024 as const;
