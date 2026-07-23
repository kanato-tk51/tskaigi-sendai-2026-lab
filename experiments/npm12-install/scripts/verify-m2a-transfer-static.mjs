import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  M2A_TRANSFER,
  createFixedDockerPlan,
  validateFixedDockerPlan,
} from "./m2a-transfer-lib.mjs";
import {
  M2A_CONSTRUCTION,
  createFixedConstructionPlan,
  validateFixedConstructionPlan,
} from "./m2a-transfer-construction.mjs";
import {
  M2A_INPUTS,
  createFixedNpmRequestPlan,
  validateFixedNpmRequestPlan,
} from "./m2a-transfer-inputs.mjs";
import {
  M2A_PRODUCTION,
  createFixedImageBuildPlan,
  createFixedProductionExecutionPlan,
  createPessimisticAttemptCheckpointBytes,
  validateFixedImageBuildPlan,
  validateFixedProductionExecutionPlan,
} from "./m2a-transfer-production.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const experimentRoot = path.join(repositoryRoot, "experiments/npm12-install");

function fail(message) {
  throw new Error(`M2-A transfer static verification failed: ${message}`);
}

const NPM_ENTRY_GUARD = `  if (
    process.execPath !== "/usr/bin/node" ||
    process.argv0 !== "/usr/bin/node" ||
    process.argv.length !== 2 ||
    process.argv[0] !== "/usr/bin/node" ||
    process.argv[1] !== entryPath ||
    process.cwd() !== expectedRepositoryRoot ||
    Reflect.ownKeys(environmentDescriptors).length !== 0
  ) {
    throw new Error("M2A_INPUT_AUTHORITY_REJECTED");
  }`;

function exactFunctionBoundary(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1 || end <= start) return null;
  return source.slice(start, end);
}

function replaceWithinExactFunction(
  source,
  startMarker,
  endMarker,
  expected,
  replacement,
) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1 || end <= start) return source;
  const boundary = source.slice(start, end);
  if (
    !boundary.includes(expected) ||
    boundary.indexOf(expected) !== boundary.lastIndexOf(expected)
  ) {
    return source;
  }
  return `${source.slice(0, start)}${boundary.replace(expected, replacement)}${source.slice(end)}`;
}

function validatesExactNpmEntryBoundary(source) {
  const mainBoundary = exactFunctionBoundary(
    source,
    "export async function main() {",
    "\n\nif (\n",
  );
  if (mainBoundary === null) return false;
  const guardIndex = mainBoundary.indexOf(NPM_ENTRY_GUARD);
  const producerCall = "  await runFixedNpmAcquisitionEntry();";
  const producerIndex = mainBoundary.indexOf(producerCall);
  return (
    mainBoundary.includes(
      "  const entryPath = fileURLToPath(import.meta.url);",
    ) &&
    mainBoundary.includes(
      '  const expectedRepositoryRoot = path.resolve(\n    path.dirname(entryPath),\n    "../../..",\n  );',
    ) &&
    mainBoundary.includes(
      "  const environmentDescriptors = Object.getOwnPropertyDescriptors(process.env);",
    ) &&
    guardIndex !== -1 &&
    mainBoundary.indexOf(NPM_ENTRY_GUARD, guardIndex + 1) === -1 &&
    producerIndex > guardIndex + NPM_ENTRY_GUARD.length &&
    mainBoundary.indexOf(producerCall, producerIndex + 1) === -1
  );
}

function validatesInputLinkBoundaries(source) {
  const directoryBoundary = exactFunctionBoundary(
    source,
    "async function createHeldDirectoryChild(parentPath, childName) {",
    "\n\nasync function publishFileTransaction(",
  );
  const publicationBoundary = exactFunctionBoundary(
    source,
    "async function publishFileTransaction(",
    "\n\nfunction requestProductionBytes(",
  );
  const acquisitionBoundary = exactFunctionBoundary(
    source,
    "export async function runFixedNpmAcquisitionEntry() {",
    "\n\nfunction heldDirectorySnapshotSync(",
  );
  return (
    directoryBoundary !== null &&
    publicationBoundary !== null &&
    acquisitionBoundary !== null &&
    directoryBoundary.includes("added.identity.links < 1 ||") &&
    !directoryBoundary.includes("added.identity.links !== 1") &&
    (
      publicationBoundary.match(
        /(?:created\.identity|finalIdentity)\.links !== 1/gu,
      ) ?? []
    ).length === 2 &&
    acquisitionBoundary.includes("identity.links !== 1 ||")
  );
}

async function sourceFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(candidate)));
    else if (entry.isFile()) files.push(candidate);
    else fail("source input type");
  }
  return files;
}

if (process.argv.length !== 2) fail("arguments are not accepted");

