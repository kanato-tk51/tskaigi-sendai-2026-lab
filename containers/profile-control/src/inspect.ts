import {
  CONTROL_IDS,
  FIXED_CONTAINER_USER,
  FIXED_CONTAINER_RUNTIME,
  FIXED_ENVIRONMENT_KEY,
  FIXED_INPUT_DESTINATION,
  FIXED_RESULT_DESTINATION,
  FIXED_SCRATCH_DESTINATION,
  HOST_INSPECTION_SCHEMA_VERSION,
  LIMITS,
} from "./constants.js";
import {
  FIXED_CONTROL_SCRIPT,
  FIXED_MANIFEST_PATH,
  FIXED_NODE_EXECUTABLE,
  fixedContainerArguments,
} from "./docker-plan.js";
import { failProfile } from "./errors.js";
import {
  assertBoolean,
  assertExactKeys,
  assertPositiveInteger,
  assertString,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  ControlManifest,
  ExecutionProfile,
  HostInspection,
} from "./types.js";

const INSPECT_KEYS = Object.freeze([
  "image",
  "path",
  "args",
  "user",
  "env",
  "workingDir",
  "readOnlyRoot",
  "networkMode",
  "privileged",
  "pidMode",
  "ipcMode",
  "utsMode",
  "cgroupnsMode",
  "usernsMode",
  "runtime",
  "capAdd",
  "capDrop",
  "securityOptions",
  "groupAdd",
  "binds",
  "devices",
  "deviceRequests",
  "deviceCgroupRules",
  "portBindings",
  "publishAllPorts",
  "logType",
  "logConfig",
  "memory",
  "nanoCpus",
  "pids",
  "oomKillDisable",
  "restartName",
  "restartRetries",
  "mounts",
  "running",
  "status",
]);

const MOUNT_KEYS = Object.freeze(["Type", "Source", "Destination", "RW"]);

function exactEmptyRecord(input: unknown): void {
  const value = readPlainRecord(input, "INVALID_HOST_INSPECTION");
  assertExactKeys(value, [], "INVALID_HOST_INSPECTION");
}

function exactArray(
  input: unknown,
  expected: readonly unknown[],
): readonly unknown[] {
  const value = readPlainArray(input, "INVALID_HOST_INSPECTION");
  if (
    value.length !== expected.length ||
    value.some((entry, index) => entry !== expected[index])
  ) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  return value;
}

function validateEnvironment(
  input: unknown,
  baseEnvironmentKeys: readonly string[],
  profile: ExecutionProfile,
): readonly [] | readonly [typeof FIXED_ENVIRONMENT_KEY] {
  const entries = readPlainArray(input, "INVALID_HOST_INSPECTION");
  const keys: string[] = [];
  for (const entry of entries) {
    if (
      typeof entry !== "string" ||
      !entry.includes("=") ||
      entry.includes("\n") ||
      entry.includes("\0")
    ) {
      failProfile("INVALID_HOST_INSPECTION");
    }
    const separator = entry.indexOf("=");
    const key = entry.slice(0, separator);
    if (key.length === 0 || keys.includes(key)) {
      failProfile("INVALID_HOST_INSPECTION");
    }
    keys.push(key);
  }
  const expected = [
    ...baseEnvironmentKeys,
    ...(profile.profileId === "permissive" ? [FIXED_ENVIRONMENT_KEY] : []),
  ];
  if (
    keys.length !== expected.length ||
    keys.some((key, index) => key !== expected[index])
  ) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  return profile.profileId === "permissive"
    ? Object.freeze([FIXED_ENVIRONMENT_KEY])
    : Object.freeze([]);
}

