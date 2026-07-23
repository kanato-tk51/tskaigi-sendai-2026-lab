import {
  DOCTOR_INVENTORY_SCHEMA_VERSION,
  DOCTOR_LIMITS,
  FIXED_BASE_IMAGE_ARCHITECTURE,
  FIXED_BASE_IMAGE_NAME,
  FIXED_BASE_IMAGE_OS,
  FIXED_BASE_IMAGE_TAG,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_NODE_VERSION,
} from "./constants.js";
import {
  FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
  FIXED_BASE_IMAGE_INSPECT_FORMAT,
  FIXED_RUNTIME_VERSION_FORMAT,
} from "./docker-formats.js";
import { FIXED_DOCKER_EXECUTABLE } from "./docker-plan.js";
import { failProfile } from "./errors.js";
import { validateBaseEnvironmentKeys } from "./image-input.js";
import {
  assertExactKeys,
  assertSha256,
  captureAuthority,
  readPlainArray,
  readPlainRecord,
  snapshotBytes,
} from "./safe-data.js";

export const DOCTOR_STEP_IDS = Object.freeze([
  "runtime-version",
  "base-image-identity",
  "base-environment-keys",
] as const);

export type DoctorStepId = (typeof DOCTOR_STEP_IDS)[number];

export {
  FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
  FIXED_BASE_IMAGE_INSPECT_FORMAT,
  FIXED_RUNTIME_VERSION_FORMAT,
} from "./docker-formats.js";

export interface FixedDoctorCommand {
  readonly stepId: DoctorStepId;
  readonly executable: typeof FIXED_DOCKER_EXECUTABLE;
  readonly arguments: readonly string[];
  readonly shell: false;
}

export interface FixedDoctorPlan {
  readonly commands: readonly [
    FixedDoctorCommand,
    FixedDoctorCommand,
    FixedDoctorCommand,
  ];
}

export interface FixedDoctorBackend {
  run(
    command: FixedDoctorCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown>;
  cleanup(): Promise<void>;
}

export interface DoctorInventory {
  readonly schemaVersion: typeof DOCTOR_INVENTORY_SCHEMA_VERSION;
  readonly dockerClientVersion: typeof FIXED_DOCKER_CLI_VERSION;
  readonly dockerServerVersion: typeof FIXED_DOCKER_SERVER_VERSION;
  readonly baseImageTag: typeof FIXED_BASE_IMAGE_TAG;
  readonly baseImageName: typeof FIXED_BASE_IMAGE_NAME;
  readonly baseImageDigest: `sha256:${string}`;
  readonly localImageId: `sha256:${string}`;
  readonly nodeVersion: typeof FIXED_NODE_VERSION;
  readonly os: typeof FIXED_BASE_IMAGE_OS;
  readonly architecture: typeof FIXED_BASE_IMAGE_ARCHITECTURE;
  readonly baseEnvironmentKeys: readonly string[];
}

export type DoctorFailureCode =
  | "COMMAND_FAILURE"
  | "COMMAND_TIMEOUT"
  | "OUTPUT_LIMIT"
  | "INVALID_OUTPUT"
  | "CLEANUP_FAILURE";

export type DoctorRejectionCode =
  | "RUNTIME_VERSION_MISMATCH"
  | "BASE_IMAGE_IDENTITY_MISMATCH"
  | "BASE_IMAGE_PLATFORM_MISMATCH";

export type DoctorResult =
  | Readonly<{
      validity: "accepted";
      primaryFailure: null;
      rejection: null;
      completedSteps: readonly DoctorStepId[];
      inventory: DoctorInventory;
    }>
  | Readonly<{
      validity: "rejected";
      primaryFailure: null;
      rejection: DoctorRejectionCode;
      completedSteps: readonly DoctorStepId[];
      inventory: null;
    }>
  | Readonly<{
      validity: "inconclusive";
      primaryFailure: DoctorFailureCode;
      rejection: null;
      completedSteps: readonly DoctorStepId[];
      inventory: null;
    }>;

const COMMAND_RESULT_KEYS = Object.freeze([
  "exitCode",
  "timedOut",
  "outputLimitExceeded",
  "stdoutBytes",
  "stderrBytes",
  "stdout",
]);
const IMAGE_IDENTITY_KEYS = Object.freeze([
  "architecture",
  "id",
  "os",
  "repoDigests",
]);
const ENVIRONMENT_SNAPSHOT_KEYS = Object.freeze([
  "architecture",
  "environmentKeys",
  "id",
  "os",
  "repoDigests",
]);
const RUNTIME_VERSION_KEYS = Object.freeze(["client", "server"]);
const commandBrands = new WeakSet<FixedDoctorCommand>();
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
const canonicalEncoder = new TextEncoder();

class DoctorFailure extends Error {
  readonly code: DoctorFailureCode;