const [
  manifestSource,
  containerfile,
  initializerSource,
  runnerSource,
  librarySource,
  declarationsSource,
  rootPackageSource,
  implementationPrompt,
  reviewPrompt,
  remediationPrompt,
  remediationReviewPrompt,
  residualRemediationPrompt,
  residualRemediationReviewPrompt,
] = await Promise.all([
  readFile(path.join(experimentRoot, "m2a-transfer-manifest.json"), "utf8"),
  readFile(path.join(experimentRoot, "Containerfile.m2a-transfer"), "utf8"),
  readFile(
    path.join(experimentRoot, "container/initialize-m2a-volume.mjs"),
    "utf8",
  ),
  readFile(path.join(experimentRoot, "container/run-m2a-transfer.mjs"), "utf8"),
  readFile(path.join(scriptDirectory, "m2a-transfer-lib.mjs"), "utf8"),
  readFile(path.join(scriptDirectory, "m2a-transfer-lib.d.mts"), "utf8"),
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-implementation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-implementation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-implementation-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-implementation-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-implementation-residual-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md",
    ),
    "utf8",
  ),
]);
const manifest = JSON.parse(manifestSource);
const rootPackage = JSON.parse(rootPackageSource);
const [
  constructionSource,
  constructionDeclarations,
  productionSource,
  productionDeclarations,
  constructorEntrySource,
  imageBuildEntrySource,
  executionEntrySource,
  constructionImplementationPrompt,
  constructionReviewPrompt,
  privateAuthorityRemediationPrompt,
  privateAuthorityReviewPrompt,
  unchangedChildRemediationPrompt,
  unchangedChildReviewPrompt,
  inputLibrarySource,
  inputDeclarations,
  acquisitionEntrySource,
  toolchainEntrySource,
  dependencyInputImplementationPrompt,
  dependencyInputReviewPrompt,
  dependencyInputRemediationPrompt,
  dependencyInputRemediationReviewPrompt,
  dependencyInputResidualRemediationPrompt,
  dependencyInputResidualRemediationReviewPrompt,
  dependencyInputIdentityVerificationRemediationPrompt,
  dependencyInputIdentityVerificationRemediationReviewPrompt,
  transferTestSource,
] = await Promise.all([
  readFile(path.join(scriptDirectory, "m2a-transfer-construction.mjs"), "utf8"),
  readFile(
    path.join(scriptDirectory, "m2a-transfer-construction.d.mts"),
    "utf8",
  ),
  readFile(path.join(scriptDirectory, "m2a-transfer-production.mjs"), "utf8"),
  readFile(path.join(scriptDirectory, "m2a-transfer-production.d.mts"), "utf8"),
  readFile(
    path.join(scriptDirectory, "construct-m2a-transfer-context.mjs"),
    "utf8",
  ),
  readFile(path.join(scriptDirectory, "build-m2a-transfer-image.mjs"), "utf8"),
  readFile(path.join(scriptDirectory, "execute-m2a-transfer.mjs"), "utf8"),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(path.join(scriptDirectory, "m2a-transfer-inputs.mjs"), "utf8"),
  readFile(path.join(scriptDirectory, "m2a-transfer-inputs.d.mts"), "utf8"),
  readFile(path.join(scriptDirectory, "acquire-m2a-transfer-npm.mjs"), "utf8"),
  readFile(
    path.join(scriptDirectory, "capture-m2a-transfer-toolchain.mjs"),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "tests/m2a-evidence-transfer.test.ts"),
    "utf8",
  ),
]);

const fixedInputs = [
  "package-lock.json",
  "packages/probe-core/package.json",
  "packages/npm-lifecycle-probe/package.json",
  "packages/npm-lifecycle-probe/fixture/consumer/package.json",
  "packages/npm-lifecycle-probe/fixture/dependency/package.json",
];
const discoveredSources = (
  await Promise.all([
    sourceFiles(path.join(repositoryRoot, "packages/npm-lifecycle-probe/src")),
    sourceFiles(path.join(repositoryRoot, "packages/probe-core/src")),
  ])
)
  .flat()
  .map((file) => path.relative(repositoryRoot, file).split(path.sep).join("/"))
  .sort();
const inputPaths = [...fixedInputs, ...discoveredSources];
if (
  inputPaths.length !== 31 ||
  JSON.stringify(inputPaths) !== JSON.stringify(manifest.sourceInputs)
) {
  fail("31-file input inventory");
}
const rows = [];
for (const inputPath of inputPaths) {
  const hash = createHash("sha256")
    .update(await readFile(path.join(repositoryRoot, inputPath)))
    .digest("hex");
  rows.push(`${hash}  ${inputPath}\n`);
}
const aggregate = `sha256:${createHash("sha256")
  .update(rows.join(""))
  .digest("hex")}`;
if (
  aggregate !== M2A_TRANSFER.sourceAggregate ||
  aggregate !== manifest.sourceAggregate
) {
  fail("31-file aggregate");
}
const constructionAdditions = [
  "package.json",
  "tsconfig.base.json",
  "packages/probe-core/tsconfig.json",
  "packages/probe-core/tsconfig.build.json",
  "packages/npm-lifecycle-probe/tsconfig.json",
  "packages/npm-lifecycle-probe/tsconfig.build.json",
  "experiments/npm12-install/Containerfile.m2a-transfer",
  "experiments/npm12-install/m2a-transfer-manifest.json",
  "experiments/npm12-install/container/initialize-m2a-volume.mjs",
  "experiments/npm12-install/container/run-m2a-transfer.mjs",
];
const constructionPaths = [...inputPaths, ...constructionAdditions];
if (
  constructionPaths.length !== 41 ||
  JSON.stringify(constructionPaths) !==
    JSON.stringify(M2A_CONSTRUCTION.constructionInputs)
) {
  fail("41-file construction inventory");
}
const constructionRows = [];
for (const inputPath of constructionPaths) {
  const hash = createHash("sha256")
    .update(await readFile(path.join(repositoryRoot, inputPath)))
    .digest("hex");
  constructionRows.push(`${hash}  ${inputPath}\n`);
}
const constructionAggregate = `sha256:${createHash("sha256")
  .update(constructionRows.join(""))
  .digest("hex")}`;
