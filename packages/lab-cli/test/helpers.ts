import {
  EVENT_KINDS,
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MANIFEST_SCHEMA_VERSION,
  serializeProbeEvent,
  type EventKind,
  type ProbeEvent,
  type ProbeManifest,
} from "@tskaigi-lab/probe-core";

import {
  FIXED_EVIDENCE_CLASS,
  FIXED_PROFILE_ID,
  FIXED_RESULTS_LOCATION,
  FIXED_SCENARIO_ID,
  RUN_COMPLETION_SCHEMA_VERSION,
  SCENARIO_DEFINITION_SCHEMA_VERSION,
  SCENARIO_SNAPSHOT_SCHEMA_VERSION,
} from "../src/constants.js";
import { createFixedFixture } from "../src/fixture.js";
import type {
  CollectRunInput,
  ScenarioDefinition,
  ScenarioSnapshot,
} from "../src/types.js";

export function fixedDefinition(): ScenarioDefinition {
  return {
    schemaVersion: SCENARIO_DEFINITION_SCHEMA_VERSION,
    scenarioId: FIXED_SCENARIO_ID,
    evidenceClass: FIXED_EVIDENCE_CLASS,
    profileId: FIXED_PROFILE_ID,
    outputLocation: FIXED_RESULTS_LOCATION,
    expected: {
      totalEvents: 2,
      eventKinds: EVENT_KINDS.map((eventKind) => ({
        id: eventKind,
        count: eventKind === "route-invocation" ? 2 : 0,
      })),
      routePhases: [{ id: "synthetic-route-phase", count: 2 }],
      attemptOutcomes: [],
      toolChangeOutcomes: [],
      hashDeltas: [],
    },
  };
}

export function fixedInput(runId = "m3-test-run"): CollectRunInput {
  return createFixedFixture(fixedDefinition(), runId);
}

export function clone<T>(input: T): T {
  return structuredClone(input);
}

export function utf8Bytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "utf8"));
}

export function segmentText(value: Uint8Array): string {
  return Buffer.from(value).toString("utf8");
}

export function replaceSegmentEvent(
  input: CollectRunInput,
  segmentId: "segment-a" | "segment-b",
  transform: (event: Record<string, unknown>) => Record<string, unknown>,
): CollectRunInput {
  const cloned = clone(input);
  const snapshot = cloned.snapshot as ReturnType<
    typeof createFixedFixture
  >["snapshot"];
  const segments = cloned.segments as Record<string, Uint8Array>;
  const definition = snapshot.segments.find(
    (segment) => segment.segmentId === segmentId,
  );
  if (definition === undefined) throw new Error("missing test segment");
  const raw = segments[segmentId];
  if (raw === undefined) throw new Error("missing test bytes");
  const parsed = JSON.parse(segmentText(raw).trimEnd()) as Record<
    string,
    unknown
  >;
  segments[segmentId] = utf8Bytes(
    `${serializeProbeEvent(transform(parsed), definition.manifest)}\n`,
  );
  return cloned;
}

export function replaceEventBySequence(
  input: CollectRunInput,
  segmentId: string,
  producerSequence: number,
  transform: (event: Record<string, unknown>) => Record<string, unknown>,
): CollectRunInput {
  const cloned = clone(input);
  const snapshot = cloned.snapshot as ScenarioSnapshot;
  const definition = snapshot.segments.find(
    (segment) => segment.segmentId === segmentId,
  );
  if (definition === undefined) throw new Error("missing test segment");
  const segments = cloned.segments as Record<string, Uint8Array>;
  const raw = segments[segmentId];
  if (raw === undefined) throw new Error("missing test bytes");
  const events = segmentText(raw)
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  const index = events.findIndex(
    (event) => event.producerSequence === producerSequence,
  );
  const event = events[index];
  if (index < 0 || event === undefined) throw new Error("missing test event");
  events[index] = transform(event);
  segments[segmentId] = utf8Bytes(
    `${events
      .map((item) => serializeProbeEvent(item, definition.manifest))
      .join("\n")}\n`,
  );
  return cloned;
}

