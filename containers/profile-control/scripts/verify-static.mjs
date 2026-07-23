import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import ts from "typescript";

const controlRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(controlRoot, "../..");

function fail(message) {
  throw new Error(`M4 static verification failed: ${message}`);
}

async function text(relativePath) {
  return readFile(path.join(controlRoot, relativePath), "utf8");
}

if (process.argv.length !== 2) fail("arguments are not accepted");

const sourceNames = (await readdir(path.join(controlRoot, "src")))
  .filter((name) => name.endsWith(".ts"))
  .sort();
const sourceEntries = await Promise.all(
  sourceNames.map(async (name) => [name, await text(`src/${name}`)]),
);
const sources = Object.fromEntries(sourceEntries);
const allSource = sourceEntries.map(([, source]) => source).join("\n");
const activationBasename = "frozen-research-profile-control-entry";
const activationExecutorBasename = "frozen-research-profile-control-executor";
const exactActivationSource = `import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { parseOrchestratorArguments } from "./orchestrator.js";
import {
  runFixedProductionControls,
  serializeCanonicalPairExecutionResult,
} from "./run-controls.js";

try {
  if (parseOrchestratorArguments(process.argv.slice(2)) !== "run-controls") {
    throw new Error("M4_CONTROL_OPERATION");
  }
  const result = await runFixedProductionControls();
  process.stdout.write(serializeCanonicalPairExecutionResult(result));
  process.exitCode = result.validity === "complete" ? 0 : 1;
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_CONTROL_EXECUTION_FAILED";
  process.stderr.write(\`\${code}\\n\`);
  process.exitCode = 1;
}
`;
const exactSourceModules = [
  "canonical",
  "completion",
  "constants",
  "control-host-backend",
  "definitions",
  "docker-formats",
  "docker-plan",
  "errors",
  "evidence",
  "execution",
  "filesystem-identity",
  activationBasename,
  "image-input",
  "inspect",
  "offline-build-process",
  "orchestrator",
  "profile-input",
  "run-controls",
  "safe-data",
  "staging",
  "types",
  "validation",
];
const exactExecutableModules = exactSourceModules.filter(
  (name) => name !== "types",
);
const issue46SourceAllowlist = new Set([
  "safe-data",
  "canonical",
  "completion",
  "definitions",
  "docker-plan",
  "doctor",
  "evidence",
  "execution",
  "image-input",
  "inspect",
  "offline-build-process",
  "offline-build",
  "offline-build-recovery",
  "orchestrator",
  "profile-input",
  "run-controls",
  "staging",
  "types",
  "validation",
]);
const historicalUnchangedSourceIdentities = Object.freeze({
  constants: Object.freeze([
    4_635,
    "60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65",
  ]),
  "control-host-backend": Object.freeze([
    39_867,
    "a37baa7dd651a1346c9f38b6116a38a7ddc0c4e33f83f4ceae3d804c6bfd646f",
  ]),
  "docker-formats": Object.freeze([
    2_519,
    "6f24020cdd1a54b9fa8abfbee665babf99fc3a0a0240f7892b5b924f7c945725",
  ]),
  errors: Object.freeze([
    369,
    "d4e96236380e93154e8c9e1cb70680bb731fb67e28fbe9c0ba37594ca38de709",
  ]),
  "filesystem-identity": Object.freeze([
    25_227,
    "1dad4648451daaf3681a1eb07a196f6c361513e75f63a0eff94ebe665a67abf1",
  ]),
  [activationBasename]: Object.freeze([
    774,
    "580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d",
  ]),
});
const historicalActivationConstruction = Object.freeze({
  sourceManifest: Object.freeze([
    2_582,
    "d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158",
  ]),
  sourceEdgeManifest: Object.freeze([
    1_789,
    "d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495",
  ]),
  compiledManifest: Object.freeze([
    5_232,
    "04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953",
  ]),
  combinedManifest: Object.freeze([
    7_814,
    "7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec",
  ]),
});
const exactSourceInventory = [
  "canonical.ts",
  "completion.ts",
  "constants.ts",
  "control-host-backend.ts",
  "definitions.ts",
  "docker-formats.ts",
  "docker-plan.ts",
  "doctor-host-backend.ts",
  "doctor.ts",
  "errors.ts",
  "evidence.ts",
  "execution.ts",
  "filesystem-identity.ts",
  `${activationBasename}.ts`,
  `${activationExecutorBasename}.ts`,
  "image-input.ts",
  "index.ts",
  "inspect.ts",
  "offline-build-host-backend.ts",
  "offline-build-process.ts",
  "offline-build-recovery-entry.ts",
  "offline-build-recovery-host-backend.ts",
  "offline-build-recovery.ts",
  "offline-build.ts",
  "orchestrator-entry.ts",
  "orchestrator.ts",
  "profile-input.ts",
  "run-controls.ts",
  "safe-data.ts",
  "staging.ts",
  "types.ts",
  "validation.ts",
];
const exactCompiledInventory = exactSourceInventory
  .flatMap((name) => {
    const basename = name.slice(0, -3);
    return [`${basename}.d.ts`, `${basename}.js`];
  })
  .sort();

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactOrderedSet(label, actual, expected) {
  if (
    actual.length !== expected.length ||
    actual.some((entry, index) => entry !== expected[index])
  ) {
    fail(`activation ${label}`);
  }
}

function moduleBasename(specifier) {
  return path.posix.basename(specifier).replace(/\.(?:d\.)?[cm]?[jt]s$/u, "");
}

function syntaxEdges(source, scriptKind) {
  const file = ts.createSourceFile(
    scriptKind === ts.ScriptKind.TS ? "module.ts" : "module.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const edges = [];
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      fail("activation forbidden loading form");
    }
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        fail("activation computed import");
      }
      const specifier = node.moduleSpecifier.text;
      if (specifier.startsWith("node:")) return;
      if (!specifier.startsWith("./")) {
        fail("activation package import");
      }
      const typeOnly = ts.isImportDeclaration(node)
        ? (node.importClause?.isTypeOnly ?? false) ||
          (node.importClause?.namedBindings !== undefined &&
            ts.isNamedImports(node.importClause.namedBindings) &&
            node.importClause.namedBindings.elements.every(
              (element) => element.isTypeOnly,
            ))
        : node.isTypeOnly;
      edges.push({ target: moduleBasename(specifier), typeOnly });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return edges;
}

async function deriveClosure(directory, extension, scriptKind) {
  const graph = new Map();
  const pending = [activationBasename];
  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined || graph.has(current)) continue;
    const source = await readFile(
      path.join(controlRoot, directory, `${current}.${extension}`),
      "utf8",
    );
    const edges = syntaxEdges(source, scriptKind);
    graph.set(current, edges);
    for (const edge of edges) {
      if (!graph.has(edge.target)) pending.push(edge.target);
    }
  }
  return graph;
}

function graphManifest(graph) {
  return [...graph.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([moduleName, edges]) =>
        `${moduleName}\0${edges
          .map(
            ({ target, typeOnly }) =>
              `${target}:${typeOnly ? "type" : "value"}`,
          )
          .sort()
          .join(",")}\n`,
    )
    .join("");
}

function manifestRow(logicalPath, bytes) {
  return `${logicalPath}\0${bytes.byteLength}\0${sha256(bytes)}\n`;
}

if (
  sources[`${activationBasename}.ts`] !== exactActivationSource ||
  Buffer.byteLength(exactActivationSource) !== 774 ||
  sha256(exactActivationSource) !==
    "580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d"
) {
  fail("activation exact source bytes");
}
exactOrderedSet("source inventory", sourceNames, exactSourceInventory);
const compiledNames = (await readdir(path.join(controlRoot, "dist"))).sort();
exactOrderedSet("compiled inventory", compiledNames, exactCompiledInventory);

const sourceGraph = await deriveClosure("src", "ts", ts.ScriptKind.TS);
exactOrderedSet(
  "source closure",
  [...sourceGraph.keys()].sort(),
  exactSourceModules,
);
const sourceTypeEdges = [...sourceGraph.values()]
  .flat()
  .filter(({ target }) => target === "types");
