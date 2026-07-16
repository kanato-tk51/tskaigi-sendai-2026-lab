import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const packageRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(packageRoot, "../..");

function fail(message) {
  throw new Error(`M2-E static verification failed: ${message}`);
}

async function packageText(relativePath) {
  return readFile(path.join(packageRoot, relativePath), "utf8");
}

if (process.argv.length !== 2) {
  fail("arguments are not accepted");
}

const [
  packageSource,
  rootPackageSource,
  indexSource,
  constantsSource,
  cliSource,
  runtimeSource,
  scenarioSource,
  manifestSource,
  localRunnerSource,
  generatorSource,
  matrixSource,
  probeCoreIndexSource,
] = await Promise.all([
  packageText("package.json"),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  packageText("src/index.ts"),
  packageText("src/constants.ts"),
  packageText("src/cli.ts"),
  packageText("src/cli-runtime.ts"),
  packageText("src/scenario.ts"),
  packageText("src/manifest.ts"),
  packageText("src/local-runner.ts"),
  packageText("src/generator.ts"),
  readFile(path.join(repositoryRoot, "docs/experiment-matrix.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "packages/probe-core/src/index.ts"),
    "utf8",
  ),
]);

const packageJson = JSON.parse(packageSource);
const rootPackage = JSON.parse(rootPackageSource);
if (
  packageJson.name !== "@tskaigi-lab/adapter-codegen" ||
  packageJson.version !== "0.0.0" ||
  packageJson.private !== true ||
  packageJson.type !== "module" ||
  packageJson.dependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
  Object.keys(packageJson.dependencies).length !== 1 ||
  packageJson.engines?.node !== "20.18.2" ||
  packageJson.engines?.npm !== "11.12.1" ||
  rootPackage.packageManager !== "npm@11.12.1"
) {
  fail("package contract");
}

if (
  indexSource.includes("cli") ||
  indexSource.includes("node:") ||
  !indexSource.includes("runFixedObserveScenario") ||
  !indexSource.includes("runFixedApiScenario") ||
  !indexSource.includes("runFixedDryRunScenario")
) {
  fail("package root import boundary");
}

for (const marker of [
  "process.execPath",
  "shell: false",
  "cwd: FIXED_PACKAGE_ROOT",
  "[cliPath, variant]",
]) {
  if (!scenarioSource.includes(marker)) {
    fail(`fixed CLI marker ${marker}`);
  }
}
if (
  cliSource.includes("process.argv[3]") ||
  cliSource.includes("process.argv.slice") ||
  /process\.env\.(?!PROBE_CANARY_)/u.test(runtimeSource)
) {
  fail("arbitrary process input");
}

for (const id of [
  "codegen-cli-startup",
  "codegen-argument-parse",
  "codegen-generation-start",
  "codegen-file-write",
  "codegen-completion",
  "codegen-attempt-environment",
  "codegen-attempt-file-read",
  "codegen-attempt-file-hash",
  "codegen-attempt-file-write",
  "codegen-attempt-loopback",
  "codegen-attempt-child",
  "codegen-generation-api-change",
]) {
  if (!constantsSource.includes(JSON.stringify(id))) {
    fail(`missing fixed event ID ${id}`);
  }
}
if (
  !constantsSource.includes("EXPECTED_ROUTE_COUNT = 5") ||
  !constantsSource.includes("EXPECTED_CAPABILITY_COUNT = 6") ||
  !constantsSource.includes("EXPECTED_TOOL_API_CHANGE_COUNT = 1") ||
  !constantsSource.includes("EXPECTED_EVENT_COUNT = 12") ||
  !manifestSource.includes('route: "codegen-cli"') ||
  !manifestSource.includes('triggerTypes: ["explicit"]')
) {
  fail("event contract");
}

for (const marker of [
  "recordRouteInvocation(ROUTE_IDS.startup",
  "parseFixedArguments",
  "generateDocumentedArtifact",
  "recordToolApiChange",
  "await runtime.session.close()",
]) {
  if (!cliSource.includes(marker)) {
    fail(`CLI marker ${marker}`);
  }
}
if (
  /https?:\/\//u.test(`${cliSource}\n${runtimeSource}\n${scenarioSource}`) ||
  scenarioSource.includes('listen(0, "0.0.0.0"') ||
  !scenarioSource.includes('listen(0, "127.0.0.1"')
) {
  fail("network boundary");
}

for (const marker of [
  "observe",
  "api",
  "dry-run",
  "changed: false",
  "M2E_ARGUMENTS_INVALID",
  "OUTPUT_RELATIVE_PATH",
]) {
  if (
    !scenarioSource.includes(marker) &&
    !cliSource.includes(marker) &&
    !runtimeSource.includes(marker) &&
    !constantsSource.includes(marker)
  ) {
    fail(`fixed mode marker ${marker}`);
  }
}
if (!generatorSource.includes("The fixed project-owned generator API")) {
  fail("documented generator API");
}

const fixtureFiles = (await readdir(path.join(packageRoot, "fixture"))).sort();
if (fixtureFiles.length !== 1 || fixtureFiles[0] !== "input.txt") {
  fail("fixture scope");
}
if (
  !constantsSource.includes("results/runs/m2-e-codegen") ||
  /rawSegment:|segmentPath:|absolutePath:|tempPath:/u.test(localRunnerSource)
) {
  fail("summary data policy");
}
if (
  !matrixSource.includes("codegen-observe-p") ||
  !matrixSource.includes("codegen-api-p") ||
  probeCoreIndexSource.includes("codegen-probe")
) {
  fail("documentation/dependency direction");
}

process.stdout.write(
  "M2-E static contract verified (scoped inspection; not runtime sandbox proof)\n",
);
