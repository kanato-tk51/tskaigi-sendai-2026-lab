import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { types } from "node:util";

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const FIXED_RUN_ID = "m2a-npm-lifecycle-20260721000000000000000000000001";
const FIXED_RUN_ROOT = `/work/${FIXED_RUN_ID}`;
const FIXED_RESULT_ROOT = `results/runs/m2-a/${FIXED_RUN_ID}`;
const FIXED_HOST_WORK_ROOT =
  "experiments/npm12-install/.work/m2a-transfer-20260721-01";
const FIXED_DOCKER_CONFIG = `${FIXED_HOST_WORK_ROOT}/docker-config`;
const FIXED_HOME = `${FIXED_HOST_WORK_ROOT}/home`;
const FIXED_OUTPUT_PATHS = Object.freeze([
  "npm-lifecycle-producer.jsonl",
  "probe-output/direct-write-marker.json",
]);
const COMPLETION_KEYS = Object.freeze([
  "schemaVersion",
  "generation",
  "expectedRevision",
  "runId",
  "scenarioId",
  "toolchain",
  "npmFlow",
  "runnerSettlement",
  "outputInventory",
  "status",
  "issue",
]);
const ATTEMPT_KEYS = Object.freeze([
  "schemaVersion",
  "generation",
  "expectedRevision",
  "runId",
  "scenarioId",
  "imageId",
  "initializerSettlement",
  "measurementSettlement",
  "naturalExit",
  "completionTransfer",
  "segmentTransfer",
  "markerTransfer",
  "issues",
  "evidenceReview",
]);
const COMPLETION_ISSUES = new Set([
  "M2A_SETUP_INVALID",
  "M2A_NPM_INSTALL_FAILED",
  "M2A_APPROVAL_FAILED",
  "M2A_APPROVAL_INVALID",
  "M2A_REBUILD_FAILED",
  "M2A_CHILD_SETTLEMENT_UNKNOWN",
  "M2A_LOOPBACK_SETTLEMENT_UNKNOWN",
  "M2A_OUTPUT_INVALID",
  "M2A_PUBLICATION_FAILED",
]);
const EVENT_ORDER = Object.freeze([
  ["route-invocation", "npm-lifecycle-invocation"],
  ["capability-attempt", "npm-lifecycle-attempt-environment"],
  ["capability-attempt", "npm-lifecycle-attempt-file-read"],
  ["capability-attempt", "npm-lifecycle-attempt-file-hash"],
  ["capability-attempt", "npm-lifecycle-attempt-file-write"],
  ["capability-attempt", "npm-lifecycle-attempt-loopback"],
  ["capability-attempt", "npm-lifecycle-attempt-child"],
]);
const ATTEMPT_DEFINITIONS = Object.freeze([
  [
    "npm-lifecycle-attempt-environment",
    "environment-canary-read",
    "npm-lifecycle-environment-canary",
  ],
  [
    "npm-lifecycle-attempt-file-read",
    "canary-file-read",
    "npm-lifecycle-file-canary",
  ],
  [
    "npm-lifecycle-attempt-file-hash",
    "file-hash",
    "npm-lifecycle-source-snapshot",
  ],
  [
    "npm-lifecycle-attempt-file-write",
    "direct-filesystem-write",
    "npm-lifecycle-direct-output",
  ],
  [
    "npm-lifecycle-attempt-loopback",
    "loopback-connect",
    "npm-lifecycle-loopback",
  ],
  [
    "npm-lifecycle-attempt-child",
    "child-node-process",
    "npm-lifecycle-fixed-child",
  ],
]);
const COMMON_EVENT_KEYS = Object.freeze([
  "schemaVersion",
  "eventKind",
  "runId",
  "scenarioId",
  "route",
  "phase",
  "triggerType",
  "adapterVersion",
  "producerId",
  "producerSequence",
  "timestamp",
  "durationMs",
  "pid",
  "ppid",
  "workerId",
  "cwdId",
  "nodeVersion",
  "toolName",
  "toolVersion",
  "outcome",
  "normalizedErrorCode",
]);
const ROUTE_EVENT_KEYS = Object.freeze([
  ...COMMON_EVENT_KEYS,
  "routeInvocationId",
  "invocationKind",
  "logicalUnitId",
]);
const ATTEMPT_EVENT_KEYS = Object.freeze([
  ...COMMON_EVENT_KEYS,
  "attemptId",
  "attemptType",
  "targetId",
  "beforeHash",
  "afterHash",
  "details",
]);
const BASE_STATE_STEPS = Object.freeze([
  "absence-volume",
  "absence-initializer-container",
  "absence-measurement-container",
  "volume-create",
  "initializer-create",
  "initializer-inspect-pre",
  "initializer-start",
  "initializer-wait",
  "initializer-inspect-final",
  "measurement-create",
  "measurement-inspect-pre",
  "measurement-start",
  "measurement-wait",
  "measurement-inspect-final",
  "copy-completion",
  "validate-completion",
]);
const CONDITIONAL_STATE_STEPS = Object.freeze([
  "copy-segment",
  "validate-segment",
  "copy-marker",
  "validate-marker",
]);
const STATE_STEPS = Object.freeze([
  ...BASE_STATE_STEPS,
  ...CONDITIONAL_STATE_STEPS,
]);
const STEP_FAILURE_CODES = Object.freeze({
  "absence-volume": "M2A_ABSENCE_PREFLIGHT_FAILED",
  "absence-initializer-container": "M2A_ABSENCE_PREFLIGHT_FAILED",
  "absence-measurement-container": "M2A_ABSENCE_PREFLIGHT_FAILED",
  "volume-create": "M2A_VOLUME_CREATE_FAILED",
  "initializer-create": "M2A_INITIALIZER_CREATE_FAILED",
  "initializer-inspect-pre": "M2A_INITIALIZER_INSPECTION_FAILED",
  "initializer-start": "M2A_INITIALIZER_START_FAILED",
  "initializer-wait": "M2A_INITIALIZER_WAIT_FAILED",
  "initializer-inspect-final": "M2A_INITIALIZER_INSPECTION_FAILED",
  "measurement-create": "M2A_MEASUREMENT_CREATE_FAILED",
  "measurement-inspect-pre": "M2A_MEASUREMENT_INSPECTION_FAILED",
  "measurement-start": "M2A_MEASUREMENT_START_FAILED",
  "measurement-wait": "M2A_MEASUREMENT_WAIT_FAILED",
  "measurement-inspect-final": "M2A_MEASUREMENT_INSPECTION_FAILED",
  "copy-completion": "M2A_COMPLETION_COPY_FAILED",
  "validate-completion": "M2A_COMPLETION_TRANSFER_INVALID",
  "copy-segment": "M2A_SEGMENT_COPY_FAILED",
  "validate-segment": "M2A_SEGMENT_TRANSFER_INVALID",
  "copy-marker": "M2A_MARKER_COPY_FAILED",
  "validate-marker": "M2A_MARKER_TRANSFER_INVALID",
});
const SPECIAL_ISSUE_CODES = Object.freeze({
  "initializer-inspect-final": ["M2A_INITIALIZER_NOT_NATURAL_ZERO"],
  "measurement-inspect-final": ["M2A_MEASUREMENT_NOT_NATURAL"],
  "validate-completion": ["M2A_COMPLETION_EXIT_MISMATCH", ...COMPLETION_ISSUES],
});
const fakeBackendBrand = new WeakSet();