  constructor(code: DoctorFailureCode) {
    super(code);
    this.name = "DoctorFailure";
    this.code = code;
  }
}

class DoctorRejection extends Error {
  readonly code: DoctorRejectionCode;

  constructor(code: DoctorRejectionCode) {
    super(code);
    this.name = "DoctorRejection";
    this.code = code;
  }
}

function doctorFailure(code: DoctorFailureCode): never {
  throw new DoctorFailure(code);
}

function doctorRejection(code: DoctorRejectionCode): never {
  throw new DoctorRejection(code);
}

function fixedCommand(
  stepId: DoctorStepId,
  arguments_: readonly string[],
): FixedDoctorCommand {
  const command = Object.freeze({
    stepId,
    executable: FIXED_DOCKER_EXECUTABLE,
    arguments: Object.freeze([...arguments_]),
    shell: false as const,
  });
  commandBrands.add(command);
  return command;
}

export function createFixedDoctorPlan(): FixedDoctorPlan {
  return Object.freeze({
    commands: Object.freeze([
      fixedCommand("runtime-version", [
        "version",
        "--format",
        FIXED_RUNTIME_VERSION_FORMAT,
      ]),
      fixedCommand("base-image-identity", [
        "image",
        "inspect",
        "--format",
        FIXED_BASE_IMAGE_INSPECT_FORMAT,
        FIXED_BASE_IMAGE_TAG,
      ]),
      fixedCommand("base-environment-keys", [
        "image",
        "inspect",
        "--format",
        FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
        FIXED_BASE_IMAGE_TAG,
      ]),
    ] as const),
  });
}

export function assertFixedDoctorCommand(
  command: FixedDoctorCommand,
): FixedDoctorCommand {
  if (!commandBrands.has(command)) return failProfile("INVALID_DOCTOR_PLAN");
  return command;
}

function nonNegativeInteger(input: unknown): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 0) {
    return doctorFailure("INVALID_OUTPUT");
  }
  return input;
}

