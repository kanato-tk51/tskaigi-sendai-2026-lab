import { createHash } from "node:crypto";

import { CONTROL_COMPLETION_SCHEMA_VERSION, CONTROL_IDS } from "./constants.js";
import {
  parseCanonicalControlEvidenceBytes,
  parseCanonicalControlManifestBytes,
} from "./canonical.js";
import { failProfile } from "./errors.js";
import { validateControlEvidence } from "./evidence.js";
import { validateHostInspection } from "./inspect.js";
import {
  assertBoolean,
  assertExactKeys,
  assertRunId,
  assertSha256,
  assertString,
  readPlainArray,
  readPlainRecord,
  snapshotBytes,
} from "./safe-data.js";
import type {
  ControlCompletion,
  ControlEvidence,
  ControlManifest,
  HostInspection,
  ProfileId,
} from "./types.js";
import { validateControlManifest } from "./validation.js";

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
  return snapshotBytes(input, {
    code: "INVALID_CONTROL_COMPLETION",
    maximum: 65_536,
    allowEmpty: false,
  });
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
  const wrapper = readPlainRecord(input, "INVALID_CONTROL_COMPLETION");
  assertExactKeys(
    wrapper,
    [
      "manifest",
      "inspection",
      "evidence",
      "completion",
      "manifestBytes",
      "hostInspectionBytes",
      "controlEvidenceBytes",
    ],
    "INVALID_CONTROL_COMPLETION",
  );
  const manifest = validateControlManifest(wrapper.manifest);
  const inspection = validateHostInspection(wrapper.inspection);
  const evidence = validateControlEvidence(wrapper.evidence);
  const completion = validateControlCompletion(wrapper.completion);
  const manifestBytes = immutableBytes(wrapper.manifestBytes);
  const hostInspectionBytes = immutableBytes(wrapper.hostInspectionBytes);
  const controlEvidenceBytes = immutableBytes(wrapper.controlEvidenceBytes);
  const parsedManifest = parseCanonicalControlManifestBytes(manifestBytes);
  const parsedEvidence =
    parseCanonicalControlEvidenceBytes(controlEvidenceBytes);
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
    completion.manifestSha256 !== digest(manifestBytes) ||
    completion.hostInspectionSha256 !== digest(hostInspectionBytes) ||
    completion.controlEvidenceSha256 !== digest(controlEvidenceBytes) ||
    new TextDecoder("utf-8", { fatal: true }).decode(hostInspectionBytes) !==
      `${JSON.stringify(inspection)}\n` ||
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
  const wrapper = readPlainRecord(input, "INVALID_CONTROL_COMPLETION");
  assertExactKeys(
    wrapper,
    [
      "manifest",
      "inspection",
      "evidence",
      "manifestBytes",
      "hostInspectionBytes",
      "controlEvidenceBytes",
    ],
    "INVALID_CONTROL_COMPLETION",
  );
  const manifest = validateControlManifest(wrapper.manifest);
  const inspection = validateHostInspection(wrapper.inspection);
  const evidence = validateControlEvidence(wrapper.evidence);
  const manifestBytes = immutableBytes(wrapper.manifestBytes);
  const hostInspectionBytes = immutableBytes(wrapper.hostInspectionBytes);
  const controlEvidenceBytes = immutableBytes(wrapper.controlEvidenceBytes);
  const inventory =
    manifest.profileId === "permissive"
      ? PERMISSIVE_INVENTORY
      : CONSTRAINED_INVENTORY;
  const completion = validateControlCompletion({
    schemaVersion: CONTROL_COMPLETION_SCHEMA_VERSION,
    runId: manifest.runId,
    controlId: manifest.controlId,
    profileId: manifest.profileId,
    containerImageDigest: manifest.containerImageDigest,
    hostInspectionComplete: true,
    controlEvidenceComplete: true,
    evidenceTransferred: true,
    manifestSha256: digest(manifestBytes),
    hostInspectionSha256: digest(hostInspectionBytes),
    controlEvidenceSha256: digest(controlEvidenceBytes),
    inventory,
    complete: true,
  });
  crossValidateCompleteBundle({
    manifest,
    inspection,
    evidence,
    completion,
    manifestBytes,
    hostInspectionBytes,
    controlEvidenceBytes,
  });
  return completion;
}
