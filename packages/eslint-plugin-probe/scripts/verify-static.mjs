import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const repositoryRoot = path.resolve(packageRoot, "../..");

function fail(code, check) {
  process.stderr.write(
    `${JSON.stringify({ status: "failure", code, check })}\n`,
  );
  process.exitCode = 1;
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(candidate)));
    } else if (entry.isFile() && /\.(?:ts|js|mjs)$/u.test(entry.name)) {
      files.push(candidate);
    }
  }
  return files;
}

try {
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  const indexSource = await readFile(
    path.join(packageRoot, "src/index.ts"),
    "utf8",
  );
  const runtimeSource = await readFile(
    path.join(packageRoot, "src/runtime-context.ts"),
    "utf8",
  );
  const scenarioSource = await readFile(
    path.join(packageRoot, "src/scenario.ts"),
    "utf8",
  );
  const pluginSources = await Promise.all(
    ["src/plugin-entry.ts", "src/rule.ts"].map((relativePath) =>
      readFile(path.join(packageRoot, relativePath), "utf8"),
    ),
  );
  const allFiles = await sourceFiles(path.join(packageRoot, "src"));
  const allSource = (
    await Promise.all(allFiles.map((file) => readFile(file, "utf8")))
  ).join("\n");
  const probeCoreSource = (
    await Promise.all(
      (
        await sourceFiles(path.join(repositoryRoot, "packages/probe-core/src"))
      ).map((file) => readFile(file, "utf8")),
    )
  ).join("\n");

  const dependencies = packageJson.dependencies ?? {};
  const lifecycleScripts = ["preinstall", "install", "postinstall", "prepare"];
  const checks = {
    packageName: packageJson.name === "@tskaigi-lab/adapter-eslint",
    privatePackage: packageJson.private === true,
    esmPackage: packageJson.type === "module",
    rootExport: packageJson.exports?.["."]?.import === "./dist/index.js",
    pluginExport:
      packageJson.exports?.["./plugin"]?.import === "./dist/plugin-entry.js",
    dependencySet:
      Object.keys(dependencies).sort().join(",") ===
      "@tskaigi-lab/probe-core,eslint",
    probeCoreVersion: dependencies["@tskaigi-lab/probe-core"] === "0.0.0",
    eslintVersion: dependencies.eslint === "9.39.5",
    noLifecycleScripts: lifecycleScripts.every(
      (name) => packageJson.scripts?.[name] === undefined,
    ),
    rootDoesNotImportPlugin: !indexSource.includes("plugin-entry"),
    rootDoesNotRecordPlugin: !indexSource.includes("recordPlugin"),
    fixedPluginUrl: runtimeSource.includes(
      'new URL("./plugin-entry.js", import.meta.url)',
    ),
    noArbitraryCallback: !runtimeSource.includes("callback:"),
    noRawEventInput: !runtimeSource.includes("event:"),
    noRawDetailsInput: !runtimeSource.includes("details:"),
    cacheDisabled: scenarioSource.includes("cache: false"),
    configLookupDisabled: scenarioSource.includes("overrideConfigFile: true"),
    globInputDisabled: scenarioSource.includes("globInputPaths: false"),
    concurrencyDisabled: scenarioSource.includes('concurrency: "off"'),
    fixtureCountFixed: scenarioSource.includes(
      "lintResults.length !== FIXTURE_FILE_COUNT",
    ),
    watchAbsent: !scenarioSource.includes("watch"),
    pluginSourcesIsolated: pluginSources.every(
      (source) =>
        !/node:(?:fs|http|https|net|tls|child_process)/u.test(source) &&
        !source.includes("process.env") &&
        !source.includes("Object.keys(process.env") &&
        !source.includes("Reflect.ownKeys(process.env"),
    ),
    noShellTrue: !allSource.includes("shell: true"),
    noPluginPathInput: !allSource.includes("pluginPath"),
    noConfigPathInput: !allSource.includes("configPath"),
    noFixturePathInput: !allSource.includes("fixturePathInput"),
    noPublicRecordEvent: !indexSource.includes("recordEvent"),
    noPublicEventDetails: !indexSource.includes("eventDetails"),
    probeCoreDirection:
      !probeCoreSource.includes("@tskaigi-lab/adapter-eslint") &&
      !probeCoreSource.includes("eslint-plugin-probe"),
  };
  const failedCheck = Object.entries(checks).find(([, passed]) => !passed)?.[0];

  if (failedCheck !== undefined) {
    fail("ESLINT_STATIC_POLICY_FAILED", failedCheck);
  } else {
    process.stdout.write(
      `${JSON.stringify({ status: "success", verifier: "m2-b-eslint-static" })}\n`,
    );
  }
} catch {
  fail("ESLINT_STATIC_VERIFIER_FAILED", "verifier-exception");
}
