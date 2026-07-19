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
const STAGING_ROOT = path.join(STAGING_PARENT, "vite");
const ADAPTER_ROOT = path.join(
  REPOSITORY_ROOT,
  "packages",
  "vite-plugin-probe",
);
const PROBE_CORE_ROOT = path.join(REPOSITORY_ROOT, "packages", "probe-core");
const NODE_MODULES_ROOT = path.join(REPOSITORY_ROOT, "node_modules");

const ADAPTER_SOURCE_FILES = Object.freeze([
  "config-contract.ts",
  "constants.ts",
  "coordinator-input.ts",
  "errors.ts",
  "plugin-entry.ts",
  "plugin-runtime.ts",
  "scenario-context.ts",
]);

const ADAPTER_RUNTIME_FILES = Object.freeze([
  "constants.js",
  "coordinator-input.js",
  "errors.js",
  "hash.js",
  "manifest.js",
  "plugin-entry.js",
  "plugin-runtime.js",
  "scenario-context.js",
  "transform-target.js",
  "version-contract.js",
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

const PACKAGE_RUNTIME_FILES = Object.freeze({
  vite: Object.freeze([
    "package.json",
    "bin/vite.js",
    "index.cjs",
    "misc/false.js",
    "misc/true.js",
    "dist/client/client.mjs",
    "dist/client/env.mjs",
    "dist/node-cjs/publicUtils.cjs",
    "dist/node/cli.js",
    "dist/node/constants.js",
    "dist/node/index.js",
    "dist/node/module-runner.js",
    "dist/node/chunks/dep-3RmXg9uo.js",
    "dist/node/chunks/dep-CV-fz3CQ.js",
    "dist/node/chunks/dep-CvfTChi5.js",
    "dist/node/chunks/dep-DDtvSN7_.js",
    "dist/node/chunks/dep-Dm0c1Wj2.js",
  ]),
  rollup: Object.freeze([
    "package.json",
    "dist/native.js",
    "dist/es/package.json",
    "dist/es/parseAst.js",
    "dist/es/rollup.js",
    "dist/es/shared/node-entry.js",
    "dist/es/shared/parseAst.js",
  ]),
  esbuild: Object.freeze(["package.json", "lib/main.js"]),
  fdir: Object.freeze(["package.json", "dist/index.mjs"]),
  picomatch: Object.freeze([
    "package.json",
    "index.js",
    "lib/constants.js",
    "lib/parse.js",
    "lib/picomatch.js",
    "lib/scan.js",
    "lib/utils.js",
  ]),
  tinyglobby: Object.freeze(["package.json", "dist/index.mjs"]),
  postcss: Object.freeze([
    "package.json",
    "lib/at-rule.js",
    "lib/comment.js",
    "lib/container.js",
    "lib/css-syntax-error.js",
    "lib/declaration.js",
    "lib/document.js",
    "lib/fromJSON.js",
    "lib/input.js",
    "lib/lazy-result.js",
    "lib/list.js",
    "lib/map-generator.js",
    "lib/no-work-result.js",
    "lib/node.js",
    "lib/parse.js",
    "lib/parser.js",
    "lib/postcss.js",
    "lib/postcss.mjs",
    "lib/previous-map.js",
    "lib/processor.js",
    "lib/result.js",
    "lib/root.js",
    "lib/rule.js",
    "lib/stringifier.js",
    "lib/stringify.js",
    "lib/symbols.js",
    "lib/terminal-highlight.js",
    "lib/tokenize.js",
    "lib/warn-once.js",
    "lib/warning.js",
  ]),
  nanoid: Object.freeze(["package.json", "non-secure/index.cjs"]),
  picocolors: Object.freeze(["package.json", "picocolors.js"]),
  "source-map-js": Object.freeze([
    "package.json",
    "source-map.js",
    "lib/array-set.js",
    "lib/base64-vlq.js",
    "lib/base64.js",
    "lib/binary-search.js",
    "lib/mapping-list.js",
    "lib/quick-sort.js",
    "lib/source-map-consumer.js",
    "lib/source-map-generator.js",
    "lib/source-node.js",
    "lib/util.js",
  ]),
  "@rollup/rollup-linux-x64-gnu": Object.freeze([
    "package.json",
    "rollup.linux-x64-gnu.node",
  ]),
  "@esbuild/linux-x64": Object.freeze(["package.json", "bin/esbuild"]),
});

/**
 * @typedef {Readonly<{
 *   sourcePath: string,
 *   targetPath: string,
 *   mode: 292 | 365,
 * }>} StagingEntry
 */

/**
 * @param {string} sourcePath
 * @param {string} targetPath
 * @param {292 | 365} [mode]
 * @returns {StagingEntry}
 */
function fixedEntry(sourcePath, targetPath, mode = 0o444) {
  return Object.freeze({ sourcePath, targetPath, mode });
}

/**
 * @param {string} packageName
 * @param {readonly string[]} relativePaths
 * @returns {readonly StagingEntry[]}
 */
function packageEntries(packageName, relativePaths) {
  return relativePaths.map((relativePath) =>
    fixedEntry(
      path.join(NODE_MODULES_ROOT, packageName, relativePath),
      path.join("node_modules", packageName, relativePath),
      packageName === "@esbuild/linux-x64" && relativePath === "bin/esbuild"
        ? 0o555
        : 0o444,
    ),
  );
}

export function createFixedViteStagingPlan() {
  const adapterTarget = path.join("packages", "vite-plugin-probe");
  const probeCoreTarget = path.join(
    "node_modules",
    "@tskaigi-lab",
    "probe-core",
  );
  const entries = [
    fixedEntry(
      path.join(RUNNER_ROOT, "vite-runner.js"),
      "presentation-runner.js",
    ),
    fixedEntry(
      path.join(RUNNER_ROOT, "vite-staging-package.json"),
      "package.json",
    ),
    fixedEntry(
      path.join(ADAPTER_ROOT, "package.json"),
      path.join(adapterTarget, "package.json"),
    ),
    fixedEntry(
      path.join(ADAPTER_ROOT, "vite.scenario.config.ts"),
      path.join(adapterTarget, "vite.scenario.config.ts"),
    ),
    fixedEntry(
      path.join(ADAPTER_ROOT, "fixture", "entry.ts"),
      path.join(adapterTarget, "fixture", "entry.ts"),
    ),
    fixedEntry(
      path.join(ADAPTER_ROOT, "fixture", "designated.ts"),
      path.join(adapterTarget, "fixture", "designated.ts"),
    ),
    ...ADAPTER_SOURCE_FILES.map((relativePath) =>
      fixedEntry(
        path.join(ADAPTER_ROOT, "src", relativePath),
        path.join(adapterTarget, "src", relativePath),
      ),
    ),
    ...ADAPTER_RUNTIME_FILES.map((relativePath) =>
      fixedEntry(
        path.join(ADAPTER_ROOT, "dist", relativePath),
        path.join(adapterTarget, "dist", relativePath),
      ),
    ),
    fixedEntry(
      path.join(PROBE_CORE_ROOT, "package.json"),
      path.join(probeCoreTarget, "package.json"),
    ),
    ...PROBE_CORE_RUNTIME_FILES.map((relativePath) =>
      fixedEntry(
        path.join(PROBE_CORE_ROOT, "dist", relativePath),
        path.join(probeCoreTarget, "dist", relativePath),
      ),
    ),
    ...Object.entries(PACKAGE_RUNTIME_FILES).flatMap(
      ([packageName, relativePaths]) =>
        packageEntries(packageName, relativePaths),
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
  await chmod(targetPath, entry.mode);
  const [sourceBytes, targetBytes] = await Promise.all([
    readFile(entry.sourcePath),
    readFile(targetPath),
  ]);
  if (!sourceBytes.equals(targetBytes)) {
    throw new Error("P2_STAGING_COPY_INVALID");
  }
}

export async function assembleFixedViteStaging() {
  const plan = createFixedViteStagingPlan();
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
    await assembleFixedViteStaging();
    process.stdout.write(
      `${JSON.stringify({
        status: "staged",
        adapter: "vite",
        files: createFixedViteStagingPlan().entries.length,
      })}\n`,
    );
  } catch {
    process.stderr.write('{"status":"failure","code":"P2_STAGING_FAILED"}\n');
    process.exitCode = 1;
  }
}