if (
  constructionAggregate !==
    "sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526" ||
  constructionAggregate !== M2A_CONSTRUCTION.constructionBaselineAggregate
) {
  fail("41-file construction aggregate");
}

for (const [key, value] of Object.entries({
  generation: M2A_TRANSFER.generation,
  expectedRevision: M2A_TRANSFER.expectedRevision,
  scenarioId: M2A_TRANSFER.scenarioId,
  runId: M2A_TRANSFER.runId,
  resultRoot: M2A_TRANSFER.resultRoot,
  containerRunRoot: M2A_TRANSFER.containerRunRoot,
  initializerContainer: M2A_TRANSFER.initializerContainer,
  measurementContainer: M2A_TRANSFER.measurementContainer,
  transferVolume: M2A_TRANSFER.transferVolume,
  candidateImageTag: M2A_TRANSFER.candidateImageTag,
})) {
  if (manifest[key] !== value) fail(`manifest ${key}`);
}
if (
  manifest.runtimeExecutionApproved !== false ||
  manifest.evidenceReview !== "not-performed"
) {
  fail("manifest evidence gate");
}

const imageId = `sha256:${"a".repeat(64)}`;
const plan = createFixedDockerPlan(imageId);
validateFixedDockerPlan(JSON.parse(JSON.stringify(plan)), imageId);
const inheritedEnvironmentPlan = JSON.parse(JSON.stringify(plan));
Object.setPrototypeOf(inheritedEnvironmentPlan.environment, {
  DOCKER_HOST: "unix:///inherited-forbidden",
});
let inheritedEnvironmentRejected = false;
try {
  validateFixedDockerPlan(inheritedEnvironmentPlan, imageId);
} catch (error) {
  inheritedEnvironmentRejected = error?.message === "M2A_DOCKER_PLAN_INVALID";
}
if (!inheritedEnvironmentRejected) fail("recursive own plan data");
const planBytes = JSON.stringify(plan);
const expectedLifecycle = {
  volumeAbsence: ["volume", "inspect", M2A_TRANSFER.transferVolume],
  initializerAbsence: [
    "container",
    "inspect",
    M2A_TRANSFER.initializerContainer,
  ],
  measurementAbsence: [
    "container",
    "inspect",
    M2A_TRANSFER.measurementContainer,
  ],
  initializerInspectPre: [
    "container",
    "inspect",
    M2A_TRANSFER.initializerContainer,
  ],
  initializerStart: ["start", M2A_TRANSFER.initializerContainer],
  initializerWait: ["wait", M2A_TRANSFER.initializerContainer],
  initializerInspectFinal: [
    "container",
    "inspect",
    M2A_TRANSFER.initializerContainer,
  ],
  measurementInspectPre: [
    "container",
    "inspect",
    M2A_TRANSFER.measurementContainer,
  ],
  measurementStart: ["start", M2A_TRANSFER.measurementContainer],
  measurementWait: ["wait", M2A_TRANSFER.measurementContainer],
  measurementInspectFinal: [
    "container",
    "inspect",
    M2A_TRANSFER.measurementContainer,
  ],
};
const hostRoot = "experiments/npm12-install/.work/m2a-transfer-20260721-01";
if (
  plan.executable !== "/usr/bin/docker" ||
  plan.shell !== false ||
  plan.executionApproved !== false ||
  plan.combinedOutputLimitBytes !== 16_384 ||
  plan.commandDeadlineMs !== 30_000 ||
  plan.initializerWaitDeadlineMs !== 30_000 ||
  plan.measurementAbsoluteDeadlineMs !== 180_000 ||
  JSON.stringify(plan.environment) !==
    JSON.stringify({
      DOCKER_CONFIG: `${hostRoot}/docker-config`,
      HOME: `${hostRoot}/home`,
      PATH: "/usr/bin:/bin",
    }) ||
  plan.inheritEnvironment !== false ||
  JSON.stringify(plan.forbiddenInheritedEnvironmentPrefixes) !==
    JSON.stringify(["DOCKER_"]) ||
  plan.hostLayoutPolicy.repositoryRelativeWorkRoot !== hostRoot ||
  plan.hostLayoutPolicy.directoryCreation !== "exclusive" ||
  plan.hostLayoutPolicy.directories.length !== 2 ||
  plan.hostLayoutPolicy.directories.some(
    (entry) =>
      entry.type !== "directory" ||
      entry.mode !== 0o700 ||
      entry.owner !== "effective-user" ||
      entry.symlink !== false ||
      entry.empty !== true,
  ) ||
  Object.entries(expectedLifecycle).some(
    ([key, argv]) => JSON.stringify(plan[key]) !== JSON.stringify(argv),
  ) ||
  !plan.initializerCreate.includes("0:0") ||
  !plan.measurementCreate.includes("1000:1000") ||
  plan.measurementCreate.includes("--volume") ||
  !plan.measurementCreate.includes("--pull") ||
  !plan.measurementCreate.includes("never") ||
  !plan.measurementCreate.includes("--network") ||
  !plan.measurementCreate.includes("none") ||
  /\*|\.\.|--volume|type=bind|\b(?:exec|logs|attach|restart|remove|rm|kill|stop|export|commit)\b/u.test(
    planBytes,
  )
) {
  fail("fixed command plan");
}

