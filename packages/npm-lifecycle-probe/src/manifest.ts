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
  DIRECT_OUTPUT_TARGET_ID,
  ENVIRONMENT_TARGET_ID,
  ENVIRONMENT_VARIABLE,
  EVENT_TARGET_ID,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  LOOPBACK_TARGET_ID,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_FIXTURE_BYTES,
  NPM_VERSION,
  PHASE,
  PRODUCER_ID,
  ROUTE_ID,
  SCENARIO_ID,
  SEGMENT_RELATIVE_PATH,
  SOURCE_HASH_TARGET_ID,
  SOURCE_SNAPSHOT_RELATIVE_PATH,
  OUTPUT_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export function createLifecycleManifest(runId: string): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId: SCENARIO_ID,
    route: "npm-install-lifecycle",
    phases: [PHASE],
    triggerTypes: ["automatic"],
    adapterVersion: ADAPTER_VERSION,
    producerId: PRODUCER_ID,
    workerId: null,
    cwdId: CWD_ID,
    toolName: "npm",
    toolVersion: NPM_VERSION,
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
        targetId: DIRECT_OUTPUT_TARGET_ID,
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
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileRead,
        type: "canary-file-read",
        targetId: CANARY_FILE_TARGET_ID,
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileHash,
        type: "file-hash",
        targetId: SOURCE_HASH_TARGET_ID,
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: ATTEMPT_IDS.fileWrite,
        type: "direct-filesystem-write",
        targetId: DIRECT_OUTPUT_TARGET_ID,
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.loopback,
        type: "loopback-connect",
        targetId: LOOPBACK_TARGET_ID,
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.child,
        type: "child-node-process",
        targetId: CHILD_TARGET_ID,
        phase: PHASE,
        triggerType: "automatic",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: ROUTE_ID,
        phase: PHASE,
        triggerType: "automatic",
        invocationKind: "lifecycle-hook",
        logicalUnitId: "npm-install-lifecycle",
        enabled: true,
      },
    ],
    toolApiTargets: [],
    toolApiChanges: [],
  };
}

export function createLifecycleRuntimeBindings(
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
        relativePath: SOURCE_SNAPSHOT_RELATIVE_PATH,
      },
      {
        targetId: DIRECT_OUTPUT_TARGET_ID,
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

export function validateLifecycleManifest(manifest: ProbeManifest): void {
  if (
    manifest.route !== "npm-install-lifecycle" ||
    manifest.toolName !== "npm" ||
    manifest.toolVersion !== NPM_VERSION ||
    manifest.workerId !== null ||
    manifest.phases.length !== 1 ||
    manifest.phases[0] !== PHASE ||
    manifest.triggerTypes.length !== 1 ||
    manifest.triggerTypes[0] !== "automatic" ||
    manifest.routeInvocations.length !== EXPECTED_ROUTE_COUNT ||
    manifest.attempts.length !== EXPECTED_CAPABILITY_COUNT ||
    manifest.toolApiChanges.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.toolApiTargets.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.routeInvocations.some(
      (route) =>
        route.routeInvocationId !== ROUTE_ID ||
        route.phase !== PHASE ||
        route.triggerType !== "automatic" ||
        !route.enabled,
    ) ||
    manifest.attempts.some(
      (attempt) =>
        attempt.phase !== PHASE ||
        attempt.triggerType !== "automatic" ||
        !attempt.enabled,
    )
  ) {
    throw new AdapterError("M2A_MANIFEST_INVALID");
  }
}
