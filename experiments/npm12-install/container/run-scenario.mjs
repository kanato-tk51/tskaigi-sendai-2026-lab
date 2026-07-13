import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";

const SCENARIO_IDS = [
  "unapproved-install",
  "approved-rebuild",
  "approved-scripts-disabled",
  "approved-reinstall",
  "approved-ci",
];
const EXPECTED = {
  "unapproved-install":
    "Matrix hypothesis: an unapproved dependency install lifecycle invocation count is 0.",
  "approved-rebuild":
    "Mapped control hypothesis: official approval followed by rebuild invokes postinstall once.",
  "approved-scripts-disabled":
    "Mapped control hypothesis: explicit --ignore-scripts prevents postinstall even when approval state is retained.",
  "approved-reinstall":
    "Mapped control hypothesis: official approval retained across reinstall invokes postinstall once.",
  "approved-ci":
    "Mapped control hypothesis: official approval and a valid lockfile allow npm ci to invoke postinstall once.",
};

const WORK_ROOT = "/work";
const CONSUMER_ROOT = "/work/consumer";
const INPUT_ROOT = "/work/input";
const OUTPUT_ROOT = "/m0-output";
const MARKER_PATH = "/m0-output/marker.jsonl";
const PACKAGE_PATH = "/work/consumer/package.json";
const LOCK_PATH = "/work/consumer/package-lock.json";
const NODE_MODULES_PATH = "/work/consumer/node_modules";
const NPM_PATH = "/usr/local/bin/npm";
const NODE_PATH = "/usr/local/bin/node";
const APPROVAL_DOC_PATH =
  "/usr/local/lib/node_modules/npm/docs/content/commands/npm-approve-scripts.md";
const CONFIG_DOC_PATH =
  "/usr/local/lib/node_modules/npm/docs/content/using-npm/config.md";
const COMMAND_TIMEOUT_MS = 120_000;
const LOG_LIMIT_BYTES = 65_536;
const OUTPUT_BUNDLE_PREFIX = "M0_OUTPUT_BUNDLE_V1:";
const ANSI_ESCAPE_PATTERN = new RegExp(
  String.raw`\u001B\[[0-?]*[ -/]*[@-~]`,
  "gu",
);

const FIXED_COMMAND_ENVIRONMENT = Object.freeze({
  HOME: "/work/npm-home",
  PATH: "/usr/local/bin:/usr/bin:/bin",
  PAGER: "cat",
  MANPAGER: "cat",
  NO_COLOR: "1",
  FORCE_COLOR: "0",
  npm_config_cache: "/work/npm-cache",
  npm_config_userconfig: "/work/npm-home/user.npmrc",
  npm_config_globalconfig: "/work/npm-home/global.npmrc",
  npm_config_prefix: "/work/npm-prefix",
});

