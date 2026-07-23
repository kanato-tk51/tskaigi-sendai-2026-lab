import { createHash } from "node:crypto";
import { readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONTROL_ORDER,
  FIXED_CONSTRAINED_RUN_ID,
  FIXED_CONTROL_IMAGE_DIGEST,
  FIXED_PERMISSIVE_RUN_ID,
  FIXED_STAGING_FILES,
} from "./constants.js";
import { validateControlCompletion } from "./completion.js";
import { createFixedControlHostBackend } from "./control-host-backend.js";
import { createProfileControlPair } from "./definitions.js";
import {
  createFixedRuntimeLayout,
  createProfilePairDockerPlans,
} from "./docker-plan.js";
import {
  executeFixedExistingImageProfilePair,
  type FixedExistingImageExecutionInput,
} from "./execution.js";
import { failProfile } from "./errors.js";
import {
  captureDirectoryIdentity,
  captureFileIdentity,
  FilesystemIdentityLease,
  type DirectoryIdentityExpectations,
  type FileIdentityExpectations,
  type HeldFilesystemObject,
} from "./filesystem-identity.js";
import { validateVersionedImageInput } from "./image-input.js";
import {
  parseCanonicalExecutionProfileBytes,
  serializeCanonicalExecutionProfile,
} from "./profile-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "./staging.js";
import {
  assertExactKeys,
  assertRunId,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  ControlName,
  EvidenceComparison,
  ExecutionFailureCode,
  PairExecutionResult,
  ProfileExecutionResult,
  ProfileId,
} from "./types.js";

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const PAIR_RESULT_KEYS = Object.freeze([
  "validity",
  "primaryFailure",
  "completedSteps",
  "permissive",
  "constrained",
]);
const PROFILE_RESULT_KEYS = Object.freeze([
  "validity",
  "primaryFailure",
  "completedSteps",
  "comparison",
  "completion",
]);
const COMPARISON_KEYS = Object.freeze([
  "runId",
  "profileId",
  "complete",
  "mismatchCount",
  "mismatches",
]);
const EXECUTION_FAILURE_CODES = Object.freeze([
  "STAGING_FAILURE",
  "COMMAND_FAILURE",
  "COMMAND_TIMEOUT",
  "OUTPUT_LIMIT",
  "INSPECTION_FAILURE",
  "TRANSFER_FAILURE",
  "IMMUTABLE_INPUT_CHANGED",
  "EVIDENCE_INVALID",
  "CLEANUP_FAILURE",
] as const);