const constructionPlan = createFixedConstructionPlan();
validateFixedConstructionPlan(globalThis.structuredClone(constructionPlan));
const imageBuildPlan = createFixedImageBuildPlan();
validateFixedImageBuildPlan(globalThis.structuredClone(imageBuildPlan));
const productionPlan = createFixedProductionExecutionPlan(imageId);
validateFixedProductionExecutionPlan(
  globalThis.structuredClone(productionPlan),
  imageId,
);
const absenceRows = [
  {
    step: "absence-volume",
    argv: ["volume", "inspect", M2A_TRANSFER.transferVolume],
  },
  {
    step: "absence-initializer-container",
    argv: ["container", "inspect", M2A_TRANSFER.initializerContainer],
  },
  {
    step: "absence-measurement-container",
    argv: ["container", "inspect", M2A_TRANSFER.measurementContainer],
  },
];
if (
  M2A_CONSTRUCTION.sourceInputs.length !== 31 ||
  M2A_CONSTRUCTION.constructionInputs.length !== 41 ||
  M2A_CONSTRUCTION.reviewedAcquisitionReceiptSha256 !== null ||
  M2A_CONSTRUCTION.reviewedToolchainReceiptSha256 !== null ||
  M2A_PRODUCTION.buildExecutionApproved !== false ||
  M2A_PRODUCTION.runtimeExecutionApproved !== false ||
  M2A_PRODUCTION.reviewedLocalImageId !== null ||
  JSON.stringify(productionPlan.absenceRows) !== JSON.stringify(absenceRows) ||
  imageBuildPlan.commands.length !== 5 ||
  imageBuildPlan.commands.filter((row) => row.stepId === "offline-build")
    .length !== 1 ||
  !JSON.stringify(imageBuildPlan).includes('"--network","none"') ||
  !JSON.stringify(imageBuildPlan).includes('"--pull=false"') ||
  JSON.stringify(imageBuildPlan).includes('"login"') ||
  JSON.stringify(imageBuildPlan).includes('"push"') ||
  constructionPlan.retry !== false ||
  constructionPlan.cleanup !== false ||
  productionPlan.retry !== false ||
  productionPlan.cleanup !== false
) {
  fail("construction and production plans");
}

const npmRequestPlan = createFixedNpmRequestPlan();
if (
  M2A_INPUTS.generation !== "20260721-01" ||
  M2A_INPUTS.npmVersion !== "12.0.1" ||
  M2A_INPUTS.sourceAggregate !== M2A_CONSTRUCTION.sourceAggregate ||
  M2A_INPUTS.constructionBaselineAggregate !==
    M2A_CONSTRUCTION.constructionBaselineAggregate ||
  M2A_INPUTS.evidenceReview !== "not-performed" ||
  validateFixedNpmRequestPlan(structuredClone(npmRequestPlan)) !==
    npmRequestPlan ||
  npmRequestPlan.length !== 2 ||
  npmRequestPlan[0].id !== "metadata" ||
  npmRequestPlan[1].id !== "tarball" ||
  npmRequestPlan.some(
    (request) =>
      request.hostname !== "registry.npmjs.org" ||
      request.port !== 443 ||
      request.servername !== "registry.npmjs.org" ||
      request.rejectUnauthorized !== true ||
      request.minVersion !== "TLSv1.2" ||
      request.agent !== false ||
      request.absoluteDeadlineMs !== 30_000 ||
      request.destroyGraceMs !== 250 ||
      request.closeDeadlineMs !== 1_000,
  )
) {
  fail("dependency-input fixed request boundary");
}
for (const { step } of absenceRows) {
  const checkpoint = JSON.parse(
    createPessimisticAttemptCheckpointBytes(imageId, step).toString("utf8"),
  );
  if (
    checkpoint.issues.length !== 1 ||
    checkpoint.issues[0].code !== "M2A_SETTLEMENT_UNKNOWN" ||
    checkpoint.issues[0].step !== step ||
    checkpoint.initializerSettlement !== "not-started" ||
    checkpoint.measurementSettlement !== "not-started"
  ) {
    fail("absence checkpoint identity");
  }
}

