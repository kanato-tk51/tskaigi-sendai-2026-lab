import {
  CONTROL_IDS,
  CONTROL_MANIFEST_SCHEMA_VERSION,
  CONTROL_ORDER,
  FIXED_CONTAINER_INPUT_ID,
  FIXED_NODE_VERSION,
  FIXED_PROFILE_REVISION,
  LIMITS,
  LOGICAL_EVIDENCE,
  PROFILE_SCHEMA_VERSION,
} from "./constants.js";
import { expectedControls } from "./definitions.js";
import { failProfile } from "./errors.js";
import {
  assertBoolean,
  assertExactKeys,
  assertPositiveInteger,
  assertRunId,
  assertSha256,
  assertString,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  CapabilityPolicy,
  ControlManifest,
  ControlName,
  EnforcementMechanism,
  ExecutionProfile,
  ExpectedControlOutcome,
  LogicalEvidenceLocations,
  OuterBoundary,
  ProfileId,
  ProfileControlPair,
  ProfileRunDefinition,
  ResourceLimits,
} from "./types.js";

const PROFILE_KEYS = Object.freeze([
  "schemaVersion",
  "profileId",
  "profileRevision",
  "containerInputId",
  "containerImageDigest",
  "nodeVersion",
  "outerBoundary",
  "capabilities",
  "limits",
  "evidence",
]);

const OUTER_KEYS = Object.freeze([
  "nonRoot",
  "readOnlyRoot",
  "dropAllCapabilities",
  "noNewPrivileges",
  "externalNetwork",
  "hostHome",
  "credentials",
  "runtimeSocket",
  "devices",
]);

const CAPABILITY_KEYS = Object.freeze([
  "environmentCanary",
  "canaryFile",
  "scratchWrite",
  "sourceWrite",
  "loopbackService",
  "childProcess",
  "resultChannel",
  "deniedBy",
]);

const DENIED_BY_KEYS = [
  "environmentCanary",
  "canaryFile",
  "scratchWrite",
  "sourceWrite",
  "loopbackService",
  "childProcess",
] as const;

const LIMIT_KEYS = [
  "controlTimeoutMs",
  "outputBytes",
  "evidenceBytes",
  "evidenceFiles",
  "memoryBytes",
  "nanoCpus",
  "pids",
] as const;

const EVIDENCE_KEYS = [
  "runRoot",
  "inputRoot",
  "hostRoot",
  "resultRoot",
  "scratchRoot",
  "manifest",
  "hostInspection",
  "controlEvidence",
  "completion",
  "comparison",
] as const;

const MANIFEST_KEYS = Object.freeze([
  "schemaVersion",
  "runId",
  "controlId",
  "profileId",
  "profileRevision",
  "containerInputId",
  "containerImageDigest",
  "nodeVersion",
  "controlOrder",
  "expected",
  "limits",
]);

const EXPECTED_KEYS = Object.freeze([
  "sequence",
  "control",
  "outcome",
  "reason",
  "enforcement",
]);

const PAIR_KEYS = Object.freeze([
  "containerImageDigest",
  "stagingDigest",
  "permissive",
  "constrained",
]);
const RUN_DEFINITION_KEYS = Object.freeze(["profile", "manifest"]);

const ENFORCEMENTS = Object.freeze([
  "container",
  "filesystem",
  "node-runtime",
  "target-absent",
  "manifest-skip",
  "not-denied",
] as const);

function profileId(value: unknown): ProfileId {
  return assertString(
    value,
    ["permissive", "constrained"],
    "INVALID_PROFILE",
  ) as ProfileId;
}

function validateOuter(input: unknown): OuterBoundary {
  const value = readPlainRecord(input, "INVALID_PROFILE");
  assertExactKeys(value, OUTER_KEYS, "INVALID_PROFILE");
  for (const key of [
    "nonRoot",
    "readOnlyRoot",
    "dropAllCapabilities",
    "noNewPrivileges",
  ] as const) {
    if (!assertBoolean(value[key], "INVALID_PROFILE")) {
      failProfile("INVALID_PROFILE");
    }
  }
  assertString(value.externalNetwork, "disabled", "INVALID_PROFILE");
  for (const key of [
    "hostHome",
    "credentials",
    "runtimeSocket",
    "devices",
  ] as const) {
    assertString(value[key], "absent", "INVALID_PROFILE");
  }
  return Object.freeze({
    nonRoot: true,
    readOnlyRoot: true,
    dropAllCapabilities: true,
    noNewPrivileges: true,
    externalNetwork: "disabled",
    hostHome: "absent",
    credentials: "absent",
    runtimeSocket: "absent",
    devices: "absent",
  });
}