function outputBytes(input: unknown): Uint8Array {
  try {
    return snapshotBytes(input, {
      code: "INVALID_DOCTOR_OUTPUT",
      maximum: DOCTOR_LIMITS.outputBytes,
    });
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
}

async function runStep(
  backend: FixedDoctorBackend,
  command: FixedDoctorCommand,
): Promise<Uint8Array> {
  assertFixedDoctorCommand(command);
  let raw: unknown;
  try {
    raw = await backend.run(command, {
      timeoutMs: DOCTOR_LIMITS.timeoutMs,
      outputBytes: DOCTOR_LIMITS.outputBytes,
    });
  } catch {
    return doctorFailure("COMMAND_FAILURE");
  }
  let value;
  try {
    value = readPlainRecord(raw, "INVALID_DOCTOR_OUTPUT");
    assertExactKeys(value, COMMAND_RESULT_KEYS, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  const timedOut = value.timedOut;
  const outputLimitExceeded = value.outputLimitExceeded;
  if (
    typeof timedOut !== "boolean" ||
    typeof outputLimitExceeded !== "boolean"
  ) {
    return doctorFailure("INVALID_OUTPUT");
  }
  const stdoutBytes = nonNegativeInteger(value.stdoutBytes);
  const stderrBytes = nonNegativeInteger(value.stderrBytes);
  if (
    outputLimitExceeded ||
    stdoutBytes + stderrBytes > DOCTOR_LIMITS.outputBytes
  ) {
    return doctorFailure("OUTPUT_LIMIT");
  }
  if (timedOut) return doctorFailure("COMMAND_TIMEOUT");
  if (
    value.exitCode !== null &&
    (typeof value.exitCode !== "number" ||
      !Number.isSafeInteger(value.exitCode))
  ) {
    return doctorFailure("INVALID_OUTPUT");
  }
  if (value.exitCode !== 0) return doctorFailure("COMMAND_FAILURE");
  const stdout = outputBytes(value.stdout);
  if (stdout.byteLength !== stdoutBytes) {
    return doctorFailure("INVALID_OUTPUT");
  }
  return stdout;
}

function lineText(bytes: Uint8Array): string {
  let text: string;
  try {
    text = fatalDecoder.decode(bytes);
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  if (!text.endsWith("\n") || text.includes("\r") || text.includes("\0")) {
    return doctorFailure("INVALID_OUTPUT");
  }
  return text.slice(0, -1);
}

function parseJsonRecord(bytes: Uint8Array): Readonly<Record<string, unknown>> {
  const text = lineText(bytes);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    if (error instanceof DoctorFailure) throw error;
    return doctorFailure("INVALID_OUTPUT");
  }
  let value;
  try {
    value = readPlainRecord(raw, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  return value;
}

function assertCanonicalJsonBytes(bytes: Uint8Array, value: unknown): void {
  let canonicalText: string | undefined;
  try {
    canonicalText = JSON.stringify(value);
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  if (canonicalText === undefined) return doctorFailure("INVALID_OUTPUT");
  const canonicalBytes = canonicalEncoder.encode(`${canonicalText}\n`);
  if (canonicalBytes.byteLength !== bytes.byteLength) {
    return doctorFailure("INVALID_OUTPUT");
  }
  for (let index = 0; index < canonicalBytes.byteLength; index += 1) {
    if (canonicalBytes[index] !== bytes[index]) {
      return doctorFailure("INVALID_OUTPUT");
    }
  }
}

function stringValue(input: unknown): string {
  if (typeof input !== "string") return doctorFailure("INVALID_OUTPUT");
  return input;
}

function stringArray(input: unknown): readonly string[] {
  let values;
  try {
    values = readPlainArray(input, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  if (values.some((value) => typeof value !== "string")) {
    return doctorFailure("INVALID_OUTPUT");
  }
  return Object.freeze([...values] as string[]);
}

function parseRuntimeVersion(bytes: Uint8Array): void {
  const value = parseJsonRecord(bytes);
  try {
    assertExactKeys(value, RUNTIME_VERSION_KEYS, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  const normalized = Object.freeze({
    client: stringValue(value.client),
    server: stringValue(value.server),
  });
  assertCanonicalJsonBytes(bytes, normalized);
  if (
    normalized.client !== FIXED_DOCKER_CLI_VERSION ||
    normalized.server !== FIXED_DOCKER_SERVER_VERSION
  ) {
    doctorRejection("RUNTIME_VERSION_MISMATCH");
  }
}

interface SanitizedImageIdentity {
  readonly architecture: string;
  readonly id: string;
  readonly os: string;
  readonly repoDigests: readonly string[];
}

interface AcceptedImageIdentity {
  readonly baseImageDigest: `sha256:${string}`;
  readonly localImageId: `sha256:${string}`;
  readonly architecture: typeof FIXED_BASE_IMAGE_ARCHITECTURE;
  readonly os: typeof FIXED_BASE_IMAGE_OS;
}

function normalizeImageIdentity(
  value: Readonly<Record<string, unknown>>,
): SanitizedImageIdentity {
  return Object.freeze({
    architecture: stringValue(value.architecture),
    id: stringValue(value.id),
    os: stringValue(value.os),
    repoDigests: stringArray(value.repoDigests),
  });
}

function validateImageIdentity(
  identity: SanitizedImageIdentity,
): AcceptedImageIdentity {
  if (
    identity.os !== FIXED_BASE_IMAGE_OS ||
    identity.architecture !== FIXED_BASE_IMAGE_ARCHITECTURE
  ) {
    return doctorRejection("BASE_IMAGE_PLATFORM_MISMATCH");
  }
  if (identity.repoDigests.length !== 1) {
    return doctorRejection("BASE_IMAGE_IDENTITY_MISMATCH");
  }
  const prefix = `${FIXED_BASE_IMAGE_NAME}@`;
  const repositoryDigest = identity.repoDigests[0];
  if (repositoryDigest === undefined || !repositoryDigest.startsWith(prefix)) {
    return doctorRejection("BASE_IMAGE_IDENTITY_MISMATCH");
  }
  let baseImageDigest: `sha256:${string}`;
  let localImageId: `sha256:${string}`;
  try {
    baseImageDigest = assertSha256(
      repositoryDigest.slice(prefix.length),
      "INVALID_DOCTOR_OUTPUT",
    );
    localImageId = assertSha256(identity.id, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorRejection("BASE_IMAGE_IDENTITY_MISMATCH");
  }
  return Object.freeze({
    architecture: FIXED_BASE_IMAGE_ARCHITECTURE,
    baseImageDigest,
    localImageId,
    os: FIXED_BASE_IMAGE_OS,
  });
}

function parseImageIdentity(bytes: Uint8Array): AcceptedImageIdentity {
  const value = parseJsonRecord(bytes);
  try {
    assertExactKeys(value, IMAGE_IDENTITY_KEYS, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  const identity = normalizeImageIdentity(value);
  assertCanonicalJsonBytes(bytes, identity);
  return validateImageIdentity(identity);
}

function sameImageIdentity(
  left: AcceptedImageIdentity,
  right: AcceptedImageIdentity,
): boolean {
  return (
    left.architecture === right.architecture &&
    left.baseImageDigest === right.baseImageDigest &&
    left.localImageId === right.localImageId &&
    left.os === right.os
  );
}

function parseBaseEnvironmentSnapshot(
  bytes: Uint8Array,
  expectedIdentity: AcceptedImageIdentity,
): readonly string[] {
  const value = parseJsonRecord(bytes);
  try {
    assertExactKeys(value, ENVIRONMENT_SNAPSHOT_KEYS, "INVALID_DOCTOR_OUTPUT");
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  const environmentKeys = stringArray(value.environmentKeys);
  const identity = normalizeImageIdentity(value);
  const normalized = Object.freeze({
    architecture: identity.architecture,
    environmentKeys,
    id: identity.id,
    os: identity.os,
    repoDigests: identity.repoDigests,
  });
  assertCanonicalJsonBytes(bytes, normalized);
  const acceptedIdentity = validateImageIdentity(identity);
  if (!sameImageIdentity(acceptedIdentity, expectedIdentity)) {
    return doctorRejection("BASE_IMAGE_IDENTITY_MISMATCH");
  }
  if (environmentKeys.includes("M4_INVALID_ENV_ENTRY")) {
    return doctorFailure("INVALID_OUTPUT");
  }
  let keys: readonly string[];
  try {
    keys = validateBaseEnvironmentKeys(environmentKeys);
  } catch {
    return doctorFailure("INVALID_OUTPUT");
  }
  if (!keys.includes("PATH") || !keys.includes("NODE_VERSION")) {
    return doctorFailure("INVALID_OUTPUT");
  }
  return keys;
}

export async function executeFixedDoctor(
  backend: FixedDoctorBackend,
): Promise<DoctorResult> {
  const completedSteps: DoctorStepId[] = [];
  let failure: DoctorFailureCode | null = null;
  let rejection: DoctorRejectionCode | null = null;
  let inventory: DoctorInventory | null = null;
  let authority: FixedDoctorBackend;
  try {
    authority = captureAuthority<FixedDoctorBackend>(
      backend,
      ["run", "cleanup"],
      "INVALID_DOCTOR_OUTPUT",
    );
  } catch {
    return Object.freeze({
      validity: "inconclusive",
      primaryFailure: "INVALID_OUTPUT",
      rejection: null,
      completedSteps: Object.freeze([]),
      inventory: null,
    });
  }
  try {
    const plan = createFixedDoctorPlan();
    const runtimeOutput = await runStep(authority, plan.commands[0]);
    parseRuntimeVersion(runtimeOutput);
    completedSteps.push("runtime-version");
    const imageIdentityOutput = await runStep(authority, plan.commands[1]);
    const imageIdentity = parseImageIdentity(imageIdentityOutput);
    completedSteps.push("base-image-identity");
    const environmentOutput = await runStep(authority, plan.commands[2]);
    const baseEnvironmentKeys = parseBaseEnvironmentSnapshot(
      environmentOutput,
      imageIdentity,
    );
    completedSteps.push("base-environment-keys");
    inventory = Object.freeze({
      schemaVersion: DOCTOR_INVENTORY_SCHEMA_VERSION,
      dockerClientVersion: FIXED_DOCKER_CLI_VERSION,
      dockerServerVersion: FIXED_DOCKER_SERVER_VERSION,
      baseImageTag: FIXED_BASE_IMAGE_TAG,
      baseImageName: FIXED_BASE_IMAGE_NAME,
      baseImageDigest: imageIdentity.baseImageDigest,
      localImageId: imageIdentity.localImageId,
      nodeVersion: FIXED_NODE_VERSION,
      os: FIXED_BASE_IMAGE_OS,
      architecture: FIXED_BASE_IMAGE_ARCHITECTURE,
      baseEnvironmentKeys,
    });
  } catch (error) {
    if (error instanceof DoctorRejection) rejection = error.code;
    else {
      failure = error instanceof DoctorFailure ? error.code : "INVALID_OUTPUT";
    }
  }
  try {
    await authority.cleanup();
  } catch {
    if (failure === null) failure = "CLEANUP_FAILURE";
  }
  const completed = Object.freeze([...completedSteps]);
  if (failure !== null) {
    return Object.freeze({
      validity: "inconclusive",
      primaryFailure: failure,
      rejection: null,
      completedSteps: completed,
      inventory: null,
    });
  }
  if (rejection !== null) {
    return Object.freeze({
      validity: "rejected",
      primaryFailure: null,
      rejection,
      completedSteps: completed,
      inventory: null,
    });
  }
  if (inventory === null) {
    return Object.freeze({
      validity: "inconclusive",
      primaryFailure: "INVALID_OUTPUT",
      rejection: null,
      completedSteps: completed,
      inventory: null,
    });
  }
  return Object.freeze({
    validity: "accepted",
    primaryFailure: null,
    rejection: null,
    completedSteps: completed,
    inventory,
  });
}
