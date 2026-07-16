import type { Stats } from "node:fs";
import { lstat, readdir, realpath, rm } from "node:fs/promises";
import path from "node:path";

import {
  CACHE_RELATIVE_PATH,
  CONFIG_RELATIVE_PATH,
  OUT_DIR_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import { FIXED_ADAPTER_ROOT, FIXED_REPOSITORY_ROOT } from "./paths.js";

interface FileIdentity {
  readonly device: number;
  readonly inode: number;
}

export interface ConfigTemporaryBoundary {
  readonly workspaceRoot: string;
  readonly canonicalWorkspaceRoot: string;
  readonly configPath: string;
  readonly canonicalConfigPath: string;
  readonly configIdentity: FileIdentity;
  readonly nodeModulesRoot: string;
  readonly canonicalNodeModulesRoot: string;
  readonly nodeModulesIdentity: FileIdentity;
  readonly configTempRoot: string;
}

export interface OwnedRunBoundary {
  readonly runRoot: string;
  readonly canonicalRunRoot: string;
  readonly runIdentity: FileIdentity;
  readonly toolTempRoot: string;
  readonly toolTempIdentity: FileIdentity;
  readonly cacheRoot: string;
  readonly cacheIdentity: FileIdentity;
  readonly outDir: string;
  readonly outDirIdentity: FileIdentity;
}

export interface TemporaryInventory {
  readonly toolTempEntries: number;
  readonly cacheEntries: number;
  readonly outDirEntries: number;
  readonly configTempExists: boolean;
}

function identity(metadata: Stats): FileIdentity {
  return Object.freeze({ device: metadata.dev, inode: metadata.ino });
}

function sameIdentity(metadata: Stats, expected: FileIdentity): boolean {
  return metadata.dev === expected.device && metadata.ino === expected.inode;
}

function inside(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function errorCode(error: unknown): string | undefined {
  return error !== null && typeof error === "object"
    ? (error as NodeJS.ErrnoException).code
    : undefined;
}

async function lstatOptional(targetPath: string): Promise<Stats | undefined> {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
}

async function plainDirectory(
  targetPath: string,
  expectedIdentity?: FileIdentity,
): Promise<{ readonly canonicalPath: string; readonly metadata: Stats }> {
  try {
    const metadata = await lstat(targetPath);
    if (
      metadata.isSymbolicLink() ||
      !metadata.isDirectory() ||
      (expectedIdentity !== undefined &&
        !sameIdentity(metadata, expectedIdentity))
    ) {
      throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
    }
    return Object.freeze({
      canonicalPath: await realpath(targetPath),
      metadata,
    });
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
}

export async function resolveNearestConfigTemporaryBoundary(
  workspaceRoot: string,
  configPath: string,
): Promise<ConfigTemporaryBoundary> {
  const lexicalWorkspaceRoot = path.resolve(workspaceRoot);
  const lexicalConfigPath = path.resolve(configPath);
  const workspace = await plainDirectory(lexicalWorkspaceRoot);
  let configMetadata: Stats;
  let canonicalConfigPath: string;
  try {
    configMetadata = await lstat(lexicalConfigPath);
    canonicalConfigPath = await realpath(lexicalConfigPath);
  } catch {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  if (
    configMetadata.isSymbolicLink() ||
    !configMetadata.isFile() ||
    !inside(workspace.canonicalPath, canonicalConfigPath)
  ) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }

  let current = path.dirname(lexicalConfigPath);
  let nodeModulesRoot: string | undefined;
  let nodeModulesState:
    { readonly canonicalPath: string; readonly metadata: Stats } | undefined;
  while (true) {
    const candidate = path.join(current, "node_modules");
    const candidateMetadata = await lstatOptional(candidate);
    if (candidateMetadata !== undefined) {
      nodeModulesState = await plainDirectory(candidate);
      nodeModulesRoot = candidate;
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  if (
    nodeModulesRoot === undefined ||
    nodeModulesState === undefined ||
    !inside(workspace.canonicalPath, nodeModulesState.canonicalPath)
  ) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  return Object.freeze({
    workspaceRoot: lexicalWorkspaceRoot,
    canonicalWorkspaceRoot: workspace.canonicalPath,
    configPath: lexicalConfigPath,
    canonicalConfigPath,
    configIdentity: identity(configMetadata),
    nodeModulesRoot,
    canonicalNodeModulesRoot: nodeModulesState.canonicalPath,
    nodeModulesIdentity: identity(nodeModulesState.metadata),
    configTempRoot: path.join(nodeModulesRoot, ".vite-temp"),
  });
}

export async function resolveFixedConfigTemporaryBoundary(): Promise<ConfigTemporaryBoundary> {
  return resolveNearestConfigTemporaryBoundary(
    FIXED_REPOSITORY_ROOT,
    path.join(FIXED_ADAPTER_ROOT, CONFIG_RELATIVE_PATH),
  );
}

async function assertConfigBoundaryIdentity(
  boundary: ConfigTemporaryBoundary,
): Promise<void> {
  const workspace = await plainDirectory(boundary.workspaceRoot);
  const nodeModules = await plainDirectory(
    boundary.nodeModulesRoot,
    boundary.nodeModulesIdentity,
  );
  let configMetadata: Stats;
  let canonicalConfigPath: string;
  try {
    configMetadata = await lstat(boundary.configPath);
    canonicalConfigPath = await realpath(boundary.configPath);
  } catch {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  if (
    workspace.canonicalPath !== boundary.canonicalWorkspaceRoot ||
    nodeModules.canonicalPath !== boundary.canonicalNodeModulesRoot ||
    configMetadata.isSymbolicLink() ||
    !configMetadata.isFile() ||
    !sameIdentity(configMetadata, boundary.configIdentity) ||
    canonicalConfigPath !== boundary.canonicalConfigPath ||
    path.dirname(boundary.configTempRoot) !== boundary.nodeModulesRoot
  ) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
}

export async function configTemporaryExists(
  boundary: ConfigTemporaryBoundary,
): Promise<boolean> {
  await assertConfigBoundaryIdentity(boundary);
  return (await lstatOptional(boundary.configTempRoot)) !== undefined;
}

export async function assertConfigTemporaryAbsent(
  boundary: ConfigTemporaryBoundary,
): Promise<void> {
  if (await configTemporaryExists(boundary)) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
}

export async function captureOwnedRunBoundary(
  runRoot: string,
): Promise<OwnedRunBoundary> {
  const run = await plainDirectory(runRoot);
  const toolTempRoot = path.join(runRoot, TOOL_TEMP_RELATIVE_PATH);
  const cacheRoot = path.join(runRoot, CACHE_RELATIVE_PATH);
  const outDir = path.join(runRoot, OUT_DIR_RELATIVE_PATH);
  const [toolTemp, cache, output] = await Promise.all([
    plainDirectory(toolTempRoot),
    plainDirectory(cacheRoot),
    plainDirectory(outDir),
  ]);
  if (
    !inside(run.canonicalPath, toolTemp.canonicalPath) ||
    !inside(run.canonicalPath, cache.canonicalPath) ||
    !inside(run.canonicalPath, output.canonicalPath)
  ) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  return Object.freeze({
    runRoot,
    canonicalRunRoot: run.canonicalPath,
    runIdentity: identity(run.metadata),
    toolTempRoot,
    toolTempIdentity: identity(toolTemp.metadata),
    cacheRoot,
    cacheIdentity: identity(cache.metadata),
    outDir,
    outDirIdentity: identity(output.metadata),
  });
}

async function countEntries(
  rootPath: string,
  expectedIdentity: FileIdentity,
  canonicalRunRoot: string,
): Promise<number> {
  const root = await plainDirectory(rootPath, expectedIdentity);
  if (!inside(canonicalRunRoot, root.canonicalPath)) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  let count = 0;
  const pending = [rootPath];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (directory === undefined) {
      continue;
    }
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
    }
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      const metadata = await lstatOptional(entryPath);
      if (
        metadata === undefined ||
        metadata.isSymbolicLink() ||
        (!metadata.isFile() && !metadata.isDirectory())
      ) {
        throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
      }
      count += 1;
      if (metadata.isDirectory()) {
        pending.push(entryPath);
      }
    }
  }
  return count;
}

export async function inspectTemporaryInventory(
  run: OwnedRunBoundary,
  config: ConfigTemporaryBoundary,
): Promise<TemporaryInventory> {
  const root = await plainDirectory(run.runRoot, run.runIdentity);
  if (root.canonicalPath !== run.canonicalRunRoot) {
    throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
  }
  const [toolTempEntries, cacheEntries, outDirEntries, configTempExists] =
    await Promise.all([
      countEntries(
        run.toolTempRoot,
        run.toolTempIdentity,
        run.canonicalRunRoot,
      ),
      countEntries(run.cacheRoot, run.cacheIdentity, run.canonicalRunRoot),
      countEntries(run.outDir, run.outDirIdentity, run.canonicalRunRoot),
      configTemporaryExists(config),
    ]);
  return Object.freeze({
    toolTempEntries,
    cacheEntries,
    outDirEntries,
    configTempExists,
  });
}

export async function cleanupOwnedRunBoundary(
  run: OwnedRunBoundary,
): Promise<void> {
  try {
    await inspectTemporaryInventory(
      run,
      await resolveFixedConfigTemporaryBoundary(),
    );
    await rm(run.runRoot, { recursive: true, force: false });
    if ((await lstatOptional(run.runRoot)) !== undefined) {
      throw new AdapterError("M2D_CLEANUP_FAILED");
    }
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2D_CLEANUP_FAILED");
  }
}