function freeze(value) {
  if (ArrayBuffer.isView(value)) return value;
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}

export const M2A_TRANSFER = freeze({
  schemaVersion: "m2a-transfer-manifest/v1",
  generation: "20260721-01",
  expectedRevision: "m2a-transfer-expected-20260721-01",
  scenarioId: "m2a-npm-lifecycle",
  runId: FIXED_RUN_ID,
  resultRoot: FIXED_RESULT_ROOT,
  containerRunRoot: FIXED_RUN_ROOT,
  initializerContainer: "tskaigi-m2a-transfer-init-20260721-01",
  measurementContainer: "tskaigi-m2a-transfer-run-20260721-01",
  transferVolume: "tskaigi-m2a-evidence-20260721-01",
  candidateImageTag: "tskaigi-m2a-transfer:20260721-01",
  sourceAggregate:
    "sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04",
  nodeVersion: "v24.18.0",
  npmVersion: "12.0.1",
  loopbackPort: 37_001,
  completionPath: "transfer-completion.json",
  segmentPath: FIXED_OUTPUT_PATHS[0],
  markerPath: FIXED_OUTPUT_PATHS[1],
  runtimeExecutionApproved: false,
  evidenceReview: "not-performed",
});

function fail(code) {
  throw new Error(code);
}

function isPlainRecord(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    types.isProxy(value) ||
    Array.isArray(value)
  ) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertPlainRecord(value, code) {
  if (!isPlainRecord(value)) fail(code);
  return value;
}

function assertKeys(value, keys, code) {
  if (JSON.stringify(Object.keys(value)) !== JSON.stringify(keys)) fail(code);
}

function compareExactOwnData(value, expected, code) {
  const expectedIsArray = Array.isArray(expected);
  const expectedIsRecord =
    expected !== null && typeof expected === "object" && !expectedIsArray;
  if (!expectedIsArray && !expectedIsRecord) {
    if (
      !(
        expected === null ||
        typeof expected === "string" ||
        typeof expected === "boolean" ||
        (typeof expected === "number" && Number.isFinite(expected))
      ) ||
      !Object.is(value, expected)
    ) {
      fail(code);
    }
    return;
  }

  let prototype;
  let keys;
  let descriptorEntries;
  try {
    if (value === null || typeof value !== "object" || types.isProxy(value)) {
      fail(code);
    }
    prototype = Object.getPrototypeOf(value);
    keys = Reflect.ownKeys(value);
    descriptorEntries = keys.map((key) => [
      key,
      Object.getOwnPropertyDescriptor(value, key),
    ]);
  } catch {
    fail(code);
  }
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) !== expectedIsArray ||
    prototype !== (expectedIsArray ? Array.prototype : Object.prototype) ||
    keys.some((key) => typeof key !== "string")
  ) {
    fail(code);
  }

  const expectedKeys = expectedIsArray
    ? [
        ...Array.from({ length: expected.length }, (_, index) => String(index)),
        "length",
      ]
    : Object.keys(expected);
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key, index) => key !== expectedKeys[index])
  ) {
    fail(code);
  }
  for (const [, descriptor] of descriptorEntries) {
    if (descriptor === undefined || !("value" in descriptor)) fail(code);
  }
  const descriptors = Object.fromEntries(descriptorEntries);
  if (expectedIsArray) {
    const lengthDescriptor = descriptors.length;
    if (lengthDescriptor.value !== expected.length) fail(code);
    for (let index = 0; index < expected.length; index += 1) {
      compareExactOwnData(
        descriptors[String(index)].value,
        expected[index],
        code,
      );
    }
    return;
  }
  for (const key of expectedKeys) {
    compareExactOwnData(descriptors[key].value, expected[key], code);
  }
}

function asBytes(value, maximum, code) {
  if (value !== null && typeof value === "object" && types.isProxy(value)) {
    fail(code);
  }
  const bytes = Buffer.isBuffer(value)
    ? Buffer.from(value)
    : typeof value === "string"
      ? Buffer.from(value, "utf8")
      : fail(code);
  if (bytes.byteLength === 0 || bytes.byteLength > maximum) fail(code);
  return bytes;
}

function parseCanonicalLine(value, maximum, code) {
  const bytes = asBytes(value, maximum, code);
  if (
    bytes.at(-1) !== 0x0a ||
    bytes.includes(0x0d) ||
    bytes.subarray(0, -1).includes(0x0a)
  ) {
    fail(code);
  }
  let parsed;
  try {
    parsed = JSON.parse(bytes.subarray(0, -1).toString("utf8"));
  } catch {
    fail(code);
  }
  assertPlainRecord(parsed, code);
  const canonical = Buffer.from(`${JSON.stringify(parsed)}\n`, "utf8");
  if (!canonical.equals(bytes)) fail(code);
  return { bytes, value: parsed };
}

function assertFixedTuple(value, code) {
  if (
    value.generation !== M2A_TRANSFER.generation ||
    value.expectedRevision !== M2A_TRANSFER.expectedRevision ||
    value.runId !== M2A_TRANSFER.runId ||
    value.scenarioId !== M2A_TRANSFER.scenarioId
  ) {
    fail(code);
  }
}

