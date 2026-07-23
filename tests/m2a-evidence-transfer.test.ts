import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import {
  M2A_TRANSFER,
  createFakeM2aTransferBackend,
  createFixedDockerPlan,
  runM2aTransferStateMachineForTest,
  sha256,
  validateAttemptBytes,
  validateCandidateTransfer,
  validateCompletionArtifacts,
  validateCompletionBytes,
  validateFixedDockerPlan,
  validateImageBinding,
  validateInspectionProjection,
  validateMarkerBytes,
  validateProducerSegmentBytes,
  validateTransferredFile,
} from "../experiments/npm12-install/scripts/m2a-transfer-lib.mjs";
import {
  M2A_CONSTRUCTION,
  createFakeM2aConstructionBackend,
  createFakeM2aProcessTrace,
  createDeterministicFixtureArchive,
  createFixedConstructionPlan,
  createSyntheticNpmArchiveForTest,
  runM2aConstructionForTest,
  runM2aProcessSettlementTraceForTest,
  validateConstructionContextInputs,
  validateConstructionManifestBytes,
  validateConstructorToolchain,
  validateFixedConstructionPlan,
  validateNpmAcquisition,
} from "../experiments/npm12-install/scripts/m2a-transfer-construction.mjs";
import {
  M2A_PRODUCTION,
  createFakeM2aHeldDirectoryTrace,
  createFakeM2aImageBuildBackend,
  createFakeM2aProductionBackend,
  createFixedImageBuildPlan,
  createFixedProductionExecutionPlan,
  createImageBindingBytesForTest,
  createPessimisticAttemptCheckpointBytes,
  runM2aImageBuildForTest,
  runM2aHeldDirectoryTraceForTest,
  runM2aProductionTransactionForTest,
  validateFixedImageBuildPlan,
  validateFixedProductionExecutionPlan,
  validateImageBindingBytes,
  validateImageBuildObservation,
} from "../experiments/npm12-install/scripts/m2a-transfer-production.mjs";
import type {
  FakeM2aHeldChildIdentity,
  FakeM2aHeldDirectorySnapshot,
} from "../experiments/npm12-install/scripts/m2a-transfer-production.mjs";
import {
  M2A_INPUTS,
  classifyToolchainAttemptCommitForTest,
  createAcquisitionReceiptBytes,
  createFakeM2aNpmInputBackend,
  createFakeM2aToolchainInputBackend,
  createFixedNpmRequestPlan,
  createToolchainAttemptBytes,
  createToolchainReceiptBytes,
  runM2aNpmAcquisitionForTest,
  runM2aToolchainCaptureForTest,
  validateAcquisitionReceiptBytes,
  validateDestinationGraph,
  validateFixedNpmRequestPlan,
  validateHeldGraphPair,
  validateNpmMetadataBytes,
  validateNpmResponseForTest,
  validateToolchainAttemptBytes,
  validateToolchainReceiptBytes,
} from "../experiments/npm12-install/scripts/m2a-transfer-inputs.mjs";

const execFileAsync = promisify(execFile);
const imageId = `sha256:${"a".repeat(64)}`;

