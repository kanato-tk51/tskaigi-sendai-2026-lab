import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const adapterRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(adapterRoot, "../..");

function fail(message) {
  throw new Error(`M2-D static verification failed: ${message}`);
}

function exactArray(actual, expected, label) {
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    fail(label);
  }
}

async function text(relativePath) {
  return readFile(path.join(adapterRoot, relativePath), "utf8");
}

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

if (process.argv.length !== 2) {
  fail("arguments are not accepted");
}

const [
  packageSource,
  rootPackageSource,
  lockSource,
  constantsSource,
  indexSource,
  pluginSource,
  runtimeSource,
  processSource,
  configSource,
  configContractSource,
  coordinatorInputSource,
  manifestSource,
  evidenceSource,
  temporarySource,
  scenarioSource,
  localRunnerSource,
  inputContractSource,
  entrySource,
  designatedSource,
  matrixSource,
  probeCoreIndexSource,
] = await Promise.all([
  text("package.json"),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readFile(path.join(repositoryRoot, "package-lock.json"), "utf8"),
  text("src/constants.ts"),
  text("src/index.ts"),
  text("src/plugin-entry.ts"),
  text("src/plugin-runtime.ts"),
  text("src/process-lifecycle.ts"),
  text("vite.scenario.config.ts"),
  text("src/config-contract.ts"),
  text("src/coordinator-input.ts"),
  text("src/manifest.ts"),
  text("src/evidence.ts"),
  text("src/tool-temporary.ts"),
  text("src/scenario.ts"),
  text("src/local-runner.ts"),
  text("src/input-contract.ts"),
  text("fixture/entry.ts"),
  text("fixture/designated.ts"),
  readFile(path.join(repositoryRoot, "docs/experiment-matrix.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "packages/probe-core/src/index.ts"),
    "utf8",
  ),
]);

const packageJson = JSON.parse(packageSource);
const rootPackage = JSON.parse(rootPackageSource);
const lock = JSON.parse(lockSource);
if (
  packageJson.name !== "@tskaigi-lab/adapter-vite-plugin" ||
  packageJson.version !== "0.0.0" ||
  packageJson.private !== true ||
  packageJson.type !== "module" ||
  packageJson.dependencies?.vite !== "6.4.3" ||
  packageJson.dependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
  Object.keys(packageJson.dependencies).length !== 2 ||
  packageJson.engines?.node !== "20.18.2" ||
  packageJson.engines?.npm !== "11.12.1" ||
  rootPackage.packageManager !== "npm@11.12.1"
) {
  fail("package and exact dependency versions");
}

const workspaceLock = lock.packages?.["packages/vite-plugin-probe"];
if (
  workspaceLock?.dependencies?.vite !== "6.4.3" ||
  lock.packages?.["node_modules/vite"]?.version !== "6.4.3" ||
  lock.packages?.["node_modules/rollup"]?.version !== "4.62.2" ||
  lock.packages?.["node_modules/esbuild"]?.version !== "0.25.12"
) {
  fail("lockfile versions");
}

if (
  indexSource.includes("plugin-entry") ||
  indexSource.includes("process-lifecycle") ||
  /spawn|exec|command|callback|url|path/iu.test(
    Object.keys(packageJson.exports["."]).join(" "),
  ) ||
  !indexSource.includes("runFixedObserveScenario") ||
  !indexSource.includes("runFixedApiScenario")
) {
  fail("package root import/public boundary");
}

const expectedArguments = [
  "build",
  "--config",
  "vite.scenario.config.ts",
  "--configLoader",
  "runner",
  "--mode",
  "production",
];
for (const value of expectedArguments) {
  if (!constantsSource.includes(JSON.stringify(value))) {
    fail("fixed Vite argv");
  }
}
for (const marker of [
  "executable: process.execPath",
  "shell: false",
  "cwd: FIXED_ADAPTER_ROOT",
  "arguments: [viteCliPath, ...FIXED_VITE_ARGUMENTS]",
  "detached: true",
]) {
  if (!processSource.includes(marker)) {
    fail(`fixed process marker ${marker}`);
  }
}
if (/process\.argv\[[34-9]\]|process\.env\[[^\]]+\]/u.test(processSource)) {
  fail("arbitrary process input");
}

