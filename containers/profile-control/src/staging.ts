import { createHash } from "node:crypto";

import { FIXED_STAGING_FILES } from "./constants.js";
import { failProfile } from "./errors.js";
import { validateApprovedImageInput } from "./image-input.js";
import {
  assertExactKeys,
  copyBytes,
  readPlainArray,
  readPlainRecord,
  snapshotBytes,
} from "./safe-data.js";
import type {
  AcceptedImageStagingSnapshot,
  ApprovedImageInput,
  PreparedStagingInput,
  StagingFileCopy,
  StagingFileEvidence,
  StagingFilePath,
} from "./types.js";

const FILE_KEYS = Object.freeze(["logicalPath", "bytes"]);
const MAX_STAGING_FILE_BYTES = 1_048_576;
const MAX_STAGING_BYTES = 4_194_304;
const preparedBytes = new WeakMap<
  PreparedStagingInput,
  ReadonlyMap<StagingFilePath, Uint8Array>
>();
const acceptedBytes = new WeakMap<
  AcceptedImageStagingSnapshot,
  ReadonlyMap<StagingFilePath, Uint8Array>
>();

function digest(bytes: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function inventoryDigest(
  evidence: readonly StagingFileEvidence[],
): `sha256:${string}` {
  const aggregateBytes = new TextEncoder().encode(
    `${evidence
      .map(
        ({ logicalPath, byteLength, sha256 }) =>
          `${logicalPath}\0${byteLength}\0${sha256}`,
      )
      .join("\n")}\n`,
  );
  return digest(aggregateBytes);
}

function immutableBytes(input: unknown): Uint8Array {
  return snapshotBytes(input, {
    code: "INVALID_STAGING_INPUT",
    maximum: MAX_STAGING_FILE_BYTES,
    allowEmpty: false,
  });
}

export function prepareStagingInput(input: unknown): PreparedStagingInput {
  const entries = readPlainArray(input, "INVALID_STAGING_INPUT");
  if (entries.length !== FIXED_STAGING_FILES.length) {
    failProfile("INVALID_STAGING_INPUT");
  }
  let totalBytes = 0;
  const evidence: StagingFileEvidence[] = [];
  const bytesByPath = new Map<StagingFilePath, Uint8Array>();
  entries.forEach((entry, index) => {
    const value = readPlainRecord(entry, "INVALID_STAGING_INPUT");
    assertExactKeys(value, FILE_KEYS, "INVALID_STAGING_INPUT");
    const expectedPath = FIXED_STAGING_FILES[index];
    if (value.logicalPath !== expectedPath || expectedPath === undefined) {
      failProfile("INVALID_STAGING_INPUT");
    }
    const bytes = immutableBytes(value.bytes);
    totalBytes += bytes.byteLength;
    if (totalBytes > MAX_STAGING_BYTES) {
      failProfile("INVALID_STAGING_INPUT");
    }
    const fileEvidence = Object.freeze({
      logicalPath: expectedPath,
      byteLength: bytes.byteLength,
      sha256: digest(bytes),
    });
    evidence.push(fileEvidence);
    bytesByPath.set(expectedPath, bytes);
  });
  const prepared = Object.freeze({
    files: Object.freeze(evidence),
    stagingDigest: inventoryDigest(evidence),
  });
  preparedBytes.set(prepared, bytesByPath);
  return prepared;
}

export function crossValidateApprovedStaging(
  imageInput: ApprovedImageInput,
  prepared: PreparedStagingInput,
): void {
  const canonicalImageInput = validateApprovedImageInput(imageInput);
  if (
    preparedBytes.get(prepared) === undefined ||
    prepared.stagingDigest !== canonicalImageInput.stagingDigest ||
    prepared.files.length !== FIXED_STAGING_FILES.length ||
    prepared.files.some(
      (entry, index) =>
        entry.logicalPath !== FIXED_STAGING_FILES[index] ||
        canonicalImageInput.stagingFiles[index] !== FIXED_STAGING_FILES[index],
    )
  ) {
    failProfile("INVALID_STAGING_INPUT");
  }
}

export function copyPreparedStagingFile(
  prepared: PreparedStagingInput,
  logicalPath: StagingFilePath,
): Uint8Array {
  const bytes = preparedBytes.get(prepared)?.get(logicalPath);
  if (bytes === undefined) {
    return failProfile("INVALID_STAGING_INPUT");
  }
  return copyBytes(bytes);
}

export function createAcceptedImageStagingSnapshot(input: {
  readonly imageInput: ApprovedImageInput;
  readonly preparedStaging: PreparedStagingInput;
}): AcceptedImageStagingSnapshot {
  const wrapper = readPlainRecord(input, "INVALID_STAGING_INPUT");
  assertExactKeys(
    wrapper,
    ["imageInput", "preparedStaging"],
    "INVALID_STAGING_INPUT",
  );
  const imageInput = validateApprovedImageInput(wrapper.imageInput);
  const preparedStaging = wrapper.preparedStaging as PreparedStagingInput;
  crossValidateApprovedStaging(imageInput, preparedStaging);
  const bytesByPath = new Map<StagingFilePath, Uint8Array>();
  const stagingInventory = preparedStaging.files.map((entry, index) => {
    const logicalPath = FIXED_STAGING_FILES[index];
    if (
      logicalPath === undefined ||
      entry.logicalPath !== logicalPath ||
      entry.byteLength <= 0 ||
      !Number.isSafeInteger(entry.byteLength) ||
      !/^sha256:[a-f0-9]{64}$/u.test(entry.sha256)
    ) {
      return failProfile("INVALID_STAGING_INPUT");
    }
    const bytes = copyPreparedStagingFile(preparedStaging, logicalPath);
    if (
      bytes.byteLength !== entry.byteLength ||
      digest(bytes) !== entry.sha256
    ) {
      return failProfile("INVALID_STAGING_INPUT");
    }
    bytesByPath.set(logicalPath, bytes);
    return Object.freeze({ ...entry });
  });
  const snapshot = Object.freeze({
    schemaVersion: imageInput.schemaVersion,
    baseImageName: imageInput.baseImageName,
    baseImageDigest: imageInput.baseImageDigest,
    nodeVersion: imageInput.nodeVersion,
    baseEnvironmentKeys: Object.freeze([...imageInput.baseEnvironmentKeys]),
    stagingInventory: Object.freeze(stagingInventory),
    stagingDigest: preparedStaging.stagingDigest,
  }) as unknown as AcceptedImageStagingSnapshot;
  acceptedBytes.set(snapshot, bytesByPath);
  return snapshot;
}

export function assertAcceptedImageStagingSnapshot(
  input: AcceptedImageStagingSnapshot,
): AcceptedImageStagingSnapshot {
  if (acceptedBytes.get(input) === undefined) {
    return failProfile("INVALID_STAGING_INPUT");
  }
  return input;
}

export function copyAcceptedStagingFiles(
  snapshot: AcceptedImageStagingSnapshot,
): readonly StagingFileCopy[] {
  const bytesByPath = acceptedBytes.get(snapshot);
  if (bytesByPath === undefined) {
    return failProfile("INVALID_STAGING_INPUT");
  }
  return Object.freeze(
    FIXED_STAGING_FILES.map((logicalPath) => {
      const bytes = bytesByPath.get(logicalPath);
      if (bytes === undefined) return failProfile("INVALID_STAGING_INPUT");
      return Object.freeze({ logicalPath, bytes: copyBytes(bytes) });
    }),
  );
}

export function verifyAcceptedStagingFiles(
  snapshot: AcceptedImageStagingSnapshot,
  input: unknown,
): void {
  const bytesByPath = acceptedBytes.get(snapshot);
  if (bytesByPath === undefined) {
    failProfile("INVALID_STAGING_INPUT");
  }
  const entries = readPlainArray(input, "INVALID_STAGING_INPUT");
  if (entries.length !== FIXED_STAGING_FILES.length) {
    failProfile("INVALID_STAGING_INPUT");
  }
  const stagedEvidence: StagingFileEvidence[] = [];
  entries.forEach((entry, index) => {
    const value = readPlainRecord(entry, "INVALID_STAGING_INPUT");
    assertExactKeys(value, FILE_KEYS, "INVALID_STAGING_INPUT");
    const logicalPath = FIXED_STAGING_FILES[index];
    if (logicalPath === undefined || value.logicalPath !== logicalPath) {
      failProfile("INVALID_STAGING_INPUT");
    }
    const stagedBytes = immutableBytes(value.bytes);
    const expectedBytes = bytesByPath.get(logicalPath);
    if (
      expectedBytes === undefined ||
      stagedBytes.byteLength !== expectedBytes.byteLength ||
      stagedBytes.some((byte, byteIndex) => byte !== expectedBytes[byteIndex])
    ) {
      failProfile("INVALID_STAGING_INPUT");
    }
    stagedEvidence.push(
      Object.freeze({
        logicalPath,
        byteLength: stagedBytes.byteLength,
        sha256: digest(stagedBytes),
      }),
    );
  });
  if (inventoryDigest(stagedEvidence) !== snapshot.stagingDigest) {
    failProfile("INVALID_STAGING_INPUT");
  }
}
