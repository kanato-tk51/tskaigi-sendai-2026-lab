import { readFile, readdir } from "node:fs/promises";
import { isBuiltin } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import ts from "typescript";

const packageRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(packageRoot, "../..");
const sourceRoot = path.join(packageRoot, "src");
const fixtureRoot = path.join(packageRoot, "fixture");
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function listFiles(root, predicate) {
  const output = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        output.push(path.resolve(entryPath));
      }
    }
  }
  await visit(root);
  return output.sort();
}

function parseSource(filePath, source) {
  return ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".js") || filePath.endsWith(".mjs")
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS,
  );
}

function staticString(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : undefined;
}

function moduleReferences(sourceFile) {
  const references = [];
  function add(node, specifier, typeOnly, kind) {
    references.push({ node, specifier, typeOnly, kind });
  }
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const specifier = staticString(node.moduleSpecifier);
      if (specifier === undefined) {
        fail(`${sourceFile.fileName}: nonliteral import declaration`);
      } else {
        add(node, specifier, node.importClause?.isTypeOnly === true, "import");
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const specifier = staticString(node.moduleSpecifier);
      if (specifier === undefined) {
        fail(`${sourceFile.fileName}: nonliteral export declaration`);
      } else {
        add(node, specifier, node.isTypeOnly, "export");
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      const expression = node.moduleReference.expression;
      const specifier = expression && staticString(expression);
      if (specifier === undefined) {
        fail(`${sourceFile.fileName}: nonliteral import-equals`);
      } else {
        add(node, specifier, node.isTypeOnly, "import-equals");
      }
    } else if (ts.isCallExpression(node)) {
      const dynamicImport =
        node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const requireCall =
        ts.isIdentifier(node.expression) && node.expression.text === "require";
      if (dynamicImport || requireCall) {
        const specifier =
          node.arguments.length === 1
            ? staticString(node.arguments[0])
            : undefined;
        if (specifier === undefined) {
          fail(
            `${sourceFile.fileName}: ${dynamicImport ? "computed import" : "nonliteral require"}`,
          );
        } else {
          add(
            node,
            specifier,
            false,
            dynamicImport ? "dynamic-import" : "require",
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return references;
}

function resolveRelativeImport(fromFile, specifier, knownFiles) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    base.replace(/\.js$/u, ".ts"),
    base.replace(/\.mjs$/u, ".mts"),
    `${base}.ts`,
    path.join(base, "index.ts"),
  ];
  return candidates.find((candidate) =>
    knownFiles.has(path.resolve(candidate)),
  );
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function reachableGraph(entry, graph) {
  const seen = new Set();
  const pending = [entry];
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === undefined || seen.has(current)) {
      continue;
    }
    seen.add(current);
    for (const edge of graph.get(current) ?? []) {
      if (!edge.typeOnly && edge.resolved !== undefined) {
        pending.push(edge.resolved);
      }
    }
  }
  return seen;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function objectProperty(object, name) {
  if (object === undefined || !ts.isObjectLiteralExpression(object)) {
    return undefined;
  }
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      propertyName(property.name) === name
    ) {
      return property.initializer;
    }
  }
  return undefined;
}

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function constantInitializers(sourceFiles) {
  const constants = new Map();
  for (const sourceFile of sourceFiles.values()) {
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) {
        continue;
      }
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          constants.set(declaration.name.text, declaration.initializer);
        }
      }
    }
  }
  return constants;
}

function evaluate(node, constants, depth = 0) {
  if (node === undefined || depth > 12) {
    return undefined;
  }
  const value = unwrapExpression(node);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return value.text;
  }
  if (ts.isNumericLiteral(value)) {
    return Number(value.text.replaceAll("_", ""));
  }
  if (value.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (value.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (
    ts.isPrefixUnaryExpression(value) &&
    value.operator === ts.SyntaxKind.MinusToken
  ) {
    const operand = evaluate(value.operand, constants, depth + 1);
    return typeof operand === "number" ? -operand : undefined;
  }
  if (ts.isIdentifier(value)) {
    const initializer = constants.get(value.text);
    return initializer === undefined
      ? undefined
      : evaluate(initializer, constants, depth + 1);
  }
  if (
    ts.isPropertyAccessExpression(value) &&
    ts.isIdentifier(value.expression)
  ) {
    const owner = evaluate(
      constants.get(value.expression.text),
      constants,
      depth + 1,
    );
    return owner !== null && typeof owner === "object"
      ? owner[value.name.text]
      : undefined;
  }
  if (ts.isArrayLiteralExpression(value)) {
    const array = value.elements.map((element) =>
      evaluate(element, constants, depth + 1),
    );
    return array.some((element) => element === undefined) ? undefined : array;
  }
  if (
    ts.isCallExpression(value) &&
    value.arguments.length === 1 &&
    ts.isPropertyAccessExpression(value.expression) &&
    ts.isIdentifier(value.expression.expression) &&
    value.expression.expression.text === "Object" &&
    value.expression.name.text === "freeze"
  ) {
    return evaluate(value.arguments[0], constants, depth + 1);
  }
  if (ts.isObjectLiteralExpression(value)) {
    const object = {};
    for (const property of value.properties) {
      if (!ts.isPropertyAssignment(property)) {
        return undefined;
      }
      const name = propertyName(property.name);
      const propertyValue = evaluate(
        property.initializer,
        constants,
        depth + 1,
      );
      if (name === undefined || propertyValue === undefined) {
        return undefined;
      }
      object[name] = propertyValue;
    }
    return object;
  }
  return undefined;
}

function isProcessEnv(node) {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "process" &&
    node.name.text === "env"
  );
}