const routeIds = [
  "vite-late-plugin-module-checkpoint",
  "vite-plugin-factory",
  "vite-build-start",
  "vite-designated-transform",
  "vite-generate-bundle",
  "vite-write-bundle",
];
const attemptIds = [
  "vite-attempt-environment",
  "vite-attempt-file-read",
  "vite-attempt-file-hash",
  "vite-attempt-file-write",
  "vite-attempt-loopback",
  "vite-attempt-child",
];
const changeIds = [
  "vite-module-transform-change",
  "vite-emitted-asset-change",
  "vite-bundle-mutation-change",
];
for (const id of [...routeIds, ...attemptIds, ...changeIds]) {
  if (!constantsSource.includes(JSON.stringify(id))) {
    fail(`missing event id ${id}`);
  }
}
if (
  !constantsSource.includes("EXPECTED_ROUTE_COUNT = 6") ||
  !constantsSource.includes("EXPECTED_CAPABILITY_COUNT = 6") ||
  !constantsSource.includes("EXPECTED_TOOL_API_CHANGE_COUNT = 3") ||
  !constantsSource.includes("EXPECTED_EVENT_COUNT = 15") ||
  !manifestSource.includes("workerId: null") ||
  !manifestSource.includes('route: "vite-plugin"')
) {
  fail("event count/producer contract");
}

for (const marker of [
  "sequential: true",
  "for (const attemptId of Object.values(ATTEMPT_IDS))",
  "filter: { id: exactIdFilter(runtime.designatedModuleId) }",
  "this.emitFile",
  "recordToolApiChange",
  "await runtime.session.close()",
]) {
  if (!pluginSource.includes(marker)) {
    fail(`plugin route marker ${marker}`);
  }
}
if (pluginSource.includes("configResolved")) {
  fail("dependency configResolved route");
}
if (!configContractSource.includes("configResolved")) {
  fail("trusted resolved config validator");
}

for (const marker of [
  'command !== "build"',
  'mode !== "production"',
  "publicDir: false",
  "envDir: false",
  "watch: null",
  "write: true",
  "emptyOutDir: true",
  "copyPublicDir: false",
  "manifest: false",
  "ssrManifest: false",
  "sourcemap: false",
  "minify: false",
  "modulePreload: false",
  "assetsInlineLimit: 0",
  "reportCompressedSize: false",
  "cache: false",
  "noDiscovery: true",
  "include: []",
  'format: "es"',
  "inlineDynamicImports: true",
]) {
  if (!configSource.includes(marker)) {
    fail(`config marker ${marker}`);
  }
}
if (
  configSource.includes("optimizeDeps.disabled") ||
  configSource.includes("--watch") ||
  /\b(dev|serve|preview|hmr)\b/iu.test(configSource)
) {
  fail("forbidden config path/option");
}

const fixtureTypeScriptFiles = (
  await readdir(path.join(adapterRoot, "fixture"))
)
  .filter((name) => name.endsWith(".ts"))
  .sort();
exactArray(
  fixtureTypeScriptFiles,
  ["designated.ts", "entry.ts"],
  "fixture file count",
);
if (
  entrySource !==
    'import { designatedValue } from "./designated.js";\n\nconsole.log(designatedValue);\n' ||
  designatedSource !==
    'export const designatedValue = "M2D_DESIGNATED_ORIGINAL";\n' ||
  /import\(|\.css|\.html|from\s+["'][^.]|public/iu.test(
    `${entrySource}\n${designatedSource}`,
  )
) {
  fail("fixed fixture/import graph");
}

for (const marker of [
  'ENTRY_OUTPUT_FILE = "entry.js"',
  'CHUNK_OUTPUT_FILE = "chunk.js"',
  'ASSET_OUTPUT_FILE = "probe-asset.txt"',
]) {
  if (!constantsSource.includes(marker)) {
    fail("fixed output filenames");
  }
}

if (
  !coordinatorInputSource.includes("process.env.PROBE_CANARY_M2D_RUN_ID") ||
  !coordinatorInputSource.includes("process.env.PROBE_CANARY_M2D_VARIANT") ||
  /process\.env(?!\.PROBE_CANARY_)/u.test(coordinatorInputSource) ||
  /https?:\/\//u.test(
    `${pluginSource}\n${runtimeSource}\n${scenarioSource}\n${coordinatorInputSource}`,
  ) ||
  scenarioSource.includes('listen(0, "0.0.0.0"') ||
  !scenarioSource.includes('listen(0, "127.0.0.1"')
) {
  fail("environment/network boundary");
}

