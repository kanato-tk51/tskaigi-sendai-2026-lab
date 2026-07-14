import { readdir, readFile } from "node:fs/promises";
import { createRequire, isBuiltin } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const packageRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = path.join(packageRoot, "src");
const repositoryRoot = path.resolve(packageRoot, "../..");

const supportedRuntimeSourceExtensions = new Set([
  ".ts",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
]);
const forbiddenRuntimeSourceExtensions = new Set([".tsx", ".jsx"]);
const toolPackagePatterns = [
  /^eslint(?:\/|$)/u,
  /^vitest(?:\/|$)/u,
  /^vite(?:\/|$)/u,
  /^@eslint\//u,
  /^@vitest\//u,
  /^@vitejs\//u,
  /^rollup(?:\/|$)/u,
  /^@rollup\//u,
];

export function runtimeSourceFilePolicy(fileName) {
  const extension = path.extname(fileName);
  if (supportedRuntimeSourceExtensions.has(extension)) return "supported";
  if (forbiddenRuntimeSourceExtensions.has(extension)) return "forbidden-jsx";
  return "ignored";
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(entryPath)));
    } else if (runtimeSourceFilePolicy(entry.name) !== "ignored") {
      files.push(entryPath);
    }
  }
  return files;
}

function packageSpecifier(moduleSpecifier) {
  if (moduleSpecifier.startsWith("@")) {
    return moduleSpecifier.split("/").slice(0, 2).join("/");
  }
  return moduleSpecifier.split("/", 1)[0];
}

