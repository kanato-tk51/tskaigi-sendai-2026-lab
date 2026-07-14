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
  CANARY_FILE_TARGET_ID,
  CHILD_TARGET_ID,
  CHILD_TIMEOUT_MS,
  ENVIRONMENT_TARGET_ID,
  ENVIRONMENT_VARIABLE,
  ESLINT_VERSION,
  EVENT_TARGET_ID,
  FIXTURE_LOGICAL_ID,
  LOOPBACK_TARGET_ID,
  LOOPBACK_TIMEOUT_MS,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_FIXTURE_BYTES,
  OUTPUT_TARGET_ID,
  PHASES,
  PRODUCER_ID,
  ROUTE_IDS,
  SOURCE_HASH_TARGET_ID,
  TOOL_API_CHANGE_ID,
  TOOL_SOURCE_TARGET_ID,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { ScenarioMode } from "./types.js";

export interface ScenarioPaths {
  readonly rootPath: string;
  readonly canaryRelativePath: string;
  readonly sourceSnapshotRelativePath: string;
  readonly outputRelativePath: string;
}

export function createScenarioManifest(
  mode: ScenarioMode,
  runId: string,
): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId: `m2b-eslint-${mode}`,
    route: "eslint-plugin",
    phases: [
      PHASES.moduleEvaluation,
      PHASES.pluginInitialization,
      PHASES.ruleCreate,
      PHASES.visitorCallback,
      PHASES.fixerCallback,
      PHASES.officialApiChange,
    ],
    triggerTypes: ["configured", "explicit"],
    adapterVersion: ADAPTER_VERSION,
    producerId: PRODUCER_ID,
    workerId: null,
    cwdId: "eslint-fixture-root",
    toolName: "eslint",
    toolVersion: ESLINT_VERSION,
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
        timeoutMs: LOOPBACK_TIMEOUT_MS,
      },
      {
        targetId: CHILD_TARGET_ID,
        kind: "fixed-child",
        timeoutMs: CHILD_TIMEOUT_MS,
        maxOutputBytes: MAX_CHILD_OUTPUT_BYTES,
      },
    ],
    attempts: [
      {
        attemptId: ATTEMPT_IDS.environment,
        type: "environment-canary-read",
        targetId: ENVIRONMENT_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileRead,
        type: "canary-file-read",
        targetId: CANARY_FILE_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileHash,
        type: "file-hash",
        targetId: SOURCE_HASH_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: ATTEMPT_IDS.fileWrite,
        type: "direct-filesystem-write",
        targetId: OUTPUT_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.loopback,
        type: "loopback-connect",
        targetId: LOOPBACK_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.child,
        type: "child-node-process",
        targetId: CHILD_TARGET_ID,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: ROUTE_IDS.moduleEvaluation,
        phase: PHASES.moduleEvaluation,
        triggerType: "configured",
        invocationKind: "module-evaluation",
        logicalUnitId: "eslint-plugin-entry",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.pluginInitialization,
        phase: PHASES.pluginInitialization,
        triggerType: "configured",
        invocationKind: "tool-initialization",
        logicalUnitId: "eslint-plugin",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.ruleCreate,
        phase: PHASES.ruleCreate,
        triggerType: "configured",
        invocationKind: "rule-create",
        logicalUnitId: "fixed-answer-rule",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.visitorCallback,
        phase: PHASES.visitorCallback,
        triggerType: "configured",
        invocationKind: "visitor-callback",
        logicalUnitId: FIXTURE_LOGICAL_ID,
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.fixerCallback,
        phase: PHASES.fixerCallback,
        triggerType: "configured",
        invocationKind: "fixer-invocation",
        logicalUnitId: FIXTURE_LOGICAL_ID,
        enabled: true,
      },
    ],
    toolApiTargets: [
      { targetId: TOOL_SOURCE_TARGET_ID, classification: "source" },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: TOOL_API_CHANGE_ID,
        phase: PHASES.officialApiChange,
        triggerType: "explicit",
        changeKind: "source-fix",
        targetId: TOOL_SOURCE_TARGET_ID,
        enabled: true,
      },
    ],
  };
}

export function createScenarioRuntimeBindings(
  paths: ScenarioPaths,
  loopbackPort: number,
): ProbeRuntimeBindings {
  return {
    schemaVersion: PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
    bindings: [
      {
        targetId: EVENT_TARGET_ID,
        kind: "path",
        rootPath: paths.rootPath,
        relativePath: `${PRODUCER_ID}.jsonl`,
      },
      { targetId: ENVIRONMENT_TARGET_ID, kind: "environment" },
      {
        targetId: CANARY_FILE_TARGET_ID,
        kind: "path",
        rootPath: paths.rootPath,
        relativePath: paths.canaryRelativePath,
      },
      {
        targetId: SOURCE_HASH_TARGET_ID,
        kind: "path",
        rootPath: paths.rootPath,
        relativePath: paths.sourceSnapshotRelativePath,
      },
      {
        targetId: OUTPUT_TARGET_ID,
        kind: "path",
        rootPath: paths.rootPath,
        relativePath: paths.outputRelativePath,
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

export function validateEslintManifestContract(manifest: ProbeManifest): void {
  const expectedPhases = [
    PHASES.moduleEvaluation,
    PHASES.pluginInitialization,
    PHASES.ruleCreate,
    PHASES.visitorCallback,
    PHASES.fixerCallback,
    PHASES.officialApiChange,
  ];
  if (
    manifest.route !== "eslint-plugin" ||
    manifest.eventSinkTargetId !== EVENT_TARGET_ID ||
    !sameValues(manifest.phases, expectedPhases) ||
    !sameValues(manifest.triggerTypes, ["configured", "explicit"]) ||
    manifest.attempts.length !== Object.keys(ATTEMPT_IDS).length ||
    manifest.routeInvocations.length !== Object.keys(ROUTE_IDS).length ||
    manifest.toolApiChanges.length !== 1 ||
    manifest.toolApiChanges[0]?.toolApiChangeId !== TOOL_API_CHANGE_ID
  ) {
    throw new AdapterError("ESLINT_MANIFEST_CONTRACT_INVALID");
  }
  for (const routeId of Object.values(ROUTE_IDS)) {
    if (
      !manifest.routeInvocations.some(
        (definition) =>
          definition.routeInvocationId === routeId && definition.enabled,
      )
    ) {
      throw new AdapterError("ESLINT_MANIFEST_CONTRACT_INVALID");
    }
  }
  for (const attemptId of Object.values(ATTEMPT_IDS)) {
    if (
      !manifest.attempts.some(
        (definition) =>
          definition.attemptId === attemptId && definition.enabled,
      )
    ) {
      throw new AdapterError("ESLINT_MANIFEST_CONTRACT_INVALID");
    }
  }
}