if (
  sourceTypeEdges.length === 0 ||
  sourceTypeEdges.some(({ typeOnly }) => !typeOnly)
) {
  fail("activation type-only source edge");
}
const sourceEdgeManifest = graphManifest(sourceGraph);
if (
  Buffer.byteLength(sourceEdgeManifest) !== 2_002 ||
  sha256(sourceEdgeManifest) !==
    "b6da821f37515e16405de29b29486b2f9081b6d3d238b2d46207563396852434"
) {
  fail("current issue #46 source edge manifest");
}

const executableGraph = await deriveClosure("dist", "js", ts.ScriptKind.JS);
exactOrderedSet(
  "executable closure",
  [...executableGraph.keys()].sort(),
  exactExecutableModules,
);
if (
  [...executableGraph.values()].flat().some(({ target }) => target === "types")
) {
  fail("activation construction-only types runtime edge");
}
const executableEdgeManifest = graphManifest(executableGraph);
if (
  Buffer.byteLength(executableEdgeManifest) !== 1_528 ||
  sha256(executableEdgeManifest) !==
    "c0c33de9b2b1625625c31d598fd0bf1a904f1207075c4c24c6591b1573042ff3"
) {
  fail("activation executable edge manifest");
}

let sourceManifest = "";
let compiledManifest = "";
for (const moduleName of exactSourceModules) {
  const sourceLogicalPath = `containers/profile-control/src/${moduleName}.ts`;
  const javascriptLogicalPath = `containers/profile-control/dist/${moduleName}.js`;
  const declarationLogicalPath = `containers/profile-control/dist/${moduleName}.d.ts`;
  const sourceBytes = await readFile(
    path.join(repositoryRoot, sourceLogicalPath),
  );
  const unchangedIdentity = historicalUnchangedSourceIdentities[moduleName];
  if (
    unchangedIdentity !== undefined &&
    (sourceBytes.byteLength !== unchangedIdentity[0] ||
      sha256(sourceBytes) !== unchangedIdentity[1])
  ) {
    fail("historical source changed outside issue #46 allowlist");
  }
  if (
    unchangedIdentity === undefined &&
    !issue46SourceAllowlist.has(moduleName)
  ) {
    fail("unclassified current source divergence");
  }
  sourceManifest += manifestRow(sourceLogicalPath, sourceBytes);
  compiledManifest += manifestRow(
    javascriptLogicalPath,
    await readFile(path.join(repositoryRoot, javascriptLogicalPath)),
  );
  compiledManifest += manifestRow(
    declarationLogicalPath,
    await readFile(path.join(repositoryRoot, declarationLogicalPath)),
  );
}
if (
  Buffer.byteLength(sourceManifest) !== 2_585 ||
  sha256(sourceManifest) !==
    "65bd9c122281c8934d603afbd1aca07ca8d56c8a39b4cec12e1511528d76a445" ||
  Buffer.byteLength(compiledManifest) !== 5_232 ||
  sha256(compiledManifest) !==
    "04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953" ||
  Buffer.byteLength(sourceManifest + compiledManifest) !== 7_817 ||
  sha256(sourceManifest + compiledManifest) !==
    "29b8d0710f4dc2d7291e108df0ab0e718c9f7c80655000a0b0b743d0aa5e57cc" ||
  historicalActivationConstruction.sourceManifest[0] !== 2_582 ||
  historicalActivationConstruction.sourceManifest[1] !==
    "d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158" ||
  historicalActivationConstruction.sourceEdgeManifest[0] !== 1_789 ||
  historicalActivationConstruction.sourceEdgeManifest[1] !==
    "d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495" ||
  historicalActivationConstruction.compiledManifest[0] !== 5_232 ||
  historicalActivationConstruction.compiledManifest[1] !==
    "04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953" ||
  historicalActivationConstruction.combinedManifest[0] !== 7_814 ||
  historicalActivationConstruction.combinedManifest[1] !==
    "7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec"
) {
  fail("historical/current activation construction separation");
}

const issue46ProductionModules = [
  "safe-data",
  "canonical",
  "completion",
  "definitions",
  "docker-plan",
  "doctor",
  "evidence",
  "execution",
  "image-input",
  "inspect",
  "offline-build-process",
  "offline-build",
  "offline-build-recovery",
  "orchestrator",
  "profile-input",
  "run-controls",
  "staging",
  "types",
  "validation",
];
exactOrderedSet(
  "issue #46 production allowlist",
  [...issue46SourceAllowlist].sort(),
  [...issue46ProductionModules].sort(),
);
const requiredIssue46IngressFunctions = new Set([
  "readPlainRecord",
  "readPlainArray",
  "snapshotBytes",
  "captureAuthority",
  "validateExecutionProfile",
  "validateControlManifest",
  "validateProfileControlPair",
  "crossValidateProfileManifest",
  "validateApprovedImageInput",
  "validateVersionedImageInput",
  "validateBaseEnvironmentKeys",
  "prepareStagingInput",
  "verifyAcceptedStagingFiles",
  "crossValidateApprovedStaging",
  "createAcceptedImageStagingSnapshot",
  "validateControlEvidence",
  "compareControlEvidence",
  "validateControlCompletion",
  "createControlCompletion",
  "crossValidateCompleteBundle",
  "serializeCanonicalControlManifest",
  "serializeCanonicalControlEvidence",
  "parseCanonicalControlManifestBytes",
  "parseCanonicalControlEvidenceBytes",
  "serializeCanonicalExecutionProfile",
  "parseCanonicalExecutionProfileBytes",
  "validateDockerInspectProjection",
  "validateHostInspection",
  "parseOrchestratorArguments",
  "runApprovedOrchestrator",
  "serializeCanonicalPairExecutionResult",
  "validatePairExecutionResult",
  "createControlManifest",
  "createProfileControlPair",
  "createImageBuildPlan",
  "createProfileDockerPlan",
  "createProfilePairDockerPlans",
  "assertFixedImageBuildPlan",
  "assertFixedProfilePairDockerPlans",
  "createFixedOfflineBuildInput",
  "createFixedOfflineBuildRecoveryInput",
  "executeFixedDoctor",
  "executeFixedProfilePair",
  "executeFixedExistingImageProfilePair",
  "executeFixedOfflineBuild",
  "executeFixedOfflineBuildRecovery",
  "validateOfflineBuildResult",
  "serializeCanonicalOfflineBuildResult",
  "parseCanonicalOfflineBuildResultBytes",
  "validateOfflineBuildRecoveryResult",
  "serializeCanonicalOfflineBuildRecoveryResult",
  "parseCanonicalOfflineBuildRecoveryResultBytes",
  "observeOfflineBuildProcessFailure",
  "observeOfflineBuildProcessOutput",
]);
const actualIssue46Functions = new Set();
for (const moduleName of issue46ProductionModules) {
  const source = sources[`${moduleName}.ts`];
  const file = ts.createSourceFile(
    `${moduleName}.ts`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  function visitIssue46(node) {
    if (ts.isFunctionDeclaration(node) && node.name !== undefined) {
      actualIssue46Functions.add(node.name.text);
    }
    ts.forEachChild(node, visitIssue46);
  }
  visitIssue46(file);
  if (
    moduleName !== "safe-data" &&
    /types\.isUint8Array|instanceof\s+SharedArrayBuffer|Uint8Array\.from/u.test(
      source,
    )
  ) {
    fail("issue #46 byte ingress bypass");
  }
}
for (const functionName of requiredIssue46IngressFunctions) {
  if (!actualIssue46Functions.has(functionName)) {
    fail(`issue #46 ingress missing: ${functionName}`);
  }
}

function namedFunction(moduleName, functionName) {
  const source = sources[`${moduleName}.ts`];
  const file = ts.createSourceFile(
    `${moduleName}.ts`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let match;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      match = node;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (match === undefined) fail(`issue #46 selector missing: ${functionName}`);
  return match;
}

function isExactProfileRejection(expression, parameterName) {
  if (
    !ts.isBinaryExpression(expression) ||
    expression.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken
  ) {
    return false;
  }
  const rejected = new Set();
  for (const comparison of [expression.left, expression.right]) {
    if (
      !ts.isBinaryExpression(comparison) ||
      comparison.operatorToken.kind !==
        ts.SyntaxKind.ExclamationEqualsEqualsToken ||
      !ts.isIdentifier(comparison.left) ||
      comparison.left.text !== parameterName ||
      !ts.isStringLiteral(comparison.right)
    ) {
      return false;
    }
    rejected.add(comparison.right.text);
  }
  return (
    rejected.size === 2 &&
    rejected.has("permissive") &&
    rejected.has("constrained")
  );
}

function containsFailProfile(statement, errorCode) {
  let found = false;
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "failProfile" &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text === errorCode
    ) {
      found = true;
    }
    ts.forEachChild(node, visit);
  }
  visit(statement);
  return found;
}

