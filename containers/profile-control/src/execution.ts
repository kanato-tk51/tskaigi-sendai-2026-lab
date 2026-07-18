import { types } from "node:util";

import {
  parseCanonicalControlEvidenceBytes,
  parseCanonicalControlManifestBytes,
  serializeCanonicalControlManifest,
} from "./canonical.js";
import { createControlCompletion } from "./completion.js";
import {
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  LIMITS,
} from "./constants.js";
import { assertAcceptedProfileControlPair } from "./definitions.js";
import {
  assertFixedImageBuildPlan,
  assertFixedProfilePairDockerPlans,
} from "./docker-plan.js";
import type {
  DockerCommand,
  FixedRuntimeLayout,
  ImageBuildPlan,
  ProfileDockerPlan,
  ProfilePairDockerPlans,
} from "./docker-plan.js";
import { compareControlEvidence } from "./evidence.js";
import { ProfileControlError } from "./errors.js";
import { validateDockerInspectProjection } from "./inspect.js";
import {
  assertBoolean,
  assertExactKeys,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import {
  assertAcceptedImageStagingSnapshot,
  copyAcceptedStagingFiles,
  verifyAcceptedStagingFiles,
} from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ExecutionFailureCode,
  PairExecutionResult,
  ProfileControlPair,
  ProfileExecutionResult,
  ProfileId,
  ProfileRunDefinition,
} from "./types.js";
import { validateProfileControlPair } from "./validation.js";

const COMMAND_RESULT_KEYS = Object.freeze([
  "exitCode",
  "timedOut",
  "outputLimitExceeded",
  "stdoutBytes",
  "stderrBytes",
  "payload",
]);
const TRANSFER_KEYS = Object.freeze([
  "manifestBefore",
  "manifestAfter",
  "manifestIdentityBefore",
  "manifestIdentityAfter",
  "manifestTypeBefore",
  "manifestTypeAfter",
  "manifestSymlinkBefore",
  "manifestSymlinkAfter",
  "controlEvidence",
  "resultFiles",
  "scratchFiles",
]);
const RUNTIME_VERSION_KEYS = Object.freeze(["client", "server"]);
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
const canonicalEncoder = new TextEncoder();

export interface FixedExecutionBackend {
  stageBuildContext(
    stagingRoot: string,
    files: readonly Readonly<{
      logicalPath: string;
      bytes: Uint8Array;
    }>[],
  ): Promise<void>;
  readBuildContext(stagingRoot: string): Promise<unknown>;
  run(
    stepId: string,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown>;
  transfer(profileId: ProfileId): Promise<unknown>;
}

export interface FixedExecutionInput {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly pair: ProfileControlPair;
  readonly imageBuildPlan: ImageBuildPlan;
  readonly profilePlans: ProfilePairDockerPlans;
  readonly permissiveLayout: FixedRuntimeLayout;
  readonly constrainedLayout: FixedRuntimeLayout;
  readonly backend: FixedExecutionBackend;
}

interface CommandResult {
  readonly payload: unknown;
  readonly stdoutBytes: number;
}

class StepFailure extends Error {
  readonly failureCode: ExecutionFailureCode;

  constructor(failureCode: ExecutionFailureCode) {
    super(failureCode);
    this.name = "StepFailure";
    this.failureCode = failureCode;
  }
}

function failStep(code: ExecutionFailureCode): never {
  throw new StepFailure(code);
}

function nonNegativeInteger(input: unknown): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 0) {
    return failStep("COMMAND_FAILURE");
  }
  return input;
}

