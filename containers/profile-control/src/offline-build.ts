import {
  FIXED_BASE_ENVIRONMENT_KEYS,
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_NODE_VERSION,
  FIXED_STAGING_DIGEST,
  LIMITS,
  OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
} from "./constants.js";
import {
  assertFixedImageBuildPlan,
  type DockerCommand,
  type FixedRuntimeLayout,
  type ImageBuildPlan,
} from "./docker-plan.js";
import { failProfile } from "./errors.js";
import {
  assertExactKeys,
  assertSha256,
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
import type { AcceptedImageStagingSnapshot } from "./types.js";

export const OFFLINE_BUILD_STEP_IDS = Object.freeze([
  "stage-build-context",
  "doctor",
  "build",
  "inspect-image",
] as const);

export type OfflineBuildStepId = (typeof OFFLINE_BUILD_STEP_IDS)[number];
export type OfflineBuildCommandStepId = Exclude<
  OfflineBuildStepId,
  "stage-build-context"
>;
export type OfflineBuildFailureCode =
  | "STAGING_FAILURE"
  | "COMMAND_FAILURE"
  | "COMMAND_TIMEOUT"
  | "OUTPUT_LIMIT"
  | "INSPECTION_FAILURE"
  | "CLEANUP_FAILURE";

export interface OfflineBuildResult {
  readonly schemaVersion: typeof OFFLINE_BUILD_RESULT_SCHEMA_VERSION;
  readonly validity: "complete" | "inconclusive";
  readonly primaryFailure: OfflineBuildFailureCode | null;
  readonly completedSteps: readonly OfflineBuildStepId[];
  readonly baseImageDigest: typeof FIXED_BASE_IMAGE_DIGEST;
  readonly stagingDigest: typeof FIXED_STAGING_DIGEST;
  readonly dockerClientVersion: typeof FIXED_DOCKER_CLI_VERSION | null;
  readonly dockerServerVersion: typeof FIXED_DOCKER_SERVER_VERSION | null;
  readonly builtImageDigest: `sha256:${string}` | null;
}

export interface FixedOfflineBuildBackend {
  stageBuildContext(
    files: readonly Readonly<{
      logicalPath: string;
      bytes: Uint8Array;
    }>[],
  ): Promise<void>;
  readBuildContext(): Promise<unknown>;
  run(
    stepId: OfflineBuildCommandStepId,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown>;
  cleanup(): Promise<void>;
}

declare const fixedOfflineBuildInputBrand: unique symbol;

export interface FixedOfflineBuildInput {
  readonly [fixedOfflineBuildInputBrand]: true;
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly imageBuildPlan: ImageBuildPlan;
  readonly layout: FixedRuntimeLayout;
  readonly backend: FixedOfflineBuildBackend;
}

const RESULT_KEYS = Object.freeze([
  "schemaVersion",
  "validity",
  "primaryFailure",
  "completedSteps",
  "baseImageDigest",
  "stagingDigest",
  "dockerClientVersion",
  "dockerServerVersion",
  "builtImageDigest",
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
const RUNTIME_VERSION_KEYS = Object.freeze(["client", "server"]);
const FAILURE_CODES = Object.freeze([
  "STAGING_FAILURE",
  "COMMAND_FAILURE",
  "COMMAND_TIMEOUT",
  "OUTPUT_LIMIT",
  "INSPECTION_FAILURE",
  "CLEANUP_FAILURE",
] as const);
const M0_NODE24_IMAGE_DIGEST =
  "sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5";
const KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST =
  "sha256:1111111111111111111111111111111111111111111111111111111111111111";
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
const canonicalEncoder = new TextEncoder();
const fixedInputBindings = new WeakMap<
  FixedOfflineBuildInput,
  Readonly<{
    acceptedSnapshot: AcceptedImageStagingSnapshot;
    imageBuildPlan: ImageBuildPlan;
    layout: FixedRuntimeLayout;
    backend: FixedOfflineBuildBackend;
  }>
>();

class OfflineBuildFailure extends Error {
  constructor(readonly code: OfflineBuildFailureCode) {
    super(code);
    this.name = "OfflineBuildFailure";
  }
}

function failBuild(code: OfflineBuildFailureCode): never {
  throw new OfflineBuildFailure(code);
}

function exactProductionSnapshot(
  input: AcceptedImageStagingSnapshot,
): AcceptedImageStagingSnapshot {
  const snapshot = assertAcceptedImageStagingSnapshot(input);
  if (
    snapshot.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    snapshot.nodeVersion !== FIXED_NODE_VERSION ||
    snapshot.stagingDigest !== FIXED_STAGING_DIGEST ||
    snapshot.baseEnvironmentKeys.length !==
      FIXED_BASE_ENVIRONMENT_KEYS.length ||
    snapshot.baseEnvironmentKeys.some(
      (key, index) => key !== FIXED_BASE_ENVIRONMENT_KEYS[index],
    )
  ) {
    return failProfile("INVALID_STAGING_INPUT");
  }
  return snapshot;
}

function nonNegativeInteger(input: unknown): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 0) {
    return failBuild("COMMAND_FAILURE");
  }
  return input;
}

function immutableOutputBytes(input: unknown): Uint8Array {
  try {
    return snapshotBytes(input, {
      code: "INVALID_OFFLINE_BUILD_RESULT",
      maximum: LIMITS.outputBytes,
    });
  } catch {
    return failBuild("COMMAND_FAILURE");
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function canonicalLine(bytes: Uint8Array): string {
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return failBuild("COMMAND_FAILURE");
  }
  if (
    !text.endsWith("\n") ||
    text.slice(0, -1).includes("\n") ||
    text.includes("\r") ||
    text.includes("\0")
  ) {
    return failBuild("COMMAND_FAILURE");
  }
  return text;
}

function parseRuntimeVersion(bytes: Uint8Array): Readonly<{
  client: typeof FIXED_DOCKER_CLI_VERSION;
  server: typeof FIXED_DOCKER_SERVER_VERSION;
}> {
  const text = canonicalLine(bytes);
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failBuild("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "INVALID_OFFLINE_BUILD_RESULT");
    assertExactKeys(
      value,
      RUNTIME_VERSION_KEYS,
      "INVALID_OFFLINE_BUILD_RESULT",
    );
  } catch {
    return failBuild("COMMAND_FAILURE");
  }
  if (typeof value.client !== "string" || typeof value.server !== "string") {
    return failBuild("COMMAND_FAILURE");
  }
  const normalized = Object.freeze({
    client: value.client,
    server: value.server,
  });
  if (
    !equalBytes(
      bytes,
      canonicalEncoder.encode(`${JSON.stringify(normalized)}\n`),
    ) ||
    normalized.client !== FIXED_DOCKER_CLI_VERSION ||
    normalized.server !== FIXED_DOCKER_SERVER_VERSION
  ) {
    return failBuild("COMMAND_FAILURE");
  }
  return Object.freeze({
    client: FIXED_DOCKER_CLI_VERSION,
    server: FIXED_DOCKER_SERVER_VERSION,
  });
}

function parseBuiltImageDigest(bytes: Uint8Array): `sha256:${string}` {
  const text = canonicalLine(bytes);
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failBuild("INSPECTION_FAILURE");
  }
  let digest: `sha256:${string}`;
  try {
    digest = assertSha256(raw, "INVALID_OFFLINE_BUILD_RESULT");
  } catch {
    return failBuild("INSPECTION_FAILURE");
  }
  if (
    !equalBytes(
      bytes,
      canonicalEncoder.encode(`${JSON.stringify(digest)}\n`),
    ) ||
    digest === FIXED_BASE_IMAGE_DIGEST ||
    digest === M0_NODE24_IMAGE_DIGEST ||
    digest === KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST
  ) {
    return failBuild("INSPECTION_FAILURE");
  }
  return digest;
}

async function runCommand(
  backend: FixedOfflineBuildBackend,
  stepId: OfflineBuildCommandStepId,
  command: DockerCommand,
): Promise<Uint8Array> {
  let raw: unknown;
  try {
    raw = await backend.run(stepId, command, {
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
  } catch {
    return failBuild("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "INVALID_OFFLINE_BUILD_RESULT");
    assertExactKeys(value, COMMAND_RESULT_KEYS, "INVALID_OFFLINE_BUILD_RESULT");
  } catch {
    return failBuild("COMMAND_FAILURE");
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
    return failBuild("COMMAND_FAILURE");
  }
  if (value.timedOut) {
    if (value.exitCode !== null) return failBuild("COMMAND_FAILURE");
    return failBuild("COMMAND_TIMEOUT");
  }
  if (value.outputLimitExceeded) {
    if (
      value.exitCode !== null ||
      stdoutBytes + stderrBytes <= LIMITS.outputBytes
    ) {
      return failBuild("COMMAND_FAILURE");
    }
    return failBuild("OUTPUT_LIMIT");
  }
  if (value.closeObserved !== true || value.exitCode !== 0) {
    return failBuild("COMMAND_FAILURE");
  }
  if (stdoutBytes + stderrBytes > LIMITS.outputBytes) {
    return failBuild("OUTPUT_LIMIT");
  }
  const stdout = immutableOutputBytes(value.stdout);
  if (
    (stepId === "build" && stdout.byteLength !== 0) ||
    (stepId !== "build" &&
      (stdout.byteLength === 0 || stdout.byteLength !== stdoutBytes))
  ) {
    return failBuild("COMMAND_FAILURE");
  }
  return stdout;
}

function failureCode(error: unknown): OfflineBuildFailureCode {
  return error instanceof OfflineBuildFailure ? error.code : "COMMAND_FAILURE";
}

function createResult(input: {
  validity: "complete" | "inconclusive";
  primaryFailure: OfflineBuildFailureCode | null;
  completedSteps: readonly OfflineBuildStepId[];
  dockerVersion: Readonly<{
    client: typeof FIXED_DOCKER_CLI_VERSION;
    server: typeof FIXED_DOCKER_SERVER_VERSION;
  }> | null;
  builtImageDigest: `sha256:${string}` | null;
}): OfflineBuildResult {
  return validateOfflineBuildResult({
    schemaVersion: OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
    validity: input.validity,
    primaryFailure: input.primaryFailure,
    completedSteps: input.completedSteps,
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    dockerClientVersion: input.dockerVersion?.client ?? null,
    dockerServerVersion: input.dockerVersion?.server ?? null,
    builtImageDigest: input.builtImageDigest,
  });
}

export function createFixedOfflineBuildInput(input: {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly imageBuildPlan: ImageBuildPlan;
  readonly layout: FixedRuntimeLayout;
  readonly backend: FixedOfflineBuildBackend;
}): FixedOfflineBuildInput {
  const wrapper = readPlainRecord(input, "INVALID_OFFLINE_BUILD_RESULT");
  assertExactKeys(
    wrapper,
    ["acceptedSnapshot", "imageBuildPlan", "layout", "backend"],
    "INVALID_OFFLINE_BUILD_RESULT",
  );
  const acceptedSnapshot = exactProductionSnapshot(
    wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
  );
  const layout = wrapper.layout as FixedRuntimeLayout;
  const imageBuildPlan = assertFixedImageBuildPlan(
    wrapper.imageBuildPlan as ImageBuildPlan,
    acceptedSnapshot,
    layout,
  );
  const backend = captureAuthority<FixedOfflineBuildBackend>(
    wrapper.backend,
    ["stageBuildContext", "readBuildContext", "run", "cleanup"],
    "INVALID_OFFLINE_BUILD_RESULT",
  );
  const fixedInput = Object.freeze({
    acceptedSnapshot,
    imageBuildPlan,
    layout,
    backend,
  }) as unknown as FixedOfflineBuildInput;
  fixedInputBindings.set(
    fixedInput,
    Object.freeze({
      acceptedSnapshot,
      imageBuildPlan,
      layout,
      backend,
    }),
  );
  return fixedInput;
}

export async function executeFixedOfflineBuild(
  input: FixedOfflineBuildInput,
): Promise<OfflineBuildResult> {
  const fixedInput = fixedInputBindings.get(input);
  if (fixedInput === undefined) {
    return createResult({
      validity: "inconclusive",
      primaryFailure: "COMMAND_FAILURE",
      completedSteps: Object.freeze([]),
      dockerVersion: null,
      builtImageDigest: null,
    });
  }
  const completedSteps: OfflineBuildStepId[] = [];
  let primaryFailure: OfflineBuildFailureCode | null = null;
  let dockerVersion: Readonly<{
    client: typeof FIXED_DOCKER_CLI_VERSION;
    server: typeof FIXED_DOCKER_SERVER_VERSION;
  }> | null = null;
  let builtImageDigest: `sha256:${string}` | null = null;
  try {
    const snapshot = fixedInput.acceptedSnapshot;
    const plan = fixedInput.imageBuildPlan;
    try {
      await fixedInput.backend.stageBuildContext(
        copyAcceptedStagingFiles(snapshot),
      );
      verifyAcceptedStagingFiles(
        snapshot,
        await fixedInput.backend.readBuildContext(),
      );
    } catch {
      return failBuild("STAGING_FAILURE");
    }
    completedSteps.push("stage-build-context");
    dockerVersion = parseRuntimeVersion(
      await runCommand(fixedInput.backend, "doctor", plan.doctor),
    );
    completedSteps.push("doctor");
    await runCommand(fixedInput.backend, "build", plan.build);
    completedSteps.push("build");
    builtImageDigest = parseBuiltImageDigest(
      await runCommand(fixedInput.backend, "inspect-image", plan.inspectImage),
    );
    completedSteps.push("inspect-image");
  } catch (error) {
    primaryFailure = failureCode(error);
  } finally {
    try {
      await fixedInput.backend.cleanup();
    } catch {
      primaryFailure ??= "CLEANUP_FAILURE";
    }
  }
  return createResult({
    validity: primaryFailure === null ? "complete" : "inconclusive",
    primaryFailure,
    completedSteps: Object.freeze([...completedSteps]),
    dockerVersion,
    builtImageDigest: primaryFailure === null ? builtImageDigest : null,
  });
}

function validateCompletedSteps(input: unknown): readonly OfflineBuildStepId[] {
  const values = readPlainArray(input, "INVALID_OFFLINE_BUILD_RESULT");
  if (
    values.length > OFFLINE_BUILD_STEP_IDS.length ||
    values.some((value, index) => value !== OFFLINE_BUILD_STEP_IDS[index])
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  return Object.freeze([...values] as OfflineBuildStepId[]);
}

function validFailurePrefixLength(
  primaryFailure: OfflineBuildFailureCode,
  completedSteps: readonly OfflineBuildStepId[],
): boolean {
  switch (primaryFailure) {
    case "STAGING_FAILURE":
      return completedSteps.length === 0;
    case "INSPECTION_FAILURE":
      return completedSteps.length === 3;
    case "CLEANUP_FAILURE":
      return completedSteps.length === OFFLINE_BUILD_STEP_IDS.length;
    case "COMMAND_FAILURE":
    case "COMMAND_TIMEOUT":
    case "OUTPUT_LIMIT":
      return completedSteps.length < OFFLINE_BUILD_STEP_IDS.length;
  }
}

export function validateOfflineBuildResult(input: unknown): OfflineBuildResult {
  const value = readPlainRecord(input, "INVALID_OFFLINE_BUILD_RESULT");
  assertExactKeys(value, RESULT_KEYS, "INVALID_OFFLINE_BUILD_RESULT");
  if (
    value.schemaVersion !== OFFLINE_BUILD_RESULT_SCHEMA_VERSION ||
    (value.validity !== "complete" && value.validity !== "inconclusive") ||
    value.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    value.stagingDigest !== FIXED_STAGING_DIGEST
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  const completedSteps = validateCompletedSteps(value.completedSteps);
  const primaryFailure = value.primaryFailure as OfflineBuildFailureCode | null;
  if (
    primaryFailure !== null &&
    !FAILURE_CODES.includes(primaryFailure as OfflineBuildFailureCode)
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  const versionObserved = completedSteps.includes("doctor");
  if (
    (versionObserved &&
      (value.dockerClientVersion !== FIXED_DOCKER_CLI_VERSION ||
        value.dockerServerVersion !== FIXED_DOCKER_SERVER_VERSION)) ||
    (!versionObserved &&
      (value.dockerClientVersion !== null ||
        value.dockerServerVersion !== null))
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  let builtImageDigest: `sha256:${string}` | null = null;
  if (value.builtImageDigest !== null) {
    builtImageDigest = assertSha256(
      value.builtImageDigest,
      "INVALID_OFFLINE_BUILD_RESULT",
    );
    if (
      builtImageDigest === FIXED_BASE_IMAGE_DIGEST ||
      builtImageDigest === M0_NODE24_IMAGE_DIGEST ||
      builtImageDigest === KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST
    ) {
      return failProfile("INVALID_OFFLINE_BUILD_RESULT");
    }
  }
  if (
    (value.validity === "complete" &&
      (primaryFailure !== null ||
        completedSteps.length !== OFFLINE_BUILD_STEP_IDS.length ||
        builtImageDigest === null)) ||
    (value.validity === "inconclusive" &&
      (primaryFailure === null ||
        builtImageDigest !== null ||
        !validFailurePrefixLength(primaryFailure, completedSteps)))
  ) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  return Object.freeze({
    schemaVersion: OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
    validity: value.validity,
    primaryFailure,
    completedSteps,
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    dockerClientVersion: versionObserved ? FIXED_DOCKER_CLI_VERSION : null,
    dockerServerVersion: versionObserved ? FIXED_DOCKER_SERVER_VERSION : null,
    builtImageDigest,
  }) as OfflineBuildResult;
}

export function serializeCanonicalOfflineBuildResult(
  input: unknown,
): Uint8Array {
  return canonicalEncoder.encode(
    `${JSON.stringify(validateOfflineBuildResult(input))}\n`,
  );
}

export function parseCanonicalOfflineBuildResultBytes(
  input: unknown,
): OfflineBuildResult {
  const bytes = snapshotBytes(input, {
    code: "INVALID_OFFLINE_BUILD_RESULT",
    maximum: LIMITS.evidenceBytes,
    allowEmpty: false,
  });
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  if (!text.endsWith("\n") || text.slice(0, -1).includes("\n")) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  const result = validateOfflineBuildResult(raw);
  if (!equalBytes(bytes, serializeCanonicalOfflineBuildResult(result))) {
    return failProfile("INVALID_OFFLINE_BUILD_RESULT");
  }
  return result;
}