function isWithin(rootPath, candidatePath) {
  const relative = path.relative(rootPath, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function resolveAlias(moduleSpecifier, compilerOptions, packageDirectory) {
  const paths = compilerOptions?.paths ?? {};
  const baseUrl = path.resolve(
    packageDirectory,
    compilerOptions?.baseUrl ?? ".",
  );
  const resolvedTargets = [];
  for (const [pattern, replacements] of Object.entries(paths)) {
    const starIndex = pattern.indexOf("*");
    const prefix = starIndex === -1 ? pattern : pattern.slice(0, starIndex);
    const suffix = starIndex === -1 ? "" : pattern.slice(starIndex + 1);
    if (
      (starIndex === -1 && moduleSpecifier !== pattern) ||
      (starIndex !== -1 &&
        (!moduleSpecifier.startsWith(prefix) ||
          !moduleSpecifier.endsWith(suffix)))
    ) {
      continue;
    }
    const wildcard =
      starIndex === -1
        ? ""
        : moduleSpecifier.slice(
            prefix.length,
            moduleSpecifier.length - suffix.length,
          );
    resolvedTargets.push(
      ...(Array.isArray(replacements) ? replacements : []).map((replacement) =>
        path.resolve(baseUrl, replacement.replace("*", wildcard)),
      ),
    );
  }
  return resolvedTargets;
}

function literalModuleSpecifier(expression) {
  if (ts.isStringLiteralLike(expression)) {
    return expression.text;
  }
  if (ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  return null;
}

function scriptKind(fileName) {
  if (/\.(?:js|mjs|cjs)$/u.test(fileName)) return ts.ScriptKind.JS;
  if (fileName.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  return ts.ScriptKind.TS;
}

function moduleReferences(fileName, sourceText) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(fileName),
  );
  const references = [];

  const addLiteral = (node, kind) => {
    const specifier = literalModuleSpecifier(node);
    references.push(
      specifier === null
        ? { kind: "computed", moduleSpecifier: null }
        : { kind, moduleSpecifier: specifier },
    );
  };

  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    ) {
      addLiteral(node.moduleSpecifier, "static");
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression
    ) {
      addLiteral(node.moduleReference.expression, "require");
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        if (node.arguments.length !== 1) {
          references.push({ kind: "computed", moduleSpecifier: null });
        } else {
          addLiteral(node.arguments[0], "dynamic");
        }
      } else {
        const isRequire =
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require") ||
          (ts.isPropertyAccessExpression(node.expression) &&
            (node.expression.name.text === "require" ||
              (node.expression.name.text === "resolve" &&
                ts.isIdentifier(node.expression.expression) &&
                node.expression.expression.text === "require")));
        if (isRequire) {
          if (node.arguments.length !== 1) {
            references.push({ kind: "computed", moduleSpecifier: null });
          } else {
            addLiteral(node.arguments[0], "require");
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return references;
}

function isPlainRecord(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function packageImportsFailures(packageJson, packageDirectory) {
  const imports = packageJson.imports;
  if (imports === undefined) return [];
  if (!isPlainRecord(imports)) {
    return ["probe-core package imports must be an object or absent"];
  }

  const failures = [];
  for (const [specifier, target] of Object.entries(imports)) {
    if (
      !specifier.startsWith("#") ||
      specifier === "#" ||
      specifier.startsWith("#/")
    ) {
      failures.push(`invalid package imports specifier: ${specifier}`);
      continue;
    }
    if (specifier.includes("*")) {
      failures.push(
        `package imports wildcard patterns are unsupported: ${specifier}`,
      );
      continue;
    }
    if (Array.isArray(target)) {
      failures.push(
        `package imports target arrays are unsupported: ${specifier}`,
      );
      continue;
    }
    if (isPlainRecord(target)) {
      failures.push(
        `package imports conditional targets are unsupported: ${specifier}`,
      );
      continue;
    }
    if (typeof target !== "string") {
      failures.push(`invalid package imports target: ${specifier}`);
      continue;
    }
    if (!target.startsWith("./")) {
      failures.push(
        `package imports external target is forbidden: ${specifier} -> ${target}`,
      );
      continue;
    }
    const resolvedTarget = path.resolve(packageDirectory, target);
    if (!isWithin(packageDirectory, resolvedTarget)) {
      failures.push(
        `package imports target escapes package root: ${specifier} -> ${target}`,
      );
      continue;
    }
    failures.push(
      `package imports aliases are not approved for probe-core runtime source: ${specifier}`,
    );
  }
  return failures;
}

function hasExactPackageImport(packageJson, moduleSpecifier) {
  return (
    isPlainRecord(packageJson.imports) &&
    Object.prototype.hasOwnProperty.call(packageJson.imports, moduleSpecifier)
  );
}

function isBuiltinModuleSpecifier(moduleSpecifier) {
  return isBuiltin(moduleSpecifier);
}

function dependencyDirectionFailures({
  packageJson,
  sources,
  packageDirectory,
  workspacePackages = [],
  compilerOptions = {},
}) {
  const failures = packageImportsFailures(packageJson, packageDirectory);
  const workspacePackageNames = new Set(
    workspacePackages
      .map((workspacePackage) => workspacePackage.name)
      .filter((name) => name !== packageJson.name),
  );
  const workspaceDirectories = workspacePackages
    .filter((workspacePackage) => workspacePackage.name !== packageJson.name)
    .map((workspacePackage) => path.resolve(workspacePackage.directory));
  const runtimeSections = [
    "dependencies",
    "optionalDependencies",
    "peerDependencies",
  ];
  for (const section of runtimeSections) {
    for (const dependencyName of Object.keys(packageJson[section] ?? {})) {
      failures.push(
        `probe-core runtime dependency is forbidden: ${dependencyName}`,
      );
    }
  }
  for (const section of [
    ...runtimeSections,
    "devDependencies",
    "peerDependenciesMeta",
  ]) {
    for (const dependencyName of Object.keys(packageJson[section] ?? {})) {
      if (
        workspacePackageNames.has(dependencyName) ||
        toolPackagePatterns.some((pattern) => pattern.test(dependencyName))
      ) {
        failures.push(
          `probe-core dependency direction is forbidden: ${dependencyName}`,
        );
      }
    }
  }

  const sourceDirectory = path.join(packageDirectory, "src");
  const inspectResolvedPath = (fileName, moduleSpecifier, resolvedPath) => {
    if (!isWithin(sourceDirectory, resolvedPath)) {
      const workspaceEscape = workspaceDirectories.some((directory) =>
        isWithin(directory, resolvedPath),
      );
      failures.push(
        workspaceEscape
          ? `probe-core source imports a workspace package: ${fileName} -> ${moduleSpecifier}`
          : `probe-core source import escapes src: ${fileName} -> ${moduleSpecifier}`,
      );
    }
  };

  for (const [fileName, sourceText] of Object.entries(sources)) {
    const sourcePolicy = runtimeSourceFilePolicy(fileName);
    if (sourcePolicy === "forbidden-jsx") {
      failures.push(
        `JSX runtime source is forbidden in probe-core: ${fileName}`,
      );
      continue;
    }
    if (sourcePolicy !== "supported") {
      failures.push(`unsupported probe-core runtime source file: ${fileName}`);
      continue;
    }
    const absoluteFile = path.resolve(packageDirectory, fileName);
    for (const reference of moduleReferences(fileName, sourceText)) {
      if (reference.kind === "computed") {
        failures.push(`computed module loading is forbidden: ${fileName}`);
        continue;
      }
      const moduleSpecifier = reference.moduleSpecifier;
      if (isBuiltinModuleSpecifier(moduleSpecifier)) {
        continue;
      }
      if (moduleSpecifier.startsWith(".")) {
        inspectResolvedPath(
          fileName,
          moduleSpecifier,
          path.resolve(path.dirname(absoluteFile), moduleSpecifier),
        );
        continue;
      }
      if (moduleSpecifier.startsWith("#")) {
        failures.push(
          hasExactPackageImport(packageJson, moduleSpecifier)
            ? `package imports alias is forbidden in probe-core runtime source: ${fileName} -> ${moduleSpecifier}`
            : `unresolved package imports alias is forbidden: ${fileName} -> ${moduleSpecifier}`,
        );
        continue;
      }

      const aliases = resolveAlias(
        moduleSpecifier,
        compilerOptions,
        packageDirectory,
      );
      if (aliases.length > 0) {
        for (const alias of aliases) {
          inspectResolvedPath(fileName, moduleSpecifier, alias);
        }
        continue;
      }

      const dependencyName = packageSpecifier(moduleSpecifier);
      if (
        workspacePackageNames.has(dependencyName) ||
        toolPackagePatterns.some((pattern) => pattern.test(dependencyName))
      ) {
        failures.push(
          `probe-core source dependency is forbidden: ${fileName} -> ${moduleSpecifier}`,
        );
        continue;
      }
      if (
        typeof packageJson.name === "string" &&
        (moduleSpecifier === packageJson.name ||
          moduleSpecifier.startsWith(`${packageJson.name}/`))
      ) {
        failures.push(
          `probe-core package self-reference is forbidden: ${fileName} -> ${moduleSpecifier}`,
        );
        continue;
      }
      failures.push(
        `probe-core external bare module import is forbidden: ${fileName} -> ${moduleSpecifier}`,
      );
    }
  }
  return failures;
}

export function verifyProbeCoreStaticInputs(input) {
  const failures = dependencyDirectionFailures(input);
  const sources = new Map(Object.entries(input.sources));
  const combined = [...sources.values()].join("\n");
  const forbiddenPatterns = [
    [
      "environment Object enumeration",
      /Object\.(?:keys|values|entries|getOwnPropertyNames)\(process\.env/gu,
    ],
    ["environment reflection", /Reflect\.ownKeys\(process\.env/gu],
    ["environment spread", /\.\.\.process\.env/gu],
    ["environment serialization", /JSON\.stringify\(process\.env/gu],
    ["environment for-in enumeration", /for\s*\([^)]*\bin\s+process\.env/gu],
    ["eval", /\beval\s*\(/gu],
    ["Function constructor", /\bnew\s+Function\s*\(/gu],
    ["child_process exec", /\bexec(?:Sync)?\s*\(/gu],
    ["shell true", /shell\s*:\s*true/gu],
    [
      "hash string coercion",
      /\bString\s*\([^)]*(?:beforeHash|afterHash)|(?:beforeHash|afterHash)[^)]*\bString\s*\(/gu,
    ],
    ["external toJSON invocation", /\.toJSON\s*\(/gu],
    ["DNS module", /node:dns/gu],
    ["DNS lookup", /\blookup\s*\(/gu],
  ];
  for (const [label, pattern] of forbiddenPatterns) {
    if (pattern.test(combined)) failures.push(`forbidden ${label}`);
  }

  const spawnLocations = [...sources.entries()]
    .filter(([, source]) => /\bspawn\s*\(/u.test(source))
    .map(([file]) => file);
  if (
    spawnLocations.length !== 1 ||
    spawnLocations[0] !== "src/attempts/child.ts"
  ) {
    failures.push("spawn must occur only in src/attempts/child.ts");
  }

  const childSource = sources.get("src/attempts/child.ts") ?? "";
  for (const required of [
    "trustedRuntime.nodeExecutable",
    "trustedRuntime.fixedChildScriptPath",
    "shell: false",
    "env: {}",
  ]) {
    if (!childSource.includes(required)) {
      failures.push(`fixed child boundary missing: ${required}`);
    }
  }
  if (childSource.includes("process.execPath")) {
    failures.push("child spawn must not read mutable process.execPath");
  }

  const validationSource = sources.get("src/validation.ts") ?? "";
  if ((combined.match(/process\.execPath/gu) ?? []).length !== 1) {
    failures.push(
      "process.execPath must be read exactly once at trusted initialization",
    );
  }
  for (const required of [
    "const nodeExecutable = process.execPath",
    'new URL("./fixed-child.js", import.meta.url)',
    "new WeakMap<",
    "cloneManifest(parsedManifest)",
    "cloneRuntimeBindings(parsedRuntimeBindings)",
    '["targetId", "kind", "timeoutMs", "maxOutputBytes"]',
  ]) {
    if (!validationSource.includes(required)) {
      failures.push(`validated configuration boundary missing: ${required}`);
    }
  }

  const eventSource = sources.get("src/event.ts") ?? "";
  for (const required of [
    'typeof value === "string" && sha256Pattern.test(value)',
    'snapshotPlainRecord(input, "SERIALIZATION_FAILURE")',
    "assertCapabilityInvariants(event, attempt)",
    "assertRouteInvocationInvariants(event, definition)",
    "assertToolApiChangeInvariants(event, definition, target)",
  ]) {
    if (!eventSource.includes(required)) {
      failures.push(`canonical event boundary missing: ${required}`);
    }
  }

  const publicTypesSource = sources.get("src/types.ts") ?? "";
  if (
    /readonly\s+(?:executable|script|arguments)\??\s*:/u.test(publicTypesSource)
  ) {
    failures.push("public types must not expose arbitrary child process input");
  }
  const indexSource = sources.get("src/index.ts") ?? "";
  if (
    indexSource.includes("createProbeEventFactory") ||
    indexSource.includes("createJsonlEventSink") ||
    indexSource.includes("ProbeEventSink") ||
    indexSource.includes("calculateBoundFileSha256") ||
    indexSource.includes("calculatePreparedFileSha256")
  ) {
    failures.push(
      "public API must not expose arbitrary event or sink injection",
    );
  }
  for (const forbiddenField of [
    "canonicalRootPath",
    "canonicalPath",
    "deviceId",
    "inodeId",
  ]) {
    if (
      publicTypesSource.includes(forbiddenField) ||
      eventSource.includes(forbiddenField)
    ) {
      failures.push(
        `canonical file identity must not enter public event types: ${forbiddenField}`,
      );
    }
  }

  const networkSource = sources.get("src/attempts/network.ts") ?? "";
  const constantsSource = sources.get("src/constants.ts") ?? "";
  for (const required of [
    "method: NETWORK_CANARY_METHOD",
    "path: NETWORK_CANARY_PATH",
    "agent: false",
    "performance.now() + target.timeoutMs",
    "scheduleDeadline",
    "destroyTransport",
    "maxHeaderSize: MAX_NETWORK_RESPONSE_HEADER_BYTES",
    "Buffer.concat(responseChunks).equals",
  ]) {
    if (!networkSource.includes(required)) {
      failures.push(`fixed network boundary missing: ${required}`);
    }
  }
  if (/new\s+URL\s*\(/u.test(networkSource)) {
    failures.push("network attempt must not accept or construct URLs");
  }
  for (const required of [
    'NETWORK_CANARY_METHOD = "GET"',
    'NETWORK_CANARY_PATH = "/probe-canary"',
    '"x-tskaigi-probe-canary"',
    'NETWORK_CANARY_HEADER_VALUE = "probe-network-v1"',
    "MAX_EVENTS_PER_SEGMENT",
    "MAX_SEGMENT_BYTES",
  ]) {
    if (!constantsSource.includes(required)) {
      failures.push(`fixed network/segment policy missing: ${required}`);
    }
  }

  const fileAttemptSource = sources.get("src/attempts/file.ts") ?? "";
  const fileReadSource = fileAttemptSource.slice(
    fileAttemptSource.indexOf("export async function executeFileReadAttempt"),
    fileAttemptSource.indexOf("function fixedMarker"),
  );
  if (
    fileReadSource.includes("calculateBoundFileSha256") ||
    fileReadSource.includes("createHash(") ||
    !fileReadSource.includes("afterHash: null")
  ) {
    failures.push("canary file read must not calculate or emit a content hash");
  }
  for (const required of [
    'value.classification !== "canary"',
    'value.classification !== "source"',
    'value.classification !== "artifact"',
    'value.classification !== "output"',
  ]) {
    if (!validationSource.includes(required)) {
      failures.push(`file target classification boundary missing: ${required}`);
    }
  }
  const hashSource = sources.get("src/hash.ts") ?? "";
  for (const required of [
    "PreparedProbeConfiguration",
    "attemptId: string",
    'attempt?.type !== "file-hash"',
    'resolved.target.classification !== "source"',
    'resolved.target.classification !== "artifact"',
  ]) {
    if (!hashSource.includes(required)) {
      failures.push(`prepared hash boundary missing: ${required}`);
    }
  }

  const sessionSource = sources.get("src/session.ts") ?? "";
  if (!sessionSource.includes("createOfficialJsonlEventSink(configuration)")) {
    failures.push("public session must own its official evidence sink");
  }
  for (const required of [
    "PreparedProbeConfiguration",
    "getPreparedProbeConfigurationSnapshot(configuration)",
  ]) {
    if (!sessionSource.includes(required)) {
      failures.push(`prepared session boundary missing: ${required}`);
    }
  }
  const preparationSource = sources.get("src/preparation.ts") ?? "";
  for (const required of [
    "new WeakMap<",
    "prepareFileTargets(",
    "getValidatedProbeConfigurationSnapshot(configuration)",
  ]) {
    if (!preparationSource.includes(required)) {
      failures.push(`prepared configuration boundary missing: ${required}`);
    }
  }
  const filePreflightSource = sources.get("src/file-preflight.ts") ?? "";
  for (const required of [
    "await realpath(binding.rootPath)",
    "await realpath(candidatePath)",
    "fileStats.dev",
    "fileStats.ino",
    'new ProbeError("FILE_TARGET_CANONICAL_ALIAS")',
    'new ProbeError("FILE_TARGET_IDENTITY_ALIAS")',
    'new ProbeError("FILE_TARGET_OUTPUT_ALIAS")',
  ]) {
    if (!filePreflightSource.includes(required)) {
      failures.push(`file identity preflight missing: ${required}`);
    }
  }
  const sinkSource = sources.get("src/sink.ts") ?? "";
  for (const required of [
    "MAX_EVENTS_PER_SEGMENT",
    "MAX_EVENT_LINE_BYTES",
    "MAX_SEGMENT_BYTES",
    "while (offset < line.byteLength)",
    'new ProbeError("EVIDENCE_WRITE_FAILURE")',
    "partialLine ||= hasPartialLine",
  ]) {
    if (!sinkSource.includes(required)) {
      failures.push(`event sink safety policy missing: ${required}`);
    }
  }

  const pathPolicySource = sources.get("src/path-policy.ts") ?? "";
  if (
    !pathPolicySource.includes("constants.O_EXCL") ||
    pathPolicySource.includes("constants.O_TRUNC")
  ) {
    failures.push("generic file write must be exclusive and non-truncating");
  }
  if (!pathPolicySource.includes("getPreparedProbeConfigurationSnapshot")) {
    failures.push("file operations must use prepared configuration state");
  }
  const errorsSource = sources.get("src/errors.ts") ?? "";
  for (const required of [
    'case "read":\n        return "READ_DENIED"',
    'case "hash":\n        return "HASH_DENIED"',
    'case "write":\n        return "WRITE_DENIED"',
  ]) {
    if (!errorsSource.includes(required)) {
      failures.push(`operation-specific error taxonomy missing: ${required}`);
    }
  }
  const environmentSource = sources.get("src/attempts/environment.ts") ?? "";
  if ((environmentSource.match(/process\.env\[/gu) ?? []).length !== 1) {
    failures.push(
      "environment attempt must use exactly one named property access",
    );
  }

  return {
    status: failures.length === 0 ? "success" : "failure",
    checkedSourceFiles: sources.size,
    failures: [...new Set(failures)],
    limitation:
      "Static source inspection supplements unit tests and human review; it does not prove runtime isolation or detect every aliased/custom module loader.",
  };
}

async function workspacePackages() {
  const entries = await readdir(path.join(repositoryRoot, "packages"), {
    withFileTypes: true,
  });
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(repositoryRoot, "packages", entry.name);
    try {
      const packageJson = JSON.parse(
        await readFile(path.join(directory, "package.json"), "utf8"),
      );
      if (typeof packageJson.name === "string") {
        packages.push({ name: packageJson.name, directory });
      }
    } catch {
      // A non-package directory is irrelevant to dependency direction.
    }
  }
  return packages;
}

export async function verifyProbeCoreStaticSafety() {
  const files = await sourceFiles(sourceRoot);
  const sources = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [
        path.relative(packageRoot, file).replaceAll(path.sep, "/"),
        await readFile(file, "utf8"),
      ]),
    ),
  );
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  const tsconfig = JSON.parse(
    await readFile(path.join(packageRoot, "tsconfig.json"), "utf8"),
  );
  return verifyProbeCoreStaticInputs({
    packageJson,
    sources,
    packageDirectory: packageRoot,
    workspacePackages: await workspacePackages(),
    compilerOptions: tsconfig.compilerOptions ?? {},
  });
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const result = await verifyProbeCoreStaticSafety();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== "success") process.exitCode = 1;
}