function inspectRuntimeSyntax(sourceFile) {
  const isLifecycleFixture =
    path.basename(sourceFile.fileName) === "lifecycle-coordinator.mjs";
  function visit(node) {
    if (isProcessEnv(node)) {
      const parent = node.parent;
      if (
        !ts.isPropertyAccessExpression(parent) ||
        parent.expression !== node ||
        !parent.name.text.startsWith("PROBE_CANARY_")
      ) {
        fail(
          `${sourceFile.fileName}: environment enumeration or dynamic access`,
        );
      }
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "process" &&
      node.name.text === "argv" &&
      path.basename(sourceFile.fileName) !== "local-runner.ts" &&
      !isLifecycleFixture
    ) {
      fail(`${sourceFile.fileName}: process.argv outside fixed local runner`);
    }
    if (
      ts.isElementAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "process" &&
      node.expression.name.text === "argv"
    ) {
      const argument = node.argumentExpression;
      if (
        !isLifecycleFixture ||
        argument === undefined ||
        !ts.isNumericLiteral(argument) ||
        argument.text !== "2"
      ) {
        fail(`${sourceFile.fileName}: argv indexing is forbidden`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

function callNames(sourceFile) {
  const calls = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      calls.push(node.expression.getText(sourceFile));
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return calls;
}

const packageJson = await readJson(path.join(packageRoot, "package.json"));
const rootPackage = await readJson(path.join(repositoryRoot, "package.json"));
const lockfile = await readJson(path.join(repositoryRoot, "package-lock.json"));
const installedVitest = await readJson(
  path.join(repositoryRoot, "node_modules/vitest/package.json"),
);
const probePackage = await readJson(
  path.join(repositoryRoot, "packages/probe-core/package.json"),
);

if (
  packageJson.name !== "@tskaigi-lab/adapter-vitest-setup" ||
  packageJson.version !== "0.0.0" ||
  packageJson.private !== true ||
  packageJson.type !== "module"
) {
  fail("package identity/private/ESM contract mismatch");
}
if (
  packageJson.dependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
  packageJson.dependencies?.vitest !== "3.2.7" ||
  Object.keys(packageJson.dependencies ?? {}).length !== 2
) {
  fail("runtime dependency allowlist mismatch");
}
if (
  rootPackage.devDependencies?.vitest !== "3.2.7" ||
  lockfile.packages?.[""]?.devDependencies?.vitest !== "3.2.7" ||
  lockfile.packages?.["node_modules/vitest"]?.version !== "3.2.7" ||
  lockfile.packages?.["packages/vitest-setup-probe"]?.dependencies?.vitest !==
    "3.2.7" ||
  installedVitest.version !== "3.2.7"
) {
  fail("Vitest root/lock/workspace/installed exact version mismatch");
}
if (rootPackage.scripts?.test !== "vitest run --configLoader runner") {
  fail("root test config loader command is not fixed");
}
if (
  packageJson.engines?.node !== "20.18.2" ||
  packageJson.engines?.npm !== "11.12.1" ||
  rootPackage.packageManager !== "npm@11.12.1"
) {
  fail("Node/npm exact version policy mismatch");
}
const lifecycleNames = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
  "prepublish",
  "prepack",
  "postpack",
];
if (lifecycleNames.some((name) => packageJson.scripts?.[name] !== undefined)) {
  fail("lifecycle script is forbidden");
}
if (
  packageJson.scripts?.["scenario:run"] !==
  "npm run build && node dist/local-runner.js"
) {
  fail("scenario runner command is not fixed");
}
if (
  packageJson.scripts?.test !==
  "vitest run --config vitest.config.ts --configLoader runner"
) {
  fail("package test config loader command is not fixed");
}
if (
  packageJson.exports?.["."]?.import !== "./dist/index.js" ||
  packageJson.exports?.["./setup"]?.import !== "./dist/setup-entry.js"
) {
  fail("root/setup export boundary mismatch");
}

const sourcePaths = await listFiles(sourceRoot, (file) =>
  /\.(?:ts|mts|cts)$/u.test(file),
);
const fixturePaths = await listFiles(fixtureRoot, (file) =>
  /\.ts$/u.test(file),
);
const lifecycleFixturePaths = [
  path.join(fixtureRoot, "lifecycle-coordinator.mjs"),
  path.join(fixtureRoot, "lifecycle-worker.mjs"),
];
const scenarioConfigPath = path.join(packageRoot, "vitest.scenario.config.ts");
const parsedFiles = new Map();
for (const filePath of [
  ...sourcePaths,
  ...fixturePaths,
  ...lifecycleFixturePaths,
  scenarioConfigPath,
]) {
  parsedFiles.set(
    filePath,
    parseSource(filePath, await readFile(filePath, "utf8")),
  );
}
const knownFiles = new Set(parsedFiles.keys());
const graph = new Map();
const allowedBareImports = new Set([
  "@tskaigi-lab/probe-core",
  "vitest",
  "vitest/config",
  "vitest/node",
  "vitest/reporters",
]);
for (const [filePath, sourceFile] of parsedFiles) {
  inspectRuntimeSyntax(sourceFile);
  const edges = [];
  for (const reference of moduleReferences(sourceFile)) {
    if (reference.specifier.startsWith(".")) {
      const resolved = resolveRelativeImport(
        filePath,
        reference.specifier,
        knownFiles,
      );
      if (resolved === undefined) {
        fail(`${filePath}: unresolved relative import ${reference.specifier}`);
      } else if (!inside(packageRoot, resolved)) {
        fail(`${filePath}: source root escape ${reference.specifier}`);
      }
      edges.push({ ...reference, resolved });
    } else {
      const builtin = isBuiltin(reference.specifier);
      if (!builtin && !allowedBareImports.has(reference.specifier)) {
        fail(
          `${filePath}: external bare import not allowlisted: ${reference.specifier}`,
        );
      }
      edges.push({ ...reference, resolved: undefined });
    }
  }
  graph.set(filePath, edges);
}

const rootEntry = path.join(sourceRoot, "index.ts");
const setupEntry = path.join(sourceRoot, "setup-entry.ts");
const rootGraph = reachableGraph(rootEntry, graph);
const setupGraph = reachableGraph(setupEntry, graph);
if (rootGraph.has(setupEntry)) {
  fail("package root graph reaches instrumented setup entry");
}
for (const filePath of rootGraph) {
  for (const edge of graph.get(filePath) ?? []) {
    if (
      !edge.typeOnly &&
      (edge.specifier === "vitest" || edge.specifier.startsWith("node:"))
    ) {
      fail(
        "package root runtime graph reaches Vitest or Node capability modules",
      );
    }
  }
}
const prohibitedSetupImports = new Set([
  "fs",
  "node:fs",
  "node:fs/promises",
  "http",
  "node:http",
  "https",
  "node:https",
  "net",
  "node:net",
  "child_process",
  "node:child_process",
]);
for (const filePath of setupGraph) {
  for (const edge of graph.get(filePath) ?? []) {
    if (!edge.typeOnly && prohibitedSetupImports.has(edge.specifier)) {
      fail(
        `${filePath}: setup graph imports direct capability ${edge.specifier}`,
      );
    }
    if (
      !edge.typeOnly &&
      !edge.specifier.startsWith(".") &&
      edge.specifier !== "vitest" &&
      edge.specifier !== "@tskaigi-lab/probe-core"
    ) {
      fail(`${filePath}: setup graph bare import outside fixed allowlist`);
    }
  }
}

for (const [filePath, sourceFile] of parsedFiles) {
  const calls = callNames(sourceFile);
  if (
    calls.some(
      (call) =>
        call.endsWith(".recordRouteInvocation") || call.endsWith(".runAttempt"),
    ) &&
    filePath !== setupEntry
  ) {
    fail(`${filePath}: route/capability start outside setup entry`);
  }
}
const setupCalls = callNames(parsedFiles.get(setupEntry));
if (
  setupCalls.filter((call) => call.endsWith(".recordRouteInvocation"))
    .length !== 2 ||
  setupCalls.filter((call) => call.endsWith(".runAttempt")).length !== 6
) {
  fail("setup entry must record exactly 2 routes and 6 attempts");
}
const setupSourceFile = parsedFiles.get(setupEntry);
let checkpointInsideFunction = false;
function inspectCheckpointPlacement(node) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(setupSourceFile).endsWith(".recordRouteInvocation")
  ) {
    let parent = node.parent;
    while (parent !== undefined && parent !== setupSourceFile) {
      if (ts.isFunctionLike(parent)) {
        checkpointInsideFunction = true;
      }
      parent = parent.parent;
    }
  }
  ts.forEachChild(node, inspectCheckpointPlacement);
}
inspectCheckpointPlacement(setupSourceFile);
if (checkpointInsideFunction) {
  fail("setup checkpoints must remain in the same top-level module import");
}
const setupText = setupSourceFile.getFullText();
const setupBootstrapOrder = [
  "const context = validateFixedProvidedContext",
  "validateVitestManifestContract(context.manifest)",
  "validateProbeConfiguration(",
  "prepareProbeConfiguration(validated)",
  "createProbeSession(prepared)",
  "ROUTE_IDS.lateModuleCheckpoint",
  "ROUTE_IDS.setupBodyCheckpoint",
  "session.runAttempt(ATTEMPT_IDS.environment)",
];
let previousSetupIndex = -1;
for (const marker of setupBootstrapOrder) {
  const markerIndex = setupText.indexOf(marker, previousSetupIndex + 1);
  if (markerIndex <= previousSetupIndex) {
    fail(`setup checkpoint/bootstrap order mismatch: ${marker}`);
    break;
  }
  previousSetupIndex = markerIndex;
}
let setupHasTopLevelAwait = false;
for (const statement of parsedFiles.get(setupEntry).statements) {
  function findAwait(node) {
    if (ts.isFunctionLike(node)) {
      return;
    }
    if (ts.isAwaitExpression(node)) {
      setupHasTopLevelAwait = true;
    }
    ts.forEachChild(node, findAwait);
  }
  findAwait(statement);
}
if (!setupHasTopLevelAwait) {
  fail("setup entry must use direct top-level await");
}

const constants = constantInitializers(parsedFiles);
if (
  JSON.stringify(
    evaluate(constants.get("FIXED_VITEST_ARGUMENTS"), constants),
  ) !==
  JSON.stringify([
    "run",
    "--config",
    "vitest.scenario.config.ts",
    "--configLoader",
    "runner",
    "fixture/designated.test.ts",
  ])
) {
  fail("fixed Vitest argv/config/test filter contract mismatch");
}
const fixedConstantContract = {
  CONFIG_LOADER: "runner",
  TOOL_TEMP_RELATIVE_PATH: "tool-temp",
  VITE_CONFIG_TEMP_RELATIVE_PATH: "node_modules/.vite-temp",
  FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH: "node_modules",
  TERMINATION_GRACE_MS: 500,
  FORCE_TERMINATION_CLOSE_MS: 2_000,
  PROCESS_RESIDUE_TIMEOUT_MS: 2_000,
  PROCESS_RESIDUE_POLL_MS: 25,
  LIFECYCLE_TEST_TIMEOUT_MS: 100,
  LIFECYCLE_TEST_MAX_OUTPUT_BYTES: 1_024,
  EXPECTED_GRACEFUL_CLOSE_SIGNAL: "SIGTERM",
  EXPECTED_FORCE_CLOSE_SIGNAL: "SIGKILL",
};
for (const [name, expected] of Object.entries(fixedConstantContract)) {
  if (evaluate(constants.get(name), constants) !== expected) {
    fail(`${name} fixed constant mismatch`);
  }
}
if (
  JSON.stringify(evaluate(constants.get("ROUTE_IDS"), constants)) !==
    JSON.stringify({
      lateModuleCheckpoint: "vitest-late-module-evaluation-checkpoint",
      setupBodyCheckpoint: "vitest-setup-body-checkpoint",
    }) ||
  JSON.stringify(evaluate(constants.get("PHASES"), constants)) !==
    JSON.stringify({
      lateModuleCheckpoint: "setup-file-late-module-checkpoint",
      setupBodyCheckpoint: "setup-file-body-checkpoint",
    })
) {
  fail("route checkpoint constant contract mismatch");
}
const configFile = parsedFiles.get(scenarioConfigPath);
const configDeclaration = configFile.statements
  .filter(ts.isVariableStatement)
  .flatMap((statement) => [...statement.declarationList.declarations])
  .find(
    (declaration) =>
      ts.isIdentifier(declaration.name) &&
      declaration.name.text === "SCENARIO_CONFIG",
  );
const configObject = configDeclaration?.initializer
  ? unwrapExpression(configDeclaration.initializer)
  : undefined;
const testObject = configObject && objectProperty(configObject, "test");
const fixedConfigValues = {
  watch: false,
  cache: false,
  pool: "forks",
  minWorkers: 1,
  maxWorkers: 1,
  fileParallelism: false,
  isolate: true,
  retry: 0,
  bail: 0,
  maxConcurrency: 1,
  update: false,
  api: false,
  ui: false,
  open: false,
  passWithNoTests: false,
  allowOnly: false,
};
if (
  !ts.isObjectLiteralExpression(configObject) ||
  !ts.isObjectLiteralExpression(testObject)
) {
  fail("SCENARIO_CONFIG/test object not statically analyzable");
} else {
  for (const [name, expected] of Object.entries(fixedConfigValues)) {
    if (evaluate(objectProperty(testObject, name), constants) !== expected) {
      fail(`test.${name} fixed config mismatch`);
    }
  }
  const include = evaluate(objectProperty(testObject, "include"), constants);
  const setupFiles = evaluate(
    objectProperty(testObject, "setupFiles"),
    constants,
  );
  const globalSetup = evaluate(
    objectProperty(testObject, "globalSetup"),
    constants,
  );
  if (
    JSON.stringify(include) !== JSON.stringify(["fixture/designated.test.ts"])
  ) {
    fail("exact include count/path mismatch");
  }
  if (JSON.stringify(setupFiles) !== JSON.stringify(["src/setup-entry.ts"])) {
    fail("exact setupFiles count/path mismatch");
  }
  if (JSON.stringify(globalSetup) !== JSON.stringify(["src/global-setup.ts"])) {
    fail("exact globalSetup count/path mismatch");
  }
  for (const discoveryKey of ["projects", "workspace", "project"]) {
    if (objectProperty(testObject, discoveryKey) !== undefined) {
      fail(`test.${discoveryKey} discovery option must be absent`);
    }
  }
  const sequence = objectProperty(testObject, "sequence");
  const forks = objectProperty(
    objectProperty(testObject, "poolOptions"),
    "forks",
  );
  const coverage = objectProperty(testObject, "coverage");
  const typecheck = objectProperty(testObject, "typecheck");
  const browser = objectProperty(testObject, "browser");
  const optimizer = objectProperty(
    objectProperty(objectProperty(testObject, "deps"), "optimizer"),
    "ssr",
  );
  const webOptimizer = objectProperty(
    objectProperty(objectProperty(testObject, "deps"), "optimizer"),
    "web",
  );
  if (
    evaluate(objectProperty(sequence, "shuffle"), constants) !== false ||
    evaluate(objectProperty(sequence, "concurrent"), constants) !== false ||
    evaluate(objectProperty(sequence, "setupFiles"), constants) !== "list" ||
    evaluate(objectProperty(forks, "singleFork"), constants) !== true ||
    evaluate(objectProperty(forks, "minForks"), constants) !== 1 ||
    evaluate(objectProperty(forks, "maxForks"), constants) !== 1 ||
    evaluate(objectProperty(coverage, "enabled"), constants) !== false ||
    evaluate(objectProperty(typecheck, "enabled"), constants) !== false ||
    evaluate(objectProperty(browser, "enabled"), constants) !== false ||
    evaluate(objectProperty(optimizer, "enabled"), constants) !== false ||
    evaluate(objectProperty(webOptimizer, "enabled"), constants) !== false
  ) {
    fail("nested fixed Vitest config mismatch");
  }
  const viteOptimizer = objectProperty(configObject, "optimizeDeps");
  if (
    evaluate(objectProperty(viteOptimizer, "disabled"), constants) !== true ||
    evaluate(objectProperty(viteOptimizer, "noDiscovery"), constants) !==
      true ||
    JSON.stringify(
      evaluate(objectProperty(viteOptimizer, "include"), constants),
    ) !== "[]"
  ) {
    fail("Vite dependency optimizer is not statically disabled");
  }
  const reporters = objectProperty(testObject, "reporters");
  if (
    !ts.isArrayLiteralExpression(reporters) ||
    reporters.elements.length !== 1
  ) {
    fail("reporter count mismatch");
  }
}

const testFiles = fixturePaths.filter((file) => file.endsWith(".test.ts"));
if (
  testFiles.length !== 1 ||
  path.basename(testFiles[0] ?? "") !== "designated.test.ts"
) {
  fail("fixture test file count must be exactly one TypeScript file");
}
const designatedTest = parsedFiles.get(testFiles[0]);
const fixtureCalls = designatedTest ? callNames(designatedTest) : [];
if (fixtureCalls.filter((call) => call === "test").length !== 1) {
  fail("fixture test case count must be exactly one");
}
const forbiddenFixtureCalls = [
  "describe",
  "suite",
  "it",
  "test.each",
  "test.for",
  "test.concurrent",
  "test.skip",
  "test.only",
  "vi.mock",
  "expect.addSnapshotSerializer",
];
if (
  fixtureCalls.some((call) =>
    forbiddenFixtureCalls.some(
      (forbidden) => call === forbidden || call.startsWith(`${forbidden}.`),
    ),
  ) ||
  fixturePaths.some(
    (file) => file.includes("__snapshots__") || file.endsWith(".snap"),
  )
) {
  fail("fixture contains suite/mock/snapshot/dynamic/concurrent behavior");
}

const manifestFile = parsedFiles.get(path.join(sourceRoot, "manifest.ts"));
let manifestReturnObject;
function findManifestReturn(node) {
  if (
    ts.isFunctionDeclaration(node) &&
    node.name?.text === "createFixedManifest" &&
    node.body
  ) {
    const returnStatement = node.body.statements.find(ts.isReturnStatement);
    if (returnStatement?.expression) {
      manifestReturnObject = unwrapExpression(returnStatement.expression);
    }
    return;
  }
  ts.forEachChild(node, findManifestReturn);
}
findManifestReturn(manifestFile);
if (
  !ts.isObjectLiteralExpression(manifestReturnObject) ||
  JSON.stringify(
    evaluate(objectProperty(manifestReturnObject, "toolApiTargets"), constants),
  ) !== "[]" ||
  JSON.stringify(
    evaluate(objectProperty(manifestReturnObject, "toolApiChanges"), constants),
  ) !== "[]"
) {
  fail("tool API target/change must be not applicable and empty");
}
if (
  JSON.stringify(
    evaluate(
      objectProperty(manifestReturnObject, "routeInvocations"),
      constants,
    ),
  ) !==
  JSON.stringify([
    {
      routeInvocationId: "vitest-late-module-evaluation-checkpoint",
      phase: "setup-file-late-module-checkpoint",
      triggerType: "configured",
      invocationKind: "module-evaluation",
      logicalUnitId: "vitest-setup-entry",
      enabled: true,
    },
    {
      routeInvocationId: "vitest-setup-body-checkpoint",
      phase: "setup-file-body-checkpoint",
      triggerType: "automatic",
      invocationKind: "setup-execution",
      logicalUnitId: "vitest-setup-entry",
      enabled: true,
    },
  ])
) {
  fail("same-import checkpoint manifest contract mismatch");
}
const localRunnerSource = parsedFiles.get(
  path.join(sourceRoot, "local-runner.ts"),
);
if (!localRunnerSource.getFullText().includes("process.argv.length !== 2")) {
  fail("local runner must reject all user arguments");
}

const processLifecycleSource = parsedFiles.get(
  path.join(sourceRoot, "process-lifecycle.ts"),
);
const processLifecycleText = processLifecycleSource.getFullText();
const processCalls = callNames(processLifecycleSource);
if (
  processCalls.filter((call) => call === "spawn").length !== 1 ||
  processCalls.some((call) => call.endsWith(".kill") && call !== "process.kill")
) {
  fail("coordinator spawn/termination handle contract mismatch");
}
const observedKillSignals = [];
function inspectFixedProcessTermination(node) {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === "process" &&
    node.expression.name.text === "kill"
  ) {
    const processGroup = node.arguments[0];
    const signal = node.arguments[1];
    if (
      processGroup === undefined ||
      !ts.isPrefixUnaryExpression(processGroup) ||
      processGroup.operator !== ts.SyntaxKind.MinusToken ||
      !ts.isIdentifier(processGroup.operand) ||
      processGroup.operand.text !== "processGroupId"
    ) {
      fail("termination must target only the fixed coordinator process group");
    }
    const fixedSignal = signal && evaluate(signal, constants);
    if (
      fixedSignal !== 0 &&
      fixedSignal !== "SIGTERM" &&
      fixedSignal !== "SIGKILL"
    ) {
      fail("termination signal must be a fixed literal");
    } else {
      observedKillSignals.push(fixedSignal);
    }
  }
  ts.forEachChild(node, inspectFixedProcessTermination);
}
inspectFixedProcessTermination(processLifecycleSource);
if (
  JSON.stringify(observedKillSignals.sort()) !==
  JSON.stringify([0, "SIGKILL", "SIGTERM"].sort())
) {
  fail("fixed TERM/KILL/residue process-group checks are incomplete");
}
let processSpawnOptions;
function findProcessSpawn(node) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "spawn"
  ) {
    processSpawnOptions = node.arguments[2];
  }
  ts.forEachChild(node, findProcessSpawn);
}
findProcessSpawn(processLifecycleSource);
if (
  !ts.isObjectLiteralExpression(processSpawnOptions) ||
  evaluate(objectProperty(processSpawnOptions, "shell"), constants) !== false ||
  evaluate(objectProperty(processSpawnOptions, "detached"), constants) !== true
) {
  fail("fixed coordinator spawn must use a Linux process group without shell");
}
for (const fixedEnvironmentEntry of [
  "TMPDIR: toolTempRoot",
  "TMP: toolTempRoot",
  "TEMP: toolTempRoot",
  "arguments: [vitestCliPath, ...FIXED_VITEST_ARGUMENTS]",
  "arguments: [FIXED_LIFECYCLE_COORDINATOR, mode]",
]) {
  if (!processLifecycleText.includes(fixedEnvironmentEntry)) {
    fail(`fixed process/temp contract missing: ${fixedEnvironmentEntry}`);
  }
}
if (
  processLifecycleText.includes("export function signal") ||
  processLifecycleText.includes("export function kill")
) {
  fail("arbitrary PID/process-group termination API is forbidden");
}
for (const lifecycleMarker of [
  "closeResult.code === null",
  "EXPECTED_GRACEFUL_CLOSE_SIGNAL",
  "EXPECTED_FORCE_CLOSE_SIGNAL",
  "M2C_GRACEFUL_TERMINATION_FAILED",
  "M2C_FORCE_TERMINATION_FAILED",
  "M2C_CLOSE_DEADLINE_EXCEEDED",
  "M2C_CLOSE_DISPOSITION_MISMATCH",
  "M2C_PROCESS_RESIDUE",
  "M2C_SETTLEMENT_UNKNOWN",
  'appendStage(trace, "close-disposition-validated")',
  'appendStage(trace, "settlement-unknown")',
]) {
  if (!processLifecycleText.includes(lifecycleMarker)) {
    fail(`fixed close/settlement contract missing: ${lifecycleMarker}`);
  }
}
for (const fixedFault of [
  '"graceful-signal-failure"',
  '"force-signal-failure"',
  '"close-deadline"',
  '"unexpected-close-disposition"',
  '"process-residue"',
]) {
  if (!processLifecycleText.includes(fixedFault)) {
    fail(`fixed lifecycle fault mode missing: ${fixedFault}`);
  }
}

