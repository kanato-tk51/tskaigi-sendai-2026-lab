export const ADAPTER_NAME = "@tskaigi-lab/adapter-vite-plugin" as const;
export const ADAPTER_VERSION = "0.0.0" as const;
export const NODE_VERSION = "v20.18.2" as const;
export const NPM_VERSION = "11.12.1" as const;
export const VITE_VERSION = "6.4.3" as const;
export const ROLLUP_VERSION = "4.62.2" as const;
export const ESBUILD_VERSION = "0.25.12" as const;

export const VARIANTS = Object.freeze(["observe", "api"] as const);
export type ScenarioVariant = (typeof VARIANTS)[number];

export const RUN_ID_VARIABLE = "PROBE_CANARY_M2D_RUN_ID" as const;
export const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2D_RUN_ROOT" as const;
export const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2D_LOOPBACK_PORT" as const;
export const VARIANT_VARIABLE = "PROBE_CANARY_M2D_VARIANT" as const;
export const SCENARIO_ID_VARIABLE = "PROBE_CANARY_M2D_SCENARIO_ID" as const;
export const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2D_ENVIRONMENT" as const;
export const DISPOSABLE_CANARY_VALUE =
  "m2d-disposable-environment-canary" as const;
export const VITE_ENV_PREFIX = "PROBE_CANARY_M2D_VITE_" as const;

export const SCENARIO_ID = "m2d-vite-plugin-local-contract" as const;
export const SELECTED_PROFILE_SCENARIO_IDS = Object.freeze([
  "vite-observe-p",
  "vite-observe-c",
] as const);
export type SelectedProfileScenarioId =
  (typeof SELECTED_PROFILE_SCENARIO_IDS)[number];
export type ViteScenarioId = typeof SCENARIO_ID | SelectedProfileScenarioId;
export const PRODUCER_ID = "vite-coordinator" as const;
export const CWD_ID = "vite-adapter-workspace" as const;
export const PLUGIN_NAME = "tskaigi-m2d-dependency-probe" as const;
export const CONTROL_PLUGIN_NAME = "tskaigi-m2d-trusted-control" as const;

export const ENTRY_RELATIVE_PATH = "fixture/entry.ts" as const;
export const DESIGNATED_RELATIVE_PATH = "fixture/designated.ts" as const;
export const CONFIG_RELATIVE_PATH = "vite.scenario.config.ts" as const;
export const PLUGIN_SOURCE_RELATIVE_PATH = "src/plugin-entry.ts" as const;
export const PLUGIN_RUNTIME_SOURCE_RELATIVE_PATH =
  "src/plugin-runtime.ts" as const;
export const ENTRY_OUTPUT_FILE = "entry.js" as const;
export const CHUNK_OUTPUT_FILE = "chunk.js" as const;
export const ASSET_OUTPUT_FILE = "probe-asset.txt" as const;
export const FALLBACK_ASSET_OUTPUT_FILE = "asset.bin" as const;
export const SEGMENT_RELATIVE_PATH = `${PRODUCER_ID}.jsonl` as const;
export const CANARY_RELATIVE_PATH = "canary/input.txt" as const;
export const DIRECT_OUTPUT_RELATIVE_PATH =
  "probe-output/direct-write-marker.json" as const;
export const TOOL_TEMP_RELATIVE_PATH = "tool-temp" as const;
export const CACHE_RELATIVE_PATH = "cache/vite" as const;
export const OUT_DIR_RELATIVE_PATH = "out" as const;

export const CONFIG_LOADER = "runner" as const;
export const FIXED_VITE_ARGUMENTS = Object.freeze([
  "build",
  "--config",
  CONFIG_RELATIVE_PATH,
  "--configLoader",
  CONFIG_LOADER,
  "--mode",
  "production",
] as const);

export const CANARY_FILE_CONTENT = "m2d disposable file canary\n" as const;
export const DESIGNATED_SOURCE_CONTENT =
  'export const designatedValue = "M2D_DESIGNATED_ORIGINAL";\n' as const;
export const APPROVED_DESIGNATED_SOURCE_HASH =
  "sha256:379ba4149c5492855bdbbcd7a9f207c223cc8578dc62e51228e06416354ab770" as const;
export const TRANSFORMED_SOURCE_CONTENT =
  'export const designatedValue = "M2D_DESIGNATED_TRANSFORMED";\n' as const;
export const TRANSFORMED_LITERAL = "M2D_DESIGNATED_TRANSFORMED" as const;
export const EMITTED_ASSET_CONTENT = "m2d emitted asset\n" as const;
export const BUNDLE_MUTATION_TEXT =
  '\nconsole.log("M2D_BUNDLE_MUTATION");\n' as const;
export const BUNDLE_MUTATION_LITERAL = "M2D_BUNDLE_MUTATION" as const;

