import path from "node:path";
import { types } from "node:util";
import { fileURLToPath } from "node:url";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_STAGING_DIGEST,
  LIMITS,
  OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION,
  OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
} from "./constants.js";
import { FIXED_DOCKER_EXECUTABLE, type DockerCommand } from "./docker-plan.js";
import { failProfile } from "./errors.js";
import { FIXED_IMAGE_ID_FORMAT } from "./docker-formats.js";
import {
  validateOfflineBuildResult,
  type OfflineBuildResult,
} from "./offline-build.js";
import {
  assertExactKeys,
  assertSha256,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";

export const FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID =
  "m4-offline-build-20260718-01" as const;
export const FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG =
  "tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01" as const;

export const OFFLINE_BUILD_RECOVERY_STEP_IDS = Object.freeze([
  "validate-retained-state",
  "inspect-image",
  "validate-retained-state-after-inspect",
] as const);

export type OfflineBuildRecoveryStepId =
  (typeof OFFLINE_BUILD_RECOVERY_STEP_IDS)[number];
export type OfflineBuildRecoveryFailureCode =
  | "STATE_VALIDATION_FAILURE"
  | "COMMAND_FAILURE"
  | "COMMAND_TIMEOUT"
  | "OUTPUT_LIMIT"
  | "INSPECTION_FAILURE"
  | "OWNED_STATE_FAILURE";

export interface OfflineBuildRecoveryResult {
  readonly schemaVersion: typeof OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION;
  readonly validity: "complete" | "inconclusive";
  readonly primaryFailure: OfflineBuildRecoveryFailureCode | null;
  readonly completedSteps: readonly OfflineBuildRecoveryStepId[];
  readonly runId: typeof FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID;
  readonly stagedImageTag: typeof FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG;
  readonly baseImageDigest: typeof FIXED_BASE_IMAGE_DIGEST;
  readonly stagingDigest: typeof FIXED_STAGING_DIGEST;
  readonly builtImageDigest: `sha256:${string}` | null;
  readonly ownedStateDisposition: "retained";
}

export interface FixedOfflineBuildRecoveryBackend {
  validateRetainedState(): Promise<void>;
  run(
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown>;
}

declare const fixedRecoveryInputBrand: unique symbol;

export interface FixedOfflineBuildRecoveryInput {
  readonly [fixedRecoveryInputBrand]: true;
  readonly failedBuildResult: OfflineBuildResult;
  readonly command: DockerCommand;
  readonly backend: FixedOfflineBuildRecoveryBackend;
}

const repositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const fixedDockerConfigRoot = path.join(
  repositoryRoot,
  "results",
  "runs",
  "m4-profile-controls",
  FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  "docker-config",
);
const M0_NODE24_IMAGE_DIGEST =
  "sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5";
const KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST =
  "sha256:1111111111111111111111111111111111111111111111111111111111111111";
const RESULT_KEYS = Object.freeze([
  "schemaVersion",
  "validity",
  "primaryFailure",
  "completedSteps",
  "runId",
  "stagedImageTag",
  "baseImageDigest",
  "stagingDigest",
  "builtImageDigest",
  "ownedStateDisposition",
]);
const COMMAND_RESULT_KEYS = Object.freeze([
  "exitCode",
  "timedOut",
  "outputLimitExceeded",
  "closeObserved",
  "stdoutBytes",
  "stderrBytes",
  "stdout",
]);
const FAILURE_CODES = Object.freeze([
  "STATE_VALIDATION_FAILURE",
  "COMMAND_FAILURE",
  "COMMAND_TIMEOUT",
  "OUTPUT_LIMIT",
  "INSPECTION_FAILURE",
  "OWNED_STATE_FAILURE",
] as const);
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
const canonicalEncoder = new TextEncoder();
const fixedRecoveryCommands = new WeakSet<DockerCommand>();
const fixedInputBindings = new WeakMap<
  FixedOfflineBuildRecoveryInput,
  Readonly<{
    failedBuildResult: OfflineBuildResult;
    command: DockerCommand;
    backend: FixedOfflineBuildRecoveryBackend;
  }>
>();

class RecoveryFailure extends Error {
  constructor(readonly code: OfflineBuildRecoveryFailureCode) {
    super(code);
    this.name = "RecoveryFailure";
  }
}

function failRecovery(code: OfflineBuildRecoveryFailureCode): never {
  throw new RecoveryFailure(code);
}

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function isPlaceholderDigest(digest: `sha256:${string}`): boolean {
  return (
    digest === FIXED_BASE_IMAGE_DIGEST ||
    digest === M0_NODE24_IMAGE_DIGEST ||
    digest === KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST
  );
}

function validateRecordedFailedBuildResult(input: unknown): OfflineBuildResult {
  let result: OfflineBuildResult;
  try {
    result = validateOfflineBuildResult(input);
  } catch {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  if (
    result.schemaVersion !== OFFLINE_BUILD_RESULT_SCHEMA_VERSION ||
    result.validity !== "inconclusive" ||
    result.primaryFailure !== "CLEANUP_FAILURE" ||
    result.completedSteps.length !== 4 ||
    result.completedSteps[0] !== "stage-build-context" ||
    result.completedSteps[1] !== "doctor" ||
    result.completedSteps[2] !== "build" ||
    result.completedSteps[3] !== "inspect-image" ||
    result.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    result.stagingDigest !== FIXED_STAGING_DIGEST ||
    result.dockerClientVersion !== FIXED_DOCKER_CLI_VERSION ||
    result.dockerServerVersion !== FIXED_DOCKER_SERVER_VERSION ||
    result.builtImageDigest !== null
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  return result;
}

function createFixedRecoveryCommand(): DockerCommand {
  const command = Object.freeze({
    executable: FIXED_DOCKER_EXECUTABLE,
    arguments: Object.freeze([
      "image",
      "inspect",
      "--format",
      FIXED_IMAGE_ID_FORMAT,
      FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
    ]),
    environment: Object.freeze({ DOCKER_CONFIG: fixedDockerConfigRoot }),
    shell: false,
  });
  fixedRecoveryCommands.add(command);
  return command;
}

export function assertFixedOfflineBuildRecoveryCommand(
  input: DockerCommand,
): DockerCommand {
  if (
    !fixedRecoveryCommands.has(input) ||
    input.executable !== FIXED_DOCKER_EXECUTABLE ||
    input.shell !== false ||
    input.environment.DOCKER_CONFIG !== fixedDockerConfigRoot ||
    input.arguments.length !== 5 ||
    input.arguments[0] !== "image" ||
    input.arguments[1] !== "inspect" ||
    input.arguments[2] !== "--format" ||
    input.arguments[3] !== FIXED_IMAGE_ID_FORMAT ||
    input.arguments[4] !== FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  return input;
}

function nonNegativeInteger(input: unknown): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 0) {
    return failRecovery("COMMAND_FAILURE");
  }
  return input;
}

function immutableOutput(input: unknown): Uint8Array {
  if (
    !types.isUint8Array(input) ||
    input.buffer instanceof SharedArrayBuffer ||
    input.byteLength === 0 ||
    input.byteLength > LIMITS.outputBytes
  ) {
    return failRecovery("COMMAND_FAILURE");
  }
  return Uint8Array.from(input);
}

async function runInspectCommand(
  backend: FixedOfflineBuildRecoveryBackend,
  command: DockerCommand,
): Promise<Uint8Array> {
  let raw: unknown;
  try {
    raw = await backend.run(command, {
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
  } catch {
    return failRecovery("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
    assertExactKeys(
      value,
      COMMAND_RESULT_KEYS,
      "INVALID_OFFLINE_BUILD_RECOVERY_RESULT",
    );
  } catch {
    return failRecovery("COMMAND_FAILURE");
  }
  const stdoutBytes = nonNegativeInteger(value.stdoutBytes);
  const stderrBytes = nonNegativeInteger(value.stderrBytes);
  if (
    typeof value.timedOut !== "boolean" ||
    typeof value.outputLimitExceeded !== "boolean" ||
    typeof value.closeObserved !== "boolean" ||
    (value.exitCode !== null &&
      (typeof value.exitCode !== "number" ||
        !Number.isSafeInteger(value.exitCode))) ||
    (value.timedOut && value.outputLimitExceeded)
  ) {
    return failRecovery("COMMAND_FAILURE");
  }
  if (value.timedOut) {
    if (value.exitCode !== null) return failRecovery("COMMAND_FAILURE");
    return failRecovery("COMMAND_TIMEOUT");
  }
  if (value.outputLimitExceeded) {
    if (
      value.exitCode !== null ||
      stdoutBytes + stderrBytes <= LIMITS.outputBytes
    ) {
      return failRecovery("COMMAND_FAILURE");
    }
    return failRecovery("OUTPUT_LIMIT");
  }
  if (value.closeObserved !== true || value.exitCode !== 0) {
    return failRecovery("COMMAND_FAILURE");
  }
  if (stdoutBytes + stderrBytes > LIMITS.outputBytes) {
    return failRecovery("OUTPUT_LIMIT");
  }
  const stdout = immutableOutput(value.stdout);
  if (stdout.byteLength !== stdoutBytes) {
    return failRecovery("COMMAND_FAILURE");
  }
  return stdout;
}

function parseRecoveredImageDigest(bytes: Uint8Array): `sha256:${string}` {
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return failRecovery("INSPECTION_FAILURE");
  }
  if (
    !text.endsWith("\n") ||
    text.slice(0, -1).includes("\n") ||
    text.includes("\r") ||
    text.includes("\0")
  ) {
    return failRecovery("INSPECTION_FAILURE");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failRecovery("INSPECTION_FAILURE");
  }
  let digest: `sha256:${string}`;
  try {
    digest = assertSha256(raw, "INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  } catch {
    return failRecovery("INSPECTION_FAILURE");
  }
  if (
    isPlaceholderDigest(digest) ||
    !sameBytes(bytes, canonicalEncoder.encode(`${JSON.stringify(digest)}\n`))
  ) {
    return failRecovery("INSPECTION_FAILURE");
  }
  return digest;
}

function recoveryFailureCode(error: unknown): OfflineBuildRecoveryFailureCode {
  return error instanceof RecoveryFailure ? error.code : "COMMAND_FAILURE";
}

function createResult(input: {
  readonly primaryFailure: OfflineBuildRecoveryFailureCode | null;
  readonly completedSteps: readonly OfflineBuildRecoveryStepId[];
  readonly builtImageDigest: `sha256:${string}` | null;
}): OfflineBuildRecoveryResult {
  return validateOfflineBuildRecoveryResult({
    schemaVersion: OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION,
    validity: input.primaryFailure === null ? "complete" : "inconclusive",
    primaryFailure: input.primaryFailure,
    completedSteps: input.completedSteps,
    runId: FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
    stagedImageTag: FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    builtImageDigest:
      input.primaryFailure === null ? input.builtImageDigest : null,
    ownedStateDisposition: "retained",
  });
}

export function createFixedOfflineBuildRecoveryInput(input: {
  readonly failedBuildResult: unknown;
  readonly backend: FixedOfflineBuildRecoveryBackend;
}): FixedOfflineBuildRecoveryInput {
  const failedBuildResult = validateRecordedFailedBuildResult(
    input.failedBuildResult,
  );
  const command = createFixedRecoveryCommand();
  const fixedInput = Object.freeze({
    failedBuildResult,
    command,
    backend: input.backend,
  }) as unknown as FixedOfflineBuildRecoveryInput;
  fixedInputBindings.set(
    fixedInput,
    Object.freeze({ failedBuildResult, command, backend: input.backend }),
  );
  return fixedInput;
}

export async function executeFixedOfflineBuildRecovery(
  input: FixedOfflineBuildRecoveryInput,
): Promise<OfflineBuildRecoveryResult> {
  const fixedInput = fixedInputBindings.get(input);
  if (fixedInput === undefined) {
    return createResult({
      primaryFailure: "STATE_VALIDATION_FAILURE",
      completedSteps: Object.freeze([]),
      builtImageDigest: null,
    });
  }
  const completedSteps: OfflineBuildRecoveryStepId[] = [];
  let primaryFailure: OfflineBuildRecoveryFailureCode | null = null;
  let builtImageDigest: `sha256:${string}` | null = null;
  try {
    await fixedInput.backend.validateRetainedState();
    completedSteps.push("validate-retained-state");
  } catch {
    primaryFailure = "STATE_VALIDATION_FAILURE";
  }
  if (primaryFailure === null) {
    try {
      builtImageDigest = parseRecoveredImageDigest(
        await runInspectCommand(fixedInput.backend, fixedInput.command),
      );
      completedSteps.push("inspect-image");
    } catch (error) {
      primaryFailure = recoveryFailureCode(error);
    } finally {
      try {
        await fixedInput.backend.validateRetainedState();
        if (primaryFailure === null) {
          completedSteps.push("validate-retained-state-after-inspect");
        }
      } catch {
        if (primaryFailure === null) {
          primaryFailure = "OWNED_STATE_FAILURE";
        }
        builtImageDigest = null;
      }
    }
  }
  return createResult({
    primaryFailure,
    completedSteps: Object.freeze([...completedSteps]),
    builtImageDigest,
  });
}

function validateCompletedSteps(
  input: unknown,
): readonly OfflineBuildRecoveryStepId[] {
  const steps = readPlainArray(input, "INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  if (
    steps.length > OFFLINE_BUILD_RECOVERY_STEP_IDS.length ||
    steps.some((step, index) => step !== OFFLINE_BUILD_RECOVERY_STEP_IDS[index])
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  return Object.freeze([...steps] as OfflineBuildRecoveryStepId[]);
}

function validFailureState(
  failure: OfflineBuildRecoveryFailureCode,
  completedSteps: readonly OfflineBuildRecoveryStepId[],
): boolean {
  switch (failure) {
    case "STATE_VALIDATION_FAILURE":
      return completedSteps.length === 0;
    case "COMMAND_FAILURE":
    case "COMMAND_TIMEOUT":
    case "OUTPUT_LIMIT":
    case "INSPECTION_FAILURE":
      return completedSteps.length === 1;
    case "OWNED_STATE_FAILURE":
      return completedSteps.length === 2;
  }
}

export function validateOfflineBuildRecoveryResult(
  input: unknown,
): OfflineBuildRecoveryResult {
  const value = readPlainRecord(input, "INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  assertExactKeys(value, RESULT_KEYS, "INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  if (
    value.schemaVersion !== OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION ||
    (value.validity !== "complete" && value.validity !== "inconclusive") ||
    value.runId !== FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID ||
    value.stagedImageTag !== FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG ||
    value.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    value.stagingDigest !== FIXED_STAGING_DIGEST ||
    value.ownedStateDisposition !== "retained"
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  const completedSteps = validateCompletedSteps(value.completedSteps);
  const primaryFailure =
    value.primaryFailure as OfflineBuildRecoveryFailureCode | null;
  if (
    primaryFailure !== null &&
    !FAILURE_CODES.includes(primaryFailure as OfflineBuildRecoveryFailureCode)
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  let builtImageDigest: `sha256:${string}` | null = null;
  if (value.builtImageDigest !== null) {
    builtImageDigest = assertSha256(
      value.builtImageDigest,
      "INVALID_OFFLINE_BUILD_RECOVERY_RESULT",
    );
    if (isPlaceholderDigest(builtImageDigest)) {
      return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
    }
  }
  if (
    (value.validity === "complete" &&
      (primaryFailure !== null ||
        completedSteps.length !== OFFLINE_BUILD_RECOVERY_STEP_IDS.length ||
        builtImageDigest === null)) ||
    (value.validity === "inconclusive" &&
      (primaryFailure === null ||
        builtImageDigest !== null ||
        !validFailureState(primaryFailure, completedSteps)))
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  return Object.freeze({
    schemaVersion: OFFLINE_BUILD_RECOVERY_RESULT_SCHEMA_VERSION,
    validity: value.validity,
    primaryFailure,
    completedSteps,
    runId: FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
    stagedImageTag: FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    builtImageDigest,
    ownedStateDisposition: "retained",
  }) as OfflineBuildRecoveryResult;
}

export function serializeCanonicalOfflineBuildRecoveryResult(
  input: unknown,
): Uint8Array {
  return canonicalEncoder.encode(
    `${JSON.stringify(validateOfflineBuildRecoveryResult(input))}\n`,
  );
}

export function parseCanonicalOfflineBuildRecoveryResultBytes(
  input: unknown,
): OfflineBuildRecoveryResult {
  if (
    !types.isUint8Array(input) ||
    input.buffer instanceof SharedArrayBuffer ||
    input.byteLength === 0 ||
    input.byteLength > LIMITS.evidenceBytes
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  const bytes = Uint8Array.from(input);
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  if (
    !text.endsWith("\n") ||
    text.slice(0, -1).includes("\n") ||
    text.includes("\r") ||
    text.includes("\0")
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  const result = validateOfflineBuildRecoveryResult(raw);
  if (!sameBytes(bytes, serializeCanonicalOfflineBuildRecoveryResult(result))) {
    return failProfile("INVALID_OFFLINE_BUILD_RECOVERY_RESULT");
  }
  return result;
}
