import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { fileURLToPath } from "node:url";

import {
  assertOperation,
  BASE_IMAGE,
  buildContainerCreateArgs,
  createRunId,
  EXPECTED_BY_SCENARIO,
  EXPECTED_NODE,
  EXPECTED_NPM,
  IMAGE_NAME,
  parseOutputBundle,
  projectInspectionPolicy,
  readJsonIfPresent,
  resolveResultPath,
  sanitizeText,
  SCENARIO_IDS,
  validateContainerInspection,
  validateSummary,
  writeJson,
} from "./lib.mjs";
import { sanitizeRun } from "./sanitize.mjs";
import { verifyStaticSafety } from "./verify-static.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), "../../..");
const experimentRoot = path.join(repositoryRoot, "experiments/npm12-install");
const workRoot = path.join(experimentRoot, ".work");
const dockerHome = path.join(workRoot, "docker-home");
const dockerConfig = path.join(workRoot, "docker-config");
const latestRunFile = path.join(workRoot, "latest-run-id");
const DOCKER_LOG_LIMIT = 2_097_152;
const OUTPUT_TRANSFER_CODE = "DOCKER_CP_TMPFS_UNAVAILABLE";
const OUTPUT_TRANSFER_LIMITATION =
  "The required docker cp transfer could not read files from the /m0-output tmpfs in Docker 29.6.1; evidence used the fixed, path- and digest-validated docker start --attach bundle fallback.";

function fixedDockerEnvironment() {
  return {
    HOME: dockerHome,
    DOCKER_CONFIG: dockerConfig,
    PATH: "/usr/local/bin:/usr/bin:/bin",
  };
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return false;
    throw error;
  }
}

function appendLimited(state, chunk) {
  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  const remaining = DOCKER_LOG_LIMIT - state.length;
  if (remaining <= 0) {
    state.truncated = true;
    return;
  }
  state.chunks.push(buffer.subarray(0, remaining));
  state.length += Math.min(remaining, buffer.length);
  if (buffer.length > remaining) state.truncated = true;
}

async function runDockerCommand({
  arguments: commandArguments,
  stepId,
  logRoot,
  recordRoot,
  timeoutMs = 600_000,
}) {
  await mkdir(dockerHome, { recursive: true });
  await mkdir(dockerConfig, { recursive: true });
  await mkdir(logRoot, { recursive: true });
  const stdout = { chunks: [], length: 0, truncated: false };
  const stderr = { chunks: [], length: 0, truncated: false };
  const startTimestamp = new Date().toISOString();
  const start = performance.now();
  let timedOut = false;
  let spawnErrorCode = null;

  const outcome = await new Promise((resolve) => {
    const child = spawn("docker", commandArguments, {
      cwd: repositoryRoot,
      env: fixedDockerEnvironment(),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    const finish = (exitCode, signal) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode, signal });
    };
    child.stdout.on("data", (chunk) => appendLimited(stdout, chunk));
    child.stderr.on("data", (chunk) => appendLimited(stderr, chunk));
    child.on("error", (error) => {
      spawnErrorCode = typeof error.code === "string" ? error.code : "UNKNOWN";
      finish(null, null);
    });
    child.on("close", (exitCode, signal) => finish(exitCode, signal));
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.on("close", () => clearTimeout(timeout));
    child.on("error", () => clearTimeout(timeout));
  });

  const rawStdout = Buffer.concat(stdout.chunks).toString("utf8");
  const rawStderr = Buffer.concat(stderr.chunks).toString("utf8");
  const stdoutFile = path.join(logRoot, `${stepId}.stdout.log`);
  const stderrFile = path.join(logRoot, `${stepId}.stderr.log`);
  await writeFile(
    stdoutFile,
    sanitizeText(rawStdout, { repositoryRoot }),
    "utf8",
  );
  await writeFile(
    stderrFile,
    sanitizeText(rawStderr, { repositoryRoot }),
    "utf8",
  );

  return {
    rawStdout,
    rawStderr,
    record: {
      stepId,
      role: "host-orchestrator",
      command: "docker",
      arguments: commandArguments.map((argument) =>
        sanitizeText(argument, { repositoryRoot }),
      ),
      cwd: "<repo>",
      startTimestamp,
      endTimestamp: new Date().toISOString(),
      durationMs: Math.round((performance.now() - start) * 1000) / 1000,
      exitCode: outcome.exitCode,
      signal: outcome.signal,
      timedOut,
      spawnErrorCode,
      stdoutPath: path
        .relative(recordRoot, stdoutFile)
        .split(path.sep)
        .join("/"),
      stderrPath: path
        .relative(recordRoot, stderrFile)
        .split(path.sep)
        .join("/"),
      stdoutTruncated: stdout.truncated,
      stderrTruncated: stderr.truncated,
      outputLimitBytes: DOCKER_LOG_LIMIT,
    },
  };
}