for (const [moduleName, functionName, errorCode] of [
  ["definitions", "expectedControls", "INVALID_PROFILE"],
  ["docker-plan", "fixedContainerArguments", "INVALID_DOCKER_PLAN"],
]) {
  const selector = namedFunction(moduleName, functionName);
  const parameter = selector.parameters[0]?.name;
  const firstStatement = selector.body?.statements[0];
  if (
    parameter === undefined ||
    !ts.isIdentifier(parameter) ||
    firstStatement === undefined ||
    !ts.isIfStatement(firstStatement) ||
    !isExactProfileRejection(firstStatement.expression, parameter.text) ||
    !containsFailProfile(firstStatement.thenStatement, errorCode)
  ) {
    fail(`issue #46 selector exact rejection: ${functionName}`);
  }
}
for (const moduleName of [
  "doctor",
  "execution",
  "offline-build",
  "offline-build-recovery",
]) {
  const source = sources[`${moduleName}.ts`];
  if (!source.includes("captureAuthority") || source.includes(".bind(")) {
    fail(`issue #46 authority capture: ${moduleName}`);
  }
}

const activationExecutorSource =
  sources[`${activationExecutorBasename}.ts`] ?? "";
const activationExecutorJavascript = await text(
  `dist/${activationExecutorBasename}.js`,
);
const activationExecutorDeclaration = await text(
  `dist/${activationExecutorBasename}.d.ts`,
);
const executionGateContractSource = await readFile(
  path.join(
    repositoryRoot,
    "docs/m4-distinct-activation-object-execution-gate.md",
  ),
  "utf8",
);
const exactExecutorImportPrefix = `import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, type BigIntStats } from "node:fs";
import {
  lstat,
  open,
  readdir,
  realpath,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
`;
const exactExecutorSpecifiers = [
  "node:child_process",
  "node:crypto",
  "node:fs",
  "node:fs/promises",
  "node:path",
  "node:process",
  "node:url",
];
function executorSpecifiers(source, scriptKind) {
  const file = ts.createSourceFile(
    "executor",
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const specifiers = [];
  function visit(node) {
    if (
      (ts.isCallExpression(node) || ts.isNewExpression(node)) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          ["require", "eval", "createRequire", "Function"].includes(
            node.expression.text,
          )) ||
        (ts.isPropertyAccessExpression(node.expression) &&
          ["require", "eval", "createRequire", "getBuiltinModule"].includes(
            node.expression.name.text,
          )) ||
        (ts.isElementAccessExpression(node.expression) &&
          ts.isStringLiteral(node.expression.argumentExpression) &&
          ["require", "eval", "createRequire", "getBuiltinModule"].includes(
            node.expression.argumentExpression.text,
          )))
    ) {
      fail("activation executor forbidden loading form");
    }
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        fail("activation executor computed import");
      }
      specifiers.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return specifiers;
}
if (
  !activationExecutorSource.startsWith(exactExecutorImportPrefix) ||
  Buffer.byteLength(activationExecutorSource) !== 42_865 ||
  sha256(activationExecutorSource) !==
    "80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174" ||
  Buffer.byteLength(activationExecutorJavascript) !== 41_159 ||
  sha256(activationExecutorJavascript) !==
    "ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d" ||
  Buffer.byteLength(activationExecutorDeclaration) !== 1_244 ||
  sha256(activationExecutorDeclaration) !==
    "ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5"
) {
  fail("activation executor construction");
}
for (const requiredTrustBoundary of [
  "final filesystem-reading",
  "descriptor baseline alone",
  "No compiler,",
  "filesystem write, repository mutation",
]) {
  if (!executionGateContractSource.includes(requiredTrustBoundary)) {
    fail(`activation executor trust boundary ${requiredTrustBoundary}`);
  }
}
exactOrderedSet(
  "executor source imports",
  executorSpecifiers(activationExecutorSource, ts.ScriptKind.TS),
  exactExecutorSpecifiers,
);
exactOrderedSet(
  "executor JavaScript imports",
  executorSpecifiers(activationExecutorJavascript, ts.ScriptKind.JS),
  exactExecutorSpecifiers,
);
for (const forbidden of [
  'from "./',
  'from "../',
  "file:",
  "module.createRequire",
  "process.env",
  "20260720-01",
  "/var/run/docker.sock",
]) {
  if (activationExecutorSource.includes(forbidden)) {
    fail(`activation executor forbidden marker ${forbidden}`);
  }
}
for (const required of [
  'spawn(process.execPath, [activationPath, "run-controls"]',
  "env: Object.freeze({})",
  "shell: false",
  "windowsHide: true",
  "detached: true",
  'stdio: ["ignore", "pipe", "pipe"]',
  "TIMEOUT_MS = 90_000",
  "OUTPUT_LIMIT = 65_536",
  "process.kill(-pid, signalName)",
  "ACTIVATION_TIMEOUT",
  "ACTIVATION_OUTPUT_LIMIT",
  "ACTIVATION_PROCESS_FAILURE",
  "CONTROL_RESULT_INVALID",
  "CONTROL_INCONCLUSIVE",
  "M4_ACTIVATION_SPAWN_FAILED\\n",
  "M4_ACTIVATION_IDENTITY_CHANGED\\n",
  "await lease.validate()",
  "await lease.close()",
  "identity-preflight",
  "child-spawned",
  "child-closed",
  "identity-postflight",
  "control-result-validated",
]) {
  if (!activationExecutorSource.includes(required)) {
    fail(`activation executor required marker ${required}`);
  }
}

const exactCompiledDelta = {
  "control-host-backend.d.ts": [
    942,
    "6c47c9ab43b57ad1ff673f6f4e4dead732408f458fa2afbcf08cb647a0ebef1f",
  ],
  "control-host-backend.js": [
    37_690,
    "e4685e4fda539e35ef3bdfb984191fd6fbefc4ee3bab9fffc41635e610a51125",
  ],
  "execution.d.ts": [
    2_364,
    "dc85a74e27a8108f0946326bcec4e9a19f46d13e4819159d72e59e0025b167b9",
  ],
  "execution.js": [
    17_918,
    "3e178ab0293e575b0755f70274eba4248109f19a48b6781b1af6a7c4bf8354ac",
  ],
  "filesystem-identity.d.ts": [
    4_644,
    "a987a326d7659aa49dc69b60b4c744912a141e1f6c6892641e2296a9263a6daa",
  ],
  "filesystem-identity.js": [
    22_909,
    "a6692c54e71a4d3b54ed8f29f66b40cdc2a1eb8fc1d5f1660fe5c439c4453385",
  ],
  [`${activationBasename}.d.ts`]: [
    11,
    "8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881",
  ],
  [`${activationBasename}.js`]: [
    788,
    "34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7",
  ],
  "offline-build-host-backend.js": [
    37_593,
    "13d617a5ae1637e1a48723ffda962ab831e5737cb52bf6fb7ad84fe73b36d6c0",
  ],
  "offline-build-recovery-host-backend.d.ts": [
    2_938,
    "194b13f397c87d6add1399e1137fe9809b83eb9f757ca691576ef5277b735c49",
  ],
  "offline-build-recovery-host-backend.js": [
    16_102,
    "6abcb89d9bcfa24fa21d8ced0919e2c8f7cc058fe89475bd441b6fd910147cd3",
  ],
  "run-controls.js": [
    7_457,
    "e53ec9ecf25c020a138aecd3ca4e5c1b6363e553591f1056c118daf88eeb020d",
  ],
  "types.d.ts": [
    9_768,
    "e5485ee736d5b42ad81258a2f8e7a8dfb75d27d3ae2ec1ee757108142adc13cd",
  ],
};
for (const [name, [byteLength, hash]] of Object.entries(exactCompiledDelta)) {
  const bytes = await readFile(path.join(controlRoot, "dist", name));
  if (bytes.byteLength !== byteLength || sha256(bytes) !== hash) {
    fail(`activation compiler delta ${name}`);
  }
}