function failExecutionResult(): never {
  return failProfile("EXECUTION_INCONCLUSIVE");
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function fixedCanary(runId: string): string {
  return `m4-canary-${createHash("sha256")
    .update(`tskaigi-m4-control:${runId}`, "utf8")
    .digest("hex")
    .slice(0, 32)}`;
}

type FixedProductionControlDefinition = Omit<
  FixedExistingImageExecutionInput,
  "backend"
> &
  Readonly<{ immutableInputLease: FilesystemIdentityLease }>;

export async function createFixedProductionControlDefinition(): Promise<FixedProductionControlDefinition> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_CONTROL_PATH");
  }
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  const held: Array<{
    object: HeldFilesystemObject;
    expectations: FileIdentityExpectations | DirectoryIdentityExpectations;
  }> = [];
  const holdDirectory = async (logicalRole: string, target: string) => {
    const expectations = Object.freeze({
      mode: "captured" as const,
      children: Object.freeze(await readdir(target)),
    });
    const object = await captureDirectoryIdentity(
      logicalRole,
      target,
      expectations,
    );
    held.push({ object, expectations });
    return object;
  };
  const holdFile = async (
    logicalRole: string,
    target: string,
    maximumBytes: number,
  ) => {
    const expectations = Object.freeze({
      mode: "captured" as const,
      maximumBytes,
      content: "read" as const,
    });
    const object = await captureFileIdentity(logicalRole, target, expectations);
    held.push({ object, expectations });
    return object;
  };
  try {
    await holdDirectory("repository-root", repositoryRoot);
    await holdDirectory(
      "repository-containers-root",
      path.join(repositoryRoot, "containers"),
    );
    await holdDirectory("profile-control-source-root", controlRoot);
    await holdDirectory(
      "profile-control-fixture-root",
      path.join(controlRoot, "fixture"),
    );
    await holdDirectory(
      "canonical-profile-root",
      path.join(repositoryRoot, "profiles"),
    );
    await holdDirectory(
      "permissive-profile-root",
      path.join(repositoryRoot, "profiles", "permissive"),
    );
    await holdDirectory(
      "constrained-profile-root",
      path.join(repositoryRoot, "profiles", "constrained"),
    );
    const imageInputFile = await holdFile(
      "exact-image-input",
      path.join(controlRoot, "image-input.json"),
      65_536,
    );
    const imageInputBytes = await imageInputFile.readBytes(65_536);
    const imageInput = validateVersionedImageInput(
      JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(imageInputBytes),
      ),
    );
    const stagingCopies = [];
    for (const logicalPath of FIXED_STAGING_FILES) {
      const file = await holdFile(
        `staging-source:${logicalPath}`,
        path.join(controlRoot, logicalPath),
        65_536,
      );
      stagingCopies.push({
        logicalPath,
        bytes: await file.readBytes(65_536),
      });
    }
    const preparedStaging = prepareStagingInput(stagingCopies);
    const acceptedSnapshot = createAcceptedImageStagingSnapshot({
      imageInput,
      preparedStaging,
    });
    const permissiveProfile = await holdFile(
      "canonical-profile:permissive",
      path.join(repositoryRoot, "profiles", "permissive", "profile.json"),
      65_536,
    );
    const constrainedProfile = await holdFile(
      "canonical-profile:constrained",
      path.join(repositoryRoot, "profiles", "constrained", "profile.json"),
      65_536,
    );
    const profileBytes = Object.freeze({
      permissive: await permissiveProfile.readBytes(65_536),
      constrained: await constrainedProfile.readBytes(65_536),
    });
    const profiles = Object.freeze({
      permissive: parseCanonicalExecutionProfileBytes({
        bytes: profileBytes.permissive,
        profileId: "permissive",
      }),
      constrained: parseCanonicalExecutionProfileBytes({
        bytes: profileBytes.constrained,
        profileId: "constrained",
      }),
    });
    const pair = createProfileControlPair({
      acceptedSnapshot,
      containerImageDigest: FIXED_CONTROL_IMAGE_DIGEST,
      permissiveRunId: FIXED_PERMISSIVE_RUN_ID,
      constrainedRunId: FIXED_CONSTRAINED_RUN_ID,
    });
    if (
      !equalBytes(
        profileBytes.permissive,
        serializeCanonicalExecutionProfile(pair.permissive.profile),
      ) ||
      !equalBytes(
        profileBytes.constrained,
        serializeCanonicalExecutionProfile(pair.constrained.profile),
      ) ||
      profiles.permissive.containerImageDigest !== pair.containerImageDigest ||
      profiles.constrained.containerImageDigest !== pair.containerImageDigest
    ) {
      throw new Error("M4_CONTROL_PROFILE_BINDING");
    }
    const permissiveLayout = createFixedRuntimeLayout(
      repositoryRoot,
      FIXED_PERMISSIVE_RUN_ID,
      "permissive",
    );
    const constrainedLayout = createFixedRuntimeLayout(
      repositoryRoot,
      FIXED_CONSTRAINED_RUN_ID,
      "constrained",
    );
    const profilePlans = createProfilePairDockerPlans({
      acceptedSnapshot,
      pair,
      permissiveLayout,
      constrainedLayout,
      permissiveCanary: fixedCanary(FIXED_PERMISSIVE_RUN_ID),
      constrainedCanary: fixedCanary(FIXED_CONSTRAINED_RUN_ID),
    });
    const immutableInputLease = new FilesystemIdentityLease(held);
    await immutableInputLease.validate();
    return Object.freeze({
      acceptedSnapshot,
      pair,
      profilePlans,
      permissiveLayout,
      constrainedLayout,
      immutableInputLease,
    });
  } catch (error) {
    for (const entry of [...held].reverse()) {
      await entry.object.close().catch(() => undefined);
    }
    throw error;
  }
}

export async function runFixedProductionControls(): Promise<PairExecutionResult> {
  const definition = await createFixedProductionControlDefinition();
  const backend = await createFixedControlHostBackend({
    acceptedSnapshot: definition.acceptedSnapshot,
    pair: definition.pair,
    plans: definition.profilePlans,
    permissiveLayout: definition.permissiveLayout,
    constrainedLayout: definition.constrainedLayout,
    immutableInputLease: definition.immutableInputLease,
  });
  return await executeFixedExistingImageProfilePair({
    acceptedSnapshot: definition.acceptedSnapshot,
    pair: definition.pair,
    profilePlans: definition.profilePlans,
    permissiveLayout: definition.permissiveLayout,
    constrainedLayout: definition.constrainedLayout,
    backend,
  });
}

function validateCompletedSteps(input: unknown): readonly string[] {
  const steps = readPlainArray(input, "EXECUTION_INCONCLUSIVE");
  if (
    steps.length > 32 ||
    steps.some(
      (step) =>
        typeof step !== "string" ||
        !/^(?:stage-build-context|doctor|build|inspect-image|(?:permissive|constrained):(?:create|inspect|start|transfer|remove))$/u.test(
          step,
        ),
    )
  ) {
    return failExecutionResult();
  }
  return Object.freeze([...steps] as string[]);
}