function requireDockerSuccess(result, normalizedCode) {
  if (result.record.exitCode !== 0) {
    const error = new Error(normalizedCode);
    error.normalizedCode =
      result.record.spawnErrorCode === "ENOENT"
        ? "DOCKER_CLI_UNAVAILABLE"
        : normalizedCode;
    throw error;
  }
  return result;
}

function normalizedErrorCode(error) {
  if (error && typeof error === "object" && "normalizedCode" in error) {
    return String(error.normalizedCode);
  }
  return "M0_INFRASTRUCTURE_UNAVAILABLE";
}

function parseRepoDigest(rawOutput) {
  const repoDigests = JSON.parse(rawOutput.trim());
  if (!Array.isArray(repoDigests)) throw new Error("BASE_IMAGE_DIGEST_INVALID");
  const entry = repoDigests.find(
    (candidate) =>
      typeof candidate === "string" && candidate.startsWith("node@sha256:"),
  );
  if (!entry) throw new Error("BASE_IMAGE_DIGEST_UNAVAILABLE");
  return entry.slice(entry.indexOf("@") + 1);
}

async function buildImage() {
  const logRoot = path.join(workRoot, "build-logs");
  const commandRecords = [];
  const run = async (stepId, commandArguments) => {
    const result = await runDockerCommand({
      arguments: commandArguments,
      stepId,
      logRoot,
      recordRoot: workRoot,
    });
    commandRecords.push(result.record);
    return result;
  };

  const pull = await run("pull-base-image", ["pull", BASE_IMAGE]);
  requireDockerSuccess(pull, "BASE_IMAGE_PULL_FAILED");
  const inspectBase = await run("inspect-base-image-digest", [
    "image",
    "inspect",
    BASE_IMAGE,
    "--format",
    "{{json .RepoDigests}}",
  ]);
  requireDockerSuccess(inspectBase, "BASE_IMAGE_INSPECT_FAILED");
  const baseImageDigest = parseRepoDigest(inspectBase.rawStdout);
  const pinnedBase = `${BASE_IMAGE}@${baseImageDigest}`;

  const build = await run("build-m0-image", [
    "build",
    "--file",
    path.join(experimentRoot, "Containerfile"),
    "--build-arg",
    `BASE_IMAGE=${pinnedBase}`,
    "--label",
    `org.tskaigi-lab.m0.base-image=${BASE_IMAGE}`,
    "--label",
    `org.tskaigi-lab.m0.base-image-digest=${baseImageDigest}`,
    "--label",
    `org.tskaigi-lab.m0.node=${EXPECTED_NODE}`,
    "--label",
    `org.tskaigi-lab.m0.npm=${EXPECTED_NPM}`,
    "--tag",
    IMAGE_NAME,
    experimentRoot,
  ]);
  requireDockerSuccess(build, "M0_IMAGE_BUILD_FAILED");

  const inspectImage = await run("inspect-m0-image", [
    "image",
    "inspect",
    IMAGE_NAME,
  ]);
  requireDockerSuccess(inspectImage, "M0_IMAGE_INSPECT_FAILED");
  const inspection = JSON.parse(inspectImage.rawStdout)[0];
  const metadata = {
    schemaVersion: 1,
    status: "success",
    builtAt: new Date().toISOString(),
    baseImage: BASE_IMAGE,
    baseImageDigest,
    pinnedBase,
    runtimeImage: IMAGE_NAME,
    runtimeImageId: inspection?.Id ?? "unavailable",
    node: EXPECTED_NODE,
    npm: EXPECTED_NPM,
    preparationNetwork:
      "enabled only for Docker image pull and npm@12.0.1 image build",
    scenarioRuntimeNetwork: "none",
  };
  await writeJson(path.join(workRoot, "build-metadata.json"), metadata);
  await writeJson(path.join(workRoot, "build-commands.json"), commandRecords);
  return metadata;
}

