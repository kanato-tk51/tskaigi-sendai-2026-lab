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
  captureAuthority,
  readPlainArray,
  readPlainRecord,
  snapshotBytes,
} from "./safe-data.js";
import {
  assertAcceptedImageStagingSnapshot,
  copyAcceptedStagingFiles,
  verifyAcceptedStagingFiles,
} from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ControlCompletion,
  EvidenceComparison,
  ExecutionFailureCode,
  HostInspection,
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
  "closeObserved",
  "stdoutBytes",
  "stderrBytes",
  "payload",
]);
const TRANSFER_KEYS = Object.freeze([
  "manifestBefore",
  "manifestAfter",
  "manifestIdentityStable",
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

export interface FixedExistingImageExecutionBackend {
  run(
    stepId: string,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown>;
  transfer(profileId: ProfileId): Promise<unknown>;
  recordProfileResult(
    profileId: ProfileId,
    result: Readonly<{
      inspection: HostInspection;
      comparison: EvidenceComparison;
      completion: ControlCompletion;
    }>,
  ): Promise<void>;
  cleanup(): Promise<void>;
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

export interface FixedExistingImageExecutionInput {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly pair: ProfileControlPair;
  readonly profilePlans: ProfilePairDockerPlans;
  readonly permissiveLayout: FixedRuntimeLayout;
  readonly constrainedLayout: FixedRuntimeLayout;
  readonly backend: FixedExistingImageExecutionBackend;
}

type ControlExecutionBackend = Pick<FixedExecutionBackend, "run" | "transfer">;

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
  backend: ControlExecutionBackend,
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
  const closeObserved = assertExecutionBoolean(value.closeObserved);
  const stdoutBytes = nonNegativeInteger(value.stdoutBytes);
  const stderrBytes = nonNegativeInteger(value.stderrBytes);
  if (!closeObserved) return failStep("COMMAND_FAILURE");
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
  try {
    return snapshotBytes(input, {
      code: "EXECUTION_INCONCLUSIVE",
      maximum: LIMITS.evidenceBytes,
      allowEmpty: false,
    });
  } catch {
    return failStep("TRANSFER_FAILURE");
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function validatePreBuildRuntimeVersion(result: CommandResult): void {
  let bytes: Uint8Array;
  try {
    bytes = snapshotBytes(result.payload, {
      code: "EXECUTION_INCONCLUSIVE",
      maximum: LIMITS.outputBytes,
      allowEmpty: false,
    });
  } catch {
    failStep("COMMAND_FAILURE");
  }
  if (bytes.byteLength !== result.stdoutBytes) failStep("COMMAND_FAILURE");
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

function validateManifestIdentityStable(
  value: Readonly<Record<string, unknown>>,
): void {
  if (assertExecutionBoolean(value.manifestIdentityStable) !== true) {
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
  readonly backend: ControlExecutionBackend;
  readonly recordProfileResult?: FixedExistingImageExecutionBackend["recordProfileResult"];
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
    validateManifestIdentityStable(transfer);
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
    if (input.recordProfileResult !== undefined) {
      try {
        await input.recordProfileResult(prefix, {
          inspection,
          comparison,
          completion,
        });
      } catch {
        return failStep("TRANSFER_FAILURE");
      }
    }
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

function snapshotExecutionInput(input: unknown): Readonly<{
  fixedInput: FixedExecutionInput;
  pair: ProfileControlPair;
}> {
  const wrapper = readPlainRecord(input, "EXECUTION_INCONCLUSIVE");
  assertExactKeys(
    wrapper,
    [
      "acceptedSnapshot",
      "pair",
      "imageBuildPlan",
      "profilePlans",
      "permissiveLayout",
      "constrainedLayout",
      "backend",
    ],
    "EXECUTION_INCONCLUSIVE",
  );
  const fixedInput = Object.freeze({
    acceptedSnapshot: wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
    pair: wrapper.pair as ProfileControlPair,
    imageBuildPlan: wrapper.imageBuildPlan as ImageBuildPlan,
    profilePlans: wrapper.profilePlans as ProfilePairDockerPlans,
    permissiveLayout: wrapper.permissiveLayout as FixedRuntimeLayout,
    constrainedLayout: wrapper.constrainedLayout as FixedRuntimeLayout,
    backend: captureAuthority<FixedExecutionBackend>(
      wrapper.backend,
      ["stageBuildContext", "readBuildContext", "run", "transfer"],
      "EXECUTION_INCONCLUSIVE",
    ),
  });
  return Object.freeze({
    fixedInput,
    pair: validateExecutionPlan(fixedInput),
  });
}

function validateExistingImageExecutionPlan(
  input: FixedExistingImageExecutionInput,
): ProfileControlPair {
  const acceptedSnapshot = assertAcceptedImageStagingSnapshot(
    input.acceptedSnapshot,
  );
  assertAcceptedProfileControlPair(input.pair, acceptedSnapshot);
  const pair = validateProfileControlPair(input.pair);
  const profilePlans = assertFixedProfilePairDockerPlans(
    input.profilePlans,
    acceptedSnapshot,
    input.permissiveLayout,
    input.constrainedLayout,
  );
  if (
    pair.stagingDigest !== acceptedSnapshot.stagingDigest ||
    profilePlans.containerImageDigest !== pair.containerImageDigest ||
    profilePlans.permissiveRunId !== pair.permissive.manifest.runId ||
    profilePlans.constrainedRunId !== pair.constrained.manifest.runId ||
    input.permissiveLayout.runRoot === input.constrainedLayout.runRoot ||
    !profilePlans.permissive.create.arguments.includes(
      pair.containerImageDigest,
    ) ||
    !profilePlans.constrained.create.arguments.includes(
      pair.containerImageDigest,
    )
  ) {
    failStep("COMMAND_FAILURE");
  }
  return pair;
}

function snapshotExistingImageExecutionInput(input: unknown): Readonly<{
  fixedInput: FixedExistingImageExecutionInput;
  pair: ProfileControlPair;
}> {
  const wrapper = readPlainRecord(input, "EXECUTION_INCONCLUSIVE");
  assertExactKeys(
    wrapper,
    [
      "acceptedSnapshot",
      "pair",
      "profilePlans",
      "permissiveLayout",
      "constrainedLayout",
      "backend",
    ],
    "EXECUTION_INCONCLUSIVE",
  );
  const fixedInput = Object.freeze({
    acceptedSnapshot: wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
    pair: wrapper.pair as ProfileControlPair,
    profilePlans: wrapper.profilePlans as ProfilePairDockerPlans,
    permissiveLayout: wrapper.permissiveLayout as FixedRuntimeLayout,
    constrainedLayout: wrapper.constrainedLayout as FixedRuntimeLayout,
    backend: captureAuthority<FixedExistingImageExecutionBackend>(
      wrapper.backend,
      ["run", "transfer", "recordProfileResult", "cleanup"],
      "EXECUTION_INCONCLUSIVE",
    ),
  });
  return Object.freeze({
    fixedInput,
    pair: validateExistingImageExecutionPlan(fixedInput),
  });
}

export async function executeFixedProfilePair(
  input: FixedExecutionInput,
): Promise<PairExecutionResult> {
  const completedSteps: string[] = [];
  let pair: ProfileControlPair;
  let fixedInput: FixedExecutionInput;
  try {
    const snapshot = snapshotExecutionInput(input);
    fixedInput = snapshot.fixedInput;
    pair = snapshot.pair;
    try {
      await fixedInput.backend.stageBuildContext(
        fixedInput.permissiveLayout.stagingRoot,
        copyAcceptedStagingFiles(fixedInput.acceptedSnapshot),
      );
      const stagedFiles = await fixedInput.backend.readBuildContext(
        fixedInput.permissiveLayout.stagingRoot,
      );
      verifyAcceptedStagingFiles(fixedInput.acceptedSnapshot, stagedFiles);
    } catch {
      return failStep("STAGING_FAILURE");
    }
    completedSteps.push("stage-build-context");
    await runCommand(
      fixedInput.backend,
      "doctor",
      fixedInput.imageBuildPlan.doctor,
      completedSteps,
      validatePreBuildRuntimeVersion,
    );
    await runCommand(
      fixedInput.backend,
      "build",
      fixedInput.imageBuildPlan.build,
      completedSteps,
    );
    const imageInspection = await runCommand(
      fixedInput.backend,
      "inspect-image",
      fixedInput.imageBuildPlan.inspectImage,
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
    plan: fixedInput.profilePlans.permissive,
    layout: fixedInput.permissiveLayout,
    baseEnvironmentKeys: fixedInput.acceptedSnapshot.baseEnvironmentKeys,
    backend: fixedInput.backend,
    allCompletedSteps: completedSteps,
  });
  const constrained = await executeProfile({
    definition: pair.constrained,
    plan: fixedInput.profilePlans.constrained,
    layout: fixedInput.constrainedLayout,
    baseEnvironmentKeys: fixedInput.acceptedSnapshot.baseEnvironmentKeys,
    backend: fixedInput.backend,
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

export async function executeFixedExistingImageProfilePair(
  input: FixedExistingImageExecutionInput,
): Promise<PairExecutionResult> {
  const completedSteps: string[] = [];
  let pair: ProfileControlPair | null = null;
  let primaryFailure: ExecutionFailureCode | null = null;
  let permissive: ProfileExecutionResult | null = null;
  let constrained: ProfileExecutionResult | null = null;
  let fixedInput: FixedExistingImageExecutionInput | null = null;
  try {
    const snapshot = snapshotExistingImageExecutionInput(input);
    fixedInput = snapshot.fixedInput;
    pair = snapshot.pair;
    permissive = await executeProfile({
      definition: pair.permissive,
      plan: fixedInput.profilePlans.permissive,
      layout: fixedInput.permissiveLayout,
      baseEnvironmentKeys: fixedInput.acceptedSnapshot.baseEnvironmentKeys,
      backend: fixedInput.backend,
      allCompletedSteps: completedSteps,
      recordProfileResult: fixedInput.backend.recordProfileResult,
    });
    constrained = await executeProfile({
      definition: pair.constrained,
      plan: fixedInput.profilePlans.constrained,
      layout: fixedInput.constrainedLayout,
      baseEnvironmentKeys: fixedInput.acceptedSnapshot.baseEnvironmentKeys,
      backend: fixedInput.backend,
      allCompletedSteps: completedSteps,
      recordProfileResult: fixedInput.backend.recordProfileResult,
    });
    primaryFailure =
      permissive.primaryFailure ?? constrained.primaryFailure ?? null;
  } catch (error) {
    primaryFailure = failureCode(error);
  } finally {
    if (fixedInput !== null) {
      try {
        await fixedInput.backend.cleanup();
      } catch {
        primaryFailure ??= "CLEANUP_FAILURE";
      }
    }
  }
  return Object.freeze({
    validity: primaryFailure === null ? "complete" : "inconclusive",
    primaryFailure,
    completedSteps: Object.freeze(completedSteps),
    permissive: pair === null ? null : permissive,
    constrained: pair === null ? null : constrained,
  });
}