export function rewriteSegmentEvents(
  input: CollectRunInput,
  segmentId: string,
  transform: (
    events: readonly Record<string, unknown>[],
  ) => readonly Record<string, unknown>[],
): CollectRunInput {
  const cloned = clone(input);
  const snapshot = cloned.snapshot as ScenarioSnapshot;
  const definition = snapshot.segments.find(
    (segment) => segment.segmentId === segmentId,
  );
  if (definition === undefined) throw new Error("missing test segment");
  const segments = cloned.segments as Record<string, Uint8Array>;
  const raw = segments[segmentId];
  if (raw === undefined) throw new Error("missing test bytes");
  const events = segmentText(raw)
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  segments[segmentId] = utf8Bytes(
    `${transform(events)
      .map((item) => serializeProbeEvent(item, definition.manifest))
      .join("\n")}\n`,
  );
  return cloned;
}

export function mismatchingExpectedInput(): CollectRunInput {
  const input = clone(fixedInput());
  const snapshot = input.snapshot as {
    expected: {
      totalEvents: number;
      eventKinds: { id: EventKind; count: number }[];
    };
  };
  snapshot.expected.totalEvents = 1;
  const route = snapshot.expected.eventKinds.find(
    (item) => item.id === "route-invocation",
  );
  if (route === undefined) throw new Error("missing route expectation");
  route.count = 1;
  return input;
}

export function completeWithoutSegments(): CollectRunInput {
  const definition = fixedDefinition();
  return {
    snapshot: {
      schemaVersion: SCENARIO_SNAPSHOT_SCHEMA_VERSION,
      runId: "m3-empty-baseline",
      scenarioId: definition.scenarioId,
      evidenceClass: definition.evidenceClass,
      profileId: definition.profileId,
      outputLocation: definition.outputLocation,
      expected: {
        totalEvents: 0,
        eventKinds: EVENT_KINDS.map((id) => ({ id, count: 0 })),
        routePhases: [],
        attemptOutcomes: [],
        toolChangeOutcomes: [],
        hashDeltas: [],
      },
      segments: [],
    },
    completion: {
      schemaVersion: RUN_COMPLETION_SCHEMA_VERSION,
      scenarioStarted: true,
      toolTerminated: true,
      scenarioEnded: true,
      hashFinalized: true,
      timedOut: false,
      segmentCloses: [],
    },
    segments: {},
  };
}