const productionEntrySources = [
  constructorEntrySource,
  imageBuildEntrySource,
  executionEntrySource,
];
if (
  productionEntrySources.some(
    (source) =>
      !source.includes("process.argv.length !== 2") ||
      !source.includes("Object.getOwnPropertyDescriptors(process.env)") ||
      !source.includes(
        "Reflect.ownKeys(environmentDescriptors).length !== 0",
      ) ||
      !source.includes(
        "import.meta.url === pathToFileURL(process.argv[1]).href",
      ),
  ) ||
  !constructionSource.includes("constants.O_NOFOLLOW") ||
  !constructionSource.includes("Promise.allSettled") ||
  !constructionSource.includes("M2A_CONSTRUCTION_FAKE_REQUIRED") ||
  !constructionSource.includes("familyCounts.some((count) => count !== 1)") ||
  !constructionSource.includes("validateConstructionContextInputs") ||
  !constructionSource.includes("secondDerivedInventory") ||
  !constructionSource.includes("createHeldConstructionInputRegistry") ||
  !constructionSource.includes(
    'row.logicalPath === "runtime/constructor-node"',
  ) ||
  !constructionSource.includes(
    "assertSuccessfulFixedCompilerTerminal(probeTerminal)",
  ) ||
  !constructionSource.includes(
    "assertSuccessfulFixedCompilerTerminal(lifecycleTerminal)",
  ) ||
  !constructionSource.includes("const startFinalCloseBound =") ||
  !constructionSource.includes("createM2aPrivateProcessSettlementState") ||
  !constructionSource.includes("createFakeM2aProcessTrace") ||
  !constructionSource.includes("createFixedConstructionAuthority") ||
  !constructionSource.includes("fixedConstructionAuthorityBrand.has") ||
  !constructionSource.includes("parseNpmArchive") ||
  !constructionSource.includes(
    "same-descriptor-write-read-sync-close-rename",
  ) ||
  !productionSource.includes("M2A_IMAGE_BUILD_FAKE_REQUIRED") ||
  !productionSource.includes("M2A_PRODUCTION_FAKE_REQUIRED") ||
  !productionSource.includes("validateImageBuildStepValue") ||
  !productionSource.includes("holdProductionDirectory") ||
  !productionSource.includes("exactProductionDirectoryInventory") ||
  !productionSource.includes("assertProductionDirectoryTransition") ||
  !productionSource.includes("assertDirectoryChildTransition") ||
  !productionSource.includes("completeHeldProductionDirectoryTransition") ||
  !productionSource.includes("completeHeldProductionNestedMarkerTransition") ||
  !productionSource.includes("createFakeM2aHeldDirectoryTrace") ||
  !productionSource.includes('kind: "create-attempt-next"') ||
  !productionSource.includes('kind: "rename-attempt-next"') ||
  !productionSource.includes('kind: "create-completion-copy"') ||
  !productionSource.includes('kind: "create-segment-copy"') ||
  !productionSource.includes('kind: "create-probe-output"') ||
  !productionSource.includes('kind: "create-nested-marker"') ||
  productionSource.includes("held.children = after.children") ||
  productionSource.includes("allowInventoryMutation") ||
  !productionSource.includes("resultIdentity.handle.sync()") ||
  !productionSource.includes("transferIdentity.handle.sync()") ||
  !productionSource.includes("settleOwnership") ||
  !productionSource.includes("const startFinalCloseBound =") ||
  !productionSource.includes("createFixedImageBuildAuthority") ||
  !productionSource.includes("fixedImageBuildAuthorityBrand.has") ||
  !productionSource.includes("createFixedRuntimeAuthority") ||
  !productionSource.includes("fixedRuntimeAuthorityBrand.has") ||
  !productionSource.includes("validateImageBuildObservation(observation)") ||
  !productionSource.includes("validateImageBindingBytes(") ||
  !productionSource.includes("validateCompletionArtifacts(") ||
  !productionSource.includes("validateCandidateTransfer(") ||
  !productionSource.includes("prepareMarkerParent") ||
  !productionSource.includes("createPessimisticAttemptCheckpointBytes") ||
  !productionSource.includes("checkpoint:${step}") ||
  !productionSource.includes("M2A_SETTLEMENT_UNKNOWN") ||
  !constructionDeclarations.includes("FakeM2aConstructionBackend") ||
  !constructionDeclarations.includes("FakeM2aProcessTrace") ||
  !productionDeclarations.includes("FakeM2aProductionBackend") ||
  !productionDeclarations.includes("FakeM2aHeldDirectoryTrace") ||
  !productionDeclarations.includes("FakeM2aHeldChildIdentity") ||
  !productionDeclarations.includes("FakeM2aHeldDirectoryOperation") ||
  constructionDeclarations.includes("createM2aPrivateProcessSettlementState") ||
  constructionDeclarations.includes("createFixedConstructionAuthority") ||
  productionDeclarations.includes("createFixedImageBuildAuthority") ||
  productionDeclarations.includes("createFixedRuntimeAuthority") ||
  !constructionImplementationPrompt.includes(
    "Docker-free static/unit boundary",
  ) ||
  !constructionReviewPrompt.includes(
    "fresh independent Docker-free read-only review",
  ) ||
  !privateAuthorityRemediationPrompt.includes(
    "M2A-CGI04 process first-cause settlement",
  ) ||
  !privateAuthorityReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  ) ||
  !unchangedChildRemediationPrompt.includes("strict subset of") ||
  !unchangedChildReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  ) ||
  /https?:\/\//u.test(`${constructionSource}\n${productionSource}`)
) {
  fail("construction production source boundary");
}