function validateDeniedBy(input: unknown): CapabilityPolicy["deniedBy"] {
  const value = readPlainRecord(input, "INVALID_PROFILE");
  assertExactKeys(value, DENIED_BY_KEYS, "INVALID_PROFILE");
  const output = Object.create(null) as Record<
    (typeof DENIED_BY_KEYS)[number],
    EnforcementMechanism | "not-denied"
  >;
  for (const key of DENIED_BY_KEYS) {
    output[key] = assertString(value[key], ENFORCEMENTS, "INVALID_PROFILE") as
      EnforcementMechanism | "not-denied";
  }
  return Object.freeze(output);
}

function validateCapabilities(input: unknown, id: ProfileId): CapabilityPolicy {
  const value = readPlainRecord(input, "INVALID_PROFILE");
  assertExactKeys(value, CAPABILITY_KEYS, "INVALID_PROFILE");
  const result: CapabilityPolicy = Object.freeze({
    environmentCanary: assertString(
      value.environmentCanary,
      ["present", "absent"],
      "INVALID_PROFILE",
    ) as CapabilityPolicy["environmentCanary"],
    canaryFile: assertString(
      value.canaryFile,
      ["present", "absent"],
      "INVALID_PROFILE",
    ) as CapabilityPolicy["canaryFile"],
    scratchWrite: assertString(
      value.scratchWrite,
      ["writable", "read-only"],
      "INVALID_PROFILE",
    ) as CapabilityPolicy["scratchWrite"],
    sourceWrite: assertString(
      value.sourceWrite,
      "read-only",
      "INVALID_PROFILE",
    ) as "read-only",
    loopbackService: assertString(
      value.loopbackService,
      ["present", "absent"],
      "INVALID_PROFILE",
    ) as CapabilityPolicy["loopbackService"],
    childProcess: assertString(
      value.childProcess,
      ["allowed", "denied"],
      "INVALID_PROFILE",
    ) as CapabilityPolicy["childProcess"],
    resultChannel: assertString(
      value.resultChannel,
      "writable",
      "INVALID_PROFILE",
    ) as "writable",
    deniedBy: validateDeniedBy(value.deniedBy),
  });
  const expected =
    id === "permissive"
      ? {
          environmentCanary: "present",
          canaryFile: "present",
          scratchWrite: "writable",
          loopbackService: "present",
          childProcess: "allowed",
        }
      : {
          environmentCanary: "absent",
          canaryFile: "absent",
          scratchWrite: "read-only",
          loopbackService: "absent",
          childProcess: "denied",
        };
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (result[key as keyof CapabilityPolicy] !== expectedValue) {
      failProfile("INVALID_PROFILE");
    }
  }
  const expectedDenied =
    id === "permissive"
      ? [
          "not-denied",
          "not-denied",
          "not-denied",
          "filesystem",
          "not-denied",
          "not-denied",
        ]
      : [
          "target-absent",
          "target-absent",
          "filesystem",
          "filesystem",
          "target-absent",
          "node-runtime",
        ];
  DENIED_BY_KEYS.forEach((key, index) => {
    if (result.deniedBy[key] !== expectedDenied[index]) {
      failProfile("INVALID_PROFILE");
    }
  });
  return result;
}

function validateLimits(
  input: unknown,
  code: "INVALID_PROFILE" | "INVALID_CONTROL_MANIFEST",
): ResourceLimits {
  const value = readPlainRecord(input, code);
  assertExactKeys(value, LIMIT_KEYS, code);
  const result: ResourceLimits = Object.freeze({
    controlTimeoutMs: assertPositiveInteger(
      value.controlTimeoutMs,
      60_000,
      code,
    ),
    outputBytes: assertPositiveInteger(value.outputBytes, 1_048_576, code),
    evidenceBytes: assertPositiveInteger(value.evidenceBytes, 1_048_576, code),
    evidenceFiles: assertPositiveInteger(value.evidenceFiles, 32, code),
    memoryBytes: assertPositiveInteger(value.memoryBytes, 1_073_741_824, code),
    nanoCpus: assertPositiveInteger(value.nanoCpus, 2_000_000_000, code),
    pids: assertPositiveInteger(value.pids, 256, code),
  });
  if (LIMIT_KEYS.some((key) => result[key] !== LIMITS[key])) {
    failProfile(code);
  }
  return result;
}