async function runCommand(
  backend: FixedExecutionBackend,
  stepId: string,
  command: DockerCommand,
  completedSteps: string[],
  validatePayload?: (result: CommandResult) => void,
): Promise<CommandResult> {
  let raw: unknown;
  try {
    raw = await backend.run(stepId, command, {
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
  } catch {
    return failStep("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "EXECUTION_INCONCLUSIVE");
    assertExactKeys(value, COMMAND_RESULT_KEYS, "EXECUTION_INCONCLUSIVE");
  } catch {
    return failStep("COMMAND_FAILURE");
  }
  const timedOut = assertExecutionBoolean(value.timedOut);
  const outputLimitExceeded = assertExecutionBoolean(value.outputLimitExceeded);
  const stdoutBytes = nonNegativeInteger(value.stdoutBytes);
  const stderrBytes = nonNegativeInteger(value.stderrBytes);
  if (outputLimitExceeded || stdoutBytes + stderrBytes > LIMITS.outputBytes) {
    return failStep("OUTPUT_LIMIT");
  }
  if (timedOut) return failStep("COMMAND_TIMEOUT");
  if (
    typeof value.exitCode !== "number" ||
    !Number.isSafeInteger(value.exitCode) ||
    value.exitCode !== 0
  ) {
    return failStep("COMMAND_FAILURE");
  }
  const result = Object.freeze({ payload: value.payload, stdoutBytes });
  validatePayload?.(result);
  completedSteps.push(stepId);
  return result;
}

function assertExecutionBoolean(input: unknown): boolean {
  try {
    return assertBoolean(input, "EXECUTION_INCONCLUSIVE");
  } catch {
    return failStep("COMMAND_FAILURE");
  }
}

function immutableBytes(input: unknown): Uint8Array {
  if (
    !types.isUint8Array(input) ||
    input.buffer instanceof SharedArrayBuffer ||
    input.byteLength === 0 ||
    input.byteLength > LIMITS.evidenceBytes
  ) {
    return failStep("TRANSFER_FAILURE");
  }
  return Uint8Array.from(input);
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function validatePreBuildRuntimeVersion(result: CommandResult): void {
  if (
    !types.isUint8Array(result.payload) ||
    result.payload.buffer instanceof SharedArrayBuffer ||
    result.payload.byteLength === 0 ||
    result.payload.byteLength !== result.stdoutBytes ||
    result.payload.byteLength > LIMITS.outputBytes
  ) {
    failStep("COMMAND_FAILURE");
  }
  const bytes = Uint8Array.from(result.payload);
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return failStep("COMMAND_FAILURE");
  }
  if (
    !text.endsWith("\n") ||
    text.slice(0, -1).includes("\n") ||
    text.includes("\r") ||
    text.includes("\0")
  ) {
    failStep("COMMAND_FAILURE");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failStep("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "EXECUTION_INCONCLUSIVE");
    assertExactKeys(value, RUNTIME_VERSION_KEYS, "EXECUTION_INCONCLUSIVE");
  } catch {
    return failStep("COMMAND_FAILURE");
  }
  if (typeof value.client !== "string" || typeof value.server !== "string") {
    failStep("COMMAND_FAILURE");
  }
  const normalized = Object.freeze({
    client: value.client,
    server: value.server,
  });
  const canonicalBytes = canonicalEncoder.encode(
    `${JSON.stringify(normalized)}\n`,
  );
  if (
    !equalBytes(bytes, canonicalBytes) ||
    normalized.client !== FIXED_DOCKER_CLI_VERSION ||
    normalized.server !== FIXED_DOCKER_SERVER_VERSION
  ) {
    failStep("COMMAND_FAILURE");
  }
}

function exactFileInventory(input: unknown, expected: readonly string[]): void {
  let files;
  try {
    files = readPlainArray(input, "EXECUTION_INCONCLUSIVE");
  } catch {
    return failStep("TRANSFER_FAILURE");
  }
  if (
    files.length !== expected.length ||
    files.some((entry, index) => entry !== expected[index])
  ) {
    failStep("TRANSFER_FAILURE");
  }
}

function validateManifestIdentity(
  value: Readonly<Record<string, unknown>>,
): void {
  for (const key of [
    "manifestIdentityBefore",
    "manifestIdentityAfter",
  ] as const) {
    if (
      typeof value[key] !== "string" ||
      !/^m4-file-[a-f0-9]{32}$/u.test(value[key])
    ) {
      failStep("TRANSFER_FAILURE");
    }
  }
  if (
    value.manifestIdentityBefore !== value.manifestIdentityAfter ||
    value.manifestTypeBefore !== "regular-file" ||
    value.manifestTypeAfter !== "regular-file" ||
    assertExecutionBoolean(value.manifestSymlinkBefore) ||
    assertExecutionBoolean(value.manifestSymlinkAfter)
  ) {
    failStep("IMMUTABLE_INPUT_CHANGED");
  }
}

function inconclusive(
  code: ExecutionFailureCode,
  completedSteps: readonly string[],
): ProfileExecutionResult {
  return Object.freeze({
    validity: "inconclusive",
    primaryFailure: code,
    completedSteps: Object.freeze([...completedSteps]),
    comparison: null,
    completion: null,
  });
}

function failureCode(error: unknown): ExecutionFailureCode {
  if (error instanceof StepFailure) return error.failureCode;
  return error instanceof ProfileControlError
    ? "COMMAND_FAILURE"
    : "EVIDENCE_INVALID";
}

async function executeProfile(input: {
  readonly definition: ProfileRunDefinition;
  readonly plan: ProfileDockerPlan;
  readonly layout: FixedRuntimeLayout;
  readonly baseEnvironmentKeys: readonly string[];
  readonly backend: FixedExecutionBackend;
  readonly allCompletedSteps: string[];
}): Promise<ProfileExecutionResult> {
  const profileSteps: string[] = [];
  const prefix = input.definition.profile.profileId;
  let primaryFailure: ExecutionFailureCode | null = null;
  let completeResult: ProfileExecutionResult | null = null;
  try {
    await runCommand(
      input.backend,
      `${prefix}:create`,
      input.plan.create,
      profileSteps,
    );
    const inspectionResult = await runCommand(
      input.backend,
      `${prefix}:inspect`,
      input.plan.inspect,
      profileSteps,
    );
    let inspection;
    try {
      inspection = validateDockerInspectProjection({
        rawProjection: inspectionResult.payload,
        profile: input.definition.profile,
        manifest: input.definition.manifest,
        expectedMountSources: {
          input: input.layout.inputRoot,
          result: input.layout.resultRoot,
          scratch: input.layout.scratchRoot,
        },
        baseEnvironmentKeys: input.baseEnvironmentKeys,
      });
    } catch {
      return failStep("INSPECTION_FAILURE");
    }
    await runCommand(
      input.backend,
      `${prefix}:start`,
      input.plan.start,
      profileSteps,
    );
    let transferRaw: unknown;
    try {
      transferRaw = await input.backend.transfer(
        input.definition.profile.profileId,
      );
    } catch {
      return failStep("TRANSFER_FAILURE");
    }
    let transfer;
    try {
      transfer = readPlainRecord(transferRaw, "EXECUTION_INCONCLUSIVE");
      assertExactKeys(transfer, TRANSFER_KEYS, "EXECUTION_INCONCLUSIVE");
    } catch {
      return failStep("TRANSFER_FAILURE");
    }
    validateManifestIdentity(transfer);
    const manifestBefore = immutableBytes(transfer.manifestBefore);
    const manifestAfter = immutableBytes(transfer.manifestAfter);
    const expectedManifest = serializeCanonicalControlManifest(
      input.definition.manifest,
    );
    if (
      !equalBytes(manifestBefore, manifestAfter) ||
      !equalBytes(manifestBefore, expectedManifest)
    ) {
      failStep("IMMUTABLE_INPUT_CHANGED");
    }
    const parsedManifest = parseCanonicalControlManifestBytes(manifestBefore);
    if (parsedManifest.runId !== input.definition.manifest.runId) {
      failStep("IMMUTABLE_INPUT_CHANGED");
    }
    exactFileInventory(transfer.resultFiles, [
      "control-evidence.json",
      "result-marker.txt",
    ]);
    exactFileInventory(
      transfer.scratchFiles,
      prefix === "permissive" ? ["scratch-marker.txt"] : [],
    );
    const evidenceBytes = immutableBytes(transfer.controlEvidence);
    let evidence;
    try {
      evidence = parseCanonicalControlEvidenceBytes(evidenceBytes);
    } catch {
      return failStep("EVIDENCE_INVALID");
    }
    const comparison = compareControlEvidence({
      manifest: parsedManifest,
      hostInspection: inspection,
      evidence,
    });
    const hostInspectionBytes = new TextEncoder().encode(
      `${JSON.stringify(inspection)}\n`,
    );
    const completion = createControlCompletion({
      manifest: parsedManifest,
      inspection,
      evidence,
      manifestBytes: manifestBefore,
      hostInspectionBytes,
      controlEvidenceBytes: evidenceBytes,
    });
    profileSteps.push(`${prefix}:transfer`);
    completeResult = Object.freeze({
      validity: "complete",
      primaryFailure: null,
      completedSteps: Object.freeze([...profileSteps]),
      comparison,
      completion,
    });
  } catch (error) {
    primaryFailure = failureCode(error);
  } finally {
    try {
      await runCommand(
        input.backend,
        `${prefix}:remove`,
        input.plan.remove,
        profileSteps,
      );
    } catch {
      if (primaryFailure === null) {
        primaryFailure = "CLEANUP_FAILURE";
      }
    }
    input.allCompletedSteps.push(...profileSteps);
  }
  if (primaryFailure !== null) {
    return inconclusive(primaryFailure, profileSteps);
  }
  if (completeResult === null) {
    return inconclusive("EVIDENCE_INVALID", profileSteps);
  }
  return Object.freeze({
    ...completeResult,
    completedSteps: Object.freeze([...profileSteps]),
  });
}

function validateExecutionPlan(input: FixedExecutionInput): ProfileControlPair {
  const acceptedSnapshot = assertAcceptedImageStagingSnapshot(
    input.acceptedSnapshot,
  );
  assertAcceptedProfileControlPair(input.pair, acceptedSnapshot);
  const pair = validateProfileControlPair(input.pair);
  const imageBuildPlan = assertFixedImageBuildPlan(
    input.imageBuildPlan,
    acceptedSnapshot,
    input.permissiveLayout,
  );
  const profilePlans = assertFixedProfilePairDockerPlans(
    input.profilePlans,
    acceptedSnapshot,
    input.permissiveLayout,
    input.constrainedLayout,
  );
  if (
    pair.stagingDigest !== acceptedSnapshot.stagingDigest ||
    imageBuildPlan.stagingDigest !== acceptedSnapshot.stagingDigest ||
    profilePlans.containerImageDigest !== pair.containerImageDigest ||
    profilePlans.permissiveRunId !== pair.permissive.manifest.runId ||
    profilePlans.constrainedRunId !== pair.constrained.manifest.runId ||
    input.permissiveLayout.runRoot === input.constrainedLayout.runRoot ||
    !profilePlans.permissive.create.arguments.includes(
      `type=bind,src=${input.permissiveLayout.inputRoot},dst=/input,ro`,
    ) ||
    !profilePlans.constrained.create.arguments.includes(
      `type=bind,src=${input.constrainedLayout.scratchRoot},dst=/scratch,ro`,
    )
  ) {
    failStep("COMMAND_FAILURE");
  }
  return pair;
}

export async function executeFixedProfilePair(
  input: FixedExecutionInput,
): Promise<PairExecutionResult> {
  const completedSteps: string[] = [];
  let pair: ProfileControlPair;
  try {
    pair = validateExecutionPlan(input);
    try {
      await input.backend.stageBuildContext(
        input.permissiveLayout.stagingRoot,
        copyAcceptedStagingFiles(input.acceptedSnapshot),
      );
      const stagedFiles = await input.backend.readBuildContext(
        input.permissiveLayout.stagingRoot,
      );
      verifyAcceptedStagingFiles(input.acceptedSnapshot, stagedFiles);
    } catch {
      return failStep("STAGING_FAILURE");
    }
    completedSteps.push("stage-build-context");
    await runCommand(
      input.backend,
      "doctor",
      input.imageBuildPlan.doctor,
      completedSteps,
      validatePreBuildRuntimeVersion,
    );
    await runCommand(
      input.backend,
      "build",
      input.imageBuildPlan.build,
      completedSteps,
    );
    const imageInspection = await runCommand(
      input.backend,
      "inspect-image",
      input.imageBuildPlan.inspectImage,
      completedSteps,
    );
    if (imageInspection.payload !== pair.containerImageDigest) {
      failStep("INSPECTION_FAILURE");
    }
  } catch (error) {
    return Object.freeze({
      validity: "inconclusive",
      primaryFailure: failureCode(error),
      completedSteps: Object.freeze(completedSteps),
      permissive: null,
      constrained: null,
    });
  }
  const permissive = await executeProfile({
    definition: pair.permissive,
    plan: input.profilePlans.permissive,
    layout: input.permissiveLayout,
    baseEnvironmentKeys: input.acceptedSnapshot.baseEnvironmentKeys,
    backend: input.backend,
    allCompletedSteps: completedSteps,
  });
  const constrained = await executeProfile({
    definition: pair.constrained,
    plan: input.profilePlans.constrained,
    layout: input.constrainedLayout,
    baseEnvironmentKeys: input.acceptedSnapshot.baseEnvironmentKeys,
    backend: input.backend,
    allCompletedSteps: completedSteps,
  });
  const firstFailure =
    permissive.primaryFailure ?? constrained.primaryFailure ?? null;
  return Object.freeze({
    validity: firstFailure === null ? "complete" : "inconclusive",
    primaryFailure: firstFailure,
    completedSteps: Object.freeze(completedSteps),
    permissive,
    constrained,
  });
}
