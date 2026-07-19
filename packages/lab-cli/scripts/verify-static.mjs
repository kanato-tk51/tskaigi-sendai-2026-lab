import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const packageRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(packageRoot, "../..");

function fail(message) {
  throw new Error(`M3 static verification failed: ${message}`);
}

async function packageText(relativePath) {
  return readFile(path.join(packageRoot, relativePath), "utf8");
}

if (process.argv.length !== 2) fail("arguments are not accepted");

const sourceNames = (await readdir(path.join(packageRoot, "src")))
  .filter((name) => name.endsWith(".ts"))
  .sort();
const sourceEntries = await Promise.all(
  sourceNames.map(async (name) => [name, await packageText(`src/${name}`)]),
);
const sources = Object.fromEntries(sourceEntries);
const m3SourceEntries = sourceEntries.filter(
  ([name]) => !name.startsWith("artifact-demo"),
);
const allM3Source = m3SourceEntries.map(([, source]) => source).join("\n");
const [
  packageSource,
  rootPackageSource,
  scenarioSource,
  runOutputReadme,
  milestonesSource,
  probeIndex,
] = await Promise.all([
  packageText("package.json"),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readFile(
    path.join(repositoryRoot, "scenarios/m3-synthetic-collector.json"),
    "utf8",
  ),
  readFile(path.join(repositoryRoot, "results/runs/README.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/milestones.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "packages/probe-core/src/index.ts"),
    "utf8",
  ),
]);

const packageJson = JSON.parse(packageSource);
const rootPackage = JSON.parse(rootPackageSource);
const scenario = JSON.parse(scenarioSource);
if (
  packageJson.name !== "@tskaigi-lab/lab-cli" ||
  packageJson.version !== "0.0.0" ||
  packageJson.private !== true ||
  packageJson.type !== "module" ||
  packageJson.dependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
  Object.keys(packageJson.dependencies).length !== 1 ||
  packageJson.engines?.node !== "20.18.2" ||
  packageJson.engines?.npm !== "11.12.1"
) {
  fail("package contract");
}
for (const script of [
  "m3:build",
  "m3:typecheck",
  "m3:test",
  "m3:static",
  "m3:run:fixture",
  "m3:verify",
]) {
  if (typeof rootPackage.scripts?.[script] !== "string") {
    fail(`missing root script ${script}`);
  }
}

const indexSource = sources["index.ts"] ?? "";
if (
  indexSource.includes("node:") ||
  indexSource.includes("./cli") ||
  indexSource.includes("./persistence") ||
  !indexSource.includes(
    'export { regenerateFixedScenario } from "./runner.js";',
  ) ||
  /export\s*\{[^}]*\brunFixedScenario\b/u.test(indexSource)
) {
  fail("package root import boundary");
}

for (const forbidden of [
  "node:child_process",
  "node:http",
  "node:https",
  "process.env",
  "@tskaigi-lab/adapter-",
  'from "eslint"',
  'from "vitest"',
  'from "vite"',
  "shell: true",
]) {
  if (allM3Source.includes(forbidden))
    fail(`forbidden source marker ${forbidden}`);
}

const cliSource = sources["cli.ts"] ?? "";
const runnerSource = sources["runner.ts"] ?? "";
const collectorSource = sources["collector.ts"] ?? "";
const persistenceSource = sources["persistence.ts"] ?? "";
if (
  !cliSource.includes("argv.length !== 2") ||
  !cliSource.includes("FIXED_SCENARIO_ID") ||
  cliSource.includes("argv.slice") ||
  runnerSource.includes("process.execPath") ||
  /\b(?:spawn|exec|fork)\s*\(/u.test(runnerSource)
) {
  fail("fixed dispatch boundary");
}
for (const marker of [
  "MAX_SEGMENT_BYTES",
  "MAX_EVENTS_PER_SEGMENT",
  "MAX_EVENT_LINE_BYTES",
  "validateProbeEvent",
  "SEGMENT_NONCANONICAL",
  "SEGMENT_SEQUENCE_INVALID",
  "CANONICAL_EVENT_SCHEMA_VERSION",
  "SEGMENT_UTF8_INVALID",
  "types.isUint8Array",
]) {
  if (!collectorSource.includes(marker)) fail(`collector marker ${marker}`);
}
for (const marker of [
  "run-completion.snapshot.json",
  "regenerateFixtureRunInOwnedRoot",
  "INPUT_INVENTORY_INVALID",
  "assertCanonicalJson",
]) {
  if (!allM3Source.includes(marker) && !persistenceSource.includes(marker)) {
    fail(`regeneration marker ${marker}`);
  }
}

const scenarioKeys = Object.keys(scenario).sort();
if (
  scenario.schemaVersion !== "lab-scenario-definition/v2" ||
  scenario.scenarioId !== "m3-synthetic-collector" ||
  scenario.evidenceClass !== "contract-fixture" ||
  scenario.profileId !== "not-applicable" ||
  scenario.outputLocation !== "results/runs/m3-harness" ||
  !Array.isArray(scenario.expected?.attemptOutcomes) ||
  !Array.isArray(scenario.expected?.toolChangeOutcomes) ||
  !Array.isArray(scenario.expected?.hashDeltas) ||
  scenarioKeys.some((key) =>
    ["command", "argv", "cwd", "module", "path", "output"].includes(key),
  )
) {
  fail("fixed scenario definition");
}
if (
  !milestonesSource.includes("## M3: harness and reports") ||
  !milestonesSource.includes("lab-canonical-event/v1") ||
  !runOutputReadme.includes(
    "adapter measurement、experiment-matrix Observed evidence、profile evidence、presentation evidence ではない",
  ) ||
  probeIndex.includes("lab-cli")
) {
  fail("documentation/dependency direction");
}

process.stdout.write(
  "M3 static contract verified (scoped inspection; not runtime sandbox proof)\n",
);