async function imageMetadataFromDocker(commandRecords, logRoot, recordRoot) {
  const result = await runDockerCommand({
    arguments: ["image", "inspect", IMAGE_NAME],
    stepId: "inspect-runtime-image",
    logRoot,
    recordRoot,
  });
  commandRecords.push(result.record);
  requireDockerSuccess(result, "M0_IMAGE_NOT_BUILT");
  const inspection = JSON.parse(result.rawStdout)[0];
  const labels = inspection?.Config?.Labels ?? {};
  if (
    labels["org.tskaigi-lab.m0.node"] !== EXPECTED_NODE ||
    labels["org.tskaigi-lab.m0.npm"] !== EXPECTED_NPM
  ) {
    const error = new Error("M0_IMAGE_TOOLCHAIN_LABEL_MISMATCH");
    error.normalizedCode = "M0_IMAGE_TOOLCHAIN_LABEL_MISMATCH";
    throw error;
  }
  const baseImageDigest =
    labels["org.tskaigi-lab.m0.base-image-digest"] ?? "unavailable";
  if (!/^sha256:[a-f0-9]{64}$/u.test(baseImageDigest)) {
    const error = new Error("BASE_IMAGE_DIGEST_UNAVAILABLE");
    error.normalizedCode = "BASE_IMAGE_DIGEST_UNAVAILABLE";
    throw error;
  }
  return {
    baseImageDigest,
    runtimeImageId: inspection?.Id ?? "unavailable",
  };
}

async function dockerRuntimeVersion(commandRecords, logRoot, recordRoot) {
  const result = await runDockerCommand({
    arguments: ["version", "--format", "{{json .Server}}"],
    stepId: "docker-version",
    logRoot,
    recordRoot,
    timeoutMs: 30_000,
  });
  commandRecords.push(result.record);
  requireDockerSuccess(result, "DOCKER_RUNTIME_UNAVAILABLE");
  const server = JSON.parse(result.rawStdout.trim());
  return `Docker ${server.Version ?? "unknown"}`;
}

