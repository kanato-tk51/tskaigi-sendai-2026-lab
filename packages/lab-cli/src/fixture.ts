import {
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MANIFEST_SCHEMA_VERSION,
  serializeProbeEvent,
} from "@tskaigi-lab/probe-core";
import type { ProbeEvent, ProbeManifest } from "@tskaigi-lab/probe-core";

import {
  FIXED_EVIDENCE_CLASS,
  FIXED_PROFILE_ID,
  FIXED_RESULTS_LOCATION,
  RUN_COMPLETION_SCHEMA_VERSION,
  SCENARIO_SNAPSHOT_SCHEMA_VERSION,
} from "./constants.js";
import type {
  RunCompletion,
  ScenarioDefinition,
  ScenarioSnapshot,
} from "./types.js";

const PHASE = "synthetic-route-phase" as const;
const EVENT_TARGET_ID = "synthetic-event-segment" as const;

function manifestFor(
  runId: string,
  scenarioId: string,
  producerId: string,
): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli",
    phases: [PHASE],
    triggerTypes: ["explicit"],
    adapterVersion: "0.0.0",
    producerId,
    workerId: null,
    cwdId: "synthetic-fixture-root",
    toolName: "synthetic-tool",
    toolVersion: "0.0.0",
    eventSinkTargetId: EVENT_TARGET_ID,
    targets: [{ targetId: EVENT_TARGET_ID, kind: "event-segment" }],
    attempts: [],
    routeInvocations: [
      {
        routeInvocationId: `${producerId}-route`,
        phase: PHASE,
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: `${producerId}-unit`,
        enabled: true,
      },
    ],
    toolApiTargets: [],
    toolApiChanges: [],
  };
}

function routeEvent(
  manifest: ProbeManifest,
  timestamp: string,
  pid: number,
): ProbeEvent {
  return {
    schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
    eventKind: "route-invocation",
    runId: manifest.runId,
    scenarioId: manifest.scenarioId,
    route: manifest.route,
    phase: PHASE,
    triggerType: "explicit",
    adapterVersion: manifest.adapterVersion,
    producerId: manifest.producerId,
    producerSequence: 0,
    timestamp,
    durationMs: 1,
    pid,
    ppid: 1,
    workerId: null,
    cwdId: manifest.cwdId,
    nodeVersion: "v20.18.2",
    toolName: manifest.toolName,
    toolVersion: manifest.toolVersion,
    outcome: "success",
    normalizedErrorCode: null,
    routeInvocationId: `${manifest.producerId}-route`,
    invocationKind: "cli-stage",
    logicalUnitId: `${manifest.producerId}-unit`,
  };
}

function utf8Bytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "utf8"));
}

export interface FixedFixture {
  readonly snapshot: ScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly segments: Readonly<Record<string, Uint8Array>>;
}

export function createFixedFixture(
  definition: ScenarioDefinition,
  runId: string,
): FixedFixture {
  const manifestA = manifestFor(runId, definition.scenarioId, "producer-a");
  const manifestB = manifestFor(runId, definition.scenarioId, "producer-b");
  const segmentA = utf8Bytes(
    `${serializeProbeEvent(
      routeEvent(manifestA, "2026-01-01T00:00:02.000Z", 20),
      manifestA,
    )}\n`,
  );
  const segmentB = utf8Bytes(
    `${serializeProbeEvent(
      routeEvent(manifestB, "2026-01-01T00:00:01.000Z", 10),
      manifestB,
    )}\n`,
  );
  return Object.freeze({
    snapshot: Object.freeze({
      schemaVersion: SCENARIO_SNAPSHOT_SCHEMA_VERSION,
      runId,
      scenarioId: definition.scenarioId,
      evidenceClass: FIXED_EVIDENCE_CLASS,
      profileId: FIXED_PROFILE_ID,
      outputLocation: FIXED_RESULTS_LOCATION,
      expected: definition.expected,
      segments: Object.freeze([
        Object.freeze({
          segmentId: "segment-b",
          producerId: "producer-b",
          manifest: manifestB,
        }),
        Object.freeze({
          segmentId: "segment-a",
          producerId: "producer-a",
          manifest: manifestA,
        }),
      ]),
    }),
    completion: Object.freeze({
      schemaVersion: RUN_COMPLETION_SCHEMA_VERSION,
      scenarioStarted: true,
      toolTerminated: true,
      scenarioEnded: true,
      hashFinalized: true,
      timedOut: false,
      segmentCloses: Object.freeze([
        Object.freeze({ segmentId: "segment-b", complete: true }),
        Object.freeze({ segmentId: "segment-a", complete: true }),
      ]),
    }),
    segments: Object.freeze({
      "segment-b": segmentB,
      "segment-a": segmentA,
    }),
  });
}