if (ts.version !== "5.9.3") fail("activation TypeScript version");
const buildConfigPath = path.join(controlRoot, "tsconfig.build.json");
const buildConfig = ts.readConfigFile(buildConfigPath, ts.sys.readFile);
if (buildConfig.error !== undefined) fail("activation build configuration");
const parsedBuildConfig = ts.parseJsonConfigFileContent(
  buildConfig.config,
  ts.sys,
  controlRoot,
  undefined,
  buildConfigPath,
);
const inMemoryOutputs = new Map();
const buildProgram = ts.createProgram(
  parsedBuildConfig.fileNames,
  parsedBuildConfig.options,
);
const emitResult = buildProgram.emit(undefined, (fileName, data) => {
  inMemoryOutputs.set(path.basename(fileName), Buffer.from(data, "utf8"));
});
if (
  emitResult.emitSkipped ||
  ts.getPreEmitDiagnostics(buildProgram).length !== 0 ||
  emitResult.diagnostics.length !== 0
) {
  fail("activation in-memory construction diagnostics");
}
exactOrderedSet(
  "in-memory construction inventory",
  [...inMemoryOutputs.keys()].sort(),
  exactCompiledInventory,
);
const currentIssue46OutputDivergences = [];
for (const outputName of exactCompiledInventory) {
  const actual = await readFile(path.join(controlRoot, "dist", outputName));
  const expected = inMemoryOutputs.get(outputName);
  if (
    expected === undefined ||
    expected.byteLength !== actual.byteLength ||
    !expected.equals(actual)
  ) {
    const moduleName = outputName.replace(/\.(?:d\.ts|js)$/u, "");
    if (!issue46SourceAllowlist.has(moduleName)) {
      fail(`activation in-memory construction ${outputName}`);
    }
    currentIssue46OutputDivergences.push(outputName);
  }
}
if (!currentIssue46OutputDivergences.includes("safe-data.js")) {
  fail("issue #46 compile-not-performed boundary");
}
const [
  rootPackageSource,
  rootTsconfigSource,
  rootVitestSource,
  containerfile,
  controlRunner,
  fixedChild,
  versionedImageInputSource,
  permissiveReadme,
  constrainedReadme,
  permissiveProfileSource,
  constrainedProfileSource,
  milestoneSource,
  contractSource,
  exactInputContractSource,
  adrSource,
  implementationPrompt,
  reviewPrompt,
  remediationReviewPrompt,
  inputBindingPrompt,
  inputBindingReviewPrompt,
  exactInputPrompt,
  exactInputReviewPrompt,
  exactInputBackendRemediationPrompt,
  exactInputBackendRemediationReviewPrompt,
  doctorPrompt,
  doctorReviewPrompt,
  doctorRemediationPrompt,
  doctorRemediationReviewPrompt,
  doctorCanonicalBytesRemediationPrompt,
  doctorCanonicalBytesRemediationReviewPrompt,
  offlineBuildPrompt,
  offlineBuildReviewPrompt,
  offlineBuildResultRemediationPrompt,
  offlineBuildResultRemediationReviewPrompt,
  offlineBuildRecoveryPrompt,
  offlineBuildRecoveryReviewPrompt,
  runControlsRemediationPrompt,
  runControlsRemediationReviewPrompt,
] = await Promise.all([
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readFile(path.join(repositoryRoot, "tsconfig.json"), "utf8"),
  readFile(path.join(repositoryRoot, "vitest.config.ts"), "utf8"),
  text("Containerfile"),
  text("fixture/control-runner.mjs"),
  text("fixture/fixed-child.mjs"),
  text("image-input.json"),
  readFile(path.join(repositoryRoot, "profiles/permissive/README.md"), "utf8"),
  readFile(path.join(repositoryRoot, "profiles/constrained/README.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "profiles/permissive/profile.json"),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "profiles/constrained/profile.json"),
    "utf8",
  ),
  readFile(path.join(repositoryRoot, "docs/milestones.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/m4-execution-profiles.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "docs/m4-execution-profiles-exact-input.md"),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "docs/decisions/0001-separate-profile-controls-from-route-evidence.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "prompts/m4-execution-profiles.md"),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-input-binding-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-exact-input-contract.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-exact-input-contract-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-exact-input-backend-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-boundary.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-boundary-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-boundary-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-backend.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-backend-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-result-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-recovery.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-run-controls-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-run-controls-remediation-review.md",
    ),
    "utf8",
  ),
]);

const rootPackage = JSON.parse(rootPackageSource);
const rootTsconfig = JSON.parse(rootTsconfigSource);
const versionedImageInput = JSON.parse(versionedImageInputSource);
if (
  JSON.stringify(rootPackage.workspaces) !== JSON.stringify(["packages/*"]) ||
  rootPackage.engines?.node !== ">=20.18.2 <21" ||
  rootPackage.engines?.npm !== "11.12.1"
) {
  fail("root workspace/toolchain boundary");
}
for (const script of [
  "m4:typecheck",
  "m4:static",
  "m4:test",
  "m4:verify",
  "m4:doctor",
  "m4:build",
  "m4:run:controls",
  "m4:verify:evidence",
]) {
  if (typeof rootPackage.scripts?.[script] !== "string") {
    fail(`missing root script ${script}`);
  }
}
const exactM4Scripts = {
  "m4:typecheck":
    "tsc --project containers/profile-control/tsconfig.json --noEmit",
  "m4:static": "node containers/profile-control/scripts/verify-static.mjs",
  "m4:test":
    "vitest run --config containers/profile-control/vitest.config.ts --configLoader runner",
  "m4:verify": "npm run m4:typecheck && npm run m4:static && npm run m4:test",
  "m4:doctor":
    "tsc --project containers/profile-control/tsconfig.build.json && node containers/profile-control/dist/orchestrator-entry.js doctor",
  "m4:build":
    "tsc --project containers/profile-control/tsconfig.build.json && node containers/profile-control/dist/orchestrator-entry.js build",
  "m4:run:controls":
    "tsc --project containers/profile-control/tsconfig.build.json && node containers/profile-control/dist/orchestrator-entry.js run-controls",
  "m4:verify:evidence":
    "tsc --project containers/profile-control/tsconfig.build.json && node containers/profile-control/dist/orchestrator-entry.js verify",
};
for (const [name, command] of Object.entries(exactM4Scripts)) {
  if (rootPackage.scripts?.[name] !== command) {
    fail(`activation ordinary script ${name}`);
  }
}
if (JSON.stringify(rootPackage.scripts).includes(activationBasename)) {
  fail("activation root-script reachability");
}
const workspaces = (
  await readdir(path.join(repositoryRoot, "packages"), {
    withFileTypes: true,
  })
).filter((entry) => entry.isDirectory());
for (const workspace of workspaces) {
  const workspacePackage = await readFile(
    path.join(repositoryRoot, "packages", workspace.name, "package.json"),
    "utf8",
  );
  if (workspacePackage.includes(activationBasename)) {
    fail(`activation workspace reachability ${workspace.name}`);
  }
}
for (const [sourceName, source] of sourceEntries) {
  if (
    sourceName !== `${activationBasename}.ts` &&
    sourceName !== `${activationExecutorBasename}.ts` &&
    source.includes(activationBasename)
  ) {
    fail(`activation source inbound reference ${sourceName}`);
  }
}
for (const compiledName of exactCompiledInventory) {
  if (
    compiledName.startsWith(`${activationBasename}.`) ||
    compiledName.startsWith(`${activationExecutorBasename}.`)
  ) {
    continue;
  }
  const compiledSource = await readFile(
    path.join(controlRoot, "dist", compiledName),
    "utf8",
  );
  if (compiledSource.includes(activationBasename)) {
    fail(`activation compiled inbound reference ${compiledName}`);
  }
}
for (const ordinaryPath of [
  "src/index.ts",
  "src/orchestrator.ts",
  "src/orchestrator-entry.ts",
  "src/offline-build-recovery-entry.ts",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/orchestrator.js",
  "dist/orchestrator-entry.js",
]) {
  const ordinarySource = await readFile(
    path.join(controlRoot, ordinaryPath),
    "utf8",
  );
  if (
    ordinarySource.includes(activationBasename) ||
    ordinarySource.includes("runFixedProductionControls") ||
    ordinarySource.includes("control-host-backend")
  ) {
    fail(`activation ordinary-entry reachability ${ordinaryPath}`);
  }
}
if (
  !rootTsconfig.include?.includes("containers/profile-control/src/**/*.ts") ||
  !rootTsconfig.include?.includes("containers/profile-control/test/**/*.ts") ||
  !rootVitestSource.includes("containers/profile-control/test/**/*.test.ts")
) {
  fail("root TypeScript/test wiring");
}

