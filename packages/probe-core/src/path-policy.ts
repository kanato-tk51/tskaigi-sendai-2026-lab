import { constants } from "node:fs";
import { open } from "node:fs/promises";

import { ProbeError, normalizeProbeError } from "./errors.js";
import type {
  PreparedExistingFileTarget,
  PreparedOutputFileTarget,
} from "./file-preflight.js";
import { getPreparedProbeConfigurationSnapshot } from "./preparation.js";
import type {
  PathRuntimeBinding,
  PreparedProbeConfiguration,
  ProbeTarget,
} from "./types.js";

export interface BoundPath {
  readonly binding: PathRuntimeBinding;
  readonly target: ProbeTarget;
}

export function getBoundPath(
  configuration: PreparedProbeConfiguration,
  targetId: string,
): BoundPath {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  const target = snapshot.manifest.targets.find(
    (candidate) => candidate.targetId === targetId,
  );
  const binding = snapshot.runtimeBindings.bindings.find(
    (candidate) => candidate.targetId === targetId,
  );
  if (target === undefined || binding?.kind !== "path") {
    throw new ProbeError("INVALID_TARGET");
  }
  return { target, binding };
}

export function resolveExistingBoundFile(
  configuration: PreparedProbeConfiguration,
  targetId: string,
): PreparedExistingFileTarget {
  const target = getPreparedProbeConfigurationSnapshot(
    configuration,
  ).fileTargets.find((candidate) => candidate.targetId === targetId);
  if (target?.kind !== "existing") {
    throw new ProbeError("INVALID_TARGET");
  }
  return target;
}

export function prepareBoundWritePath(
  configuration: PreparedProbeConfiguration,
  targetId: string,
): PreparedOutputFileTarget {
  const target = getPreparedProbeConfigurationSnapshot(
    configuration,
  ).fileTargets.find((candidate) => candidate.targetId === targetId);
  if (target?.kind !== "output") {
    throw new ProbeError("INVALID_TARGET");
  }
  return target;
}

export async function openBoundFileForWrite(
  canonicalPath: string,
): Promise<Awaited<ReturnType<typeof open>>> {
  try {
    return await open(
      canonicalPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    throw new ProbeError(normalizeProbeError(error, "write"));
  }
}