export function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function createFixedDockerPlan(imageId) {
  if (!SHA256_PATTERN.test(imageId)) fail("M2A_IMAGE_ID_INVALID");
  const mount = `type=volume,source=${M2A_TRANSFER.transferVolume},destination=${M2A_TRANSFER.containerRunRoot}`;
  return freeze({
    executable: "/usr/bin/docker",
    shell: false,
    combinedOutputLimitBytes: 16_384,
    commandDeadlineMs: 30_000,
    initializerWaitDeadlineMs: 30_000,
    measurementAbsoluteDeadlineMs: 180_000,
    environment: {
      DOCKER_CONFIG: FIXED_DOCKER_CONFIG,
      HOME: FIXED_HOME,
      PATH: "/usr/bin:/bin",
    },
    inheritEnvironment: false,
    forbiddenInheritedEnvironmentPrefixes: ["DOCKER_"],
    hostLayoutPolicy: {
      repositoryRelativeWorkRoot: FIXED_HOST_WORK_ROOT,
      resolveInsideRepository: true,
      directoryCreation: "exclusive",
      directories: [
        {
          environmentKey: "DOCKER_CONFIG",
          path: FIXED_DOCKER_CONFIG,
          type: "directory",
          mode: 0o700,
          owner: "effective-user",
          symlink: false,
          empty: true,
        },
        {
          environmentKey: "HOME",
          path: FIXED_HOME,
          type: "directory",
          mode: 0o700,
          owner: "effective-user",
          symlink: false,
          empty: true,
        },
      ],
    },
    imageId,
    imageTag: M2A_TRANSFER.candidateImageTag,
    executionApproved: false,
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
    volumeCreate: [
      "volume",
      "create",
      "--driver",
      "local",
      "--label",
      `org.tskaigi.generation=${M2A_TRANSFER.generation}`,
      "--label",
      "org.tskaigi.purpose=m2a-evidence-transfer",
      M2A_TRANSFER.transferVolume,
    ],
    initializerCreate: [
      "create",
      "--name",
      M2A_TRANSFER.initializerContainer,
      "--network",
      "none",
      "--read-only",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
      "--user",
      "0:0",
      "--pids-limit",
      "16",
      "--memory",
      "128m",
      "--cpus",
      "1",
      "--pull",
      "never",
      "--mount",
      mount,
      imageId,
      "node",
      "/opt/m2a-transfer/initialize-m2a-volume.mjs",
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
    measurementCreate: [
      "create",
      "--name",
      M2A_TRANSFER.measurementContainer,
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
      "--pull",
      "never",
      "--tmpfs",
      "/work:rw,nosuid,nodev,noexec,size=67108864,uid=1000,gid=1000",
      "--tmpfs",
      "/tmp:rw,nosuid,nodev,noexec,size=33554432,uid=1000,gid=1000",
      "--mount",
      mount,
      imageId,
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
    completionCopy: [
      "cp",
      `${M2A_TRANSFER.measurementContainer}:${M2A_TRANSFER.containerRunRoot}/${M2A_TRANSFER.completionPath}`,
      `transfer/${M2A_TRANSFER.completionPath}`,
    ],
    segmentCopy: [
      "cp",
      `${M2A_TRANSFER.measurementContainer}:${M2A_TRANSFER.containerRunRoot}/${M2A_TRANSFER.segmentPath}`,
      `transfer/${M2A_TRANSFER.segmentPath}`,
    ],
    markerCopy: [
      "cp",
      `${M2A_TRANSFER.measurementContainer}:${M2A_TRANSFER.containerRunRoot}/${M2A_TRANSFER.markerPath}`,
      `transfer/${M2A_TRANSFER.markerPath}`,
    ],
  });
}

export function validateFixedDockerPlan(value, imageId) {
  const expected = createFixedDockerPlan(imageId);
  compareExactOwnData(value, expected, "M2A_DOCKER_PLAN_INVALID");
  return expected;
}

export function validateImageBinding(value, reviewedImageId) {
  const record = assertPlainRecord(value, "M2A_IMAGE_BINDING_INVALID");
  assertKeys(
    record,
    ["imageTag", "imageId", "sourceAggregate", "executionApproved"],
    "M2A_IMAGE_BINDING_INVALID",
  );
  if (
    record.imageTag !== M2A_TRANSFER.candidateImageTag ||
    record.imageId !== reviewedImageId ||
    !SHA256_PATTERN.test(record.imageId) ||
    record.sourceAggregate !== M2A_TRANSFER.sourceAggregate ||
    record.executionApproved !== false
  ) {
    fail("M2A_IMAGE_BINDING_INVALID");
  }
  return freeze({ ...record });
}

export function validateInspectionProjection(value, role, imageId) {
  const record = assertPlainRecord(value, "M2A_INSPECTION_INVALID");
  const keys = [
    "containerName",
    "imageId",
    "user",
    "networkMode",
    "readOnlyRootfs",
    "privileged",
    "capDrop",
    "capAdd",
    "securityOpt",
    "pidsLimit",
    "memoryBytes",
    "nanoCpus",
    "tmpfs",
    "mounts",
    "entry",
    "environmentNames",
  ];
  assertKeys(record, keys, "M2A_INSPECTION_INVALID");
  const initializer = role === "initializer";
  if (!initializer && role !== "measurement") fail("M2A_INSPECTION_INVALID");
  const expectedTmpfs = initializer
    ? []
    : [
        "/tmp:rw,nosuid,nodev,noexec,size=33554432,uid=1000,gid=1000",
        "/work:rw,nosuid,nodev,noexec,size=67108864,uid=1000,gid=1000",
      ];
  const expectedEntry = initializer
    ? ["node", "/opt/m2a-transfer/initialize-m2a-volume.mjs"]
    : ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"];
  if (
    record.containerName !==
      (initializer
        ? M2A_TRANSFER.initializerContainer
        : M2A_TRANSFER.measurementContainer) ||
    record.imageId !== imageId ||
    record.user !== (initializer ? "0:0" : "1000:1000") ||
    record.networkMode !== "none" ||
    record.readOnlyRootfs !== true ||
    record.privileged !== false ||
    JSON.stringify(record.capDrop) !== JSON.stringify(["ALL"]) ||
    JSON.stringify(record.capAdd) !== JSON.stringify([]) ||
    JSON.stringify(record.securityOpt) !==
      JSON.stringify(["no-new-privileges"]) ||
    JSON.stringify(record.tmpfs) !== JSON.stringify(expectedTmpfs) ||
    JSON.stringify(record.mounts) !==
      JSON.stringify([
        {
          type: "volume",
          name: M2A_TRANSFER.transferVolume,
          destination: M2A_TRANSFER.containerRunRoot,
          readWrite: true,
        },
      ]) ||
    JSON.stringify(record.entry) !== JSON.stringify(expectedEntry) ||
    JSON.stringify(record.environmentNames) !== JSON.stringify([]) ||
    record.pidsLimit !== (initializer ? 16 : 64) ||
    record.memoryBytes !== (initializer ? 134_217_728 : 536_870_912) ||
    record.nanoCpus !== 1_000_000_000
  ) {
    fail("M2A_INSPECTION_INVALID");
  }
  return freeze({ ...record });
}

function isSuccessfulNpmCompletionStep(record) {
  return (
    record.exitCode === 0 &&
    record.signal === null &&
    record.timedOut === false &&
    record.stdoutTruncated === false &&
    record.stderrTruncated === false
  );
}

function hasTruthfulTransferableRebuildFailure(completion) {
  const [install, approve, rebuild] = completion.npmFlow;
  const settlement = completion.runnerSettlement;
  return (
    settlement.npmChildClosed === true &&
    settlement.loopbackClosed === true &&
    settlement.prePublicationDescriptorsClosed === true &&
    isSuccessfulNpmCompletionStep(install) &&
    isSuccessfulNpmCompletionStep(approve) &&
    Number.isInteger(rebuild.exitCode) &&
    rebuild.exitCode !== 0 &&
    rebuild.signal === null &&
    rebuild.timedOut === false &&
    rebuild.stdoutTruncated === false &&
    rebuild.stderrTruncated === false &&
    install.approval === "absent" &&
    approve.approval === "present" &&
    rebuild.approval === "present" &&
    install.lockBefore === null &&
    SHA256_PATTERN.test(install.lockAfter) &&
    install.lockAfter === approve.lockBefore &&
    approve.lockBefore === approve.lockAfter &&
    approve.lockAfter === rebuild.lockBefore &&
    rebuild.lockBefore === rebuild.lockAfter &&
    completion.outputInventory[0]?.path === M2A_TRANSFER.segmentPath
  );
}

export function validateCompletionBytes(value) {
  const parsed = parseCanonicalLine(value, 16_384, "M2A_COMPLETION_INVALID");
  const completion = parsed.value;
  assertKeys(completion, COMPLETION_KEYS, "M2A_COMPLETION_INVALID");
  assertFixedTuple(completion, "M2A_COMPLETION_INVALID");
  if (completion.schemaVersion !== "m2a-transfer-completion/v1") {
    fail("M2A_COMPLETION_INVALID");
  }
  const toolchain = assertPlainRecord(
    completion.toolchain,
    "M2A_COMPLETION_INVALID",
  );
  assertKeys(toolchain, ["node", "npm"], "M2A_COMPLETION_INVALID");
  if (
    toolchain.node !== M2A_TRANSFER.nodeVersion ||
    toolchain.npm !== M2A_TRANSFER.npmVersion
  ) {
    fail("M2A_COMPLETION_INVALID");
  }
  const settlement = assertPlainRecord(
    completion.runnerSettlement,
    "M2A_COMPLETION_INVALID",
  );
  assertKeys(
    settlement,
    ["npmChildClosed", "loopbackClosed", "prePublicationDescriptorsClosed"],
    "M2A_COMPLETION_INVALID",
  );
  if (
    !Object.values(settlement).every((item) => typeof item === "boolean") ||
    !Array.isArray(completion.npmFlow) ||
    completion.npmFlow.length !== 3 ||
    !Array.isArray(completion.outputInventory) ||
    completion.outputInventory.length > 2
  ) {
    fail("M2A_COMPLETION_INVALID");
  }
  const expectedSteps = ["install", "approve-scripts", "rebuild"];
  const expectedArgv = [
    ["install"],
    ["approve-scripts", "@tskaigi-lab/m2a-install-probe"],
    ["rebuild", "@tskaigi-lab/m2a-install-probe"],
  ];
  completion.npmFlow.forEach((step, index) => {
    const record = assertPlainRecord(step, "M2A_COMPLETION_INVALID");
    assertKeys(
      record,
      [
        "stepId",
        "argv",
        "exitCode",
        "signal",
        "timedOut",
        "stdoutTruncated",
        "stderrTruncated",
        "approval",
        "lockBefore",
        "lockAfter",
      ],
      "M2A_COMPLETION_INVALID",
    );
    if (
      record.stepId !== expectedSteps[index] ||
      JSON.stringify(record.argv) !== JSON.stringify(expectedArgv[index]) ||
      !(record.exitCode === null || Number.isInteger(record.exitCode)) ||
      !(record.signal === null || typeof record.signal === "string") ||
      typeof record.timedOut !== "boolean" ||
      typeof record.stdoutTruncated !== "boolean" ||
      typeof record.stderrTruncated !== "boolean" ||
      !["absent", "present", "not-checked"].includes(record.approval) ||
      !(record.lockBefore === null || SHA256_PATTERN.test(record.lockBefore)) ||
      !(record.lockAfter === null || SHA256_PATTERN.test(record.lockAfter))
    ) {
      fail("M2A_COMPLETION_INVALID");
    }
  });
  completion.outputInventory.forEach((entry, index) => {
    const record = assertPlainRecord(entry, "M2A_COMPLETION_INVALID");
    assertKeys(
      record,
      ["path", "size", "sha256", "mode"],
      "M2A_COMPLETION_INVALID",
    );
    if (
      record.path !== FIXED_OUTPUT_PATHS[index] ||
      !Number.isInteger(record.size) ||
      record.size < 1 ||
      record.size > (index === 0 ? 4_194_304 : 4096) ||
      !SHA256_PATTERN.test(record.sha256) ||
      record.mode !== 0o600
    ) {
      fail("M2A_COMPLETION_INVALID");
    }
  });
  if (
    !["complete", "inconclusive"].includes(completion.status) ||
    (completion.status === "complete" && completion.issue !== null) ||
    (completion.status === "inconclusive" &&
      !COMPLETION_ISSUES.has(completion.issue))
  ) {
    fail("M2A_COMPLETION_INVALID");
  }
  const [install, approve, rebuild] = completion.npmFlow;
  if (
    (completion.status === "complete" &&
      (!settlement.npmChildClosed ||
        !settlement.loopbackClosed ||
        !settlement.prePublicationDescriptorsClosed ||
        !completion.npmFlow.every(isSuccessfulNpmCompletionStep) ||
        install.approval !== "absent" ||
        approve.approval !== "present" ||
        rebuild.approval !== "present" ||
        install.lockBefore !== null ||
        !SHA256_PATTERN.test(install.lockAfter) ||
        completion.outputInventory[0]?.path !== M2A_TRANSFER.segmentPath)) ||
    install.lockAfter !== approve.lockBefore ||
    approve.lockBefore !== approve.lockAfter ||
    rebuild.lockBefore !== rebuild.lockAfter ||
    approve.lockAfter !== rebuild.lockBefore
  ) {
    fail("M2A_COMPLETION_INVALID");
  }
  return freeze({ bytes: Buffer.from(parsed.bytes), completion });
}

export function validateTransferredFile(value, expected, hostOwner) {
  const record = assertPlainRecord(value, "M2A_TRANSFER_FILE_INVALID");
  assertKeys(
    record,
    [
      "path",
      "type",
      "mode",
      "uid",
      "gid",
      "nlink",
      "size",
      "sha256",
      "parentIdentityStable",
      "fileIdentityStable",
    ],
    "M2A_TRANSFER_FILE_INVALID",
  );
  const expectation = assertPlainRecord(expected, "M2A_TRANSFER_FILE_INVALID");
  const fixedExpectations = new Map([
    [
      `transfer/${M2A_TRANSFER.completionPath}`,
      { mode: 0o444, maximum: 16_384 },
    ],
    [
      `transfer/${M2A_TRANSFER.segmentPath}`,
      { mode: 0o600, maximum: 4_194_304 },
    ],
    [`transfer/${M2A_TRANSFER.markerPath}`, { mode: 0o600, maximum: 4096 }],
  ]);
  const fixed = fixedExpectations.get(expectation.path);
  if (
    fixed === undefined ||
    expectation.mode !== fixed.mode ||
    record.path !== expectation.path ||
    record.type !== "regular" ||
    record.mode !== expectation.mode ||
    record.uid !== hostOwner.uid ||
    record.gid !== hostOwner.gid ||
    record.nlink !== 1 ||
    record.size !== expectation.size ||
    record.size > fixed.maximum ||
    record.sha256 !== expectation.sha256 ||
    !Number.isInteger(record.size) ||
    record.size < 1 ||
    !SHA256_PATTERN.test(record.sha256) ||
    record.parentIdentityStable !== true ||
    record.fileIdentityStable !== true ||
    !Number.isInteger(hostOwner.uid) ||
    !Number.isInteger(hostOwner.gid)
  ) {
    fail("M2A_TRANSFER_FILE_INVALID");
  }
  return freeze({ ...record });
}

function validateEventCommon(event, index) {
  if (
    event.schemaVersion !== "probe-event/v2" ||
    event.runId !== M2A_TRANSFER.runId ||
    event.scenarioId !== M2A_TRANSFER.scenarioId ||
    event.route !== "npm-install-lifecycle" ||
    event.phase !== "install-lifecycle" ||
    event.triggerType !== "automatic" ||
    event.adapterVersion !== "0.0.0" ||
    event.producerId !== "npm-lifecycle-producer" ||
    event.producerSequence !== index ||
    event.workerId !== null ||
    event.cwdId !== "npm-lifecycle-consumer" ||
    event.nodeVersion !== M2A_TRANSFER.nodeVersion ||
    event.toolName !== "npm" ||
    event.toolVersion !== M2A_TRANSFER.npmVersion ||
    !["success", "failure", "skipped"].includes(event.outcome) ||
    !(
      event.normalizedErrorCode === null ||
      typeof event.normalizedErrorCode === "string"
    ) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(event.timestamp) ||
    !Number.isInteger(event.durationMs) ||
    event.durationMs < 0 ||
    !Number.isInteger(event.pid) ||
    !Number.isInteger(event.ppid)
  ) {
    fail("M2A_SEGMENT_INVALID");
  }
}

function validateAttemptEventDetails(event) {
  if (event.outcome === "success" && event.normalizedErrorCode !== null) {
    fail("M2A_SEGMENT_INVALID");
  }
  if (event.outcome === "failure" && event.normalizedErrorCode === null) {
    fail("M2A_SEGMENT_INVALID");
  }
  const details = event.details;
  const nonnegativeOrNull = (value) =>
    value === null || (Number.isInteger(value) && value >= 0);
  switch (event.attemptType) {
    case "environment-canary-read":
      assertKeys(
        details,
        ["kind", "present", "byteLength"],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "environment" ||
        typeof details.present !== "boolean" ||
        !nonnegativeOrNull(details.byteLength)
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    case "canary-file-read":
      assertKeys(
        details,
        ["kind", "present", "regularFile", "readSucceeded", "sizeBytes"],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "file-read" ||
        typeof details.present !== "boolean" ||
        typeof details.regularFile !== "boolean" ||
        typeof details.readSucceeded !== "boolean" ||
        !nonnegativeOrNull(details.sizeBytes)
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    case "file-hash":
      assertKeys(
        details,
        ["kind", "state", "sizeBytes"],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "file-hash" ||
        !["present", "missing", "unavailable"].includes(details.state) ||
        !nonnegativeOrNull(details.sizeBytes)
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    case "direct-filesystem-write":
      assertKeys(
        details,
        ["kind", "markerSchemaVersion"],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "file-write" ||
        details.markerSchemaVersion !== "probe-marker/v1"
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    case "loopback-connect":
      assertKeys(
        details,
        ["kind", "statusCode", "timedOut", "protocolVerified", "bodyBytes"],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "loopback" ||
        !nonnegativeOrNull(details.statusCode) ||
        typeof details.timedOut !== "boolean" ||
        typeof details.protocolVerified !== "boolean" ||
        !Number.isInteger(details.bodyBytes) ||
        details.bodyBytes < 0
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    case "child-node-process":
      assertKeys(
        details,
        [
          "kind",
          "exitCode",
          "timedOut",
          "responseVerified",
          "stdoutBytes",
          "stderrBytes",
        ],
        "M2A_SEGMENT_INVALID",
      );
      if (
        details.kind !== "child" ||
        !nonnegativeOrNull(details.exitCode) ||
        typeof details.timedOut !== "boolean" ||
        typeof details.responseVerified !== "boolean" ||
        !Number.isInteger(details.stdoutBytes) ||
        details.stdoutBytes < 0 ||
        !Number.isInteger(details.stderrBytes) ||
        details.stderrBytes < 0
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      break;
    default:
      fail("M2A_SEGMENT_INVALID");
  }
}

export function validateProducerSegmentBytes(value) {
  const bytes = asBytes(value, 4_194_304, "M2A_SEGMENT_INVALID");
  if (bytes.at(-1) !== 0x0a || bytes.includes(0x0d)) {
    fail("M2A_SEGMENT_INVALID");
  }
  const lines = bytes.subarray(0, -1).toString("utf8").split("\n");
  if (lines.length !== 7) fail("M2A_SEGMENT_INVALID");
  const events = lines.map((line, index) => {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      fail("M2A_SEGMENT_INVALID");
    }
    assertPlainRecord(event, "M2A_SEGMENT_INVALID");
    if (JSON.stringify(event) !== line) fail("M2A_SEGMENT_INVALID");
    const [kind, id] = EVENT_ORDER[index];
    if (event.eventKind !== kind) fail("M2A_SEGMENT_INVALID");
    validateEventCommon(event, index);
    if (kind === "route-invocation") {
      assertKeys(event, ROUTE_EVENT_KEYS, "M2A_SEGMENT_INVALID");
      if (
        event.routeInvocationId !== id ||
        event.invocationKind !== "lifecycle-hook" ||
        event.logicalUnitId !== "npm-install-lifecycle" ||
        event.outcome !== "success" ||
        event.normalizedErrorCode !== null
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
    } else {
      assertKeys(event, ATTEMPT_EVENT_KEYS, "M2A_SEGMENT_INVALID");
      const definition = ATTEMPT_DEFINITIONS[index - 1];
      if (
        event.attemptId !== id ||
        event.attemptType !== definition[1] ||
        event.targetId !== definition[2] ||
        !isPlainRecord(event.details) ||
        !(event.beforeHash === null || SHA256_PATTERN.test(event.beforeHash)) ||
        !(event.afterHash === null || SHA256_PATTERN.test(event.afterHash))
      ) {
        fail("M2A_SEGMENT_INVALID");
      }
      validateAttemptEventDetails(event);
    }
    return event;
  });
  return freeze({ bytes: Buffer.from(bytes), sha256: sha256(bytes), events });
}

export function validateMarkerBytes(value, events) {
  const writeEvent = events[4];
  if (
    !writeEvent ||
    writeEvent.attemptId !== "npm-lifecycle-attempt-file-write" ||
    writeEvent.outcome !== "success" ||
    !SHA256_PATTERN.test(writeEvent.afterHash)
  ) {
    fail("M2A_MARKER_INVALID");
  }
  const parsed = parseCanonicalLine(value, 4096, "M2A_MARKER_INVALID");
  assertKeys(
    parsed.value,
    ["schemaVersion", "attemptId", "runId", "scenarioId"],
    "M2A_MARKER_INVALID",
  );
  if (
    parsed.value.schemaVersion !== "probe-marker/v1" ||
    parsed.value.attemptId !== "npm-lifecycle-attempt-file-write" ||
    parsed.value.runId !== M2A_TRANSFER.runId ||
    parsed.value.scenarioId !== M2A_TRANSFER.scenarioId ||
    sha256(parsed.bytes) !== writeEvent.afterHash
  ) {
    fail("M2A_MARKER_INVALID");
  }
  return freeze({ bytes: Buffer.from(parsed.bytes), marker: parsed.value });
}

export function validateCompletionArtifacts(
  completionInput,
  segmentInput,
  markerInput,
) {
  const completion =
    typeof completionInput === "string" || Buffer.isBuffer(completionInput)
      ? validateCompletionBytes(completionInput).completion
      : validateCompletionBytes(
          `${JSON.stringify(
            assertPlainRecord(completionInput, "M2A_ARTIFACT_SET_INVALID"),
          )}\n`,
        ).completion;
  const paths = completion.outputInventory.map((entry) => entry.path);
  const hasSegment = paths.includes(M2A_TRANSFER.segmentPath);
  const hasMarker = paths.includes(M2A_TRANSFER.markerPath);
  if (completion.status === "complete" && !hasSegment) {
    fail("M2A_ARTIFACT_SET_INVALID");
  }
  if (hasSegment !== (segmentInput !== null && segmentInput !== undefined)) {
    fail("M2A_ARTIFACT_SET_INVALID");
  }
  if (hasMarker !== (markerInput !== null && markerInput !== undefined)) {
    fail("M2A_ARTIFACT_SET_INVALID");
  }
  if (!hasSegment) return freeze({ completion, segment: null, marker: null });
  const segment = validateProducerSegmentBytes(segmentInput);
  const segmentRow = completion.outputInventory.find(
    (entry) => entry.path === M2A_TRANSFER.segmentPath,
  );
  if (
    segmentRow.size !== segment.bytes.length ||
    segmentRow.sha256 !== segment.sha256
  ) {
    fail("M2A_ARTIFACT_SET_INVALID");
  }
  const writeEvent = segment.events[4];
  if (writeEvent.outcome === "success") {
    if (!hasMarker) fail("M2A_ARTIFACT_SET_INVALID");
    const marker = validateMarkerBytes(markerInput, segment.events);
    const markerRow = completion.outputInventory.find(
      (entry) => entry.path === M2A_TRANSFER.markerPath,
    );
    if (
      markerRow.size !== marker.bytes.length ||
      markerRow.sha256 !== sha256(marker.bytes)
    ) {
      fail("M2A_ARTIFACT_SET_INVALID");
    }
    return freeze({ completion, segment, marker });
  }
  if (hasMarker) fail("M2A_ARTIFACT_SET_INVALID");
  return freeze({ completion, segment, marker: null });
}

export function validateCandidateTransfer(
  attemptInput,
  reviewedImageId,
  completionInput,
  segmentInput,
  markerInput,
) {
  const validatedAttempt = validateAttemptBytes(attemptInput, reviewedImageId);
  const validatedCompletion = validateCompletionBytes(completionInput);
  const artifacts = validateCompletionArtifacts(
    validatedCompletion.bytes,
    segmentInput,
    markerInput,
  );
  const { attempt } = validatedAttempt;
  const { completion, segment, marker } = artifacts;
  const listedPaths = completion.outputInventory.map((entry) => entry.path);
  const hasSegment = listedPaths.includes(M2A_TRANSFER.segmentPath);
  const hasMarker = listedPaths.includes(M2A_TRANSFER.markerPath);
  const attemptIssue = attempt.issues[0] ?? null;
  if (
    attempt.completionTransfer !== "valid" ||
    attempt.segmentTransfer !== (hasSegment ? "valid" : "not-attempted") ||
    attempt.markerTransfer !== (hasMarker ? "valid" : "not-attempted") ||
    (segment !== null) !== hasSegment ||
    (marker !== null) !== hasMarker
  ) {
    fail("M2A_CANDIDATE_TRANSFER_INVALID");
  }
  if (completion.status === "complete") {
    if (completion.issue !== null || attemptIssue !== null) {
      fail("M2A_CANDIDATE_TRANSFER_INVALID");
    }
  } else if (
    completion.status !== "inconclusive" ||
    completion.issue !== "M2A_REBUILD_FAILED" ||
    attemptIssue?.code !== "M2A_REBUILD_FAILED" ||
    attemptIssue.step !== "validate-completion" ||
    !hasTruthfulTransferableRebuildFailure(completion)
  ) {
    fail("M2A_CANDIDATE_TRANSFER_INVALID");
  }
  return freeze({
    attempt,
    completion,
    segment:
      segment === null
        ? null
        : { sha256: segment.sha256, events: segment.events },
    marker: marker === null ? null : marker.marker,
  });
}

export function validateAttemptBytes(value, reviewedImageId) {
  const parsed = parseCanonicalLine(value, 16_384, "M2A_ATTEMPT_INVALID");
  const attempt = parsed.value;
  assertKeys(attempt, ATTEMPT_KEYS, "M2A_ATTEMPT_INVALID");
  assertFixedTuple(attempt, "M2A_ATTEMPT_INVALID");
  const initializerSettlements = new Set([
    "not-started",
    "natural-exited-zero",
    "known-failed",
    "unknown",
  ]);
  const measurementSettlements = new Set([
    "not-started",
    "natural-exited",
    "known-failed",
    "unknown",
  ]);
  const transferStates = new Set([
    "not-attempted",
    "valid",
    "invalid",
    "unknown",
  ]);
  if (
    attempt.schemaVersion !== "m2a-transfer-attempt/v1" ||
    attempt.imageId !== reviewedImageId ||
    !SHA256_PATTERN.test(attempt.imageId) ||
    !initializerSettlements.has(attempt.initializerSettlement) ||
    !measurementSettlements.has(attempt.measurementSettlement) ||
    typeof attempt.naturalExit !== "boolean" ||
    !transferStates.has(attempt.completionTransfer) ||
    !transferStates.has(attempt.segmentTransfer) ||
    !transferStates.has(attempt.markerTransfer) ||
    !Array.isArray(attempt.issues) ||
    attempt.issues.length > 1 ||
    attempt.evidenceReview !== "not-performed"
  ) {
    fail("M2A_ATTEMPT_INVALID");
  }
  const issue = attempt.issues[0] ?? null;
  if (issue !== null) {
    assertPlainRecord(issue, "M2A_ATTEMPT_INVALID");
    assertKeys(issue, ["code", "step"], "M2A_ATTEMPT_INVALID");
    const allowedCodes = new Set([
      "M2A_SETTLEMENT_UNKNOWN",
      STEP_FAILURE_CODES[issue.step],
      ...(SPECIAL_ISSUE_CODES[issue.step] ?? []),
    ]);
    if (
      !STATE_STEPS.includes(issue.step) ||
      typeof issue.code !== "string" ||
      !allowedCodes.has(issue.code)
    ) {
      fail("M2A_ATTEMPT_INVALID");
    }
  }

  const transfersAre = (completion, segment, marker) =>
    attempt.completionTransfer === completion &&
    attempt.segmentTransfer === segment &&
    attempt.markerTransfer === marker;
  const initializerDone =
    attempt.initializerSettlement === "natural-exited-zero";
  const measurementDone =
    attempt.measurementSettlement === "natural-exited" &&
    attempt.naturalExit === true;
  if (issue === null) {
    if (
      !initializerDone ||
      !measurementDone ||
      attempt.completionTransfer !== "valid" ||
      attempt.segmentTransfer !== "valid" ||
      !["not-attempted", "valid"].includes(attempt.markerTransfer)
    ) {
      fail("M2A_ATTEMPT_INVALID");
    }
  } else {
    const stepIndex = STATE_STEPS.indexOf(issue.step);
    const unknown = issue.code === "M2A_SETTLEMENT_UNKNOWN";
    let compatible = false;
    if (stepIndex <= STATE_STEPS.indexOf("initializer-inspect-pre")) {
      compatible =
        attempt.initializerSettlement === "not-started" &&
        attempt.measurementSettlement === "not-started" &&
        attempt.naturalExit === false &&
        transfersAre("not-attempted", "not-attempted", "not-attempted");
    } else if (stepIndex <= STATE_STEPS.indexOf("initializer-inspect-final")) {
      compatible =
        attempt.initializerSettlement ===
          (unknown ? "unknown" : "known-failed") &&
        attempt.measurementSettlement === "not-started" &&
        attempt.naturalExit === false &&
        transfersAre("not-attempted", "not-attempted", "not-attempted");
    } else if (stepIndex <= STATE_STEPS.indexOf("measurement-inspect-pre")) {
      compatible =
        initializerDone &&
        attempt.measurementSettlement === "not-started" &&
        attempt.naturalExit === false &&
        transfersAre("not-attempted", "not-attempted", "not-attempted");
    } else if (stepIndex <= STATE_STEPS.indexOf("measurement-inspect-final")) {
      compatible =
        initializerDone &&
        attempt.measurementSettlement ===
          (unknown ? "unknown" : "known-failed") &&
        attempt.naturalExit === false &&
        transfersAre("not-attempted", "not-attempted", "not-attempted");
    } else if (issue.step === "copy-completion") {
      compatible =
        initializerDone &&
        measurementDone &&
        transfersAre(
          unknown ? "unknown" : "invalid",
          "not-attempted",
          "not-attempted",
        );
    } else if (issue.step === "validate-completion") {
      const publishedRunnerIssue =
        issue.code === "M2A_COMPLETION_EXIT_MISMATCH" ||
        COMPLETION_ISSUES.has(issue.code);
      compatible =
        initializerDone &&
        measurementDone &&
        (publishedRunnerIssue
          ? attempt.completionTransfer === "valid" &&
            (issue.code === "M2A_REBUILD_FAILED"
              ? ["not-attempted", "valid", "invalid", "unknown"].includes(
                  attempt.segmentTransfer,
                ) &&
                (attempt.segmentTransfer === "valid"
                  ? ["not-attempted", "valid", "invalid", "unknown"].includes(
                      attempt.markerTransfer,
                    )
                  : attempt.markerTransfer === "not-attempted")
              : attempt.segmentTransfer === "not-attempted" &&
                attempt.markerTransfer === "not-attempted")
          : transfersAre(
              unknown ? "unknown" : "invalid",
              "not-attempted",
              "not-attempted",
            ));
    } else if (["copy-segment", "validate-segment"].includes(issue.step)) {
      compatible =
        initializerDone &&
        measurementDone &&
        attempt.completionTransfer === "valid" &&
        attempt.segmentTransfer === (unknown ? "unknown" : "invalid") &&
        attempt.markerTransfer === "not-attempted";
    } else if (["copy-marker", "validate-marker"].includes(issue.step)) {
      compatible =
        initializerDone &&
        measurementDone &&
        attempt.completionTransfer === "valid" &&
        attempt.segmentTransfer === "valid" &&
        attempt.markerTransfer === (unknown ? "unknown" : "invalid");
    }
    if (!compatible) fail("M2A_ATTEMPT_INVALID");
  }
  return freeze({ bytes: Buffer.from(parsed.bytes), attempt });
}

function defaultStepResult(step) {
  if (step === "initializer-wait") {
    return { settlement: "settled", ok: true, value: { exitCode: 0 } };
  }
  if (step === "measurement-wait") {
    return { settlement: "settled", ok: true, value: { exitCode: 0 } };
  }
  if (step === "measurement-inspect-final") {
    return {
      settlement: "settled",
      ok: true,
      value: { state: "exited", exitCode: 0 },
    };
  }
  if (step === "initializer-inspect-final") {
    return {
      settlement: "settled",
      ok: true,
      value: { state: "exited", exitCode: 0 },
    };
  }
  if (step === "validate-completion") {
    return {
      settlement: "settled",
      ok: true,
      value: {
        status: "complete",
        issue: null,
        outputs: [M2A_TRANSFER.segmentPath],
      },
    };
  }
  return { settlement: "settled", ok: true, value: null };
}

export function createFakeM2aTransferBackend(overrides = {}) {
  assertPlainRecord(overrides, "M2A_FAKE_BACKEND_INVALID");
  if (Object.keys(overrides).some((step) => !STATE_STEPS.includes(step))) {
    fail("M2A_FAKE_BACKEND_INVALID");
  }
  const backend = {
    async perform(step) {
      if (!STATE_STEPS.includes(step)) fail("M2A_FAKE_STEP_INVALID");
      const value = Object.hasOwn(overrides, step)
        ? overrides[step]
        : defaultStepResult(step);
      const encoded = JSON.stringify(value);
      if (encoded === undefined) fail("M2A_FAKE_RESULT_INVALID");
      return freeze(JSON.parse(encoded));
    },
  };
  fakeBackendBrand.add(backend);
  return freeze(backend);
}

export async function runM2aTransferStateMachineForTest(backend) {
  if (!fakeBackendBrand.has(backend)) fail("M2A_FAKE_BACKEND_REQUIRED");
  const performed = [];
  const issues = [];
  let firstIssue = null;
  let initializerExit = null;
  let measurementExit = null;
  let naturalExit = false;
  let outputs = [];
  let initializerSettlement = "not-started";
  let measurementSettlement = "not-started";
  let completionTransfer = "not-attempted";
  let segmentTransfer = "not-attempted";
  let markerTransfer = "not-attempted";
  let completionStatus = null;
  let completionIssue = null;
  const recordIssue = (code, step) => {
    if (firstIssue !== null) return;
    const issue = freeze({ code, step });
    issues.push(issue);
    firstIssue = issue;
  };
  const markFailedState = (step, unknown) => {
    const value = unknown ? "unknown" : "known-failed";
    if (
      STATE_STEPS.indexOf(step) >= STATE_STEPS.indexOf("initializer-start") &&
      STATE_STEPS.indexOf(step) <=
        STATE_STEPS.indexOf("initializer-inspect-final")
    ) {
      initializerSettlement = value;
    }
    if (
      STATE_STEPS.indexOf(step) >= STATE_STEPS.indexOf("measurement-start") &&
      STATE_STEPS.indexOf(step) <=
        STATE_STEPS.indexOf("measurement-inspect-final")
    ) {
      measurementSettlement = value;
    }
    if (["copy-completion", "validate-completion"].includes(step)) {
      completionTransfer = unknown ? "unknown" : "invalid";
    }
    if (["copy-segment", "validate-segment"].includes(step)) {
      segmentTransfer = unknown ? "unknown" : "invalid";
    }
    if (["copy-marker", "validate-marker"].includes(step)) {
      markerTransfer = unknown ? "unknown" : "invalid";
    }
  };
  const performStep = async (step) => {
    const result = await backend.perform(step);
    performed.push(step);
    const record = assertPlainRecord(result, "M2A_FAKE_RESULT_INVALID");
    assertKeys(
      record,
      ["settlement", "ok", "value"],
      "M2A_FAKE_RESULT_INVALID",
    );
    if (!["settled", "unknown"].includes(record.settlement)) {
      fail("M2A_FAKE_RESULT_INVALID");
    }
    if (typeof record.ok !== "boolean") fail("M2A_FAKE_RESULT_INVALID");
    if (record.settlement === "unknown") {
      if (record.ok !== false || record.value !== null) {
        fail("M2A_FAKE_RESULT_INVALID");
      }
      markFailedState(step, true);
      recordIssue("M2A_SETTLEMENT_UNKNOWN", step);
      return false;
    }
    if (record.ok !== true) {
      let code = STEP_FAILURE_CODES[step];
      if (record.value !== null) {
        assertPlainRecord(record.value, "M2A_FAKE_RESULT_INVALID");
        assertKeys(record.value, ["code"], "M2A_FAKE_RESULT_INVALID");
        const allowed = new Set([
          STEP_FAILURE_CODES[step],
          ...(SPECIAL_ISSUE_CODES[step] ?? []),
        ]);
        if (!allowed.has(record.value.code)) fail("M2A_FAKE_RESULT_INVALID");
        code = record.value.code;
      }
      markFailedState(step, false);
      recordIssue(code, step);
      return false;
    }
    if (step === "initializer-wait") {
      if (!Number.isInteger(record.value?.exitCode)) {
        fail("M2A_FAKE_RESULT_INVALID");
      }
      initializerExit = record.value.exitCode;
    }
    if (step === "initializer-inspect-final") {
      if (
        record.value?.state !== "exited" ||
        record.value?.exitCode !== initializerExit ||
        record.value.exitCode !== 0
      ) {
        initializerSettlement = "known-failed";
        recordIssue("M2A_INITIALIZER_NOT_NATURAL_ZERO", step);
        return false;
      }
      initializerSettlement = "natural-exited-zero";
    }
    if (step === "measurement-wait") {
      if (!Number.isInteger(record.value?.exitCode)) {
        fail("M2A_FAKE_RESULT_INVALID");
      }
      measurementExit = record.value.exitCode;
    }
    if (step === "measurement-inspect-final") {
      if (
        record.value?.state !== "exited" ||
        !Number.isInteger(record.value?.exitCode) ||
        record.value.exitCode !== measurementExit
      ) {
        measurementSettlement = "known-failed";
        recordIssue("M2A_MEASUREMENT_NOT_NATURAL", step);
        return false;
      }
      naturalExit = true;
      measurementSettlement = "natural-exited";
    }
    if (step === "copy-completion") completionTransfer = "valid";
    if (step === "copy-segment") segmentTransfer = "valid";
    if (step === "copy-marker") markerTransfer = "valid";
    if (step === "validate-segment") segmentTransfer = "valid";
    if (step === "validate-marker") markerTransfer = "valid";
    if (step === "validate-completion") {
      assertPlainRecord(record.value, "M2A_FAKE_RESULT_INVALID");
      assertKeys(
        record.value,
        ["status", "issue", "outputs"],
        "M2A_FAKE_RESULT_INVALID",
      );
      completionStatus = record.value.status;
      completionIssue = record.value.issue;
      outputs = record.value.outputs;
      if (
        !["complete", "inconclusive"].includes(completionStatus) ||
        !Array.isArray(outputs) ||
        outputs.length > FIXED_OUTPUT_PATHS.length ||
        outputs.some((item, index) => item !== FIXED_OUTPUT_PATHS[index]) ||
        (completionStatus === "complete" &&
          (completionIssue !== null ||
            outputs[0] !== M2A_TRANSFER.segmentPath)) ||
        (completionStatus === "inconclusive" &&
          !COMPLETION_ISSUES.has(completionIssue))
      ) {
        completionTransfer = "invalid";
        recordIssue("M2A_COMPLETION_TRANSFER_INVALID", step);
        return false;
      }
      completionTransfer = "valid";
      if (
        (measurementExit === 0 && completionStatus !== "complete") ||
        (measurementExit !== 0 && completionStatus === "complete")
      ) {
        recordIssue("M2A_COMPLETION_EXIT_MISMATCH", step);
        return false;
      }
      if (completionIssue !== null) recordIssue(completionIssue, step);
    }
    return true;
  };
  for (const step of BASE_STATE_STEPS) {
    if (!(await performStep(step))) break;
  }
  const transferableCompletionIssue =
    firstIssue === null ||
    (completionIssue === "M2A_REBUILD_FAILED" &&
      firstIssue?.code === "M2A_REBUILD_FAILED");
  if (
    performed.includes("validate-completion") &&
    completionTransfer === "valid" &&
    transferableCompletionIssue
  ) {
    for (const output of outputs) {
      const prefix = output === M2A_TRANSFER.segmentPath ? "segment" : "marker";
      if (!(await performStep(`copy-${prefix}`))) break;
      if (!(await performStep(`validate-${prefix}`))) break;
    }
  }
  const completeTransport =
    completionTransfer === "valid" &&
    segmentTransfer === "valid" &&
    ["not-attempted", "valid"].includes(markerTransfer);
  const status = !completeTransport
    ? "inconclusive"
    : completionIssue === "M2A_REBUILD_FAILED" && measurementExit !== 0
      ? "failure"
      : firstIssue === null &&
          completionStatus === "complete" &&
          measurementExit === 0
        ? "complete"
        : "inconclusive";
  return freeze({
    status,
    firstIssue,
    issues,
    performed,
    retained: true,
    initializerSettlement,
    measurementSettlement,
    naturalExit,
    completionTransfer,
    segmentTransfer,
    markerTransfer,
    evidenceReview: "not-performed",
    executionApproved: false,
  });
}