const exactInputKeys = [
  "schemaVersion",
  "baseImageName",
  "baseImageDigest",
  "nodeVersion",
  "baseEnvironmentKeys",
  "stagingFiles",
  "stagingDigest",
];
const exactStagingFiles = [
  "Containerfile",
  "fixture/canary.txt",
  "fixture/control-runner.mjs",
  "fixture/fixed-child.mjs",
];
const stagingEvidence = await Promise.all(
  exactStagingFiles.map(async (logicalPath) => {
    const fileBytes = await readFile(path.join(controlRoot, logicalPath));
    return {
      logicalPath,
      byteLength: fileBytes.byteLength,
      sha256: `sha256:${createHash("sha256").update(fileBytes).digest("hex")}`,
    };
  }),
);
const stagingAggregate = `${stagingEvidence
  .map(
    ({ logicalPath, byteLength, sha256 }) =>
      `${logicalPath}\0${byteLength}\0${sha256}`,
  )
  .join("\n")}\n`;
const exactStagingDigest = `sha256:${createHash("sha256")
  .update(stagingAggregate, "utf8")
  .digest("hex")}`;
if (
  JSON.stringify(Object.keys(versionedImageInput)) !==
    JSON.stringify(exactInputKeys) ||
  versionedImageInput.schemaVersion !== "lab-profile-image-input/v1" ||
  versionedImageInput.baseImageName !== "node" ||
  versionedImageInput.baseImageDigest !==
    "sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0" ||
  versionedImageInput.nodeVersion !== "v20.18.2" ||
  JSON.stringify(versionedImageInput.baseEnvironmentKeys) !==
    JSON.stringify(["PATH", "NODE_VERSION", "YARN_VERSION"]) ||
  JSON.stringify(versionedImageInput.stagingFiles) !==
    JSON.stringify(exactStagingFiles) ||
  versionedImageInput.stagingDigest !== exactStagingDigest
) {
  fail("versioned exact image input proposal");
}

if (
  !containerfile.includes("ARG BASE_IMAGE") ||
  !containerfile.includes("FROM ${BASE_IMAGE}") ||
  !containerfile.includes("USER 10001:10001") ||
  !containerfile.includes(
    'ENTRYPOINT ["/usr/local/bin/node", "/opt/m4-control/control-runner.mjs"]',
  ) ||
  /^(?:RUN|ADD)\s/imu.test(containerfile) ||
  /https?:\/\//iu.test(containerfile)
) {
  fail("shared offline Containerfile boundary");
}