function validateEvidenceLocations(input: unknown): LogicalEvidenceLocations {
  const value = readPlainRecord(input, "INVALID_PROFILE");
  assertExactKeys(value, EVIDENCE_KEYS, "INVALID_PROFILE");
  for (const key of EVIDENCE_KEYS) {
    assertString(value[key], LOGICAL_EVIDENCE[key], "INVALID_PROFILE");
  }
  return LOGICAL_EVIDENCE;
}

export function validateExecutionProfile(input: unknown): ExecutionProfile {
  const value = readPlainRecord(input, "INVALID_PROFILE");
  assertExactKeys(value, PROFILE_KEYS, "INVALID_PROFILE");
  assertString(value.schemaVersion, PROFILE_SCHEMA_VERSION, "INVALID_PROFILE");
  const id = profileId(value.profileId);
  assertString(
    value.profileRevision,
    FIXED_PROFILE_REVISION,
    "INVALID_PROFILE",
  );
  assertString(
    value.containerInputId,
    FIXED_CONTAINER_INPUT_ID,
    "INVALID_PROFILE",
  );
  const digest = assertSha256(value.containerImageDigest, "INVALID_PROFILE");
  assertString(value.nodeVersion, FIXED_NODE_VERSION, "INVALID_PROFILE");
  return Object.freeze({
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId: id,
    profileRevision: FIXED_PROFILE_REVISION,
    containerInputId: FIXED_CONTAINER_INPUT_ID,
    containerImageDigest: digest,
    nodeVersion: FIXED_NODE_VERSION,
    outerBoundary: validateOuter(value.outerBoundary),
    capabilities: validateCapabilities(value.capabilities, id),
    limits: validateLimits(value.limits, "INVALID_PROFILE"),
    evidence: validateEvidenceLocations(value.evidence),
  });
}

function validateControlOrder(input: unknown): readonly ControlName[] {
  const value = readPlainArray(input, "INVALID_CONTROL_MANIFEST");
  if (
    value.length !== CONTROL_ORDER.length ||
    value.some((entry, index) => entry !== CONTROL_ORDER[index])
  ) {
    failProfile("INVALID_CONTROL_MANIFEST");
  }
  return CONTROL_ORDER;
}

function validateExpected(
  input: unknown,
  id: ProfileId,
): readonly ExpectedControlOutcome[] {
  const value = readPlainArray(input, "INVALID_CONTROL_MANIFEST");
  const expected = expectedControls(id);
  if (value.length !== expected.length) {
    failProfile("INVALID_CONTROL_MANIFEST");
  }
  value.forEach((entry, index) => {
    const record = readPlainRecord(entry, "INVALID_CONTROL_MANIFEST");
    assertExactKeys(record, EXPECTED_KEYS, "INVALID_CONTROL_MANIFEST");
    const expectedEntry = expected[index];
    if (
      expectedEntry === undefined ||
      record.sequence !== expectedEntry.sequence ||
      record.control !== expectedEntry.control ||
      record.outcome !== expectedEntry.outcome ||
      record.reason !== expectedEntry.reason ||
      record.enforcement !== expectedEntry.enforcement
    ) {
      failProfile("INVALID_CONTROL_MANIFEST");
    }
  });
  return expected;
}