async function executeContainer({
  runId,
  mode,
  scenarioId,
  rawRoot,
  commandRecords,
}) {
  const nameSuffix = mode === "official" ? "official" : scenarioId;
  const containerName = `m0-${runId.slice(3)}-${nameSuffix}`;
  const logRoot = path.join(rawRoot, "container/host-logs");
  let created = false;
  let inspection = null;
  try {
    const create = await runDockerCommand({
      arguments: buildContainerCreateArgs({
        containerName,
        mode,
        scenarioId,
      }),
      stepId: `create-${nameSuffix}`,
      logRoot,
      recordRoot: rawRoot,
    });
    commandRecords.push(create.record);
    requireDockerSuccess(create, "CONTAINER_CREATE_FAILED");
    created = true;

    const inspect = await runDockerCommand({
      arguments: ["inspect", containerName],
      stepId: `inspect-${nameSuffix}`,
      logRoot,
      recordRoot: rawRoot,
    });
    commandRecords.push(inspect.record);
    requireDockerSuccess(inspect, "CONTAINER_INSPECT_FAILED");
    inspection = JSON.parse(inspect.rawStdout);
    const policyIssues = validateContainerInspection(inspection);
    if (policyIssues.length > 0) {
      const error = new Error("CONTAINER_POLICY_INVALID");
      error.normalizedCode = "CONTAINER_POLICY_INVALID";
      error.policyIssues = policyIssues;
      throw error;
    }

    const inspectionPath =
      mode === "official"
        ? path.join(rawRoot, "container/official-inspect.json")
        : path.join(rawRoot, "scenarios", scenarioId, "container-inspect.json");
    await writeJson(inspectionPath, inspection);

    const start = await runDockerCommand({
      arguments: ["start", "--attach", containerName],
      stepId: `start-${nameSuffix}`,
      logRoot,
      recordRoot: rawRoot,
      timeoutMs: 600_000,
    });
    commandRecords.push(start.record);
    let parsed;
    try {
      parsed = parseOutputBundle(start.rawStdout, { mode, scenarioId });
    } catch (cause) {
      const error = new Error("CONTAINER_OUTPUT_TRANSFER_FAILED", { cause });
      error.normalizedCode = "CONTAINER_OUTPUT_TRANSFER_FAILED";
      throw error;
    }
    for (const file of parsed.decodedFiles) {
      const destination = path.join(rawRoot, ...file.path.split("/"));
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, file.contents);
    }
    if (start.record.exitCode !== 0) {
      const error = new Error("CONTAINER_RUNNER_FAILED");
      error.normalizedCode = "CONTAINER_RUNNER_FAILED";
      throw error;
    }
    return { startRecord: start.record, inspection };
  } finally {
    if (created) {
      const remove = await runDockerCommand({
        arguments: ["rm", "--force", containerName],
        stepId: `remove-${nameSuffix}`,
        logRoot,
        recordRoot: rawRoot,
        timeoutMs: 30_000,
      });
      commandRecords.push(remove.record);
    }
  }
}

async function writeUnavailableScenario(rawRoot, scenarioId, code) {
  const outputDirectory = path.join(rawRoot, "scenarios", scenarioId);
  await mkdir(outputDirectory, { recursive: true });
  const result = {
    schemaVersion: 1,
    scenarioId,
    status: "inconclusive",
    expected: EXPECTED_BY_SCENARIO[scenarioId],
    setupSteps: [],
    measuredCommand: null,
    exitCode: null,
    markerPresent: false,
    markerCount: null,
    approvalEntryBefore: null,
    approvalEntryAfter: null,
    approvalChanged: false,
    packageLockHashBefore: null,
    packageLockHashAfter: null,
    observedResult: `Scenario was not executed because ${code}.`,
    limitations: [
      "No npm lifecycle observation was made.",
      `Infrastructure prerequisite failed with ${code}.`,
    ],
    evidencePaths: {
      stdout: "absent",
      stderr: "absent",
      packageBefore: "absent",
      packageAfter: "absent",
      lockBefore: "absent",
      lockAfter: "absent",
      marker: "absent",
      containerInspect: "absent",
    },
    artifacts: Object.fromEntries(
      [
        "stdout",
        "stderr",
        "packageBefore",
        "packageAfter",
        "lockBefore",
        "lockAfter",
        "marker",
        "containerInspect",
      ].map((key) => [key, { state: "absent", path: null }]),
    ),
  };
  await writeJson(path.join(outputDirectory, "result.json"), result);
  return result;
}

async function updateScenarioInspection(rawRoot, scenarioId, inspection) {
  const resultPath = path.join(rawRoot, "scenarios", scenarioId, "result.json");
  const result = await readJsonIfPresent(resultPath);
  if (!result) return null;
  const issues = validateContainerInspection(inspection);
  result.isolationPolicy = projectInspectionPolicy(inspection);
  result.limitations ??= [];
  if (!result.limitations.includes(OUTPUT_TRANSFER_LIMITATION)) {
    result.limitations.push(OUTPUT_TRANSFER_LIMITATION);
  }
  result.artifacts ??= {};
  result.artifacts.containerInspect = {
    state: "present",
    path: `scenarios/${scenarioId}/container-inspect.json`,
  };
  if (issues.length > 0) {
    result.status = "inconclusive";
    result.limitations.push(
      "Container inspection did not satisfy runtime policy.",
    );
  }
  await writeJson(resultPath, result);
  return result;
}