function expectedPlan() {
  const mount = `type=volume,source=${M2A_TRANSFER.transferVolume},destination=${M2A_TRANSFER.containerRunRoot}`;
  const hostRoot = "experiments/npm12-install/.work/m2a-transfer-20260721-01";
  return {
    executable: "/usr/bin/docker",
    shell: false,
    combinedOutputLimitBytes: 16_384,
    commandDeadlineMs: 30_000,
    initializerWaitDeadlineMs: 30_000,
    measurementAbsoluteDeadlineMs: 180_000,
    environment: {
      DOCKER_CONFIG: `${hostRoot}/docker-config`,
      HOME: `${hostRoot}/home`,
      PATH: "/usr/bin:/bin",
    },
    inheritEnvironment: false,
    forbiddenInheritedEnvironmentPrefixes: ["DOCKER_"],
    hostLayoutPolicy: {
      repositoryRelativeWorkRoot: hostRoot,
      resolveInsideRepository: true,
      directoryCreation: "exclusive",
      directories: [
        {
          environmentKey: "DOCKER_CONFIG",
          path: `${hostRoot}/docker-config`,
          type: "directory",
          mode: 0o700,
          owner: "effective-user",
          symlink: false,
          empty: true,
        },
        {
          environmentKey: "HOME",
          path: `${hostRoot}/home`,
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
  };
}

function canonical(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

function validFlow() {
  return [
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
      lockAfter: `sha256:${"b".repeat(64)}`,
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
      lockBefore: `sha256:${"b".repeat(64)}`,
      lockAfter: `sha256:${"b".repeat(64)}`,
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
      lockBefore: `sha256:${"b".repeat(64)}`,
      lockAfter: `sha256:${"b".repeat(64)}`,
    },
  ];
}

function validCompletion(
  outputs: Array<Record<string, unknown>> = [
    {
      path: M2A_TRANSFER.segmentPath,
      size: 12,
      sha256: `sha256:${"f".repeat(64)}`,
      mode: 0o600,
    },
  ],
) {
  return {
    schemaVersion: "m2a-transfer-completion/v1",
    generation: M2A_TRANSFER.generation,
    expectedRevision: M2A_TRANSFER.expectedRevision,
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
    toolchain: { node: M2A_TRANSFER.nodeVersion, npm: M2A_TRANSFER.npmVersion },
    npmFlow: validFlow(),
    runnerSettlement: {
      npmChildClosed: true,
      loopbackClosed: true,
      prePublicationDescriptorsClosed: true,
    },
    outputInventory: outputs,
    status: "complete",
    issue: null,
  };
}

function validAttempt() {
  return {
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
    markerTransfer: "valid",
    issues: [] as Array<{ code: string; step: string }>,
    evidenceReview: "not-performed",
  };
}

function commonEvent(eventKind: string, producerSequence: number) {
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

function validSegmentAndMarker() {
  const marker = canonical({
    schemaVersion: "probe-marker/v1",
    attemptId: "npm-lifecycle-attempt-file-write",
    runId: M2A_TRANSFER.runId,
    scenarioId: M2A_TRANSFER.scenarioId,
  });
  const attempts = [
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
      ...commonEvent("route-invocation", 0),
      routeInvocationId: "npm-lifecycle-invocation",
      invocationKind: "lifecycle-hook",
      logicalUnitId: "npm-install-lifecycle",
    },
    ...attempts.map(
      ([attemptId, attemptType, targetId, details, beforeHash], index) => ({
        ...commonEvent("capability-attempt", index + 1),
        attemptId,
        attemptType,
        targetId,
        beforeHash,
        afterHash:
          attemptId === "npm-lifecycle-attempt-file-write"
            ? sha256(marker)
            : null,
        details,
      }),
    ),
  ];
  return { segment: events.map((event) => canonical(event)).join(""), marker };
}

function validSegmentWithoutMarker() {
  const fixture = validSegmentAndMarker();
  const events = fixture.segment
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  const writeEvent = events[4]!;
  writeEvent.outcome = "failure";
  writeEvent.normalizedErrorCode = "PROBE_WRITE_FAILED";
  writeEvent.afterHash = null;
  return events.map((event) => canonical(event)).join("");
}

describe("M2-A fixed transfer identities and plan", () => {
  it("pins the fresh tuple and keeps runtime execution unapproved", () => {
    expect(M2A_TRANSFER).toMatchObject({
      generation: "20260721-01",
      runId: "m2a-npm-lifecycle-20260721000000000000000000000001",
      sourceAggregate:
        "sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04",
      runtimeExecutionApproved: false,
      evidenceReview: "not-performed",
    });
  });

  it("constructs and validates every exact command and CLI environment record", () => {
    const plan = createFixedDockerPlan(imageId);
    expect(plan).toEqual(expectedPlan());
    expect(validateFixedDockerPlan(structuredClone(plan), imageId)).toEqual(
      expectedPlan(),
    );
    const serialized = JSON.stringify(plan);
    expect(serialized).toContain("type=volume");
    expect(serialized).toContain("--network");
    expect(serialized).toContain("none");
    expect(serialized).not.toContain("type=bind");
    expect(serialized).not.toContain("docker.sock");
    expect(serialized).not.toContain("--volume");
    expect(() => createFixedDockerPlan("latest")).toThrow(
      "M2A_IMAGE_ID_INVALID",
    );

    const mutations: Array<(value: ReturnType<typeof expectedPlan>) => void> = [
      (value) => value.volumeAbsence.push("extra"),
      (value) => (value.initializerInspectFinal = ["container", "ls"]),
      (value) => (value.measurementWait = ["wait", "other"]),
      (value) => (value.completionCopy[0] = "logs"),
      (value) => (value.environment.PATH = "/usr/local/bin"),
      (value) =>
        Object.assign(value.environment, { DOCKER_HOST: "unix:///forbidden" }),
      (value) => (value.inheritEnvironment = true),
      (value) =>
        (value.hostLayoutPolicy.repositoryRelativeWorkRoot = "../outside"),
      (value) => (value.hostLayoutPolicy.directories[0]!.mode = 0o755),
      (value) => (value.hostLayoutPolicy.directories[0]!.owner = "other"),
      (value) => (value.hostLayoutPolicy.directories[0]!.symlink = true),
      (value) => (value.hostLayoutPolicy.directories[0]!.empty = false),
      (value) => (value.hostLayoutPolicy.directories[1]!.type = "regular-file"),
    ];
    for (const mutate of mutations) {
      const candidate = expectedPlan();
      mutate(candidate);
      expect(() => validateFixedDockerPlan(candidate, imageId)).toThrow(
        "M2A_DOCKER_PLAN_INVALID",
      );
    }
  });

  it("validates recursively exact own plan data without invoking getters", () => {
    const expectInvalid = (candidate: unknown) =>
      expect(() => validateFixedDockerPlan(candidate, imageId)).toThrow(
        "M2A_DOCKER_PLAN_INVALID",
      );

    for (const inherited of [
      { DOCKER_HOST: "unix:///inherited-forbidden" },
      { INHERITED_NOTE: "not-part-of-the-plan" },
    ]) {
      const candidate = expectedPlan();
      candidate.environment = Object.assign(
        Object.create(inherited),
        candidate.environment,
      );
      expectInvalid(candidate);
    }

    for (const prototype of [null, { custom: true }]) {
      const candidate = expectedPlan();
      Object.setPrototypeOf(candidate.environment, prototype);
      expectInvalid(candidate);
    }
    const customArrayPrototype = expectedPlan();
    Object.setPrototypeOf(customArrayPrototype.measurementWait, []);
    expectInvalid(customArrayPrototype);

    let getterCalls = 0;
    for (const installAccessor of [
      (candidate: ReturnType<typeof expectedPlan>) =>
        Object.defineProperty(candidate.environment, "PATH", {
          configurable: true,
          enumerable: true,
          get() {
            getterCalls += 1;
            return "/usr/bin:/bin";
          },
        }),
      (candidate: ReturnType<typeof expectedPlan>) =>
        Object.defineProperty(candidate.measurementWait, "0", {
          configurable: true,
          enumerable: true,
          get() {
            getterCalls += 1;
            return "wait";
          },
        }),
      (candidate: ReturnType<typeof expectedPlan>) =>
        Object.defineProperty(
          candidate.hostLayoutPolicy.directories[0]!,
          "mode",
          {
            configurable: true,
            enumerable: true,
            get() {
              getterCalls += 1;
              return 0o700;
            },
          },
        ),
      (candidate: ReturnType<typeof expectedPlan>) =>
        Object.defineProperty(candidate.hostLayoutPolicy.directories, "0", {
          configurable: true,
          enumerable: true,
          get() {
            getterCalls += 1;
            return expectedPlan().hostLayoutPolicy.directories[0];
          },
        }),
    ]) {
      const candidate = expectedPlan();
      installAccessor(candidate);
      expectInvalid(candidate);
    }
    expect(getterCalls).toBe(0);

    const symbolKey = expectedPlan();
    Object.defineProperty(symbolKey.environment, Symbol("extra"), {
      value: "forbidden",
    });
    expectInvalid(symbolKey);

    const revokedProxy = Proxy.revocable(expectedPlan().environment, {});
    revokedProxy.revoke();
    const proxied = expectedPlan();
    proxied.environment = revokedProxy.proxy;
    expectInvalid(proxied);

    const sparseArray = expectedPlan();
    Reflect.deleteProperty(sparseArray.measurementCreate, "1");
    expectInvalid(sparseArray);

    const extraArrayKey = expectedPlan();
    Object.defineProperty(extraArrayKey.measurementWait, "extra", {
      value: "forbidden",
    });
    expectInvalid(extraArrayKey);

    const reorderedKeys = expectedPlan();
    const dockerConfig = reorderedKeys.environment.DOCKER_CONFIG;
    Reflect.deleteProperty(reorderedKeys.environment, "DOCKER_CONFIG");
    reorderedKeys.environment.DOCKER_CONFIG = dockerConfig;
    expectInvalid(reorderedKeys);

    for (const replacement of [
      undefined,
      Number.NaN,
      Infinity,
      1n,
      Symbol("x"),
    ]) {
      const candidate = expectedPlan();
      (candidate.environment as Record<string, unknown>).PATH = replacement;
      expectInvalid(candidate);
    }

    const candidate = expectedPlan();
    const validated = validateFixedDockerPlan(candidate, imageId);
    expect(validated).not.toBe(candidate);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated.environment)).toBe(true);
    expect(Object.isFrozen(validated.measurementCreate)).toBe(true);
    expect(Object.isFrozen(validated.hostLayoutPolicy)).toBe(true);
  });

  it("rejects substituted image bindings", () => {
    const binding = {
      imageTag: M2A_TRANSFER.candidateImageTag,
      imageId,
      sourceAggregate: M2A_TRANSFER.sourceAggregate,
      executionApproved: false,
    };
    expect(validateImageBinding(binding, imageId)).toMatchObject(binding);
    expect(() =>
      validateImageBinding({ ...binding, imageTag: "other:latest" }, imageId),
    ).toThrow("M2A_IMAGE_BINDING_INVALID");
    expect(() =>
      validateImageBinding(binding, `sha256:${"c".repeat(64)}`),
    ).toThrow("M2A_IMAGE_BINDING_INVALID");
  });
});

describe("M2-A inspection and copied-file validation", () => {
  it("accepts the exact measurement projection and rejects bind/policy drift", () => {
    const projection = {
      containerName: M2A_TRANSFER.measurementContainer,
      imageId,
      user: "1000:1000",
      networkMode: "none",
      readOnlyRootfs: true,
      privileged: false,
      capDrop: ["ALL"],
      capAdd: [],
      securityOpt: ["no-new-privileges"],
      pidsLimit: 64,
      memoryBytes: 536_870_912,
      nanoCpus: 1_000_000_000,
      tmpfs: [
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
      entry: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
      environmentNames: [],
    };
    expect(
      validateInspectionProjection(projection, "measurement", imageId),
    ).toMatchObject(projection);
    expect(() =>
      validateInspectionProjection(
        { ...projection, networkMode: "bridge" },
        "measurement",
        imageId,
      ),
    ).toThrow("M2A_INSPECTION_INVALID");
    expect(() =>
      validateInspectionProjection(
        { ...projection, mounts: [{ type: "bind" }] },
        "measurement",
        imageId,
      ),
    ).toThrow("M2A_INSPECTION_INVALID");
    expect(() =>
      validateInspectionProjection(
        { ...projection, pidsLimit: 65 },
        "measurement",
        imageId,
      ),
    ).toThrow("M2A_INSPECTION_INVALID");
  });

  it("rejects type, mode, owner, link, size, and digest drift", () => {
    const expected = {
      path: "transfer/transfer-completion.json",
      mode: 0o444,
      size: 12,
      sha256: `sha256:${"d".repeat(64)}`,
    };
    const file = {
      ...expected,
      type: "regular",
      uid: 1000,
      gid: 1000,
      nlink: 1,
    };
    const ordered = {
      path: file.path,
      type: file.type,
      mode: file.mode,
      uid: file.uid,
      gid: file.gid,
      nlink: file.nlink,
      size: file.size,
      sha256: file.sha256,
      parentIdentityStable: true,
      fileIdentityStable: true,
    };
    expect(
      validateTransferredFile(ordered, expected, { uid: 1000, gid: 1000 }),
    ).toMatchObject(ordered);
    for (const mutation of [
      { type: "symlink" },
      { mode: 0o644 },
      { mode: 0o4600 },
      { uid: 0 },
      { gid: 0 },
      { nlink: 2 },
      { size: 11 },
      { sha256: `sha256:${"e".repeat(64)}` },
      { parentIdentityStable: false },
      { fileIdentityStable: false },
    ]) {
      expect(() =>
        validateTransferredFile({ ...ordered, ...mutation }, expected, {
          uid: 1000,
          gid: 1000,
        }),
      ).toThrow("M2A_TRANSFER_FILE_INVALID");
    }
  });
});

describe("M2-A canonical completion and producer validation", () => {
  it("accepts canonical completion and rejects torn, reordered, and extra bytes", () => {
    const bytes = canonical(validCompletion());
    expect(validateCompletionBytes(bytes).completion).toMatchObject({
      status: "complete",
      issue: null,
    });
    expect(() => validateCompletionBytes(bytes.slice(0, -1))).toThrow(
      "M2A_COMPLETION_INVALID",
    );
    const reordered = canonical({
      ...validCompletion(),
      schemaVersion: undefined,
    }).replace('"schemaVersion":undefined,', "");
    expect(() => validateCompletionBytes(reordered)).toThrow(
      "M2A_COMPLETION_INVALID",
    );
    expect(() =>
      validateCompletionBytes(
        canonical({ ...validCompletion(), rawError: "/home/example/secret" }),
      ),
    ).toThrow("M2A_COMPLETION_INVALID");
  });

  it("requires exact successful child terminals for every complete npm step", () => {
    const deviations: Array<[string, unknown]> = [
      ["exitCode", null],
      ["exitCode", 1],
      ["signal", "SIGTERM"],
      ["timedOut", true],
      ["stdoutTruncated", true],
      ["stderrTruncated", true],
    ];
    const inconclusiveIssues = [
      "M2A_NPM_INSTALL_FAILED",
      "M2A_APPROVAL_FAILED",
      "M2A_REBUILD_FAILED",
    ];
    for (const stepIndex of [0, 1, 2] as const) {
      for (const [key, value] of deviations) {
        const candidate = structuredClone(validCompletion()) as Record<
          string,
          unknown
        >;
        const flow = candidate.npmFlow as Array<Record<string, unknown>>;
        flow[stepIndex]![key] = value;
        expect(() => validateCompletionBytes(canonical(candidate))).toThrow(
          "M2A_COMPLETION_INVALID",
        );

        candidate.status = "inconclusive";
        candidate.issue = inconclusiveIssues[stepIndex]!;
        expect(
          validateCompletionBytes(canonical(candidate)).completion,
        ).toMatchObject({
          status: "inconclusive",
          issue: inconclusiveIssues[stepIndex]!,
        });
      }
    }
  });

  it("rejects contradictory approval and lock state at all three npm steps", () => {
    const mutations: Array<(flow: Array<Record<string, unknown>>) => void> = [
      (flow) => (flow[0]!.approval = "present"),
      (flow) => (flow[1]!.approval = "absent"),
      (flow) => (flow[2]!.approval = "absent"),
      (flow) => (flow[0]!.lockBefore = `sha256:${"c".repeat(64)}`),
      (flow) => (flow[1]!.lockBefore = `sha256:${"c".repeat(64)}`),
      (flow) => (flow[2]!.lockAfter = `sha256:${"c".repeat(64)}`),
    ];
    for (const mutate of mutations) {
      const candidate = structuredClone(validCompletion()) as Record<
        string,
        unknown
      >;
      mutate(candidate.npmFlow as Array<Record<string, unknown>>);
      expect(() => validateCompletionBytes(canonical(candidate))).toThrow(
        "M2A_COMPLETION_INVALID",
      );
    }
  });

  it("accepts exactly seven ordered canonical events and the matching marker", () => {
    const fixture = validSegmentAndMarker();
    const segment = validateProducerSegmentBytes(fixture.segment);
    expect(segment.events).toHaveLength(7);
    expect(validateMarkerBytes(fixture.marker, segment.events).marker).toEqual({
      schemaVersion: "probe-marker/v1",
      attemptId: "npm-lifecycle-attempt-file-write",
      runId: M2A_TRANSFER.runId,
      scenarioId: M2A_TRANSFER.scenarioId,
    });
    const lines = fixture.segment.trimEnd().split("\n");
    expect(() =>
      validateProducerSegmentBytes(
        `${lines[1]}\n${lines[0]}\n${lines.slice(2).join("\n")}\n`,
      ),
    ).toThrow("M2A_SEGMENT_INVALID");
    expect(() =>
      validateProducerSegmentBytes(`${fixture.segment}${lines[0]}\n`),
    ).toThrow("M2A_SEGMENT_INVALID");
    expect(() =>
      validateMarkerBytes(
        fixture.marker.replace(RUN_ID_TOKEN, "other"),
        segment.events,
      ),
    ).toThrow("M2A_MARKER_INVALID");
  });

  it("cross-validates completion, segment, and conditional marker bytes", () => {
    const fixture = validSegmentAndMarker();
    const completion = validCompletion([
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(fixture.segment),
        sha256: sha256(fixture.segment),
        mode: 0o600,
      },
      {
        path: M2A_TRANSFER.markerPath,
        size: Buffer.byteLength(fixture.marker),
        sha256: sha256(fixture.marker),
        mode: 0o600,
      },
    ]);
    expect(
      validateCompletionArtifacts(
        canonical(completion),
        fixture.segment,
        fixture.marker,
      ),
    ).toMatchObject({
      marker: { marker: { schemaVersion: "probe-marker/v1" } },
    });
    expect(() =>
      validateCompletionArtifacts(canonical(completion), fixture.segment, null),
    ).toThrow("M2A_ARTIFACT_SET_INVALID");
    expect(() =>
      validateCompletionArtifacts(
        canonical(completion),
        `${fixture.segment} `,
        fixture.marker,
      ),
    ).toThrow();
  });

  it("accepts only exact complete and rebuild-failure combined candidates", () => {
    const markerFixture = validSegmentAndMarker();
    const markerCompletion = validCompletion([
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(markerFixture.segment),
        sha256: sha256(markerFixture.segment),
        mode: 0o600,
      },
      {
        path: M2A_TRANSFER.markerPath,
        size: Buffer.byteLength(markerFixture.marker),
        sha256: sha256(markerFixture.marker),
        mode: 0o600,
      },
    ]);
    const markerCandidate = validateCandidateTransfer(
      canonical(validAttempt()),
      imageId,
      canonical(markerCompletion),
      markerFixture.segment,
      markerFixture.marker,
    );
    expect(markerCandidate).toMatchObject({
      attempt: { issues: [] },
      completion: { status: "complete", issue: null },
      segment: { sha256: sha256(markerFixture.segment) },
      marker: { schemaVersion: "probe-marker/v1" },
    });
    expect(Object.isFrozen(markerCandidate)).toBe(true);
    expect(Object.isFrozen(markerCandidate.attempt)).toBe(true);
    expect(Object.isFrozen(markerCandidate.completion)).toBe(true);
    expect(Object.isFrozen(markerCandidate.segment!)).toBe(true);
    expect(
      Object.isFrozen(
        (markerCandidate.segment as { events: readonly unknown[] }).events,
      ),
    ).toBe(true);
    expect(Object.isFrozen(markerCandidate.marker!)).toBe(true);

    const segmentWithoutMarker = validSegmentWithoutMarker();
    const noMarkerCompletion = validCompletion([
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(segmentWithoutMarker),
        sha256: sha256(segmentWithoutMarker),
        mode: 0o600,
      },
    ]);
    const noMarkerAttempt = {
      ...validAttempt(),
      markerTransfer: "not-attempted",
    };
    expect(
      validateCandidateTransfer(
        canonical(noMarkerAttempt),
        imageId,
        canonical(noMarkerCompletion),
        segmentWithoutMarker,
        null,
      ),
    ).toMatchObject({ marker: null, completion: { status: "complete" } });

    const rebuildCompletion = structuredClone(markerCompletion) as Record<
      string,
      unknown
    >;
    rebuildCompletion.status = "inconclusive";
    rebuildCompletion.issue = "M2A_REBUILD_FAILED";
    const rebuildFlow = rebuildCompletion.npmFlow as Array<
      Record<string, unknown>
    >;
    rebuildFlow[2]!.exitCode = 1;
    const rebuildAttempt = {
      ...validAttempt(),
      issues: [{ code: "M2A_REBUILD_FAILED", step: "validate-completion" }],
    };
    expect(
      validateCandidateTransfer(
        canonical(rebuildAttempt),
        imageId,
        canonical(rebuildCompletion),
        markerFixture.segment,
        markerFixture.marker,
      ),
    ).toMatchObject({
      attempt: { issues: rebuildAttempt.issues },
      completion: {
        status: "inconclusive",
        issue: "M2A_REBUILD_FAILED",
      },
    });

    const noMarkerRebuildCompletion = structuredClone(
      noMarkerCompletion,
    ) as Record<string, unknown>;
    noMarkerRebuildCompletion.status = "inconclusive";
    noMarkerRebuildCompletion.issue = "M2A_REBUILD_FAILED";
    const noMarkerRebuildFlow = noMarkerRebuildCompletion.npmFlow as Array<
      Record<string, unknown>
    >;
    noMarkerRebuildFlow[2]!.exitCode = 1;
    expect(
      validateCandidateTransfer(
        canonical({ ...rebuildAttempt, markerTransfer: "not-attempted" }),
        imageId,
        canonical(noMarkerRebuildCompletion),
        segmentWithoutMarker,
        null,
      ),
    ).toMatchObject({ marker: null, completion: { status: "inconclusive" } });
  });

  it("requires truthful settlement, npm prerequisites, and a real rebuild failure", () => {
    const fixture = validSegmentAndMarker();
    const outputs = [
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(fixture.segment),
        sha256: sha256(fixture.segment),
        mode: 0o600,
      },
      {
        path: M2A_TRANSFER.markerPath,
        size: Buffer.byteLength(fixture.marker),
        sha256: sha256(fixture.marker),
        mode: 0o600,
      },
    ];
    const failureCandidate = () => {
      const completion = validCompletion(outputs) as Record<string, unknown>;
      completion.status = "inconclusive";
      completion.issue = "M2A_REBUILD_FAILED";
      const flow = completion.npmFlow as Array<Record<string, unknown>>;
      flow[2]!.exitCode = 1;
      return {
        attempt: {
          ...validAttempt(),
          issues: [{ code: "M2A_REBUILD_FAILED", step: "validate-completion" }],
        },
        completion,
      };
    };
    const expectCorrelationRejection = (
      mutate: (candidate: ReturnType<typeof failureCandidate>) => void,
    ) => {
      const candidate = failureCandidate();
      mutate(candidate);
      expect(
        validateCompletionBytes(canonical(candidate.completion)).completion,
      ).toMatchObject({
        status: "inconclusive",
        issue: "M2A_REBUILD_FAILED",
      });
      expect(() =>
        validateCandidateTransfer(
          canonical(candidate.attempt),
          imageId,
          canonical(candidate.completion),
          fixture.segment,
          fixture.marker,
        ),
      ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");
    };

    for (const key of [
      "npmChildClosed",
      "loopbackClosed",
      "prePublicationDescriptorsClosed",
    ]) {
      expectCorrelationRejection(({ completion }) => {
        (completion.runnerSettlement as Record<string, unknown>)[key] = false;
      });
    }

    const prerequisiteMutations: Array<
      (flow: Array<Record<string, unknown>>) => void
    > = [];
    for (const stepIndex of [0, 1]) {
      prerequisiteMutations.push(
        (flow) => (flow[stepIndex]!.exitCode = null),
        (flow) => (flow[stepIndex]!.exitCode = 1),
        (flow) => (flow[stepIndex]!.signal = "SIGTERM"),
        (flow) => (flow[stepIndex]!.timedOut = true),
        (flow) => (flow[stepIndex]!.stdoutTruncated = true),
        (flow) => (flow[stepIndex]!.stderrTruncated = true),
      );
    }
    prerequisiteMutations.push(
      (flow) => (flow[0]!.approval = "not-checked"),
      (flow) => (flow[1]!.approval = "not-checked"),
      (flow) => (flow[2]!.approval = "not-checked"),
      (flow) => (flow[0]!.lockBefore = `sha256:${"c".repeat(64)}`),
      (flow) => {
        flow[0]!.lockAfter = null;
        flow[1]!.lockBefore = null;
        flow[1]!.lockAfter = null;
        flow[2]!.lockBefore = null;
        flow[2]!.lockAfter = null;
      },
    );
    for (const mutateFlow of prerequisiteMutations) {
      expectCorrelationRejection(({ completion }) => {
        mutateFlow(completion.npmFlow as Array<Record<string, unknown>>);
      });
    }

    const rebuildMutations: Array<(rebuild: Record<string, unknown>) => void> =
      [
        (rebuild) => (rebuild.exitCode = null),
        (rebuild) => (rebuild.exitCode = 0),
        (rebuild) => (rebuild.signal = "SIGTERM"),
        (rebuild) => (rebuild.timedOut = true),
        (rebuild) => (rebuild.stdoutTruncated = true),
        (rebuild) => (rebuild.stderrTruncated = true),
      ];
    for (const mutateRebuild of rebuildMutations) {
      expectCorrelationRejection(({ completion }) => {
        const flow = completion.npmFlow as Array<Record<string, unknown>>;
        mutateRebuild(flow[2]!);
      });
    }

    for (const segmentTransfer of ["not-attempted", "invalid", "unknown"]) {
      const candidate = failureCandidate();
      candidate.attempt.segmentTransfer = segmentTransfer;
      candidate.attempt.markerTransfer = "not-attempted";
      expect(() =>
        validateCandidateTransfer(
          canonical(candidate.attempt),
          imageId,
          canonical(candidate.completion),
          fixture.segment,
          fixture.marker,
        ),
      ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");
    }

    const missingSegment = failureCandidate();
    expect(() =>
      validateCandidateTransfer(
        canonical(missingSegment.attempt),
        imageId,
        canonical(missingSegment.completion),
        null,
        fixture.marker,
      ),
    ).toThrow("M2A_ARTIFACT_SET_INVALID");
    const invalidSegment = failureCandidate();
    expect(() =>
      validateCandidateTransfer(
        canonical(invalidSegment.attempt),
        imageId,
        canonical(invalidSegment.completion),
        `${fixture.segment} `,
        fixture.marker,
      ),
    ).toThrow("M2A_SEGMENT_INVALID");

    const unattemptedMarker = failureCandidate();
    unattemptedMarker.attempt.markerTransfer = "not-attempted";
    expect(() =>
      validateCandidateTransfer(
        canonical(unattemptedMarker.attempt),
        imageId,
        canonical(unattemptedMarker.completion),
        fixture.segment,
        fixture.marker,
      ),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");

    const segmentWithoutMarker = validSegmentWithoutMarker();
    const noMarkerCandidate = failureCandidate();
    noMarkerCandidate.completion.outputInventory = [
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(segmentWithoutMarker),
        sha256: sha256(segmentWithoutMarker),
        mode: 0o600,
      },
    ];
    noMarkerCandidate.attempt.markerTransfer = "valid";
    expect(() =>
      validateCandidateTransfer(
        canonical(noMarkerCandidate.attempt),
        imageId,
        canonical(noMarkerCandidate.completion),
        segmentWithoutMarker,
        null,
      ),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");
  });

  it("rejects inventory, transfer-state, issue, order, and byte contradictions", () => {
    const fixture = validSegmentAndMarker();
    const completion = validCompletion([
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(fixture.segment),
        sha256: sha256(fixture.segment),
        mode: 0o600,
      },
      {
        path: M2A_TRANSFER.markerPath,
        size: Buffer.byteLength(fixture.marker),
        sha256: sha256(fixture.marker),
        mode: 0o600,
      },
    ]);
    const validate = (
      attempt: Record<string, unknown>,
      completionBytes: string = canonical(completion),
      segment: string | null = fixture.segment,
      marker: string | null = fixture.marker,
    ) =>
      validateCandidateTransfer(
        canonical(attempt),
        imageId,
        completionBytes,
        segment,
        marker,
      );

    expect(() =>
      validate({ ...validAttempt(), markerTransfer: "not-attempted" }),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");

    const segmentWithoutMarker = validSegmentWithoutMarker();
    const noMarkerCompletion = validCompletion([
      {
        path: M2A_TRANSFER.segmentPath,
        size: Buffer.byteLength(segmentWithoutMarker),
        sha256: sha256(segmentWithoutMarker),
        mode: 0o600,
      },
    ]);
    expect(() =>
      validateCandidateTransfer(
        canonical(validAttempt()),
        imageId,
        canonical(noMarkerCompletion),
        segmentWithoutMarker,
        null,
      ),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");

    expect(() =>
      validate(validAttempt(), undefined, fixture.segment, null),
    ).toThrow("M2A_ARTIFACT_SET_INVALID");
    expect(() =>
      validate(validAttempt(), undefined, null, fixture.marker),
    ).toThrow("M2A_ARTIFACT_SET_INVALID");

    for (const attempt of [
      {
        ...validAttempt(),
        completionTransfer: "invalid",
        segmentTransfer: "not-attempted",
        markerTransfer: "not-attempted",
        issues: [
          {
            code: "M2A_COMPLETION_TRANSFER_INVALID",
            step: "validate-completion",
          },
        ],
      },
      {
        ...validAttempt(),
        completionTransfer: "unknown",
        segmentTransfer: "not-attempted",
        markerTransfer: "not-attempted",
        issues: [{ code: "M2A_SETTLEMENT_UNKNOWN", step: "copy-completion" }],
      },
      {
        ...validAttempt(),
        segmentTransfer: "invalid",
        markerTransfer: "not-attempted",
        issues: [
          {
            code: "M2A_SEGMENT_TRANSFER_INVALID",
            step: "validate-segment",
          },
        ],
      },
      {
        ...validAttempt(),
        segmentTransfer: "unknown",
        markerTransfer: "not-attempted",
        issues: [{ code: "M2A_SETTLEMENT_UNKNOWN", step: "copy-segment" }],
      },
      {
        ...validAttempt(),
        markerTransfer: "invalid",
        issues: [
          {
            code: "M2A_MARKER_TRANSFER_INVALID",
            step: "validate-marker",
          },
        ],
      },
      {
        ...validAttempt(),
        markerTransfer: "unknown",
        issues: [{ code: "M2A_SETTLEMENT_UNKNOWN", step: "copy-marker" }],
      },
    ]) {
      expect(() => validate(attempt)).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");
    }

    const mismatchedIssueCompletion = structuredClone(completion) as Record<
      string,
      unknown
    >;
    mismatchedIssueCompletion.status = "inconclusive";
    mismatchedIssueCompletion.issue = "M2A_OUTPUT_INVALID";
    mismatchedIssueCompletion.outputInventory = [];
    expect(() =>
      validate(
        {
          ...validAttempt(),
          segmentTransfer: "not-attempted",
          markerTransfer: "not-attempted",
          issues: [{ code: "M2A_OUTPUT_INVALID", step: "validate-completion" }],
        },
        canonical(mismatchedIssueCompletion),
        null,
        null,
      ),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");

    const rebuildWithoutOutputs = structuredClone(completion) as Record<
      string,
      unknown
    >;
    rebuildWithoutOutputs.status = "inconclusive";
    rebuildWithoutOutputs.issue = "M2A_REBUILD_FAILED";
    rebuildWithoutOutputs.outputInventory = [];
    const rebuildWithoutOutputsFlow = rebuildWithoutOutputs.npmFlow as Array<
      Record<string, unknown>
    >;
    rebuildWithoutOutputsFlow[2]!.exitCode = 1;
    expect(() =>
      validateCandidateTransfer(
        canonical({
          ...validAttempt(),
          segmentTransfer: "valid",
          markerTransfer: "not-attempted",
          issues: [{ code: "M2A_REBUILD_FAILED", step: "validate-completion" }],
        }),
        imageId,
        canonical(rebuildWithoutOutputs),
        null,
        null,
      ),
    ).toThrow("M2A_CANDIDATE_TRANSFER_INVALID");

    const reorderedAttempt = validAttempt();
    const { segmentTransfer, markerTransfer, ...otherAttemptFields } =
      reorderedAttempt;
    expect(() =>
      validateCandidateTransfer(
        canonical({
          ...otherAttemptFields,
          markerTransfer,
          segmentTransfer,
        }),
        imageId,
        canonical(completion),
        fixture.segment,
        fixture.marker,
      ),
    ).toThrow("M2A_ATTEMPT_INVALID");
    expect(() =>
      validateCandidateTransfer(
        canonical(validAttempt()),
        imageId,
        `${canonical(completion)} `,
        fixture.segment,
        fixture.marker,
      ),
    ).toThrow("M2A_COMPLETION_INVALID");
  });
});

const RUN_ID_TOKEN = M2A_TRANSFER.runId;

describe("M2-A fake-only state machine", () => {
  it("requires the fake brand and follows natural-exit ordering", async () => {
    await expect(
      runM2aTransferStateMachineForTest({
        async perform() {
          return { settlement: "settled", ok: true, value: null };
        },
      }),
    ).rejects.toThrow("M2A_FAKE_BACKEND_REQUIRED");
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend(),
    );
    expect(result).toMatchObject({
      status: "complete",
      retained: true,
      initializerSettlement: "natural-exited-zero",
      measurementSettlement: "natural-exited",
      naturalExit: true,
      completionTransfer: "valid",
      segmentTransfer: "valid",
      markerTransfer: "not-attempted",
      evidenceReview: "not-performed",
      executionApproved: false,
    });
    expect(result.performed).toEqual([
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
      "copy-segment",
      "validate-segment",
    ]);
  });

  it("stops on unknown settlement before transfer", async () => {
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "measurement-wait": {
          settlement: "unknown",
          ok: false,
          value: null,
        },
      }),
    );
    expect(result.status).toBe("inconclusive");
    expect(result.performed).not.toContain("copy-completion");
    expect(result.firstIssue).toEqual({
      code: "M2A_SETTLEMENT_UNKNOWN",
      step: "measurement-wait",
    });
  });

  it("preserves the first chronological failure and never retries", async () => {
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "initializer-start": {
          settlement: "settled",
          ok: false,
          value: { code: "M2A_INITIALIZER_START_FAILED" },
        },
        "initializer-wait": {
          settlement: "settled",
          ok: false,
          value: { code: "M2A_INITIALIZER_WAIT_FAILED" },
        },
      }),
    );
    expect(result.firstIssue).toEqual({
      code: "M2A_INITIALIZER_START_FAILED",
      step: "initializer-start",
    });
    expect(result.issues).toHaveLength(1);
    expect(
      (result.performed as string[]).filter(
        (step) => step === "initializer-start",
      ),
    ).toHaveLength(1);
  });

  it("classifies a naturally exited nonzero measurement as failure candidate", async () => {
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "measurement-wait": {
          settlement: "settled",
          ok: true,
          value: { exitCode: 1 },
        },
        "measurement-inspect-final": {
          settlement: "settled",
          ok: true,
          value: { state: "exited", exitCode: 1 },
        },
        "validate-completion": {
          settlement: "settled",
          ok: true,
          value: {
            status: "inconclusive",
            issue: "M2A_REBUILD_FAILED",
            outputs: [M2A_TRANSFER.segmentPath],
          },
        },
      }),
    );
    expect(result).toMatchObject({
      status: "failure",
      naturalExit: true,
      retained: true,
    });
  });

  it("copies only completion-listed outputs in fixed order", async () => {
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "validate-completion": {
          settlement: "settled",
          ok: true,
          value: {
            status: "complete",
            issue: null,
            outputs: [M2A_TRANSFER.segmentPath, M2A_TRANSFER.markerPath],
          },
        },
      }),
    );
    expect((result.performed as string[]).slice(-4)).toEqual([
      "copy-segment",
      "validate-segment",
      "copy-marker",
      "validate-marker",
    ]);
    const invalid = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "validate-completion": {
          settlement: "settled",
          ok: true,
          value: {
            status: "complete",
            issue: null,
            outputs: [M2A_TRANSFER.markerPath],
          },
        },
      }),
    );
    expect(invalid.status).toBe("inconclusive");
  });

  it("settles each conditional copy and preserves natural exit on transfer failure", async () => {
    const result = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "validate-completion": {
          settlement: "settled",
          ok: true,
          value: {
            status: "complete",
            issue: null,
            outputs: [M2A_TRANSFER.segmentPath],
          },
        },
        "copy-segment": {
          settlement: "unknown",
          ok: false,
          value: null,
        },
      }),
    );
    expect(result).toMatchObject({
      status: "inconclusive",
      naturalExit: true,
      retained: true,
      firstIssue: {
        code: "M2A_SETTLEMENT_UNKNOWN",
        step: "copy-segment",
      },
    });
    expect(result.performed).not.toContain("validate-segment");
  });

  it("uses one closed step-compatible issue vocabulary and stops without retry", async () => {
    const expectedCodes: Record<string, string> = {
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
    };
    for (const [step, code] of Object.entries(expectedCodes)) {
      const overrides: Record<string, unknown> = {};
      if (step === "copy-marker" || step === "validate-marker") {
        overrides["validate-completion"] = {
          settlement: "settled",
          ok: true,
          value: {
            status: "complete",
            issue: null,
            outputs: [M2A_TRANSFER.segmentPath, M2A_TRANSFER.markerPath],
          },
        };
      }
      overrides[step] = { settlement: "settled", ok: false, value: null };
      const failed = await runM2aTransferStateMachineForTest(
        createFakeM2aTransferBackend(overrides),
      );
      expect(failed).toMatchObject({
        status: "inconclusive",
        firstIssue: { code, step },
        issues: [{ code, step }],
      });
      expect(
        (failed.performed as string[]).filter((item) => item === step),
      ).toHaveLength(1);

      overrides[step] = {
        settlement: "unknown",
        ok: false,
        value: null,
      };
      const unknown = await runM2aTransferStateMachineForTest(
        createFakeM2aTransferBackend(overrides),
      );
      expect(unknown).toMatchObject({
        status: "inconclusive",
        firstIssue: { code: "M2A_SETTLEMENT_UNKNOWN", step },
      });
    }

    await expect(
      runM2aTransferStateMachineForTest(
        createFakeM2aTransferBackend({
          "initializer-start": {
            settlement: "settled",
            ok: false,
            value: { code: "/home/example/arbitrary" },
          },
        }),
      ),
    ).rejects.toThrow("M2A_FAKE_RESULT_INVALID");
    expect(() =>
      createFakeM2aTransferBackend({ retry: { settlement: "settled" } }),
    ).toThrow("M2A_FAKE_BACKEND_INVALID");
  });

  it("keeps late initializer/publication settlement contradictions inconclusive", async () => {
    const initializerCloseFailure = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "initializer-wait": {
          settlement: "settled",
          ok: true,
          value: { exitCode: 70 },
        },
        "initializer-inspect-final": {
          settlement: "settled",
          ok: true,
          value: { state: "exited", exitCode: 70 },
        },
      }),
    );
    expect(initializerCloseFailure).toMatchObject({
      status: "inconclusive",
      firstIssue: {
        code: "M2A_INITIALIZER_NOT_NATURAL_ZERO",
        step: "initializer-inspect-final",
      },
    });

    const publicationCloseFailure = await runM2aTransferStateMachineForTest(
      createFakeM2aTransferBackend({
        "measurement-wait": {
          settlement: "settled",
          ok: true,
          value: { exitCode: 70 },
        },
        "measurement-inspect-final": {
          settlement: "settled",
          ok: true,
          value: { state: "exited", exitCode: 70 },
        },
      }),
    );
    expect(publicationCloseFailure).toMatchObject({
      status: "inconclusive",
      firstIssue: {
        code: "M2A_COMPLETION_EXIT_MISMATCH",
        step: "validate-completion",
      },
      segmentTransfer: "not-attempted",
    });
  });
});

