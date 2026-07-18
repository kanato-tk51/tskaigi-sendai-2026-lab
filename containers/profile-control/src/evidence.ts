import {
  CONTROL_EVIDENCE_SCHEMA_VERSION,
  CONTROL_IDS,
  CONTROL_ORDER,
  FIXED_NODE_VERSION,
} from "./constants.js";
import { expectedControls } from "./definitions.js";
import { failProfile } from "./errors.js";
import {
  assertBoolean,
  assertExactKeys,
  assertRunId,
  assertSha256,
  assertString,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  ControlEvidence,
  ControlManifest,
  ControlName,
  ControlObservation,
  ControlOutcome,
  ControlReason,
  EvidenceComparison,
  HostInspection,
  ProfileId,
} from "./types.js";

const EVIDENCE_KEYS = Object.freeze([
  "schemaVersion",
  "runId",
  "controlId",
  "profileId",
  "containerImageDigest",
  "nodeVersion",
  "observations",
  "complete",
]);
const OBSERVATION_KEYS = Object.freeze([
  "sequence",
  "control",
  "outcome",
  "reason",
]);

const OBSERVATION_SEMANTICS = Object.freeze({
  "environment-canary": Object.freeze({
    success: "ENV_PRESENT",
    failure: "ENV_ABSENT",
  }),
  "canary-file-read": Object.freeze({
    success: "FILE_READABLE",
    failure: "FILE_NOT_FOUND",
  }),
  "scratch-write": Object.freeze({
    success: "WRITE_CREATED",
    failure: "WRITE_DENIED",
  }),
  "source-mutation": Object.freeze({
    success: "WRITE_CREATED",
    failure: "WRITE_DENIED",
  }),
  "loopback-protocol": Object.freeze({
    success: "LOOPBACK_PROTOCOL_VERIFIED",
    failure: "NETWORK_FAILURE",
  }),
  "fixed-child": Object.freeze({
    success: "CHILD_PROTOCOL_VERIFIED",
    failure: "CHILD_PROCESS_DENIED",
  }),
  "result-write": Object.freeze({
    success: "RESULT_WRITTEN",
    failure: null,
  }),
});

function validateObservation(
  input: unknown,
  index: number,
): ControlObservation {
  const value = readPlainRecord(input, "INVALID_CONTROL_EVIDENCE");
  assertExactKeys(value, OBSERVATION_KEYS, "INVALID_CONTROL_EVIDENCE");
  if (value.sequence !== index || value.control !== CONTROL_ORDER[index]) {
    failProfile("INVALID_CONTROL_EVIDENCE");
  }
  const outcome = assertString(
    value.outcome,
    ["success", "failure"],
    "INVALID_CONTROL_EVIDENCE",
  ) as ControlOutcome;
  const reason = assertString(
    value.reason,
    [
      "ENV_PRESENT",
      "ENV_ABSENT",
      "FILE_READABLE",
      "FILE_NOT_FOUND",
      "WRITE_CREATED",
      "WRITE_DENIED",
      "LOOPBACK_PROTOCOL_VERIFIED",
      "NETWORK_FAILURE",
      "CHILD_PROTOCOL_VERIFIED",
      "CHILD_PROCESS_DENIED",
      "RESULT_WRITTEN",
    ],
    "INVALID_CONTROL_EVIDENCE",
  ) as ControlReason;
  const control = CONTROL_ORDER[index] as ControlName;
  if (OBSERVATION_SEMANTICS[control][outcome] !== reason) {
    failProfile("INVALID_CONTROL_EVIDENCE");
  }
  return Object.freeze({
    sequence: index,
    control,
    outcome,
    reason,
  });
}

export function validateControlEvidence(input: unknown): ControlEvidence {
  const value = readPlainRecord(input, "INVALID_CONTROL_EVIDENCE");
  assertExactKeys(value, EVIDENCE_KEYS, "INVALID_CONTROL_EVIDENCE");
  assertString(
    value.schemaVersion,
    CONTROL_EVIDENCE_SCHEMA_VERSION,
    "INVALID_CONTROL_EVIDENCE",
  );
  const runId = assertRunId(value.runId, "INVALID_CONTROL_EVIDENCE");
  const profileId = assertString(
    value.profileId,
    ["permissive", "constrained"],
    "INVALID_CONTROL_EVIDENCE",
  ) as ProfileId;
  assertString(
    value.controlId,
    CONTROL_IDS[profileId],
    "INVALID_CONTROL_EVIDENCE",
  );
  const digest = assertSha256(
    value.containerImageDigest,
    "INVALID_CONTROL_EVIDENCE",
  );
  assertString(
    value.nodeVersion,
    FIXED_NODE_VERSION,
    "INVALID_CONTROL_EVIDENCE",
  );
  if (!assertBoolean(value.complete, "INVALID_CONTROL_EVIDENCE")) {
    failProfile("INVALID_CONTROL_EVIDENCE");
  }
  const observations = readPlainArray(
    value.observations,
    "INVALID_CONTROL_EVIDENCE",
  );
  if (observations.length !== CONTROL_ORDER.length) {
    failProfile("INVALID_CONTROL_EVIDENCE");
  }
  return Object.freeze({
    schemaVersion: CONTROL_EVIDENCE_SCHEMA_VERSION,
    runId,
    controlId: CONTROL_IDS[profileId],
    profileId,
    containerImageDigest: digest,
    nodeVersion: FIXED_NODE_VERSION,
    observations: Object.freeze(
      observations.map((entry, index) => validateObservation(entry, index)),
    ),
    complete: true,
  });
}

export function compareControlEvidence(input: {
  readonly manifest: ControlManifest;
  readonly hostInspection: HostInspection;
  readonly evidence: ControlEvidence;
}): EvidenceComparison {
  const { manifest, hostInspection, evidence } = input;
  if (
    manifest.runId !== evidence.runId ||
    manifest.runId !== hostInspection.runId ||
    manifest.controlId !== evidence.controlId ||
    manifest.controlId !== hostInspection.controlId ||
    manifest.profileId !== evidence.profileId ||
    manifest.profileId !== hostInspection.profileId ||
    manifest.containerImageDigest !== evidence.containerImageDigest ||
    manifest.containerImageDigest !== hostInspection.containerImageDigest ||
    evidence.complete !== true
  ) {
    failProfile("INVALID_CONTROL_EVIDENCE");
  }
  const expected = expectedControls(manifest.profileId);
  const mismatches: ControlName[] = [];
  evidence.observations.forEach((observation, index) => {
    const expectedEntry = expected[index];
    if (
      expectedEntry === undefined ||
      observation.control !== expectedEntry.control ||
      observation.outcome !== expectedEntry.outcome ||
      observation.reason !== expectedEntry.reason
    ) {
      mismatches.push(observation.control);
    }
  });
  return Object.freeze({
    runId: manifest.runId,
    profileId: manifest.profileId,
    complete: true,
    mismatchCount: mismatches.length,
    mismatches: Object.freeze(mismatches),
  });
}