function overallStatus(official, scenarios) {
  if (official?.status !== "success") return "inconclusive";
  if (scenarios.some((scenario) => scenario.status === "inconclusive")) {
    return "inconclusive";
  }
  if (scenarios.some((scenario) => scenario.status === "failure"))
    return "failure";
  return "success";
}

async function collectContainerCommands(rawRoot, commandRecords) {
  const officialCommands = await readJsonIfPresent(
    path.join(rawRoot, "official/commands.json"),
  );
  if (Array.isArray(officialCommands)) commandRecords.push(...officialCommands);
  for (const scenarioId of SCENARIO_IDS) {
    const commands = await readJsonIfPresent(
      path.join(rawRoot, "scenarios", scenarioId, "commands.json"),
    );
    if (Array.isArray(commands)) commandRecords.push(...commands);
  }
}

async function persistRun({
  rawRoot,
  runId,
  runtimeVersion,
  imageMetadata,
  official,
  scenarios,
  commandRecords,
  infrastructureCode,
}) {
  const scenarioAggregateStatus = overallStatus(official, scenarios);
  const outputTransfer = {
    status: "inconclusive",
    normalizedCode: OUTPUT_TRANSFER_CODE,
    requiredMethod: "docker cp from /m0-output tmpfs",
    observedConstraint:
      "A fixed control file existed inside the running container, while docker cp reported it absent; stopped containers lose tmpfs contents.",
    fallbackMethod:
      "docker start --attach with one fixed framed JSON bundle, strict relative-path allowlisting, per-file SHA-256 verification, and size limits",
  };
  const summary = {
    schemaVersion: 1,
    runId,
    status:
      scenarioAggregateStatus === "success"
        ? "inconclusive"
        : scenarioAggregateStatus,
    toolchain: {
      node: official?.nodeVersion ?? "unobserved (expected v24.18.0)",
      npm: official?.npmVersion ?? "unobserved (expected 12.0.1)",
      baseImage: BASE_IMAGE,
      imageDigest: imageMetadata?.baseImageDigest ?? "unavailable",
      containerRuntime: runtimeVersion ?? "Docker unavailable",
    },
    outputTransfer,
    scenarios,
  };
  const metadata = {
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    status: summary.status,
    infrastructureCode: infrastructureCode ?? OUTPUT_TRANSFER_CODE,
    preparationNetwork:
      "Allowed only for Docker Official Image pull and npm@12.0.1 during image build; not used by this run operation.",
    scenarioRuntimeNetwork: "none (--network none)",
    scenarioIsolation: "one fresh container per scenario",
    outputTransfer,
    runtimeImage: IMAGE_NAME,
    runtimeImageId: imageMetadata?.runtimeImageId ?? "unavailable",
    baseImage: BASE_IMAGE,
    baseImageDigest: imageMetadata?.baseImageDigest ?? "unavailable",
    officialEvidenceStatus: official?.status ?? "inconclusive",
    rawResultsAreSanitizedAtSource: false,
    sanitizedExample: "results/examples/m0-npm12",
  };
  await writeJson(path.join(rawRoot, "metadata.json"), metadata);
  await writeJson(path.join(rawRoot, "summary.json"), summary);
  await writeJson(path.join(rawRoot, "commands.json"), commandRecords);
  await mkdir(workRoot, { recursive: true });
  await writeFile(latestRunFile, `${runId}\n`, "utf8");
  await sanitizeRun(repositoryRoot, runId);
  return summary;
}

