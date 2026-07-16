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
  BUNDLE_MUTATION_TARGET_ID,
  CANARY_FILE_TARGET_ID,
  CANARY_RELATIVE_PATH,
  CHILD_TARGET_ID,
  CWD_ID,
  DESIGNATED_RELATIVE_PATH,
  DIRECT_OUTPUT_RELATIVE_PATH,
  DIRECT_OUTPUT_TARGET_ID,
  EMITTED_ASSET_TARGET_ID,
  ENVIRONMENT_TARGET_ID,
  ENVIRONMENT_VARIABLE,
  EVENT_TARGET_ID,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  LOOPBACK_TARGET_ID,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_FIXTURE_BYTES,
  MODULE_TRANSFORM_TARGET_ID,
  PHASES,
  PLUGIN_NAME,
  PRODUCER_ID,
  ROUTE_IDS,
  SCENARIO_ID,
  SEGMENT_RELATIVE_PATH,
  SOURCE_HASH_TARGET_ID,
  TOOL_CHANGE_IDS,
  VITE_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export function createFixedManifest(runId: string): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId: SCENARIO_ID,
    route: "vite-plugin",
    phases: Object.values(PHASES),
    triggerTypes: ["configured", "automatic"],
    adapterVersion: ADAPTER_VERSION,
    producerId: PRODUCER_ID,
    workerId: null,
    cwdId: CWD_ID,
    toolName: "vite",
    toolVersion: VITE_VERSION,
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
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileRead,
        type: "canary-file-read",
        targetId: CANARY_FILE_TARGET_ID,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.fileHash,
        type: "file-hash",
        targetId: SOURCE_HASH_TARGET_ID,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: ATTEMPT_IDS.fileWrite,
        type: "direct-filesystem-write",
        targetId: DIRECT_OUTPUT_TARGET_ID,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.loopback,
        type: "loopback-connect",
        targetId: LOOPBACK_TARGET_ID,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
      },
      {
        attemptId: ATTEMPT_IDS.child,
        type: "child-node-process",
        targetId: CHILD_TARGET_ID,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: ROUTE_IDS.latePluginModuleCheckpoint,
        phase: PHASES.latePluginModuleCheckpoint,
        triggerType: "configured",
        invocationKind: "module-evaluation",
        logicalUnitId: PLUGIN_NAME,
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.pluginFactory,
        phase: PHASES.pluginFactory,
        triggerType: "configured",
        invocationKind: "plugin-factory",
        logicalUnitId: PLUGIN_NAME,
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.buildStart,
        phase: PHASES.buildStart,
        triggerType: "automatic",
        invocationKind: "build-hook",
        logicalUnitId: PLUGIN_NAME,
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.designatedTransform,
        phase: PHASES.designatedTransform,
        triggerType: "automatic",
        invocationKind: "module-hook",
        logicalUnitId: "vite-designated-module",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.generateBundle,
        phase: PHASES.generateBundle,
        triggerType: "automatic",
        invocationKind: "build-hook",
        logicalUnitId: "vite-single-output",
        enabled: true,
      },
      {
        routeInvocationId: ROUTE_IDS.writeBundle,
        phase: PHASES.writeBundle,
        triggerType: "automatic",
        invocationKind: "build-hook",
        logicalUnitId: "vite-single-output",
        enabled: true,
      },
    ],
    toolApiTargets: [
      {
        targetId: MODULE_TRANSFORM_TARGET_ID,
        classification: "source",
      },
      { targetId: EMITTED_ASSET_TARGET_ID, classification: "artifact" },
      { targetId: BUNDLE_MUTATION_TARGET_ID, classification: "artifact" },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: TOOL_CHANGE_IDS.moduleTransform,
        phase: PHASES.designatedTransform,
        triggerType: "automatic",
        changeKind: "module-transform",
        targetId: MODULE_TRANSFORM_TARGET_ID,
        enabled: true,
      },
      {
        toolApiChangeId: TOOL_CHANGE_IDS.emittedAsset,
        phase: PHASES.generateBundle,
        triggerType: "automatic",
        changeKind: "emitted-asset",
        targetId: EMITTED_ASSET_TARGET_ID,
        enabled: true,
      },
      {
        toolApiChangeId: TOOL_CHANGE_IDS.bundleMutation,
        phase: PHASES.generateBundle,
        triggerType: "automatic",
        changeKind: "bundle-mutation",
        targetId: BUNDLE_MUTATION_TARGET_ID,
        enabled: true,
      },
    ],
  };
}

export function createFixedRuntimeBindings(
  runRoot: string,
  adapterRoot: string,
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
        rootPath: adapterRoot,
        relativePath: DESIGNATED_RELATIVE_PATH,
      },
      {
        targetId: DIRECT_OUTPUT_TARGET_ID,
        kind: "path",
        rootPath: runRoot,
        relativePath: DIRECT_OUTPUT_RELATIVE_PATH,
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

export function validateViteManifestContract(manifest: ProbeManifest): void {
  if (
    manifest.route !== "vite-plugin" ||
    manifest.scenarioId !== SCENARIO_ID ||
    manifest.producerId !== PRODUCER_ID ||
    manifest.workerId !== null ||
    manifest.cwdId !== CWD_ID ||
    manifest.toolName !== "vite" ||
    manifest.toolVersion !== VITE_VERSION ||
    manifest.eventSinkTargetId !== EVENT_TARGET_ID ||
    !sameValues(manifest.phases, Object.values(PHASES)) ||
    !sameValues(manifest.triggerTypes, ["configured", "automatic"]) ||
    manifest.routeInvocations.length !== EXPECTED_ROUTE_COUNT ||
    manifest.attempts.length !== EXPECTED_CAPABILITY_COUNT ||
    manifest.toolApiTargets.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    manifest.toolApiChanges.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    !sameValues(
      manifest.routeInvocations.map((route) => route.routeInvocationId),
      Object.values(ROUTE_IDS),
    ) ||
    !sameValues(
      manifest.attempts.map((attempt) => attempt.attemptId),
      Object.values(ATTEMPT_IDS),
    ) ||
    !sameValues(
      manifest.toolApiChanges.map((change) => change.toolApiChangeId),
      Object.values(TOOL_CHANGE_IDS),
    ) ||
    manifest.routeInvocations.some((route) => !route.enabled) ||
    manifest.attempts.some(
      (attempt) =>
        !attempt.enabled ||
        attempt.phase !== PHASES.buildStart ||
        attempt.triggerType !== "automatic",
    ) ||
    manifest.toolApiChanges.some((change) => !change.enabled)
  ) {
    throw new AdapterError("M2D_CONTEXT_INVALID");
  }
}
