import { constants } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

const REPOSITORY_ROOT = path.resolve(
  fileURLToPath(new URL("../../..", import.meta.url)),
);
const RUNNER_ROOT = path.join(
  REPOSITORY_ROOT,
  "containers",
  "presentation-profiles",
  "runner",
);
const STAGING_PARENT = path.join(
  REPOSITORY_ROOT,
  "containers",
  "presentation-profiles",
  "staging",
);
const STAGING_ROOT = path.join(STAGING_PARENT, "codegen");
const CODEGEN_ROOT = path.join(REPOSITORY_ROOT, "packages", "codegen-probe");
const PROBE_CORE_ROOT = path.join(REPOSITORY_ROOT, "packages", "probe-core");

const CODEGEN_RUNTIME_FILES = Object.freeze([
  "cli-runtime.js",
  "cli.js",
  "constants.js",
  "coordinator-input.js",
  "errors.js",
  "generator.js",
  "hash.js",
  "manifest.js",
  "scenario-context.js",
]);

const PROBE_CORE_RUNTIME_FILES = Object.freeze([
  "attempts/child.js",
  "attempts/environment.js",
  "attempts/file.js",
  "attempts/network.js",
  "constants.js",
  "errors.js",
  "event.js",
  "file-preflight.js",
  "fixed-child.js",
  "hash.js",
  "index.js",
  "path-policy.js",
  "preparation.js",
  "safe-data.js",
  "session.js",
  "sink.js",
  "validation.js",
]);

/** @typedef {Readonly<{sourcePath: string, targetPath: string}>} StagingEntry */

/**
 * @param {string} sourcePath
 * @param {string} targetPath
 * @returns {StagingEntry}
 */
function fixedEntry(sourcePath, targetPath) {
  return Object.freeze({ sourcePath, targetPath });
}

export function createFixedCodegenStagingPlan() {
  const entries = [
    fixedEntry(
      path.join(RUNNER_ROOT, "codegen-runner.js"),
      "presentation-runner.js",
    ),
    fixedEntry(
      path.join(RUNNER_ROOT, "codegen-staging-package.json"),
      "package.json",
    ),
    fixedEntry(
      path.join(RUNNER_ROOT, "codegen-input-snapshot.txt"),
      "input-snapshot.txt",
    ),
    ...CODEGEN_RUNTIME_FILES.map((relativePath) =>
      fixedEntry(
        path.join(CODEGEN_ROOT, "dist", relativePath),
        path.join("codegen", "dist", relativePath),
      ),
    ),
    fixedEntry(
      path.join(PROBE_CORE_ROOT, "package.json"),
      path.join(
        "codegen",
        "node_modules",
        "@tskaigi-lab",
        "probe-core",
        "package.json",
      ),
    ),
    ...PROBE_CORE_RUNTIME_FILES.map((relativePath) =>
      fixedEntry(
        path.join(PROBE_CORE_ROOT, "dist", relativePath),
        path.join(
          "codegen",
          "node_modules",
          "@tskaigi-lab",
          "probe-core",
          "dist",
          relativePath,
        ),
      ),
    ),
  ];
  return Object.freeze({
    stagingRoot: STAGING_ROOT,
    entries: Object.freeze(entries),
  });
}

/** @param {string} filePath */
async function requireAbsent(filePath) {
  try {
    await lstat(filePath);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
  throw new Error("P2_STAGING_EXISTS");
}

/**
 * @param {string} stagingRoot
 * @param {StagingEntry} entry
 */
async function copyFixedEntry(stagingRoot, entry) {
  const source = await lstat(entry.sourcePath);
  if (!source.isFile() || source.isSymbolicLink()) {
    throw new Error("P2_STAGING_SOURCE_INVALID");
  }
  const targetPath = path.resolve(stagingRoot, entry.targetPath);
  const relativeTarget = path.relative(stagingRoot, targetPath);
  if (
    relativeTarget === "" ||
    relativeTarget === ".." ||
    relativeTarget.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeTarget)
  ) {
    throw new Error("P2_STAGING_TARGET_INVALID");
  }
  await mkdir(path.dirname(targetPath), { recursive: true, mode: 0o755 });
  await copyFile(entry.sourcePath, targetPath, constants.COPYFILE_EXCL);
  await chmod(targetPath, 0o444);
  const [sourceBytes, targetBytes] = await Promise.all([
    readFile(entry.sourcePath),
    readFile(targetPath),
  ]);
  if (!sourceBytes.equals(targetBytes)) {
    throw new Error("P2_STAGING_COPY_INVALID");
  }
}

export async function assembleFixedCodegenStaging() {
  const plan = createFixedCodegenStagingPlan();
  await requireAbsent(plan.stagingRoot);
  await mkdir(STAGING_PARENT, { recursive: true, mode: 0o755 });
  await mkdir(plan.stagingRoot, { mode: 0o755 });
  for (const entry of plan.entries) {
    await copyFixedEntry(plan.stagingRoot, entry);
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    if (process.argv.length !== 2) {
      throw new Error("P2_STAGING_ARGUMENTS_INVALID");
    }
    await assembleFixedCodegenStaging();
    process.stdout.write(
      `${JSON.stringify({
        status: "staged",
        adapter: "codegen",
        files: createFixedCodegenStagingPlan().entries.length,
      })}\n`,
    );
  } catch {
    process.stderr.write('{"status":"failure","code":"P2_STAGING_FAILED"}\n');
    process.exitCode = 1;
  }
}