function sanitizeLog(value) {
  return value
    .replace(ANSI_ESCAPE_PATTERN, "")
    .replaceAll("/work/npm-cache", "<npm-cache>");
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function hashIfPresent(filePath) {
  if (!(await exists(filePath))) return null;
  const contents = await readFile(filePath);
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}

function allowScriptsFrom(packageJson) {
  const value = packageJson?.allowScripts;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return JSON.parse(JSON.stringify(value));
}

async function appendLimited(state, chunk) {
  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  const remaining = LOG_LIMIT_BYTES - state.length;
  if (remaining <= 0) {
    state.truncated = true;
    return;
  }
  state.chunks.push(buffer.subarray(0, remaining));
  state.length += Math.min(buffer.length, remaining);
  if (buffer.length > remaining) state.truncated = true;
}

async function runFixedCommand({
  command,
  executable,
  arguments: commandArguments,
  cwd,
  cwdId,
  role,
  stepId,
  stdoutPath,
  stderrPath,
  timeoutMs = COMMAND_TIMEOUT_MS,
}) {
  const stdout = { chunks: [], length: 0, truncated: false };
  const stderr = { chunks: [], length: 0, truncated: false };
  const startTimestamp = new Date().toISOString();
  const start = performance.now();
  let timedOut = false;
  let spawnErrorCode = null;
  await writeJson(path.join(OUTPUT_ROOT, ".command-state.json"), {
    schemaVersion: 1,
    stepId,
    state: "started",
    startTimestamp,
  });

  const outcome = await new Promise((resolve) => {
    const child = spawn(executable, commandArguments, {
      cwd,
      env: FIXED_COMMAND_ENVIRONMENT,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    const finish = (exitCode, signal) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode, signal });
    };
    child.stdout.on("data", (chunk) => void appendLimited(stdout, chunk));
    child.stderr.on("data", (chunk) => void appendLimited(stderr, chunk));
    child.on("error", (error) => {
      spawnErrorCode = typeof error.code === "string" ? error.code : "UNKNOWN";
      finish(null, null);
    });
    child.on("exit", (exitCode, signal) => finish(exitCode, signal));
    child.on("close", (exitCode, signal) => finish(exitCode, signal));
    let forceKill = null;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      forceKill = setTimeout(() => {
        child.stdout.destroy();
        child.stderr.destroy();
        child.kill("SIGKILL");
      }, 2000);
    }, timeoutMs);
    child.on("exit", () => {
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
    });
    child.on("close", () => {
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
    });
    child.on("error", () => {
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
    });
  });

  const stdoutText = sanitizeLog(Buffer.concat(stdout.chunks).toString("utf8"));
  const stderrText = sanitizeLog(Buffer.concat(stderr.chunks).toString("utf8"));
  await mkdir(path.dirname(stdoutPath), { recursive: true });
  await mkdir(path.dirname(stderrPath), { recursive: true });
  await writeFile(stdoutPath, stdoutText, "utf8");
  await writeFile(stderrPath, stderrText, "utf8");
  await writeJson(path.join(OUTPUT_ROOT, ".command-state.json"), {
    schemaVersion: 1,
    stepId,
    state: "completed",
    timedOut,
    exitCode: outcome.exitCode,
  });

  return {
    stepId,
    role,
    command,
    arguments: commandArguments,
    cwd: cwdId,
    startTimestamp,
    endTimestamp: new Date().toISOString(),
    durationMs: Math.round((performance.now() - start) * 1000) / 1000,
    exitCode: outcome.exitCode,
    signal: outcome.signal,
    timedOut,
    spawnErrorCode,
    stdoutPath: stdoutPath.replace(`${OUTPUT_ROOT}/`, ""),
    stderrPath: stderrPath.replace(`${OUTPUT_ROOT}/`, ""),
    stdoutTruncated: stdout.truncated,
    stderrTruncated: stderr.truncated,
    outputLimitBytes: LOG_LIMIT_BYTES,
    timeoutMs,
  };
}

async function assertFreshRuntime() {
  const workEntries = await readdir(WORK_ROOT);
  const outputEntries = await readdir(OUTPUT_ROOT);
  if (workEntries.length !== 0 || outputEntries.length !== 0) {
    throw new Error("ISOLATION_STATE_NOT_FRESH");
  }
}

async function prepareConsumer() {
  await mkdir(CONSUMER_ROOT, { recursive: true });
  await mkdir(INPUT_ROOT, { recursive: true });
  await mkdir("/work/npm-home", { recursive: true });
  await mkdir("/work/npm-cache", { recursive: true });
  await mkdir("/work/npm-prefix", { recursive: true });
  await cp("/opt/m0-input/consumer", CONSUMER_ROOT, { recursive: true });
  await copyFile(
    "/opt/m0-input/tarball/m0-install-marker-1.0.0.tgz",
    "/work/input/m0-install-marker-1.0.0.tgz",
  );
  await writeFile("/work/npm-home/user.npmrc", "", "utf8");
  await writeFile("/work/npm-home/global.npmrc", "", "utf8");
}

async function recordConfiguration(outputDirectory, commands) {
  const keys = [
    "ignore-scripts",
    "strict-allow-scripts",
    "allow-file",
    "allow-directory",
    "allow-git",
    "allow-remote",
    "cache",
    "userconfig",
    "globalconfig",
  ];
  const values = {};
  for (const key of keys) {
    const stepId = `config-${key}`;
    const command = await runFixedCommand({
      command: "npm",
      executable: NPM_PATH,
      arguments: ["config", "get", key],
      cwd: CONSUMER_ROOT,
      cwdId: "<consumer>",
      role: "setup",
      stepId,
      stdoutPath: path.join(outputDirectory, "setup", `${stepId}.stdout.log`),
      stderrPath: path.join(outputDirectory, "setup", `${stepId}.stderr.log`),
    });
    commands.push(command);
    const stdout = await readFile(
      path.join(OUTPUT_ROOT, command.stdoutPath),
      "utf8",
    );
    values[key] = {
      value: command.exitCode === 0 ? stdout.trim() : null,
      exitCode: command.exitCode,
      source: "consumer project config or fixed scenario user/global config",
    };
  }
  return values;
}

