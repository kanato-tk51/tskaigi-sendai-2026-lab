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
  ARTIFACT_TARGET_ID,
  ATTEMPT_IDS,
  ATTEMPT_TIMEOUT_MS,
  CANARY_FILE_TARGET_ID,
  CWD_ID,
  ENVIRONMENT_TARGET_ID,
  ENVIRONMENT_VARIABLE,
  EVENT_TARGET_ID,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  INPUT_SNAPSHOT_RELATIVE_PATH,
  LOOPBACK_TARGET_ID,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_FIXTURE_BYTES,
  PHASES,
  PRODUCER_ID,
  ROUTE_IDS,
  SCENARIO_ID_PREFIX,
  SEGMENT_RELATIVE_PATH,
  SOURCE_HASH_TARGET_ID,
  TOOL_API_CHANGE_ID,
  DIRECT_OUTPUT_TARGET_ID,
  CHILD_TARGET_ID,
  CODEGEN_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { ScenarioVariant } from "./constants.js";

export function createFixedManifest(
  variant: ScenarioVariant,
  runId: string,
): ProbeManifest {
  const directWriteEnabled = variant === "observe";
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId: `${SCENARIO_ID_PREFIX}-${variant}`,
    route: "codegen-cli",
    phases: Object.values(PHASES),
    triggerTypes: ["explicit"],
    adapterVersion: ADAPTER_VERSION,
    producerId: PRODUCER_ID,
    workerId: null,
    cwdId: CWD_ID,
    toolName: "codegen",
    toolVersion: CODEGEN_VERSION,
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
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileRead,
        type: "canary-file-read",
        targetId: CANARY_FILE_TARGET_ID,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileHash,
        type: "file-hash",
        targetId: SOURCE_HASH_TARGET_ID,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: ATTEMPT_IDS.fileWrite,
        type: "direct-filesystem-write",
        targetId: DIRECT_OUTPUT_TARGET_ID,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: directWriteEnabled,
      },
      {
        attemptId: ATTEMPT_IDS.loopback,
        type: "loopback-connect",
        targetId: LOOPBACK_TARGET_ID,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.child,
        type: "child-node-process",
        targetId: CHILD_TARGET_ID,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: ROUTE_IDS.startup,
        phase: PHASES.startup,
        triggerType: "explicit",
        invocationKind: "module-evaluation",
        logicalUnitId: "codegen-cli-entry",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.argumentParse,
        phase: PHASES.argumentParse,
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-fixed-arguments",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.generationStart,
        phase: PHASES.generationStart,
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-generation",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.fileWrite,
        phase: PHASES.fileWrite,
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-output",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.completion,
        phase: PHASES.completion,
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-cli-completion",
        enabled: true,
      },
    ],
    toolApiTargets: [
      { targetId: ARTIFACT_TARGET_ID, classification: "artifact" },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: TOOL_API_CHANGE_ID,
        phase: PHASES.generationApi,
        triggerType: "explicit",
        changeKind: "emitted-asset",
        targetId: ARTIFACT_TARGET_ID,
        enabled: true,
      },
    ],
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
        relativePath: "canary/input.txt",
      },
      {
        targetId: SOURCE_HASH_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: INPUT_SNAPSHOT_RELATIVE_PATH,
      },
      {
        targetId: DIRECT_OUTPUT_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: "probe-output/direct-write-marker.json",
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

export function validateManifestContract(
  manifest: ProbeManifest,
  variant: ScenarioVariant,
): void {
  if (
    manifest.route !== "codegen-cli" ||
    manifest.toolName !== "codegen" ||
    manifest.toolVersion !== CODEGEN_VERSION ||
    manifest.workerId !== null ||
    !sameValues(manifest.phases, Object.values(PHASES)) ||
    !sameValues(manifest.triggerTypes, ["explicit"]) ||
    manifest.routeInvocations.length !== EXPECTED_ROUTE_COUNT ||
    manifest.attempts.length !== EXPECTED_CAPABILITY_COUNT ||
    manifest.toolApiChanges.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.toolApiTargets.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.attempts[3]?.enabled !== (variant === "observe") ||
    manifest.routeInvocations.some(
      (route) => route.triggerType !== "explicit" || !route.enabled,
    ) ||
    manifest.attempts.some(
      (attempt) =>
        attempt.triggerType !== "explicit" ||
        attempt.phase !== PHASES.generationStart,
    ) ||
    manifest.toolApiChanges[0]?.toolApiChangeId !== TOOL_API_CHANGE_ID
  ) {
    throw new AdapterError("M2E_MANIFEST_INVALID");
  }
}