function successfulBuildTerminal(): {
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  outputTruncated: boolean;
  childClosed: boolean;
  outputClosed: boolean;
  descriptorsClosed: boolean;
} {
  return {
    exitCode: 0,
    signal: null,
    timedOut: false,
    outputTruncated: false,
    childClosed: true,
    outputClosed: true,
    descriptorsClosed: true,
  };
}

function runtimeChildTerminal(exitCode = 0) {
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

function heldChild(
  name: string,
  type: "directory" | "file",
  ino: bigint,
  overrides: Partial<FakeM2aHeldChildIdentity> = {},
): FakeM2aHeldChildIdentity {
  return {
    name,
    type,
    dev: 1n,
    ino,
    mode: type === "directory" ? 0o40700n : 0o100600n,
    uid: 1000n,
    gid: 1000n,
    nlink: type === "directory" ? 2n : 1n,
    size: type === "directory" ? 0n : 10n,
    mtimeNs: 1n,
    ...overrides,
  };
}

function heldSnapshot(
  children: readonly FakeM2aHeldChildIdentity[],
  identity: Partial<FakeM2aHeldDirectorySnapshot["identity"]> = {},
): FakeM2aHeldDirectorySnapshot {
  return {
    identity: {
      type: "directory",
      dev: 1n,
      ino: 7n,
      mode: 0o40700n,
      uid: 1000n,
      gid: 1000n,
      nlink: 2n,
      size: 1n,
      mtimeNs: 1n,
      ...identity,
    },
    entries: children.map(({ name, type }) => ({ name, type })),
    children,
  };
}

function failedPublication() {
  return {
    settlement: "settled",
    committed: false,
    bytesMatched: false,
    descriptorsClosed: true,
    directorySynced: true,
  };
}

function validImageBuildObservation() {
  return {
    version: {
      terminal: successfulBuildTerminal(),
      client: "29.6.1",
      server: "29.6.1",
    },
    tagAbsence: { terminal: successfulBuildTerminal(), stdout: "" },
    baseImage: {
      terminal: successfulBuildTerminal(),
      projection: {
        architecture: "amd64",
        id: `sha256:${"b".repeat(64)}`,
        os: "linux",
        repoDigests: [M2A_PRODUCTION.baseRepositoryDigest],
      },
    },
    build: { terminal: successfulBuildTerminal(), occurrences: 1 },
    candidateImage: {
      terminal: successfulBuildTerminal(),
      projection: {
        architecture: "amd64",
        cmd: ["node", "/opt/m2a-transfer/run-m2a-transfer.mjs"],
        entrypoint: null,
        environmentNames: ["PATH", "NODE_VERSION", "YARN_VERSION"],
        id: imageId,
        labels: null,
        os: "linux",
        repoTags: [M2A_TRANSFER.candidateImageTag],
        user: "1000:1000",
        workingDir: "",
      },
    },
    contextRevalidated: true,
    allDescriptorsSettled: true,
  };
}

const constructionBinding = {
  manifestSha256: `sha256:${"1".repeat(64)}`,
  contextAggregate: `sha256:${"2".repeat(64)}`,
  npmAcquisitionSha256: `sha256:${"3".repeat(64)}`,
  constructorToolchainSha256: `sha256:${"4".repeat(64)}`,
};

function validCompilerTerminal() {
  return {
    exitCode: 0,
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

function validConstructionCorrelation() {
  const npmEntries = [
    { path: "bin/npm-cli.js", bytes: Buffer.from("export {};\n") },
    {
      path: "package.json",
      bytes: Buffer.from('{"name":"npm","version":"12.0.1"}\n'),
    },
  ];
  const archive = createSyntheticNpmArchiveForTest(npmEntries);
  const integrity = `sha512-${Buffer.alloc(64, 7).toString("base64")}`;
  const receipt = canonical({
    schemaVersion: "m2a-transfer-acquisition/v1",
    generation: M2A_CONSTRUCTION.generation,
    packageName: "npm",
    version: "12.0.1",
    tarballSize: archive.length,
    tarballSha256: sha256(archive),
    integrity,
    status: "complete",
    scriptsRun: false,
    credentialsUsed: false,
    externalNetworkPhase: "dependency-acquisition-only",
    evidenceReview: "not-performed",
  });
  const npmAcquisition = validateNpmAcquisition(receipt, archive, {
    receiptSha256: sha256(receipt),
    tarballSha256: sha256(archive),
    integrity,
  });
  const fixedInputDefinitions = [
    [
      "experiments/npm12-install/Containerfile.m2a-transfer",
      "Containerfile.m2a-transfer",
      Buffer.from("FROM fixed\n"),
    ],
    [
      "experiments/npm12-install/container/initialize-m2a-volume.mjs",
      "container/initialize-m2a-volume.mjs",
      Buffer.from("export {};\n"),
    ],
    [
      "experiments/npm12-install/container/run-m2a-transfer.mjs",
      "container/run-m2a-transfer.mjs",
      Buffer.from("export {};\n"),
    ],
    [
      "packages/probe-core/package.json",
      "m2a-context/probe-core/package.json",
      Buffer.from('{"name":"probe-core"}\n'),
    ],
    [
      "packages/npm-lifecycle-probe/package.json",
      "m2a-context/npm-lifecycle-probe/package.json",
      Buffer.from('{"name":"npm-lifecycle-probe"}\n'),
    ],
    [
      "packages/npm-lifecycle-probe/fixture/consumer/package.json",
      "m2a-context/consumer/package.json",
      Buffer.from('{"name":"consumer"}\n'),
    ],
    [
      "packages/npm-lifecycle-probe/fixture/dependency/package.json",
      null,
      Buffer.from('{"name":"m2a-install-probe","version":"1.0.0"}\n'),
    ],
  ] as const;
  const probeCoreCompiler = {
    terminal: validCompilerTerminal(),
    inventory: [
      {
        path: "index.js",
        bytes: Buffer.from("export {};\n"),
        type: "regular",
        linkCount: 1,
        sparse: false,
        descriptorSettled: true,
      },
    ],
  };
  const lifecycleCompiler = {
    terminal: validCompilerTerminal(),
    inventory: [
      {
        path: "index.js",
        bytes: Buffer.from("export {};\n"),
        type: "regular",
        linkCount: 1,
        sparse: false,
        descriptorSettled: true,
      },
      {
        path: "lifecycle-entry.js",
        bytes: Buffer.from("export {};\n"),
        type: "regular",
        linkCount: 1,
        sparse: false,
        descriptorSettled: true,
      },
    ],
  };
  const files = [
    ...fixedInputDefinitions
      .filter((item) => item[1] !== null)
      .map(([, destination, bytes]) => ({ path: destination!, bytes })),
    ...npmEntries.map((item) => ({
      path: `m2a-context/npm/${item.path}`,
      bytes: item.bytes,
    })),
    { path: "m2a-context/npm-cli.js", bytes: npmEntries[0]!.bytes },
    ...probeCoreCompiler.inventory.map((item) => ({
      path: `m2a-context/probe-core/dist/${item.path}`,
      bytes: item.bytes,
    })),
    ...lifecycleCompiler.inventory.map((item) => ({
      path: `m2a-context/npm-lifecycle-probe/dist/${item.path}`,
      bytes: item.bytes,
    })),
    {
      path: "m2a-context/m2a-install-probe-1.0.0.tgz",
      bytes: createDeterministicFixtureArchive(
        fixedInputDefinitions.at(-1)![2],
      ),
    },
  ];
  const directories = new Set<string>();
  for (const file of files) {
    const parts = file.path.split("/");
    parts.pop();
    while (parts.length > 0) {
      directories.add(parts.join("/"));
      parts.pop();
    }
  }
  const inventory = [
    ...files.map((item) => ({
      path: item.path,
      type: "regular",
      mode: item.path === "m2a-context/npm-cli.js" ? 0o555 : 0o444,
      size: item.bytes.length,
      sha256: sha256(item.bytes),
      mtimeNs: "0",
    })),
    ...[...directories].map((directory) => ({
      path: directory,
      type: "directory",
      mode: 0o555,
      size: null,
      sha256: null,
      mtimeNs: "0",
    })),
  ].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  const heldContextInventory = inventory.map((row) => ({
    ...row,
    linkCount: row.type === "regular" ? 1 : null,
    sparse: false,
    descriptorSettled: true,
  }));
  const fixedInputs = fixedInputDefinitions.map(([sourcePath, , bytes]) => ({
    sourcePath,
    bytes,
    type: "regular",
    linkCount: 1,
    sparse: false,
    descriptorSettled: true,
  }));
  const correlation = validateConstructionContextInputs({
    npmAcquisition,
    probeCoreCompiler,
    lifecycleCompiler,
    fixedInputs,
    heldContextInventory,
  });
  return {
    correlation,
    inventory,
    inputs: {
      npmAcquisition,
      probeCoreCompiler,
      lifecycleCompiler,
      fixedInputs,
      heldContextInventory,
    },
  };
}

describe("M2-A construction static/unit boundary", () => {
  it("pins the 31/41-row closure and recursively validates the fixed plan", () => {
    expect(M2A_CONSTRUCTION).toMatchObject({
      generation: "20260721-01",
      sourceInputs: expect.arrayContaining(["package-lock.json"]),
      sourceAggregate:
        "sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04",
      constructionBaselineAggregate:
        "sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526",
      reviewedAcquisitionReceiptSha256: null,
      reviewedToolchainReceiptSha256: null,
    });
    expect(M2A_CONSTRUCTION.sourceInputs).toHaveLength(31);
    expect(M2A_CONSTRUCTION.constructionInputs).toHaveLength(41);
    const plan = createFixedConstructionPlan();
    expect(validateFixedConstructionPlan(structuredClone(plan))).toEqual(plan);
    const inherited = structuredClone(plan) as Record<string, unknown>;
    Object.setPrototypeOf(inherited.prerequisites as object, {
      npmArchive: "alternate.tgz",
    });
    expect(() => validateFixedConstructionPlan(inherited)).toThrow(
      "M2A_CONSTRUCTION_PLAN_INVALID",
    );
    let getterCalls = 0;
    const accessor = structuredClone(plan) as Record<string, unknown>;
    Object.defineProperty(accessor, "executable", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "/usr/bin/node";
      },
    });
    expect(() => validateFixedConstructionPlan(accessor)).toThrow(
      "M2A_CONSTRUCTION_PLAN_INVALID",
    );
    expect(getterCalls).toBe(0);
    let proxyTraps = 0;
    const proxy = new Proxy(structuredClone(plan), {
      get() {
        proxyTraps += 1;
        return undefined;
      },
    });
    expect(() => validateFixedConstructionPlan(proxy)).toThrow(
      "M2A_CONSTRUCTION_PLAN_INVALID",
    );
    expect(proxyTraps).toBe(0);
  });

  it("validates synthetic npm and toolchain receipts without fixed-root access", () => {
    const archive = createSyntheticNpmArchiveForTest([
      { path: "bin/npm-cli.js", bytes: "export {};\n" },
      { path: "package.json", bytes: '{"name":"npm","version":"12.0.1"}\n' },
    ]);
    const integrity = `sha512-${Buffer.alloc(64, 7).toString("base64")}`;
    const receipt = canonical({
      schemaVersion: "m2a-transfer-acquisition/v1",
      generation: M2A_CONSTRUCTION.generation,
      packageName: "npm",
      version: "12.0.1",
      tarballSize: archive.length,
      tarballSha256: sha256(archive),
      integrity,
      status: "complete",
      scriptsRun: false,
      credentialsUsed: false,
      externalNetworkPhase: "dependency-acquisition-only",
      evidenceReview: "not-performed",
    });
    const validated = validateNpmAcquisition(receipt, archive, {
      receiptSha256: sha256(receipt),
      tarballSha256: sha256(archive),
      integrity,
    });
    expect(validated).toMatchObject({ tarballSize: archive.length, integrity });
    const badReceipt = JSON.parse(receipt) as Record<string, unknown>;
    badReceipt.version = "12.0.2";
    const badBytes = canonical(badReceipt);
    expect(() =>
      validateNpmAcquisition(badBytes, archive, {
        receiptSha256: sha256(badBytes),
        tarballSha256: sha256(archive),
        integrity,
      }),
    ).toThrow("M2A_ACQUISITION_INVALID");

    const inventory = [
      {
        logicalPath: "packages/@types/node/index.d.ts",
        mode: 0o444,
        size: 1,
        sha256: `sha256:${"6".repeat(64)}`,
      },
      {
        logicalPath: "packages/typescript/bin/tsc",
        mode: 0o444,
        size: 1,
        sha256: `sha256:${"7".repeat(64)}`,
      },
      {
        logicalPath: "packages/undici-types/index.d.ts",
        mode: 0o444,
        size: 1,
        sha256: `sha256:${"8".repeat(64)}`,
      },
      {
        logicalPath: "runtime/constructor-node",
        mode: 0o555,
        size: 1,
        sha256: `sha256:${"9".repeat(64)}`,
      },
    ];
    const inventoryAggregate = sha256(JSON.stringify(inventory));
    const runtimeInventoryAggregate = sha256(
      JSON.stringify(
        inventory.filter((row) => row.logicalPath.startsWith("runtime/")),
      ),
    );
    const packagePrefixes = [
      "packages/typescript/",
      "packages/@types/node/",
      "packages/undici-types/",
    ];
    const packageIntegrities = M2A_CONSTRUCTION.toolchainPackages.map(
      (item) => item as Record<string, unknown>,
    );
    const toolchain = canonical({
      schemaVersion: "m2a-transfer-toolchain/v1",
      generation: M2A_CONSTRUCTION.generation,
      runtime: {
        logicalId: "constructor-node",
        version: "v20.18.2",
        platform: "linux",
        architecture: "x64",
        executableSize: 1,
        executableSha256: `sha256:${"9".repeat(64)}`,
        loadedRuntimeInventoryAggregate: runtimeInventoryAggregate,
      },
      packages: packageIntegrities.map((item, index) => ({
        name: item.name,
        version: item.version,
        integrity: item.integrity,
        inventoryAggregate: sha256(
          JSON.stringify(
            inventory.filter((row) =>
              row.logicalPath.startsWith(packagePrefixes[index]!),
            ),
          ),
        ),
      })),
      inventory,
      inventoryAggregate,
      status: "complete",
      evidenceReview: "not-performed",
    });
    expect(
      validateConstructorToolchain(toolchain, {
        receiptSha256: sha256(toolchain),
        inventoryAggregate,
      }),
    ).toMatchObject({ inventoryAggregate });
    const extraInventory = [
      ...inventory,
      {
        logicalPath: "unbound/extra-input.bin",
        mode: 0o444,
        size: 1,
        sha256: `sha256:${"a".repeat(64)}`,
      },
    ].sort((left, right) => left.logicalPath.localeCompare(right.logicalPath));
    const extraToolchain = JSON.parse(toolchain) as Record<string, unknown>;
    extraToolchain.inventory = extraInventory;
    extraToolchain.inventoryAggregate = sha256(JSON.stringify(extraInventory));
    const extraBytes = canonical(extraToolchain);
    expect(() =>
      validateConstructorToolchain(extraBytes, {
        receiptSha256: sha256(extraBytes),
        inventoryAggregate: extraToolchain.inventoryAggregate,
      }),
    ).toThrow("M2A_TOOLCHAIN_INVALID");
  });

  it("binds the complete canonical construction manifest and inverse inventory", () => {
    const fixture = validConstructionCorrelation();
    const inventory = fixture.inventory;
    expect(fixture.correlation).toMatchObject({
      contextInventory: inventory,
      contextAggregate: sha256(JSON.stringify(inventory)),
    });
    const bindings = {
      npmReceiptSha256: `sha256:${"1".repeat(64)}`,
      npmTarballSha256: `sha256:${"2".repeat(64)}`,
      npmIntegrity: `sha512-${Buffer.alloc(64, 3).toString("base64")}`,
      toolchainReceiptSha256: `sha256:${"3".repeat(64)}`,
      toolchainRuntimeSha256: `sha256:${"4".repeat(64)}`,
      toolchainInventoryAggregate: `sha256:${"5".repeat(64)}`,
      constructorSourceSha256: `sha256:${"6".repeat(64)}`,
    };
    const compilerSteps = [
      ["compile-probe-core", "compile-probe-core-argv"],
      ["compile-npm-lifecycle-probe", "compile-npm-lifecycle-probe-argv"],
    ].map(([stepId, argvLogicalId]) => ({
      stepId,
      executableLogicalId: "constructor-node",
      argvLogicalId,
      cwdLogicalId: "private-compiler-workspace",
      environmentKeys: [],
      deadlineMs: 30_000,
      combinedOutputLimitBytes: 65_536,
      termToKillGraceMs: 250,
      closeDeadlineMs: 1_000,
    }));
    const manifest = {
      schemaVersion: "m2a-transfer-construction/v1",
      generation: M2A_CONSTRUCTION.generation,
      expectedRevision: M2A_CONSTRUCTION.expectedRevision,
      runId: M2A_CONSTRUCTION.runId,
      scenarioId: M2A_CONSTRUCTION.scenarioId,
      trackedInputs: {
        sourceAggregate: M2A_CONSTRUCTION.sourceAggregate,
        constructionBaselineAggregate:
          M2A_CONSTRUCTION.constructionBaselineAggregate,
      },
      npmAcquisition: {
        receiptSha256: bindings.npmReceiptSha256,
        tarballSize: 1,
        tarballSha256: bindings.npmTarballSha256,
        integrity: bindings.npmIntegrity,
      },
      constructorToolchain: {
        receiptSha256: bindings.toolchainReceiptSha256,
        runtimeSha256: bindings.toolchainRuntimeSha256,
        inventoryAggregate: bindings.toolchainInventoryAggregate,
      },
      constructor: {
        sourceSha256: bindings.constructorSourceSha256,
        compilerSteps,
      },
      contextInventory: inventory,
      contextAggregate: sha256(JSON.stringify(inventory)),
    };
    const bytes = canonical(manifest);
    expect(
      validateConstructionManifestBytes(bytes, bindings, fixture.correlation),
    ).toMatchObject({ manifestSha256: sha256(bytes) });
    const reordered = structuredClone(manifest);
    reordered.contextInventory.reverse();
    reordered.contextAggregate = sha256(
      JSON.stringify(reordered.contextInventory),
    );
    expect(() =>
      validateConstructionManifestBytes(
        canonical(reordered),
        bindings,
        fixture.correlation,
      ),
    ).toThrow("M2A_CONSTRUCTION_MANIFEST_INVALID");
    for (const mutate of [
      (value: typeof manifest) => {
        value.contextInventory[0]!.mode = 0o644;
      },
      (value: typeof manifest) => {
        value.contextInventory[0]!.mtimeNs = "1";
      },
      (value: typeof manifest) => {
        value.contextInventory = value.contextInventory.filter(
          (row) => row.path !== "m2a-context/npm/bin/npm-cli.js",
        );
      },
      (value: typeof manifest) => {
        value.contextInventory.push({
          path: "unknown.txt",
          type: "regular",
          mode: 0o444,
          size: 1,
          sha256: `sha256:${"7".repeat(64)}`,
          mtimeNs: "0",
        });
      },
    ]) {
      const drift = structuredClone(manifest);
      mutate(drift);
      drift.contextInventory.sort((left, right) =>
        left.path.localeCompare(right.path),
      );
      drift.contextAggregate = sha256(JSON.stringify(drift.contextInventory));
      expect(() =>
        validateConstructionManifestBytes(
          canonical(drift),
          bindings,
          fixture.correlation,
        ),
      ).toThrow("M2A_CONSTRUCTION_MANIFEST_INVALID");
    }
    expect(() =>
      validateConstructionManifestBytes(
        `${bytes}\n`,
        bindings,
        fixture.correlation,
      ),
    ).toThrow("M2A_CONSTRUCTION_MANIFEST_INVALID");
    const disconnected = {
      ...fixture.inputs,
      probeCoreCompiler: structuredClone(fixture.inputs.probeCoreCompiler),
    };
    disconnected.probeCoreCompiler.inventory[0]!.bytes = Buffer.from(
      "export const drift = true;\n",
    );
    expect(() => validateConstructionContextInputs(disconnected)).toThrow(
      "M2A_CONTEXT_CORRELATION_INVALID",
    );
    const extraHeld = {
      ...fixture.inputs,
      heldContextInventory: [
        ...fixture.inputs.heldContextInventory,
        {
          path: "m2a-context/npm/unbound.js",
          type: "regular",
          mode: 0o444,
          size: 1,
          sha256: `sha256:${"a".repeat(64)}`,
          mtimeNs: "0",
          linkCount: 1,
          sparse: false,
          descriptorSettled: true,
        },
      ].sort((left, right) =>
        left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
      ),
    };
    expect(() => validateConstructionContextInputs(extraHeld)).toThrow(
      "M2A_CONTEXT_CORRELATION_INVALID",
    );
  });

  it("settles fake construction ownership before either publication", async () => {
    await expect(
      runM2aConstructionForTest({
        async perform() {
          return { settlement: "settled", ok: true };
        },
      }),
    ).rejects.toThrow("M2A_CONSTRUCTION_FAKE_REQUIRED");
    const complete = await runM2aConstructionForTest(
      createFakeM2aConstructionBackend(),
    );
    expect(complete).toMatchObject({
      status: "complete",
      contextPublished: true,
      manifestPublished: true,
      retry: false,
      cleanup: false,
    });
    const unknown = await runM2aConstructionForTest(
      createFakeM2aConstructionBackend({
        "settle-private-workspace": { settlement: "unknown", ok: false },
      }),
    );
    expect(unknown).toMatchObject({
      status: "inconclusive",
      contextPublished: false,
      manifestPublished: false,
    });
    for (const override of [
      { settlement: "unknown", ok: false },
      { settlement: "settled", ok: false },
    ]) {
      const compilerOneFailure = await runM2aConstructionForTest(
        createFakeM2aConstructionBackend({
          "compile-probe-core": override,
        }),
      );
      const performed = compilerOneFailure.performed as string[];
      expect(performed.at(-1)).toBe("compile-probe-core");
      expect(performed).not.toContain("compile-npm-lifecycle-probe");
      expect(compilerOneFailure).toMatchObject({
        status: "inconclusive",
        contextPublished: false,
        manifestPublished: false,
      });
    }
  });
});

describe("M2-A fixed process first-cause settlement", () => {
  const close = (
    code: number | null,
    signal: string | null,
    closures: Partial<Record<string, boolean>> = {},
  ) => ({
    type: "close",
    code,
    signal,
    childClosed: closures.childClosed ?? true,
    stdoutClosed: closures.stdoutClosed ?? true,
    stderrClosed: closures.stderrClosed ?? true,
  });
  const run = (events: Array<Record<string, unknown>>) =>
    runM2aProcessSettlementTraceForTest(createFakeM2aProcessTrace(events));

  it("requires the fake trace brand and accepts only identical zero exit/close", () => {
    expect(() =>
      runM2aProcessSettlementTraceForTest({ events: [] } as never),
    ).toThrow("M2A_PROCESS_TRACE_FAKE_REQUIRED");
    const result = run([
      { type: "exit", code: 0, signal: null },
      close(0, null),
      { type: "error" },
    ]);
    expect(result).toMatchObject({
      firstFailure: null,
      firstExit: { code: 0, signal: null },
      firstClose: { code: 0, signal: null },
      known: true,
      successful: true,
      descriptorsClosed: true,
      timersCleared: true,
      timerClearCounts: { primary: 1, kill: 0, close: 1 },
      ignoredEvents: 1,
    });
  });

  it("retains the first failure and first exit tuple against later events", () => {
    const cases: Array<{
      events: Array<Record<string, unknown>>;
      failure: string;
      firstExit?: { code: number | null; signal: string | null } | null;
    }> = [
      { events: [{ type: "spawn-failure" }], failure: "spawn-failure" },
      {
        events: [{ type: "error" }, close(0, null)],
        failure: "error",
      },
      {
        events: [{ type: "exit", code: 9, signal: null }, close(0, null)],
        failure: "exit",
        firstExit: { code: 9, signal: null },
      },
      {
        events: [{ type: "exit", code: 0, signal: null }, close(1, null)],
        failure: "inconsistent-close",
      },
      {
        events: [
          { type: "timeout" },
          { type: "exit", code: 0, signal: null },
          close(0, null),
        ],
        failure: "timeout",
      },
      {
        events: [
          { type: "overflow", stream: "stdout" },
          { type: "exit", code: 0, signal: null },
          close(0, null),
        ],
        failure: "stdout-overflow",
      },
      {
        events: [
          { type: "signal-failure" },
          { type: "exit", code: 0, signal: null },
          close(0, null),
        ],
        failure: "signal-failure",
      },
      { events: [close(0, null)], failure: "close-without-exit" },
      {
        events: [{ type: "exit", code: 0, signal: null }],
        failure: "final-bound",
      },
      {
        events: [
          { type: "exit", code: 0, signal: null },
          close(0, null, { stdoutClosed: false }),
        ],
        failure: "descriptor-uncertain",
      },
      { events: [], failure: "final-bound" },
      {
        events: [
          { type: "exit", code: 0, signal: null },
          { type: "exit", code: 1, signal: null },
          close(0, null),
        ],
        failure: "inconsistent-exit",
        firstExit: { code: 0, signal: null },
      },
    ];
    for (const testCase of cases) {
      const result = run(testCase.events);
      expect(result.firstFailure).toBe(testCase.failure);
      expect(result.successful).toBe(false);
      expect(result.settled).toBe(true);
      expect(result.timersCleared).toBe(true);
      if (testCase.firstExit !== undefined) {
        expect(result.firstExit).toEqual(testCase.firstExit);
      }
    }
  });
});

describe("M2-A image-build and production transaction boundary", () => {
  it("fixes all five offline build commands and canonical local-image binding", () => {
    const plan = createFixedImageBuildPlan();
    expect(validateFixedImageBuildPlan(structuredClone(plan))).toEqual(plan);
    expect(
      (plan.commands as Array<Record<string, unknown>>).map(
        (row) => row.stepId,
      ),
    ).toEqual([
      "docker-version",
      "candidate-tag-absence",
      "pinned-base-inspect",
      "offline-build",
      "candidate-inspect",
    ]);
    expect(JSON.stringify(plan)).toContain('"--network","none"');
    expect(JSON.stringify(plan)).toContain('"--pull=false"');
    const observation = validImageBuildObservation();
    expect(validateImageBuildObservation(observation)).toMatchObject({
      dockerClientVersion: "29.6.1",
      dockerServerVersion: "29.6.1",
    });
    const bytes = createImageBindingBytesForTest(
      observation,
      constructionBinding,
    );
    expect(
      validateImageBindingBytes(bytes, constructionBinding, imageId),
    ).toMatchObject({ sha256: sha256(bytes) });
    const drift = structuredClone(observation);
    drift.candidateImage.projection.user = "0:0";
    expect(() => validateImageBuildObservation(drift)).toThrow(
      "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
    );
    const inherited = structuredClone(plan) as Record<string, unknown>;
    Object.setPrototypeOf(inherited.environment as object, {
      DOCKER_HOST: "unix:///forbidden",
    });
    expect(() => validateFixedImageBuildPlan(inherited)).toThrow(
      "M2A_IMAGE_BUILD_PLAN_INVALID",
    );
    const terminalDrifts: Array<
      (value: ReturnType<typeof validImageBuildObservation>) => void
    > = [
      (value) => {
        value.version.terminal.exitCode = 1;
      },
      (value) => {
        value.version.terminal.signal = "SIGTERM";
      },
      (value) => {
        value.version.terminal.timedOut = true;
      },
      (value) => {
        value.version.terminal.outputTruncated = true;
      },
      (value) => {
        value.version.terminal.childClosed = false;
      },
      (value) => {
        value.version.terminal.outputClosed = false;
      },
      (value) => {
        value.version.terminal.descriptorsClosed = false;
      },
      (value) => {
        value.tagAbsence.stdout = imageId;
      },
      (value) => {
        value.baseImage.projection.repoDigests = [];
      },
      (value) => {
        value.build.occurrences = 2;
      },
      (value) => {
        value.contextRevalidated = false;
      },
      (value) => {
        value.allDescriptorsSettled = false;
      },
    ];
    for (const mutate of terminalDrifts) {
      const invalid = validImageBuildObservation();
      mutate(invalid);
      expect(() => validateImageBuildObservation(invalid)).toThrow(
        "M2A_IMAGE_BUILD_OBSERVATION_INVALID",
      );
    }
  });

  it("retains fake build state and forbids retry, cleanup, or premature binding", async () => {
    await expect(
      runM2aImageBuildForTest(
        {
          async perform() {
            return { settlement: "settled", ok: true, value: null };
          },
        } as never,
        constructionBinding,
      ),
    ).rejects.toThrow("M2A_IMAGE_BUILD_FAKE_REQUIRED");
    const complete = await runM2aImageBuildForTest(
      createFakeM2aImageBuildBackend(),
      constructionBinding,
    );
    expect(complete).toMatchObject({
      status: "complete",
      occurrences: 1,
      imageBindingPublished: true,
      retained: true,
      retry: false,
      cleanup: false,
    });
    const unknown = await runM2aImageBuildForTest(
      createFakeM2aImageBuildBackend({
        "offline-build": {
          settlement: "unknown",
          value: null,
        },
      }),
      constructionBinding,
    );
    expect(unknown).toMatchObject({
      status: "inconclusive",
      imageBindingPublished: false,
      occurrences: 1,
    });
    expect(unknown.performed).not.toContain("candidate-inspect");
    await expect(
      runM2aImageBuildForTest(
        createFakeM2aImageBuildBackend({
          "candidate-inspect": {
            settlement: "settled",
            value: {
              terminal: successfulBuildTerminal(),
              projection: null,
              allDescriptorsSettled: true,
            },
          },
        }),
        constructionBinding,
      ),
    ).rejects.toThrow("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
    const publicationUnknown = await runM2aImageBuildForTest(
      createFakeM2aImageBuildBackend({
        "publish-binding": {
          settlement: "unknown",
          committed: false,
          bytesMatched: false,
          descriptorsClosed: false,
          directorySynced: false,
        },
      }),
      constructionBinding,
    );
    expect(publicationUnknown).toMatchObject({
      status: "inconclusive",
      issue: "M2A_IMAGE_BUILD_SETTLEMENT_UNKNOWN",
      imageBindingPublished: false,
      imageBindingBytes: null,
    });
  });

  it("validates each image-build row before the next command", async () => {
    const observation = validImageBuildObservation();
    const values: Record<string, Record<string, unknown>> = {
      "docker-version": structuredClone(observation.version),
      "candidate-tag-absence": structuredClone(observation.tagAbsence),
      "pinned-base-inspect": structuredClone(observation.baseImage),
      "offline-build": {
        terminal: structuredClone(observation.build.terminal),
        occurrences: observation.build.occurrences,
        contextRevalidated: observation.contextRevalidated,
      },
      "candidate-inspect": {
        terminal: structuredClone(observation.candidateImage.terminal),
        projection: structuredClone(observation.candidateImage.projection),
        allDescriptorsSettled: observation.allDescriptorsSettled,
      },
    };
    const cases: Array<{
      step: string;
      mutate: (value: Record<string, unknown>) => void;
      forbidden: string;
    }> = [
      {
        step: "docker-version",
        mutate(value) {
          (value.terminal as Record<string, unknown>).timedOut = true;
        },
        forbidden: "candidate-tag-absence",
      },
      {
        step: "candidate-tag-absence",
        mutate(value) {
          value.stdout = imageId;
        },
        forbidden: "offline-build",
      },
      {
        step: "pinned-base-inspect",
        mutate(value) {
          (value.projection as Record<string, unknown>).repoDigests = [];
        },
        forbidden: "offline-build",
      },
      {
        step: "offline-build",
        mutate(value) {
          value.contextRevalidated = false;
        },
        forbidden: "candidate-inspect",
      },
      {
        step: "candidate-inspect",
        mutate(value) {
          value.allDescriptorsSettled = false;
        },
        forbidden: "publish-binding",
      },
    ];
    for (const testCase of cases) {
      const invalidValue = structuredClone(values[testCase.step]!);
      testCase.mutate(invalidValue);
      const backend = createFakeM2aImageBuildBackend({
        [testCase.step]: { settlement: "settled", value: invalidValue },
      });
      await expect(
        runM2aImageBuildForTest(backend, constructionBinding),
      ).rejects.toThrow("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
      expect(backend.snapshotActions()).not.toContain(testCase.forbidden);
    }
    const firstRowBackend = createFakeM2aImageBuildBackend({
      "docker-version": {
        settlement: "settled",
        value: {
          ...values["docker-version"],
          terminal: {
            ...(values["docker-version"]!.terminal as Record<string, unknown>),
            timedOut: true,
          },
        },
      },
    });
    await expect(
      runM2aImageBuildForTest(firstRowBackend, constructionBinding),
    ).rejects.toThrow("M2A_IMAGE_BUILD_OBSERVATION_INVALID");
    expect(firstRowBackend.snapshotActions()).toEqual(["docker-version"]);
  });

  it("requires exact image-binding publication settlement shapes", async () => {
    for (const publication of [
      {
        settlement: "forged-success",
        committed: true,
        bytesMatched: true,
        descriptorsClosed: true,
        directorySynced: true,
      },
      {
        settlement: "unknown",
        committed: true,
        bytesMatched: false,
        descriptorsClosed: false,
        directorySynced: false,
      },
      {
        settlement: "settled",
        committed: true,
        bytesMatched: true,
        descriptorsClosed: "true",
        directorySynced: true,
      },
    ]) {
      const backend = createFakeM2aImageBuildBackend({
        "publish-binding": publication,
      });
      await expect(
        runM2aImageBuildForTest(backend, constructionBinding),
      ).rejects.toThrow("M2A_IMAGE_BUILD_FAKE_INVALID");
      expect(backend.snapshotActions().at(-1)).toBe("publish-binding");
    }
  });

  it("binds three exact absence checkpoint identities to immutable argv", () => {
    const plan = createFixedProductionExecutionPlan(imageId);
    expect(
      validateFixedProductionExecutionPlan(structuredClone(plan), imageId),
    ).toEqual(plan);
    expect(plan.absenceRows).toEqual([
      {
        step: "absence-volume",
        argv: ["volume", "inspect", M2A_TRANSFER.transferVolume],
      },
      {
        step: "absence-initializer-container",
        argv: ["container", "inspect", M2A_TRANSFER.initializerContainer],
      },
      {
        step: "absence-measurement-container",
        argv: ["container", "inspect", M2A_TRANSFER.measurementContainer],
      },
    ]);
    for (const step of M2A_PRODUCTION.absenceSteps) {
      const checkpoint = createPessimisticAttemptCheckpointBytes(imageId, step);
      expect(validateAttemptBytes(checkpoint, imageId).attempt).toMatchObject({
        issues: [{ code: "M2A_SETTLEMENT_UNKNOWN", step }],
        initializerSettlement: "not-started",
        measurementSettlement: "not-started",
      });
    }
    expect(() =>
      createPessimisticAttemptCheckpointBytes(imageId, "absence-preflight"),
    ).toThrow("M2A_CHECKPOINT_INVALID");
    const swapped = structuredClone(plan) as Record<string, unknown>;
    const rows = swapped.absenceRows as Array<Record<string, unknown>>;
    [rows[0]!.argv, rows[1]!.argv] = [rows[1]!.argv, rows[0]!.argv];
    expect(() =>
      validateFixedProductionExecutionPlan(swapped, imageId),
    ).toThrow("M2A_PRODUCTION_PLAN_INVALID");
  });

  it("commits each checkpoint before child launch and stops after unknown settlement", async () => {
    const complete = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend(),
      imageId,
    );
    expect(complete).toMatchObject({
      status: "complete",
      durableCheckpoint: "copy-marker",
      finalPublished: true,
      retry: false,
      cleanup: false,
    });
    const actions = complete.actions as string[];
    for (const step of [
      "absence-volume",
      "absence-initializer-container",
      "absence-measurement-container",
      "volume-create",
      "measurement-wait",
      "copy-completion",
    ]) {
      expect(actions.indexOf(`checkpoint:${step}`)).toBeLessThan(
        actions.indexOf(step),
      );
    }
    const commandSteps = (
      createFixedProductionExecutionPlan(imageId).commandRows as Array<{
        step: string;
      }>
    ).map((row) => row.step);
    for (const step of commandSteps) {
      const unknown = await runM2aProductionTransactionForTest(
        createFakeM2aProductionBackend({
          [step]: { settlement: "unknown", terminal: null, value: null },
        }),
        imageId,
      );
      expect(unknown).toMatchObject({
        status: "inconclusive",
        issue: "M2A_SETTLEMENT_UNKNOWN",
        durableCheckpoint: step,
        finalPublished: false,
      });
      const unknownActions = unknown.actions as string[];
      expect(unknownActions.at(-1)).toBe(step);
      expect(unknownActions).not.toContain("publish-final");
    }
  });

  it("cross-binds child exits, copied bytes, validation, and final candidate publication", async () => {
    const initializerMismatch = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend({
        "initializer-wait": {
          settlement: "settled",
          terminal: runtimeChildTerminal(),
          value: { exitCode: 9 },
        },
        "initializer-inspect-final": {
          settlement: "settled",
          terminal: runtimeChildTerminal(),
          value: { state: "exited", exitCode: 8 },
        },
      }),
      imageId,
    );
    expect(initializerMismatch).toMatchObject({
      status: "inconclusive",
      issue: "M2A_INITIALIZER_NOT_NATURAL_ZERO",
      finalPublished: false,
    });
    expect(initializerMismatch.actions).not.toContain("measurement-create");

    await expect(
      runM2aProductionTransactionForTest(
        createFakeM2aProductionBackend({
          "copy-segment": {
            settlement: "settled",
            terminal: runtimeChildTerminal(),
            value: null,
          },
        }),
        imageId,
      ),
    ).rejects.toThrow("M2A_PRODUCTION_FAKE_INVALID");

    const validationUnknown = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend({
        "validate-completion": {
          settlement: "unknown",
          valueSha256: null,
          bytesClosed: false,
          metadataClosed: false,
        },
      }),
      imageId,
    );
    expect(validationUnknown).toMatchObject({
      status: "inconclusive",
      issue: "M2A_SETTLEMENT_UNKNOWN",
      finalPublished: false,
    });
    expect(validationUnknown.actions).not.toContain("copy-segment");

    const positive = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend(),
      imageId,
    );
    expect(
      validateCandidateTransfer(
        positive.candidateAttemptBytes as Buffer,
        imageId,
        positive.completionBytes as Buffer,
        positive.segmentBytes as Buffer,
        positive.markerBytes as Buffer,
      ),
    ).toMatchObject({ attempt: { issues: [] } });
  });

  it("rejects noncanonical runtime settlements at every publication and validation barrier", async () => {
    const invalidPublication = {
      settlement: "forged-success",
      committed: true,
      bytesMatched: true,
      descriptorsClosed: true,
      directorySynced: true,
    };
    const publicationCases = [
      {
        key: "checkpoint:absence-volume",
        forbidden: "absence-volume",
      },
      { key: "prepare-marker-parent", forbidden: "copy-marker" },
      { key: "publish-final", forbidden: "after-final" },
    ];
    for (const testCase of publicationCases) {
      const backend = createFakeM2aProductionBackend({
        [testCase.key]: invalidPublication,
      });
      await expect(
        runM2aProductionTransactionForTest(backend, imageId),
      ).rejects.toThrow("M2A_PRODUCTION_FAKE_INVALID");
      const actions = backend.snapshotActions();
      expect(actions).not.toContain(testCase.forbidden);
      expect(actions.at(-1)).toBe(testCase.key);
    }
    for (const validation of [
      {
        settlement: "forged-success",
        valueSha256: sha256("x"),
        bytesClosed: true,
        metadataClosed: true,
      },
      {
        settlement: "unknown",
        valueSha256: sha256("x"),
        bytesClosed: false,
        metadataClosed: false,
      },
      {
        settlement: "unknown",
        valueSha256: null,
        bytesClosed: true,
        metadataClosed: false,
      },
    ]) {
      const backend = createFakeM2aProductionBackend({
        "validate-completion": validation,
      });
      await expect(
        runM2aProductionTransactionForTest(backend, imageId),
      ).rejects.toThrow("M2A_PRODUCTION_FAKE_INVALID");
      expect(backend.snapshotActions().at(-1)).toBe("validate-completion");
      expect(backend.snapshotActions()).not.toContain("copy-segment");
    }
  });

  it("rejects primitive, missing, extra, inherited, accessor, and custom-prototype settlements", async () => {
    const inherited = Object.create({ settlement: "settled" }) as Record<
      string,
      unknown
    >;
    Object.assign(inherited, {
      committed: true,
      bytesMatched: true,
      descriptorsClosed: true,
      directorySynced: true,
    });
    const accessor: Record<string, unknown> = {};
    Object.defineProperty(accessor, "settlement", {
      enumerable: true,
      get() {
        return "settled";
      },
    });
    Object.assign(accessor, {
      committed: true,
      bytesMatched: true,
      descriptorsClosed: true,
      directorySynced: true,
    });
    const customPrototype = {
      settlement: "settled",
      committed: true,
      bytesMatched: true,
      descriptorsClosed: true,
      directorySynced: true,
    };
    Object.setPrototypeOf(customPrototype, { custom: true });
    const malformed: unknown[] = [
      null,
      1,
      {
        settlement: "settled",
        committed: true,
        bytesMatched: true,
        descriptorsClosed: true,
      },
      {
        settlement: "settled",
        committed: true,
        bytesMatched: true,
        descriptorsClosed: true,
        directorySynced: true,
        extra: false,
      },
      inherited,
      accessor,
      customPrototype,
    ];
    for (const settlement of malformed) {
      const backend = createFakeM2aProductionBackend({
        "checkpoint:absence-volume": settlement,
      });
      await expect(
        runM2aProductionTransactionForTest(backend, imageId),
      ).rejects.toThrow("M2A_PRODUCTION_FAKE_INVALID");
      expect(backend.snapshotActions()).toEqual(["checkpoint:absence-volume"]);
    }
    const childBackend = createFakeM2aProductionBackend({
      "absence-volume": {
        settlement: "forged-success",
        terminal: runtimeChildTerminal(1),
        value: { absent: true },
      },
    });
    await expect(
      runM2aProductionTransactionForTest(childBackend, imageId),
    ).rejects.toThrow("M2A_PRODUCTION_FAKE_INVALID");
    expect(childBackend.snapshotActions().at(-1)).toBe("absence-volume");
  });

  it("keeps exact unknown and known-failed settlement branches distinct", async () => {
    const exactUnknown = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend({
        "prepare-marker-parent": {
          settlement: "unknown",
          committed: false,
          bytesMatched: false,
          descriptorsClosed: false,
          directorySynced: false,
        },
      }),
      imageId,
    );
    expect(exactUnknown).toMatchObject({
      status: "inconclusive",
      issue: "M2A_SETTLEMENT_UNKNOWN",
      finalPublished: false,
    });
    expect((exactUnknown.actions as string[]).at(-1)).toBe(
      "prepare-marker-parent",
    );

    const knownFailure = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend({
        "validate-completion": {
          settlement: "settled",
          valueSha256: sha256("wrong"),
          bytesClosed: true,
          metadataClosed: true,
        },
      }),
      imageId,
    );
    expect(knownFailure).toMatchObject({
      status: "inconclusive",
      issue: "M2A_COMPLETION_TRANSFER_INVALID",
      finalPublished: false,
    });
    expect((knownFailure.actions as string[]).at(-1)).toBe(
      "validate-completion",
    );
  });

  it("records all six child-specific absence failure/unknown outcomes", async () => {
    for (const step of M2A_PRODUCTION.absenceSteps) {
      const knownFailure = await runM2aProductionTransactionForTest(
        createFakeM2aProductionBackend({
          [step]: {
            settlement: "settled",
            terminal: runtimeChildTerminal(0),
            value: null,
          },
        }),
        imageId,
      );
      expect(knownFailure).toMatchObject({
        status: "inconclusive",
        issue: "M2A_ABSENCE_PREFLIGHT_FAILED",
        durableCheckpoint: step,
        finalPublished: true,
      });
      const actions = knownFailure.actions as string[];
      expect(actions.slice(-2)).toEqual([step, "publish-final"]);
    }
  });

  it("makes checkpoint failure prelaunch and copies only completion-listed outputs", async () => {
    const checkpointFailure = await runM2aProductionTransactionForTest(
      createFakeM2aProductionBackend({
        "checkpoint:absence-initializer-container": {
          ...failedPublication(),
        },
      }),
      imageId,
    );
    expect(checkpointFailure).toMatchObject({
      status: "inconclusive",
      issue: "M2A_CHECKPOINT_PUBLICATION_FAILED",
      durableCheckpoint: "absence-volume",
      finalPublished: false,
    });
    expect(checkpointFailure.actions).not.toContain(
      "absence-initializer-container",
    );
  });

  it("preserves exact siblings through fixed add, replacement, copy, and nested-marker deltas", () => {
    const transfer = heldChild("transfer", "directory", 20n);
    const attemptNext = heldChild("attempt.next", "file", 30n);
    const resultBefore = heldSnapshot([transfer], { nlink: 3n });
    const afterWrite = heldSnapshot([attemptNext, transfer], {
      nlink: 3n,
      size: 2n,
      mtimeNs: 2n,
    });
    const afterRename = heldSnapshot(
      [{ ...attemptNext, name: "attempt.json" }, transfer],
      { nlink: 3n, size: 3n, mtimeNs: 3n },
    );
    const attemptTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: resultBefore,
        after: afterWrite,
        expectedBefore: resultBefore.entries,
        expectedAfter: afterWrite.entries,
        linkDelta: 0,
        operation: { kind: "create-attempt-next" },
      },
      {
        before: afterWrite,
        after: afterRename,
        expectedBefore: afterWrite.entries,
        expectedAfter: afterRename.entries,
        linkDelta: 0,
        operation: { kind: "rename-attempt-next" },
      },
    ]);
    expect(runM2aHeldDirectoryTraceForTest(attemptTrace)).toEqual({
      status: "complete",
      actions: ["before:0", "after:0", "before:1", "after:1"],
    });

    const priorAttempt = heldChild("attempt.json", "file", 31n);
    const replacementNext = heldChild("attempt.next", "file", 32n);
    const replacementBefore = heldSnapshot(
      [priorAttempt, replacementNext, transfer],
      { nlink: 3n },
    );
    const replacementAfter = heldSnapshot(
      [{ ...replacementNext, name: "attempt.json" }, transfer],
      { nlink: 3n, size: 2n, mtimeNs: 2n },
    );
    expect(
      runM2aHeldDirectoryTraceForTest(
        createFakeM2aHeldDirectoryTrace([
          {
            before: replacementBefore,
            after: replacementAfter,
            expectedBefore: replacementBefore.entries,
            expectedAfter: replacementAfter.entries,
            linkDelta: 0,
            operation: { kind: "rename-attempt-next" },
          },
        ]),
      ).status,
    ).toBe("complete");

    const completion = heldChild(M2A_TRANSFER.completionPath, "file", 40n);
    const segment = heldChild(M2A_TRANSFER.segmentPath, "file", 41n);
    const copyBefore = heldSnapshot([]);
    const afterCompletion = heldSnapshot([completion], {
      size: 2n,
      mtimeNs: 2n,
    });
    const afterSegment = heldSnapshot([segment, completion], {
      size: 3n,
      mtimeNs: 3n,
    });
    const copyTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: copyBefore,
        after: afterCompletion,
        expectedBefore: copyBefore.entries,
        expectedAfter: afterCompletion.entries,
        linkDelta: 0,
        operation: { kind: "create-completion-copy" },
      },
      {
        before: afterCompletion,
        after: afterSegment,
        expectedBefore: afterCompletion.entries,
        expectedAfter: afterSegment.entries,
        linkDelta: 0,
        operation: { kind: "create-segment-copy" },
      },
    ]);
    expect(runM2aHeldDirectoryTraceForTest(copyTrace).status).toBe("complete");

    const probeOutput = heldChild("probe-output", "directory", 50n);
    const transferAfterProbe = heldSnapshot(
      [segment, probeOutput, completion],
      { nlink: 3n, size: 4n, mtimeNs: 4n },
    );
    const probeTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: afterSegment,
        after: transferAfterProbe,
        expectedBefore: afterSegment.entries,
        expectedAfter: transferAfterProbe.entries,
        linkDelta: 1,
        operation: { kind: "create-probe-output" },
      },
    ]);
    expect(runM2aHeldDirectoryTraceForTest(probeTrace).status).toBe("complete");

    const markerBefore = heldSnapshot([]);
    const marker = heldChild("direct-write-marker.json", "file", 60n);
    const markerAfter = heldSnapshot([marker], { size: 2n, mtimeNs: 2n });
    const transferAfterMarker = heldSnapshot(
      [segment, { ...probeOutput, size: 1n, mtimeNs: 5n }, completion],
      { nlink: 3n, size: 4n, mtimeNs: 4n },
    );
    const markerTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: markerBefore,
        after: markerAfter,
        expectedBefore: markerBefore.entries,
        expectedAfter: markerAfter.entries,
        linkDelta: 0,
        operation: { kind: "create-nested-marker" },
        correlated: {
          before: transferAfterProbe,
          after: transferAfterMarker,
          expectedBefore: transferAfterProbe.entries,
          expectedAfter: transferAfterProbe.entries,
          linkDelta: 0,
          operation: { kind: "create-nested-marker" },
        },
      },
    ]);
    expect(runM2aHeldDirectoryTraceForTest(markerTrace)).toEqual({
      status: "complete",
      actions: ["before:0", "after:0"],
    });
    expect(() =>
      runM2aHeldDirectoryTraceForTest({ steps: [] } as never),
    ).toThrow("M2A_DIRECTORY_TRACE_FAKE_REQUIRED");
  });

  it("rejects every full-identity drift in an unchanged same-name sibling before adoption", () => {
    const completion = heldChild(M2A_TRANSFER.completionPath, "file", 10n);
    const transfer = heldChild("transfer", "directory", 20n);
    const attemptNext = heldChild("attempt.next", "file", 30n);
    const before = heldSnapshot([transfer, completion], { nlink: 3n });
    const validAfter = heldSnapshot([attemptNext, transfer, completion], {
      nlink: 3n,
      size: 2n,
      mtimeNs: 2n,
    });
    const drifts: Array<Partial<FakeM2aHeldChildIdentity>> = [
      { type: "directory", mode: 0o40700n, nlink: 2n },
      { dev: 2n },
      { ino: 11n },
      { mode: 0o100640n },
      { mode: 0o101600n },
      { uid: 1001n },
      { gid: 1001n },
      { nlink: 2n },
      { size: 11n },
      { mtimeNs: 2n },
    ];
    for (const drift of drifts) {
      const changedCompletion = { ...completion, ...drift } as never;
      const after = heldSnapshot([attemptNext, transfer, changedCompletion], {
        nlink: 3n,
        size: 2n,
        mtimeNs: 2n,
      });
      const trace = createFakeM2aHeldDirectoryTrace([
        {
          before,
          after,
          expectedBefore: before.entries,
          expectedAfter: validAfter.entries,
          linkDelta: 0,
          operation: { kind: "create-attempt-next" },
        },
      ] as never);
      expect(() => runM2aHeldDirectoryTraceForTest(trace)).toThrow();
      expect(trace.snapshotActions()).toEqual(["before:0"]);
    }
  });

  it("rejects aliases, disconnected child maps, wrong rename identity, and unrelated replacement", () => {
    const completion = heldChild(M2A_TRANSFER.completionPath, "file", 10n);
    const transfer = heldChild("transfer", "directory", 20n);
    const attemptNext = heldChild("attempt.next", "file", 30n);
    const before = heldSnapshot([transfer, completion], { nlink: 3n });
    const validAfter = heldSnapshot([attemptNext, transfer, completion], {
      nlink: 3n,
      size: 2n,
      mtimeNs: 2n,
    });
    const inherited = Object.create(completion) as FakeM2aHeldChildIdentity;
    const accessor = { ...completion } as Record<string, unknown>;
    Object.defineProperty(accessor, "ino", {
      enumerable: true,
      get: () => 10n,
    });
    const sparse = [attemptNext, completion, transfer];
    sparse.length = 4;
    const malformedAfters = [
      heldSnapshot([attemptNext, transfer, completion], {
        ino: 8n,
        nlink: 3n,
        size: 2n,
        mtimeNs: 2n,
      }),
      {
        ...validAfter,
        children: [
          { ...attemptNext, dev: completion.dev, ino: completion.ino },
          transfer,
          completion,
        ],
      },
      { ...validAfter, children: [attemptNext, transfer] },
      { ...validAfter, children: [...validAfter.children, completion] },
      { ...validAfter, children: [transfer, attemptNext, completion] },
      { ...validAfter, children: [attemptNext, transfer, inherited] },
      { ...validAfter, children: [attemptNext, transfer, accessor] },
      { ...validAfter, children: sparse },
      {
        ...validAfter,
        children: [
          attemptNext,
          transfer,
          { ...completion, name: "other.json" },
        ],
      },
    ];
    for (const after of malformedAfters) {
      const trace = createFakeM2aHeldDirectoryTrace([
        {
          before,
          after,
          expectedBefore: before.entries,
          expectedAfter: validAfter.entries,
          linkDelta: 0,
          operation: { kind: "create-attempt-next" },
        },
      ] as never);
      expect(() => runM2aHeldDirectoryTraceForTest(trace)).toThrow();
      expect(trace.snapshotActions()).toEqual(["before:0"]);
    }

    const renameBefore = heldSnapshot([attemptNext, transfer, completion], {
      nlink: 3n,
    });
    const wrongRenameAfter = heldSnapshot(
      [heldChild("attempt.json", "file", 31n), transfer, completion],
      { nlink: 3n, size: 2n, mtimeNs: 2n },
    );
    const renameTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: renameBefore,
        after: wrongRenameAfter,
        expectedBefore: renameBefore.entries,
        expectedAfter: wrongRenameAfter.entries,
        linkDelta: 0,
        operation: { kind: "rename-attempt-next" },
      },
    ]);
    expect(() => runM2aHeldDirectoryTraceForTest(renameTrace)).toThrow();
    expect(renameTrace.snapshotActions()).toEqual(["before:0"]);

    const replacedCompletionAfter = heldSnapshot(
      [attemptNext, transfer, { ...completion, ino: 11n }],
      { nlink: 3n, size: 2n, mtimeNs: 2n },
    );
    const replacementTrace = createFakeM2aHeldDirectoryTrace([
      {
        before,
        after: replacedCompletionAfter,
        expectedBefore: before.entries,
        expectedAfter: validAfter.entries,
        linkDelta: 0,
        operation: { kind: "create-attempt-next" },
      },
    ]);
    expect(() => runM2aHeldDirectoryTraceForTest(replacementTrace)).toThrow(
      "M2A_RUNTIME_CHILD_IDENTITY_DRIFT",
    );
    expect(replacementTrace.snapshotActions()).toEqual(["before:0"]);
  });

  it("keeps the prior baseline when nested or later child correlation rejects", () => {
    const completion = heldChild(M2A_TRANSFER.completionPath, "file", 10n);
    const probeOutput = heldChild("probe-output", "directory", 20n);
    const transferBefore = heldSnapshot([probeOutput, completion], {
      nlink: 3n,
    });
    const substitutedTransfer = heldSnapshot(
      [{ ...probeOutput, ino: 21n, size: 1n, mtimeNs: 2n }, completion],
      { nlink: 3n },
    );
    const markerBefore = heldSnapshot([]);
    const markerAfter = heldSnapshot(
      [heldChild("direct-write-marker.json", "file", 30n)],
      { size: 2n, mtimeNs: 2n },
    );
    const nestedTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: markerBefore,
        after: markerAfter,
        expectedBefore: markerBefore.entries,
        expectedAfter: markerAfter.entries,
        linkDelta: 0,
        operation: { kind: "create-nested-marker" },
        correlated: {
          before: transferBefore,
          after: substitutedTransfer,
          expectedBefore: transferBefore.entries,
          expectedAfter: transferBefore.entries,
          linkDelta: 0,
          operation: { kind: "create-nested-marker" },
        },
      },
    ]);
    expect(() => runM2aHeldDirectoryTraceForTest(nestedTrace)).toThrow();
    expect(nestedTrace.snapshotActions()).toEqual(["before:0"]);

    const attemptNext = heldChild("attempt.next", "file", 40n);
    const resultBefore = heldSnapshot([completion], { nlink: 3n });
    const afterWrite = heldSnapshot([attemptNext, completion], {
      nlink: 3n,
      size: 2n,
      mtimeNs: 2n,
    });
    const replacedBeforeRename = heldSnapshot(
      [attemptNext, { ...completion, ino: 11n }],
      { nlink: 3n, size: 2n, mtimeNs: 2n },
    );
    const afterRename = heldSnapshot(
      [{ ...attemptNext, name: "attempt.json" }, completion],
      { nlink: 3n, size: 3n, mtimeNs: 3n },
    );
    const preAdoptionTrace = createFakeM2aHeldDirectoryTrace([
      {
        before: resultBefore,
        after: afterWrite,
        expectedBefore: resultBefore.entries,
        expectedAfter: afterWrite.entries,
        linkDelta: 0,
        operation: { kind: "create-attempt-next" },
      },
      {
        before: replacedBeforeRename,
        after: afterRename,
        expectedBefore: afterWrite.entries,
        expectedAfter: afterRename.entries,
        linkDelta: 0,
        operation: { kind: "rename-attempt-next" },
      },
    ]);
    expect(() => runM2aHeldDirectoryTraceForTest(preAdoptionTrace)).toThrow(
      "M2A_RUNTIME_DIRECTORY_IDENTITY_DRIFT",
    );
    expect(preAdoptionTrace.snapshotActions()).toEqual([
      "before:0",
      "after:0",
      "before:1",
    ]);
  });
});