async function runExperiment() {
  const runId = createRunId();
  const rawRoot = resolveResultPath(repositoryRoot, runId);
  const logRoot = path.join(rawRoot, "container/host-logs");
  await mkdir(path.join(rawRoot, "container"), { recursive: true });
  const commandRecords = [];
  let runtimeVersion = null;
  let imageMetadata = null;
  let official = null;
  const scenarios = [];
  let infrastructureCode = null;

  try {
    runtimeVersion = await dockerRuntimeVersion(
      commandRecords,
      logRoot,
      rawRoot,
    );
    imageMetadata = await imageMetadataFromDocker(
      commandRecords,
      logRoot,
      rawRoot,
    );
    await executeContainer({
      runId,
      mode: "official",
      rawRoot,
      commandRecords,
    });
    official = await readJsonIfPresent(
      path.join(rawRoot, "official/result.json"),
    );
    if (!official || official.status !== "success") {
      infrastructureCode = "OFFICIAL_APPROVAL_EVIDENCE_UNAVAILABLE";
      for (const scenarioId of SCENARIO_IDS) {
        scenarios.push(
          await writeUnavailableScenario(
            rawRoot,
            scenarioId,
            infrastructureCode,
          ),
        );
      }
    } else {
      for (const scenarioId of SCENARIO_IDS) {
        try {
          const execution = await executeContainer({
            runId,
            mode: "scenario",
            scenarioId,
            rawRoot,
            commandRecords,
          });
          const result = await updateScenarioInspection(
            rawRoot,
            scenarioId,
            execution.inspection,
          );
          scenarios.push(
            result ??
              (await writeUnavailableScenario(
                rawRoot,
                scenarioId,
                "SCENARIO_RESULT_MISSING",
              )),
          );
        } catch (error) {
          const code = normalizedErrorCode(error);
          const existing = await readJsonIfPresent(
            path.join(rawRoot, "scenarios", scenarioId, "result.json"),
          );
          if (existing) {
            existing.status = "inconclusive";
            existing.limitations ??= [];
            existing.limitations.push(
              `Host orchestration failed with ${code}.`,
            );
            await writeJson(
              path.join(rawRoot, "scenarios", scenarioId, "result.json"),
              existing,
            );
            scenarios.push(existing);
          } else {
            scenarios.push(
              await writeUnavailableScenario(rawRoot, scenarioId, code),
            );
          }
        }
      }
    }
  } catch (error) {
    infrastructureCode = normalizedErrorCode(error);
    official = {
      schemaVersion: 1,
      status: "inconclusive",
      nodeVersion: null,
      npmVersion: null,
      approvalHelpAvailable: false,
      observedResult: `Official evidence was not captured because ${infrastructureCode}.`,
    };
    await writeJson(path.join(rawRoot, "official/result.json"), official);
    for (const scenarioId of SCENARIO_IDS) {
      scenarios.push(
        await writeUnavailableScenario(rawRoot, scenarioId, infrastructureCode),
      );
    }
  }

  await collectContainerCommands(rawRoot, commandRecords);
  const summary = await persistRun({
    rawRoot,
    runId,
    runtimeVersion,
    imageMetadata,
    official,
    scenarios,
    commandRecords,
    infrastructureCode,
  });
  return { runId, rawRoot, summary };
}

async function doctor() {
  const staticResult = await verifyStaticSafety();
  if (staticResult.status !== "success")
    throw new Error("STATIC_SAFETY_FAILED");
  const logRoot = path.join(workRoot, "doctor-logs");
  const commandRecords = [];
  const runtimeVersion = await dockerRuntimeVersion(
    commandRecords,
    logRoot,
    workRoot,
  );
  const imageMetadata = await imageMetadataFromDocker(
    commandRecords,
    logRoot,
    workRoot,
  );
  const result = {
    status: "success",
    runtimeVersion,
    imageMetadata,
    staticSafety: staticResult,
  };
  await writeJson(path.join(workRoot, "doctor.json"), result);
  await writeJson(path.join(workRoot, "doctor-commands.json"), commandRecords);
  return result;
}

async function walkFiles(root) {
  if (!(await exists(root))) return [];
  const output = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...(await walkFiles(entryPath)));
    else if (entry.isFile()) output.push(entryPath);
  }
  return output;
}

