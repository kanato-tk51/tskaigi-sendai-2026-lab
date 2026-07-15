import type { Stats } from "node:fs";
import { lstat, mkdir, readdir, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CACHE_RELATIVE_PATH,
  FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH,
  SCENARIO_CONFIG_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
  VITE_CONFIG_TEMP_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";

const FIXED_ADAPTER_ROOT = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const FIXED_REPOSITORY_ROOT = path.resolve(FIXED_ADAPTER_ROOT, "../..");
const FIXED_SCENARIO_CONFIG = path.join(
  FIXED_ADAPTER_ROOT,
  SCENARIO_CONFIG_RELATIVE_PATH,
);
const FIXED_NEAREST_NODE_MODULES = path.join(
  FIXED_ADAPTER_ROOT,
  FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH,
);
const FIXED_CONFIG_TEMP_BASENAME = path.basename(
  VITE_CONFIG_TEMP_RELATIVE_PATH,
);
const FIXED_TEST_ADAPTER_RELATIVE_PATH = "packages/vitest-setup-probe";

interface FileIdentity {
  readonly device: number;
  readonly inode: number;
}

export interface ConfigTemporaryBoundary {
  readonly configPath: string;
  readonly canonicalConfigPath: string;
  readonly workspaceRoot: string;
  readonly canonicalWorkspaceRoot: string;
  readonly nodeModulesRoot: string;
  readonly canonicalNodeModulesRoot: string;
  readonly configTempRoot: string;
  readonly nodeModulesIdentity: FileIdentity;
  readonly configIdentity: FileIdentity;
}

export interface ToolTemporaryBoundary {
  readonly runRoot: string;
  readonly canonicalRunRoot: string;
  readonly toolTempRoot: string;
  readonly cacheParentRoot: string;
  readonly cacheRoot: string;
  readonly runRootIdentity: FileIdentity;
  readonly toolTempIdentity: FileIdentity;
  readonly cacheParentIdentity: FileIdentity;
  readonly cacheIdentity: FileIdentity;
  readonly configTemporary: ConfigTemporaryBoundary;
}

export interface ToolTemporaryInventory {
  readonly toolEntryCount: number;
  readonly cacheEntryCount: number;
  readonly configTempExists: boolean;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null
    ? (error as NodeJS.ErrnoException).code
    : undefined;
}

function identity(metadata: Stats): FileIdentity {
  return Object.freeze({ device: metadata.dev, inode: metadata.ino });
}

function sameIdentity(actual: Stats, expected: FileIdentity): boolean {
  return actual.dev === expected.device && actual.ino === expected.inode;
}

function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

async function lstatRequired(targetPath: string): Promise<Stats> {
  try {
    return await lstat(targetPath);
  } catch {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

async function lstatOptional(targetPath: string): Promise<Stats | undefined> {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

async function canonicalRequired(targetPath: string): Promise<string> {
  try {
    return await realpath(targetPath);
  } catch {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

async function assertPlainDirectory(
  targetPath: string,
  expectedIdentity?: FileIdentity,
): Promise<{ readonly canonicalPath: string; readonly metadata: Stats }> {
  const metadata = await lstatRequired(targetPath);
  if (
    metadata.isSymbolicLink() ||
    !metadata.isDirectory() ||
    (expectedIdentity !== undefined &&
      !sameIdentity(metadata, expectedIdentity))
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  return Object.freeze({
    canonicalPath: await canonicalRequired(targetPath),
    metadata,
  });
}

async function resolveNearestConfigTemporaryBoundary(
  workspaceRoot: string,
  adapterRoot: string,
): Promise<ConfigTemporaryBoundary> {
  const lexicalWorkspaceRoot = path.resolve(workspaceRoot);
  const lexicalAdapterRoot = path.resolve(adapterRoot);
  const configPath = path.join(
    lexicalAdapterRoot,
    SCENARIO_CONFIG_RELATIVE_PATH,
  );
  const expectedNearestNodeModules = path.join(
    lexicalAdapterRoot,
    FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH,
  );
  const workspace = await assertPlainDirectory(lexicalWorkspaceRoot);
  const canonicalWorkspaceRoot = workspace.canonicalPath;
  const configMetadata = await lstatRequired(configPath);
  if (configMetadata.isSymbolicLink() || !configMetadata.isFile()) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const canonicalConfigPath = await canonicalRequired(configPath);
  if (
    path.basename(configPath) !== SCENARIO_CONFIG_RELATIVE_PATH ||
    !inside(canonicalWorkspaceRoot, canonicalConfigPath)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }

  let basedir = path.dirname(configPath);
  let nodeModulesRoot: string | undefined;
  let nodeModulesMetadata: Stats | undefined;
  while (true) {
    const candidate = path.join(basedir, "node_modules");
    const candidateMetadata = await lstatOptional(candidate);
    if (candidateMetadata !== undefined) {
      const canonicalCandidate = await canonicalRequired(candidate);
      const canonicalMetadata = await lstatRequired(canonicalCandidate);
      if (
        !canonicalMetadata.isDirectory() ||
        !inside(canonicalWorkspaceRoot, canonicalCandidate)
      ) {
        throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
      }
      nodeModulesRoot = candidate;
      nodeModulesMetadata = canonicalMetadata;
      break;
    }
    const parent = path.dirname(basedir);
    if (parent === basedir) {
      break;
    }
    basedir = parent;
  }

  if (
    nodeModulesRoot === undefined ||
    nodeModulesMetadata === undefined ||
    nodeModulesRoot !== expectedNearestNodeModules
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const canonicalNodeModulesRoot = await canonicalRequired(nodeModulesRoot);
  const configTempRoot = path.join(nodeModulesRoot, FIXED_CONFIG_TEMP_BASENAME);
  if (
    path.dirname(configTempRoot) !== nodeModulesRoot ||
    path.basename(configTempRoot) !== FIXED_CONFIG_TEMP_BASENAME ||
    !inside(canonicalWorkspaceRoot, canonicalNodeModulesRoot)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }

  return Object.freeze({
    configPath,
    canonicalConfigPath,
    workspaceRoot: lexicalWorkspaceRoot,
    canonicalWorkspaceRoot,
    nodeModulesRoot,
    canonicalNodeModulesRoot,
    configTempRoot,
    nodeModulesIdentity: identity(nodeModulesMetadata),
    configIdentity: identity(configMetadata),
  });
}

async function assertConfigTemporaryBoundaryIdentity(
  boundary: ConfigTemporaryBoundary,
): Promise<void> {
  const workspace = await assertPlainDirectory(boundary.workspaceRoot);
  const configMetadata = await lstatRequired(boundary.configPath);
  const canonicalConfigPath = await canonicalRequired(boundary.configPath);
  const canonicalNodeModulesRoot = await canonicalRequired(
    boundary.nodeModulesRoot,
  );
  const canonicalNodeModulesMetadata = await lstatRequired(
    canonicalNodeModulesRoot,
  );
  if (
    workspace.canonicalPath !== boundary.canonicalWorkspaceRoot ||
    canonicalConfigPath !== boundary.canonicalConfigPath ||
    !sameIdentity(configMetadata, boundary.configIdentity) ||
    canonicalNodeModulesRoot !== boundary.canonicalNodeModulesRoot ||
    !canonicalNodeModulesMetadata.isDirectory() ||
    !sameIdentity(canonicalNodeModulesMetadata, boundary.nodeModulesIdentity) ||
    path.dirname(boundary.configTempRoot) !== boundary.nodeModulesRoot ||
    !inside(boundary.canonicalWorkspaceRoot, canonicalNodeModulesRoot)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

async function configTemporaryExists(
  boundary: ConfigTemporaryBoundary,
): Promise<boolean> {
  await assertConfigTemporaryBoundaryIdentity(boundary);
  return (await lstatOptional(boundary.configTempRoot)) !== undefined;
}

export async function resolveFixedConfigTemporaryBoundary(): Promise<ConfigTemporaryBoundary> {
  const boundary = await resolveNearestConfigTemporaryBoundary(
    FIXED_REPOSITORY_ROOT,
    FIXED_ADAPTER_ROOT,
  );
  if (
    boundary.configPath !== FIXED_SCENARIO_CONFIG ||
    boundary.nodeModulesRoot !== FIXED_NEAREST_NODE_MODULES
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  return boundary;
}

async function countContainedEntries(
  root: string,
  expectedIdentity: FileIdentity,
  canonicalRunRoot: string,
): Promise<number> {
  const rootState = await assertPlainDirectory(root, expectedIdentity);
  if (!inside(canonicalRunRoot, rootState.canonicalPath)) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  let count = 0;
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (directory === undefined) {
      continue;
    }
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      const metadata = await lstatRequired(entryPath);
      if (
        metadata.isSymbolicLink() ||
        (!metadata.isDirectory() && !metadata.isFile())
      ) {
        throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
      }
      count += 1;
      if (metadata.isDirectory()) {
        pending.push(entryPath);
      }
    }
  }
  return count;
}

async function createToolTemporaryBoundary(
  runRoot: string,
  configTemporary: ConfigTemporaryBoundary,
): Promise<ToolTemporaryBoundary> {
  const lexicalRunRoot = path.resolve(runRoot);
  const run = await assertPlainDirectory(lexicalRunRoot);
  if (run.canonicalPath !== lexicalRunRoot) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  if (await configTemporaryExists(configTemporary)) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const toolTempRoot = path.join(lexicalRunRoot, TOOL_TEMP_RELATIVE_PATH);
  const cacheRoot = path.join(lexicalRunRoot, CACHE_RELATIVE_PATH);
  const cacheParentRoot = path.dirname(cacheRoot);
  try {
    await mkdir(toolTempRoot, { mode: 0o700 });
    await mkdir(cacheParentRoot, { mode: 0o700 });
    await mkdir(cacheRoot, { mode: 0o700 });
  } catch {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const [tool, cacheParent, cache] = await Promise.all([
    assertPlainDirectory(toolTempRoot),
    assertPlainDirectory(cacheParentRoot),
    assertPlainDirectory(cacheRoot),
  ]);
  if (
    !inside(run.canonicalPath, tool.canonicalPath) ||
    !inside(run.canonicalPath, cacheParent.canonicalPath) ||
    !inside(run.canonicalPath, cache.canonicalPath)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const boundary = Object.freeze({
    runRoot: lexicalRunRoot,
    canonicalRunRoot: run.canonicalPath,
    toolTempRoot,
    cacheParentRoot,
    cacheRoot,
    runRootIdentity: identity(run.metadata),
    toolTempIdentity: identity(tool.metadata),
    cacheParentIdentity: identity(cacheParent.metadata),
    cacheIdentity: identity(cache.metadata),
    configTemporary,
  });
  const inventory = await inspectToolTemporaryBoundary(boundary);
  if (
    inventory.toolEntryCount !== 0 ||
    inventory.cacheEntryCount !== 0 ||
    inventory.configTempExists
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  return boundary;
}

export async function initializeToolTemporaryBoundary(
  runRoot: string,
): Promise<ToolTemporaryBoundary> {
  return createToolTemporaryBoundary(
    runRoot,
    await resolveFixedConfigTemporaryBoundary(),
  );
}

async function assertToolTemporaryBoundaryIdentity(
  boundary: ToolTemporaryBoundary,
): Promise<void> {
  const [run, tool, cacheParent, cache] = await Promise.all([
    assertPlainDirectory(boundary.runRoot, boundary.runRootIdentity),
    assertPlainDirectory(boundary.toolTempRoot, boundary.toolTempIdentity),
    assertPlainDirectory(
      boundary.cacheParentRoot,
      boundary.cacheParentIdentity,
    ),
    assertPlainDirectory(boundary.cacheRoot, boundary.cacheIdentity),
  ]);
  if (
    run.canonicalPath !== boundary.canonicalRunRoot ||
    !inside(run.canonicalPath, tool.canonicalPath) ||
    !inside(run.canonicalPath, cacheParent.canonicalPath) ||
    !inside(run.canonicalPath, cache.canonicalPath)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

export async function inspectToolTemporaryBoundary(
  boundary: ToolTemporaryBoundary,
): Promise<ToolTemporaryInventory> {
  try {
    await assertToolTemporaryBoundaryIdentity(boundary);
    const [toolEntryCount, cacheEntryCount, configTempExists] =
      await Promise.all([
        countContainedEntries(
          boundary.toolTempRoot,
          boundary.toolTempIdentity,
          boundary.canonicalRunRoot,
        ),
        countContainedEntries(
          boundary.cacheRoot,
          boundary.cacheIdentity,
          boundary.canonicalRunRoot,
        ),
        configTemporaryExists(boundary.configTemporary),
      ]);
    return Object.freeze({
      toolEntryCount,
      cacheEntryCount,
      configTempExists,
    });
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

export function assertPostRunTemporaryInventory(
  inventory: ToolTemporaryInventory,
  requireEmptyToolRoot: boolean,
): void {
  if (
    inventory.configTempExists ||
    (requireEmptyToolRoot && inventory.toolEntryCount !== 0)
  ) {
    throw new AdapterError(
      inventory.configTempExists
        ? "M2C_TEMP_BOUNDARY_VIOLATION"
        : "M2C_TEMP_RESIDUE",
    );
  }
}

export async function cleanupToolTemporaryBoundary(
  boundary: ToolTemporaryBoundary,
): Promise<void> {
  try {
    await assertToolTemporaryBoundaryIdentity(boundary);
    if (await configTemporaryExists(boundary.configTemporary)) {
      throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
    }
    await Promise.all([
      rm(boundary.toolTempRoot, { recursive: true, force: true }),
      rm(boundary.cacheParentRoot, { recursive: true, force: true }),
    ]);
    if (
      (await lstatOptional(boundary.toolTempRoot)) !== undefined ||
      (await lstatOptional(boundary.cacheParentRoot)) !== undefined ||
      (await configTemporaryExists(boundary.configTemporary))
    ) {
      throw new AdapterError("M2C_TEMP_RESIDUE");
    }
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2C_CLEANUP_FAILED");
  }
}

async function resolveFixedFixtureBoundary(
  workspaceRoot: string,
): Promise<ConfigTemporaryBoundary> {
  return resolveNearestConfigTemporaryBoundary(
    workspaceRoot,
    path.join(workspaceRoot, FIXED_TEST_ADAPTER_RELATIVE_PATH),
  );
}

export const TOOL_TEMPORARY_TEST_ONLY = Object.freeze({
  resolveFixedFixtureBoundary,
  async initializeWithFixedFixture(
    runRoot: string,
    workspaceRoot: string,
  ): Promise<ToolTemporaryBoundary> {
    return createToolTemporaryBoundary(
      runRoot,
      await resolveFixedFixtureBoundary(workspaceRoot),
    );
  },
});
