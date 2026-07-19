import process from "node:process";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_STAGING_DIGEST,
  OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION,
} from "./constants.js";
import {
  FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
  FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  createFixedOfflineBuildRecoveryInput,
  executeFixedOfflineBuildRecovery,
  type OfflineBuildRecoveryResult,
  serializeCanonicalOfflineBuildRecoveryResult,
  validateOfflineBuildRecoveryResult,
} from "./offline-build-recovery.js";
import { createFixedOfflineBuildRecoveryHostBackend } from "./offline-build-recovery-host-backend.js";

const FIXED_OFFLINE_BUILD_RECOVERY_FAILED_RESULT = Object.freeze({
  schemaVersion: "lab-profile-offline-build-result/v1" as const,
  validity: "inconclusive" as const,
  primaryFailure: "CLEANUP_FAILURE" as const,
  completedSteps: Object.freeze([
    "stage-build-context",
    "doctor",
    "build",
    "inspect-image",
  ] as const),
  baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
  stagingDigest: FIXED_STAGING_DIGEST,
  dockerClientVersion: FIXED_DOCKER_CLI_VERSION,
  dockerServerVersion: FIXED_DOCKER_SERVER_VERSION,
  builtImageDigest: null,
} as const);

const FALLBACK_STATE_FAILURE_RESULT = validateOfflineBuildRecoveryResult({
  schemaVersion: OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION,
  validity: "inconclusive",
  primaryFailure: "STATE_VALIDATION_FAILURE",
  completedSteps: Object.freeze([]),
  runId: FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  stagedImageTag: FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
  baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
  stagingDigest: FIXED_STAGING_DIGEST,
  builtImageDigest: null,
  ownedStateDisposition: "retained",
});

async function runOneFixedOfflineBuildRecovery() {
  const backend = await createFixedOfflineBuildRecoveryHostBackend();
  const input = createFixedOfflineBuildRecoveryInput({
    failedBuildResult: FIXED_OFFLINE_BUILD_RECOVERY_FAILED_RESULT,
    backend,
  });
  return await executeFixedOfflineBuildRecovery(input);
}

let result: OfflineBuildRecoveryResult;
try {
  result = await runOneFixedOfflineBuildRecovery();
} catch {
  result = FALLBACK_STATE_FAILURE_RESULT;
}

process.stdout.write(serializeCanonicalOfflineBuildRecoveryResult(result));
process.exitCode = result.validity === "complete" ? 0 : 1;
