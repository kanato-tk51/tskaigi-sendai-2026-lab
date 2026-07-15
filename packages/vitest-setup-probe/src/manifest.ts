import {
  PROBE_MANIFEST_SCHEMA_VERSION,
  PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
} from "@tskaigi-lab/probe-core";
import type {
  ProbeManifest,
  ProbeRuntimeBindings,
} from "@tskaigi-lab/probe-core";

import {
  ADAPTER_VERSION,
  ATTEMPT_IDS,
  ATTEMPT_TIMEOUT_MS,
  CANARY_FILE_TARGET_ID,
  CANARY_RELATIVE_PATH,
  CHILD_TARGET_ID,
  CWD_ID,
  ENVIRONMENT_TARGET_ID,
  ENVIRONMENT_VARIABLE,
  EVENT_TARGET_ID,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  LOOPBACK_TARGET_ID,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_FIXTURE_BYTES,
  OUTPUT_RELATIVE_PATH,
  OUTPUT_TARGET_ID,
  PHASES,
  PRODUCER_ID,
  ROUTE_IDS,
  SCENARIO_ID,
  SEGMENT_RELATIVE_PATH,
  SETUP_LOGICAL_ID,
  SOURCE_COPY_RELATIVE_PATH,
  SOURCE_HASH_TARGET_ID,
  VITEST_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export function createFixedManifest(runId: string): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId: SCENARIO_ID,
    route: "vitest-setup",
    phases: [PHASES.lateModuleCheckpoint, PHASES.setupBodyCheckpoint],
    triggerTypes: ["configured", "automatic"],
    adapterVersion: ADAPTER_VERSION,
    producerId: PRODUCER_ID,
    workerId: null,
    cwdId: CWD_ID,
    toolName: "vitest",
    toolVersion: VITEST_VERSION,
    eventSinkTargetId: EVENT_TARGET_ID,
    targets: [
      { targetId: EVENT_TARGET_ID, kind: "event-segment" },
      {
        targetId: ENVIRONMENT_TARGET_ID,
        kind: "environment",
        variableName: ENVIRONMENT_VARIABLE,
      },
      {
        targetId: CANARY_FILE_TARGET_ID,
        kind: "file-read",
        classification: "canary",
        maxBytes: MAX_FIXTURE_BYTES,
      },
      {
        targetId: SOURCE_HASH_TARGET_ID,
        kind: "file-hash",
        classification: "source",
        maxBytes: MAX_FIXTURE_BYTES,
      },
      {
        targetId: OUTPUT_TARGET_ID,
        kind: "file-write",
        classification: "output",
        maxBytes: MAX_FIXTURE_BYTES,
      },
      {
        targetId: LOOPBACK_TARGET_ID,
        kind: "loopback-http",
        timeoutMs: ATTEMPT_TIMEOUT_MS,
      },
      {
        targetId: CHILD_TARGET_ID,
        kind: "fixed-child",
        timeoutMs: ATTEMPT_TIMEOUT_MS,
        maxOutputBytes: MAX_CHILD_OUTPUT_BYTES,
      },
    ],
    attempts: [
      {
        attemptId: ATTEMPT_IDS.environment,
        type: "environment-canary-read",
        targetId: ENVIRONMENT_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileRead,
        type: "canary-file-read",
        targetId: CANARY_FILE_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileHash,
        type: "file-hash",
        targetId: SOURCE_HASH_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: ATTEMPT_IDS.fileWrite,
        type: "direct-filesystem-write",
        targetId: OUTPUT_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.loopback,
        type: "loopback-connect",
        targetId: LOOPBACK_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.child,
        type: "child-node-process",
        targetId: CHILD_TARGET_ID,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: ROUTE_IDS.lateModuleCheckpoint,
        phase: PHASES.lateModuleCheckpoint,
        triggerType: "configured",
        invocationKind: "module-evaluation",
        logicalUnitId: SETUP_LOGICAL_ID,
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.setupBodyCheckpoint,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        invocationKind: "setup-execution",
        logicalUnitId: SETUP_LOGICAL_ID,
        enabled: true,
      },
    ],
    toolApiTargets: [],
    toolApiChanges: [],
  };
}

export function createFixedRuntimeBindings(
  runRoot: string,
  loopbackPort: number,
): ProbeRuntimeBindings {
  return {
    schemaVersion: PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
    bindings: [
      {
        targetId: EVENT_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: SEGMENT_RELATIVE_PATH,
      },
      { targetId: ENVIRONMENT_TARGET_ID, kind: "environment" },
      {
        targetId: CANARY_FILE_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: CANARY_RELATIVE_PATH,
      },
      {
        targetId: SOURCE_HASH_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: SOURCE_COPY_RELATIVE_PATH,
      },
      {
        targetId: OUTPUT_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: OUTPUT_RELATIVE_PATH,
      },
      {
        targetId: LOOPBACK_TARGET_ID,
        kind: "loopback-http",
        address: "127.0.0.1",
        port: loopbackPort,
      },
      { targetId: CHILD_TARGET_ID, kind: "fixed-child" },
    ],
  };
}

function sameValues(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

export function validateVitestManifestContract(manifest: ProbeManifest): void {
  const routes = manifest.routeInvocations;
  const attempts = manifest.attempts;
  const lateModuleCheckpoint = routes[0];
  const setupBodyCheckpoint = routes[1];
  if (
    manifest.route !== "vitest-setup" ||
    manifest.scenarioId !== SCENARIO_ID ||
    manifest.producerId !== PRODUCER_ID ||
    manifest.workerId !== null ||
    manifest.cwdId !== CWD_ID ||
    manifest.toolName !== "vitest" ||
    manifest.toolVersion !== VITEST_VERSION ||
    manifest.eventSinkTargetId !== EVENT_TARGET_ID ||
    !sameValues(manifest.phases, [
      PHASES.lateModuleCheckpoint,
      PHASES.setupBodyCheckpoint,
    ]) ||
    !sameValues(manifest.triggerTypes, ["configured", "automatic"]) ||
    routes.length !== EXPECTED_ROUTE_COUNT ||
    attempts.length !== EXPECTED_CAPABILITY_COUNT ||
    manifest.toolApiTargets.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.toolApiChanges.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    lateModuleCheckpoint?.routeInvocationId !==
      ROUTE_IDS.lateModuleCheckpoint ||
    lateModuleCheckpoint.phase !== PHASES.lateModuleCheckpoint ||
    lateModuleCheckpoint.triggerType !== "configured" ||
    lateModuleCheckpoint.invocationKind !== "module-evaluation" ||
    lateModuleCheckpoint.logicalUnitId !== SETUP_LOGICAL_ID ||
    setupBodyCheckpoint?.routeInvocationId !== ROUTE_IDS.setupBodyCheckpoint ||
    setupBodyCheckpoint.phase !== PHASES.setupBodyCheckpoint ||
    setupBodyCheckpoint.triggerType !== "automatic" ||
    setupBodyCheckpoint.invocationKind !== "setup-execution" ||
    setupBodyCheckpoint.logicalUnitId !== SETUP_LOGICAL_ID ||
    !sameValues(
      attempts.map((attempt) => attempt.attemptId),
      Object.values(ATTEMPT_IDS),
    ) ||
    attempts.some(
      (attempt) =>
        attempt.phase !== PHASES.setupBodyCheckpoint ||
        attempt.triggerType !== "automatic" ||
        !attempt.enabled,
    )
  ) {
    throw new AdapterError("M2C_CONTEXT_INVALID");
  }
}