const npmEntryWeakeningVariants = [
  ["exec-path", 'process.execPath !== "/usr/bin/node" ||', "false ||"],
  ["original-argv-zero", 'process.argv0 !== "/usr/bin/node" ||', "false ||"],
  ["argv-length", "process.argv.length !== 2 ||", "process.argv.length < 2 ||"],
  ["canonical-argv-zero", 'process.argv[0] !== "/usr/bin/node" ||', "false ||"],
  ["canonical-argv-one", "process.argv[1] !== entryPath ||", "false ||"],
  ["repository-cwd", "process.cwd() !== expectedRepositoryRoot ||", "false ||"],
  [
    "empty-environment",
    "Reflect.ownKeys(environmentDescriptors).length !== 0",
    "false",
  ],
].map(([label, expected, replacement]) => {
  if (!acquisitionEntrySource.includes(expected)) {
    fail(`npm acquisition entry inverse source ${label}`);
  }
  return acquisitionEntrySource.replace(expected, replacement);
});
const npmEntryGuardMovedAfterProducer = acquisitionEntrySource.replace(
  `${NPM_ENTRY_GUARD}\n  await runFixedNpmAcquisitionEntry();`,
  `  await runFixedNpmAcquisitionEntry();\n${NPM_ENTRY_GUARD}`,
);
const directoryFunctionStart =
  "async function createHeldDirectoryChild(parentPath, childName) {";
const directoryFunctionEnd = "\n\nasync function publishFileTransaction(";
const publicationFunctionStart = "async function publishFileTransaction(";
const publicationFunctionEnd = "\n\nfunction requestProductionBytes(";
const acquisitionFunctionStart =
  "export async function runFixedNpmAcquisitionEntry() {";
