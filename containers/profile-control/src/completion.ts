import { createHash } from "node:crypto";
import { types } from "node:util";

import { CONTROL_COMPLETION_SCHEMA_VERSION, CONTROL_IDS } from "./constants.js";
import {
  parseCanonicalControlEvidenceBytes,
  parseCanonicalControlManifestBytes,
} from "./canonical.js";
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
  ControlCompletion,
  ControlEvidence,
  ControlManifest,
  HostInspection,
  ProfileId,
} from "./types.js";

const COMPLETION_KEYS = Object.freeze([
  "schemaVersion",
  "runId",
  "controlId",
  "profileId",
  "containerImageDigest",
  "hostInspectionComplete",
  "controlEvidenceComplete",
  "evidenceTransferred",
  "manifestSha256",
  "hostInspectionSha256",
  "controlEvidenceSha256",
  "inventory",
  "complete",
]);
const CONSTRAINED_INVENTORY = Object.freeze([
  "input/control-manifest.json",
  "host/host-inspection.json",
  "container-result/control-evidence.json",
  "container-result/result-marker.txt",
  "host/completion.json",
  "host/comparison.json",
] as const);
const PERMISSIVE_INVENTORY = Object.freeze([
  "input/control-manifest.json",
  "host/host-inspection.json",
  "container-result/control-evidence.json",
  "container-result/result-marker.txt",
  "scratch/scratch-marker.txt",
  "host/completion.json",
  "host/comparison.json",
] as const);

function immutableBytes(input: unknown): Uint8Array {
  if (
    !types.isUint8Array(input) ||
    input.buffer instanceof SharedArrayBuffer ||
    input.byteLength === 0
  ) {
    return failProfile("INVALID_CONTROL_COMPLETION");
  }
  return Uint8Array.from(input);
}

function digest(input: unknown): `sha256:${string}` {
  return `sha256:${createHash("sha256")
    .update(immutableBytes(input))
    .digest("hex")}`;
}

export function validateControlCompletion(input: unknown): ControlCompletion {
  const value = readPlainRecord(input, "INVALID_CONTROL_COMPLETION");
  assertExactKeys(value, COMPLETION_KEYS, "INVALID_CONTROL_COMPLETION");
  assertString(
    value.schemaVersion,
    CONTROL_COMPLETION_SCHEMA_VERSION,
    "INVALID_CONTROL_COMPLETION",
  );
  const runId = assertRunId(value.runId, "INVALID_CONTROL_COMPLETION");
  const profileId = assertString(
    value.profileId,
    ["permissive", "constrained"],
    "INVALID_CONTROL_COMPLETION",
  ) as ProfileId;
  assertString(
    value.controlId,
    CONTROL_IDS[profileId],
    "INVALID_CONTROL_COMPLETION",
  );
  const digest = assertSha256(
    value.containerImageDigest,
    "INVALID_CONTROL_COMPLETION",
  );
  const manifestSha256 = assertSha256(
    value.manifestSha256,
    "INVALID_CONTROL_COMPLETION",
  );
  const hostInspectionSha256 = assertSha256(
    value.hostInspectionSha256,
    "INVALID_CONTROL_COMPLETION",
  );
  const controlEvidenceSha256 = assertSha256(
    value.controlEvidenceSha256,
    "INVALID_CONTROL_COMPLETION",
  );
  for (const key of [
    "hostInspectionComplete",
    "controlEvidenceComplete",
    "evidenceTransferred",
    "complete",
  ] as const) {
    if (!assertBoolean(value[key], "INVALID_CONTROL_COMPLETION")) {
      failProfile("INVALID_CONTROL_COMPLETION");
    }
  }
  const inventory = readPlainArray(
    value.inventory,
    "INVALID_CONTROL_COMPLETION",
  );
  const expectedInventory =
    profileId === "permissive" ? PERMISSIVE_INVENTORY : CONSTRAINED_INVENTORY;
  if (
    inventory.length !== expectedInventory.length ||
    inventory.some((entry, index) => entry !== expectedInventory[index])
  ) {
    failProfile("INVALID_CONTROL_COMPLETION");
  }
  return Object.freeze({
    schemaVersion: CONTROL_COMPLETION_SCHEMA_VERSION,
    runId,
    controlId: CONTROL_IDS[profileId],
    profileId,
    containerImageDigest: digest,
    hostInspectionComplete: true,
    controlEvidenceComplete: true,
    evidenceTransferred: true,
    manifestSha256,
    hostInspectionSha256,
    controlEvidenceSha256,
    inventory: expectedInventory,
    complete: true,
  });
}

export function crossValidateCompleteBundle(input: {
  readonly manifest: ControlManifest;
  readonly inspection: HostInspection;
  readonly evidence: ControlEvidence;
  readonly completion: ControlCompletion;
  readonly manifestBytes: Uint8Array;
  readonly hostInspectionBytes: Uint8Array;
  readonly controlEvidenceBytes: Uint8Array;
}): void {
  const { manifest, inspection, evidence, completion } = input;
  const parsedManifest = parseCanonicalControlManifestBytes(
    input.manifestBytes,
  );
  const parsedEvidence = parseCanonicalControlEvidenceBytes(
    input.controlEvidenceBytes,
  );
  if (
    [inspection, evidence, completion].some(
      (entry) =>
        entry.runId !== manifest.runId ||
        entry.controlId !== manifest.controlId ||
        entry.profileId !== manifest.profileId ||
        entry.containerImageDigest !== manifest.containerImageDigest,
    ) ||
    parsedManifest.runId !== manifest.runId ||
    parsedEvidence.runId !== evidence.runId ||
    completion.manifestSha256 !== digest(input.manifestBytes) ||
    completion.hostInspectionSha256 !== digest(input.hostInspectionBytes) ||
    completion.controlEvidenceSha256 !== digest(input.controlEvidenceBytes) ||
    new TextDecoder("utf-8", { fatal: true }).decode(
      immutableBytes(input.hostInspectionBytes),
    ) !== `${JSON.stringify(inspection)}\n` ||
    evidence.complete !== true ||
    completion.complete !== true
  ) {
    failProfile("INVALID_CONTROL_COMPLETION");
  }
}

export function createControlCompletion(input: {
  readonly manifest: ControlManifest;
  readonly inspection: HostInspection;
  readonly evidence: ControlEvidence;
  readonly manifestBytes: Uint8Array;
  readonly hostInspectionBytes: Uint8Array;
  readonly controlEvidenceBytes: Uint8Array;
}): ControlCompletion {
  const inventory =
    input.manifest.profileId === "permissive"
      ? PERMISSIVE_INVENTORY
      : CONSTRAINED_INVENTORY;
  const completion = validateControlCompletion({
    schemaVersion: CONTROL_COMPLETION_SCHEMA_VERSION,
    runId: input.manifest.runId,
    controlId: input.manifest.controlId,
    profileId: input.manifest.profileId,
    containerImageDigest: input.manifest.containerImageDigest,
    hostInspectionComplete: true,
    controlEvidenceComplete: true,
    evidenceTransferred: true,
    manifestSha256: digest(input.manifestBytes),
    hostInspectionSha256: digest(input.hostInspectionBytes),
    controlEvidenceSha256: digest(input.controlEvidenceBytes),
    inventory,
    complete: true,
  });
  crossValidateCompleteBundle({ ...input, completion });
  return completion;
}