for (const marker of [
  "resolveNearestConfigTemporaryBoundary",
  'path.join(nodeModulesRoot, ".vite-temp")',
  "captureOwnedRunBoundary",
  "sameIdentity",
  "isSymbolicLink",
  "configTemporaryExists",
]) {
  if (!temporarySource.includes(marker)) {
    fail(`temporary boundary marker ${marker}`);
  }
}
for (const marker of [
  'signalGroup(processGroupId, "SIGTERM")',
  'signalGroup(processGroupId, "SIGKILL")',
  "M2D_SETTLEMENT_UNKNOWN",
  "M2D_ESBUILD_RESIDUE",
  "expectedDisposition",
]) {
  if (!processSource.includes(marker)) {
    fail(`process lifecycle marker ${marker}`);
  }
}

for (const forbiddenField of [
  '"stack"',
  '"stdout"',
  '"stderr"',
  '"moduleId"',
  '"referenceId"',
  '"bundleKey"',
  '"fileName"',
]) {
  if (!evidenceSource.includes(forbiddenField)) {
    fail(`data-policy rejection ${forbiddenField}`);
  }
}
if (
  !evidenceSource.includes('rawSegment.endsWith("\\n")') ||
  !evidenceSource.includes("EXPECTED_EVENT_ORDER") ||
  !evidenceSource.includes("NOT_APPLICABLE") ||
  !evidenceSource.includes("validateMaterializedOutputs") ||
  /\n\s+(?:rawSegment|segmentPath|rawPath|absolutePath|tempPath):/u.test(
    localRunnerSource,
  )
) {
  fail("segment/data policy verifier");
}

const approvedInputs = [
  [
    "fixture/entry.ts",
    "sha256:d259a7ec20036a8d289c95bbbe254df4278a7a7ca520cb46889eca1b08c3c382",
  ],
  [
    "fixture/designated.ts",
    "sha256:379ba4149c5492855bdbbcd7a9f207c223cc8578dc62e51228e06416354ab770",
  ],
  [
    "vite.scenario.config.ts",
    "sha256:605e2c0be2e7ee124d60beeab093b9487f46381fc5c9c4e49c71496d65994427",
  ],
  [
    "src/plugin-entry.ts",
    "sha256:8290cadad71fa2a4f00650540e3234b1f398dfe50382b860e37921d9c17b6590",
  ],
  [
    "src/plugin-runtime.ts",
    "sha256:b90ddbdfe8df1298318b2ffcdad4fdd4e6898ea5cbfb81b6a0b4dc395c62bd92",
  ],
];
for (const [relativePath, approvedHash] of approvedInputs) {
  const actualHash = digest(await text(relativePath));
  if (
    actualHash !== approvedHash ||
    !inputContractSource.includes(approvedHash)
  ) {
    fail(`approved input hash ${relativePath}`);
  }
}

if (
  digest(matrixSource) !==
    "sha256:80ab99c890bc2eca2b5ade839e0195b032a702cc450ed3f7fecd8a5706e535b0" ||
  !matrixSource.includes("未実測")
) {
  fail("experiment-matrix Observed changed");
}
if (probeCoreIndexSource.includes("vite-plugin-probe")) {
  fail("probe-core reverse dependency");
}

process.stdout.write(
  "M2-D static contract verified (scoped inspection; not runtime sandbox proof)\n",
);
