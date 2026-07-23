export const SCENARIO_DEFINITION_SCHEMA_VERSION =
  "lab-scenario-definition/v2" as const;
export const SCENARIO_SNAPSHOT_SCHEMA_VERSION =
  "lab-scenario-snapshot/v2" as const;
export const RUN_COMPLETION_SCHEMA_VERSION = "lab-run-completion/v1" as const;
export const CANONICAL_EVENT_SCHEMA_VERSION = "lab-canonical-event/v1" as const;
export const RUN_METADATA_SCHEMA_VERSION = "lab-run-metadata/v2" as const;
export const SUMMARY_SCHEMA_VERSION = "lab-summary/v2" as const;
export const HASH_EVIDENCE_SCHEMA_VERSION = "lab-hash-evidence/v2" as const;

export const CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION =
  "lab-scenario-definition/v3" as const;
export const CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION =
  "lab-scenario-snapshot/v3" as const;
export const CODEGEN_RUN_METADATA_SCHEMA_VERSION =
  "lab-run-metadata/v3" as const;
export const CODEGEN_SUMMARY_SCHEMA_VERSION = "lab-summary/v3" as const;
export const CODEGEN_HASH_EVIDENCE_SCHEMA_VERSION =
  "lab-hash-evidence/v3" as const;

export const CODEGEN_SCENARIO_IDS = Object.freeze([
  "codegen-observe-p",
  "codegen-observe-c",
] as const);
export const CODEGEN_ADAPTER_ID = "codegen" as const;
export const CODEGEN_EVIDENCE_CLASS = "adapter-run" as const;
export const CODEGEN_OUTPUT_LOCATION = "results/runs/m3-codegen" as const;
export const CODEGEN_PRODUCER_ID = "codegen-cli-producer" as const;
export const CODEGEN_SEGMENT_ID = "codegen-cli-producer" as const;
export const CODEGEN_SEGMENT_FILENAME = "codegen-cli-producer.jsonl" as const;

export const CODEGEN_RAW_LOCATIONS = Object.freeze({
  manifest: "raw/manifest.snapshot.json",
  completion: "raw/run-completion.snapshot.json",
  segment: "raw/segments/codegen-cli-producer.jsonl",
});

export const CODEGEN_DERIVED_FILENAMES = Object.freeze([
  "run-metadata.json",
  "events.jsonl",
  "summary.json",
  "comparison.md",
  "hashes.json",
] as const);
export const CODEGEN_INCONCLUSIVE_FILENAMES = Object.freeze([
  "run-metadata.json",
  "summary.json",
] as const);

export const FIXED_SCENARIO_ID = "m3-synthetic-collector" as const;
export const FIXED_EVIDENCE_CLASS = "contract-fixture" as const;
export const FIXED_PROFILE_ID = "not-applicable" as const;
export const FIXED_RESULTS_LOCATION = "results/runs/m3-harness" as const;

export const EVIDENCE_LOCATIONS = Object.freeze({
  manifest: "manifest.snapshot.json",
  completion: "run-completion.snapshot.json",
  metadata: "run-metadata.json",
  events: "events.jsonl",
  summary: "summary.json",
  comparison: "comparison.md",
  hashes: "hashes.json",
  segments: "segments",
});

export const MAX_SEGMENTS_PER_RUN = 64;
export const MAX_RUN_SEGMENT_BYTES = 64 * 4 * 1024 * 1024;
export const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024;
export const MAX_COMPLETION_BYTES = 256 * 1024;

export const LAB_ERROR_CODES = [
  "INVALID_COLLECTION_INPUT",
  "INVALID_SCENARIO_DEFINITION",
  "INVALID_SCENARIO_SNAPSHOT",
  "INVALID_RUN_COMPLETION",
  "RUN_NOT_STARTED",
  "TOOL_NOT_TERMINATED",
  "RUN_NOT_ENDED",
  "RUN_TIMEOUT",
  "HASH_FINALIZATION_INCOMPLETE",
  "SEGMENT_CLOSE_INCOMPLETE",
  "SEGMENT_MISSING",
  "SEGMENT_UNEXPECTED",
  "SEGMENT_TOO_LARGE",
  "SEGMENT_NOT_LF_TERMINATED",
  "SEGMENT_BLANK_LINE",
  "SEGMENT_LINE_TOO_LARGE",
  "SEGMENT_EVENT_LIMIT_EXCEEDED",
  "SEGMENT_JSON_INVALID",
  "SEGMENT_UTF8_INVALID",
  "SEGMENT_EVENT_INVALID",
  "SEGMENT_NONCANONICAL",
  "SEGMENT_SEQUENCE_INVALID",
  "HASH_EVIDENCE_INVALID",
  "RUNTIME_CONTEXT_INVALID",
  "INPUT_INVENTORY_INVALID",
  "INPUT_FILE_INVALID",
  "INPUT_FILE_TOO_LARGE",
  "OUTPUT_BOUNDARY_INVALID",
  "OUTPUT_ALREADY_EXISTS",
  "OUTPUT_WRITE_FAILURE",
  "CODEGEN_MANIFEST_INVALID",
  "CODEGEN_EXPECTED_INVALID",
  "CODEGEN_RUNTIME_CONTEXT_INVALID",
  "CODEGEN_RAW_IDENTITY_INVALID",
  "CODEGEN_RAW_CONTENT_CHANGED",
  "CODEGEN_STAGING_INVALID",
  "CODEGEN_DESCRIPTOR_CLOSE_FAILED",
  "CODEGEN_RENAME_FAILED",
] as const;

export type LabErrorCode = (typeof LAB_ERROR_CODES)[number];