const lifecycleCoordinatorSource = parsedFiles.get(
  path.join(fixtureRoot, "lifecycle-coordinator.mjs"),
);
let lifecycleSpawnOptions;
function findLifecycleSpawn(node) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "spawn"
  ) {
    lifecycleSpawnOptions = node.arguments[2];
  }
  ts.forEachChild(node, findLifecycleSpawn);
}
findLifecycleSpawn(lifecycleCoordinatorSource);
if (
  !ts.isObjectLiteralExpression(lifecycleSpawnOptions) ||
  evaluate(objectProperty(lifecycleSpawnOptions, "shell"), constants) !==
    false ||
  JSON.stringify(
    evaluate(objectProperty(lifecycleSpawnOptions, "env"), constants),
  ) !== "{}"
) {
  fail("lifecycle fixture child must use fixed empty-env shell-free spawn");
}

const toolTemporarySource = parsedFiles.get(
  path.join(sourceRoot, "tool-temporary.ts"),
);
const toolTemporaryText = toolTemporarySource.getFullText();
for (const boundaryMarker of [
  "VITE_CONFIG_TEMP_RELATIVE_PATH",
  "FIXED_NEAREST_NODE_MODULES_RELATIVE_PATH",
  "FIXED_SCENARIO_CONFIG",
  "resolveFixedConfigTemporaryBoundary",
  "resolveNearestConfigTemporaryBoundary",
  "lstatOptional",
  "canonicalRequired",
  "nodeModulesIdentity",
  "configIdentity",
  "TOOL_TEMP_RELATIVE_PATH",
  "CACHE_RELATIVE_PATH",
  "inspectToolTemporaryBoundary",
  "cleanupToolTemporaryBoundary",
]) {
  if (!toolTemporaryText.includes(boundaryMarker)) {
    fail(`tool temporary inventory boundary missing: ${boundaryMarker}`);
  }
}
const toolTemporaryCalls = callNames(toolTemporarySource);
if (
  toolTemporaryCalls.some(
    (call) => call === "access" || call.endsWith(".access"),
  ) ||
  !toolTemporaryCalls.includes("lstat") ||
  !toolTemporaryCalls.includes("realpath")
) {
  fail("tool temporary existence must use lstat/canonical fail-closed checks");
}
let fixedConfigResolverParameterCount;
function inspectFixedConfigResolver(node) {
  if (
    ts.isFunctionDeclaration(node) &&
    node.name?.text === "resolveFixedConfigTemporaryBoundary"
  ) {
    fixedConfigResolverParameterCount = node.parameters.length;
  }
  ts.forEachChild(node, inspectFixedConfigResolver);
}
inspectFixedConfigResolver(toolTemporarySource);
if (fixedConfigResolverParameterCount !== 0) {
  fail("production config-temp resolver must accept no config/path input");
}
if (
  toolTemporaryText.includes("rm(boundary.configTempRoot") ||
  toolTemporaryText.includes("rm(configTempRoot")
) {
  fail("pre-existing or post-run Vite config temp must never be deleted");
}