export function hashAndToolChangeInput(): CollectRunInput {
  const runId = "m3-hash-tool-run";
  const scenarioId = "m3-hash-tool-scenario";
  const producerId = "producer-hash-tool";
  const manifest: ProbeManifest = {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli",
    phases: ["route-phase", "hash-phase", "tool-change-phase"],
    triggerTypes: ["explicit"],
    adapterVersion: "0.0.0",
    producerId,
    workerId: null,
    cwdId: "synthetic-fixture-root",
    toolName: "synthetic-tool",
    toolVersion: "0.0.0",
    eventSinkTargetId: "event-segment",
    targets: [
      { targetId: "event-segment", kind: "event-segment" },
      {
        targetId: "source-hash-target",
        kind: "file-hash",
        classification: "source",
        maxBytes: 1024,
      },
    ],
    attempts: [
      {
        attemptId: "source-hash-attempt",
        type: "file-hash",
        targetId: "source-hash-target",
        phase: "hash-phase",
        triggerType: "explicit",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: "source-hash-after-attempt",
        type: "file-hash",
        targetId: "source-hash-target",
        phase: "hash-phase",
        triggerType: "explicit",
        enabled: true,
        hashPosition: "after",
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: "route-invocation",
        phase: "route-phase",
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "synthetic-unit",
        enabled: true,
      },
    ],
    toolApiTargets: [
      { targetId: "artifact-target", classification: "artifact" },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: "artifact-change",
        phase: "tool-change-phase",
        triggerType: "explicit",
        changeKind: "emitted-asset",
        targetId: "artifact-target",
        enabled: true,
      },
    ],
  };
  const common = {
    schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli" as const,
    triggerType: "explicit" as const,
    adapterVersion: "0.0.0",
    producerId,
    timestamp: "2026-01-01T00:00:00.000Z",
    durationMs: 1,
    pid: 30,
    ppid: 1,
    workerId: null,
    cwdId: "synthetic-fixture-root",
    nodeVersion: "v20.18.2",
    toolName: "synthetic-tool",
    toolVersion: "0.0.0",
    outcome: "success" as const,
    normalizedErrorCode: null,
  };
  const events: ProbeEvent[] = [
    {
      ...common,
      eventKind: "route-invocation",
      producerSequence: 0,
      phase: "route-phase",
      routeInvocationId: "route-invocation",
      invocationKind: "cli-stage",
      logicalUnitId: "synthetic-unit",
    },
    {
      ...common,
      eventKind: "capability-attempt",
      producerSequence: 1,
      phase: "hash-phase",
      attemptId: "source-hash-attempt",
      attemptType: "file-hash",
      targetId: "source-hash-target",
      beforeHash: `sha256:${"a".repeat(64)}`,
      afterHash: null,
      details: {
        kind: "file-hash",
        state: "present",
        sizeBytes: 4,
      },
    },
    {
      ...common,
      eventKind: "tool-api-change",
      producerSequence: 3,
      phase: "tool-change-phase",
      toolApiChangeId: "artifact-change",
      changeKind: "emitted-asset",
      targetId: "artifact-target",
      targetClassification: "artifact",
      changed: true,
      beforeHash: null,
      afterHash: `sha256:${"b".repeat(64)}`,
      byteSizeBefore: null,
      byteSizeAfter: 8,
    },
  ];
  events.splice(2, 0, {
    ...common,
    eventKind: "capability-attempt",
    producerSequence: 2,
    phase: "hash-phase",
    attemptId: "source-hash-after-attempt",
    attemptType: "file-hash",
    targetId: "source-hash-target",
    beforeHash: null,
    afterHash: `sha256:${"a".repeat(64)}`,
    details: {
      kind: "file-hash",
      state: "present",
      sizeBytes: 4,
    },
  });
  const segment = utf8Bytes(
    `${events.map((event) => serializeProbeEvent(event, manifest)).join("\n")}\n`,
  );
  return {
    snapshot: {
      schemaVersion: SCENARIO_SNAPSHOT_SCHEMA_VERSION,
      runId,
      scenarioId,
      evidenceClass: FIXED_EVIDENCE_CLASS,
      profileId: FIXED_PROFILE_ID,
      outputLocation: FIXED_RESULTS_LOCATION,
      expected: {
        totalEvents: 4,
        eventKinds: EVENT_KINDS.map((id) => ({
          id,
          count: id === "capability-attempt" ? 2 : 1,
        })),
        routePhases: [{ id: "route-phase", count: 1 }],
        attemptOutcomes: [{ id: "file-hash", outcome: "success", count: 2 }],
        toolChangeOutcomes: [
          { id: "emitted-asset", outcome: "success", count: 1 },
        ],
        hashDeltas: [
          {
            evidenceKind: "file-hash",
            classification: "source",
            state: "unchanged",
            count: 1,
          },
          {
            evidenceKind: "tool-api-change",
            classification: "artifact",
            state: "changed",
            count: 1,
          },
        ],
      },
      segments: [{ segmentId: "segment-hash-tool", producerId, manifest }],
    },
    completion: {
      schemaVersion: RUN_COMPLETION_SCHEMA_VERSION,
      scenarioStarted: true,
      toolTerminated: true,
      scenarioEnded: true,
      hashFinalized: true,
      timedOut: false,
      segmentCloses: [{ segmentId: "segment-hash-tool", complete: true }],
    },
    segments: { "segment-hash-tool": segment },
  };
}