export function validateDockerInspectProjection(input: {
  readonly rawProjection: unknown;
  readonly profile: ExecutionProfile;
  readonly manifest: ControlManifest;
  readonly expectedMountSources: Readonly<{
    input: string;
    result: string;
    scratch: string;
  }>;
  readonly baseEnvironmentKeys: readonly string[];
}): HostInspection {
  const value = readPlainRecord(input.rawProjection, "INVALID_HOST_INSPECTION");
  assertExactKeys(value, INSPECT_KEYS, "INVALID_HOST_INSPECTION");
  assertString(
    value.image,
    input.profile.containerImageDigest,
    "INVALID_HOST_INSPECTION",
  );
  assertString(value.path, FIXED_NODE_EXECUTABLE, "INVALID_HOST_INSPECTION");
  exactArray(value.args, fixedContainerArguments(input.profile.profileId));
  assertString(value.user, FIXED_CONTAINER_USER, "INVALID_HOST_INSPECTION");
  assertString(value.workingDir, "/opt/m4-control", "INVALID_HOST_INSPECTION");
  if (!assertBoolean(value.readOnlyRoot, "INVALID_HOST_INSPECTION")) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  assertString(value.networkMode, "none", "INVALID_HOST_INSPECTION");
  if (assertBoolean(value.privileged, "INVALID_HOST_INSPECTION")) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  for (const key of ["pidMode", "utsMode"] as const) {
    assertString(value[key], "", "INVALID_HOST_INSPECTION");
  }
  assertString(value.ipcMode, "private", "INVALID_HOST_INSPECTION");
  assertString(value.cgroupnsMode, "private", "INVALID_HOST_INSPECTION");
  assertString(value.usernsMode, "", "INVALID_HOST_INSPECTION");
  assertString(
    value.runtime,
    FIXED_CONTAINER_RUNTIME,
    "INVALID_HOST_INSPECTION",
  );
  exactArray(value.capAdd, []);
  exactArray(value.capDrop, ["ALL"]);
  exactArray(value.securityOptions, ["no-new-privileges"]);
  exactArray(value.groupAdd, []);
  exactArray(value.binds, []);
  exactArray(value.devices, []);
  exactArray(value.deviceRequests, []);
  exactArray(value.deviceCgroupRules, []);
  exactEmptyRecord(value.portBindings);
  exactEmptyRecord(value.logConfig);
  if (
    value.memory !== LIMITS.memoryBytes ||
    value.nanoCpus !== LIMITS.nanoCpus ||
    value.pids !== LIMITS.pids ||
    value.oomKillDisable !== null ||
    value.restartName !== "no" ||
    value.restartRetries !== 0 ||
    value.publishAllPorts !== false ||
    value.logType !== "none" ||
    value.running !== false ||
    value.status !== "created"
  ) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  const mounts = readPlainArray(value.mounts, "INVALID_HOST_INSPECTION");
  const expectedMounts = [
    {
      source: input.expectedMountSources.input,
      destination: FIXED_INPUT_DESTINATION,
      writable: false,
    },
    {
      source: input.expectedMountSources.result,
      destination: FIXED_RESULT_DESTINATION,
      writable: true,
    },
    {
      source: input.expectedMountSources.scratch,
      destination: FIXED_SCRATCH_DESTINATION,
      writable: input.profile.profileId === "permissive",
    },
  ];
  if (mounts.length !== expectedMounts.length) {
    failProfile("INVALID_HOST_INSPECTION");
  }
  mounts.forEach((entry, index) => {
    const mount = readPlainRecord(entry, "INVALID_HOST_INSPECTION");
    const expected = expectedMounts[index];
    if (expected === undefined) failProfile("INVALID_HOST_INSPECTION");
    assertExactKeys(mount, MOUNT_KEYS, "INVALID_HOST_INSPECTION");
    assertString(mount.Type, "bind", "INVALID_HOST_INSPECTION");
    assertString(mount.Source, expected.source, "INVALID_HOST_INSPECTION");
    assertString(
      mount.Destination,
      expected.destination,
      "INVALID_HOST_INSPECTION",
    );
    if (
      assertBoolean(mount.RW, "INVALID_HOST_INSPECTION") !== expected.writable
    ) {
      failProfile("INVALID_HOST_INSPECTION");
    }
  });
  const environmentKeys = validateEnvironment(
    value.env,
    input.baseEnvironmentKeys,
    input.profile,
  );
  if (
    input.profile.profileId !== input.manifest.profileId ||
    input.profile.containerImageDigest !==
      input.manifest.containerImageDigest ||
    !fixedContainerArguments(input.profile.profileId).includes(
      FIXED_CONTROL_SCRIPT,
    ) ||
    !fixedContainerArguments(input.profile.profileId).includes(
      FIXED_MANIFEST_PATH,
    )
  ) {
    failProfile("PROFILE_MANIFEST_MISMATCH");
  }
  return Object.freeze({
    schemaVersion: HOST_INSPECTION_SCHEMA_VERSION,
    runId: input.manifest.runId,
    controlId: CONTROL_IDS[input.profile.profileId],
    profileId: input.profile.profileId,
    containerImageDigest: input.profile.containerImageDigest,
    commandId:
      input.profile.profileId === "permissive"
        ? "permissive-node"
        : "constrained-node-permission-model",
    user: FIXED_CONTAINER_USER,
    readOnlyRoot: true,
    networkMode: "none",
    privileged: false,
    capAdd: Object.freeze([]) as readonly [],
    capDrop: Object.freeze(["ALL"]) as readonly ["ALL"],
    securityOptions: Object.freeze(["no-new-privileges"]) as readonly [
      "no-new-privileges",
    ],
    mountIds: Object.freeze(["input", "result", "scratch"]) as readonly [
      "input",
      "result",
      "scratch",
    ],
    scratchAccess:
      input.profile.profileId === "permissive" ? "writable" : "read-only",
    environmentKeys,
    devices: Object.freeze([]) as readonly [],
    deviceRequests: Object.freeze([]) as readonly [],
    groupAdd: Object.freeze([]) as readonly [],
    runtime: FIXED_CONTAINER_RUNTIME,
    usernsMode: "private",
    pidMode: "private",
    resourceLimits: Object.freeze({
      memoryBytes: assertPositiveInteger(
        value.memory,
        LIMITS.memoryBytes,
        "INVALID_HOST_INSPECTION",
      ),
      nanoCpus: assertPositiveInteger(
        value.nanoCpus,
        LIMITS.nanoCpus,
        "INVALID_HOST_INSPECTION",
      ),
      pids: assertPositiveInteger(
        value.pids,
        LIMITS.pids,
        "INVALID_HOST_INSPECTION",
      ),
    }),
  });
}