const scenarioSource = parsedFiles.get(path.join(sourceRoot, "scenario.ts"));
const scenarioText = scenarioSource.getFullText();
const unsafeGateIndex = scenarioText.indexOf("if (!cleanupSafe)");
const unsafeStageIndex = scenarioText.indexOf(
  'options.trace?.push("unsafe-cleanup-suppressed")',
  unsafeGateIndex,
);
const cleanupAllowedIndex = scenarioText.indexOf(
  'options.trace?.push("cleanup-allowed")',
  unsafeGateIndex,
);
const productionInventoryIndex = scenarioText.indexOf(
  "postInventory = await inspectToolTemporaryBoundary",
  unsafeGateIndex,
);
if (
  unsafeGateIndex < 0 ||
  unsafeStageIndex <= unsafeGateIndex ||
  cleanupAllowedIndex <= unsafeStageIndex ||
  productionInventoryIndex <= cleanupAllowedIndex ||
  !scenarioText.includes("error instanceof ProcessLifecycleError") ||
  !scenarioText.includes("!error.processSettled")
) {
  fail("unsafe process settlement must suppress production temp/run cleanup");
}

const packageIndexText = parsedFiles.get(rootEntry).getFullText();
for (const internalOnlyMarker of [
  "TOOL_TEMPORARY_TEST_ONLY",
  "runFixedLifecycleScenarioForTest",
  "FixedLifecycleFault",
]) {
  if (packageIndexText.includes(internalOnlyMarker)) {
    fail(
      `test-only lifecycle/temp API escaped package root: ${internalOnlyMarker}`,
    );
  }
}