async function markerObservation() {
  if (!(await exists(MARKER_PATH))) {
    return { present: false, count: 0, parseErrors: [], events: [] };
  }
  const contents = await readFile(MARKER_PATH, "utf8");
  const lines = contents.split("\n").filter((line) => line.length > 0);
  const events = [];
  const parseErrors = [];
  for (const [index, line] of lines.entries()) {
    try {
      const event = JSON.parse(line);
      const valid =
        event.schemaVersion === 1 &&
        event.packageName === "@tskaigi-lab/m0-install-marker" &&
        event.packageVersion === "1.0.0" &&
        event.lifecycle === "postinstall" &&
        Number.isInteger(event.pid) &&
        typeof event.timestamp === "string";
      if (!valid)
        parseErrors.push({ line: index + 1, code: "MARKER_SCHEMA_INVALID" });
      else events.push(event);
    } catch {
      parseErrors.push({ line: index + 1, code: "MARKER_JSON_INVALID" });
    }
  }
  return {
    present: true,
    count: parseErrors.length === 0 ? events.length : null,
    parseErrors,
    events,
  };
}

async function clearMarker() {
  try {
    await unlink(MARKER_PATH);
  } catch (error) {
    if (!error || typeof error !== "object" || error.code !== "ENOENT")
      throw error;
  }
}

async function copySnapshotIfPresent(sourcePath, destinationPath) {
  if (!(await exists(sourcePath))) return { state: "absent", path: null };
  await copyFile(sourcePath, destinationPath);
  return {
    state: "present",
    path: destinationPath.replace(`${OUTPUT_ROOT}/`, ""),
  };
}

async function runNpmStep(outputDirectory, commands, stepId, role, arguments_) {
  const isMeasured = role === "measured";
  const command = await runFixedCommand({
    command: "npm",
    executable: NPM_PATH,
    arguments: arguments_,
    cwd: CONSUMER_ROOT,
    cwdId: "<consumer>",
    role,
    stepId,
    stdoutPath: isMeasured
      ? path.join(outputDirectory, "stdout.log")
      : path.join(outputDirectory, "setup", `${stepId}.stdout.log`),
    stderrPath: isMeasured
      ? path.join(outputDirectory, "stderr.log")
      : path.join(outputDirectory, "setup", `${stepId}.stderr.log`),
  });
  commands.push(command);
  return command;
}

async function approveDependency(outputDirectory, commands) {
  const beforePackage = await readJson(PACKAGE_PATH);
  const before = allowScriptsFrom(beforePackage);
  const command = await runNpmStep(
    outputDirectory,
    commands,
    "official-approval",
    "setup",
    ["approve-scripts", "@tskaigi-lab/m0-install-marker"],
  );
  const afterPackage = await readJson(PACKAGE_PATH);
  const after = allowScriptsFrom(afterPackage);
  return {
    before,
    after,
    changed: JSON.stringify(before) !== JSON.stringify(after),
    command,
  };
}

