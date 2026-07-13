import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const SCENARIO_IDS = Object.freeze([
  "unapproved-install",
  "approved-rebuild",
  "approved-scripts-disabled",
  "approved-reinstall",
  "approved-ci",
]);

export const OPERATIONS = Object.freeze([
  "build",
  "doctor",
  "run",
  "verify",
  "clean",
]);

export const BASE_IMAGE = "node:24.18.0-bookworm-slim";
export const IMAGE_NAME = "tskaigi-m0-npm12:node24.18.0-npm12.0.1";
export const EXPECTED_NODE = "24.18.0";
export const EXPECTED_NPM = "12.0.1";

export const EXPECTED_BY_SCENARIO = Object.freeze({
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
});

const RUN_ID_PATTERN = /^m0-[0-9]{8}t[0-9]{6}z-[a-f0-9]{8}$/;
const CONTAINER_NAME_PATTERN = /^m0-[a-z0-9-]{1,100}$/;
const ANSI_ESCAPE_PATTERN = new RegExp(
  String.raw`\u001B\[[0-?]*[ -/]*[@-~]`,
  "gu",
);

export function assertScenarioId(value) {
  if (!SCENARIO_IDS.includes(value)) {
    throw new Error(`Invalid M0 scenario ID: ${String(value)}`);
  }
  return value;
}

export function assertOperation(value) {
  if (!OPERATIONS.includes(value)) {
    throw new Error(`Invalid M0 operation: ${String(value)}`);
  }
  return value;
}

export function createRunId(
  now = new Date(),
  suffix = randomBytes(4).toString("hex"),
) {
  const timestamp = now
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")
    .slice(0, 15)
    .toLowerCase();
  const runId = `m0-${timestamp}z-${suffix}`;
  if (!RUN_ID_PATTERN.test(runId)) {
    throw new Error("Unable to construct a safe M0 run ID");
  }
  return runId;
}

export function resolveResultPath(repositoryRoot, runId) {
  if (!RUN_ID_PATTERN.test(runId)) {
    throw new Error(`Unsafe M0 run ID: ${String(runId)}`);
  }
  const resultRoot = path.resolve(repositoryRoot, "results", "runs", "m0");
  const candidate = path.resolve(resultRoot, runId);
  if (path.dirname(candidate) !== resultRoot) {
    throw new Error("M0 result path escaped its allowlisted root");
  }
  return candidate;
}

export function buildContainerCreateArgs({ containerName, mode, scenarioId }) {
  if (!CONTAINER_NAME_PATTERN.test(containerName)) {
    throw new Error(`Unsafe M0 container name: ${String(containerName)}`);
  }
  if (mode !== "official" && mode !== "scenario") {
    throw new Error(`Invalid M0 container mode: ${String(mode)}`);
  }

  const commandArgs =
    mode === "official"
      ? ["node", "/opt/m0/container/run-scenario.mjs", "--official"]
      : [
          "node",
          "/opt/m0/container/run-scenario.mjs",
          "--scenario",
          assertScenarioId(scenarioId),
        ];

  return [
    "create",
    "--name",
    containerName,
    "--network",
    "none",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--user",
    "1000:1000",
    "--pids-limit",
    "64",
    "--memory",
    "512m",
    "--cpus",
    "1",
    "--tmpfs",
    "/work:rw,nosuid,nodev,noexec,size=67108864,uid=1000,gid=1000",
    "--tmpfs",
    "/tmp:rw,nosuid,nodev,noexec,size=33554432,uid=1000,gid=1000",
    "--tmpfs",
    "/m0-output:rw,nosuid,nodev,noexec,size=16777216,uid=1000,gid=1000",
    IMAGE_NAME,
    ...commandArgs,
  ];
}

export function validateContainerInspection(value) {
  const inspection = Array.isArray(value) ? value[0] : value;
  const issues = [];
  if (!inspection || typeof inspection !== "object") {
    return ["Docker inspection is not an object"];
  }

  const config = inspection.Config ?? {};
  const hostConfig = inspection.HostConfig ?? {};
  const mounts = Array.isArray(inspection.Mounts) ? inspection.Mounts : [];
  const binds = Array.isArray(hostConfig.Binds) ? hostConfig.Binds : [];
  const capDrop = Array.isArray(hostConfig.CapDrop) ? hostConfig.CapDrop : [];
  const capAdd = Array.isArray(hostConfig.CapAdd) ? hostConfig.CapAdd : [];
  const securityOpt = Array.isArray(hostConfig.SecurityOpt)
    ? hostConfig.SecurityOpt
    : [];
  const tmpfs = hostConfig.Tmpfs ?? {};

  if (!config.User || config.User === "0" || config.User.startsWith("0:")) {
    issues.push("runtime user must be non-root");
  }
  if (hostConfig.NetworkMode !== "none") {
    issues.push("runtime network mode must be none");
  }
  if (hostConfig.ReadonlyRootfs !== true) {
    issues.push("runtime root filesystem must be read-only");
  }
  if (hostConfig.Privileged === true) {
    issues.push("runtime container must not be privileged");
  }
  if (!capDrop.map((item) => String(item).toUpperCase()).includes("ALL")) {
    issues.push("runtime capabilities must drop ALL");
  }
  if (capAdd.length > 0) {
    issues.push("runtime container must not add capabilities");
  }
  if (!securityOpt.some((item) => String(item).includes("no-new-privileges"))) {
    issues.push("runtime container must enable no-new-privileges");
  }
  if (binds.length > 0 || mounts.some((mount) => mount?.Type === "bind")) {
    issues.push("runtime container must not have bind mounts");
  }
  for (const requiredPath of ["/work", "/tmp", "/m0-output"]) {
    if (typeof tmpfs[requiredPath] !== "string") {
      issues.push(`runtime tmpfs is missing ${requiredPath}`);
    }
  }
  if (
    Object.keys(tmpfs).some(
      (entry) => !["/work", "/tmp", "/m0-output"].includes(entry),
    )
  ) {
    issues.push("runtime container has an unexpected tmpfs path");
  }

  const serializedMounts = JSON.stringify({ binds, mounts, tmpfs });
  if (serializedMounts.includes("docker.sock")) {
    issues.push("Docker socket must not be exposed");
  }
  if (/\/(?:home|Users)\//u.test(serializedMounts)) {
    issues.push("host home must not be mounted");
  }
  return issues;
}