export function validateControlManifest(input: unknown): ControlManifest {
  const value = readPlainRecord(input, "INVALID_CONTROL_MANIFEST");
  assertExactKeys(value, MANIFEST_KEYS, "INVALID_CONTROL_MANIFEST");
  assertString(
    value.schemaVersion,
    CONTROL_MANIFEST_SCHEMA_VERSION,
    "INVALID_CONTROL_MANIFEST",
  );
  const runId = assertRunId(value.runId, "INVALID_CONTROL_MANIFEST");
  const id = assertString(
    value.profileId,
    ["permissive", "constrained"],
    "INVALID_CONTROL_MANIFEST",
  ) as ProfileId;
  assertString(value.controlId, CONTROL_IDS[id], "INVALID_CONTROL_MANIFEST");
  assertString(
    value.profileRevision,
    FIXED_PROFILE_REVISION,
    "INVALID_CONTROL_MANIFEST",
  );
  assertString(
    value.containerInputId,
    FIXED_CONTAINER_INPUT_ID,
    "INVALID_CONTROL_MANIFEST",
  );
  const digest = assertSha256(
    value.containerImageDigest,
    "INVALID_CONTROL_MANIFEST",
  );
  assertString(
    value.nodeVersion,
    FIXED_NODE_VERSION,
    "INVALID_CONTROL_MANIFEST",
  );
  return Object.freeze({
    schemaVersion: CONTROL_MANIFEST_SCHEMA_VERSION,
    runId,
    controlId: CONTROL_IDS[id],
    profileId: id,
    profileRevision: FIXED_PROFILE_REVISION,
    containerInputId: FIXED_CONTAINER_INPUT_ID,
    containerImageDigest: digest,
    nodeVersion: FIXED_NODE_VERSION,
    controlOrder: validateControlOrder(value.controlOrder),
    expected: validateExpected(value.expected, id),
    limits: validateLimits(value.limits, "INVALID_CONTROL_MANIFEST"),
  });
}

export function crossValidateProfileManifest(
  profile: ExecutionProfile,
  manifest: ControlManifest,
): void {
  if (
    profile.profileId !== manifest.profileId ||
    profile.profileRevision !== manifest.profileRevision ||
    profile.containerInputId !== manifest.containerInputId ||
    profile.containerImageDigest !== manifest.containerImageDigest ||
    profile.nodeVersion !== manifest.nodeVersion ||
    (profile.limits !== manifest.limits &&
      LIMIT_KEYS.some((key) => profile.limits[key] !== manifest.limits[key]))
  ) {
    failProfile("PROFILE_MANIFEST_MISMATCH");
  }
}

function validateRunDefinition(
  input: unknown,
  expectedProfileId: ProfileId,
): ProfileRunDefinition {
  const value = readPlainRecord(input, "INVALID_PROFILE_PAIR");
  assertExactKeys(value, RUN_DEFINITION_KEYS, "INVALID_PROFILE_PAIR");
  const profile = validateExecutionProfile(value.profile);
  const manifest = validateControlManifest(value.manifest);
  if (profile.profileId !== expectedProfileId) {
    failProfile("INVALID_PROFILE_PAIR");
  }
  crossValidateProfileManifest(profile, manifest);
  return Object.freeze({ profile, manifest });
}

export function validateProfileControlPair(input: unknown): ProfileControlPair {
  const value = readPlainRecord(input, "INVALID_PROFILE_PAIR");
  assertExactKeys(value, PAIR_KEYS, "INVALID_PROFILE_PAIR");
  const containerImageDigest = assertSha256(
    value.containerImageDigest,
    "INVALID_PROFILE_PAIR",
  );
  const stagingDigest = assertSha256(
    value.stagingDigest,
    "INVALID_PROFILE_PAIR",
  );
  const permissive = validateRunDefinition(value.permissive, "permissive");
  const constrained = validateRunDefinition(value.constrained, "constrained");
  if (
    permissive.manifest.runId === constrained.manifest.runId ||
    permissive.profile.containerImageDigest !== containerImageDigest ||
    constrained.profile.containerImageDigest !== containerImageDigest ||
    permissive.profile.nodeVersion !== constrained.profile.nodeVersion ||
    permissive.profile.profileRevision !==
      constrained.profile.profileRevision ||
    permissive.profile.containerInputId !==
      constrained.profile.containerInputId ||
    JSON.stringify(permissive.profile.limits) !==
      JSON.stringify(constrained.profile.limits) ||
    JSON.stringify(permissive.manifest.controlOrder) !==
      JSON.stringify(constrained.manifest.controlOrder)
  ) {
    failProfile("INVALID_PROFILE_PAIR");
  }
  return Object.freeze({
    containerImageDigest,
    stagingDigest,
    permissive,
    constrained,
  });
}
