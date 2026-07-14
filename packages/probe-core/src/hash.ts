import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";

import { ProbeError, normalizeProbeError } from "./errors.js";
import { resolveExistingBoundFile } from "./path-policy.js";
import { getPreparedProbeConfigurationSnapshot } from "./preparation.js";
import type { PreparedProbeConfiguration, Sha256Digest } from "./types.js";

async function hashRegularFile(
  canonicalPath: string,
  maximumBytes: number,
): Promise<{ readonly hash: Sha256Digest; readonly sizeBytes: number }> {
  let fileHandle;
  try {
    fileHandle = await open(
      canonicalPath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const fileStats = await fileHandle.stat();
    if (!fileStats.isFile()) {
      throw new ProbeError("FILE_NOT_REGULAR");
    }
    if (fileStats.size > maximumBytes) {
      throw new ProbeError("FILE_TOO_LARGE");
    }

    const hash = createHash("sha256");
    let sizeBytes = 0;
    const stream = fileHandle.createReadStream({ autoClose: false });
    for await (const chunk of stream) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      sizeBytes += buffer.byteLength;
      if (sizeBytes > maximumBytes) {
        stream.destroy();
        throw new ProbeError("FILE_TOO_LARGE");
      }
      hash.update(buffer);
    }
    return {
      hash: `sha256:${hash.digest("hex")}`,
      sizeBytes,
    };
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError(normalizeProbeError(error, "hash"));
  } finally {
    await fileHandle?.close().catch(() => undefined);
  }
}

export async function calculatePreparedFileSha256(
  configuration: PreparedProbeConfiguration,
  attemptId: string,
): Promise<{ readonly hash: Sha256Digest; readonly sizeBytes: number }> {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  const attempt = snapshot.manifest.attempts.find(
    (candidate) => candidate.attemptId === attemptId,
  );
  if (attempt?.type !== "file-hash") {
    throw new ProbeError("INVALID_TARGET");
  }
  const resolved = resolveExistingBoundFile(configuration, attempt.targetId);
  if (
    resolved.target.kind !== "file-hash" ||
    (resolved.target.classification !== "source" &&
      resolved.target.classification !== "artifact")
  ) {
    throw new ProbeError("INVALID_TARGET");
  }
  if (resolved.sizeBytes > resolved.target.maxBytes) {
    throw new ProbeError("FILE_TOO_LARGE");
  }
  return hashRegularFile(resolved.canonicalPath, resolved.target.maxBytes);
}