async function verifyLatestRun() {
  const staticResult = await verifyStaticSafety();
  const runId = (await readFile(latestRunFile, "utf8")).trim();
  const rawRoot = resolveResultPath(repositoryRoot, runId);
  const summary = await readJsonIfPresent(path.join(rawRoot, "summary.json"));
  const failures = [...staticResult.failures];
  if (!summary) failures.push("latest run summary is absent");
  else failures.push(...validateSummary(summary));

  const scenarioIds =
    summary?.scenarios?.map((scenario) => scenario.scenarioId) ?? [];
  if (JSON.stringify(scenarioIds) !== JSON.stringify(SCENARIO_IDS)) {
    failures.push(
      "latest run does not contain all five scenarios in fixed order",
    );
  }
  for (const scenario of summary?.scenarios ?? []) {
    const scenarioRoot = path.join(rawRoot, "scenarios", scenario.scenarioId);
    if (!(await exists(path.join(scenarioRoot, "result.json")))) {
      failures.push(`${scenario.scenarioId} result.json is absent`);
    }
    const inspectionPath = path.join(scenarioRoot, "container-inspect.json");
    if (await exists(inspectionPath)) {
      const inspection = JSON.parse(await readFile(inspectionPath, "utf8"));
      failures.push(...validateContainerInspection(inspection));
    } else if (scenario.status !== "inconclusive") {
      failures.push(`${scenario.scenarioId} container inspection is absent`);
    }
  }
  const schema = JSON.parse(
    await readFile(
      path.join(experimentRoot, "schema/summary.schema.json"),
      "utf8",
    ),
  );
  if (schema.properties?.schemaVersion?.const !== 1) {
    failures.push("summary schema revision is invalid");
  }
  const exampleRoot = path.join(repositoryRoot, "results/examples/m0-npm12");
  for (const required of ["summary.json", "commands.json", "toolchain.json"]) {
    if (!(await exists(path.join(exampleRoot, required)))) {
      failures.push(`sanitized example is missing ${required}`);
    }
  }
  for (const filePath of await walkFiles(exampleRoot)) {
    const contents = await readFile(filePath, "utf8");
    if (contents.includes(repositoryRoot)) {
      failures.push(`sanitized example contains repository path: ${filePath}`);
    }
    if (/\/(?:home|Users)\/[^/\s"']+/u.test(contents)) {
      failures.push(`sanitized example contains host home: ${filePath}`);
    }
  }
  if (summary && summary.status !== "success") {
    failures.push(`latest M0 run status is ${summary.status}`);
  }
  return {
    status: failures.length === 0 ? "success" : "failure",
    runId,
    summaryStatus: summary?.status ?? "absent",
    failures,
    staticSafety: staticResult,
  };
}

async function clean() {
  const logRoot = path.join(workRoot, "clean-logs");
  const removeImage = await runDockerCommand({
    arguments: ["image", "rm", IMAGE_NAME],
    stepId: "remove-m0-image",
    logRoot,
    recordRoot: workRoot,
    timeoutMs: 60_000,
  });
  await rm(workRoot, { recursive: true, force: true });
  return {
    status:
      removeImage.record.exitCode === 0 ||
      removeImage.record.spawnErrorCode === "ENOENT"
        ? "success"
        : "failure",
    note: "Raw and sanitized evidence directories are preserved.",
  };
}

export async function main(arguments_) {
  if (arguments_.length !== 1) {
    throw new Error("Usage: node m0.mjs <build|doctor|run|verify|clean>");
  }
  const operation = assertOperation(arguments_[0]);
  if (operation === "build") return buildImage();
  if (operation === "doctor") return doctor();
  if (operation === "run") return runExperiment();
  if (operation === "verify") return verifyLatestRun();
  return clean();
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const result = await main(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    const status = result.summary?.status ?? result.status;
    if (status !== "success") process.exitCode = 1;
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ status: "failure", code: normalizedErrorCode(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
