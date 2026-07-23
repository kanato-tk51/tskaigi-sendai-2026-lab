import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, rename } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { types } from "node:util";
import { fileURLToPath } from "node:url";

import {
  M2A_TRANSFER,
  createFixedDockerPlan,
  validateCandidateTransfer,
  validateCompletionArtifacts,
  validateCompletionBytes,
  validateAttemptBytes,
  validateFixedDockerPlan,
  validateInspectionProjection,
  validateMarkerBytes,
  validateProducerSegmentBytes,
  validateTransferredFile,
} from "./m2a-transfer-lib.mjs";
import { createM2aPrivateProcessSettlementState } from "./m2a-transfer-construction.mjs";

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const fakeBuildBackendBrand = new WeakSet();
const fakeProductionBackendBrand = new WeakSet();
const fakeHeldDirectoryTraceBrand = new WeakSet();
const fixedImageBuildAuthorityBrand = new WeakSet();
const fixedRuntimeAuthorityBrand = new WeakSet();
const PRODUCTION_MODULE_DIRECTORY = path.dirname(
  fileURLToPath(import.meta.url),
);
const PRODUCTION_REPOSITORY_ROOT = path.resolve(
  PRODUCTION_MODULE_DIRECTORY,
  "../../..",
);
const BASE_REFERENCE =
  "node:24.18.0-bookworm-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5";
const BASE_REPOSITORY_DIGEST =
  "node@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5";
const CONSTRUCTION_ROOT =
  "experiments/npm12-install/.work/m2a-transfer-construction-20260721-01";
const BUILD_ROOT =
  "experiments/npm12-install/.work/m2a-transfer-image-build-20260721-01";
const RUNTIME_ROOT = "experiments/npm12-install/.work/m2a-transfer-20260721-01";
const DOCKER_VERSION_FORMAT =
  '{"client":{{json .Client.Version}},"server":{{json .Server.Version}}}';
const BASE_INSPECT_FORMAT =
  '{"architecture":{{json .Architecture}},"id":{{json .Id}},"os":{{json .Os}},"repoDigests":{{json .RepoDigests}}}';
const CANDIDATE_INSPECT_FORMAT =
  '{"architecture":{{json .Architecture}},"cmd":{{json .Config.Cmd}},"entrypoint":{{json .Config.Entrypoint}},"environmentNames":[{{range $index, $entry := .Config.Env}}{{if $index}},{{end}}{{if lt (len (split $entry "=")) 2}}{{json "M2A_INVALID_ENV_ENTRY"}}{{else}}{{json (index (split $entry "=") 0)}}{{end}}{{end}}],"id":{{json .Id}},"labels":{{json .Config.Labels}},"os":{{json .Os}},"repoTags":{{json .RepoTags}},"user":{{json .Config.User}},"workingDir":{{json .Config.WorkingDir}}}';
const ABSENCE_STEPS = Object.freeze([
  "absence-volume",
  "absence-initializer-container",
  "absence-measurement-container",
]);
const RUNTIME_COMMAND_STEPS = Object.freeze([
  ...ABSENCE_STEPS,
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
  "copy-segment",
  "copy-marker",
]);
const VALIDATION_STEPS = Object.freeze([
  "validate-completion",
  "validate-segment",
  "validate-marker",
]);
const FAILURE_CODES = Object.freeze({
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
  "copy-segment": "M2A_SEGMENT_COPY_FAILED",
  "copy-marker": "M2A_MARKER_COPY_FAILED",
});

function fail(code) {
  throw new Error(code);
}

function freeze(value) {
  if (ArrayBuffer.isView(value)) return value;
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if ("value" in descriptor) freeze(descriptor.value);
  }
  return value;
}

function readRecord(value, code) {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Object.getOwnPropertySymbols(value).length !== 0
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const output = {};
    for (const key of Object.keys(descriptors)) {
      const descriptor = descriptors[key];
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true
      ) {
        fail(code);
      }
      output[key] = descriptor.value;
    }
    return output;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function readArray(value, code) {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      !Array.isArray(value) ||
      types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Array.prototype ||
      Object.getOwnPropertySymbols(value).length !== 0
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const length = descriptors.length;
    if (
      length === undefined ||
      !("value" in length) ||
      length.enumerable !== false ||
      !Number.isSafeInteger(length.value) ||
      length.value < 0 ||
      Object.keys(descriptors).length !== length.value + 1
    ) {
      fail(code);
    }
    const output = [];
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = descriptors[String(index)];
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true
      ) {
        fail(code);
      }
      output.push(descriptor.value);
    }
    return output;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function assertKeys(record, keys, code) {
  if (JSON.stringify(Object.keys(record)) !== JSON.stringify(keys)) fail(code);
}

function compareExact(value, expected, code) {
  if (Array.isArray(expected)) {
    const actual = readArray(value, code);
    if (actual.length !== expected.length) fail(code);
    actual.forEach((item, index) => compareExact(item, expected[index], code));
    return;
  }
  if (expected !== null && typeof expected === "object") {
    const actual = readRecord(value, code);
    assertKeys(actual, Object.keys(expected), code);
    for (const key of Object.keys(expected)) {
      compareExact(actual[key], expected[key], code);
    }
    return;
  }
  if (!Object.is(value, expected)) fail(code);
}

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function assertSha256(value, code) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) fail(code);
}

function canonical(value) {
  return Buffer.from(`${JSON.stringify(value)}\n`, "utf8");
}