const probeSourcePaths = await listFiles(
  path.join(repositoryRoot, "packages/probe-core/src"),
  (file) => /\.(?:ts|js)$/u.test(file),
);
for (const filePath of probeSourcePaths) {
  const sourceFile = parseSource(filePath, await readFile(filePath, "utf8"));
  for (const reference of moduleReferences(sourceFile)) {
    if (
      reference.specifier === "vitest" ||
      reference.specifier.includes("vitest-setup-probe") ||
      reference.specifier === "@tskaigi-lab/adapter-vitest-setup"
    ) {
      fail("probe-core reverse dependency on Vitest adapter/tool");
    }
  }
}
if (
  Object.keys(probePackage.dependencies ?? {}).length !== 0 ||
  Object.keys(probePackage.optionalDependencies ?? {}).length !== 0 ||
  Object.keys(probePackage.peerDependencies ?? {}).length !== 0
) {
  fail("probe-core runtime dependency direction changed");
}
const probeConstants = await readFile(
  path.join(repositoryRoot, "packages/probe-core/src/constants.ts"),
  "utf8",
);
if (
  !probeConstants.includes('"probe-manifest/v2"') ||
  !probeConstants.includes('"probe-event/v2"') ||
  !probeConstants.includes('"setup-execution"')
) {
  fail("M1 schema/invocation public contract mismatch");
}

if (errors.length > 0) {
  for (const error of errors) {
    process.stderr.write(`M2-C static verification failed: ${error}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    "M2-C Vitest static verification passed (TypeScript AST/module graph; not a runtime sandbox proof).\n",
  );
}
