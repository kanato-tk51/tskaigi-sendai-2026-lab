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
import { failProfile } from "./errors.js";
import {
  assertExactKeys,
  assertRunId,
  assertSha256,
  readPlainRecord,
} from "./safe-data.js";
import { assertAcceptedImageStagingSnapshot } from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  CapabilityPolicy,
  ControlManifest,
  ExecutionProfile,
  ExpectedControlOutcome,
  OuterBoundary,
  ProfileControlPair,
  ProfileId,
  ResourceLimits,
} from "./types.js";
import { validateExecutionProfile } from "./validation.js";

const acceptedPairSnapshots = new WeakMap<
  ProfileControlPair,
  AcceptedImageStagingSnapshot
>();

const OUTER_BOUNDARY: OuterBoundary = Object.freeze({
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

const RESOURCE_LIMITS: ResourceLimits = Object.freeze({ ...LIMITS });

const PERMISSIVE_CAPABILITIES: CapabilityPolicy = Object.freeze({
  environmentCanary: "present",
  canaryFile: "present",
  scratchWrite: "writable",
  sourceWrite: "read-only",
  loopbackService: "present",
  childProcess: "allowed",
  resultChannel: "writable",
  deniedBy: Object.freeze({
    environmentCanary: "not-denied",
    canaryFile: "not-denied",
    scratchWrite: "not-denied",
    sourceWrite: "filesystem",
    loopbackService: "not-denied",
    childProcess: "not-denied",
  }),
});

const CONSTRAINED_CAPABILITIES: CapabilityPolicy = Object.freeze({
  environmentCanary: "absent",
  canaryFile: "absent",
  scratchWrite: "read-only",
  sourceWrite: "read-only",
  loopbackService: "absent",
  childProcess: "denied",
  resultChannel: "writable",
  deniedBy: Object.freeze({
    environmentCanary: "target-absent",
    canaryFile: "target-absent",
    scratchWrite: "filesystem",
    sourceWrite: "filesystem",
    loopbackService: "target-absent",
    childProcess: "node-runtime",
  }),
});

const PERMISSIVE_EXPECTED: readonly ExpectedControlOutcome[] = Object.freeze([
  Object.freeze({
    sequence: 0,
    control: "environment-canary",
    outcome: "success",
    reason: "ENV_PRESENT",
    enforcement: "container",
  }),
  Object.freeze({
    sequence: 1,
    control: "canary-file-read",
    outcome: "success",
    reason: "FILE_READABLE",
    enforcement: "container",
  }),
  Object.freeze({
    sequence: 2,
    control: "scratch-write",
    outcome: "success",
    reason: "WRITE_CREATED",
    enforcement: "filesystem",
  }),
  Object.freeze({
    sequence: 3,
    control: "source-mutation",
    outcome: "failure",
    reason: "WRITE_DENIED",
    enforcement: "filesystem",
  }),
  Object.freeze({
    sequence: 4,
    control: "loopback-protocol",
    outcome: "success",
    reason: "LOOPBACK_PROTOCOL_VERIFIED",
    enforcement: "container",
  }),
  Object.freeze({
    sequence: 5,
    control: "fixed-child",
    outcome: "success",
    reason: "CHILD_PROTOCOL_VERIFIED",
    enforcement: "container",
  }),
  Object.freeze({
    sequence: 6,
    control: "result-write",
    outcome: "success",
    reason: "RESULT_WRITTEN",
    enforcement: "control-plane",
  }),
]);

const CONSTRAINED_EXPECTED: readonly ExpectedControlOutcome[] = Object.freeze([
  Object.freeze({
    sequence: 0,
    control: "environment-canary",
    outcome: "failure",
    reason: "ENV_ABSENT",
    enforcement: "target-absent",
  }),
  Object.freeze({
    sequence: 1,
    control: "canary-file-read",
    outcome: "failure",
    reason: "FILE_NOT_FOUND",
    enforcement: "target-absent",
  }),
  Object.freeze({
    sequence: 2,
    control: "scratch-write",
    outcome: "failure",
    reason: "WRITE_DENIED",
    enforcement: "filesystem",
  }),
  Object.freeze({
    sequence: 3,
    control: "source-mutation",
    outcome: "failure",
    reason: "WRITE_DENIED",
    enforcement: "filesystem",
  }),
  Object.freeze({
    sequence: 4,
    control: "loopback-protocol",
    outcome: "failure",
    reason: "NETWORK_FAILURE",
    enforcement: "target-absent",
  }),
  Object.freeze({
    sequence: 5,
    control: "fixed-child",
    outcome: "failure",
    reason: "CHILD_PROCESS_DENIED",
    enforcement: "node-runtime",
  }),
  Object.freeze({
    sequence: 6,
    control: "result-write",
    outcome: "success",
    reason: "RESULT_WRITTEN",
    enforcement: "control-plane",
  }),
]);

export function expectedControls(
  profileId: ProfileId,
): readonly ExpectedControlOutcome[] {
  if (profileId !== "permissive" && profileId !== "constrained") {
    failProfile("INVALID_PROFILE");
  }
  return profileId === "permissive"
    ? PERMISSIVE_EXPECTED
    : CONSTRAINED_EXPECTED;
}

export function createExecutionProfile(
  profileId: ProfileId,
  containerImageDigest: `sha256:${string}`,
): ExecutionProfile {
  if (profileId !== "permissive" && profileId !== "constrained") {
    failProfile("INVALID_PROFILE");
  }
  const digest = assertSha256(containerImageDigest, "INVALID_PROFILE");
  return Object.freeze({
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId,
    profileRevision: FIXED_PROFILE_REVISION,
    containerInputId: FIXED_CONTAINER_INPUT_ID,
    containerImageDigest: digest,
    nodeVersion: FIXED_NODE_VERSION,
    outerBoundary: OUTER_BOUNDARY,
    capabilities:
      profileId === "permissive"
        ? PERMISSIVE_CAPABILITIES
        : CONSTRAINED_CAPABILITIES,
    limits: RESOURCE_LIMITS,
    evidence: LOGICAL_EVIDENCE,
  });
}

export function createControlManifest(
  profile: ExecutionProfile,
  runId: string,
): ControlManifest {
  const canonicalProfile = validateExecutionProfile(profile);
  const canonicalRunId = assertRunId(runId, "INVALID_CONTROL_MANIFEST");
  return Object.freeze({
    schemaVersion: CONTROL_MANIFEST_SCHEMA_VERSION,
    runId: canonicalRunId,
    controlId: CONTROL_IDS[canonicalProfile.profileId],
    profileId: canonicalProfile.profileId,
    profileRevision: canonicalProfile.profileRevision,
    containerInputId: canonicalProfile.containerInputId,
    containerImageDigest: canonicalProfile.containerImageDigest,
    nodeVersion: canonicalProfile.nodeVersion,
    controlOrder: Object.freeze([...CONTROL_ORDER]),
    expected: expectedControls(canonicalProfile.profileId),
    limits: canonicalProfile.limits,
  });
}

export function createProfileControlPair(input: {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly containerImageDigest: `sha256:${string}`;
  readonly permissiveRunId: string;
  readonly constrainedRunId: string;
}): ProfileControlPair {
  const wrapper = readPlainRecord(input, "INVALID_PROFILE_PAIR");
  assertExactKeys(
    wrapper,
    [
      "acceptedSnapshot",
      "containerImageDigest",
      "permissiveRunId",
      "constrainedRunId",
    ],
    "INVALID_PROFILE_PAIR",
  );
  const acceptedSnapshot = assertAcceptedImageStagingSnapshot(
    wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
  );
  const containerImageDigest = assertSha256(
    wrapper.containerImageDigest,
    "INVALID_PROFILE_PAIR",
  );
  const permissiveRunId = assertRunId(
    wrapper.permissiveRunId,
    "INVALID_PROFILE_PAIR",
  );
  const constrainedRunId = assertRunId(
    wrapper.constrainedRunId,
    "INVALID_PROFILE_PAIR",
  );
  if (permissiveRunId === constrainedRunId) {
    failProfile("INVALID_PROFILE_PAIR");
  }
  const permissiveProfile = createExecutionProfile(
    "permissive",
    containerImageDigest,
  );
  const constrainedProfile = createExecutionProfile(
    "constrained",
    containerImageDigest,
  );
  const pair = Object.freeze({
    containerImageDigest,
    stagingDigest: acceptedSnapshot.stagingDigest,
    permissive: Object.freeze({
      profile: permissiveProfile,
      manifest: createControlManifest(permissiveProfile, permissiveRunId),
    }),
    constrained: Object.freeze({
      profile: constrainedProfile,
      manifest: createControlManifest(constrainedProfile, constrainedRunId),
    }),
  });
  acceptedPairSnapshots.set(pair, acceptedSnapshot);
  return pair;
}

export function assertAcceptedProfileControlPair(
  pair: ProfileControlPair,
  acceptedSnapshot: AcceptedImageStagingSnapshot,
): ProfileControlPair {
  if (acceptedPairSnapshots.get(pair) !== acceptedSnapshot) {
    return failProfile("INVALID_PROFILE_PAIR");
  }
  return pair;
}
