export const PROFILE_SCHEMA_VERSION = "lab-execution-profile/v1" as const;
export const CONTROL_MANIFEST_SCHEMA_VERSION =
  "lab-profile-control-manifest/v1" as const;
export const CONTROL_EVIDENCE_SCHEMA_VERSION =
  "lab-profile-control-evidence/v1" as const;
export const HOST_INSPECTION_SCHEMA_VERSION =
  "lab-profile-host-inspection/v1" as const;
export const IMAGE_INPUT_SCHEMA_VERSION = "lab-profile-image-input/v1" as const;
export const CONTROL_COMPLETION_SCHEMA_VERSION =
  "lab-profile-control-completion/v1" as const;
export const DOCTOR_INVENTORY_SCHEMA_VERSION =
  "lab-profile-doctor-inventory/v1" as const;
export const OFFLINE_BUILD_RESULT_SCHEMA_VERSION =
  "lab-profile-offline-build-result/v1" as const;
export const OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION =
  "lab-profile-offline-build-recovery-result/v1" as const;

export const FIXED_NODE_VERSION = "v20.18.2" as const;
export const FIXED_DOCKER_CLI_VERSION = "29.6.1" as const;
export const FIXED_DOCKER_SERVER_VERSION = "29.6.1" as const;
export const FIXED_BASE_IMAGE_TAG = "node:20.18.2-bookworm-slim" as const;
export const FIXED_BASE_IMAGE_OS = "linux" as const;
export const FIXED_BASE_IMAGE_ARCHITECTURE = "amd64" as const;
export const FIXED_BASE_IMAGE_DIGEST =
  "sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0" as const;
export const FIXED_BASE_ENVIRONMENT_KEYS = Object.freeze([
  "PATH",
  "NODE_VERSION",
  "YARN_VERSION",
] as const);
export const FIXED_STAGING_DIGEST =
  "sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03" as const;
export const FIXED_PROFILE_REVISION = "m4-profile-v1" as const;
export const FIXED_CONTAINER_INPUT_ID = "m4-profile-control-image-v1" as const;
export const FIXED_IMAGE_NAME = "tskaigi-m4-profile-control" as const;
export const FIXED_BASE_IMAGE_NAME = "node" as const;
export const FIXED_CONTAINER_USER = "10001:10001" as const;
export const FIXED_CONTAINER_WORKDIR = "/opt/m4-control" as const;
export const FIXED_INPUT_DESTINATION = "/input" as const;
export const FIXED_RESULT_DESTINATION = "/result" as const;
export const FIXED_SCRATCH_DESTINATION = "/scratch" as const;
export const FIXED_ENVIRONMENT_KEY = "PROBE_CANARY_M4_CONTROL" as const;
export const FIXED_CONTAINER_RUNTIME = "runc" as const;
export const FIXED_CONTROL_IMAGE_DIGEST =
  "sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd" as const;
export const FIXED_PERMISSIVE_RUN_ID =
  "m4-profile-control-p-20260720-02" as const;
export const FIXED_CONSTRAINED_RUN_ID =
  "m4-profile-control-c-20260720-02" as const;

export const FIXED_STAGING_FILES = Object.freeze([
  "Containerfile",
  "fixture/canary.txt",
  "fixture/control-runner.mjs",
  "fixture/fixed-child.mjs",
] as const);

export const CONTROL_IDS = Object.freeze({
  permissive: "m4-profile-control-p",
  constrained: "m4-profile-control-c",
} as const);

export const CONTROL_ORDER = Object.freeze([
  "environment-canary",
  "canary-file-read",
  "scratch-write",
  "source-mutation",
  "loopback-protocol",
  "fixed-child",
  "result-write",
] as const);

export const LIMITS = Object.freeze({
  controlTimeoutMs: 5_000,
  outputBytes: 65_536,
  evidenceBytes: 65_536,
  evidenceFiles: 8,
  memoryBytes: 268_435_456,
  nanoCpus: 1_000_000_000,
  pids: 64,
} as const);

export const DOCTOR_LIMITS = Object.freeze({
  timeoutMs: 5_000,
  outputBytes: 16_384,
  closeGraceMs: 250,
} as const);

export const LOGICAL_EVIDENCE = Object.freeze({
  runRoot: "results/runs/m4-profile-controls",
  inputRoot: "input",
  hostRoot: "host",
  resultRoot: "container-result",
  scratchRoot: "scratch",
  manifest: "input/control-manifest.json",
  hostInspection: "host/host-inspection.json",
  controlEvidence: "container-result/control-evidence.json",
  completion: "host/completion.json",
  comparison: "host/comparison.json",
} as const);

export const PROFILE_ERROR_CODES = Object.freeze([
  "INVALID_PROFILE",
  "INVALID_CONTROL_MANIFEST",
  "INVALID_CONTROL_EVIDENCE",
  "INVALID_HOST_INSPECTION",
  "INVALID_IMAGE_INPUT",
  "INVALID_CONTROL_COMPLETION",
  "NONCANONICAL_EVIDENCE",
  "EVIDENCE_SIZE_LIMIT",
  "PROFILE_MANIFEST_MISMATCH",
  "EVIDENCE_EXPECTATION_MISMATCH",
  "IMAGE_INPUT_UNCONFIGURED",
  "INVALID_RUN_ID",
  "INVALID_DOCKER_PLAN",
  "INVALID_PROFILE_PAIR",
  "INVALID_STAGING_INPUT",
  "INVALID_DOCTOR_PLAN",
  "INVALID_DOCTOR_OUTPUT",
  "INVALID_OFFLINE_BUILD_RESULT",
  "INVALID_OFFLINE_BUILD_RECOVERY_RESULT",
  "EXECUTION_INCONCLUSIVE",
  "ORCHESTRATOR_ARGUMENT_REJECTED",
  "M4_EXECUTION_NOT_APPROVED",
] as const);

export type ProfileErrorCode = (typeof PROFILE_ERROR_CODES)[number];