function inputResponse(kind: "metadata" | "tarball"): Record<string, unknown> {
  const bytes =
    kind === "metadata"
      ? Buffer.from(
          JSON.stringify({
            name: "npm",
            version: "12.0.1",
            dist: {
              tarball: "https://registry.npmjs.org/npm/-/npm-12.0.1.tgz",
              integrity: `sha512-${Buffer.alloc(64, 3).toString("base64")}`,
            },
          }),
        )
      : Buffer.from("tarball");
  return {
    status: 200,
    contentType:
      kind === "metadata"
        ? "application/vnd.npm.install-v1+json; charset=utf-8"
        : "application/octet-stream",
    contentEncoding: "identity",
    contentLength: bytes.length,
    chunks: [bytes],
    eof: true,
    deadlineExceeded: false,
    requestSettled: true,
    responseSettled: true,
  };
}

function heldInputRow(
  logicalPath: string,
  type: "directory" | "file",
  index: number,
): Record<string, unknown> {
  return {
    path: logicalPath,
    parent: logicalPath.includes("/")
      ? logicalPath.slice(0, logicalPath.lastIndexOf("/"))
      : "",
    name: logicalPath.slice(logicalPath.lastIndexOf("/") + 1),
    type,
    mode: type === "directory" ? 0o700 : 0o444,
    uid: 1000,
    gid: 1000,
    links: 1,
    device: "1",
    inode: String(index),
    size: String(type === "file" ? index : 0),
    mtimeNs: String(1000 + index),
    sparse: false,
    sha256: type === "file" ? `sha256:${String(index % 10).repeat(64)}` : null,
  };
}