function validateFailureCode(input: unknown): ExecutionFailureCode | null {
  if (input === null) return null;
  if (!EXECUTION_FAILURE_CODES.includes(input as ExecutionFailureCode)) {
    return failExecutionResult();
  }
  return input as ExecutionFailureCode;
}

function validateComparison(
  input: unknown,
  expectedProfileId: ProfileId,
): EvidenceComparison {
  const value = readPlainRecord(input, "EXECUTION_INCONCLUSIVE");
  assertExactKeys(value, COMPARISON_KEYS, "EXECUTION_INCONCLUSIVE");
  const runId = assertRunId(value.runId, "EXECUTION_INCONCLUSIVE");
  if (
    value.profileId !== expectedProfileId ||
    value.complete !== true ||
    typeof value.mismatchCount !== "number" ||
    !Number.isSafeInteger(value.mismatchCount) ||
    value.mismatchCount < 0
  ) {
    return failExecutionResult();
  }
  const entries = readPlainArray(value.mismatches, "EXECUTION_INCONCLUSIVE");
  const mismatches: ControlName[] = [];
  for (const entry of entries) {
    if (
      typeof entry !== "string" ||
      !CONTROL_ORDER.includes(entry as ControlName) ||
      mismatches.includes(entry as ControlName)
    ) {
      return failExecutionResult();
    }
    mismatches.push(entry as ControlName);
  }
  if (mismatches.length !== value.mismatchCount) {
    return failExecutionResult();
  }
  return Object.freeze({
    runId,
    profileId: expectedProfileId,
    complete: true,
    mismatchCount: mismatches.length,
    mismatches: Object.freeze(mismatches),
  });
}

function validateProfileResult(
  input: unknown,
  expectedProfileId: ProfileId,
): ProfileExecutionResult {
  const value = readPlainRecord(input, "EXECUTION_INCONCLUSIVE");
  assertExactKeys(value, PROFILE_RESULT_KEYS, "EXECUTION_INCONCLUSIVE");
  const primaryFailure = validateFailureCode(value.primaryFailure);
  const completedSteps = validateCompletedSteps(value.completedSteps);
  if (value.validity === "inconclusive") {
    if (
      primaryFailure === null ||
      value.comparison !== null ||
      value.completion !== null
    ) {
      return failExecutionResult();
    }
    return Object.freeze({
      validity: "inconclusive",
      primaryFailure,
      completedSteps,
      comparison: null,
      completion: null,
    });
  }
  if (value.validity !== "complete" || primaryFailure !== null) {
    return failExecutionResult();
  }
  const comparison = validateComparison(value.comparison, expectedProfileId);
  const completion = validateControlCompletion(value.completion);
  if (
    completion.profileId !== expectedProfileId ||
    completion.runId !== comparison.runId
  ) {
    return failExecutionResult();
  }
  return Object.freeze({
    validity: "complete",
    primaryFailure: null,
    completedSteps,
    comparison,
    completion,
  });
}

function validatePairExecutionResult(input: unknown): PairExecutionResult {
  const value = readPlainRecord(input, "EXECUTION_INCONCLUSIVE");
  assertExactKeys(value, PAIR_RESULT_KEYS, "EXECUTION_INCONCLUSIVE");
  const primaryFailure = validateFailureCode(value.primaryFailure);
  const completedSteps = validateCompletedSteps(value.completedSteps);
  const permissive =
    value.permissive === null
      ? null
      : validateProfileResult(value.permissive, "permissive");
  const constrained =
    value.constrained === null
      ? null
      : validateProfileResult(value.constrained, "constrained");
  const firstProfileFailure =
    permissive?.primaryFailure ?? constrained?.primaryFailure ?? null;
  if (
    (value.validity === "complete" &&
      (primaryFailure !== null ||
        permissive?.validity !== "complete" ||
        constrained?.validity !== "complete")) ||
    (value.validity === "inconclusive" &&
      (primaryFailure === null ||
        primaryFailure !== (firstProfileFailure ?? primaryFailure))) ||
    (value.validity !== "complete" && value.validity !== "inconclusive") ||
    (permissive === null) !== (constrained === null)
  ) {
    return failExecutionResult();
  }
  return Object.freeze({
    validity: value.validity,
    primaryFailure,
    completedSteps,
    permissive,
    constrained,
  }) as PairExecutionResult;
}

export function serializeCanonicalPairExecutionResult(
  result: PairExecutionResult,
): Uint8Array {
  return new TextEncoder().encode(
    `${JSON.stringify(validatePairExecutionResult(result))}\n`,
  );
}
