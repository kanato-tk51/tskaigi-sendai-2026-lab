import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";

import { PROBE_MARKER_SCHEMA_VERSION } from "../constants.js";
import { ProbeError, normalizeProbeError } from "../errors.js";
import { calculatePreparedFileSha256 } from "../hash.js";
import {
  getBoundPath,
  openBoundFileForWrite,
  prepareBoundWritePath,
  resolveExistingBoundFile,
} from "../path-policy.js";
import type {
  FileHashAttempt,
  FileWriteTarget,
  PreparedProbeConfiguration,
  Sha256Digest,
} from "../types.js";
import { getPreparedProbeConfigurationSnapshot } from "../preparation.js";
import type { AttemptExecutionResult } from "./types.js";

interface FileWriteHandle {
  write(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<{ readonly bytesWritten: number }>;
  stat(): Promise<{ readonly size: number; isFile(): boolean }>;
  sync(): Promise<void>;
}

export async function writeFixedMarkerToHandle(
  fileHandle: FileWriteHandle,
  marker: Buffer,
): Promise<Sha256Digest> {
  let offset = 0;
  while (offset < marker.byteLength) {
    const result = await fileHandle.write(
      marker,
      offset,
      marker.byteLength - offset,
      offset,
    );
    if (
      !Number.isInteger(result.bytesWritten) ||
      result.bytesWritten <= 0 ||
      result.bytesWritten > marker.byteLength - offset
    ) {
      throw new ProbeError("WRITE_DENIED");
    }
    offset += result.bytesWritten;
  }
  await fileHandle.sync();
  const stats = await fileHandle.stat();
  if (!stats.isFile()) {
    throw new ProbeError("FILE_NOT_REGULAR");
  }
  if (stats.size !== marker.byteLength) {
    throw new ProbeError("WRITE_DENIED");
  }
  return `sha256:${createHash("sha256").update(marker).digest("hex")}`;
}

export async function executeFileReadAttempt(
  configuration: PreparedProbeConfiguration,
  targetId: string,
): Promise<AttemptExecutionResult> {
  let present = false;
  let regularFile = false;
  let sizeBytes: number | null = null;
  let fileHandle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    const boundPath = getBoundPath(configuration, targetId);
    if (
      boundPath.target.kind !== "file-read" ||
      boundPath.target.classification !== "canary"
    ) {
      throw new ProbeError("INVALID_TARGET");
    }
    const resolved = resolveExistingBoundFile(configuration, targetId);
    present = true;
    regularFile = true;
    sizeBytes = resolved.sizeBytes;
    if (sizeBytes > boundPath.target.maxBytes) {
      throw new ProbeError("FILE_TOO_LARGE");
    }

    fileHandle = await open(
      resolved.canonicalPath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    let bytesRead = 0;
    const stream = fileHandle.createReadStream({ autoClose: false });
    for await (const chunk of stream) {
      const length = Buffer.isBuffer(chunk)
        ? chunk.byteLength
        : Buffer.byteLength(chunk);
      bytesRead += length;
      if (bytesRead > boundPath.target.maxBytes) {
        stream.destroy();
        throw new ProbeError("FILE_TOO_LARGE");
      }
    }
    if (bytesRead !== sizeBytes) {
      throw new ProbeError("INTERNAL_ERROR");
    }
    return {
      outcome: "success",
      normalizedErrorCode: null,
      beforeHash: null,
      afterHash: null,
      details: {
        kind: "file-read",
        present: true,
        regularFile: true,
        readSucceeded: true,
        sizeBytes,
      },
    };
  } catch (error) {
    const normalizedErrorCode = normalizeProbeError(error, "read");
    return {
      outcome: "failure",
      normalizedErrorCode,
      beforeHash: null,
      afterHash: null,
      details: {
        kind: "file-read",
        present: normalizedErrorCode === "FILE_NOT_REGULAR" ? true : present,
        regularFile:
          normalizedErrorCode === "FILE_NOT_REGULAR" ? false : regularFile,
        readSucceeded: false,
        sizeBytes,
      },
    };
  } finally {
    await fileHandle?.close().catch(() => undefined);
  }
}

function fixedMarker(
  configuration: PreparedProbeConfiguration,
  attemptId: string,
): Buffer {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  return Buffer.from(
    `${JSON.stringify({
      schemaVersion: PROBE_MARKER_SCHEMA_VERSION,
      attemptId,
      runId: snapshot.manifest.runId,
      scenarioId: snapshot.manifest.scenarioId,
    })}\n`,
    "utf8",
  );
}

export async function executeFileWriteAttempt(
  configuration: PreparedProbeConfiguration,
  attemptId: string,
  target: FileWriteTarget,
): Promise<AttemptExecutionResult> {
  try {
    if (target.classification !== "output") {
      throw new ProbeError("INVALID_TARGET");
    }
    const marker = fixedMarker(configuration, attemptId);
    if (marker.byteLength > target.maxBytes) {
      throw new ProbeError("FILE_TOO_LARGE");
    }
    const destination = await prepareBoundWritePath(
      configuration,
      target.targetId,
    );
    const fileHandle = await openBoundFileForWrite(destination.canonicalPath);
    let afterHash: Sha256Digest;
    try {
      afterHash = await writeFixedMarkerToHandle(fileHandle, marker);
    } finally {
      await fileHandle.close();
    }
    return {
      outcome: "success",
      normalizedErrorCode: null,
      beforeHash: null,
      afterHash,
      details: {
        kind: "file-write",
        markerSchemaVersion: PROBE_MARKER_SCHEMA_VERSION,
      },
    };
  } catch (error) {
    return {
      outcome: "failure",
      normalizedErrorCode: normalizeProbeError(error, "write"),
      beforeHash: null,
      afterHash: null,
      details: {
        kind: "file-write",
        markerSchemaVersion: PROBE_MARKER_SCHEMA_VERSION,
      },
    };
  }
}

export async function executeFileHashAttempt(
  configuration: PreparedProbeConfiguration,
  attempt: FileHashAttempt,
): Promise<AttemptExecutionResult> {
  try {
    const result = await calculatePreparedFileSha256(
      configuration,
      attempt.attemptId,
    );
    return {
      outcome: "success",
      normalizedErrorCode: null,
      beforeHash: attempt.hashPosition === "before" ? result.hash : null,
      afterHash: attempt.hashPosition === "after" ? result.hash : null,
      details: {
        kind: "file-hash",
        state: "present",
        sizeBytes: result.sizeBytes,
      },
    };
  } catch (error) {
    const normalizedErrorCode = normalizeProbeError(error, "hash");
    return {
      outcome: "failure",
      normalizedErrorCode,
      beforeHash: null,
      afterHash: null,
      details: {
        kind: "file-hash",
        state:
          normalizedErrorCode === "FILE_NOT_FOUND" ? "missing" : "unavailable",
        sizeBytes: null,
      },
    };
  }
}