function attemptIdentity(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    type: "directory",
    mode: 0o700,
    uid: 1000,
    gid: 1000,
    links: 2,
    device: "1",
    inode: "102",
    size: "9007199254740993",
    mtimeNs: "1001",
    ...overrides,
  };
}

function dependencyAttemptTransition(): {
  opened: Record<string, unknown>;
  correlated: Record<string, unknown>;
} {
  const parentBefore = attemptIdentity({
    links: 2,
    inode: "100",
    size: "1",
    mtimeNs: "1000",
  });
  const parentAfter = {
    ...parentBefore,
    links: 3,
    size: "2",
    mtimeNs: "1001",
  };
  const child = attemptIdentity();
  const retained = {
    name: "retained",
    identity: attemptIdentity({
      type: "file",
      mode: 0o444,
      links: 1,
      inode: "101",
      size: "1",
      mtimeNs: "900",
    }),
  };
  const committed = {
    name: "m2a-transfer-toolchain-attempt-20260721-01",
    identity: structuredClone(child),
  };
  return {
    opened: {
      ok: true,
      settlement: "known",
      pathParentBefore: parentBefore,
      pathParentAfter: parentAfter,
      pathChild: structuredClone(child),
      heldChild: structuredClone(child),
      effectiveUid: 1000,
      effectiveGid: 1000,
    },
    correlated: {
      ok: true,
      settlement: "known",
      parentBefore,
      parentAfter,
      childrenBefore: [retained],
      childrenAfter: [committed, structuredClone(retained)],
    },
  };
}

