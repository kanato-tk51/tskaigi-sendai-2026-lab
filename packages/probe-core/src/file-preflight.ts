import { lstat, realpath, stat } from "node:fs/promises";
import path from "node:path";

import {
  ProbeError,
  normalizeProbeError,
  type ProbeOperation,
} from "./errors.js";
import type {
  FileHashTarget,
  FileReadTarget,
  FileWriteTarget,
  PathRuntimeBinding,
  ProbeManifest,
  ProbeRuntimeBindings,
} from "./types.js";

interface PreparedFileTargetBase {
  readonly targetId: string;
  readonly canonicalRootPath: string;
  readonly canonicalPath: string;
}

export interface PreparedExistingFileTarget extends PreparedFileTargetBase {
  readonly kind: "existing";
  readonly target: FileReadTarget | FileHashTarget;
  readonly deviceId: bigint;
  readonly inodeId: bigint;
  readonly sizeBytes: number;
}

export interface PreparedOutputFileTarget extends PreparedFileTargetBase {
  readonly kind: "output";
  readonly target: FileWriteTarget;
}

export type PreparedFileTarget =
  PreparedExistingFileTarget | PreparedOutputFileTarget;

function isWithin(rootPath: string, candidatePath: string): boolean {
  const relative = path.relative(rootPath, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function lexicalCandidate(binding: PathRuntimeBinding): string {
  const rootPath = path.resolve(binding.rootPath);
  const candidatePath = path.resolve(rootPath, binding.relativePath);
  if (!isWithin(rootPath, candidatePath)) {
    throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
  }
  return candidatePath;
}

async function canonicalizeRoot(
  binding: PathRuntimeBinding,
  operation: ProbeOperation,
): Promise<string> {
  try {
    const canonicalRootPath = await realpath(binding.rootPath);
    const rootStats = await stat(canonicalRootPath);
    if (!rootStats.isDirectory()) {
      throw new ProbeError("INVALID_TARGET");
    }
    return canonicalRootPath;
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError(normalizeProbeError(error, operation));
  }
}

function safeSize(size: bigint): number {
  return size <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(size)
    : Number.MAX_SAFE_INTEGER;
}

function identityKey(deviceId: bigint, inodeId: bigint): string {
  return `${deviceId}:${inodeId}`;
}

async function prepareExistingTarget(
  target: FileReadTarget | FileHashTarget,
  binding: PathRuntimeBinding,
): Promise<PreparedExistingFileTarget> {
  const operation: "read" | "hash" =
    target.kind === "file-read" ? "read" : "hash";
  const canonicalRootPath = await canonicalizeRoot(binding, operation);
  const candidatePath = lexicalCandidate(binding);
  let canonicalPath: string;
  try {
    canonicalPath = await realpath(candidatePath);
  } catch (error) {
    throw new ProbeError(normalizeProbeError(error, operation));
  }
  if (!isWithin(canonicalRootPath, canonicalPath)) {
    throw new ProbeError("SYMLINK_ESCAPE");
  }

  try {
    const fileStats = await stat(canonicalPath, { bigint: true });
    if (!fileStats.isFile()) {
      throw new ProbeError("FILE_NOT_REGULAR");
    }
    return Object.freeze({
      kind: "existing",
      targetId: target.targetId,
      target,
      canonicalRootPath,
      canonicalPath,
      deviceId: fileStats.dev,
      inodeId: fileStats.ino,
      sizeBytes: safeSize(fileStats.size),
    });
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError(normalizeProbeError(error, operation));
  }
}

async function prepareOutputTarget(
  target: FileWriteTarget,
  binding: PathRuntimeBinding,
  existingTargets: readonly PreparedExistingFileTarget[],
): Promise<PreparedOutputFileTarget> {
  const canonicalRootPath = await canonicalizeRoot(binding, "write");
  const candidatePath = lexicalCandidate(binding);
  let existingStats: Awaited<ReturnType<typeof lstat>> | undefined;
  try {
    existingStats = await lstat(candidatePath);
    if (existingStats.isSymbolicLink()) {
      throw new ProbeError("SYMLINK_ESCAPE");
    }
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    const code = normalizeProbeError(error, "write");
    if (code !== "FILE_NOT_FOUND") {
      throw new ProbeError(code);
    }
  }

  let canonicalParentPath: string;
  try {
    canonicalParentPath = await realpath(path.dirname(candidatePath));
  } catch (error) {
    throw new ProbeError(normalizeProbeError(error, "write"));
  }
  if (!isWithin(canonicalRootPath, canonicalParentPath)) {
    throw new ProbeError("SYMLINK_ESCAPE");
  }

  const canonicalPath = path.join(
    canonicalParentPath,
    path.basename(candidatePath),
  );
  if (!isWithin(canonicalRootPath, canonicalPath)) {
    throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
  }
  if (
    existingTargets.some(
      (existingTarget) => existingTarget.canonicalPath === canonicalPath,
    )
  ) {
    throw new ProbeError("FILE_TARGET_OUTPUT_ALIAS");
  }

  if (existingStats !== undefined) {
    try {
      const existingIdentity = await stat(candidatePath, { bigint: true });
      const existingKey = identityKey(
        existingIdentity.dev,
        existingIdentity.ino,
      );
      if (
        existingTargets.some(
          (existingTarget) =>
            identityKey(existingTarget.deviceId, existingTarget.inodeId) ===
            existingKey,
        )
      ) {
        throw new ProbeError("FILE_TARGET_IDENTITY_ALIAS");
      }
    } catch (error) {
      if (error instanceof ProbeError) {
        throw error;
      }
      throw new ProbeError(normalizeProbeError(error, "write"));
    }
    throw new ProbeError("FILE_ALREADY_EXISTS");
  }

  return Object.freeze({
    kind: "output",
    targetId: target.targetId,
    target,
    canonicalRootPath,
    canonicalPath,
  });
}

export async function prepareFileTargets(
  manifest: ProbeManifest,
  runtimeBindings: ProbeRuntimeBindings,
): Promise<readonly PreparedFileTarget[]> {
  const bindings = new Map(
    runtimeBindings.bindings.map(
      (binding) => [binding.targetId, binding] as const,
    ),
  );
  const existingTargets: PreparedExistingFileTarget[] = [];
  const outputTargets: PreparedOutputFileTarget[] = [];
  const canonicalPaths = new Set<string>();
  const identities = new Set<string>();

  for (const target of manifest.targets) {
    if (target.kind !== "file-read" && target.kind !== "file-hash") {
      continue;
    }
    const binding = bindings.get(target.targetId);
    if (binding?.kind !== "path") {
      throw new ProbeError("INVALID_TARGET");
    }
    const prepared = await prepareExistingTarget(target, binding);
    if (canonicalPaths.has(prepared.canonicalPath)) {
      throw new ProbeError("FILE_TARGET_CANONICAL_ALIAS");
    }
    const identity = identityKey(prepared.deviceId, prepared.inodeId);
    if (identities.has(identity)) {
      throw new ProbeError("FILE_TARGET_IDENTITY_ALIAS");
    }
    canonicalPaths.add(prepared.canonicalPath);
    identities.add(identity);
    existingTargets.push(prepared);
  }

  const plannedOutputPaths = new Set<string>();
  for (const target of manifest.targets) {
    if (target.kind !== "file-write") {
      continue;
    }
    const binding = bindings.get(target.targetId);
    if (binding?.kind !== "path") {
      throw new ProbeError("INVALID_TARGET");
    }
    const prepared = await prepareOutputTarget(
      target,
      binding,
      existingTargets,
    );
    if (plannedOutputPaths.has(prepared.canonicalPath)) {
      throw new ProbeError("FILE_TARGET_OUTPUT_ALIAS");
    }
    plannedOutputPaths.add(prepared.canonicalPath);
    outputTargets.push(prepared);
  }

  return Object.freeze([...existingTargets, ...outputTargets]);
}