export function projectInspectionPolicy(value) {
  const inspection = Array.isArray(value) ? value[0] : value;
  if (!inspection || typeof inspection !== "object") {
    return { valid: false, issues: ["Docker inspection is not an object"] };
  }
  const hostConfig = inspection.HostConfig ?? {};
  const mounts = Array.isArray(inspection.Mounts) ? inspection.Mounts : [];
  return {
    valid: validateContainerInspection(inspection).length === 0,
    issues: validateContainerInspection(inspection),
    user: inspection.Config?.User ?? null,
    networkMode: hostConfig.NetworkMode ?? null,
    readOnlyRootFilesystem: hostConfig.ReadonlyRootfs === true,
    privileged: hostConfig.Privileged === true,
    capabilityDrop: hostConfig.CapDrop ?? [],
    capabilityAdd: hostConfig.CapAdd ?? [],
    securityOptions: hostConfig.SecurityOpt ?? [],
    bindMountCount:
      (Array.isArray(hostConfig.Binds) ? hostConfig.Binds.length : 0) +
      mounts.filter((mount) => mount?.Type === "bind").length,
    tmpfsPaths: Object.keys(hostConfig.Tmpfs ?? {}).sort(),
  };
}

export function validateSummary(summary) {
  const issues = [];
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return ["summary must be an object"];
  }
  if (summary.schemaVersion !== 1) issues.push("schemaVersion must be 1");
  if (typeof summary.runId !== "string" || summary.runId.length === 0) {
    issues.push("runId must be a non-empty string");
  }
  if (!["success", "failure", "inconclusive"].includes(summary.status)) {
    issues.push("status is invalid");
  }
  const toolchain = summary.toolchain;
  if (!toolchain || typeof toolchain !== "object") {
    issues.push("toolchain must be an object");
  } else {
    for (const key of [
      "node",
      "npm",
      "baseImage",
      "imageDigest",
      "containerRuntime",
    ]) {
      if (typeof toolchain[key] !== "string") {
        issues.push(`toolchain.${key} must be a string`);
      }
    }
  }
  if (!Array.isArray(summary.scenarios)) {
    issues.push("scenarios must be an array");
    return issues;
  }
  const requiredScenarioKeys = [
    "scenarioId",
    "status",
    "expected",
    "setupSteps",
    "measuredCommand",
    "exitCode",
    "markerPresent",
    "markerCount",
    "approvalEntryBefore",
    "approvalEntryAfter",
    "packageLockHashBefore",
    "packageLockHashAfter",
    "observedResult",
    "limitations",
    "evidencePaths",
  ];
  for (const scenario of summary.scenarios) {
    if (!scenario || typeof scenario !== "object") {
      issues.push("scenario summary must be an object");
      continue;
    }
    for (const key of requiredScenarioKeys) {
      if (!(key in scenario)) issues.push(`scenario is missing ${key}`);
    }
    if (!SCENARIO_IDS.includes(scenario.scenarioId)) {
      issues.push(`scenario ID is invalid: ${String(scenario.scenarioId)}`);
    }
    if (!["success", "failure", "inconclusive"].includes(scenario.status)) {
      issues.push(`scenario status is invalid: ${String(scenario.status)}`);
    }
    if (
      !Number.isInteger(scenario.markerCount) &&
      scenario.markerCount !== null
    ) {
      issues.push("scenario markerCount must be an integer or null");
    }
  }
  return issues;
}

export function sanitizeText(value, { repositoryRoot, runId } = {}) {
  let sanitized = String(value).replace(ANSI_ESCAPE_PATTERN, "");
  if (repositoryRoot) {
    sanitized = sanitized.replaceAll(repositoryRoot, "<repo>");
  }
  if (runId) sanitized = sanitized.replaceAll(runId, "<run-id>");
  sanitized = sanitized
    .replaceAll("/work/npm-cache", "<npm-cache>")
    .replace(/\/(?:home|Users)\/[^/\s"']+/gu, "<home>")
    .replace(/\/tmp\/[^\s"']+/gu, "<tmp>")
    .replace(/(?<!sha256:)\b[a-f0-9]{64}\b/gu, "<container-id>");
  return sanitized;
}

export function sanitizeValue(value, options = {}, key = "") {
  if (typeof value === "string") return sanitizeText(value, options);
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, options));
  }
  if (!value || typeof value !== "object") return value;

  const output = {};
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (["containerId", "imageLayerId", "layerId"].includes(entryKey)) {
      output[entryKey] = `<${entryKey}>`;
      continue;
    }
    output[entryKey] = sanitizeValue(entryValue, options, entryKey || key);
  }
  return output;
}

export function extractAllowScripts(packageJson) {
  const value = packageJson?.allowScripts;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return JSON.parse(JSON.stringify(value));
}

export async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return null;
    throw error;
  }
}

export async function sha256FileIfPresent(filePath) {
  try {
    const contents = await readFile(filePath);
    return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return null;
    throw error;
  }
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