function dependencyRuntimeProjection(): Record<string, unknown> {
  return {
    version: "v20.18.2",
    platform: "linux",
    architecture: "x64",
    executableType: "file",
    executableSize: 9,
    executableSha256: `sha256:${"9".repeat(64)}`,
    mode: 0o555,
    links: 1,
    sparse: false,
    reportDense: true,
    sharedObjects: ["/synthetic/libc.so", "/synthetic/libm.so"],
    sharedObjectRows: [
      {
        sourcePath: "/synthetic/libc.so",
        logicalPath: "runtime/shared/000-libc.so",
        type: "file",
        mode: 0o555,
        links: 1,
        size: 10,
        sha256: `sha256:${"8".repeat(64)}`,
        device: "1",
        inode: "200",
        sparse: false,
        sourceConnected: true,
      },
      {
        sourcePath: "/synthetic/libm.so",
        logicalPath: "runtime/shared/001-libm.so",
        type: "file",
        mode: 0o555,
        links: 1,
        size: 11,
        sha256: `sha256:${"7".repeat(64)}`,
        device: "1",
        inode: "201",
        sparse: false,
        sourceConnected: true,
      },
    ],
  };
}

function dependencySourceGraph(): Record<string, unknown>[] {
  return [
    heldInputRow("packages/@types/node", "directory", 1),
    heldInputRow("packages/@types/node/index.d.ts", "file", 2),
    heldInputRow("packages/typescript", "directory", 3),
    heldInputRow("packages/typescript/bin", "directory", 4),
    heldInputRow("packages/typescript/bin/tsc", "file", 5),
    heldInputRow("packages/undici-types", "directory", 6),
    heldInputRow("packages/undici-types/index.d.ts", "file", 7),
  ];
}

function dependencyDestinationGraph(
  inventory: Record<string, unknown>[],
): Record<string, unknown>[] {
  const directories = [
    "packages",
    "packages/@types",
    "packages/@types/node",
    "packages/typescript",
    "packages/undici-types",
    "runtime",
    "runtime/shared",
  ].map((item, index) => heldInputRow(item, "directory", index + 20));
  const files = inventory
    .filter((row) => row.logicalPath !== "runtime/constructor-node")
    .map((row, index): Record<string, unknown> => ({
      ...heldInputRow(String(row.logicalPath), "file", index + 40),
      size: String(row.size),
      sha256: row.sha256,
    }));
  return [...directories, ...files].sort((left, right) =>
    Buffer.from(String(left.path)).compare(Buffer.from(String(right.path))),
  );
}

function dependencyInputInventory(): Record<string, unknown>[] {
  return [
    {
      logicalPath: "packages/@types/node/index.d.ts",
      mode: 0o444,
      size: 2,
      sha256: `sha256:${"2".repeat(64)}`,
    },
    {
      logicalPath: "packages/typescript/bin/tsc",
      mode: 0o444,
      size: 3,
      sha256: `sha256:${"3".repeat(64)}`,
    },
    {
      logicalPath: "packages/undici-types/index.d.ts",
      mode: 0o444,
      size: 4,
      sha256: `sha256:${"4".repeat(64)}`,
    },
    {
      logicalPath: "runtime/constructor-node",
      mode: 0o555,
      size: 5,
      sha256: `sha256:${"5".repeat(64)}`,
    },
    {
      logicalPath: "runtime/shared/000-libc.so",
      mode: 0o444,
      size: 6,
      sha256: `sha256:${"6".repeat(64)}`,
    },
  ];
}

function dependencyInputReceipt(
  inventory = dependencyInputInventory(),
): Buffer {
  return createToolchainReceiptBytes({
    runtime: {
      logicalId: "constructor-node",
      version: "v20.18.2",
      platform: "linux",
      architecture: "x64",
      executableSize: 5,
      executableSha256: `sha256:${"5".repeat(64)}`,
    },
    packages: M2A_CONSTRUCTION.toolchainPackages.map((row) => {
      const item = row as Record<string, unknown>;
      return {
        name: item.name,
        version: item.version,
        integrity: item.integrity,
      };
    }),
    inventory,
  });
}

function rebuildConstructorReceipt(
  receiptInput: Buffer,
  mutate: (inventory: Record<string, unknown>[]) => void,
): string {
  const receipt = JSON.parse(receiptInput.toString("utf8")) as Record<
    string,
    unknown
  >;
  const inventory = structuredClone(receipt.inventory) as Record<
    string,
    unknown
  >[];
  mutate(inventory);
  const runtimeRows = inventory.filter((row) =>
    String(row.logicalPath).startsWith("runtime/"),
  );
  const runtime = receipt.runtime as Record<string, unknown>;
  runtime.loadedRuntimeInventoryAggregate = sha256(JSON.stringify(runtimeRows));
  const prefixes = [
    "packages/typescript/",
    "packages/@types/node/",
    "packages/undici-types/",
  ];
  const packages = receipt.packages as Record<string, unknown>[];
  packages.forEach((row, index) => {
    row.inventoryAggregate = sha256(
      JSON.stringify(
        inventory.filter((item) =>
          String(item.logicalPath).startsWith(prefixes[index]!),
        ),
      ),
    );
  });
  receipt.inventory = inventory;
  receipt.inventoryAggregate = sha256(JSON.stringify(inventory));
  return canonical(receipt);
}

