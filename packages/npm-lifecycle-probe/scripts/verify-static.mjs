import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const packageRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(packageRoot, "../..");

function fail(message) {
  throw new Error(`M2-A static verification failed: ${message}`);
}

const readPackage = (relativePath) =>
  readFile(path.join(packageRoot, relativePath), "utf8");

if (process.argv.length !== 2) fail("arguments are not accepted");

const [
  packageSource,
  rootPackageSource,
  constantsSource,
  coordinatorSource,
  entrySource,
  manifestSource,
  indexSource,
  dependencySource,
  consumerSource,
  architectureSource,
  matrixSource,
] = await Promise.all([
  readPackage("package.json"),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readPackage("src/constants.ts"),
  readPackage("src/coordinator-input.ts"),
  readPackage("src/lifecycle-entry.ts"),
  readPackage("src/manifest.ts"),
  readPackage("src/index.ts"),
  readPackage("fixture/dependency/package.json"),
  readPackage("fixture/consumer/package.json"),
  readFile(path.join(repositoryRoot, "docs/architecture.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/experiment-matrix.md"), "utf8"),
]);

const packageJson = JSON.parse(packageSource);
const rootPackage = JSON.parse(rootPackageSource);
const dependencyJson = JSON.parse(dependencySource);
const consumerJson = JSON.parse(consumerSource);

if (
  packageJson.name !== "@tskaigi-lab/adapter-npm-lifecycle" ||
  packageJson.version !== "0.0.0" ||
  packageJson.private !== true ||
  packageJson.type !== "module" ||
  packageJson.dependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
  Object.keys(packageJson.dependencies).length !== 1 ||
  packageJson.engines?.node !== "24.18.0" ||
  packageJson.engines?.npm !== "12.0.1"
) {
  fail("package contract");
}
if (
  JSON.stringify(rootPackage.workspaces) !== JSON.stringify(["packages/*"]) ||
  rootPackage.scripts?.postinstall !== undefined ||
  rootPackage.scripts?.install !== undefined ||
  rootPackage.scripts?.preinstall !== undefined
) {
  fail("root lifecycle isolation");
}

if (
  dependencyJson.name !== "@tskaigi-lab/m2a-install-probe" ||
  dependencyJson.version !== "1.0.0" ||
  JSON.stringify(dependencyJson.scripts) !==
    JSON.stringify({
      postinstall: "node /opt/m2a-adapter/dist/lifecycle-entry.js",
    })
) {
  fail("fixed dependency lifecycle entry");
}
if (
  Object.keys(consumerJson.dependencies ?? {}).length !== 1 ||
  consumerJson.dependencies["@tskaigi-lab/m2a-install-probe"] !==
    "file:../input/m2a-install-probe-1.0.0.tgz"
) {
  fail("consumer fixture contract");
}

for (const id of [
  "npm-lifecycle-invocation",
  "npm-lifecycle-attempt-environment",
  "npm-lifecycle-attempt-file-read",
  "npm-lifecycle-attempt-file-hash",
  "npm-lifecycle-attempt-file-write",
  "npm-lifecycle-attempt-loopback",
  "npm-lifecycle-attempt-child",
]) {
  if (!constantsSource.includes(JSON.stringify(id))) {
    fail(`missing fixed event ID ${id}`);
  }
}
if (
  !constantsSource.includes("EXPECTED_ROUTE_COUNT = 1") ||
  !constantsSource.includes("EXPECTED_CAPABILITY_COUNT = 6") ||
  !constantsSource.includes("EXPECTED_EVENT_COUNT = 7") ||
  !manifestSource.includes('route: "npm-install-lifecycle"') ||
  !manifestSource.includes('triggerTypes: ["automatic"]') ||
  !entrySource.includes("recordRouteInvocation(ROUTE_ID") ||
  !entrySource.includes("session.runAttempt(attemptId)") ||
  !entrySource.includes("await session.close()")
) {
  fail("event contract");
}

if (
  /process\.env\.(?!PROBE_CANARY_)/u.test(
    `${coordinatorSource}\n${entrySource}`,
  ) ||
  /process\.env\[\s*["'](?!PROBE_CANARY_)/u.test(
    `${coordinatorSource}\n${entrySource}`,
  ) ||
  entrySource.includes("process.argv.slice") ||
  entrySource.includes("shell: true") ||
  entrySource.includes("spawn(") ||
  /https?:\/\//u.test(`${coordinatorSource}\n${entrySource}`)
) {
  fail("runtime input or process boundary");
}

if (
  !entrySource.includes("prepareProbeConfiguration") ||
  !entrySource.includes("createProbeSession") ||
  !manifestSource.includes("toolApiTargets: []") ||
  !manifestSource.includes("toolApiChanges: []") ||
  !coordinatorSource.includes("/work/m2a-npm-lifecycle-") ||
  !coordinatorSource.includes("/tmp/tskaigi-npm-lifecycle-m2a-")
) {
  fail("probe-core and path boundary");
}

const fixtureEntries = (
  await readdir(path.join(packageRoot, "fixture"))
).sort();
if (fixtureEntries.join(",") !== "consumer,dependency") {
  fail("fixture scope");
}
if (
  !architectureSource.includes("packages/npm-lifecycle-probe") ||
  !matrixSource.includes("npm12-unapproved-p") ||
  indexSource.includes("node:child_process")
) {
  fail("documentation/dependency direction");
}

process.stdout.write(
  "M2-A static contract verified (container execution and evidence transfer not run)\n",
);
