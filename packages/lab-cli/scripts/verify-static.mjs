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
  codegenPermissiveScenarioSource,
  codegenConstrainedScenarioSource,
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
  readFile(
    path.join(repositoryRoot, "scenarios/codegen-observe-p.json"),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "scenarios/codegen-observe-c.json"),
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
const codegenPermissiveScenario = JSON.parse(codegenPermissiveScenarioSource);
const codegenConstrainedScenario = JSON.parse(codegenConstrainedScenarioSource);
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
if (
  !indexSource.includes("collectCodegenProductionRun") ||
  !indexSource.includes("validateCodegenScenarioDefinition") ||
  indexSource.includes("collectCodegenProductionRunInOwnedRoot") ||
  indexSource.includes("CodegenProductionTestControl")
) {
  fail("codegen production package-root boundary");
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
const codegenProductionSource = sources["codegen-production.ts"] ?? "";
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
  "CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION",
  "CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION",
  "CODEGEN_EXPECTED_EVENT_ORDER",
  "CODEGEN_SEGMENT_FILENAME",
  "copyPlainBytes",
  "validateProbeManifest",
  "validateProbeEvent",
  "O_NOFOLLOW",
  "before-r1",
  "before-r2",
  "after-open:${label}",
  "after-open:${held.label}",
  "event-order:${index}",
  "derived.staging",
  "handle.sync()",
  "settleHandles(handles, control)",
  "rename(stagingRoot, derivedRoot)",
  "M3_CODEGEN_FILESYSTEM_REJECTED",
]) {
  if (!codegenProductionSource.includes(marker)) {
    fail(`codegen production marker ${marker}`);
  }
}

const expectedCodegenEventOrder = [
  "route-invocation:codegen-cli-startup",
  "route-invocation:codegen-argument-parse",
  "route-invocation:codegen-generation-start",
  "capability-attempt:codegen-attempt-environment",
  "capability-attempt:codegen-attempt-file-read",
  "capability-attempt:codegen-attempt-file-hash",
  "capability-attempt:codegen-attempt-file-write",
  "capability-attempt:codegen-attempt-loopback",
  "capability-attempt:codegen-attempt-child",
  "tool-api-change:codegen-generation-api-change",
  "route-invocation:codegen-file-write",
  "route-invocation:codegen-completion",
];
const eventOrderMatch = codegenProductionSource.match(
  /const CODEGEN_EXPECTED_EVENT_ORDER = Object\.freeze\(\[([\s\S]*?)\] as const\);/u,
);
const actualCodegenEventOrder = [
  ...(eventOrderMatch?.[1].matchAll(/"([^"]+)"/gu) ?? []),
].map((match) => match[1]);
if (
  actualCodegenEventOrder.length !== expectedCodegenEventOrder.length ||
  actualCodegenEventOrder.some(
    (identity, index) => identity !== expectedCodegenEventOrder[index],
  )
) {
  fail("codegen exact cross-kind event order");
}

for (const [name, start, end, checkpoint] of [
  [
    "directory",
    "async function openHeldDirectory(",
    "async function openHeldRawFile(",
    "after-open:${label}",
  ],
  [
    "raw file",
    "async function openHeldRawFile(",
    "function requireHeldStatus(",
    "after-open:${label}",
  ],
  [
    "staged file",
    "async function createStagedFile(",
    "async function revalidateStaged(",
    "after-open:${held.label}",
  ],
]) {
  const startIndex = codegenProductionSource.indexOf(start);
  const endIndex = codegenProductionSource.indexOf(end, startIndex + 1);
  const source = codegenProductionSource.slice(startIndex, endIndex);
  const openIndex = source.indexOf("const handle = await open(");
  const ownershipIndex = source.indexOf("handles.push(held);");
  const checkpointIndex = source.indexOf(checkpoint);
  const firstStatIndex = source.indexOf("await held.handle.stat(");
  if (
    startIndex < 0 ||
    endIndex < 0 ||
    openIndex < 0 ||
    ownershipIndex <= openIndex ||
    checkpointIndex <= ownershipIndex ||
    firstStatIndex <= checkpointIndex
  ) {
    fail(`codegen ${name} post-open settlement ownership`);
  }
}
if (
  codegenProductionSource.includes("after-rename") ||
  codegenProductionSource.includes("@tskaigi-lab/adapter-codegen") ||
  codegenProductionSource.includes("results/runs/p2-") ||
  codegenProductionSource.includes("process.env")
) {
  fail("codegen production non-activation/evidence boundary");
}
const productionEntry = codegenProductionSource.indexOf(
  "export async function collectCodegenProductionRunInOwnedRoot",
);
const finalRename = codegenProductionSource.lastIndexOf(
  "await rename(stagingRoot, derivedRoot)",
);
const finalReturn = codegenProductionSource.lastIndexOf("return successResult");
const finalRenameEnd =
  finalRename + "await rename(stagingRoot, derivedRoot)".length;
if (
  productionEntry < 0 ||
  finalRename <= productionEntry ||
  finalReturn <= finalRename ||
  codegenProductionSource.slice(finalRenameEnd, finalReturn).includes("await ")
) {
  fail("codegen final-rename terminal");
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

for (const [candidate, scenarioId, profileId] of [
  [codegenPermissiveScenario, "codegen-observe-p", "permissive"],
  [codegenConstrainedScenario, "codegen-observe-c", "constrained"],
]) {
  if (
    candidate.schemaVersion !== "lab-scenario-definition/v3" ||
    candidate.scenarioId !== scenarioId ||
    candidate.adapterId !== "codegen" ||
    candidate.evidenceClass !== "adapter-run" ||
    candidate.profileId !== profileId ||
    candidate.outputLocation !== "results/runs/m3-codegen" ||
    candidate.producerId !== "codegen-cli-producer" ||
    candidate.segmentId !== "codegen-cli-producer" ||
    candidate.expected?.routes?.length !== 5 ||
    candidate.expected?.attempts?.length !== 6 ||
    candidate.expected?.toolChanges?.length !== 1 ||
    candidate.expected?.hashes?.length !== 2 ||
    candidate.expected.hashes.some((item) => item.state !== "unavailable") ||
    ["command", "argv", "cwd", "module", "path", "runId"].some((key) =>
      Object.hasOwn(candidate, key),
    )
  ) {
    fail(`fixed codegen production scenario ${scenarioId}`);
  }
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