const acquisitionFunctionEnd = "\n\nfunction heldDirectorySnapshotSync(";
const inputLinkWeakeningVariants = [
  replaceWithinExactFunction(
    inputLibrarySource,
    directoryFunctionStart,
    directoryFunctionEnd,
    "added.identity.links < 1 ||",
    "",
  ),
  replaceWithinExactFunction(
    inputLibrarySource,
    directoryFunctionStart,
    directoryFunctionEnd,
    "added.identity.links < 1 ||",
    "added.identity.links !== 1 ||",
  ),
  replaceWithinExactFunction(
    inputLibrarySource,
    publicationFunctionStart,
    publicationFunctionEnd,
    "created.identity.links !== 1 ||",
    "created.identity.links < 1 ||",
  ),
  replaceWithinExactFunction(
    inputLibrarySource,
    publicationFunctionStart,
    publicationFunctionEnd,
    "finalIdentity.links !== 1 ||",
    "finalIdentity.links < 1 ||",
  ),
  replaceWithinExactFunction(
    inputLibrarySource,
    acquisitionFunctionStart,
    acquisitionFunctionEnd,
    "identity.links !== 1 ||",
    "identity.links < 1 ||",
  ),
];
if (
  !validatesExactNpmEntryBoundary(acquisitionEntrySource) ||
  npmEntryWeakeningVariants.some(validatesExactNpmEntryBoundary) ||
  validatesExactNpmEntryBoundary(npmEntryGuardMovedAfterProducer) ||
  !validatesInputLinkBoundaries(inputLibrarySource) ||
  inputLinkWeakeningVariants.some(validatesInputLinkBoundaries) ||
  ![1, 2, Number.MAX_SAFE_INTEGER].every((links) => links >= 1) ||
  [0, -1].some((links) => links >= 1) ||
  !toolchainEntrySource.includes("process.argv.length !== 2") ||
  !toolchainEntrySource.includes(
    "Object.getOwnPropertyDescriptors(process.env)",
  ) ||
  !toolchainEntrySource.includes(
    "Reflect.ownKeys(environmentDescriptors).length !== 0",
  ) ||
  !toolchainEntrySource.includes(
    "import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href",
  ) ||
  !inputLibrarySource.includes("const fakeNpmBackendBrand = new WeakSet()") ||
  !inputLibrarySource.includes(
    "const fakeToolchainBackendBrand = new WeakSet()",
  ) ||
  !inputLibrarySource.includes("function compareExactOwnData(") ||
  !inputLibrarySource.includes("types.isProxy(value)") ||
  !inputLibrarySource.includes("function createAttemptRootSynchronously()") ||
  !inputLibrarySource.includes("mkdirSync(TOOLCHAIN_ATTEMPT_ROOT") ||
  !inputLibrarySource.includes(
    "function validateAttemptRootCommitTransition(",
  ) ||
  !inputLibrarySource.includes("function validateAttemptParentSync(") ||
  (inputLibrarySource.match(/validateAttemptParentSync\(/gu) ?? []).length !==
    3 ||
  (inputLibrarySource.match(/parentSynced: parentSync\.parentSynced/gu) ?? [])
    .length !== 2 ||
  !inputLibrarySource.includes("function isCanonicalNonnegativeDecimal(") ||
  !inputLibrarySource.includes("mode: Number(stat.mode & 0o7777n)") ||
  !inputLibrarySource.includes("device: stat.dev.toString()") ||
  !inputLibrarySource.includes("inode: stat.ino.toString()") ||
  !inputLibrarySource.includes("size: stat.size.toString()") ||
  !inputLibrarySource.includes("mtimeNs: stat.mtimeNs.toString()") ||
  /device:\s*Number\s*\(\s*stat\.dev\s*\)/u.test(inputLibrarySource) ||
  /inode:\s*Number\s*\(\s*stat\.ino\s*\)/u.test(inputLibrarySource) ||
  /size:\s*Number\s*\(\s*stat\.size\s*\)/u.test(inputLibrarySource) ||
  /mtimeNs:\s*Number\s*\(\s*stat\.mtimeNs\s*\)/u.test(inputLibrarySource) ||
  (inputLibrarySource.match(/validateAttemptRootCommitTransition\(/gu) ?? [])
    .length < 3 ||
  !inputLibrarySource.includes("function publishInitialAttempt(") ||
  !inputLibrarySource.includes("fsyncSync(authority.parentFd)") ||
  inputLibrarySource.includes("await syncDirectory(WORK_ROOT)") ||
  !inputLibrarySource.includes("function validateRuntimeProjection(") ||
  (inputLibrarySource.match(/validateRuntimeProjection\(/gu) ?? []).length <
    3 ||
  !inputLibrarySource.includes(
    "function validateRuntimeInventoryProjection(",
  ) ||
  !inputLibrarySource.includes("constants.O_NOFOLLOW") ||
  !inputLibrarySource.includes("validateHeldGraphPair") ||
  !inputLibrarySource.includes("validateDestinationGraph") ||
  !inputLibrarySource.includes("createToolchainAttemptBytes") ||
  !inputLibrarySource.includes("M2A_TOOLCHAIN_INITIAL_CREATE_INVALID") ||
  !inputLibrarySource.includes('evidenceReview: "not-performed"') ||
  inputLibrarySource.includes("process.env") ||
  !inputDeclarations.includes("FakeM2aNpmInputBackend") ||
  !inputDeclarations.includes("FakeM2aToolchainInputBackend") ||
  !inputDeclarations.includes("runFixedNpmAcquisitionEntry") ||
  !inputDeclarations.includes("runFixedToolchainCaptureEntry") ||
  constructionSource.includes("m2a-transfer-inputs.mjs") ||
  productionSource.includes("m2a-transfer-inputs.mjs") ||
  transferTestSource.includes(
    'from "../experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs"',
  ) ||
  transferTestSource.includes(
    'from "../experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs"',
  ) ||
  !dependencyInputImplementationPrompt.includes(
    "bounded Docker-free frozen-research issue #43",
  ) ||
  !dependencyInputReviewPrompt.includes(
    "fresh independent Docker-free read-only review",
  ) ||
  !dependencyInputRemediationPrompt.includes(
    "Remediate only M2A-IBI01 and M2A-IBI02",
  ) ||
  !dependencyInputRemediationReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  ) ||
  !dependencyInputResidualRemediationPrompt.includes(
    "residual M2A-IBI01 parent-sync and",
  ) ||
  !dependencyInputResidualRemediationReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  ) ||
  !dependencyInputIdentityVerificationRemediationPrompt.includes(
    "M2A-IBI01R01 exact-key-shape behavior",
  ) ||
  !dependencyInputIdentityVerificationRemediationReviewPrompt.includes(
    "M2A-IBI01R02 decision",
  ) ||
  !transferTestSource.includes(
    "consumes an exact own-data parent-sync fact before checkpoint publication",
  ) ||
  !transferTestSource.includes(
    "rejects malformed exact-key-shape attempt identities before checkpoint publication",
  ) ||
  !transferTestSource.includes("malformedAttemptIdentities") ||
  !transferTestSource.includes('label: "missing"') ||
  !transferTestSource.includes('label: "extra"') ||
  !transferTestSource.includes('label: "reordered"') ||
  !transferTestSource.includes('label: "inherited"') ||
  !transferTestSource.includes('label: "accessor"') ||
  !transferTestSource.includes('label: "symbol"') ||
  !transferTestSource.includes('label: "proxy"') ||
  !transferTestSource.includes("expect(accessorCalls).toBe(0)") ||
  !transferTestSource.includes("expect(proxyTrapCalls).toBe(0)") ||
  !transferTestSource.includes("9007199254740993") ||
  !transferTestSource.includes(
    "rejects every held attempt parent and child correlation contradiction",
  ) ||
  !transferTestSource.includes(
    "rejects the complete synthetic runtime projection and inventory inverse",
  ) ||
  !transferTestSource.includes(
    "rejects every package family source tuple and traversal contradiction",
  ) ||
  !transferTestSource.includes(
    "rejects every final destination graph contradiction",
  ) ||
  !transferTestSource.includes(
    "enforces family modes and positive package sizes at the actual constructor consumer",
  )
) {
  fail("dependency-input source and import boundary");
}

if (
  !containerfile.includes(
    "node:24.18.0-bookworm-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5",
  ) ||
  !containerfile.includes(
    'CMD ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"]',
  ) ||
  /\bRUN\b/u.test(containerfile) ||
  /https?:\/\//u.test(containerfile)
) {
  fail("offline non-executed Containerfile");
}
if (
  !initializerSource.includes("process.argv.length !== 2") ||
  initializerSource.includes("process.env") ||
  !initializerSource.includes("(await readdir(RUN_ROOT)).length !== 0") ||
  !initializerSource.includes("constants.O_NOFOLLOW") ||
  !initializerSource.includes("await handles.root.sync()") ||
  !initializerSource.includes("async function closeHandles(handles, keys)") ||
  initializerSource.includes(".close().catch") ||
  initializerSource.includes("catch(() => undefined)") ||
  !runnerSource.includes("process.argv.length !== 2") ||
  runnerSource.includes("process.env") ||
  !runnerSource.includes("shell: false") ||
  !runnerSource.includes('server.listen(37_001, "127.0.0.1"') ||
  !runnerSource.includes("await publishCompletion(completion)") ||
  !runnerSource.includes(
    "await validateReadyRecord(prePublicationDescriptors)",
  ) ||
  !runnerSource.includes("await allAbsent([SEGMENT_PATH, MARKER_PATH])") ||
  !runnerSource.includes("constants.O_NOFOLLOW") ||
  !runnerSource.includes("async function closeHandles(handles, keys)") ||
  !runnerSource.includes("function isSuccessfulNpmTerminal(result)") ||
  !runnerSource.includes("function createPrePublicationDescriptorTracker()") ||
  !runnerSource.includes("async function awaitAllSettledOwnership(branches)") ||
  !runnerSource.includes(
    "const results = await Promise.allSettled(branches)",
  ) ||
  !runnerSource.includes(
    "const prePublicationDescriptorsClosed = prePublicationDescriptors.allClosed()",
  ) ||
  !runnerSource.includes("prePublicationDescriptorsClosed,") ||
  runnerSource.includes("descriptorsClosed,") ||
  !runnerSource.includes("result.signal === null") ||
  !runnerSource.includes("result.timedOut === false") ||
  !runnerSource.includes("result.stdoutTruncated === false") ||
  !runnerSource.includes("result.stderrTruncated === false") ||
  runnerSource.includes(".close().catch") ||
  runnerSource.includes("catch(() => undefined)") ||
  (runnerSource.match(/await awaitAllSettledOwnership\(\[/gu) ?? []).length !==
    2 ||
  runnerSource.indexOf("prePublicationDescriptors.allClosed()") <
    runnerSource.lastIndexOf("captureOutput(") ||
  runnerSource.indexOf("await publishCompletion(completion)") >
    runnerSource.indexOf("return issue === null ? 0 : 70") ||
  runnerSource.includes("OUTPUT_BUNDLE_PREFIX") ||
  runnerSource.includes("process.stdout") ||
  runnerSource.includes("process.stderr") ||
  /https?:\/\//u.test(`${initializerSource}\n${runnerSource}`)
) {
  fail("fixed container sources");
}
if (
  librarySource.includes("node:child_process") ||
  librarySource.includes("spawn(") ||
  librarySource.includes("exec(") ||
  librarySource.includes("process.env") ||
  librarySource.includes("process.argv") ||
  !librarySource.includes("M2A_FAKE_BACKEND_REQUIRED") ||
  !librarySource.includes("M2A_DOCKER_PLAN_INVALID") ||
  !librarySource.includes(
    "function compareExactOwnData(value, expected, code)",
  ) ||
  !librarySource.includes("export function validateCandidateTransfer(") ||
  !librarySource.includes("M2A_CANDIDATE_TRANSFER_INVALID") ||
  !librarySource.includes("M2A_COMPLETION_EXIT_MISMATCH") ||
  !librarySource.includes("attempt.issues.length > 1") ||
  !declarationsSource.includes("validateFixedDockerPlan") ||
  !declarationsSource.includes("validateCandidateTransfer") ||
  !declarationsSource.includes("FakeM2aTransferBackend")
) {
  fail("pure library and fake-only backend");
}

const scripts = rootPackage.scripts ?? {};
if (
  scripts["m2a:transfer:static"] !==
    "node experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs" ||
  scripts["m2a:transfer:test"] !==
    "vitest run tests/m2a-evidence-transfer.test.ts --configLoader runner" ||
  scripts["m2a:transfer:verify"] !==
    "npm run m2a:transfer:static && npm run m2a:transfer:test" ||
  Object.keys(scripts).some(
    (key) =>
      key.startsWith("m2a:transfer:") &&
      ![
        "m2a:transfer:static",
        "m2a:transfer:test",
        "m2a:transfer:verify",
      ].includes(key),
  ) ||
  Object.values(scripts).some(
    (command) =>
      typeof command === "string" &&
      [
        "construct-m2a-transfer-context.mjs",
        "build-m2a-transfer-image.mjs",
        "execute-m2a-transfer.mjs",
        "acquire-m2a-transfer-npm.mjs",
        "capture-m2a-transfer-toolchain.mjs",
      ].some((entry) => command.includes(entry)),
  )
) {
  fail("verification-only root reachability");
}
if (
  !implementationPrompt.includes("Do not build an image") ||
  !reviewPrompt.includes("fresh independent Docker-free read-only") ||
  !remediationPrompt.includes("M2A-TRI01 through M2A-TRI04") ||
  !remediationReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  ) ||
  !residualRemediationPrompt.includes("M2A-TRR01 through M2A-TRR03") ||
  !residualRemediationReviewPrompt.includes(
    "fresh independent Docker-free read-only re-review",
  )
) {
  fail("saved prompt boundary");
}

process.stdout.write(
  "M2-A transfer static/unit boundary verified (Docker, lifecycle, transfer, and result access not run)\n",
);
