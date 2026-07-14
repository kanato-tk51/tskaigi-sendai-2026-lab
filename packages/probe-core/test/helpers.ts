import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";

import {
  PROBE_MANIFEST_SCHEMA_VERSION,
  PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "../src/index.js";
import type {
  CapabilityAttempt,
  PreparedProbeConfiguration,
  ProbeManifest,
  ProbeTarget,
  RouteInvocationDefinition,
  RuntimeBinding,
  ToolApiChangeDefinition,
  ToolApiTarget,
  TriggerType,
  ValidatedProbeConfiguration,
} from "../src/index.js";

export type TestCapabilityAttempt = CapabilityAttempt extends infer Attempt
  ? Attempt extends CapabilityAttempt
    ? Omit<Attempt, "phase" | "triggerType"> &
        Partial<Pick<Attempt, "phase" | "triggerType">>
    : never
  : never;

export interface ManifestOptions {
  readonly phases?: readonly string[];
  readonly triggerTypes?: readonly TriggerType[];
  readonly routeInvocations?: readonly RouteInvocationDefinition[];
  readonly toolApiTargets?: readonly ToolApiTarget[];
  readonly toolApiChanges?: readonly ToolApiChangeDefinition[];
}

export const TEST_PRODUCER_ID = "producer-1";
export const EVENT_TARGET = {
  targetId: "event-segment",
  kind: "event-segment",
} as const;

export function baseManifest(
  targets: readonly ProbeTarget[] = [],
  attempts: readonly TestCapabilityAttempt[] = [],
  options: ManifestOptions = {},
): ProbeManifest {
  const phases = options.phases ?? ["tool-initialization"];
  const triggerTypes = options.triggerTypes ?? ["configured"];
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId: "run-1",
    scenarioId: "scenario-1",
    route: "eslint-plugin",
    phases,
    triggerTypes,
    adapterVersion: "1.0.0",
    producerId: TEST_PRODUCER_ID,
    workerId: null,
    cwdId: "fixture-cwd",
    toolName: "test-tool",
    toolVersion: "1.0.0",
    eventSinkTargetId: EVENT_TARGET.targetId,
    targets: [...targets, EVENT_TARGET],
    attempts: attempts.map((attempt) => ({
      ...attempt,
      phase: attempt.phase ?? phases[0]!,
      triggerType: attempt.triggerType ?? triggerTypes[0]!,
    })) as CapabilityAttempt[],
    routeInvocations: options.routeInvocations ?? [],
    toolApiTargets: options.toolApiTargets ?? [],
    toolApiChanges: options.toolApiChanges ?? [],
  };
}

export function baseRuntimeBindings(
  eventRoot: string,
  bindings: readonly RuntimeBinding[] = [],
): {
  readonly schemaVersion: typeof PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION;
  readonly bindings: readonly RuntimeBinding[];
} {
  return {
    schemaVersion: PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
    bindings: [
      ...bindings,
      {
        targetId: EVENT_TARGET.targetId,
        kind: "path",
        rootPath: eventRoot,
        relativePath: `${TEST_PRODUCER_ID}.jsonl`,
      },
    ],
  };
}

export async function createTestConfiguration(
  targets: readonly ProbeTarget[],
  attempts: readonly TestCapabilityAttempt[],
  bindings: readonly RuntimeBinding[],
  options: ManifestOptions = {},
): Promise<{
  readonly configuration: PreparedProbeConfiguration;
  readonly eventRoot: string;
  readonly eventPath: string;
  cleanup(): Promise<void>;
}> {
  const fixture = await createValidatedTestConfiguration(
    targets,
    attempts,
    bindings,
    options,
  );
  const configuration = await prepareProbeConfiguration(fixture.configuration);
  return { ...fixture, configuration };
}

export async function createValidatedTestConfiguration(
  targets: readonly ProbeTarget[],
  attempts: readonly TestCapabilityAttempt[],
  bindings: readonly RuntimeBinding[],
  options: ManifestOptions = {},
): Promise<{
  readonly configuration: ValidatedProbeConfiguration;
  readonly eventRoot: string;
  readonly eventPath: string;
  cleanup(): Promise<void>;
}> {
  const eventRoot = await mkdtemp("/tmp/probe-core-events-");
  const configuration = validateProbeConfiguration(
    baseManifest(targets, attempts, options),
    baseRuntimeBindings(eventRoot, bindings),
  );
  return {
    configuration,
    eventRoot,
    eventPath: path.join(eventRoot, `${TEST_PRODUCER_ID}.jsonl`),
    async cleanup(): Promise<void> {
      await rm(eventRoot, { recursive: true, force: true });
    },
  };
}