function snapshotRuntimeBytes(value, maximum, code) {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      types.isProxy(value) ||
      !types.isUint8Array(value) ||
      types.isSharedArrayBuffer(value.buffer) ||
      ![Uint8Array.prototype, Buffer.prototype].includes(
        Object.getPrototypeOf(value),
      )
    ) {
      fail(code);
    }
    const bytes = Buffer.from(value);
    if (bytes.length === 0 || bytes.length > maximum) fail(code);
    return bytes;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function parseCanonicalLine(value, maximum, code) {
  let bytes;
  try {
    if (typeof value === "string") bytes = Buffer.from(value, "utf8");
    else if (
      value !== null &&
      typeof value === "object" &&
      types.isUint8Array(value) &&
      !types.isProxy(value) &&
      !types.isSharedArrayBuffer(value.buffer) &&
      [Uint8Array.prototype, Buffer.prototype].includes(
        Object.getPrototypeOf(value),
      )
    ) {
      bytes = Buffer.from(value);
    } else {
      fail(code);
    }
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
  if (
    bytes.length === 0 ||
    bytes.length > maximum ||
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
  const record = readRecord(parsed, code);
  if (!canonical(parsed).equals(bytes)) fail(code);
  return { bytes, record };
}

function successfulTerminal(value, code) {
  const terminal = readRecord(value, code);
  assertKeys(
    terminal,
    [
      "exitCode",
      "signal",
      "timedOut",
      "outputTruncated",
      "childClosed",
      "outputClosed",
      "descriptorsClosed",
    ],
    code,
  );
  if (
    terminal.exitCode !== 0 ||
    terminal.signal !== null ||
    terminal.timedOut !== false ||
    terminal.outputTruncated !== false ||
    terminal.childClosed !== true ||
    terminal.outputClosed !== true ||
    terminal.descriptorsClosed !== true
  ) {
    fail(code);
  }
  return terminal;
}

const BUILD_COMMANDS = Object.freeze([
  Object.freeze({
    stepId: "docker-version",
    argv: Object.freeze(["version", "--format", DOCKER_VERSION_FORMAT]),
    deadlineMs: 5_000,
  }),
  Object.freeze({
    stepId: "candidate-tag-absence",
    argv: Object.freeze([
      "image",
      "ls",
      "--no-trunc",
      "--quiet",
      "--filter",
      `reference=${M2A_TRANSFER.candidateImageTag}`,
    ]),
    deadlineMs: 5_000,
  }),
  Object.freeze({
    stepId: "pinned-base-inspect",
    argv: Object.freeze([
      "image",
      "inspect",
      "--format",
      BASE_INSPECT_FORMAT,
      BASE_REFERENCE,
    ]),
    deadlineMs: 5_000,
  }),
  Object.freeze({
    stepId: "offline-build",
    argv: Object.freeze([
      "build",
      "--network",
      "none",
      "--pull=false",
      "--no-cache",
      "--platform",
      "linux/amd64",
      "--provenance=false",
      "--sbom=false",
      "--tag",
      M2A_TRANSFER.candidateImageTag,
      "--file",
      `${CONSTRUCTION_ROOT}/context/Containerfile.m2a-transfer`,
      `${CONSTRUCTION_ROOT}/context`,
    ]),
    deadlineMs: 300_000,
  }),
  Object.freeze({
    stepId: "candidate-inspect",
    argv: Object.freeze([
      "image",
      "inspect",
      "--format",
      CANDIDATE_INSPECT_FORMAT,
      M2A_TRANSFER.candidateImageTag,
    ]),
    deadlineMs: 5_000,
  }),
]);

export const M2A_PRODUCTION = freeze({
  generation: M2A_TRANSFER.generation,
  expectedRevision: M2A_TRANSFER.expectedRevision,
  runId: M2A_TRANSFER.runId,
  scenarioId: M2A_TRANSFER.scenarioId,
  baseReference: BASE_REFERENCE,
  baseRepositoryDigest: BASE_REPOSITORY_DIGEST,
  constructionRoot: CONSTRUCTION_ROOT,
  buildRoot: BUILD_ROOT,
  runtimeRoot: RUNTIME_ROOT,
  buildCommands: BUILD_COMMANDS,
  absenceSteps: ABSENCE_STEPS,
  reviewedConstructionManifestSha256: null,
  reviewedContextAggregate: null,
  reviewedNpmAcquisitionSha256: null,
  reviewedConstructorToolchainSha256: null,
  reviewedLocalImageId: null,
  buildExecutionApproved: false,
  runtimeExecutionApproved: false,
  evidenceReview: "not-performed",
});

export function createFixedImageBuildPlan() {
  return freeze({
    executable: "/usr/bin/docker",
    shell: false,
    cwd: ".",
    environment: {
      DOCKER_CONFIG: `${BUILD_ROOT}/docker-config`,
      HOME: `${BUILD_ROOT}/home`,
      PATH: "/usr/bin:/bin",
    },
    inheritEnvironment: false,
    combinedOutputLimitBytes: 65_536,
    termToKillGraceMs: 250,
    closeDeadlineMs: 1_000,
    layout: {
      root: BUILD_ROOT,
      creation: "exclusive",
      retained: true,
      directories: [
        { path: "home", mode: 0o700, owner: "effective-user", links: 1 },
        {
          path: "docker-config",
          mode: 0o700,
          owner: "effective-user",
          links: 1,
        },
      ],
      files: [
        {
          path: "docker-config/config.json",
          mode: 0o600,
          owner: "effective-user",
          links: 1,
          bytes: '{"auths":{}}\n',
        },
      ],
    },
    commands: BUILD_COMMANDS.map((command) => ({ ...command })),
    occurrences: 1,
    retry: false,
    cleanup: false,
    runtimeExecutionApproved: false,
  });
}

export function validateFixedImageBuildPlan(value) {
  const expected = createFixedImageBuildPlan();
  compareExact(value, expected, "M2A_IMAGE_BUILD_PLAN_INVALID");
  return expected;
}

export function validateImageBuildObservation(value) {
  const observation = readRecord(value, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  assertKeys(
    observation,
    [
      "version",
      "tagAbsence",
      "baseImage",
      "build",
      "candidateImage",
      "contextRevalidated",
      "allDescriptorsSettled",
    ],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  const version = readRecord(
    observation.version,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    version,
    ["terminal", "client", "server"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  successfulTerminal(version.terminal, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  const tagAbsence = readRecord(
    observation.tagAbsence,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    tagAbsence,
    ["terminal", "stdout"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  successfulTerminal(
    tagAbsence.terminal,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  const baseImage = readRecord(
    observation.baseImage,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    baseImage,
    ["terminal", "projection"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  successfulTerminal(baseImage.terminal, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  const baseProjection = readRecord(
    baseImage.projection,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    baseProjection,
    ["architecture", "id", "os", "repoDigests"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertSha256(baseProjection.id, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  compareExact(
    baseProjection,
    {
      architecture: "amd64",
      id: baseProjection.id,
      os: "linux",
      repoDigests: [BASE_REPOSITORY_DIGEST],
    },
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  const build = readRecord(
    observation.build,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    build,
    ["terminal", "occurrences"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  successfulTerminal(build.terminal, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  const candidate = readRecord(
    observation.candidateImage,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  assertKeys(
    candidate,
    ["terminal", "projection"],
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  successfulTerminal(candidate.terminal, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  const candidateProjection = readRecord(
    candidate.projection,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  const candidateExpected = {
    architecture: "amd64",
    cmd: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
    entrypoint: null,
    environmentNames: ["PATH", "NODE_VERSION", "YARN_VERSION"],
    id: candidateProjection.id,
    labels: null,
    os: "linux",
    repoTags: [M2A_TRANSFER.candidateImageTag],
    user: "1000:1000",
    workingDir: "",
  };
  assertSha256(candidateProjection.id, "M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  compareExact(
    candidateProjection,
    candidateExpected,
    "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
  );
  if (
    version.client !== "29.6.1" ||
    version.server !== "29.6.1" ||
    tagAbsence.stdout !== "" ||
    build.occurrences !== 1 ||
    observation.contextRevalidated !== true ||
    observation.allDescriptorsSettled !== true
  ) {
    fail("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
  }
  return freeze({
    dockerClientVersion: version.client,
    dockerServerVersion: version.server,
    baseImage: { ...baseProjection },
    localImage: { ...candidateProjection },
  });
}

function validateConstructionBinding(value, code) {
  const binding = readRecord(value, code);
  assertKeys(
    binding,
    [
      "manifestSha256",
      "contextAggregate",
      "npmAcquisitionSha256",
      "constructorToolchainSha256",
    ],
    code,
  );
  Object.values(binding).forEach((item) => assertSha256(item, code));
  return binding;
}

export function createImageBindingBytesForTest(
  observationInput,
  constructionInput,
) {
  const observation = validateImageBuildObservation(observationInput);
  const construction = validateConstructionBinding(
    constructionInput,
    "M2A_IMAGE_BINDING_INVALID",
  );
  const packet = {
    schemaVersion: "m2a-transfer-image-binding/v1",
    generation: M2A_TRANSFER.generation,
    expectedRevision: M2A_TRANSFER.expectedRevision,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    imageTag: M2A_TRANSFER.candidateImageTag,
    baseImage: {
      reference: BASE_REFERENCE,
      id: observation.baseImage.id,
      repositoryDigest: BASE_REPOSITORY_DIGEST,
      os: "linux",
      architecture: "amd64",
    },
    construction: { ...construction },
    build: {
      dockerClientVersion: "29.6.1",
      dockerServerVersion: "29.6.1",
      platform: "linux/amd64",
      network: "none",
      pull: false,
      noCache: true,
      provenance: false,
      sbom: false,
      occurrences: 1,
    },
    localImage: {
      id: observation.localImage.id,
      os: observation.localImage.os,
      architecture: observation.localImage.architecture,
      user: observation.localImage.user,
      entrypoint: observation.localImage.entrypoint,
      cmd: observation.localImage.cmd,
      workingDir: observation.localImage.workingDir,
      environmentNames: observation.localImage.environmentNames,
      repoTags: observation.localImage.repoTags,
      labels: observation.localImage.labels,
    },
    retention: {
      image: "retained",
      constructionRoot: "retained",
      buildRoot: "retained",
    },
    runtimeExecutionApproved: false,
    evidenceReview: "not-performed",
  };
  return canonical(packet);
}

export function validateImageBindingBytes(
  value,
  reviewedConstructionInput,
  reviewedLocalImageId,
) {
  assertSha256(reviewedLocalImageId, "M2A_IMAGE_BINDING_INVALID");
  const construction = validateConstructionBinding(
    reviewedConstructionInput,
    "M2A_IMAGE_BINDING_INVALID",
  );
  const parsed = parseCanonicalLine(value, 65_536, "M2A_IMAGE_BINDING_INVALID");
  const packet = parsed.record;
  assertKeys(
    packet,
    [
      "schemaVersion",
      "generation",
      "expectedRevision",
      "runId",
      "scenarioId",
      "imageTag",
      "baseImage",
      "construction",
      "build",
      "localImage",
      "retention",
      "runtimeExecutionApproved",
      "evidenceReview",
    ],
    "M2A_IMAGE_BINDING_INVALID",
  );
  compareExact(
    packet.baseImage,
    {
      reference: BASE_REFERENCE,
      id: packet.baseImage?.id,
      repositoryDigest: BASE_REPOSITORY_DIGEST,
      os: "linux",
      architecture: "amd64",
    },
    "M2A_IMAGE_BINDING_INVALID",
  );
  assertSha256(packet.baseImage.id, "M2A_IMAGE_BINDING_INVALID");
  compareExact(packet.construction, construction, "M2A_IMAGE_BINDING_INVALID");
  compareExact(
    packet.build,
    {
      dockerClientVersion: "29.6.1",
      dockerServerVersion: "29.6.1",
      platform: "linux/amd64",
      network: "none",
      pull: false,
      noCache: true,
      provenance: false,
      sbom: false,
      occurrences: 1,
    },
    "M2A_IMAGE_BINDING_INVALID",
  );
  compareExact(
    packet.localImage,
    {
      id: reviewedLocalImageId,
      os: "linux",
      architecture: "amd64",
      user: "1000:1000",
      entrypoint: null,
      cmd: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
      workingDir: "",
      environmentNames: ["PATH", "NODE_VERSION", "YARN_VERSION"],
      repoTags: [M2A_TRANSFER.candidateImageTag],
      labels: null,
    },
    "M2A_IMAGE_BINDING_INVALID",
  );
  compareExact(
    packet.retention,
    {
      image: "retained",
      constructionRoot: "retained",
      buildRoot: "retained",
    },
    "M2A_IMAGE_BINDING_INVALID",
  );
  if (
    packet.schemaVersion !== "m2a-transfer-image-binding/v1" ||
    packet.generation !== M2A_TRANSFER.generation ||
    packet.expectedRevision !== M2A_TRANSFER.expectedRevision ||
    packet.runId !== M2A_TRANSFER.runId ||
    packet.scenarioId !== M2A_TRANSFER.scenarioId ||
    packet.imageTag !== M2A_TRANSFER.candidateImageTag ||
    packet.runtimeExecutionApproved !== false ||
    packet.evidenceReview !== "not-performed"
  ) {
    fail("M2A_IMAGE_BINDING_INVALID");
  }
  return freeze({
    bytes: Buffer.from(parsed.bytes),
    packet,
    sha256: digest(parsed.bytes),
  });
}

function buildCommandValue(step) {
  const terminal = {
    exitCode: 0,
    signal: null,
    timedOut: false,
    outputTruncated: false,
    childClosed: true,
    outputClosed: true,
    descriptorsClosed: true,
  };
  if (step === "docker-version") {
    return { terminal, client: "29.6.1", server: "29.6.1" };
  }
  if (step === "candidate-tag-absence") return { terminal, stdout: "" };
  if (step === "pinned-base-inspect") {
    return {
      terminal,
      projection: {
        architecture: "amd64",
        id: `sha256:${"b".repeat(64)}`,
        os: "linux",
        repoDigests: [BASE_REPOSITORY_DIGEST],
      },
    };
  }
  if (step === "offline-build") {
    return { terminal, occurrences: 1, contextRevalidated: true };
  }
  if (step === "candidate-inspect") {
    return {
      terminal,
      projection: {
        architecture: "amd64",
        cmd: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
        entrypoint: null,
        environmentNames: ["PATH", "NODE_VERSION", "YARN_VERSION"],
        id: `sha256:${"a".repeat(64)}`,
        labels: null,
        os: "linux",
        repoTags: [M2A_TRANSFER.candidateImageTag],
        user: "1000:1000",
        workingDir: "",
      },
      allDescriptorsSettled: true,
    };
  }
  fail("M2A_IMAGE_BUILD_FAKE_INVALID");
}

function buildCommandResult(step) {
  return freeze({ settlement: "settled", value: buildCommandValue(step) });
}

function validateImageBuildStepValue(step, valueInput) {
  const code = "M2A_IMAGE_BUILD_OBSERVATION_INVALID";
  const value = readRecord(valueInput, code);
  if (step === "docker-version") {
    assertKeys(value, ["terminal", "client", "server"], code);
    successfulTerminal(value.terminal, code);
    if (value.client !== "29.6.1" || value.server !== "29.6.1") fail(code);
    return freeze({ ...value });
  }
  if (step === "candidate-tag-absence") {
    assertKeys(value, ["terminal", "stdout"], code);
    successfulTerminal(value.terminal, code);
    if (value.stdout !== "") fail(code);
    return freeze({ ...value });
  }
  if (step === "pinned-base-inspect") {
    assertKeys(value, ["terminal", "projection"], code);
    successfulTerminal(value.terminal, code);
    const projection = readRecord(value.projection, code);
    assertKeys(projection, ["architecture", "id", "os", "repoDigests"], code);
    assertSha256(projection.id, code);
    compareExact(
      projection,
      {
        architecture: "amd64",
        id: projection.id,
        os: "linux",
        repoDigests: [BASE_REPOSITORY_DIGEST],
      },
      code,
    );
    return freeze({ terminal: value.terminal, projection: { ...projection } });
  }
  if (step === "offline-build") {
    assertKeys(value, ["terminal", "occurrences", "contextRevalidated"], code);
    successfulTerminal(value.terminal, code);
    if (value.occurrences !== 1 || value.contextRevalidated !== true)
      fail(code);
    return freeze({ ...value });
  }
  if (step === "candidate-inspect") {
    assertKeys(
      value,
      ["terminal", "projection", "allDescriptorsSettled"],
      code,
    );
    successfulTerminal(value.terminal, code);
    if (value.allDescriptorsSettled !== true) fail(code);
    const projection = readRecord(value.projection, code);
    assertSha256(projection.id, code);
    compareExact(
      projection,
      {
        architecture: "amd64",
        cmd: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
        entrypoint: null,
        environmentNames: ["PATH", "NODE_VERSION", "YARN_VERSION"],
        id: projection.id,
        labels: null,
        os: "linux",
        repoTags: [M2A_TRANSFER.candidateImageTag],
        user: "1000:1000",
        workingDir: "",
      },
      code,
    );
    return freeze({
      terminal: value.terminal,
      projection: { ...projection },
      allDescriptorsSettled: true,
    });
  }
  fail(code);
}

function successfulPublicationResult() {
  return freeze({
    settlement: "settled",
    committed: true,
    bytesMatched: true,
    descriptorsClosed: true,
    directorySynced: true,
  });
}

export function createFakeM2aImageBuildBackend(overridesInput = {}) {
  const overrides = readRecord(overridesInput, "M2A_IMAGE_BUILD_FAKE_INVALID");
  const steps = BUILD_COMMANDS.map((command) => command.stepId);
  if (
    Object.keys(overrides).some(
      (step) => !steps.includes(step) && step !== "publish-binding",
    )
  ) {
    fail("M2A_IMAGE_BUILD_FAKE_INVALID");
  }
  const actions = [];
  const backend = {
    async perform(step) {
      if (!steps.includes(step)) fail("M2A_IMAGE_BUILD_FAKE_INVALID");
      actions.push(step);
      const value = Object.hasOwn(overrides, step)
        ? overrides[step]
        : buildCommandResult(step);
      const result = readRecord(value, "M2A_IMAGE_BUILD_FAKE_INVALID");
      assertKeys(
        result,
        ["settlement", "value"],
        "M2A_IMAGE_BUILD_FAKE_INVALID",
      );
      if (
        !["settled", "unknown"].includes(result.settlement) ||
        (result.settlement === "unknown" && result.value !== null)
      ) {
        fail("M2A_IMAGE_BUILD_FAKE_INVALID");
      }
      return freeze({ ...result });
    },
    async publishBinding(bytes) {
      parseCanonicalLine(bytes, 65_536, "M2A_IMAGE_BUILD_FAKE_INVALID");
      actions.push("publish-binding");
      const value = Object.hasOwn(overrides, "publish-binding")
        ? overrides["publish-binding"]
        : successfulPublicationResult();
      return freeze({ ...readRecord(value, "M2A_IMAGE_BUILD_FAKE_INVALID") });
    },
    snapshotActions() {
      return [...actions];
    },
  };
  fakeBuildBackendBrand.add(backend);
  return freeze(backend);
}

export async function runM2aImageBuildForTest(backend, constructionInput) {
  if (!fakeBuildBackendBrand.has(backend)) {
    fail("M2A_IMAGE_BUILD_FAKE_REQUIRED");
  }
  const performed = [];
  const observations = new Map();
  let imageBindingPublished = false;
  let imageBindingBytes = null;
  let imageBindingSha256 = null;
  let status = "complete";
  let issue = null;
  for (const command of BUILD_COMMANDS) {
    const result = await backend.perform(command.stepId);
    performed.push(command.stepId);
    if (result.settlement !== "settled") {
      status = "inconclusive";
      issue = "M2A_IMAGE_BUILD_SETTLEMENT_UNKNOWN";
      break;
    }
    observations.set(
      command.stepId,
      validateImageBuildStepValue(command.stepId, result.value),
    );
  }
  if (status === "complete") {
    const build = readRecord(
      observations.get("offline-build"),
      "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
    );
    assertKeys(
      build,
      ["terminal", "occurrences", "contextRevalidated"],
      "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
    );
    const candidate = readRecord(
      observations.get("candidate-inspect"),
      "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
    );
    assertKeys(
      candidate,
      ["terminal", "projection", "allDescriptorsSettled"],
      "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
    );
    const observation = {
      version: observations.get("docker-version"),
      tagAbsence: observations.get("candidate-tag-absence"),
      baseImage: observations.get("pinned-base-inspect"),
      build: { terminal: build.terminal, occurrences: build.occurrences },
      candidateImage: {
        terminal: candidate.terminal,
        projection: candidate.projection,
      },
      contextRevalidated: build.contextRevalidated,
      allDescriptorsSettled: candidate.allDescriptorsSettled,
    };
    const validatedObservation = validateImageBuildObservation(observation);
    const bytes = createImageBindingBytesForTest(
      observation,
      constructionInput,
    );
    const validatedBinding = validateImageBindingBytes(
      bytes,
      constructionInput,
      validatedObservation.localImage.id,
    );
    const publication = assertPublicationResult(
      await backend.publishBinding(validatedBinding.bytes),
      "M2A_IMAGE_BUILD_FAKE_INVALID",
    );
    if (publication !== "complete") {
      status = "inconclusive";
      issue =
        publication === "unknown"
          ? "M2A_IMAGE_BUILD_SETTLEMENT_UNKNOWN"
          : "M2A_IMAGE_BINDING_PUBLICATION_FAILED";
    } else {
      imageBindingPublished = true;
      imageBindingBytes = Buffer.from(validatedBinding.bytes);
      imageBindingSha256 = validatedBinding.sha256;
    }
  }
  return freeze({
    status,
    issue,
    performed,
    occurrences: performed.includes("offline-build") ? 1 : 0,
    imageBindingPublished,
    imageBindingBytes,
    imageBindingSha256,
    actions: backend.snapshotActions(),
    retained: true,
    retry: false,
    cleanup: false,
    runtimeExecutionApproved: false,
    evidenceReview: "not-performed",
  });
}

function runtimeArgv(plan) {
  return {
    "absence-volume": plan.volumeAbsence,
    "absence-initializer-container": plan.initializerAbsence,
    "absence-measurement-container": plan.measurementAbsence,
    "volume-create": plan.volumeCreate,
    "initializer-create": plan.initializerCreate,
    "initializer-inspect-pre": plan.initializerInspectPre,
    "initializer-start": plan.initializerStart,
    "initializer-wait": plan.initializerWait,
    "initializer-inspect-final": plan.initializerInspectFinal,
    "measurement-create": plan.measurementCreate,
    "measurement-inspect-pre": plan.measurementInspectPre,
    "measurement-start": plan.measurementStart,
    "measurement-wait": plan.measurementWait,
    "measurement-inspect-final": plan.measurementInspectFinal,
    "copy-completion": plan.completionCopy,
    "copy-segment": plan.segmentCopy,
    "copy-marker": plan.markerCopy,
  };
}

export function createFixedProductionExecutionPlan(imageId) {
  const transferPlan = createFixedDockerPlan(imageId);
  validateFixedDockerPlan(transferPlan, imageId);
  const argv = runtimeArgv(transferPlan);
  const commandRows = RUNTIME_COMMAND_STEPS.map((step) => ({
    step,
    argv: argv[step],
    cwd: M2A_TRANSFER.resultRoot,
    deadlineMs:
      step === "measurement-wait"
        ? transferPlan.measurementAbsoluteDeadlineMs
        : step === "initializer-wait"
          ? transferPlan.initializerWaitDeadlineMs
          : transferPlan.commandDeadlineMs,
    combinedOutputLimitBytes: transferPlan.combinedOutputLimitBytes,
    termToKillGraceMs: 250,
    closeDeadlineMs: 1_000,
  }));
  return freeze({
    executable: transferPlan.executable,
    shell: false,
    environment: { ...transferPlan.environment },
    inheritEnvironment: false,
    imageId,
    imageTag: M2A_TRANSFER.candidateImageTag,
    resultRoot: M2A_TRANSFER.resultRoot,
    runtimeRoot: RUNTIME_ROOT,
    resultLayout: {
      creation: "exclusive",
      resultDirectoryMode: 0o700,
      transferDirectoryMode: 0o700,
      attemptFileMode: 0o600,
      temporaryAttemptName: "attempt.next",
      canonicalAttemptName: "attempt.json",
      owner: "effective-user",
      links: 1,
      symlink: false,
    },
    absenceRows: commandRows.slice(0, 3).map((row) => ({
      step: row.step,
      argv: row.argv,
    })),
    commandRows,
    checkpointProtocol: [
      "create-exclusive",
      "write-sync",
      "same-descriptor-reread",
      "close-known",
      "rename-over-attempt",
      "sync-result-directory",
    ],
    transferOrder: [
      "copy-completion",
      "validate-completion",
      "copy-segment",
      "validate-segment",
      "copy-marker",
      "validate-marker",
    ],
    naturalExitOnly: true,
    retry: false,
    cleanup: false,
    repair: false,
    executionApproved: false,
    evidenceReview: "not-performed",
  });
}

export function validateFixedProductionExecutionPlan(value, imageId) {
  const expected = createFixedProductionExecutionPlan(imageId);
  compareExact(value, expected, "M2A_PRODUCTION_PLAN_INVALID");
  return expected;
}

function attemptProjection(imageId, step, code) {
  const stepIndex = RUNTIME_COMMAND_STEPS.indexOf(step);
  if (stepIndex < 0) fail("M2A_CHECKPOINT_INVALID");
  const initializerStart = RUNTIME_COMMAND_STEPS.indexOf("initializer-start");
  const initializerFinal = RUNTIME_COMMAND_STEPS.indexOf(
    "initializer-inspect-final",
  );
  const measurementStart = RUNTIME_COMMAND_STEPS.indexOf("measurement-start");
  const measurementFinal = RUNTIME_COMMAND_STEPS.indexOf(
    "measurement-inspect-final",
  );
  const copyCompletion = RUNTIME_COMMAND_STEPS.indexOf("copy-completion");
  const copySegment = RUNTIME_COMMAND_STEPS.indexOf("copy-segment");
  const copyMarker = RUNTIME_COMMAND_STEPS.indexOf("copy-marker");
  const unknown = code === "M2A_SETTLEMENT_UNKNOWN";
  const attempt = {
    schemaVersion: "m2a-transfer-attempt/v1",
    generation: M2A_TRANSFER.generation,
    expectedRevision: M2A_TRANSFER.expectedRevision,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    imageId,
    initializerSettlement:
      stepIndex < initializerStart
        ? "not-started"
        : stepIndex <= initializerFinal
          ? unknown
            ? "unknown"
            : "known-failed"
          : "natural-exited-zero",
    measurementSettlement:
      stepIndex < measurementStart
        ? "not-started"
        : stepIndex <= measurementFinal
          ? unknown
            ? "unknown"
            : "known-failed"
          : "natural-exited",
    naturalExit: stepIndex > measurementFinal,
    completionTransfer:
      stepIndex < copyCompletion
        ? "not-attempted"
        : stepIndex === copyCompletion
          ? unknown
            ? "unknown"
            : "invalid"
          : "valid",
    segmentTransfer:
      stepIndex < copySegment
        ? "not-attempted"
        : stepIndex === copySegment
          ? unknown
            ? "unknown"
            : "invalid"
          : "valid",
    markerTransfer:
      stepIndex < copyMarker
        ? "not-attempted"
        : unknown
          ? "unknown"
          : "invalid",
    issues: [{ code, step }],
    evidenceReview: "not-performed",
  };
  return attempt;
}

export function createPessimisticAttemptCheckpointBytes(imageId, step) {
  const bytes = canonical(
    attemptProjection(imageId, step, "M2A_SETTLEMENT_UNKNOWN"),
  );
  validateAttemptBytes(bytes, imageId);
  return bytes;
}

function createKnownFailureAttemptBytes(imageId, step) {
  const code = FAILURE_CODES[step];
  if (code === undefined) fail("M2A_CHECKPOINT_INVALID");
  const bytes = canonical(attemptProjection(imageId, step, code));
  validateAttemptBytes(bytes, imageId);
  return bytes;
}

function createCompleteAttemptBytes(imageId, markerPresent) {
  const attempt = {
    schemaVersion: "m2a-transfer-attempt/v1",
    generation: M2A_TRANSFER.generation,
    expectedRevision: M2A_TRANSFER.expectedRevision,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    imageId,
    initializerSettlement: "natural-exited-zero",
    measurementSettlement: "natural-exited",
    naturalExit: true,
    completionTransfer: "valid",
    segmentTransfer: "valid",
    markerTransfer: markerPresent ? "valid" : "not-attempted",
    issues: [],
    evidenceReview: "not-performed",
  };
  const bytes = canonical(attempt);
  validateAttemptBytes(bytes, imageId);
  return bytes;
}

function runtimeTerminal(exitCode = 0) {
  return {
    exitCode,
    signal: null,
    timedOut: false,
    stdoutTruncated: false,
    stderrTruncated: false,
    childClosed: true,
    stdoutClosed: true,
    stderrClosed: true,
    descriptorsClosed: true,
  };
}

function fixedInspectionProjection(role, imageId) {
  const initializer = role === "initializer";
  return {
    containerName: initializer
      ? M2A_TRANSFER.initializerContainer
      : M2A_TRANSFER.measurementContainer,
    imageId,
    user: initializer ? "0:0" : "1000:1000",
    networkMode: "none",
    readOnlyRootfs: true,
    privileged: false,
    capDrop: ["ALL"],
    capAdd: [],
    securityOpt: ["no-new-privileges"],
    pidsLimit: initializer ? 16 : 64,
    memoryBytes: initializer ? 134_217_728 : 536_870_912,
    nanoCpus: 1_000_000_000,
    tmpfs: initializer
      ? []
      : [
          "/tmp:rw,nosuid,nodev,noexec,size=33554432,uid=1000,gid=1000",
          "/work:rw,nosuid,nodev,noexec,size=67108864,uid=1000,gid=1000",
        ],
    mounts: [
      {
        type: "volume",
        name: M2A_TRANSFER.transferVolume,
        destination: M2A_TRANSFER.containerRunRoot,
        readWrite: true,
      },
    ],
    entry: initializer
      ? ["node", "/opt/m2a-transfer/initialize-m2a-volume.mjs"]
      : ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
    environmentNames: [],
  };
}

function fixedEvent(eventKind, producerSequence) {
  return {
    schemaVersion: "probe-event/v2",
    eventKind,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    route: "npm-install-lifecycle",
    phase: "install-lifecycle",
    triggerType: "automatic",
    adapterVersion: "0.0.0",
    producerId: "npm-lifecycle-producer",
    producerSequence,
    timestamp: "2026-07-21T00:00:00.000Z",
    durationMs: 1,
    pid: 10,
    ppid: 1,
    workerId: null,
    cwdId: "npm-lifecycle-consumer",
    nodeVersion: M2A_TRANSFER.nodeVersion,
    toolName: "npm",
    toolVersion: M2A_TRANSFER.npmVersion,
    outcome: "success",
    normalizedErrorCode: null,
  };
}

function fixedRuntimeArtifacts() {
  const markerBytes = canonical({
    schemaVersion: "probe-marker/v1",
    attemptId: "npm-lifecycle-attempt-file-write",
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
  });
  const definitions = [
    [
      "npm-lifecycle-attempt-environment",
      "environment-canary-read",
      "npm-lifecycle-environment-canary",
      { kind: "environment", present: true, byteLength: 8 },
      null,
    ],
    [
      "npm-lifecycle-attempt-file-read",
      "canary-file-read",
      "npm-lifecycle-file-canary",
      {
        kind: "file-read",
        present: true,
        regularFile: true,
        readSucceeded: true,
        sizeBytes: 8,
      },
      null,
    ],
    [
      "npm-lifecycle-attempt-file-hash",
      "file-hash",
      "npm-lifecycle-source-snapshot",
      { kind: "file-hash", state: "present", sizeBytes: 8 },
      `sha256:${"1".repeat(64)}`,
    ],
    [
      "npm-lifecycle-attempt-file-write",
      "direct-filesystem-write",
      "npm-lifecycle-direct-output",
      { kind: "file-write", markerSchemaVersion: "probe-marker/v1" },
      null,
    ],
    [
      "npm-lifecycle-attempt-loopback",
      "loopback-connect",
      "npm-lifecycle-loopback",
      {
        kind: "loopback",
        statusCode: 200,
        timedOut: false,
        protocolVerified: true,
        bodyBytes: 17,
      },
      null,
    ],
    [
      "npm-lifecycle-attempt-child",
      "child-node-process",
      "npm-lifecycle-fixed-child",
      {
        kind: "child",
        exitCode: 0,
        timedOut: false,
        responseVerified: true,
        stdoutBytes: 16,
        stderrBytes: 0,
      },
      null,
    ],
  ];
  const events = [
    {
      ...fixedEvent("route-invocation", 0),
      routeInvocationId: "npm-lifecycle-invocation",
      invocationKind: "lifecycle-hook",
      logicalUnitId: "npm-install-lifecycle",
    },
    ...definitions.map(
      ([attemptId, attemptType, targetId, details, beforeHash], index) => ({
        ...fixedEvent("capability-attempt", index + 1),
        attemptId,
        attemptType,
        targetId,
        beforeHash,
        afterHash:
          attemptId === "npm-lifecycle-attempt-file-write"
            ? digest(markerBytes)
            : null,
        details,
      }),
    ),
  ];
  const segmentBytes = Buffer.from(
    events
      .map((event) => canonical(event))
      .reduce(
        (output, bytes) => Buffer.concat([output, bytes]),
        Buffer.alloc(0),
      ),
  );
  const lockHash = `sha256:${"c".repeat(64)}`;
  const completionBytes = canonical({
    schemaVersion: "m2a-transfer-completion/v1",
    generation: M2A_TRANSFER.generation,
    expectedRevision: M2A_TRANSFER.expectedRevision,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    toolchain: { node: M2A_TRANSFER.nodeVersion, npm: M2A_TRANSFER.npmVersion },
    npmFlow: [
      {
        stepId: "install",
        argv: ["install"],
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdoutTruncated: false,
        stderrTruncated: false,
        approval: "absent",
        lockBefore: null,
        lockAfter: lockHash,
      },
      {
        stepId: "approve-scripts",
        argv: ["approve-scripts", "@tskaigi-lab/m2a-install-probe"],
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdoutTruncated: false,
        stderrTruncated: false,
        approval: "present",
        lockBefore: lockHash,
        lockAfter: lockHash,
      },
      {
        stepId: "rebuild",
        argv: ["rebuild", "@tskaigi-lab/m2a-install-probe"],
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdoutTruncated: false,
        stderrTruncated: false,
        approval: "present",
        lockBefore: lockHash,
        lockAfter: lockHash,
      },
    ],
    runnerSettlement: {
      npmChildClosed: true,
      loopbackClosed: true,
      prePublicationDescriptorsClosed: true,
    },
    outputInventory: [
      {
        path: M2A_TRANSFER.segmentPath,
        size: segmentBytes.length,
        sha256: digest(segmentBytes),
        mode: 0o600,
      },
      {
        path: M2A_TRANSFER.markerPath,
        size: markerBytes.length,
        sha256: digest(markerBytes),
        mode: 0o600,
      },
    ],
    status: "complete",
    issue: null,
  });
  return { completionBytes, segmentBytes, markerBytes };
}

function transferredMetadata(relativePath, mode, bytes) {
  return {
    path: `transfer/${relativePath}`,
    type: "regular",
    mode,
    uid: 1000,
    gid: 1000,
    nlink: 1,
    size: bytes.length,
    sha256: digest(bytes),
    parentIdentityStable: true,
    fileIdentityStable: true,
  };
}

function defaultRuntimeResult(step, imageId) {
  const artifacts = fixedRuntimeArtifacts();
  const terminal = runtimeTerminal();
  let value;
  if (ABSENCE_STEPS.includes(step)) {
    value = { absent: true };
    return { settlement: "settled", terminal: runtimeTerminal(1), value };
  }
  if (step === "volume-create") value = { name: M2A_TRANSFER.transferVolume };
  else if (step === "initializer-create") {
    value = { containerName: M2A_TRANSFER.initializerContainer };
  } else if (step === "measurement-create") {
    value = { containerName: M2A_TRANSFER.measurementContainer };
  } else if (step === "initializer-inspect-pre") {
    value = {
      state: "created",
      projection: fixedInspectionProjection("initializer", imageId),
    };
  } else if (step === "measurement-inspect-pre") {
    value = {
      state: "created",
      projection: fixedInspectionProjection("measurement", imageId),
    };
  } else if (step === "initializer-start" || step === "measurement-start") {
    value = { started: true };
  } else if (step === "initializer-wait" || step === "measurement-wait") {
    value = { exitCode: 0 };
  } else if (
    step === "initializer-inspect-final" ||
    step === "measurement-inspect-final"
  ) {
    value = { state: "exited", exitCode: 0 };
  } else if (step === "copy-completion") {
    value = {
      bytes: artifacts.completionBytes,
      metadata: transferredMetadata(
        M2A_TRANSFER.completionPath,
        0o444,
        artifacts.completionBytes,
      ),
    };
  } else if (step === "copy-segment") {
    value = {
      bytes: artifacts.segmentBytes,
      metadata: transferredMetadata(
        M2A_TRANSFER.segmentPath,
        0o600,
        artifacts.segmentBytes,
      ),
    };
  } else if (step === "copy-marker") {
    value = {
      bytes: artifacts.markerBytes,
      metadata: transferredMetadata(
        M2A_TRANSFER.markerPath,
        0o600,
        artifacts.markerBytes,
      ),
    };
  } else value = { completed: true };
  return { settlement: "settled", terminal, value };
}

function validationSettlementResult(valueSha256) {
  return {
    settlement: "settled",
    valueSha256,
    bytesClosed: true,
    metadataClosed: true,
  };
}

export function createFakeM2aProductionBackend(overridesInput = {}) {
  const overrides = readRecord(overridesInput, "M2A_PRODUCTION_FAKE_INVALID");
  const allowed = new Set([
    ...RUNTIME_COMMAND_STEPS,
    ...VALIDATION_STEPS,
    ...RUNTIME_COMMAND_STEPS.map((step) => `checkpoint:${step}`),
    "prepare-marker-parent",
    "publish-final",
  ]);
  if (Object.keys(overrides).some((step) => !allowed.has(step))) {
    fail("M2A_PRODUCTION_FAKE_INVALID");
  }
  const actions = [];
  const resultFor = (step, imageId) => {
    const value = Object.hasOwn(overrides, step)
      ? overrides[step]
      : defaultRuntimeResult(step, imageId);
    const result = readRecord(value, "M2A_PRODUCTION_FAKE_INVALID");
    assertKeys(
      result,
      ["settlement", "terminal", "value"],
      "M2A_PRODUCTION_FAKE_INVALID",
    );
    if (
      !["settled", "unknown"].includes(result.settlement) ||
      (result.settlement === "unknown" &&
        (result.terminal !== null || result.value !== null))
    ) {
      fail("M2A_PRODUCTION_FAKE_INVALID");
    }
    return freeze({ ...result });
  };
  const backend = {
    async publishCheckpoint(step, bytes) {
      validateAttemptBytes(
        bytes,
        bytes.length > 0 ? JSON.parse(bytes).imageId : "",
      );
      actions.push(`checkpoint:${step}`);
      const value = Object.hasOwn(overrides, `checkpoint:${step}`)
        ? overrides[`checkpoint:${step}`]
        : successfulPublicationResult();
      return freeze({ ...readRecord(value, "M2A_PRODUCTION_FAKE_INVALID") });
    },
    async runChild(row, imageId) {
      actions.push(row.step);
      return resultFor(row.step, imageId);
    },
    async settleValidation(step, valueSha256) {
      assertSha256(valueSha256, "M2A_PRODUCTION_FAKE_INVALID");
      actions.push(step);
      const value = Object.hasOwn(overrides, step)
        ? overrides[step]
        : validationSettlementResult(valueSha256);
      return freeze({ ...readRecord(value, "M2A_PRODUCTION_FAKE_INVALID") });
    },
    async prepareMarkerParent() {
      actions.push("prepare-marker-parent");
      const value = Object.hasOwn(overrides, "prepare-marker-parent")
        ? overrides["prepare-marker-parent"]
        : successfulPublicationResult();
      return freeze({ ...readRecord(value, "M2A_PRODUCTION_FAKE_INVALID") });
    },
    async publishFinal(bytes) {
      const parsed = JSON.parse(bytes);
      validateAttemptBytes(bytes, parsed.imageId);
      actions.push("publish-final");
      const value = Object.hasOwn(overrides, "publish-final")
        ? overrides["publish-final"]
        : successfulPublicationResult();
      return freeze({ ...readRecord(value, "M2A_PRODUCTION_FAKE_INVALID") });
    },
    snapshotActions() {
      return [...actions];
    },
  };
  fakeProductionBackendBrand.add(backend);
  return freeze(backend);
}

function assertPublicationResult(result, code) {
  const record = readRecord(result, code);
  assertKeys(
    record,
    [
      "settlement",
      "committed",
      "bytesMatched",
      "descriptorsClosed",
      "directorySynced",
    ],
    code,
  );
  if (
    !Object.is(record.settlement, "settled") &&
    !Object.is(record.settlement, "unknown")
  ) {
    fail(code);
  }
  for (const key of [
    "committed",
    "bytesMatched",
    "descriptorsClosed",
    "directorySynced",
  ]) {
    if (typeof record[key] !== "boolean") fail(code);
  }
  if (record.settlement === "unknown") {
    if (
      record.committed !== false ||
      record.bytesMatched !== false ||
      record.descriptorsClosed !== false ||
      record.directorySynced !== false
    ) {
      fail(code);
    }
    return "unknown";
  }
  return record.committed === true &&
    record.bytesMatched === true &&
    record.descriptorsClosed === true &&
    record.directorySynced === true
    ? "complete"
    : "failed";
}

function assertValidationSettlement(result, expectedSha256) {
  const record = readRecord(result, "M2A_PRODUCTION_FAKE_INVALID");
  assertKeys(
    record,
    ["settlement", "valueSha256", "bytesClosed", "metadataClosed"],
    "M2A_PRODUCTION_FAKE_INVALID",
  );
  if (
    !Object.is(record.settlement, "settled") &&
    !Object.is(record.settlement, "unknown")
  ) {
    fail("M2A_PRODUCTION_FAKE_INVALID");
  }
  if (
    typeof record.bytesClosed !== "boolean" ||
    typeof record.metadataClosed !== "boolean"
  ) {
    fail("M2A_PRODUCTION_FAKE_INVALID");
  }
  if (record.settlement === "unknown") {
    if (
      record.valueSha256 !== null ||
      record.bytesClosed !== false ||
      record.metadataClosed !== false
    ) {
      fail("M2A_PRODUCTION_FAKE_INVALID");
    }
    return "unknown";
  }
  assertSha256(record.valueSha256, "M2A_PRODUCTION_FAKE_INVALID");
  return record.valueSha256 === expectedSha256 &&
    record.bytesClosed === true &&
    record.metadataClosed === true
    ? "complete"
    : "failed";
}

function readRuntimeChildResult(result, step) {
  const record = readRecord(result, "M2A_PRODUCTION_FAKE_INVALID");
  assertKeys(
    record,
    ["settlement", "terminal", "value"],
    "M2A_PRODUCTION_FAKE_INVALID",
  );
  if (
    !Object.is(record.settlement, "settled") &&
    !Object.is(record.settlement, "unknown")
  ) {
    fail("M2A_PRODUCTION_FAKE_INVALID");
  }
  if (record.settlement === "unknown") {
    if (record.terminal !== null || record.value !== null) {
      fail("M2A_PRODUCTION_FAKE_INVALID");
    }
    return { outcome: "unknown" };
  }
  const terminal = readRecord(record.terminal, "M2A_PRODUCTION_FAKE_INVALID");
  assertKeys(
    terminal,
    [
      "exitCode",
      "signal",
      "timedOut",
      "stdoutTruncated",
      "stderrTruncated",
      "childClosed",
      "stdoutClosed",
      "stderrClosed",
      "descriptorsClosed",
    ],
    "M2A_PRODUCTION_FAKE_INVALID",
  );
  if (
    terminal.childClosed !== true ||
    terminal.stdoutClosed !== true ||
    terminal.stderrClosed !== true ||
    terminal.descriptorsClosed !== true
  ) {
    return { outcome: "unknown" };
  }
  const expectedExit = ABSENCE_STEPS.includes(step) ? 1 : 0;
  const successful =
    terminal.exitCode === expectedExit &&
    terminal.signal === null &&
    terminal.timedOut === false &&
    terminal.stdoutTruncated === false &&
    terminal.stderrTruncated === false;
  return {
    outcome: successful ? "complete" : "failed",
    value: record.value,
  };
}

async function runM2aProductionTransactionWithBackend(
  backend,
  imageId,
  hostOwner,
) {
  const plan = createFixedProductionExecutionPlan(imageId);
  let durableCheckpoint = null;
  let finalPublished = false;
  let status = "complete";
  let issue = null;
  let initializerWaitExit = null;
  let measurementWaitExit = null;
  let completionBytes = null;
  let segmentBytes = null;
  let markerBytes = null;
  let outputs = [];
  let candidateAttemptBytes = null;
  const commandRows = plan.commandRows.filter(
    (row) => !["copy-segment", "copy-marker"].includes(row.step),
  );
  const settleValidation = async (step, bytes) => {
    const valueSha256 = digest(bytes);
    const outcome = assertValidationSettlement(
      await backend.settleValidation(step, valueSha256),
      valueSha256,
    );
    if (outcome !== "complete") {
      status = "inconclusive";
      issue =
        outcome === "unknown"
          ? "M2A_SETTLEMENT_UNKNOWN"
          : `M2A_${step.slice("validate-".length).toUpperCase()}_TRANSFER_INVALID`;
      return false;
    }
    return true;
  };
  const publishFinal = async (bytes) => {
    const outcome = assertPublicationResult(
      await backend.publishFinal(bytes),
      "M2A_PRODUCTION_FAKE_INVALID",
    );
    if (outcome !== "complete") {
      status = "inconclusive";
      issue =
        outcome === "unknown"
          ? "M2A_SETTLEMENT_UNKNOWN"
          : "M2A_ATTEMPT_PUBLICATION_FAILED";
      return false;
    }
    finalPublished = true;
    return true;
  };
  const performChild = async (row) => {
    const checkpoint = createPessimisticAttemptCheckpointBytes(
      imageId,
      row.step,
    );
    const checkpointOutcome = assertPublicationResult(
      await backend.publishCheckpoint(row.step, checkpoint),
      "M2A_PRODUCTION_FAKE_INVALID",
    );
    if (checkpointOutcome !== "complete") {
      status = "inconclusive";
      issue =
        checkpointOutcome === "unknown"
          ? "M2A_SETTLEMENT_UNKNOWN"
          : "M2A_CHECKPOINT_PUBLICATION_FAILED";
      return false;
    }
    durableCheckpoint = row.step;
    const result = readRuntimeChildResult(
      await backend.runChild(row, imageId),
      row.step,
    );
    if (result.outcome === "unknown") {
      status = "inconclusive";
      issue = "M2A_SETTLEMENT_UNKNOWN";
      return false;
    }
    if (result.outcome === "failed") {
      const finalBytes = createKnownFailureAttemptBytes(imageId, row.step);
      if (await publishFinal(finalBytes)) {
        issue = FAILURE_CODES[row.step] ?? "M2A_PRODUCTION_STEP_FAILED";
      }
      status = "inconclusive";
      return false;
    }
    return result.value;
  };
  for (const row of commandRows) {
    const valueInput = await performChild(row);
    if (valueInput === false) break;
    const value = readRecord(valueInput, "M2A_PRODUCTION_FAKE_INVALID");
    if (ABSENCE_STEPS.includes(row.step)) {
      compareExact(value, { absent: true }, "M2A_PRODUCTION_FAKE_INVALID");
    } else if (row.step === "volume-create") {
      compareExact(
        value,
        { name: M2A_TRANSFER.transferVolume },
        "M2A_PRODUCTION_FAKE_INVALID",
      );
    } else if (row.step === "initializer-create") {
      compareExact(
        value,
        { containerName: M2A_TRANSFER.initializerContainer },
        "M2A_PRODUCTION_FAKE_INVALID",
      );
    } else if (row.step === "measurement-create") {
      compareExact(
        value,
        { containerName: M2A_TRANSFER.measurementContainer },
        "M2A_PRODUCTION_FAKE_INVALID",
      );
    } else if (
      row.step === "initializer-inspect-pre" ||
      row.step === "measurement-inspect-pre"
    ) {
      assertKeys(value, ["state", "projection"], "M2A_PRODUCTION_FAKE_INVALID");
      const role = row.step.startsWith("initializer")
        ? "initializer"
        : "measurement";
      if (value.state !== "created") fail("M2A_PRODUCTION_FAKE_INVALID");
      validateInspectionProjection(value.projection, role, imageId);
    } else if (
      row.step === "initializer-start" ||
      row.step === "measurement-start"
    ) {
      compareExact(value, { started: true }, "M2A_PRODUCTION_FAKE_INVALID");
    } else if (row.step === "initializer-wait") {
      assertKeys(value, ["exitCode"], "M2A_PRODUCTION_FAKE_INVALID");
      if (!Number.isSafeInteger(value.exitCode)) {
        fail("M2A_PRODUCTION_FAKE_INVALID");
      }
      initializerWaitExit = value.exitCode;
    } else if (row.step === "measurement-wait") {
      assertKeys(value, ["exitCode"], "M2A_PRODUCTION_FAKE_INVALID");
      if (!Number.isSafeInteger(value.exitCode)) {
        fail("M2A_PRODUCTION_FAKE_INVALID");
      }
      measurementWaitExit = value.exitCode;
    } else if (row.step === "initializer-inspect-final") {
      compareExact(
        value,
        { state: "exited", exitCode: value.exitCode },
        "M2A_PRODUCTION_FAKE_INVALID",
      );
      if (value.exitCode !== 0 || initializerWaitExit !== value.exitCode) {
        status = "inconclusive";
        issue = "M2A_INITIALIZER_NOT_NATURAL_ZERO";
        break;
      }
    } else if (row.step === "measurement-inspect-final") {
      compareExact(
        value,
        { state: "exited", exitCode: value.exitCode },
        "M2A_PRODUCTION_FAKE_INVALID",
      );
      if (
        !Number.isSafeInteger(value.exitCode) ||
        measurementWaitExit !== value.exitCode
      ) {
        status = "inconclusive";
        issue = "M2A_MEASUREMENT_NOT_NATURAL";
        break;
      }
    }
    if (row.step === "copy-completion") {
      assertKeys(value, ["bytes", "metadata"], "M2A_PRODUCTION_FAKE_INVALID");
      const validatedCompletion = validateCompletionBytes(value.bytes);
      completionBytes = Buffer.from(validatedCompletion.bytes);
      validateTransferredFile(
        value.metadata,
        {
          path: `transfer/${M2A_TRANSFER.completionPath}`,
          mode: 0o444,
          size: completionBytes.length,
          sha256: digest(completionBytes),
        },
        hostOwner,
      );
      const completionStatus = validatedCompletion.completion.status;
      if (
        (measurementWaitExit === 0 && completionStatus !== "complete") ||
        (measurementWaitExit !== 0 &&
          !(
            completionStatus === "inconclusive" &&
            validatedCompletion.completion.issue === "M2A_REBUILD_FAILED"
          ))
      ) {
        status = "inconclusive";
        issue = "M2A_COMPLETION_EXIT_MISMATCH";
        break;
      }
      outputs = validatedCompletion.completion.outputInventory.map(
        (item) => item.path,
      );
      if (!(await settleValidation("validate-completion", completionBytes))) {
        break;
      }
    }
  }
  if (status === "complete") {
    for (const output of outputs) {
      const suffix = output === M2A_TRANSFER.segmentPath ? "segment" : "marker";
      const row = plan.commandRows.find(
        (item) => item.step === `copy-${suffix}`,
      );
      if (row === undefined) fail("M2A_PRODUCTION_FAKE_INVALID");
      if (suffix === "marker") {
        const preparation = assertPublicationResult(
          await backend.prepareMarkerParent(),
          "M2A_PRODUCTION_FAKE_INVALID",
        );
        if (preparation !== "complete") {
          status = "inconclusive";
          issue =
            preparation === "unknown"
              ? "M2A_SETTLEMENT_UNKNOWN"
              : "M2A_MARKER_PARENT_INVALID";
          break;
        }
      }
      const valueInput = await performChild(row);
      if (valueInput === false) break;
      const value = readRecord(valueInput, "M2A_PRODUCTION_FAKE_INVALID");
      assertKeys(value, ["bytes", "metadata"], "M2A_PRODUCTION_FAKE_INVALID");
      const bytes = snapshotRuntimeBytes(
        value.bytes,
        4 * 1024 * 1024,
        "M2A_PRODUCTION_FAKE_INVALID",
      );
      validateTransferredFile(
        value.metadata,
        {
          path: `transfer/${output}`,
          mode: 0o600,
          size: bytes.length,
          sha256: digest(bytes),
        },
        hostOwner,
      );
      if (suffix === "segment") {
        validateProducerSegmentBytes(bytes);
        segmentBytes = bytes;
      } else {
        if (segmentBytes === null) fail("M2A_PRODUCTION_FAKE_INVALID");
        const events = validateProducerSegmentBytes(segmentBytes).events;
        validateMarkerBytes(bytes, events);
        markerBytes = bytes;
      }
      if (!(await settleValidation(`validate-${suffix}`, bytes))) break;
    }
  }
  if (status === "complete") {
    if (completionBytes === null) fail("M2A_PRODUCTION_FAKE_INVALID");
    validateCompletionArtifacts(completionBytes, segmentBytes, markerBytes);
    const completion = validateCompletionBytes(completionBytes).completion;
    const failureCandidate = completion.status === "inconclusive";
    const finalBytes = canonical({
      ...JSON.parse(
        createCompleteAttemptBytes(
          imageId,
          outputs.includes(M2A_TRANSFER.markerPath),
        ),
      ),
      issues: failureCandidate
        ? [{ code: "M2A_REBUILD_FAILED", step: "validate-completion" }]
        : [],
    });
    validateAttemptBytes(finalBytes, imageId);
    validateCandidateTransfer(
      finalBytes,
      imageId,
      completionBytes,
      segmentBytes,
      markerBytes,
    );
    candidateAttemptBytes = Buffer.from(finalBytes);
    await publishFinal(finalBytes);
  }
  return freeze({
    status,
    issue,
    durableCheckpoint,
    finalPublished,
    actions: backend.snapshotActions(),
    candidateAttemptBytes,
    completionBytes,
    segmentBytes,
    markerBytes,
    retained: true,
    retry: false,
    cleanup: false,
    evidenceReview: "not-performed",
  });
}

export async function runM2aProductionTransactionForTest(backend, imageId) {
  if (!fakeProductionBackendBrand.has(backend)) {
    fail("M2A_PRODUCTION_FAKE_REQUIRED");
  }
  return await runM2aProductionTransactionWithBackend(backend, imageId, {
    uid: 1000,
    gid: 1000,
  });
}

function fixedProductionPath(relativePath, code) {
  const resolved = path.resolve(PRODUCTION_REPOSITORY_ROOT, relativePath);
  if (
    resolved === PRODUCTION_REPOSITORY_ROOT ||
    !resolved.startsWith(`${PRODUCTION_REPOSITORY_ROOT}${path.sep}`)
  ) {
    fail(code);
  }
  return resolved;
}

async function assertProductionPathAbsent(relativePath, code) {
  try {
    await lstat(fixedProductionPath(relativePath, code));
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  fail(code);
}

async function readProductionFile(target, maximum, mode = null) {
  const handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.nlink !== 1n ||
      bytes.length === 0 ||
      bytes.length > maximum ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      BigInt(bytes.length) !== after.size ||
      (mode !== null && Number(after.mode & 0o7777n) !== mode)
    ) {
      fail("M2A_PRODUCTION_FILE_INVALID");
    }
    return { bytes, stat: after };
  } finally {
    await handle.close();
  }
}

async function writeExclusiveProductionFile(target, bytes, mode) {
  const handle = await open(
    target,
    constants.O_CREAT |
      constants.O_EXCL |
      constants.O_RDWR |
      constants.O_NOFOLLOW,
    mode,
  );
  try {
    await handle.writeFile(bytes);
    await handle.sync();
    const reread = Buffer.alloc(bytes.length);
    const result = await handle.read(reread, 0, reread.length, 0);
    if (result.bytesRead !== bytes.length || !reread.equals(bytes)) {
      fail("M2A_PRODUCTION_FILE_INVALID");
    }
    await handle.chmod(mode);
  } finally {
    await handle.close();
  }
  const stat = await lstat(target);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.nlink !== 1 ||
    (stat.mode & 0o7777) !== mode ||
    stat.uid !== process.getuid() ||
    stat.gid !== process.getgid()
  ) {
    fail("M2A_PRODUCTION_FILE_INVALID");
  }
}

async function validatePrivateDirectory(target, expectedMode) {
  const stat = await lstat(target);
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    (stat.mode & 0o777) !== expectedMode ||
    stat.uid !== process.getuid() ||
    stat.gid !== process.getgid()
  ) {
    fail("M2A_PRODUCTION_DIRECTORY_INVALID");
  }
}

async function syncDirectory(directory) {
  const handle = await open(
    directory,
    constants.O_RDONLY | constants.O_DIRECTORY,
  );
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function runFixedDockerCommand(argv, cwd, environment, deadlineMs) {
  return await new Promise((resolve) => {
    const state = createM2aPrivateProcessSettlementState();
    let child;
    try {
      child = spawn("/usr/bin/docker", argv, {
        cwd,
        env: environment,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      state.record({ type: "spawn-failure" });
      const processSettlement = state.snapshot();
      resolve({
        terminal: {
          exitCode: processSettlement.firstExit?.code ?? null,
          signal: processSettlement.firstExit?.signal ?? null,
          timedOut: processSettlement.timedOut,
          stdoutTruncated: processSettlement.stdoutTruncated,
          stderrTruncated: processSettlement.stderrTruncated,
          childClosed: processSettlement.childClosed,
          stdoutClosed: processSettlement.stdoutClosed,
          stderrClosed: processSettlement.stderrClosed,
          descriptorsClosed: processSettlement.descriptorsClosed,
        },
        stdout: "",
        processSettlement,
      });
      return;
    }
    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let finished = false;
    let terminationStarted = false;
    let deadline = null;
    let killDeadline = null;
    let closeDeadline = null;
    const clearTimers = () => {
      if (deadline !== null) clearTimeout(deadline);
      if (killDeadline !== null) clearTimeout(killDeadline);
      if (closeDeadline !== null) clearTimeout(closeDeadline);
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      if (!state.snapshot().settled) state.finalize();
      clearTimers();
      const processSettlement = state.snapshot();
      resolve({
        terminal: {
          exitCode: processSettlement.firstExit?.code ?? null,
          signal: processSettlement.firstExit?.signal ?? null,
          timedOut: processSettlement.timedOut,
          stdoutTruncated: processSettlement.stdoutTruncated,
          stderrTruncated: processSettlement.stderrTruncated,
          childClosed: processSettlement.childClosed,
          stdoutClosed: processSettlement.stdoutClosed,
          stderrClosed: processSettlement.stderrClosed,
          descriptorsClosed: processSettlement.descriptorsClosed,
        },
        stdout: Buffer.concat(stdout).toString("utf8"),
        processSettlement,
      });
    };
    const startFinalCloseBound = () => {
      if (finished || closeDeadline !== null) return;
      state.ownTimer("close");
      closeDeadline = setTimeout(() => {
        state.record({ type: "final-bound" });
        finish();
      }, 1_000);
      closeDeadline.unref();
    };
    const signalChild = (signal) => {
      if (finished) return;
      try {
        if (child.kill(signal) !== true) {
          state.record({ type: "signal-failure" });
        }
      } catch {
        state.record({ type: "signal-failure" });
        startFinalCloseBound();
      }
    };
    const beginTermination = () => {
      if (finished || terminationStarted) return;
      terminationStarted = true;
      signalChild("SIGTERM");
      if (killDeadline === null) {
        state.ownTimer("kill");
        killDeadline = setTimeout(() => signalChild("SIGKILL"), 250);
        killDeadline.unref();
      }
      startFinalCloseBound();
    };
    const capture = (chunks, kind) => (chunk) => {
      if (finished) return;
      if (stdoutBytes + stderrBytes + chunk.length > 65_536) {
        state.record({ type: "overflow", stream: kind });
        beginTermination();
        return;
      }
      chunks.push(Buffer.from(chunk));
      if (kind === "stdout") stdoutBytes += chunk.length;
      else stderrBytes += chunk.length;
    };
    child.stdout.on("data", capture(stdout, "stdout"));
    child.stderr.on("data", capture(stderr, "stderr"));
    state.ownTimer("primary");
    deadline = setTimeout(() => {
      state.record({ type: "timeout" });
      beginTermination();
    }, deadlineMs);
    deadline.unref();
    child.once("error", () => {
      state.record({ type: "error" });
      startFinalCloseBound();
    });
    child.once("exit", (code, signal) => {
      state.record({ type: "exit", code, signal });
      startFinalCloseBound();
    });
    child.once("close", (code, signal) => {
      state.record({
        type: "close",
        code,
        signal,
        childClosed: true,
        stdoutClosed: child.stdout.closed,
        stderrClosed: child.stderr.closed,
      });
      finish();
    });
  });
}

async function inspectConstructedContext(root) {
  const rows = [];
  const visit = async (current, prefix) => {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      const logicalPath =
        prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      const target = path.join(current, entry.name);
      const stat = await lstat(target, { bigint: true });
      if (entry.isDirectory()) {
        rows.push({
          path: logicalPath,
          type: "directory",
          mode: Number(stat.mode & 0o777n),
          size: null,
          sha256: null,
          mtimeNs: stat.mtimeNs.toString(),
        });
        await visit(target, logicalPath);
      } else if (entry.isFile()) {
        const file = await readProductionFile(target, 64 * 1024 * 1024);
        rows.push({
          path: logicalPath,
          type: "regular",
          mode: Number(stat.mode & 0o777n),
          size: file.bytes.length,
          sha256: digest(file.bytes),
          mtimeNs: stat.mtimeNs.toString(),
        });
      } else fail("M2A_IMAGE_BUILD_CONTEXT_INVALID");
    }
  };
  await visit(root, "");
  rows.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  return rows;
}

function buildObservationTerminal(terminal) {
  return {
    exitCode: terminal.exitCode,
    signal: terminal.signal,
    timedOut: terminal.timedOut,
    outputTruncated:
      terminal.stdoutTruncated === true || terminal.stderrTruncated === true,
    childClosed: terminal.childClosed,
    outputClosed:
      terminal.stdoutClosed === true && terminal.stderrClosed === true,
    descriptorsClosed: terminal.descriptorsClosed,
  };
}

function parseFixedDockerJson(stdout, code) {
  try {
    return JSON.parse(stdout);
  } catch {
    fail(code);
  }
}

function createFixedImageBuildAuthority() {
  const authority = {
    async execute() {
      const buildPlan = createFixedImageBuildPlan();
      const buildRoot = fixedProductionPath(
        M2A_PRODUCTION.buildRoot,
        "M2A_IMAGE_BUILD_PATH_INVALID",
      );
      await assertProductionPathAbsent(
        M2A_PRODUCTION.buildRoot,
        "M2A_IMAGE_BUILD_ROOT_PRESENT",
      );
      await mkdir(path.dirname(buildRoot), { recursive: true, mode: 0o700 });
      await mkdir(buildRoot, { recursive: false, mode: 0o700 });
      await mkdir(path.join(buildRoot, "home"), { mode: 0o700 });
      await mkdir(path.join(buildRoot, "docker-config"), { mode: 0o700 });
      await validatePrivateDirectory(buildRoot, 0o700);
      await validatePrivateDirectory(path.join(buildRoot, "home"), 0o700);
      await validatePrivateDirectory(
        path.join(buildRoot, "docker-config"),
        0o700,
      );
      await writeExclusiveProductionFile(
        path.join(buildRoot, "docker-config/config.json"),
        Buffer.from('{"auths":{}}\n'),
        0o600,
      );
      const manifestPath = fixedProductionPath(
        `${M2A_PRODUCTION.constructionRoot}/construction-manifest.json`,
        "M2A_IMAGE_BUILD_PATH_INVALID",
      );
      const manifestFile = await readProductionFile(
        manifestPath,
        4 * 1024 * 1024,
        0o444,
      );
      if (
        digest(manifestFile.bytes) !==
        M2A_PRODUCTION.reviewedConstructionManifestSha256
      ) {
        fail("M2A_IMAGE_BUILD_CONTEXT_INVALID");
      }
      const parsedManifest = parseCanonicalLine(
        manifestFile.bytes,
        4 * 1024 * 1024,
        "M2A_IMAGE_BUILD_CONTEXT_INVALID",
      ).record;
      const contextInventory = await inspectConstructedContext(
        fixedProductionPath(
          `${M2A_PRODUCTION.constructionRoot}/context`,
          "M2A_IMAGE_BUILD_PATH_INVALID",
        ),
      );
      if (
        JSON.stringify(contextInventory) !==
          JSON.stringify(parsedManifest.contextInventory) ||
        digest(JSON.stringify(contextInventory)) !==
          M2A_PRODUCTION.reviewedContextAggregate
      ) {
        fail("M2A_IMAGE_BUILD_CONTEXT_INVALID");
      }
      const results = new Map();
      for (const command of buildPlan.commands) {
        const result = await runFixedDockerCommand(
          command.argv,
          PRODUCTION_REPOSITORY_ROOT,
          buildPlan.environment,
          command.deadlineMs,
        );
        if (result.processSettlement.successful !== true) {
          fail("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
        }
        const terminal = buildObservationTerminal(result.terminal);
        let value;
        if (command.stepId === "docker-version") {
          const parsed = parseFixedDockerJson(
            result.stdout,
            "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
          );
          value = { terminal, client: parsed.client, server: parsed.server };
        } else if (command.stepId === "candidate-tag-absence") {
          value = { terminal, stdout: result.stdout.trim() };
        } else if (command.stepId === "pinned-base-inspect") {
          value = {
            terminal,
            projection: parseFixedDockerJson(
              result.stdout,
              "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
            ),
          };
        } else if (command.stepId === "offline-build") {
          const revalidatedInventory = await inspectConstructedContext(
            fixedProductionPath(
              `${M2A_PRODUCTION.constructionRoot}/context`,
              "M2A_IMAGE_BUILD_PATH_INVALID",
            ),
          );
          value = {
            terminal,
            occurrences: 1,
            contextRevalidated:
              JSON.stringify(revalidatedInventory) ===
              JSON.stringify(contextInventory),
          };
        } else if (command.stepId === "candidate-inspect") {
          value = {
            terminal,
            projection: parseFixedDockerJson(
              result.stdout,
              "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
            ),
            allDescriptorsSettled: terminal.descriptorsClosed,
          };
        } else {
          fail("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
        }
        results.set(
          command.stepId,
          validateImageBuildStepValue(command.stepId, value),
        );
      }
      const observation = {
        version: results.get("docker-version"),
        tagAbsence: results.get("candidate-tag-absence"),
        baseImage: results.get("pinned-base-inspect"),
        build: {
          terminal: results.get("offline-build").terminal,
          occurrences: results.get("offline-build").occurrences,
        },
        candidateImage: {
          terminal: results.get("candidate-inspect").terminal,
          projection: results.get("candidate-inspect").projection,
        },
        contextRevalidated: results.get("offline-build").contextRevalidated,
        allDescriptorsSettled:
          results.get("candidate-inspect").allDescriptorsSettled,
      };
      const validatedObservation = validateImageBuildObservation(observation);
      const construction = {
        manifestSha256: M2A_PRODUCTION.reviewedConstructionManifestSha256,
        contextAggregate: M2A_PRODUCTION.reviewedContextAggregate,
        npmAcquisitionSha256: M2A_PRODUCTION.reviewedNpmAcquisitionSha256,
        constructorToolchainSha256:
          M2A_PRODUCTION.reviewedConstructorToolchainSha256,
      };
      const bindingBytes = createImageBindingBytesForTest(
        observation,
        construction,
      );
      validateImageBindingBytes(
        bindingBytes,
        construction,
        validatedObservation.localImage.id,
      );
      const target = fixedProductionPath(
        `${M2A_PRODUCTION.constructionRoot}/image-binding.json`,
        "M2A_IMAGE_BUILD_PATH_INVALID",
      );
      await writeExclusiveProductionFile(target, bindingBytes, 0o444);
      await syncDirectory(path.dirname(target));
      return freeze({
        status: "complete",
        localImageId: validatedObservation.localImage.id,
        evidenceReview: "not-performed",
      });
    },
  };
  fixedImageBuildAuthorityBrand.add(authority);
  return freeze(authority);
}

function projectRuntimeInspection(rawInput, role, imageId) {
  const list = readArray(rawInput, "M2A_PRODUCTION_INSPECTION_INVALID");
  if (list.length !== 1) fail("M2A_PRODUCTION_INSPECTION_INVALID");
  const raw = list[0];
  const config = raw.Config;
  const host = raw.HostConfig;
  const state = raw.State;
  const mounts = raw.Mounts;
  const projection = {
    containerName: raw.Name?.replace(/^\//u, ""),
    imageId: raw.Image,
    user: config?.User,
    networkMode: host?.NetworkMode,
    readOnlyRootfs: host?.ReadonlyRootfs,
    privileged: host?.Privileged,
    capDrop: host?.CapDrop ?? [],
    capAdd: host?.CapAdd ?? [],
    securityOpt: host?.SecurityOpt ?? [],
    pidsLimit: host?.PidsLimit,
    memoryBytes: host?.Memory,
    nanoCpus: host?.NanoCpus,
    tmpfs: Object.entries(host?.Tmpfs ?? {})
      .map(([target, options]) => `${target}:${options}`)
      .sort(),
    mounts: mounts?.map((mount) => ({
      type: mount.Type,
      name: mount.Name,
      destination: mount.Destination,
      readWrite: mount.RW,
    })),
    entry: [raw.Path, ...(raw.Args ?? [])],
    environmentNames: (config?.Env ?? []).map((item) => item.split("=", 1)[0]),
  };
  validateInspectionProjection(projection, role, imageId);
  return { projection, state };
}

function directoryIdentity(stat) {
  return {
    type: stat.isDirectory() ? "directory" : "other",
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    uid: stat.uid,
    gid: stat.gid,
    nlink: stat.nlink,
    size: stat.size,
    mtimeNs: stat.mtimeNs,
  };
}

function childFilesystemIdentity(stat) {
  return {
    type: stat.isDirectory() ? "directory" : stat.isFile() ? "file" : "other",
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    uid: stat.uid,
    gid: stat.gid,
    nlink: stat.nlink,
    size: stat.size,
    mtimeNs: stat.mtimeNs,
  };
}

function sameChildIdentityMap(left, right) {
  if (left.length !== right.length) return false;
  for (const [index, identity] of left.entries()) {
    const other = right[index];
    if (
      other === undefined ||
      identity.name !== other.name ||
      !sameChildIdentity(identity, other)
    ) {
      return false;
    }
  }
  return true;
}

function sameChildIdentity(left, right) {
  return (
    left.type === right.type &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs
  );
}

function sameNestedDirectoryChildIdentity(left, right) {
  return (
    left.type === "directory" &&
    right.type === "directory" &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.nlink === right.nlink
  );
}

function sameDirectoryIdentity(left, right) {
  return (
    left.type === right.type &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs
  );
}

function sameDirectoryObjectIdentity(left, right) {
  return (
    left.type === right.type &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.nlink === right.nlink
  );
}

function assertDirectoryIdentity(identity, expectedMode) {
  if (
    identity.type !== "directory" ||
    (identity.mode & 0o7777n) !== BigInt(expectedMode) ||
    identity.uid !== BigInt(process.getuid()) ||
    identity.gid !== BigInt(process.getgid()) ||
    identity.nlink < 1n
  ) {
    fail("M2A_RUNTIME_DIRECTORY_INVALID");
  }
}

function validateAbstractDirectorySnapshot(snapshotInput, code) {
  const snapshot = readRecord(snapshotInput, code);
  assertKeys(snapshot, ["identity", "entries", "children"], code);
  const identity = readRecord(snapshot.identity, code);
  assertKeys(
    identity,
    ["type", "dev", "ino", "mode", "uid", "gid", "nlink", "size", "mtimeNs"],
    code,
  );
  if (
    identity.type !== "directory" ||
    [
      identity.dev,
      identity.ino,
      identity.mode,
      identity.uid,
      identity.gid,
      identity.nlink,
      identity.size,
      identity.mtimeNs,
    ].some((value) => typeof value !== "bigint") ||
    (identity.mode & 0o170000n) !== 0o040000n ||
    (identity.mode & 0o7000n) !== 0n ||
    identity.nlink < 1n
  ) {
    fail(code);
  }
  const entries = readArray(snapshot.entries, code).map((entryInput) => {
    const entry = readRecord(entryInput, code);
    assertKeys(entry, ["name", "type"], code);
    if (
      typeof entry.name !== "string" ||
      entry.name.length === 0 ||
      entry.name.includes("/") ||
      !["directory", "file"].includes(entry.type)
    ) {
      fail(code);
    }
    return { name: entry.name, type: entry.type };
  });
  const sorted = [...entries].sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  if (
    JSON.stringify(entries) !== JSON.stringify(sorted) ||
    new Set(entries.map((entry) => entry.name)).size !== entries.length
  ) {
    fail(code);
  }
  const children = readArray(snapshot.children, code).map((childInput) => {
    const child = readRecord(childInput, code);
    assertKeys(
      child,
      [
        "name",
        "type",
        "dev",
        "ino",
        "mode",
        "uid",
        "gid",
        "nlink",
        "size",
        "mtimeNs",
      ],
      code,
    );
    if (
      typeof child.name !== "string" ||
      child.name.length === 0 ||
      child.name.includes("/") ||
      !["directory", "file"].includes(child.type) ||
      [
        child.dev,
        child.ino,
        child.mode,
        child.uid,
        child.gid,
        child.nlink,
        child.size,
        child.mtimeNs,
      ].some((value) => typeof value !== "bigint") ||
      child.dev < 0n ||
      child.ino < 1n ||
      child.uid < 0n ||
      child.gid < 0n ||
      child.nlink < 1n ||
      child.size < 0n ||
      child.mtimeNs < 0n ||
      (child.mode & 0o170000n) !==
        (child.type === "directory" ? 0o040000n : 0o100000n) ||
      (child.mode & 0o7000n) !== 0n ||
      (child.type === "file" && child.nlink !== 1n)
    ) {
      fail(code);
    }
    return { ...child };
  });
  if (
    children.length !== entries.length ||
    children.some(
      (child, index) =>
        child.name !== entries[index]?.name ||
        child.type !== entries[index]?.type,
    ) ||
    new Set(children.map((child) => `${child.dev}:${child.ino}`)).size !==
      children.length
  ) {
    fail(code);
  }
  return { identity: { ...identity }, entries, children };
}

function normalizeExpectedDirectoryEntries(entriesInput, code) {
  return readArray(entriesInput, code).map((entryInput) => {
    const entry = readRecord(entryInput, code);
    assertKeys(entry, ["name", "type"], code);
    if (
      typeof entry.name !== "string" ||
      !["directory", "file"].includes(entry.type)
    ) {
      fail(code);
    }
    return { name: entry.name, type: entry.type };
  });
}

function assertDirectorySnapshotEntries(snapshot, expectedInput, code) {
  const expected = normalizeExpectedDirectoryEntries(expectedInput, code);
  if (JSON.stringify(snapshot.entries) !== JSON.stringify(expected)) fail(code);
}

function validateFixedDirectoryOperation(operationInput) {
  const operation = readRecord(
    operationInput,
    "M2A_RUNTIME_DIRECTORY_OPERATION_INVALID",
  );
  assertKeys(operation, ["kind"], "M2A_RUNTIME_DIRECTORY_OPERATION_INVALID");
  if (
    ![
      "create-attempt-next",
      "rename-attempt-next",
      "create-completion-copy",
      "create-segment-copy",
      "create-probe-output",
      "create-nested-marker",
    ].includes(operation.kind)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_OPERATION_INVALID");
  }
  return operation;
}

function childIdentityByName(snapshot) {
  return new Map(snapshot.children.map((child) => [child.name, child]));
}

function assertExactUnchangedChildren(before, after, mutatedNames) {
  const afterByName = childIdentityByName(after);
  for (const child of before.children) {
    if (mutatedNames.has(child.name)) continue;
    const next = afterByName.get(child.name);
    if (next === undefined || !sameChildIdentity(child, next)) {
      fail("M2A_RUNTIME_CHILD_IDENTITY_DRIFT");
    }
  }
}

function assertCreatedChildTransition(before, after, name, type) {
  const beforeByName = childIdentityByName(before);
  const afterByName = childIdentityByName(after);
  if (
    beforeByName.has(name) ||
    afterByName.get(name)?.type !== type ||
    after.children.length !== before.children.length + 1 ||
    (type === "file" && afterByName.get(name)?.nlink !== 1n) ||
    (type === "directory" && afterByName.get(name)?.nlink !== 2n)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_OPERATION_INVALID");
  }
  assertExactUnchangedChildren(before, after, new Set([name]));
}

function assertDirectoryChildTransition(before, after, operationInput) {
  const operation = validateFixedDirectoryOperation(operationInput);
  if (operation.kind === "create-attempt-next") {
    assertCreatedChildTransition(before, after, "attempt.next", "file");
    return;
  }
  if (operation.kind === "create-completion-copy") {
    assertCreatedChildTransition(
      before,
      after,
      M2A_TRANSFER.completionPath,
      "file",
    );
    return;
  }
  if (operation.kind === "create-segment-copy") {
    assertCreatedChildTransition(
      before,
      after,
      M2A_TRANSFER.segmentPath,
      "file",
    );
    return;
  }
  if (operation.kind === "create-probe-output") {
    assertCreatedChildTransition(before, after, "probe-output", "directory");
    return;
  }
  if (operation.kind === "rename-attempt-next") {
    const beforeByName = childIdentityByName(before);
    const afterByName = childIdentityByName(after);
    const source = beforeByName.get("attempt.next");
    const destination = afterByName.get("attempt.json");
    const priorDestination = beforeByName.get("attempt.json");
    if (
      source === undefined ||
      source.type !== "file" ||
      afterByName.has("attempt.next") ||
      destination === undefined ||
      destination.type !== "file" ||
      !sameChildIdentity(source, destination) ||
      after.children.length !==
        before.children.length - (priorDestination === undefined ? 0 : 1)
    ) {
      fail("M2A_RUNTIME_DIRECTORY_OPERATION_INVALID");
    }
    assertExactUnchangedChildren(
      before,
      after,
      new Set(["attempt.next", "attempt.json"]),
    );
    return;
  }
  const beforeByName = childIdentityByName(before);
  const afterByName = childIdentityByName(after);
  if (
    !beforeByName.has("direct-write-marker.json") &&
    afterByName.has("direct-write-marker.json")
  ) {
    assertCreatedChildTransition(
      before,
      after,
      "direct-write-marker.json",
      "file",
    );
    return;
  }
  const beforeProbeOutput = beforeByName.get("probe-output");
  const afterProbeOutput = afterByName.get("probe-output");
  if (
    before.children.length !== after.children.length ||
    beforeProbeOutput === undefined ||
    afterProbeOutput === undefined ||
    !sameNestedDirectoryChildIdentity(beforeProbeOutput, afterProbeOutput)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_OPERATION_INVALID");
  }
  assertExactUnchangedChildren(before, after, new Set(["probe-output"]));
}

function assertProductionDirectoryTransition(
  beforeInput,
  afterInput,
  expectedBefore,
  expectedAfter,
  linkDelta,
  operation,
) {
  const before = validateAbstractDirectorySnapshot(
    beforeInput,
    "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
  );
  const after = validateAbstractDirectorySnapshot(
    afterInput,
    "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
  );
  assertDirectorySnapshotEntries(
    before,
    expectedBefore,
    "M2A_RUNTIME_INVENTORY_INVALID",
  );
  assertDirectorySnapshotEntries(
    after,
    expectedAfter,
    "M2A_RUNTIME_INVENTORY_INVALID",
  );
  if (
    !Number.isSafeInteger(linkDelta) ||
    after.identity.dev !== before.identity.dev ||
    after.identity.ino !== before.identity.ino ||
    after.identity.mode !== before.identity.mode ||
    after.identity.uid !== before.identity.uid ||
    after.identity.gid !== before.identity.gid ||
    after.identity.nlink !== before.identity.nlink + BigInt(linkDelta)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  assertDirectoryChildTransition(before, after, operation);
  if (
    JSON.stringify(before.entries) === JSON.stringify(after.entries) &&
    (after.identity.size !== before.identity.size ||
      after.identity.mtimeNs !== before.identity.mtimeNs)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  return after;
}

export function createFakeM2aHeldDirectoryTrace(stepsInput = []) {
  const steps = readArray(stepsInput, "M2A_DIRECTORY_TRACE_INVALID").map(
    (stepInput) => {
      const step = readRecord(stepInput, "M2A_DIRECTORY_TRACE_INVALID");
      assertKeys(
        step,
        [
          "before",
          "after",
          "expectedBefore",
          "expectedAfter",
          "linkDelta",
          "operation",
          ...(Object.hasOwn(step, "correlated") ? ["correlated"] : []),
        ],
        "M2A_DIRECTORY_TRACE_INVALID",
      );
      if (Object.hasOwn(step, "correlated")) {
        const correlated = readRecord(
          step.correlated,
          "M2A_DIRECTORY_TRACE_INVALID",
        );
        assertKeys(
          correlated,
          [
            "before",
            "after",
            "expectedBefore",
            "expectedAfter",
            "linkDelta",
            "operation",
          ],
          "M2A_DIRECTORY_TRACE_INVALID",
        );
      }
      return { ...step };
    },
  );
  const actions = [];
  const trace = freeze({
    steps,
    record(action) {
      actions.push(action);
    },
    snapshotActions() {
      return [...actions];
    },
  });
  fakeHeldDirectoryTraceBrand.add(trace);
  return trace;
}

export function runM2aHeldDirectoryTraceForTest(trace) {
  if (!fakeHeldDirectoryTraceBrand.has(trace)) {
    fail("M2A_DIRECTORY_TRACE_FAKE_REQUIRED");
  }
  let previousAfter = null;
  for (const [index, step] of trace.steps.entries()) {
    trace.record(`before:${index}`);
    if (previousAfter !== null) {
      const previous = validateAbstractDirectorySnapshot(
        previousAfter,
        "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
      );
      const current = validateAbstractDirectorySnapshot(
        step.before,
        "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
      );
      if (
        !sameDirectoryIdentity(previous.identity, current.identity) ||
        JSON.stringify(previous.entries) !== JSON.stringify(current.entries) ||
        !sameChildIdentityMap(previous.children, current.children)
      ) {
        fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
      }
    }
    assertProductionDirectoryTransition(
      step.before,
      step.after,
      step.expectedBefore,
      step.expectedAfter,
      step.linkDelta,
      step.operation,
    );
    if (Object.hasOwn(step, "correlated")) {
      assertProductionDirectoryTransition(
        step.correlated.before,
        step.correlated.after,
        step.correlated.expectedBefore,
        step.correlated.expectedAfter,
        step.correlated.linkDelta,
        step.correlated.operation,
      );
    }
    previousAfter = step.after;
    trace.record(`after:${index}`);
  }
  return freeze({ status: "complete", actions: trace.snapshotActions() });
}

async function correlatedProductionDirectoryIdentity(held) {
  const descriptorStat = await held.handle.stat({ bigint: true });
  const pathStat = await lstat(held.target, { bigint: true });
  const descriptorIdentity = directoryIdentity(descriptorStat);
  const pathIdentity = directoryIdentity(pathStat);
  assertDirectoryIdentity(descriptorIdentity, held.expectedMode);
  assertDirectoryIdentity(pathIdentity, held.expectedMode);
  if (!sameDirectoryIdentity(descriptorIdentity, pathIdentity)) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  return descriptorIdentity;
}

async function captureProductionDirectorySnapshot(held) {
  const before = await correlatedProductionDirectoryIdentity(held);
  const names = (await readdir(held.target)).sort();
  const entries = [];
  const children = [];
  for (const name of names) {
    const stat = await lstat(path.join(held.target, name), { bigint: true });
    if (stat.isSymbolicLink()) fail("M2A_RUNTIME_INVENTORY_INVALID");
    const type = stat.isFile()
      ? "file"
      : stat.isDirectory()
        ? "directory"
        : null;
    if (type === null) fail("M2A_RUNTIME_INVENTORY_INVALID");
    entries.push({ name, type });
    children.push({ name, ...childFilesystemIdentity(stat) });
  }
  const after = await correlatedProductionDirectoryIdentity(held);
  if (!sameDirectoryIdentity(before, after)) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  const snapshot = validateAbstractDirectorySnapshot(
    { identity: after, entries, children },
    "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
  );
  return snapshot;
}

async function holdProductionDirectory(
  target,
  expectedMode,
  owned,
  expectedLinkCount = null,
) {
  const handle = await open(
    target,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  const held = {
    target,
    handle,
    identity: null,
    expectedMode,
    children: null,
  };
  owned.push(held);
  const stat = await handle.stat({ bigint: true });
  const identity = directoryIdentity(stat);
  assertDirectoryIdentity(identity, expectedMode);
  if (expectedLinkCount !== null && identity.nlink !== expectedLinkCount) {
    fail("M2A_RUNTIME_DIRECTORY_INVALID");
  }
  const pathIdentity = await correlatedProductionDirectoryIdentity(held);
  if (!sameDirectoryIdentity(identity, pathIdentity)) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  held.identity = directoryIdentity(stat);
  return held;
}

async function revalidateHeldDirectory(held) {
  const current = await correlatedProductionDirectoryIdentity(held);
  if (
    held.identity === null ||
    !sameDirectoryIdentity(current, held.identity)
  ) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
}

async function exactProductionDirectoryInventory(held, expected) {
  const snapshot = await captureProductionDirectorySnapshot(held);
  if (!sameDirectoryIdentity(snapshot.identity, held.identity)) {
    fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
  }
  assertDirectorySnapshotEntries(
    snapshot,
    expected,
    "M2A_RUNTIME_INVENTORY_INVALID",
  );
  if (
    held.children !== null &&
    !sameChildIdentityMap(snapshot.children, held.children)
  ) {
    fail("M2A_RUNTIME_INVENTORY_INVALID");
  }
  held.children = snapshot.children;
  return snapshot;
}

async function transitionHeldProductionDirectory(
  held,
  expectedBefore,
  expectedAfter,
  linkDelta,
  directoryOperation,
  operation,
) {
  const before = await exactProductionDirectoryInventory(held, expectedBefore);
  await operation();
  return await completeHeldProductionDirectoryTransition(
    held,
    before,
    expectedBefore,
    expectedAfter,
    linkDelta,
    directoryOperation,
  );
}

async function completeHeldProductionDirectoryTransition(
  held,
  before,
  expectedBefore,
  expectedAfter,
  linkDelta,
  directoryOperation,
) {
  const after = await captureProductionDirectorySnapshot(held);
  const validatedAfter = assertProductionDirectoryTransition(
    before,
    after,
    expectedBefore,
    expectedAfter,
    linkDelta,
    directoryOperation,
  );
  held.identity = validatedAfter.identity;
  held.children = validatedAfter.children;
  return validatedAfter;
}

async function completeHeldProductionNestedMarkerTransition(
  markerParent,
  markerBefore,
  markerExpectedBefore,
  markerExpectedAfter,
  transferParent,
  transferBefore,
  transferExpected,
) {
  const markerAfter = await captureProductionDirectorySnapshot(markerParent);
  const transferAfter =
    await captureProductionDirectorySnapshot(transferParent);
  const operation = { kind: "create-nested-marker" };
  const validatedMarkerAfter = assertProductionDirectoryTransition(
    markerBefore,
    markerAfter,
    markerExpectedBefore,
    markerExpectedAfter,
    0,
    operation,
  );
  const validatedTransferAfter = assertProductionDirectoryTransition(
    transferBefore,
    transferAfter,
    transferExpected,
    transferExpected,
    0,
    operation,
  );
  markerParent.identity = validatedMarkerAfter.identity;
  markerParent.children = validatedMarkerAfter.children;
  transferParent.identity = validatedTransferAfter.identity;
  transferParent.children = validatedTransferAfter.children;
  return validatedMarkerAfter;
}

async function settleHeldProductionDirectories(owned, unknownMutationParents) {
  let invalid = false;
  for (const held of owned) {
    try {
      if (unknownMutationParents.has(held)) {
        const current = await correlatedProductionDirectoryIdentity(held);
        if (!sameDirectoryObjectIdentity(current, held.identity)) {
          fail("M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT");
        }
      } else await revalidateHeldDirectory(held);
    } catch {
      invalid = true;
    }
  }
  const results = await Promise.allSettled(
    owned.map((held) => held.handle.close()),
  );
  if (invalid || results.some((result) => result.status === "rejected")) {
    fail("M2A_RUNTIME_DIRECTORY_SETTLEMENT_UNKNOWN");
  }
}

async function createFixedRuntimeBackend(imageId) {
  const plan = createFixedProductionExecutionPlan(imageId);
  const resultRoot = fixedProductionPath(
    M2A_TRANSFER.resultRoot,
    "M2A_RUNTIME_PATH_INVALID",
  );
  const runtimeRoot = fixedProductionPath(
    M2A_PRODUCTION.runtimeRoot,
    "M2A_RUNTIME_PATH_INVALID",
  );
  await assertProductionPathAbsent(
    M2A_TRANSFER.resultRoot,
    "M2A_RUNTIME_RESULT_ROOT_PRESENT",
  );
  await assertProductionPathAbsent(
    M2A_PRODUCTION.runtimeRoot,
    "M2A_RUNTIME_ROOT_PRESENT",
  );
  await mkdir(path.dirname(resultRoot), { recursive: true, mode: 0o700 });
  await mkdir(resultRoot, { recursive: false, mode: 0o700 });
  await mkdir(path.join(resultRoot, "transfer"), { mode: 0o700 });
  await mkdir(path.dirname(runtimeRoot), { recursive: true, mode: 0o700 });
  await mkdir(runtimeRoot, { recursive: false, mode: 0o700 });
  await mkdir(path.join(runtimeRoot, "home"), { mode: 0o700 });
  await mkdir(path.join(runtimeRoot, "docker-config"), { mode: 0o700 });
  for (const directory of [
    resultRoot,
    path.join(resultRoot, "transfer"),
    runtimeRoot,
    path.join(runtimeRoot, "home"),
    path.join(runtimeRoot, "docker-config"),
  ]) {
    await validatePrivateDirectory(directory, 0o700);
  }
  const ownedDirectories = [];
  const repositoryIdentity = await holdProductionDirectory(
    PRODUCTION_REPOSITORY_ROOT,
    0o755,
    ownedDirectories,
  );
  const resultAncestorIdentities = [];
  for (const relativePath of ["results", "results/runs", "results/runs/m2-a"]) {
    resultAncestorIdentities.push(
      await holdProductionDirectory(
        fixedProductionPath(relativePath, "M2A_RUNTIME_PATH_INVALID"),
        0o755,
        ownedDirectories,
      ),
    );
  }
  const resultIdentity = await holdProductionDirectory(
    resultRoot,
    0o700,
    ownedDirectories,
    3n,
  );
  const transferRoot = path.join(resultRoot, "transfer");
  const transferIdentity = await holdProductionDirectory(
    transferRoot,
    0o700,
    ownedDirectories,
    2n,
  );
  const transferEntries = new Set();
  const unknownMutationParents = new Set();
  let markerFilePresent = false;
  let markerParentIdentity = null;
  let attemptPresent = false;
  const resultInventory = (temporaryAttempt = false) =>
    [
      ...(attemptPresent ? [{ name: "attempt.json", type: "file" }] : []),
      ...(temporaryAttempt ? [{ name: "attempt.next", type: "file" }] : []),
      { name: "transfer", type: "directory" },
    ].sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
  const transferInventory = (additional = null) =>
    [...transferEntries, ...(additional === null ? [] : [additional])]
      .map((name) => ({
        name,
        type: name === "probe-output" ? "directory" : "file",
      }))
      .sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
      );
  const markerInventory = (present = markerFilePresent) =>
    present ? [{ name: "direct-write-marker.json", type: "file" }] : [];
  const validateHeldRuntimeAncestors = async () => {
    await revalidateHeldDirectory(repositoryIdentity);
    for (const identity of resultAncestorIdentities) {
      await revalidateHeldDirectory(identity);
    }
  };
  const validateHeldRuntimeState = async () => {
    await validateHeldRuntimeAncestors();
    await revalidateHeldDirectory(resultIdentity);
    await revalidateHeldDirectory(transferIdentity);
    if (markerParentIdentity !== null) {
      await revalidateHeldDirectory(markerParentIdentity);
    }
    await exactProductionDirectoryInventory(resultIdentity, resultInventory());
    await exactProductionDirectoryInventory(
      transferIdentity,
      transferInventory(),
    );
    if (transferEntries.has("probe-output")) {
      await exactProductionDirectoryInventory(
        markerParentIdentity,
        markerInventory(),
      );
    }
  };
  const actions = [];
  const publishAttempt = async (bytes) => {
    await validateHeldRuntimeState();
    const next = path.join(resultRoot, "attempt.next");
    await transitionHeldProductionDirectory(
      resultIdentity,
      resultInventory(),
      resultInventory(true),
      0,
      { kind: "create-attempt-next" },
      async () => await writeExclusiveProductionFile(next, bytes, 0o600),
    );
    await transitionHeldProductionDirectory(
      resultIdentity,
      resultInventory(true),
      [
        { name: "attempt.json", type: "file" },
        { name: "transfer", type: "directory" },
      ],
      0,
      { kind: "rename-attempt-next" },
      async () => await rename(next, path.join(resultRoot, "attempt.json")),
    );
    await resultIdentity.handle.sync();
    attemptPresent = true;
    await validateHeldRuntimeState();
    return successfulPublicationResult();
  };
  const backend = {
    async publishCheckpoint(step, bytes) {
      actions.push(`checkpoint:${step}`);
      return await publishAttempt(bytes);
    },
    async runChild(row) {
      actions.push(row.step);
      await validateHeldRuntimeState();
      let copyTransition = null;
      if (row.step.startsWith("copy-")) {
        const destination = row.argv.at(-1);
        if (
          typeof destination !== "string" ||
          !destination.startsWith("transfer/")
        ) {
          fail("M2A_RUNTIME_INVENTORY_INVALID");
        }
        const transferRelative = destination.slice("transfer/".length);
        const topLevel = transferRelative.split("/", 1)[0];
        const nested = transferRelative.includes("/");
        const parent = nested ? markerParentIdentity : transferIdentity;
        const directoryOperation =
          transferRelative === M2A_TRANSFER.completionPath
            ? { kind: "create-completion-copy" }
            : transferRelative === M2A_TRANSFER.segmentPath
              ? { kind: "create-segment-copy" }
              : transferRelative === M2A_TRANSFER.markerPath
                ? { kind: "create-nested-marker" }
                : null;
        if (
          parent === null ||
          directoryOperation === null ||
          (!nested && transferEntries.has(topLevel)) ||
          (nested && markerFilePresent)
        ) {
          fail("M2A_RUNTIME_INVENTORY_INVALID");
        }
        const expectedBefore = nested
          ? markerInventory(false)
          : transferInventory();
        const expectedAfter = nested
          ? markerInventory(true)
          : transferInventory(topLevel);
        const nestedExpected = nested ? transferInventory() : null;
        copyTransition = {
          parent,
          before: await exactProductionDirectoryInventory(
            parent,
            expectedBefore,
          ),
          expectedBefore,
          expectedAfter,
          directoryOperation,
          nestedParent: nested ? transferIdentity : null,
          nestedBefore: nested
            ? await exactProductionDirectoryInventory(
                transferIdentity,
                nestedExpected,
              )
            : null,
          nestedExpected,
          destination,
          transferRelative,
          topLevel,
        };
      }
      const result = await runFixedDockerCommand(
        row.argv,
        resultRoot,
        plan.environment,
        row.deadlineMs,
      );
      await validateHeldRuntimeAncestors();
      if (
        result.processSettlement.known !== true ||
        result.terminal.childClosed !== true ||
        result.terminal.stdoutClosed !== true ||
        result.terminal.stderrClosed !== true ||
        result.terminal.descriptorsClosed !== true
      ) {
        if (copyTransition !== null) {
          unknownMutationParents.add(copyTransition.parent);
          if (copyTransition.nestedParent !== null) {
            unknownMutationParents.add(copyTransition.nestedParent);
          }
        }
        return { settlement: "unknown", terminal: null, value: null };
      }
      if (
        copyTransition !== null &&
        result.processSettlement.successful !== true
      ) {
        unknownMutationParents.add(copyTransition.parent);
        if (copyTransition.nestedParent !== null) {
          unknownMutationParents.add(copyTransition.nestedParent);
        }
        return { settlement: "unknown", terminal: null, value: null };
      }
      if (copyTransition !== null) {
        if (copyTransition.nestedParent === null) {
          await completeHeldProductionDirectoryTransition(
            copyTransition.parent,
            copyTransition.before,
            copyTransition.expectedBefore,
            copyTransition.expectedAfter,
            0,
            copyTransition.directoryOperation,
          );
        } else {
          await completeHeldProductionNestedMarkerTransition(
            copyTransition.parent,
            copyTransition.before,
            copyTransition.expectedBefore,
            copyTransition.expectedAfter,
            copyTransition.nestedParent,
            copyTransition.nestedBefore,
            copyTransition.nestedExpected,
          );
        }
      }
      let value;
      if (ABSENCE_STEPS.includes(row.step)) value = { absent: true };
      else if (result.processSettlement.successful !== true) value = null;
      else if (row.step === "volume-create") {
        value = { name: result.stdout.trim() };
      } else if (row.step === "initializer-create") {
        value = { containerName: M2A_TRANSFER.initializerContainer };
      } else if (row.step === "measurement-create") {
        value = { containerName: M2A_TRANSFER.measurementContainer };
      } else if (row.step === "initializer-inspect-pre") {
        const inspection = projectRuntimeInspection(
          JSON.parse(result.stdout),
          "initializer",
          imageId,
        );
        value = {
          state: inspection.state.Status,
          projection: inspection.projection,
        };
      } else if (row.step === "measurement-inspect-pre") {
        const inspection = projectRuntimeInspection(
          JSON.parse(result.stdout),
          "measurement",
          imageId,
        );
        value = {
          state: inspection.state.Status,
          projection: inspection.projection,
        };
      } else if (
        row.step === "initializer-start" ||
        row.step === "measurement-start"
      ) {
        value = { started: true };
      } else if (row.step.endsWith("-wait")) {
        value = { exitCode: Number.parseInt(result.stdout.trim(), 10) };
      } else if (row.step.endsWith("-inspect-final")) {
        const raw = JSON.parse(result.stdout)[0]?.State;
        value = { state: raw?.Status, exitCode: raw?.ExitCode };
      } else if (row.step.startsWith("copy-")) {
        const destination = copyTransition.destination;
        const target = path.join(resultRoot, destination);
        const file = await readProductionFile(target, 4 * 1024 * 1024);
        const transferRelative = copyTransition.transferRelative;
        if (transferRelative === M2A_TRANSFER.markerPath) {
          markerFilePresent = true;
        } else transferEntries.add(copyTransition.topLevel);
        await exactProductionDirectoryInventory(
          copyTransition.parent,
          copyTransition.expectedAfter,
        );
        value = {
          bytes: file.bytes,
          metadata: {
            path: destination,
            type: "regular",
            mode: Number(file.stat.mode & 0o7777n),
            uid: Number(file.stat.uid),
            gid: Number(file.stat.gid),
            nlink: Number(file.stat.nlink),
            size: file.bytes.length,
            sha256: digest(file.bytes),
            parentIdentityStable: true,
            fileIdentityStable: true,
          },
        };
      } else value = { completed: true };
      await validateHeldRuntimeState();
      return { settlement: "settled", terminal: result.terminal, value };
    },
    async settleValidation(step, valueSha256) {
      actions.push(step);
      await validateHeldRuntimeState();
      return validationSettlementResult(valueSha256);
    },
    async prepareMarkerParent() {
      actions.push("prepare-marker-parent");
      await validateHeldRuntimeState();
      const markerParent = path.join(resultRoot, "transfer/probe-output");
      await transitionHeldProductionDirectory(
        transferIdentity,
        transferInventory(),
        transferInventory("probe-output"),
        1,
        { kind: "create-probe-output" },
        async () =>
          await mkdir(markerParent, { recursive: false, mode: 0o700 }),
      );
      await transferIdentity.handle.sync();
      transferEntries.add("probe-output");
      markerParentIdentity = await holdProductionDirectory(
        markerParent,
        0o700,
        ownedDirectories,
        2n,
      );
      await validateHeldRuntimeState();
      return successfulPublicationResult();
    },
    async publishFinal(bytes) {
      actions.push("publish-final");
      return await publishAttempt(bytes);
    },
    snapshotActions() {
      return [...actions];
    },
    async settleOwnership() {
      let invalid = false;
      try {
        if (unknownMutationParents.size === 0) {
          await validateHeldRuntimeState();
        } else {
          await validateHeldRuntimeAncestors();
        }
      } catch {
        invalid = true;
      }
      try {
        await settleHeldProductionDirectories(
          ownedDirectories,
          unknownMutationParents,
        );
      } catch {
        invalid = true;
      }
      if (invalid) fail("M2A_RUNTIME_DIRECTORY_SETTLEMENT_UNKNOWN");
    },
  };
  return freeze(backend);
}

function createFixedRuntimeAuthority() {
  const authority = {
    async execute() {
      const imageId = M2A_PRODUCTION.reviewedLocalImageId;
      const backend = await createFixedRuntimeBackend(imageId);
      try {
        return await runM2aProductionTransactionWithBackend(backend, imageId, {
          uid: process.getuid(),
          gid: process.getgid(),
        });
      } finally {
        await backend.settleOwnership();
      }
    },
  };
  fixedRuntimeAuthorityBrand.add(authority);
  return freeze(authority);
}

export async function runFixedM2aImageBuildEntry() {
  if (
    M2A_PRODUCTION.buildExecutionApproved !== true ||
    M2A_PRODUCTION.reviewedConstructionManifestSha256 === null ||
    M2A_PRODUCTION.reviewedContextAggregate === null ||
    M2A_PRODUCTION.reviewedNpmAcquisitionSha256 === null ||
    M2A_PRODUCTION.reviewedConstructorToolchainSha256 === null
  ) {
    fail("M2A_IMAGE_BUILD_NOT_APPROVED");
  }
  const authority = createFixedImageBuildAuthority();
  if (!fixedImageBuildAuthorityBrand.has(authority)) {
    fail("M2A_IMAGE_BUILD_AUTHORITY_INVALID");
  }
  return await authority.execute();
}

export async function runFixedM2aExecutionEntry() {
  if (
    M2A_PRODUCTION.runtimeExecutionApproved !== true ||
    M2A_PRODUCTION.reviewedLocalImageId === null
  ) {
    fail("M2A_RUNTIME_EXECUTION_NOT_APPROVED");
  }
  const authority = createFixedRuntimeAuthority();
  if (!fixedRuntimeAuthorityBrand.has(authority)) {
    fail("M2A_RUNTIME_AUTHORITY_INVALID");
  }
  return await authority.execute();
}