export const EVENT_TARGET_ID = "vite-event-segment" as const;
export const ENVIRONMENT_TARGET_ID = "vite-environment-canary" as const;
export const CANARY_FILE_TARGET_ID = "vite-file-canary" as const;
export const SOURCE_HASH_TARGET_ID = "vite-source-snapshot" as const;
export const DIRECT_OUTPUT_TARGET_ID = "vite-direct-output" as const;
export const LOOPBACK_TARGET_ID = "vite-loopback" as const;
export const CHILD_TARGET_ID = "vite-fixed-child" as const;
export const MODULE_TRANSFORM_TARGET_ID =
  "vite-designated-module-transform" as const;
export const EMITTED_ASSET_TARGET_ID = "vite-fixed-emitted-asset" as const;
export const BUNDLE_MUTATION_TARGET_ID = "vite-fixed-entry-bundle" as const;

export const ATTEMPT_IDS = Object.freeze({
  environment: "vite-attempt-environment",
  fileRead: "vite-attempt-file-read",
  fileHash: "vite-attempt-file-hash",
  fileWrite: "vite-attempt-file-write",
  loopback: "vite-attempt-loopback",
  child: "vite-attempt-child",
} as const);

export const ROUTE_IDS = Object.freeze({
  latePluginModuleCheckpoint: "vite-late-plugin-module-checkpoint",
  pluginFactory: "vite-plugin-factory",
  buildStart: "vite-build-start",
  designatedTransform: "vite-designated-transform",
  generateBundle: "vite-generate-bundle",
  writeBundle: "vite-write-bundle",
} as const);

export const TOOL_CHANGE_IDS = Object.freeze({
  moduleTransform: "vite-module-transform-change",
  emittedAsset: "vite-emitted-asset-change",
  bundleMutation: "vite-bundle-mutation-change",
} as const);

export const PHASES = Object.freeze({
  latePluginModuleCheckpoint: "late-plugin-module-checkpoint",
  pluginFactory: "plugin-factory",
  buildStart: "build-start",
  designatedTransform: "designated-transform",
  generateBundle: "generate-bundle",
  writeBundle: "write-bundle",
} as const);

export const EXPECTED_ROUTE_COUNT = 6 as const;
export const EXPECTED_CAPABILITY_COUNT = 6 as const;
export const EXPECTED_TOOL_API_CHANGE_COUNT = 3 as const;
export const EXPECTED_EVENT_COUNT = 15 as const;
export const EXPECTED_PRODUCER_COUNT = 1 as const;
export const EXPECTED_DESIGNATED_TRANSFORM_COUNT = 1 as const;

export const EXPECTED_EVENT_ORDER = Object.freeze([
  `route-invocation:${ROUTE_IDS.latePluginModuleCheckpoint}`,
  `route-invocation:${ROUTE_IDS.pluginFactory}`,
  `route-invocation:${ROUTE_IDS.buildStart}`,
  `capability-attempt:${ATTEMPT_IDS.environment}`,
  `capability-attempt:${ATTEMPT_IDS.fileRead}`,
  `capability-attempt:${ATTEMPT_IDS.fileHash}`,
  `capability-attempt:${ATTEMPT_IDS.fileWrite}`,
  `capability-attempt:${ATTEMPT_IDS.loopback}`,
  `capability-attempt:${ATTEMPT_IDS.child}`,
  `route-invocation:${ROUTE_IDS.designatedTransform}`,
  `tool-api-change:${TOOL_CHANGE_IDS.moduleTransform}`,
  `route-invocation:${ROUTE_IDS.generateBundle}`,
  `tool-api-change:${TOOL_CHANGE_IDS.emittedAsset}`,
  `tool-api-change:${TOOL_CHANGE_IDS.bundleMutation}`,
  `route-invocation:${ROUTE_IDS.writeBundle}`,
] as const);

export const ATTEMPT_TIMEOUT_MS = 2_000 as const;
export const MAX_FIXTURE_BYTES = 4_096 as const;
export const MAX_CHILD_OUTPUT_BYTES = 1_024 as const;
export const MAX_TOOL_OUTPUT_BYTES = 65_536 as const;
export const OUTER_PROCESS_TIMEOUT_MS = 30_000 as const;
export const TERMINATION_GRACE_MS = 500 as const;
export const FORCE_TERMINATION_CLOSE_MS = 2_000 as const;
export const PROCESS_RESIDUE_TIMEOUT_MS = 2_000 as const;
export const PROCESS_RESIDUE_POLL_MS = 25 as const;
export const EXPECTED_GRACEFUL_CLOSE_SIGNAL = "SIGTERM" as const;
export const EXPECTED_FORCE_CLOSE_SIGNAL = "SIGKILL" as const;

export const LOCAL_RESULT_DIRECTORY = "results/runs/m2-d-vite" as const;