for (const forbidden of [
  "Object.keys(process.env)",
  "Object.entries(process.env)",
  "for (const key in process.env)",
  "shell: true",
  "node:https",
  "0.0.0.0",
  "169.254.169.254",
  "/var/run/docker.sock",
  "console.log",
  "console.error",
]) {
  if (controlRunner.includes(forbidden)) {
    fail(`fixture forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "Object.hasOwn(process.env, ENVIRONMENT_KEY)",
  'const ENVIRONMENT_KEY = "PROBE_CANARY_M4_CONTROL"',
  "host: LOOPBACK_HOST",
  'const LOOPBACK_HOST = "127.0.0.1"',
  "execFileAsync(process.execPath, [FIXED_CHILD_PATH]",
  "shell: false",
  "env: {}",
  "flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY",
  'schemaVersion: "lab-profile-control-evidence/v1"',
]) {
  if (!controlRunner.includes(required)) {
    fail(`fixture required marker ${required}`);
  }
}
if (
  !fixedChild.includes('process.stdout.write("m4-fixed-child-v1\\n")') ||
  fixedChild.includes("node:child_process") ||
  /process\.env/u.test(fixedChild)
) {
  fail("fixed child boundary");
}

for (const forbidden of [
  "node:https",
  "shell: true",
  "child_process.exec(",
  "child_process.spawn(",
  "/var/run/docker.sock",
  "host.docker.internal",
  "--privileged",
  "--network=host",
  "--pid=host",
]) {
  if (allSource.includes(forbidden)) {
    fail(`source forbidden marker ${forbidden}`);
  }
}
const dockerPlan = sources["docker-plan.ts"] ?? "";
const dockerFormats = sources["docker-formats.ts"] ?? "";
const canonical = sources["canonical.ts"] ?? "";
const completion = sources["completion.ts"] ?? "";
const execution = sources["execution.ts"] ?? "";
const inspect = sources["inspect.ts"] ?? "";
const indexSource = sources["index.ts"] ?? "";
const orchestrator = sources["orchestrator.ts"] ?? "";
const staging = sources["staging.ts"] ?? "";
const doctor = sources["doctor.ts"] ?? "";
const doctorHostBackend = sources["doctor-host-backend.ts"] ?? "";
const offlineBuild = sources["offline-build.ts"] ?? "";
const offlineBuildHostBackend = sources["offline-build-host-backend.ts"] ?? "";
const offlineBuildProcess = sources["offline-build-process.ts"] ?? "";
const offlineBuildRecovery = sources["offline-build-recovery.ts"] ?? "";
const offlineBuildRecoveryHostBackend =
  sources["offline-build-recovery-host-backend.ts"] ?? "";
const controlHostBackend = sources["control-host-backend.ts"] ?? "";
const profileInput = sources["profile-input.ts"] ?? "";
const runControls = sources["run-controls.ts"] ?? "";
const filesystemIdentity = sources["filesystem-identity.ts"] ?? "";
const activationExecutor = sources[`${activationExecutorBasename}.ts`] ?? "";
const typesSource = sources["types.ts"] ?? "";
for (const [sourceName, source] of sourceEntries) {
  if (
    sourceName !== "doctor-host-backend.ts" &&
    sourceName !== "offline-build-host-backend.ts" &&
    sourceName !== "offline-build-recovery-host-backend.ts" &&
    sourceName !== "control-host-backend.ts" &&
    sourceName !== `${activationExecutorBasename}.ts` &&
    source.includes('from "node:child_process"')
  ) {
    fail(`unexpected host child-process source ${sourceName}`);
  }
}
for (const required of [
  "FIXED_CONTROL_IMAGE_DIGEST",
  "FIXED_PERMISSIVE_RUN_ID",
  "FIXED_CONSTRAINED_RUN_ID",
  "parseCanonicalExecutionProfileBytes",
  "serializeCanonicalExecutionProfile",
  "createFixedProductionControlDefinition",
  "createFixedControlHostBackend",
  "executeFixedExistingImageProfilePair",
  '"profile-control-fixture-root"',
  'path.join(controlRoot, "fixture")',
]) {
  if (!runControls.includes(required) && !profileInput.includes(required)) {
    fail(`run-controls binding marker ${required}`);
  }
}
for (const forbidden of [
  "executeFixedProfilePair(",
  "createImageBuildPlan",
  "stageBuildContext",
  "readBuildContext",
  '"doctor"',
  '"build"',
  '"inspect-image"',
]) {
  if (runControls.includes(forbidden)) {
    fail(`run-controls rebuild marker ${forbidden}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "createFixedControlHostBackend",
  "createControlHostBackend",
  "requireAbsent(input.permissiveLayout.runRoot)",
  "requireAbsent(input.constrainedLayout.runRoot)",
  "command !== expectedCommand",
  "command.executable !== FIXED_DOCKER_EXECUTABLE",
  "env: Object.freeze({",
  "DOCKER_CONFIG: command.environment.DOCKER_CONFIG",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "this.activeChildren.size !== 0",
  "captureFileIdentity",
  "FilesystemIdentityLease",
  "serializeCanonicalControlManifest",
  '"cp"',
  '"/result/control-evidence.json"',
  '"/result/result-marker.txt"',
  '"/scratch/scratch-marker.txt"',
  '"control-evidence.json"',
  '"host-inspection.json"',
  '"completion.json"',
  '"comparison.json"',
  "validateSourceBoundary",
  "sourceIdentity.validateStable",
  "sourceParent.validateStable",
  "this.runAncestorLease.validate()",
  "this.m4RootChildren",
  "transferChildrenBefore",
  "manifestIdentityStable: true",
  "closeObserved",
]) {
  if (!controlHostBackend.includes(required)) {
    fail(`control host backend marker ${required}`);
  }
}
if (
  controlHostBackend.split("await validateSourceBoundary();").length - 1 !==
  2
) {
  fail("control host backend immediate copy boundary count");
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "/var/run/docker.sock",
  '"build"',
  '"image"',
  '"version"',
  "FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID",
]) {
  if (controlHostBackend.includes(forbidden)) {
    fail(`control host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  'export const FIXED_DOCKER_EXECUTABLE = "/usr/bin/docker"',
  '"--pull",\n    "never"',
  '"--network",\n    "none"',
  '"--read-only"',
  '"--ipc",\n    "private"',
  '"--cgroupns",\n    "private"',
  '"--entrypoint",\n    FIXED_NODE_EXECUTABLE',
  '"--cap-drop",\n    "ALL"',
  '"--security-opt",\n    "no-new-privileges"',
  '"--log-driver",\n    "none"',
  '"--runtime",\n    FIXED_CONTAINER_RUNTIME',
  '"--experimental-permission"',
  '"--allow-fs-read=/opt/m4-control,/input,/result,/scratch"',
  '"--allow-fs-write=/opt/m4-control,/result,/scratch"',
  "dst=${FIXED_INPUT_DESTINATION},ro",
  "dst=${FIXED_RESULT_DESTINATION},rw",
  "dst=${FIXED_SCRATCH_DESTINATION}",
  "FIXED_INSPECT_FORMAT",
  "FIXED_IMAGE_ID_FORMAT",
  "FIXED_RUNTIME_VERSION_FORMAT",
]) {
  if (!dockerPlan.includes(required)) fail(`Docker plan marker ${required}`);
}
for (const required of [
  '"runtime-version"',
  '"base-image-identity"',
  '"base-environment-keys"',
  '"version",\n        "--format"',
  '"image",\n        "inspect"',
  "FIXED_BASE_IMAGE_TAG",
  "FIXED_RUNTIME_VERSION_FORMAT",
  "assertCanonicalJsonBytes",
  "canonicalEncoder.encode",
  "canonicalBytes.byteLength !== bytes.byteLength",
  "parseBaseEnvironmentSnapshot",
  "sameImageIdentity",
  "assertFixedDoctorCommand",
  "validateBaseEnvironmentKeys",
  'doctorFailure("COMMAND_TIMEOUT")',
  'doctorFailure("OUTPUT_LIMIT")',
  'failure = "CLEANUP_FAILURE"',
]) {
  if (!doctor.includes(required)) fail(`doctor marker ${required}`);
}
for (const forbidden of ['"pull"', '"build"', '"create"', '"start"']) {
  if (doctor.includes(forbidden)) fail(`doctor forbidden verb ${forbidden}`);
}
if (
  doctor.match(/"run"/gu)?.length !== 1 ||
  !doctor.includes('["run", "cleanup"]')
) {
  fail("doctor authority-only run method");
}
for (const required of [
  "FIXED_RUNTIME_VERSION_FORMAT",
  "FIXED_BASE_IMAGE_INSPECT_FORMAT",
  "FIXED_BASE_ENVIRONMENT_KEYS_FORMAT",
  "FIXED_IMAGE_ID_FORMAT",
  "FIXED_INSPECT_FORMAT",
  "FIXED_DOCKER_FORMATS",
  ".Client.Version",
  ".Server.Version",
  "M4_INVALID_ENV_ENTRY",
  ".HostConfig.ReadonlyRootfs",
  ".HostConfig.SecurityOpt",
  ".HostConfig.DeviceRequests",
  ".HostConfig.PortBindings",
  ".HostConfig.LogConfig.Config",
  ".HostConfig.RestartPolicy.MaximumRetryCount",
  ".State.Status",
]) {
  if (!dockerFormats.includes(required))
    fail(`Docker format marker ${required}`);
}
if (/\{\{[^}]*\bdict\b/u.test(dockerFormats)) {
  fail("unsupported Docker template function dict");
}
for (const required of [
  'import { spawn } from "node:child_process"',
  "spawn(command.executable, command.arguments",
  "env: fixedEnvironment(this.dockerConfigRoot)",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "private activeChildren = 0",
  "if (this.activeChildren !== 0)",
  "const DOCKER_CONFIG_JSON = '{\"auths\":{}}\\n'",
  'path.join(repositoryRoot, "results")',
  'path.join(resultsRoot, "runs")',
  'createOwnedDirectory(runsRoot, "m4-profile-controls")',
  'createOwnedDirectory(m4Root, "doctor-work")',
]) {
  if (!doctorHostBackend.includes(required)) {
    fail(`doctor host backend marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "stderrChunks",
]) {
  if (doctorHostBackend.includes(forbidden)) {
    fail(`doctor host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID",
  "FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG",
  "OFFLINE_BUILD_RECOVERY_STEP_IDS",
  "createFixedOfflineBuildRecoveryInput",
  "fixedInputBindings",
  "validateRecordedFailedBuildResult",
  "assertFixedOfflineBuildRecoveryCommand",
  '"image",',
  '"inspect",',
  "FIXED_IMAGE_ID_FORMAT",
  '"validate-retained-state"',
  '"inspect-image"',
  '"validate-retained-state-after-inspect"',
  "parseRecoveredImageDigest",
  "KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST",
  "validFailureState",
  'ownedStateDisposition: "retained"',
  "serializeCanonicalOfflineBuildRecoveryResult",
  "parseCanonicalOfflineBuildRecoveryResultBytes",
]) {
  if (!offlineBuildRecovery.includes(required)) {
    fail(`offline build recovery marker ${required}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "FIXED_RETAINED_STATE_INVENTORY",
  'relativePath: "docker-config/.token_seed"',
  "byteLength: 74",
  '"docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva"',
  "byteLength: 281",
  "captureExactRetainedState",
  "validateCapturedRetainedState",
  "FilesystemIdentityLease",
  'content: "metadata-only"',
  "productionFactoryConsumed",
  "consumeOfflineBuildRecoveryInspectAttempt",
  "assertFixedOfflineBuildRecoveryCommand(command)",
  "spawn(command.executable, command.arguments",
  "cwd: this.repositoryRoot",
  "env: Object.freeze({ DOCKER_CONFIG: this.dockerConfigRoot })",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "createOfflineBuildProcessState",
  "observeOfflineBuildProcessFailure",
  "observeOfflineBuildProcessOutput",
  "private unknownSettlement = false",
  "private terminalLeaseSettlement: Promise<void> | null = null",
  "this.unknownSettlement = true",
  "await this.retainedState.lease.validate()",
  "await this.retainedState.lease.close()",
]) {
  if (!offlineBuildRecoveryHostBackend.includes(required)) {
    fail(`offline build recovery host backend marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "readFile",
  "open(",
  "writeFile",
  "unlink(",
  "rmdir(",
  "rm(",
  "rename(",
  "chmod(",
  "mkdir(",
  "/var/run/docker.sock",
]) {
  if (offlineBuildRecoveryHostBackend.includes(forbidden)) {
    fail(`offline build recovery forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "OFFLINE_BUILD_STEP_IDS",
  "createFixedOfflineBuildInput",
  "fixedInputBindings",
  '"stage-build-context"',
  '"doctor"',
  '"build"',
  '"inspect-image"',
  "assertFixedImageBuildPlan",
  "copyAcceptedStagingFiles",
  "verifyAcceptedStagingFiles",
  "parseRuntimeVersion",
  "parseBuiltImageDigest",
  "FIXED_DOCKER_CLI_VERSION",
  "FIXED_DOCKER_SERVER_VERSION",
  "FIXED_BASE_IMAGE_DIGEST",
  "M0_NODE24_IMAGE_DIGEST",
  "KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST",
  "validFailurePrefixLength",
  "validateOfflineBuildResult",
  "serializeCanonicalOfflineBuildResult",
  "parseCanonicalOfflineBuildResultBytes",
  'primaryFailure ??= "CLEANUP_FAILURE"',
]) {
  if (!offlineBuild.includes(required)) {
    fail(`offline build executor marker ${required}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "spawn(command.executable, command.arguments",
  "cwd: this.repositoryRoot",
  "env: Object.freeze({ DOCKER_CONFIG: this.layout.dockerConfigRoot })",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "this.activeChildren.size !== 0",
  "captureFileIdentity",
  "FilesystemIdentityLease",
  "RUNTIME_CONFIGURATION_CLEANUP_ORDER",
  "validateConfigurationCheckpoint",
  'content: "metadata-only"',
  "createExclusiveFileIdentity",
  '"profile-control-fixture-root"',
  'path.join(controlRoot, "fixture")',
  "DOCKER_CONFIG_JSON",
  "verifyAcceptedStagingFiles(snapshot, repositoryFiles.files)",
  "assertFixedImageBuildPlan",
  "requireAbsent(input.layout.runRoot)",
  "createOfflineBuildProcessState",
  "observeOfflineBuildProcessFailure",
  "observeOfflineBuildProcessOutput",
]) {
  if (!offlineBuildHostBackend.includes(required)) {
    fail(`offline build host backend marker ${required}`);
  }
}
if (offlineBuildHostBackend.includes("writeFile")) {
  fail("offline build host backend path-write marker");
}
for (const required of [
  "lstat(target, { bigint: true })",
  "handle.stat({ bigint: true })",
  "stat.uid",
  "stat.gid",
  "stat.mtimeNs",
  "stat.ctimeNs",
  "constants.O_NOFOLLOW",
  "constants.O_DIRECTORY",
  "constants.O_EXCL",
  "identity.nlink !== 1n",
  "identity.mode & MODE_MASK",
  "FilesystemIdentityLease",
  "refreshDirectoryCheckpoint",
  "syncDirectoryCheckpoint",
  "adoptCreatedFile",
  "assertCreatingDescriptorContinuityForTest",
  "assertFilesystemCapabilitiesForTest",
  "transitionDirectoryMode",
  "unlinkExpected",
  "removeExpectedDirectory",
  'content === "metadata-only"',
  "!this.readPermitted",
]) {
  if (!filesystemIdentity.includes(required)) {
    fail(`filesystem identity marker ${required}`);
  }
}
const exclusiveFileStart = filesystemIdentity.indexOf(
  "export async function createExclusiveFileIdentity",
);
const exclusiveFileEnd = filesystemIdentity.indexOf(
  "export class FilesystemIdentityLease",
  exclusiveFileStart,
);
const exclusiveFileSource = filesystemIdentity.slice(
  exclusiveFileStart,
  exclusiveFileEnd,
);
for (const required of [
  "constants.O_CREAT",
  "constants.O_EXCL",
  "constants.O_NOFOLLOW",
  "await handle.writeFile(input.bytes)",
  "await handle.sync()",
  "HeldFilesystemObject.adoptCreatedFile",
  "input.parent.syncDirectoryCheckpoint",
]) {
  if (!exclusiveFileSource.includes(required)) {
    fail(`exclusive file descriptor marker ${required}`);
  }
}
for (const forbidden of [
  "const held = await captureFileIdentity",
  "const parentHandle = await open",
]) {
  if (exclusiveFileSource.includes(forbidden)) {
    fail(`exclusive file reopen marker ${forbidden}`);
  }
}
for (const forbidden of [
  "manifestIdentityBefore",
  "manifestIdentityAfter",
  "manifestTypeBefore",
  "manifestTypeAfter",
  "manifestSymlinkBefore",
  "manifestSymlinkAfter",
  "m4-file-",
]) {
  if (
    execution.includes(forbidden) ||
    controlHostBackend.includes(forbidden) ||
    typesSource.includes(forbidden)
  ) {
    fail(`retired public identity marker ${forbidden}`);
  }
}
for (const required of [
  '"manifestBefore"',
  '"manifestAfter"',
  '"manifestIdentityStable"',
  '"controlEvidence"',
  '"resultFiles"',
  '"scratchFiles"',
]) {
  if (!execution.includes(required))
    fail(`transfer projection marker ${required}`);
}
for (const required of [
  '"output-limit"',
  '"process-error"',
  '"timeout"',
  "snapshot.firstFailure ?? failure",
  "snapshot.firstFailure ??",
  "stdoutBytes + stderrBytes > outputLimitBytes",
  "Math.min(current + added, limit + 1)",
]) {
  if (!offlineBuildProcess.includes(required)) {
    fail(`offline build process marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "stderrChunks",
  "/var/run/docker.sock",
  "executeFixedProfilePair",
  '"create"',
  '"start"',
  '"run-controls"',
]) {
  if (offlineBuildHostBackend.includes(forbidden)) {
    fail(`offline build host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  'const MANIFEST_PATH = "/input/control-manifest.json"',
  'const SCRATCH_PATH = "/scratch/scratch-marker.txt"',
]) {
  if (!controlRunner.includes(required))
    fail(`fixture path marker ${required}`);
}
for (const [sourceName, source, requiredMarkers] of [
  [
    "staging",
    staging,
    [
      "FIXED_STAGING_FILES",
      "preparedBytes",
      "acceptedBytes",
      "inventoryDigest",
      "verifyAcceptedStagingFiles",
      "snapshotBytes",
    ],
  ],
  [
    "canonical",
    canonical,
    [
      "serializeCanonicalControlManifest",
      "serializeCanonicalControlEvidence",
      "snapshotBytes",
    ],
  ],
  [
    "completion",
    completion,
    [
      '"input/control-manifest.json"',
      '"host/host-inspection.json"',
      '"container-result/control-evidence.json"',
      "manifestSha256",
      "hostInspectionSha256",
      "controlEvidenceSha256",
    ],
  ],
  [
    "inspect",
    inspect,
    [
      '"deviceRequests"',
      '"runtime"',
      '"usernsMode"',
      '"portBindings"',
      '"logType"',
    ],
  ],
  [
    "execution",
    execution,
    [
      "assertFixedImageBuildPlan",
      "assertFixedProfilePairDockerPlans",
      "stageBuildContext",
      "readBuildContext",
      "copyAcceptedStagingFiles",
      "fixedInput.acceptedSnapshot.baseEnvironmentKeys",
      "validatePreBuildRuntimeVersion",
      "RUNTIME_VERSION_KEYS",
      "FIXED_DOCKER_CLI_VERSION",
      "FIXED_DOCKER_SERVER_VERSION",
      "canonicalEncoder.encode",
      "bytes.byteLength !== result.stdoutBytes",
      'failStep("COMMAND_TIMEOUT")',
      'failStep("OUTPUT_LIMIT")',
      'failStep("IMMUTABLE_INPUT_CHANGED")',
      'primaryFailure = "CLEANUP_FAILURE"',
      "executeFixedExistingImageProfilePair",
      "validateExistingImageExecutionPlan",
      "recordProfileResult",
      "await fixedInput.backend.cleanup()",
    ],
  ],
]) {
  for (const marker of requiredMarkers) {
    if (!source.includes(marker)) fail(`${sourceName} marker ${marker}`);
  }
}
if (
  !orchestrator.includes('"doctor"') ||
  !orchestrator.includes('"run-controls"') ||
  !orchestrator.includes('failProfile("M4_EXECUTION_NOT_APPROVED")') ||
  orchestrator.includes("process.argv") ||
  orchestrator.includes("doctor-host-backend") ||
  orchestrator.includes("offline-build") ||
  orchestrator.includes("control-host-backend") ||
  orchestrator.includes("run-controls.js") ||
  indexSource.includes("doctor-host-backend") ||
  indexSource.includes("offline-build") ||
  indexSource.includes("control-host-backend") ||
  indexSource.includes("run-controls.js")
) {
  fail("fixed orchestrator gate");
}

const fixedControlDigest =
  "sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd";
for (const [profileId, profileReadme, profileSource] of [
  ["permissive", permissiveReadme, permissiveProfileSource],
  ["constrained", constrainedReadme, constrainedProfileSource],
]) {
  const profile = JSON.parse(profileSource);
  if (
    profileSource !== `${JSON.stringify(profile)}\n` ||
    profile.schemaVersion !== "lab-execution-profile/v1" ||
    profile.profileId !== profileId ||
    profile.containerImageDigest !== fixedControlDigest ||
    !profileReadme.includes("`profile.json` は") ||
    !profileReadme.includes(fixedControlDigest) ||
    !profileReadme.includes("fresh independent") ||
    profileReadme.includes("Observed enforcement result が存在する")
  ) {
    fail(`fixed ${profileId} profile input`);
  }
}
for (const profileId of ["permissive", "constrained"]) {
  const entries = await readdir(
    path.join(repositoryRoot, "profiles", profileId),
  );
  if (
    JSON.stringify(entries.sort()) !==
    JSON.stringify(["README.md", "profile.json"])
  ) {
    fail(`unexpected ${profileId} profile input`);
  }
}
if (
  !milestoneSource.includes("ADR-0001 承認済み") ||
  !contractSource.includes("human reviewer が明示的に承認済み") ||
  !exactInputContractSource.includes("independent read-only review pending") ||
  !adrSource.includes("Status: Accepted") ||
  !implementationPrompt.includes("# Goal") ||
  !implementationPrompt.includes("# Completion report") ||
  !reviewPrompt.includes("# Goal") ||
  !reviewPrompt.includes("# Completion report") ||
  !remediationReviewPrompt.includes("# Goal") ||
  !remediationReviewPrompt.includes("# Completion report") ||
  !inputBindingPrompt.includes("# Goal") ||
  !inputBindingPrompt.includes("# Completion report") ||
  !inputBindingReviewPrompt.includes("# Goal") ||
  !inputBindingReviewPrompt.includes("# Completion report") ||
  !exactInputPrompt.includes("# Goal") ||
  !exactInputPrompt.includes("# Completion report") ||
  !exactInputReviewPrompt.includes("# Goal") ||
  !exactInputReviewPrompt.includes("# Completion report") ||
  !exactInputBackendRemediationPrompt.includes("# Goal") ||
  !exactInputBackendRemediationPrompt.includes("# Completion report") ||
  !exactInputBackendRemediationReviewPrompt.includes("# Goal") ||
  !exactInputBackendRemediationReviewPrompt.includes("# Completion report") ||
  !doctorPrompt.includes("# Goal") ||
  !doctorPrompt.includes("# Completion report") ||
  !doctorReviewPrompt.includes("# Goal") ||
  !doctorReviewPrompt.includes("# Completion report") ||
  !doctorRemediationPrompt.includes("# Goal") ||
  !doctorRemediationPrompt.includes("# Completion report") ||
  !doctorRemediationReviewPrompt.includes("# Goal") ||
  !doctorRemediationReviewPrompt.includes("# Completion report") ||
  !doctorCanonicalBytesRemediationPrompt.includes("# Goal") ||
  !doctorCanonicalBytesRemediationPrompt.includes("# Completion report") ||
  !doctorCanonicalBytesRemediationReviewPrompt.includes("# Goal") ||
  !doctorCanonicalBytesRemediationReviewPrompt.includes(
    "# Completion report",
  ) ||
  !offlineBuildPrompt.includes("# Goal") ||
  !offlineBuildPrompt.includes("# Completion report") ||
  !offlineBuildReviewPrompt.includes("# Goal") ||
  !offlineBuildReviewPrompt.includes("# Completion report") ||
  !offlineBuildResultRemediationPrompt.includes("# Goal") ||
  !offlineBuildResultRemediationPrompt.includes("# Completion report") ||
  !offlineBuildResultRemediationReviewPrompt.includes("# Goal") ||
  !offlineBuildResultRemediationReviewPrompt.includes("# Completion report") ||
  !offlineBuildRecoveryPrompt.includes("# Goal") ||
  !offlineBuildRecoveryPrompt.includes("# Completion report") ||
  !offlineBuildRecoveryReviewPrompt.includes("# Goal") ||
  !offlineBuildRecoveryReviewPrompt.includes("# Completion report") ||
  !runControlsRemediationPrompt.includes("# Goal") ||
  !runControlsRemediationPrompt.includes("# Completion report") ||
  !runControlsRemediationReviewPrompt.includes("# Goal") ||
  !runControlsRemediationReviewPrompt.includes("# Completion report")
) {
  fail("approved documentation/prompt boundary");
}
const [activationImplementationPrompt, activationImplementationReviewPrompt] =
  await Promise.all([
    readFile(
      path.join(
        repositoryRoot,
        "prompts/m4-distinct-activation-object-implementation.md",
      ),
      "utf8",
    ),
    readFile(
      path.join(
        repositoryRoot,
        "prompts/reviews/m4-distinct-activation-object-implementation-review.md",
      ),
      "utf8",
    ),
  ]);
for (const [label, prompt] of [
  ["implementation", activationImplementationPrompt],
  ["review", activationImplementationReviewPrompt],
]) {
  if (!prompt.includes("# Goal") || !prompt.includes("# Completion report")) {
    fail(`activation ${label} prompt boundary`);
  }
}

const [
  executorImplementationPrompt,
  executorImplementationReviewPrompt,
  executorImplementationRemediationPrompt,
  executorImplementationRemediationReviewPrompt,
] = await Promise.all([
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-distinct-activation-object-execution-gate-implementation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-remediation-review.md",
    ),
    "utf8",
  ),
]);
for (const [label, prompt] of [
  ["executor implementation", executorImplementationPrompt],
  ["executor review", executorImplementationReviewPrompt],
  [
    "executor implementation remediation",
    executorImplementationRemediationPrompt,
  ],
  [
    "executor implementation remediation review",
    executorImplementationRemediationReviewPrompt,
  ],
]) {
  if (!prompt.includes("# Goal") || !prompt.includes("# Completion report")) {
    fail(`activation ${label} prompt boundary`);
  }
}
if (
  rootPackage.scripts?.["m4:execute:frozen-research"] !==
    "node containers/profile-control/dist/frozen-research-profile-control-executor.js" ||
  !permissiveReadme.includes("m4-profile-control-p-20260720-02") ||
  !constrainedReadme.includes("m4-profile-control-c-20260720-02") ||
  permissiveReadme.includes("m4-profile-control-p-20260720-01") ||
  constrainedReadme.includes("m4-profile-control-c-20260720-01")
) {
  fail("activation executor package and handoff boundary");
}

process.stdout.write(
  "M4 static contract verified; activation wrapper constructed but not invoked (no activation execution; no Docker execution; no runtime enforcement claim)\n",
);