describe("M2-A dependency-input static/unit boundary", () => {
  it("pins exact fixed authority without accepting caller-owned request data", () => {
    expect(M2A_INPUTS).toMatchObject({
      generation: "20260721-01",
      npmVersion: "12.0.1",
      requestAbsoluteDeadlineMs: 30_000,
      requestDestroyGraceMs: 250,
      requestCloseDeadlineMs: 1_000,
      evidenceReview: "not-performed",
    });
    const plan = createFixedNpmRequestPlan();
    expect(plan.map((row) => row.id)).toEqual(["metadata", "tarball"]);
    expect(validateFixedNpmRequestPlan(structuredClone(plan))).toEqual(plan);
    const redirected = structuredClone(plan) as Record<string, unknown>[];
    redirected[0]!.hostname = "mirror.invalid";
    expect(() => validateFixedNpmRequestPlan(redirected)).toThrow(
      "M2A_INPUT_REQUEST_PLAN_INVALID",
    );
    const sparse = [...structuredClone(plan)];
    delete sparse[0];
    expect(() => validateFixedNpmRequestPlan(sparse)).toThrow(
      "M2A_INPUT_REQUEST_PLAN_INVALID",
    );
    let getterCalls = 0;
    const accessor = structuredClone(plan) as Record<string, unknown>[];
    Object.defineProperty(accessor[0], "hostname", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "registry.npmjs.org";
      },
    });
    expect(() => validateFixedNpmRequestPlan(accessor)).toThrow(
      "M2A_INPUT_REQUEST_PLAN_INVALID",
    );
    expect(getterCalls).toBe(0);
    let proxyCalls = 0;
    const proxy = new Proxy(structuredClone(plan), {
      get() {
        proxyCalls += 1;
        return undefined;
      },
    });
    expect(() => validateFixedNpmRequestPlan(proxy)).toThrow(
      "M2A_INPUT_REQUEST_PLAN_INVALID",
    );
    expect(proxyCalls).toBe(0);
  });

  it("validates untrusted response, metadata, SRI, deadline, EOF, and settlement", () => {
    expect(
      validateNpmResponseForTest("metadata", inputResponse("metadata")),
    ).toBeInstanceOf(Buffer);
    for (const [key, value] of [
      ["status", 302],
      ["contentEncoding", "gzip"],
      ["contentLength", 1],
      ["eof", false],
      ["deadlineExceeded", true],
      ["requestSettled", false],
      ["responseSettled", false],
    ] as const) {
      const response = inputResponse("metadata");
      response[key] = value;
      expect(() => validateNpmResponseForTest("metadata", response)).toThrow(
        "M2A_INPUT_RESPONSE_INVALID",
      );
    }
    const contentType = inputResponse("metadata");
    contentType.contentType = "text/html";
    expect(() => validateNpmResponseForTest("metadata", contentType)).toThrow(
      "M2A_INPUT_RESPONSE_INVALID",
    );
    const metadata = inputResponse("metadata").chunks as Buffer[];
    expect(validateNpmMetadataBytes(metadata[0]!)).toEqual({
      integrity: `sha512-${Buffer.alloc(64, 3).toString("base64")}`,
    });
    for (const mutation of [
      { name: "other" },
      { version: "12.0.2" },
      {
        dist: {
          tarball: "https://example.invalid/npm.tgz",
          integrity: `sha512-${Buffer.alloc(64, 3).toString("base64")}`,
        },
      },
    ]) {
      const parsed = JSON.parse(metadata[0]!.toString("utf8")) as Record<
        string,
        unknown
      >;
      Object.assign(parsed, mutation);
      expect(() =>
        validateNpmMetadataBytes(Buffer.from(JSON.stringify(parsed))),
      ).toThrow("M2A_INPUT_METADATA_INVALID");
    }
  });

  it("builds only canonical acquisition receipts and fail-closes fake publication", async () => {
    const observation = {
      tarballSize: 4,
      tarballSha256: `sha256:${"a".repeat(64)}`,
      integrity: `sha512-${Buffer.alloc(64, 4).toString("base64")}`,
    };
    const receipt = createAcquisitionReceiptBytes(observation);
    expect(validateAcquisitionReceiptBytes(receipt)).toMatchObject({
      receipt: {
        status: "complete",
        scriptsRun: false,
        credentialsUsed: false,
        evidenceReview: "not-performed",
      },
    });
    expect(() =>
      validateAcquisitionReceiptBytes(
        Buffer.concat([receipt, Buffer.from("\n")]),
      ),
    ).toThrow("M2A_INPUT_ACQUISITION_INVALID");
    const success = await runM2aNpmAcquisitionForTest(
      createFakeM2aNpmInputBackend(),
    );
    expect(success).toMatchObject({
      status: "complete",
      requestCount: 2,
      published: true,
      retry: false,
      cleanup: false,
      evidenceReview: "not-performed",
    });
    for (const step of [
      "archive-write",
      "archive-sync",
      "archive-reread",
      "archive-mode",
      "archive-identity",
      "archive-close",
      "archive-rename",
      "archive-root-sync",
      "receipt-write",
      "receipt-sync",
      "receipt-reread",
      "receipt-mode",
      "receipt-identity",
      "receipt-close",
      "receipt-rename",
      "receipt-root-sync",
    ]) {
      const result = await runM2aNpmAcquisitionForTest(
        createFakeM2aNpmInputBackend({
          [step]: { ok: false, settlement: "unknown" },
        }),
      );
      expect(result).toMatchObject({
        status: "failed",
        published: false,
        retained: true,
        retry: false,
        cleanup: false,
      });
    }
    const present = await runM2aNpmAcquisitionForTest(
      createFakeM2aNpmInputBackend({
        "root-preflight": {
          acquisitionRoot: "present",
          staging: "unknown",
        },
      }),
    );
    expect(present).toMatchObject({
      status: "failed",
      requestCount: 0,
      rootCreated: false,
    });
  });

  it("cross-binds both held source traversals and the complete destination graph", () => {
    const source = [
      heldInputRow("packages/@types/node", "directory", 1),
      heldInputRow("packages/@types/node/index.d.ts", "file", 2),
      heldInputRow("packages/typescript", "directory", 3),
      heldInputRow("packages/typescript/bin", "directory", 4),
      heldInputRow("packages/typescript/bin/tsc", "file", 5),
      heldInputRow("packages/undici-types", "directory", 6),
      heldInputRow("packages/undici-types/index.d.ts", "file", 7),
    ];
    expect(validateHeldGraphPair(source, structuredClone(source))).toEqual(
      source,
    );
    for (const mutated of [
      source.slice(0, -1),
      [...source, heldInputRow("packages/typescript/extra.ts", "file", 8)],
      source.map((row, index) =>
        index === 1 ? { ...row, parent: "packages/typescript" } : row,
      ),
      source.map((row, index) =>
        index === 1 ? { ...row, inode: "999" } : row,
      ),
      source.map((row, index) =>
        index === 1 ? { ...row, path: "packages/@types/node/Index.d.ts" } : row,
      ),
    ]) {
      expect(() => validateHeldGraphPair(source, mutated)).toThrow(
        "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID",
      );
    }
    const inventory = dependencyInputInventory();
    const directories = [
      "packages",
      "packages/@types",
      "packages/@types/node",
      "packages/typescript",
      "packages/undici-types",
      "runtime",
      "runtime/shared",
    ].map((item, index) => heldInputRow(item, "directory", index + 20));
    const files: Record<string, unknown>[] = inventory
      .filter((row) => row.logicalPath !== "runtime/constructor-node")
      .map((row, index): Record<string, unknown> => ({
        ...heldInputRow(String(row.logicalPath), "file", index + 40),
        size: String(row.size),
        sha256: row.sha256,
      }));
    const graph: Record<string, unknown>[] = [...directories, ...files].sort(
      (left, right) => String(left.path).localeCompare(String(right.path)),
    );
    expect(validateDestinationGraph(graph, inventory)).toEqual(graph);
    expect(() =>
      validateDestinationGraph(
        [...graph, heldInputRow("runtime/shared/extra.next", "file", 99)].sort(
          (left, right) => String(left.path).localeCompare(String(right.path)),
        ),
        inventory,
      ),
    ).toThrow("M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID");
    expect(() => validateDestinationGraph(graph.slice(1), inventory)).toThrow(
      "M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID",
    );
  });

  it("rejects every package family source tuple and traversal contradiction", () => {
    const families = [
      {
        root: "packages/@types/node",
        file: "packages/@types/node/index.d.ts",
        packageIndex: 1,
      },
      {
        root: "packages/typescript",
        file: "packages/typescript/bin/tsc",
        packageIndex: 0,
      },
      {
        root: "packages/undici-types",
        file: "packages/undici-types/index.d.ts",
        packageIndex: 2,
      },
    ];
    for (const family of families) {
      const tuple = {
        runtime: {
          logicalId: "constructor-node",
          version: "v20.18.2",
          platform: "linux",
          architecture: "x64",
          executableSize: 5,
          executableSha256: `sha256:${"5".repeat(64)}`,
        },
        packages: M2A_CONSTRUCTION.toolchainPackages.map((row) => {
          const item = row as Record<string, unknown>;
          return {
            name: item.name,
            version: item.version,
            integrity: item.integrity,
          };
        }),
        inventory: dependencyInputInventory(),
      };
      for (const key of ["version", "integrity"] as const) {
        const changed = structuredClone(tuple);
        changed.packages[family.packageIndex]![key] =
          key === "version"
            ? "0.0.0"
            : `sha512-${Buffer.alloc(64, 9).toString("base64")}`;
        expect(() => createToolchainReceiptBytes(changed)).toThrow(
          "M2A_TOOLCHAIN_RECEIPT_INVALID",
        );
      }

      const sameTraversalMutations: Array<
        (graph: Record<string, unknown>[]) => void
      > = [
        (graph) => {
          const root = graph.find((row) => row.path === family.root)!;
          root.path = `${family.root}-renamed`;
          root.name = `${String(root.name)}-renamed`;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.parent =
            "packages/typescript";
        },
        (graph) => {
          graph.find((row) => row.path === family.root)!.type = "file";
        },
        (graph) => {
          graph.find((row) => row.path === family.root)!.mode = 0o755;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.uid = 1001;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.gid = 1001;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.links = 2;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.sparse = true;
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.size = "0";
        },
        (graph) => {
          const target = graph.find((row) => row.path === family.file)!;
          const other = graph.find(
            (row) => row.type === "file" && row.path !== family.file,
          )!;
          target.device = other.device;
          target.inode = other.inode;
        },
        (graph) => {
          graph.push(
            structuredClone(graph.find((row) => row.path === family.file)!),
          );
        },
        (graph) => {
          const alias = structuredClone(
            graph.find((row) => row.path === family.file)!,
          );
          alias.path = String(alias.path).toUpperCase();
          alias.parent = String(alias.parent).toUpperCase();
          alias.name = String(alias.name).toUpperCase();
          alias.inode = "999";
          graph.push(alias);
          graph.sort((left, right) =>
            Buffer.from(String(left.path)).compare(
              Buffer.from(String(right.path)),
            ),
          );
        },
        (graph) => {
          graph.reverse();
        },
        (graph) => {
          graph.splice(
            graph.findIndex((row) => row.path === family.file),
            1,
          );
        },
        (graph) => {
          graph.find((row) => row.path === family.file)!.type = "unknown";
        },
      ];
      for (const mutate of sameTraversalMutations) {
        const first = dependencySourceGraph();
        mutate(first);
        expect(() =>
          validateHeldGraphPair(first, structuredClone(first)),
        ).toThrow("M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID");
      }

      const traversalDrifts: Array<
        (second: Record<string, unknown>[]) => void
      > = [
        (second) => {
          second.push(heldInputRow(`${family.root}/added.d.ts`, "file", 99));
          second.sort((left, right) =>
            Buffer.from(String(left.path)).compare(
              Buffer.from(String(right.path)),
            ),
          );
        },
        (second) => {
          second.splice(
            second.findIndex((row) => row.path === family.file),
            1,
          );
        },
        (second) => {
          const row = second.find((item) => item.path === family.file)!;
          row.path = `${family.root}/renamed.d.ts`;
          row.name = "renamed.d.ts";
        },
        (second) => {
          second.find((row) => row.path === family.file)!.parent =
            "packages/typescript";
        },
        (second) => {
          second.find((row) => row.path === family.root)!.inode = "997";
        },
        (second) => {
          second.find((row) => row.path === family.file)!.inode = "998";
        },
        (second) => {
          second.find((row) => row.path === family.file)!.sha256 =
            `sha256:${"f".repeat(64)}`;
        },
        (second) => {
          second.find((row) => row.path === family.file)!.mtimeNs = "9999";
        },
      ];
      for (const mutate of traversalDrifts) {
        const first = dependencySourceGraph();
        const second = structuredClone(first);
        mutate(second);
        expect(() => validateHeldGraphPair(first, second)).toThrow(
          "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID",
        );
      }
    }
  });

  it("rejects every final destination graph contradiction", () => {
    const mutations: Array<
      (
        graph: Record<string, unknown>[],
        inventory: Record<string, unknown>[],
      ) => void
    > = [
      (graph) => {
        graph.push(heldInputRow("runtime/shared/extra.so", "file", 99));
        graph.sort((left, right) =>
          Buffer.from(String(left.path)).compare(
            Buffer.from(String(right.path)),
          ),
        );
      },
      (graph) => {
        graph.splice(1, 1);
      },
      (graph) => {
        graph.push(heldInputRow("runtime/shared/file.next", "file", 99));
        graph.sort((left, right) =>
          Buffer.from(String(left.path)).compare(
            Buffer.from(String(right.path)),
          ),
        );
      },
      (graph) => {
        graph.reverse();
      },
      (graph) => {
        graph[1]!.device = graph[0]!.device;
        graph[1]!.inode = graph[0]!.inode;
      },
      (graph) => {
        graph.find(
          (row) => row.path === "packages/@types/node/index.d.ts",
        )!.parent = "packages/typescript";
      },
      (graph) => {
        graph.find(
          (row) => row.path === "packages/@types/node/index.d.ts",
        )!.type = "directory";
      },
      (graph) => {
        graph.find((row) => row.path === "runtime/shared")!.mode = 0o755;
      },
      (graph) => {
        graph.find((row) => row.path === "runtime/shared")!.uid = 1001;
      },
      (graph) => {
        graph.find((row) => row.path === "runtime/shared/000-libc.so")!.size =
          "999";
      },
      (graph) => {
        graph.find((row) => row.path === "runtime/shared/000-libc.so")!.sha256 =
          `sha256:${"0".repeat(64)}`;
      },
      (graph) => {
        graph.push(heldInputRow("runtime/constructor-node", "file", 99));
        graph.sort((left, right) =>
          Buffer.from(String(left.path)).compare(
            Buffer.from(String(right.path)),
          ),
        );
      },
      (_graph, inventory) => {
        inventory.find(
          (row) => row.logicalPath === "runtime/shared/000-libc.so",
        )!.mode = 0o555;
      },
    ];
    for (const mutate of mutations) {
      const inventory = dependencyInputInventory();
      const graph = dependencyDestinationGraph(inventory);
      mutate(graph, inventory);
      expect(() => validateDestinationGraph(graph, inventory)).toThrow(
        "M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID",
      );
    }
  });

  it("models the synchronous attempt commit and every durable checkpoint terminal", async () => {
    expect(
      classifyToolchainAttemptCommitForTest("process-loss-before-commit"),
    ).toEqual({
      root: "absent",
      occurrence: "not-started",
      freshInvocationMayCommit: true,
    });
    for (const event of [
      "commit-returned",
      "process-loss-after-commit",
      "process-loss-before-checkpoint",
    ] as const) {
      expect(classifyToolchainAttemptCommitForTest(event)).toEqual({
        root: "present",
        occurrence: "started-non-evidence",
        freshInvocationMayCommit: false,
      });
    }
    expect(classifyToolchainAttemptCommitForTest("existing-root")).toEqual({
      root: "present",
      occurrence: "existing-wins",
      freshInvocationMayCommit: false,
    });
    for (const state of [
      {
        state: "in-progress",
        issue: "M2A_TOOLCHAIN_IN_PROGRESS",
        toolchainReceiptSha256: null,
        inventoryAggregate: null,
      },
      {
        state: "failed",
        issue: "M2A_TOOLCHAIN_FAILED",
        toolchainReceiptSha256: null,
        inventoryAggregate: null,
      },
      {
        state: "failed",
        issue: "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN",
        toolchainReceiptSha256: null,
        inventoryAggregate: null,
      },
      {
        state: "complete",
        issue: null,
        toolchainReceiptSha256: `sha256:${"a".repeat(64)}`,
        inventoryAggregate: `sha256:${"b".repeat(64)}`,
      },
    ]) {
      expect(
        validateToolchainAttemptBytes(createToolchainAttemptBytes(state)),
      ).toMatchObject({ attempt: { state: state.state, issue: state.issue } });
    }
    expect(() =>
      createToolchainAttemptBytes({
        state: "failed",
        issue: "raw stack",
        toolchainReceiptSha256: null,
        inventoryAggregate: null,
      }),
    ).toThrow("M2A_TOOLCHAIN_ATTEMPT_INVALID");
    const unknownCreate = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend({
        "create-attempt-root": { outcome: "unknown" },
      }),
    );
    expect(unknownCreate).toMatchObject({
      status: "not-started",
      issue: "M2A_TOOLCHAIN_INITIAL_CREATE_INVALID",
      attemptRootCommitted: false,
      retry: false,
    });
    const knownNoCreate = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend({
        "create-attempt-root": { outcome: "error" },
      }),
    );
    expect(knownNoCreate).toMatchObject({
      status: "not-started",
      attemptRootCommitted: false,
      checkpoint: "absent",
      retry: true,
    });
    const existing = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend({
        "create-attempt-root": { outcome: "exists" },
      }),
    );
    expect(existing).toMatchObject({
      status: "not-started",
      issue: "M2A_TOOLCHAIN_ROOT_PRESENT",
      retry: false,
    });
    for (const step of [
      "open-attempt-root",
      "correlate-attempt-root",
      "attempt-parent-sync",
      "attempt-in-progress-write",
      "attempt-in-progress-sync",
      "attempt-in-progress-reread",
      "attempt-in-progress-mode",
      "attempt-in-progress-close",
      "attempt-in-progress-rename",
      "attempt-root-sync",
      "attempt-child-close",
      "attempt-parent-close",
    ]) {
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({
          [step]: { ok: false, settlement: "unknown" },
        }),
      );
      expect(result).toMatchObject({
        status: "failed",
        attemptRootCommitted: true,
        checkpoint: "retained",
        retry: false,
        cleanup: false,
      });
      expect(result.trace).not.toContain("runtime");
    }
  });

  it("consumes an exact own-data parent-sync fact before checkpoint publication", async () => {
    let accessorCalls = 0;
    const accessor = { ok: true, settlement: "known" } as Record<
      string,
      unknown
    >;
    Object.defineProperty(accessor, "parentSynced", {
      enumerable: true,
      get() {
        accessorCalls += 1;
        return true;
      },
    });
    const inherited = Object.assign(
      Object.create({ parentSynced: true }) as Record<string, unknown>,
      { ok: true, settlement: "known" },
    );
    const symbol = {
      ok: true,
      settlement: "known",
      parentSynced: true,
    } as Record<PropertyKey, unknown>;
    symbol[Symbol("parent-sync")] = true;
    const proxy = new Proxy(
      { ok: true, settlement: "known", parentSynced: true },
      {},
    );
    const invalidParentSyncRecords: unknown[] = [
      { ok: true, settlement: "known", parentSynced: false },
      { ok: true, settlement: "known" },
      { ok: true, settlement: "known", parentSynced: true, extra: true },
      { parentSynced: true, ok: true, settlement: "known" },
      inherited,
      accessor,
      symbol,
      proxy,
      { ok: false, settlement: "known", parentSynced: true },
      { ok: true, settlement: "unknown", parentSynced: true },
    ];
    for (const [
      recordIndex,
      parentSync,
    ] of invalidParentSyncRecords.entries()) {
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({
          "attempt-parent-sync": parentSync,
        }),
      );
      expect(result, `parent sync record ${recordIndex}`).toMatchObject({
        status: "failed",
        issue: "M2A_TOOLCHAIN_ATTEMPT-PARENT-SYNC",
        attemptRootCommitted: true,
        checkpoint: "retained",
        toolchainPublished: false,
        retry: false,
        cleanup: false,
      });
      expect((result.trace as string[]).at(-1)).toBe("failed-checkpoint");
      expect(result.trace).not.toContain("attempt-in-progress-write");
      expect(result.trace).not.toContain("runtime");
    }
    expect(accessorCalls).toBe(0);
  });

  it("rejects malformed exact-key-shape attempt identities before checkpoint publication", async () => {
    const exactAttemptIdentityKeys = [
      "type",
      "mode",
      "uid",
      "gid",
      "links",
      "device",
      "inode",
      "size",
      "mtimeNs",
    ];
    expect(Object.keys(attemptIdentity())).toEqual(exactAttemptIdentityKeys);

    const missing = attemptIdentity();
    delete missing.mtimeNs;
    const inherited = attemptIdentity();
    delete inherited.mtimeNs;
    Object.setPrototypeOf(inherited, { mtimeNs: "1001" });
    let accessorCalls = 0;
    const accessor = attemptIdentity();
    Object.defineProperty(accessor, "mtimeNs", {
      enumerable: true,
      get() {
        accessorCalls += 1;
        return "1001";
      },
    });
    const symbol = attemptIdentity() as Record<PropertyKey, unknown>;
    symbol[Symbol("attempt-identity")] = "unexpected";
    let proxyTrapCalls = 0;
    const proxy = new Proxy(attemptIdentity(), {
      get(target, key, receiver) {
        proxyTrapCalls += 1;
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor(target, key) {
        proxyTrapCalls += 1;
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      getPrototypeOf(target) {
        proxyTrapCalls += 1;
        return Reflect.getPrototypeOf(target);
      },
      ownKeys(target) {
        proxyTrapCalls += 1;
        return Reflect.ownKeys(target);
      },
    });
    const malformedAttemptIdentities: Array<{
      label:
        | "missing"
        | "extra"
        | "reordered"
        | "inherited"
        | "accessor"
        | "symbol"
        | "proxy";
      value: unknown;
    }> = [
      { label: "missing", value: missing },
      { label: "extra", value: { ...attemptIdentity(), extra: true } },
      {
        label: "reordered",
        value: {
          mtimeNs: "1001",
          type: "directory",
          mode: 0o700,
          uid: 1000,
          gid: 1000,
          links: 2,
          device: "1",
          inode: "102",
          size: "9007199254740993",
        },
      },
      { label: "inherited", value: inherited },
      { label: "accessor", value: accessor },
      { label: "symbol", value: symbol },
      { label: "proxy", value: proxy },
    ];

    for (const { label, value } of malformedAttemptIdentities) {
      const transition = dependencyAttemptTransition();
      transition.opened.pathChild = value as Record<string, unknown>;
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({
          "open-attempt-root": transition.opened,
          "correlate-attempt-root": transition.correlated,
        }),
      );
      expect(result, `attempt identity ${label}`).toMatchObject({
        status: "failed",
        issue: "M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID",
        attemptRootCommitted: true,
        checkpoint: "retained",
        toolchainPublished: false,
        retry: false,
        cleanup: false,
        evidenceReview: "not-performed",
      });
      expect(result.trace, `attempt identity trace ${label}`).toEqual([
        "root-preflight",
        "create-attempt-root",
        "open-attempt-root",
        "correlate-attempt-root",
        "attempt-parent-sync",
        "failed-checkpoint",
      ]);
      expect(result.trace).not.toContain("attempt-in-progress-write");
      expect(result.trace).not.toContain("runtime");
      expect(result.trace).not.toContain("source-first");
      expect(result.trace).not.toContain("source-second");
      expect(result.trace).not.toContain("inventory");
    }
    expect(accessorCalls).toBe(0);
    expect(proxyTrapCalls).toBe(0);
  });

  it("rejects every held attempt parent and child correlation contradiction", async () => {
    const mutations: Array<
      (transition: ReturnType<typeof dependencyAttemptTransition>) => void
    > = [
      ({ opened }) => {
        (opened.pathParentBefore as Record<string, unknown>).inode = "999";
      },
      ({ opened }) => {
        (opened.pathParentAfter as Record<string, unknown>).device = "2";
      },
      ({ correlated }) => {
        (correlated.parentAfter as Record<string, unknown>).mode = 0o1700;
      },
      ({ correlated }) => {
        (correlated.parentAfter as Record<string, unknown>).links = 2;
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).inode = "999";
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).type = "file";
      },
      ({ opened }) => {
        (opened.heldChild as Record<string, unknown>).mode = 0o1700;
        (opened.pathChild as Record<string, unknown>).mode = 0o1700;
      },
      ({ opened }) => {
        (opened.heldChild as Record<string, unknown>).uid = 1001;
        (opened.pathChild as Record<string, unknown>).uid = 1001;
      },
      ({ opened }) => {
        (opened.heldChild as Record<string, unknown>).gid = 1001;
        (opened.pathChild as Record<string, unknown>).gid = 1001;
      },
      ({ opened }) => {
        (opened.heldChild as Record<string, unknown>).links = 3;
        (opened.pathChild as Record<string, unknown>).links = 3;
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).size = "9007199254740992";
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).size = 9007199254740992;
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).size = 9007199254740993n;
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).mtimeNs = "9999";
      },
      ...["-1", "1.5", "1e3", " 1", "", "01"].map(
        (
          invalid,
        ): ((
          transition: ReturnType<typeof dependencyAttemptTransition>,
        ) => void) =>
          ({ opened }) => {
            (opened.pathChild as Record<string, unknown>).size = invalid;
          },
      ),
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).device = "01";
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).inode = "+102";
      },
      ({ opened }) => {
        (opened.pathChild as Record<string, unknown>).mtimeNs = "1e3";
      },
      ({ correlated }) => {
        (correlated.childrenAfter as Record<string, unknown>[]).push({
          name: "unexpected",
          identity: attemptIdentity({ inode: "103" }),
        });
      },
      ({ correlated }) => {
        correlated.childrenAfter = (
          correlated.childrenAfter as Record<string, unknown>[]
        ).filter(
          (row) => row.name !== "m2a-transfer-toolchain-attempt-20260721-01",
        );
      },
      ({ correlated }) => {
        const retained = (
          correlated.childrenAfter as Record<string, unknown>[]
        ).find((row) => row.name === "retained")!;
        (retained.identity as Record<string, unknown>).inode = "999";
      },
      ({ opened, correlated }) => {
        const committed = (
          correlated.childrenAfter as Record<string, unknown>[]
        ).find(
          (row) => row.name === "m2a-transfer-toolchain-attempt-20260721-01",
        )!;
        (opened.pathChild as Record<string, unknown>).inode = "101";
        (opened.heldChild as Record<string, unknown>).inode = "101";
        (committed.identity as Record<string, unknown>).inode = "101";
      },
      ({ correlated }) => {
        correlated.childrenAfter = [
          ...(correlated.childrenAfter as Record<string, unknown>[]),
        ].reverse();
      },
      ({ correlated }) => {
        (correlated.childrenBefore as Record<string, unknown>[]).unshift({
          name: "m2a-transfer-toolchain-attempt-20260721-01",
          identity: attemptIdentity(),
        });
      },
    ];
    const exactTransition = dependencyAttemptTransition();
    const exactResult = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend({
        "open-attempt-root": exactTransition.opened,
        "correlate-attempt-root": exactTransition.correlated,
      }),
    );
    expect(
      (exactTransition.opened.heldChild as Record<string, unknown>).size,
    ).toBe("9007199254740993");
    expect(exactResult).toMatchObject({
      status: "complete",
      attemptRootCommitted: true,
      toolchainPublished: true,
      evidenceReview: "not-performed",
    });
    for (const [mutationIndex, mutate] of mutations.entries()) {
      const transition = dependencyAttemptTransition();
      mutate(transition);
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({
          "open-attempt-root": transition.opened,
          "correlate-attempt-root": transition.correlated,
        }),
      );
      expect(
        result,
        `attempt correlation mutation ${mutationIndex}`,
      ).toMatchObject({
        status: "failed",
        issue: "M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID",
        attemptRootCommitted: true,
        checkpoint: "retained",
        toolchainPublished: false,
        retry: false,
        cleanup: false,
      });
      expect((result.trace as string[]).at(-1)).toBe("failed-checkpoint");
      expect(result.trace).not.toContain("attempt-in-progress-write");
      expect(result.trace).not.toContain("runtime");
    }
  });

  it("rejects the complete synthetic runtime projection and inventory inverse", async () => {
    const projectionMutations: Array<
      (runtime: Record<string, unknown>) => void
    > = [
      (runtime) => {
        runtime.version = "v20.18.3";
      },
      (runtime) => {
        runtime.platform = "darwin";
      },
      (runtime) => {
        runtime.architecture = "arm64";
      },
      (runtime) => {
        runtime.executableType = "directory";
      },
      (runtime) => {
        runtime.mode = 0o755;
      },
      (runtime) => {
        runtime.links = 2;
      },
      (runtime) => {
        runtime.executableSize = 0;
      },
      (runtime) => {
        runtime.executableSha256 = "invalid";
      },
      (runtime) => {
        runtime.sparse = true;
      },
      (runtime) => {
        runtime.reportDense = false;
      },
      (runtime) => {
        const sparse = new Array(2);
        sparse[0] = "/synthetic/libc.so";
        runtime.sharedObjects = sparse;
      },
      (runtime) => {
        runtime.sharedObjects = [1];
      },
      (runtime) => {
        runtime.sharedObjects = ["relative/libc.so"];
      },
      (runtime) => {
        runtime.sharedObjects = ["/synthetic/libc.so", "/synthetic/libc.so"];
      },
      (runtime) => {
        runtime.sharedObjectRows = [
          ...(runtime.sharedObjectRows as Record<string, unknown>[]),
        ].reverse();
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.sourcePath =
          "/synthetic/other.so";
      },
      (runtime) => {
        (
          runtime.sharedObjectRows as Record<string, unknown>[]
        )[0]!.logicalPath = "runtime/shared/000-other.so";
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[1]!.inode =
          "200";
      },
      (runtime) => {
        (
          runtime.sharedObjectRows as Record<string, unknown>[]
        )[1]!.sourceConnected = false;
      },
      (runtime) => {
        runtime.sharedObjectRows = (
          runtime.sharedObjectRows as Record<string, unknown>[]
        ).slice(0, 1);
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[]).push(
          structuredClone(
            (runtime.sharedObjectRows as Record<string, unknown>[])[1]!,
          ),
        );
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.type =
          "directory";
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.mode =
          0o4555;
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.links = 2;
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.size = 0;
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.sha256 =
          "invalid";
      },
      (runtime) => {
        (runtime.sharedObjectRows as Record<string, unknown>[])[0]!.sparse =
          true;
      },
    ];
    for (const mutate of projectionMutations) {
      const runtime = dependencyRuntimeProjection();
      mutate(runtime);
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({ runtime }),
      );
      expect(result).toMatchObject({
        status: "failed",
        attemptRootCommitted: true,
        toolchainPublished: false,
        retry: false,
        cleanup: false,
      });
      expect((result.trace as string[]).at(-1)).toBe("failed-checkpoint");
      expect(result.trace).not.toContain("source-first");
      expect(result.trace).not.toContain("inventory");
    }

    const inventoryMutations: Array<
      (inventory: Record<string, unknown>[]) => void
    > = [
      (inventory) => {
        inventory.splice(
          inventory.findIndex(
            (row) => row.logicalPath === "runtime/shared/000-libc.so",
          ),
          1,
        );
      },
      (inventory) => {
        inventory.push({
          logicalPath: "runtime/shared/001-extra.so",
          mode: 0o444,
          size: 1,
          sha256: `sha256:${"1".repeat(64)}`,
        });
        inventory.sort((left, right) =>
          String(left.logicalPath).localeCompare(String(right.logicalPath)),
        );
      },
      (inventory) => {
        const row = inventory.find(
          (item) => item.logicalPath === "runtime/shared/000-libc.so",
        )!;
        inventory.push(structuredClone(row));
      },
      (inventory) => {
        inventory.reverse();
      },
      (inventory) => {
        inventory.find(
          (row) => row.logicalPath === "runtime/shared/000-libc.so",
        )!.size = 11;
      },
      (inventory) => {
        inventory.find(
          (row) => row.logicalPath === "runtime/shared/000-libc.so",
        )!.sha256 = `sha256:${"0".repeat(64)}`;
      },
      (inventory) => {
        inventory.push({
          logicalPath: "runtime/constructor-node-copy",
          mode: 0o444,
          size: 9,
          sha256: `sha256:${"9".repeat(64)}`,
        });
        inventory.sort((left, right) =>
          String(left.logicalPath).localeCompare(String(right.logicalPath)),
        );
      },
    ];
    for (const mutate of inventoryMutations) {
      const inventory = dependencyInputInventory();
      mutate(inventory);
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({ inventory }),
      );
      expect(result).toMatchObject({
        status: "failed",
        attemptRootCommitted: true,
        toolchainPublished: false,
        retry: false,
        cleanup: false,
      });
      expect((result.trace as string[]).at(-1)).toBe("failed-checkpoint");
      expect(result.trace).not.toContain("destination-final");
    }
  });

  it("publishes only a graph-bound fake candidate and retains every later failure", async () => {
    const receipt = dependencyInputReceipt();
    expect(validateToolchainReceiptBytes(receipt)).toMatchObject({
      receipt: {
        schemaVersion: "m2a-transfer-toolchain/v1",
        status: "complete",
        evidenceReview: "not-performed",
      },
    });
    const success = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend(),
    );
    expect(success).toMatchObject({
      status: "complete",
      checkpoint: "complete",
      toolchainPublished: true,
      retry: false,
      cleanup: false,
      evidenceReview: "not-performed",
    });
    for (const step of [
      "tracked-closure",
      "source-directories-close",
      "create-toolchain-root",
      "create-seven-directories",
      "copy-source-files",
      "copy-source-close",
      "receipt-write",
      "receipt-sync",
      "receipt-reread",
      "receipt-mode",
      "receipt-close",
      "receipt-rename",
      "toolchain-root-sync",
      "complete-checkpoint-write",
      "complete-checkpoint-sync",
      "complete-checkpoint-reread",
      "complete-checkpoint-mode",
      "complete-checkpoint-close",
      "complete-checkpoint-rename",
      "complete-checkpoint-root-sync",
    ]) {
      const result = await runM2aToolchainCaptureForTest(
        createFakeM2aToolchainInputBackend({
          [step]: { ok: false, settlement: "unknown" },
        }),
      );
      expect(result).toMatchObject({
        status: "failed",
        attemptRootCommitted: true,
        checkpoint: "retained",
        toolchainPublished: false,
        retry: false,
        cleanup: false,
      });
    }
    const disagreement = await runM2aToolchainCaptureForTest(
      createFakeM2aToolchainInputBackend({
        "source-second": [heldInputRow("packages/typescript", "directory", 1)],
      }),
    );
    expect(disagreement).toMatchObject({
      status: "failed",
      issue: "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID",
      toolchainPublished: false,
    });
  });

  it("enforces family modes and positive package sizes at the actual constructor consumer", () => {
    const receipt = dependencyInputReceipt();
    const parsed = JSON.parse(receipt.toString("utf8")) as Record<
      string,
      unknown
    >;
    expect(
      validateConstructorToolchain(receipt, {
        receiptSha256: sha256(receipt),
        inventoryAggregate: parsed.inventoryAggregate,
      }),
    ).toMatchObject({ inventoryAggregate: parsed.inventoryAggregate });
    for (const mutate of [
      (inventory: Record<string, unknown>[]) => {
        inventory.find(
          (row) => row.logicalPath === "runtime/constructor-node",
        )!.mode = 0o444;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("runtime/shared/"),
        )!.mode = 0o555;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/typescript/"),
        )!.mode = 0o555;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/@types/node/"),
        )!.mode = 0o555;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/undici-types/"),
        )!.mode = 0o555;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/typescript/"),
        )!.size = 0;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/@types/node/"),
        )!.size = 0;
      },
      (inventory: Record<string, unknown>[]) => {
        inventory.find((row) =>
          String(row.logicalPath).startsWith("packages/undici-types/"),
        )!.size = 0;
      },
    ]) {
      const badReceipt = rebuildConstructorReceipt(receipt, mutate);
      const badRecord = JSON.parse(badReceipt) as Record<string, unknown>;
      expect(() =>
        validateConstructorToolchain(badReceipt, {
          receiptSha256: sha256(badReceipt),
          inventoryAggregate: badRecord.inventoryAggregate,
        }),
      ).toThrow("M2A_TOOLCHAIN_INVALID");
    }
  });

  it("keeps both no-argument entries statically unreachable from ordinary verification", async () => {
    const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
    const [
      npmEntry,
      toolchainEntry,
      inputSource,
      staticVerifier,
      packageSource,
    ] = await Promise.all([
      readFile(
        new URL(
          "../experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL(
          "../experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL(
          "../experiments/npm12-install/scripts/m2a-transfer-inputs.mjs",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL(
          "../experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(`${repositoryRoot}/package.json`, "utf8"),
    ]);
    for (const entry of [npmEntry, toolchainEntry]) {
      expect(entry).toContain("process.argv.length !== 2");
      expect(entry).toContain(
        "Reflect.ownKeys(environmentDescriptors).length !== 0",
      );
      expect(entry).toContain(
        "import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href",
      );
    }
    for (const relation of [
      'process.execPath !== "/usr/bin/node"',
      'process.argv0 !== "/usr/bin/node"',
      "process.argv.length !== 2",
      'process.argv[0] !== "/usr/bin/node"',
      "process.argv[1] !== entryPath",
      "process.cwd() !== expectedRepositoryRoot",
      "Reflect.ownKeys(environmentDescriptors).length !== 0",
    ]) {
      expect(npmEntry).toContain(relation);
    }
    expect(npmEntry.indexOf("M2A_INPUT_AUTHORITY_REJECTED")).toBeLessThan(
      npmEntry.indexOf("await runFixedNpmAcquisitionEntry()"),
    );
    expect(staticVerifier).toContain("validatesExactNpmEntryBoundary");
    expect(staticVerifier).toContain("npmEntryWeakeningVariants");
    expect(staticVerifier).toContain("npmEntryGuardMovedAfterProducer");
    expect(staticVerifier).toContain("validatesInputLinkBoundaries");
    expect(staticVerifier).toContain("inputLinkWeakeningVariants");
    expect(inputSource).toContain("added.identity.links < 1 ||");
    expect(inputSource).toContain("created.identity.links !== 1 ||");
    expect(inputSource).toContain("finalIdentity.links !== 1 ||");
    expect(inputSource).toContain("function createAttemptRootSynchronously()");
    expect(inputSource).toContain("mkdirSync(TOOLCHAIN_ATTEMPT_ROOT");
    expect(inputSource).not.toContain("process.env");
    const commands = Object.values(
      (JSON.parse(packageSource) as { scripts: Record<string, string> })
        .scripts,
    ).join("\n");
    expect(commands).not.toContain("acquire-m2a-transfer-npm.mjs");
    expect(commands).not.toContain("capture-m2a-transfer-toolchain.mjs");
  });
});

describe("M2-A attempt evidence and static reachability", () => {
  it("accepts candidate-only canonical attempt bytes and rejects promotion", () => {
    const attempt = validAttempt();
    expect(validateAttemptBytes(canonical(attempt), imageId).attempt).toEqual(
      attempt,
    );
    expect(() =>
      validateAttemptBytes(
        canonical({ ...attempt, evidenceReview: "accepted" }),
        imageId,
      ),
    ).toThrow("M2A_ATTEMPT_INVALID");
  });

  it("rejects incoherent prerequisite, issue, and transfer state combinations", () => {
    const cases: Array<Record<string, unknown>> = [
      {
        initializerSettlement: "not-started",
        measurementSettlement: "natural-exited",
      },
      { naturalExit: false },
      { completionTransfer: "invalid", segmentTransfer: "valid" },
      { segmentTransfer: "invalid", markerTransfer: "valid" },
      {
        measurementSettlement: "unknown",
        naturalExit: false,
        completionTransfer: "valid",
      },
      {
        issues: [
          {
            code: "/home/example/arbitrary",
            step: "measurement-wait",
          },
        ],
      },
      {
        issues: [
          { code: "M2A_VOLUME_CREATE_FAILED", step: "measurement-wait" },
        ],
      },
      {
        issues: [
          {
            code: "M2A_INITIALIZER_START_FAILED",
            step: "initializer-start",
          },
        ],
      },
      {
        issues: [
          {
            code: "M2A_MEASUREMENT_WAIT_FAILED",
            step: "measurement-wait",
          },
          {
            code: "M2A_SEGMENT_COPY_FAILED",
            step: "copy-segment",
          },
        ],
      },
      {
        issues: [
          {
            code: "M2A_SEGMENT_COPY_FAILED",
            step: "copy-segment",
          },
          {
            code: "M2A_MEASUREMENT_WAIT_FAILED",
            step: "measurement-wait",
          },
        ],
      },
    ];
    for (const mutation of cases) {
      expect(() =>
        validateAttemptBytes(
          canonical({ ...validAttempt(), ...mutation }),
          imageId,
        ),
      ).toThrow("M2A_ATTEMPT_INVALID");
    }

    const unknownMeasurement = {
      ...validAttempt(),
      measurementSettlement: "unknown",
      naturalExit: false,
      completionTransfer: "not-attempted",
      segmentTransfer: "not-attempted",
      markerTransfer: "not-attempted",
      issues: [{ code: "M2A_SETTLEMENT_UNKNOWN", step: "measurement-wait" }],
    };
    expect(
      validateAttemptBytes(canonical(unknownMeasurement), imageId).attempt,
    ).toEqual(unknownMeasurement);

    const invalidSegment = {
      ...validAttempt(),
      segmentTransfer: "invalid",
      markerTransfer: "not-attempted",
      issues: [
        { code: "M2A_SEGMENT_TRANSFER_INVALID", step: "validate-segment" },
      ],
    };
    expect(
      validateAttemptBytes(canonical(invalidSegment), imageId).attempt,
    ).toEqual(invalidSegment);
  });

  it("statically traces descriptor settlement and terminal checks without importing container sources", async () => {
    const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
    const [
      initializerSource,
      runnerSource,
      constructionSource,
      productionSource,
      constructionDeclarations,
      productionDeclarations,
      packageSource,
    ] = await Promise.all([
      readFile(
        `${repositoryRoot}/experiments/npm12-install/container/initialize-m2a-volume.mjs`,
        "utf8",
      ),
      readFile(
        `${repositoryRoot}/experiments/npm12-install/container/run-m2a-transfer.mjs`,
        "utf8",
      ),
      readFile(
        `${repositoryRoot}/experiments/npm12-install/scripts/m2a-transfer-construction.mjs`,
        "utf8",
      ),
      readFile(
        `${repositoryRoot}/experiments/npm12-install/scripts/m2a-transfer-production.mjs`,
        "utf8",
      ),
      readFile(
        `${repositoryRoot}/experiments/npm12-install/scripts/m2a-transfer-construction.d.mts`,
        "utf8",
      ),
      readFile(
        `${repositoryRoot}/experiments/npm12-install/scripts/m2a-transfer-production.d.mts`,
        "utf8",
      ),
      readFile(`${repositoryRoot}/package.json`, "utf8"),
    ]);
    for (const source of [initializerSource, runnerSource]) {
      expect(source).toContain("async function closeHandles(handles, keys)");
      expect(source).not.toContain(".close().catch");
      expect(source).not.toContain("catch(() => undefined)");
      expect(source).toContain('await closeHandles(handles, ["next", "root"])');
    }
    expect(initializerSource.indexOf("await readdir(RUN_ROOT)")).toBeLessThan(
      initializerSource.indexOf("root: await open("),
    );
    expect(
      initializerSource.indexOf('await closeHandles(handles, ["next"])'),
    ).toBeLessThan(
      initializerSource.indexOf("await rename(NEXT_PATH, READY_PATH)"),
    );
    expect(runnerSource).toContain("function isSuccessfulNpmTerminal(result)");
    for (const predicate of [
      "result.closed === true",
      "result.exitCode === 0",
      "result.signal === null",
      "result.timedOut === false",
      "result.stdoutTruncated === false",
      "result.stderrTruncated === false",
    ]) {
      expect(runnerSource).toContain(predicate);
    }
    expect(runnerSource).toContain(
      "function createPrePublicationDescriptorTracker()",
    );
    expect(runnerSource).toContain(
      "const results = await Promise.allSettled(branches)",
    );
    expect(
      runnerSource.match(/await awaitAllSettledOwnership\(\[/gu),
    ).toHaveLength(2);
    expect(
      runnerSource.match(/const close = descriptorTracker\.own\(handle\);/gu),
    ).toHaveLength(3);
    expect(runnerSource.match(/await close\(\);/gu)).toHaveLength(3);
    expect(runnerSource).toContain("prePublicationDescriptorsClosed,");
    expect(runnerSource).not.toContain("\n      descriptorsClosed,");
    expect(
      runnerSource.indexOf("prePublicationDescriptors.allClosed()"),
    ).toBeGreaterThan(runnerSource.lastIndexOf("captureOutput("));
    expect(runnerSource.indexOf("const completion = {")).toBeGreaterThan(
      runnerSource.indexOf("prePublicationDescriptors.allClosed()"),
    );
    expect(
      runnerSource.indexOf("await publishCompletion(completion)"),
    ).toBeLessThan(runnerSource.indexOf("return issue === null ? 0 : 70"));
    for (const marker of [
      "function createFixedConstructionAuthority()",
      "fixedConstructionAuthorityBrand.has(authority)",
      "function createFixedImageBuildAuthority()",
      "fixedImageBuildAuthorityBrand.has(authority)",
      "function createFixedRuntimeAuthority()",
      "fixedRuntimeAuthorityBrand.has(authority)",
    ]) {
      expect(`${constructionSource}\n${productionSource}`).toContain(marker);
      expect(
        `${constructionDeclarations}\n${productionDeclarations}`,
      ).not.toContain(marker);
    }
    expect(
      constructionSource.indexOf("createFixedConstructionAuthority();"),
    ).toBeGreaterThan(
      constructionSource.indexOf("M2A_CONSTRUCTION_EXECUTION_NOT_APPROVED"),
    );
    expect(
      productionSource.indexOf("createFixedImageBuildAuthority();"),
    ).toBeGreaterThan(productionSource.indexOf("M2A_IMAGE_BUILD_NOT_APPROVED"));
    expect(
      productionSource.indexOf("createFixedRuntimeAuthority();"),
    ).toBeGreaterThan(
      productionSource.indexOf("M2A_RUNTIME_EXECUTION_NOT_APPROVED"),
    );
    for (const marker of [
      "function createHeldConstructionInputRegistry()",
      'row.logicalPath === "runtime/constructor-node"',
      '? "/usr/bin/node"',
      "await heldInputs.settle();",
      "function assertSuccessfulFixedCompilerTerminal(terminalInput)",
      "const startFinalCloseBound =",
    ]) {
      expect(constructionSource).toContain(marker);
    }
    expect(
      constructionSource.indexOf(
        "assertSuccessfulFixedCompilerTerminal(probeTerminal)",
      ),
    ).toBeLessThan(
      constructionSource.indexOf(
        "const probeCoreCompilerInventory = await readCompilerInventory",
      ),
    );
    expect(
      constructionSource.indexOf(
        "assertSuccessfulFixedCompilerTerminal(lifecycleTerminal)",
      ),
    ).toBeLessThan(
      constructionSource.indexOf(
        "const lifecycleCompilerInventory = await readCompilerInventory",
      ),
    );
    for (const marker of [
      "function validateImageBuildStepValue(step, valueInput)",
      "async function holdProductionDirectory(",
      "async function exactProductionDirectoryInventory(held, expected)",
      "function assertProductionDirectoryTransition(",
      "function assertDirectoryChildTransition(",
      "async function completeHeldProductionDirectoryTransition(",
      "async function completeHeldProductionNestedMarkerTransition(",
      "resultIdentity.handle.sync()",
      "transferIdentity.handle.sync()",
      "await validateHeldRuntimeState();",
      "async settleOwnership()",
      "const startFinalCloseBound =",
    ]) {
      expect(productionSource).toContain(marker);
    }
    expect(productionSource).not.toContain("allowInventoryMutation");
    expect(productionSource).not.toContain("held.children = after.children");
    for (const kind of [
      "create-attempt-next",
      "rename-attempt-next",
      "create-completion-copy",
      "create-segment-copy",
      "create-probe-output",
      "create-nested-marker",
    ]) {
      expect(productionSource).toContain(`kind: "${kind}"`);
    }
    for (const marker of [
      "FakeM2aHeldChildIdentity",
      "FakeM2aHeldDirectorySnapshot",
      "FakeM2aHeldDirectoryOperation",
    ]) {
      expect(productionDeclarations).toContain(marker);
    }
    const singleTransition = productionSource.slice(
      productionSource.indexOf(
        "async function completeHeldProductionDirectoryTransition(",
      ),
      productionSource.indexOf(
        "async function completeHeldProductionNestedMarkerTransition(",
      ),
    );
    expect(
      singleTransition.indexOf("assertProductionDirectoryTransition("),
    ).toBeLessThan(
      singleTransition.indexOf("held.children = validatedAfter.children"),
    );
    const nestedTransition = productionSource.slice(
      productionSource.indexOf(
        "async function completeHeldProductionNestedMarkerTransition(",
      ),
      productionSource.indexOf(
        "async function settleHeldProductionDirectories(",
      ),
    );
    expect(
      (nestedTransition.match(/assertProductionDirectoryTransition\(/gu) ?? [])
        .length,
    ).toBe(2);
    expect(
      nestedTransition.lastIndexOf("assertProductionDirectoryTransition("),
    ).toBeLessThan(
      nestedTransition.indexOf(
        "markerParent.children = validatedMarkerAfter.children",
      ),
    );
    expect(constructionSource).toContain(
      "createM2aPrivateProcessSettlementState",
    );
    expect(productionSource).toContain(
      "createM2aPrivateProcessSettlementState",
    );
    expect(constructionDeclarations).not.toContain(
      "createM2aPrivateProcessSettlementState",
    );
    expect(
      productionSource.indexOf(
        "if (result.processSettlement.successful !== true)",
      ),
    ).toBeLessThan(
      productionSource.indexOf(
        "const terminal = buildObservationTerminal(result.terminal)",
      ),
    );
    expect(
      productionSource.indexOf("result.processSettlement.known !== true"),
    ).toBeLessThan(
      productionSource.lastIndexOf(
        "await completeHeldProductionDirectoryTransition(",
      ),
    );
    const scripts = (
      JSON.parse(packageSource) as { scripts: Record<string, string> }
    ).scripts;
    expect(Object.values(scripts).join("\n")).not.toContain(
      "construct-m2a-transfer-context.mjs",
    );
    expect(Object.values(scripts).join("\n")).not.toContain(
      "build-m2a-transfer-image.mjs",
    );
    expect(Object.values(scripts).join("\n")).not.toContain(
      "execute-m2a-transfer.mjs",
    );
  });

  it("passes the no-argument Docker-free static verifier", async () => {
    const script = fileURLToPath(
      new URL(
        "../experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs",
        import.meta.url,
      ),
    );
    const result = await execFileAsync(process.execPath, [script], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: {},
      shell: false,
      encoding: "utf8",
    });
    expect(result.stdout).toBe(
      "M2-A transfer static/unit boundary verified (Docker, lifecycle, transfer, and result access not run)\n",
    );
    expect(result.stderr).toBe("");
  });
});