async function runScenario(scenarioId) {
  if (!SCENARIO_IDS.includes(scenarioId)) {
    throw new Error(`INVALID_SCENARIO_ID:${scenarioId}`);
  }
  await assertFreshRuntime();
  await prepareConsumer();

  const outputDirectory = path.join(OUTPUT_ROOT, "scenarios", scenarioId);
  await mkdir(path.join(outputDirectory, "setup"), { recursive: true });
  await mkdir(path.join(outputDirectory, "snapshots"), { recursive: true });
  const commands = [];
  const configuration = await recordConfiguration(outputDirectory, commands);
  const initialPackage = await readJson(PACKAGE_PATH);
  await writeJson(
    path.join(outputDirectory, "package-before.json"),
    initialPackage,
  );
  const initialLockHash = await hashIfPresent(LOCK_PATH);
  const initialMarker = await markerObservation();
  const initialState = {
    markerCount: initialMarker.count,
    approvalEntry: allowScriptsFrom(initialPackage),
    lockfileHash: initialLockHash,
    nodeModulesPresent: await exists(NODE_MODULES_PATH),
    cacheEntries: (await readdir("/work/npm-cache")).length,
  };

  let approval = {
    before: allowScriptsFrom(initialPackage),
    after: allowScriptsFrom(initialPackage),
    changed: false,
    command: null,
  };
  let pendingApproval = null;
  let measuredCommand = null;
  let lockBefore = await copySnapshotIfPresent(
    LOCK_PATH,
    path.join(outputDirectory, "lock-before.json"),
  );
  const markerCounts = { initial: initialMarker.count };

  if (scenarioId === "unapproved-install") {
    measuredCommand = await runNpmStep(
      outputDirectory,
      commands,
      "unapproved-install",
      "measured",
      ["install"],
    );
  } else {
    const initialInstall = await runNpmStep(
      outputDirectory,
      commands,
      "initial-unapproved-install",
      "setup",
      ["install"],
    );
    const packageInNodeModulesPath =
      "/work/consumer/node_modules/@tskaigi-lab/m0-install-marker/package.json";
    markerCounts.afterInitialInstall = (await markerObservation()).count;
    pendingApproval = {
      initialInstallExitCode: initialInstall.exitCode,
      allowScriptsAbsent:
        allowScriptsFrom(await readJson(PACKAGE_PATH)) === null,
      installedPackagePresent: await exists(packageInNodeModulesPath),
      installedPackageDeclaresPostinstall: (await exists(
        packageInNodeModulesPath,
      ))
        ? (await readJson(packageInNodeModulesPath)).scripts?.postinstall ===
          "node ./write-marker.mjs"
        : false,
    };
    approval = await approveDependency(outputDirectory, commands);
    await writeJson(
      path.join(outputDirectory, "snapshots", "package-after-approval.json"),
      await readJson(PACKAGE_PATH),
    );
    markerCounts.afterApproval = (await markerObservation()).count;
    await clearMarker();

    lockBefore = await copySnapshotIfPresent(
      LOCK_PATH,
      path.join(outputDirectory, "lock-before.json"),
    );
    await writeJson(
      path.join(outputDirectory, "snapshots", "package-measured-before.json"),
      await readJson(PACKAGE_PATH),
    );

    if (scenarioId === "approved-rebuild") {
      measuredCommand = await runNpmStep(
        outputDirectory,
        commands,
        "approved-rebuild",
        "measured",
        ["rebuild", "@tskaigi-lab/m0-install-marker"],
      );
    } else {
      await rm(NODE_MODULES_PATH, { recursive: true, force: true });
      if (scenarioId === "approved-scripts-disabled") {
        measuredCommand = await runNpmStep(
          outputDirectory,
          commands,
          "approved-scripts-disabled-ci",
          "measured",
          ["ci", "--ignore-scripts"],
        );
      } else if (scenarioId === "approved-reinstall") {
        measuredCommand = await runNpmStep(
          outputDirectory,
          commands,
          "approved-reinstall",
          "measured",
          ["install"],
        );
      } else if (scenarioId === "approved-ci") {
        measuredCommand = await runNpmStep(
          outputDirectory,
          commands,
          "approved-ci",
          "measured",
          ["ci"],
        );
      }
    }
  }

  const finalMarker = await markerObservation();
  const finalPackage = await readJson(PACKAGE_PATH);
  const finalLockHash = await hashIfPresent(LOCK_PATH);
  const lockBeforeHash = await hashIfPresent(
    path.join(outputDirectory, "lock-before.json"),
  );
  const packageAfterState = await copySnapshotIfPresent(
    PACKAGE_PATH,
    path.join(outputDirectory, "package-after.json"),
  );
  const lockAfter = await copySnapshotIfPresent(
    LOCK_PATH,
    path.join(outputDirectory, "lock-after.json"),
  );
  const markerArtifact = await copySnapshotIfPresent(
    MARKER_PATH,
    path.join(outputDirectory, "marker.jsonl"),
  );

  let status = "success";
  const limitations = [
    "A single small append is used for each marker, but filesystem-level atomicity is not proven.",
    "This marker-only spike does not measure general dependency capabilities.",
  ];
  if (
    !measuredCommand ||
    measuredCommand.timedOut ||
    finalMarker.parseErrors.length > 0
  ) {
    status = "inconclusive";
  } else if (scenarioId !== "unapproved-install") {
    if (
      approval.command?.exitCode !== 0 ||
      approval.after === null ||
      !approval.changed
    ) {
      status = "inconclusive";
      limitations.push(
        "The official approval command did not produce a confirmed allowScripts state change.",
      );
    } else if (measuredCommand.exitCode !== 0) {
      status = "failure";
    }
  } else if (measuredCommand.exitCode !== 0) {
    status = "failure";
  }

  const result = {
    schemaVersion: 1,
    scenarioId,
    status,
    expected: EXPECTED[scenarioId],
    setupSteps: commands
      .filter((command) => command.role === "setup")
      .map((command) => ({
        stepId: command.stepId,
        command: command.command,
        arguments: command.arguments,
        exitCode: command.exitCode,
      })),
    measuredCommand,
    exitCode: measuredCommand?.exitCode ?? null,
    markerPresent: finalMarker.present,
    markerCount: finalMarker.count,
    markerParseErrors: finalMarker.parseErrors,
    approvalEntryBefore: approval.before,
    approvalEntryAfter: approval.after,
    approvalChanged: approval.changed,
    pendingApproval,
    packageLockHashBefore: lockBeforeHash,
    packageLockHashAfter: finalLockHash,
    initialState,
    finalState: {
      nodeModulesPresent: await exists(NODE_MODULES_PATH),
      cacheEntries: (await readdir("/work/npm-cache")).length,
      allowScripts: allowScriptsFrom(finalPackage),
    },
    markerCounts,
    npmConfiguration: configuration,
    observedResult: measuredCommand
      ? `Measured command exited ${String(measuredCommand.exitCode)}; marker count was ${String(finalMarker.count)}; allowScripts changed: ${String(approval.changed)}.`
      : "The measured command was not completed.",
    limitations,
    evidencePaths: {
      stdout: "stdout.log",
      stderr: "stderr.log",
      packageBefore: "package-before.json",
      packageAfter: packageAfterState.path ?? "absent",
      lockBefore: lockBefore.path ?? "absent",
      lockAfter: lockAfter.path ?? "absent",
      marker: markerArtifact.path ?? "absent",
      containerInspect: "container-inspect.json",
    },
    artifacts: {
      packageBefore: { state: "present", path: "package-before.json" },
      packageAfter: packageAfterState,
      lockBefore,
      lockAfter,
      marker: markerArtifact,
      containerInspect: { state: "host-orchestrator-pending", path: null },
    },
  };
  await writeJson(path.join(outputDirectory, "result.json"), result);
  await writeJson(path.join(outputDirectory, "commands.json"), commands);
  return result;
}

async function runOfficialEvidence() {
  await assertFreshRuntime();
  await prepareConsumer();
  const outputDirectory = path.join(OUTPUT_ROOT, "official");
  await mkdir(outputDirectory, { recursive: true });
  const commands = [];
  const definitions = [
    ["node-version", "node", NODE_PATH, ["--version"], 30_000],
    ["npm-version", "npm", NPM_PATH, ["--version"], 30_000],
    [
      "approve-scripts-help",
      "npm",
      NPM_PATH,
      ["approve-scripts", "--help"],
      30_000,
    ],
    [
      "help-approve-scripts",
      "npm",
      NPM_PATH,
      ["help", "approve-scripts"],
      15_000,
    ],
  ];
  for (const [
    stepId,
    command,
    executable,
    commandArguments,
    timeoutMs,
  ] of definitions) {
    commands.push(
      await runFixedCommand({
        command,
        executable,
        arguments: commandArguments,
        cwd: CONSUMER_ROOT,
        cwdId: "<consumer>",
        role: "official-evidence",
        stepId,
        stdoutPath: path.join(outputDirectory, `${stepId}.stdout.log`),
        stderrPath: path.join(outputDirectory, `${stepId}.stderr.log`),
        timeoutMs,
      }),
    );
  }
  const configuration = await recordConfiguration(outputDirectory, commands);
  const bundledDocumentation = {};
  for (const [key, sourcePath, filename] of [
    ["approveScripts", APPROVAL_DOC_PATH, "npm-approve-scripts.md"],
    ["configuration", CONFIG_DOC_PATH, "npm-config.md"],
  ]) {
    if (await exists(sourcePath)) {
      const contents = sanitizeLog(await readFile(sourcePath, "utf8"));
      await writeFile(path.join(outputDirectory, filename), contents, "utf8");
      bundledDocumentation[key] = {
        state: "present",
        path: `official/${filename}`,
      };
    } else {
      bundledDocumentation[key] = { state: "absent", path: null };
    }
  }
  const nodeVersion = (
    await readFile(
      path.join(outputDirectory, "node-version.stdout.log"),
      "utf8",
    )
  ).trim();
  const npmVersion = (
    await readFile(path.join(outputDirectory, "npm-version.stdout.log"), "utf8")
  ).trim();
  const approveHelp = commands.find(
    (command) => command.stepId === "approve-scripts-help",
  );
  const result = {
    schemaVersion: 1,
    status:
      nodeVersion === "v24.18.0" &&
      npmVersion === "12.0.1" &&
      approveHelp?.exitCode === 0
        ? "success"
        : "inconclusive",
    nodeVersion,
    npmVersion,
    approvalCommand: ["npm", "approve-scripts"],
    approvalHelpAvailable: approveHelp?.exitCode === 0,
    bundledDocumentation,
    configuration,
    note: "Only captured npm 12.0.1 help or bundled documentation may be classified as Official.",
  };
  await writeJson(path.join(outputDirectory, "result.json"), result);
  await writeJson(path.join(outputDirectory, "commands.json"), commands);
}

async function writeInfrastructureFailure(scenarioId, error) {
  const outputDirectory = path.join(OUTPUT_ROOT, "scenarios", scenarioId);
  await mkdir(outputDirectory, { recursive: true });
  const normalizedError =
    error instanceof Error && error.message.startsWith("INVALID_SCENARIO_ID")
      ? "INVALID_SCENARIO_ID"
      : "SCENARIO_RUNNER_ERROR";
  await writeJson(path.join(outputDirectory, "result.json"), {
    schemaVersion: 1,
    scenarioId,
    status: "inconclusive",
    expected:
      EXPECTED[scenarioId] ?? "No expected hypothesis for invalid scenario.",
    setupSteps: [],
    measuredCommand: null,
    exitCode: null,
    markerPresent: false,
    markerCount: null,
    approvalEntryBefore: null,
    approvalEntryAfter: null,
    packageLockHashBefore: null,
    packageLockHashAfter: null,
    observedResult: `Scenario runner stopped with ${normalizedError}.`,
    limitations: ["The scenario evidence is incomplete."],
    evidencePaths: {
      stdout: "absent",
      stderr: "absent",
      packageBefore: "absent",
      packageAfter: "absent",
      lockBefore: "absent",
      lockAfter: "absent",
      marker: "absent",
      containerInspect: "container-inspect.json",
    },
    artifacts: {
      stdout: { state: "absent", path: null },
      stderr: { state: "absent", path: null },
      packageBefore: { state: "absent", path: null },
      packageAfter: { state: "absent", path: null },
      lockBefore: { state: "absent", path: null },
      lockAfter: { state: "absent", path: null },
      marker: { state: "absent", path: null },
      containerInspect: { state: "host-orchestrator-pending", path: null },
    },
  });
}

async function collectOutputFiles(directory = OUTPUT_ROOT) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const entryPath = path.join(directory, entry.name);
    if (directory === OUTPUT_ROOT && entry.name === "marker.jsonl") {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await collectOutputFiles(entryPath)));
    } else if (entry.isFile()) {
      const contents = await readFile(entryPath);
      files.push({
        path: path.relative(OUTPUT_ROOT, entryPath).split(path.sep).join("/"),
        encoding: "base64",
        content: contents.toString("base64"),
        sha256: `sha256:${createHash("sha256").update(contents).digest("hex")}`,
      });
    } else {
      throw new Error("OUTPUT_CONTAINS_UNSUPPORTED_FILE_TYPE");
    }
  }
  return files;
}

async function emitOutputBundle(mode, scenarioId) {
  const bundle = {
    schemaVersion: 1,
    mode,
    scenarioId,
    outputComplete: true,
    files: await collectOutputFiles(),
  };
  const encoded = Buffer.from(JSON.stringify(bundle), "utf8").toString(
    "base64",
  );
  process.stdout.write(`${OUTPUT_BUNDLE_PREFIX}${encoded}\n`);
}

const arguments_ = process.argv.slice(2);
let readyMode = "invalid";
let readyScenarioId = null;
try {
  if (arguments_.length === 1 && arguments_[0] === "--official") {
    readyMode = "official";
    await runOfficialEvidence();
  } else if (arguments_.length === 2 && arguments_[0] === "--scenario") {
    const scenarioId = arguments_[1];
    readyMode = "scenario";
    readyScenarioId = scenarioId;
    try {
      await runScenario(scenarioId);
    } catch (error) {
      await writeInfrastructureFailure(scenarioId, error);
      throw error;
    }
  } else {
    throw new Error("INVALID_FIXED_ARGUMENTS");
  }
} catch {
  process.exitCode = 1;
} finally {
  try {
    await writeJson(path.join(OUTPUT_ROOT, ".ready.json"), {
      schemaVersion: 1,
      mode: readyMode,
      scenarioId: readyScenarioId,
      outputComplete: true,
    });
    await emitOutputBundle(readyMode, readyScenarioId);
  } catch {
    process.exitCode = 1;
  }
}
