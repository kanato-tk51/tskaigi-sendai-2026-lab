import {
  EVENT_KINDS,
  type EventKind,
  type ProbeEvent,
} from "@tskaigi-lab/probe-core";

import {
  EVIDENCE_LOCATIONS,
  HASH_EVIDENCE_SCHEMA_VERSION,
  RUN_METADATA_SCHEMA_VERSION,
  SUMMARY_SCHEMA_VERSION,
} from "./constants.js";
import { LabError } from "./errors.js";
import { compareIds } from "./safe-data.js";
import type {
  AttemptOutcomeCount,
  CanonicalEventEnvelope,
  CompleteRunMetadata,
  CompleteSummary,
  EventKindCount,
  HashEvidence,
  HashEvidenceRecord,
  HashDeltaCount,
  MetricComparison,
  OutcomeCountExpectation,
  ProducerProcessSummary,
  RoutePhaseCount,
  RunCompletion,
  ScenarioSnapshot,
  SegmentMetadata,
  ToolChangeOutcomeCount,
} from "./types.js";

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function eventKindCounts(
  events: readonly ProbeEvent[],
): readonly EventKindCount[] {
  return EVENT_KINDS.map((eventKind) => ({
    eventKind,
    count: events.filter((event) => event.eventKind === eventKind).length,
  }));
}

function routePhaseCounts(
  events: readonly ProbeEvent[],
): readonly RoutePhaseCount[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.eventKind === "route-invocation") increment(counts, event.phase);
  }
  return [...counts]
    .sort(([left], [right]) => compareIds(left, right))
    .map(([phase, count]) => ({ phase, count }));
}

function attemptOutcomeCounts(
  events: readonly ProbeEvent[],
): readonly AttemptOutcomeCount[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.eventKind === "capability-attempt") {
      increment(counts, `${event.attemptType}\0${event.outcome}`);
    }
  }
  return [...counts]
    .sort(([left], [right]) => compareIds(left, right))
    .map(([key, count]) => {
      const [attemptType, outcome] = key.split("\0");
      return {
        attemptType: attemptType as AttemptOutcomeCount["attemptType"],
        outcome: outcome as AttemptOutcomeCount["outcome"],
        count,
      };
    });
}

function toolChangeOutcomeCounts(
  events: readonly ProbeEvent[],
): readonly ToolChangeOutcomeCount[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.eventKind === "tool-api-change") {
      increment(counts, `${event.changeKind}\0${event.outcome}`);
    }
  }
  return [...counts]
    .sort(([left], [right]) => compareIds(left, right))
    .map(([key, count]) => {
      const [changeKind, outcome] = key.split("\0");
      return {
        changeKind: changeKind as ToolChangeOutcomeCount["changeKind"],
        outcome: outcome as ToolChangeOutcomeCount["outcome"],
        count,
      };
    });
}

function hashDeltaCounts(
  records: readonly HashEvidenceRecord[],
): readonly HashDeltaCount[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    increment(
      counts,
      `${record.evidenceKind}\0${record.classification}\0${record.state}`,
    );
  }
  return [...counts]
    .sort(([left], [right]) => compareIds(left, right))
    .map(([key, count]) => {
      const [evidenceKind, classification, state] = key.split("\0");
      return {
        evidenceKind: evidenceKind as HashDeltaCount["evidenceKind"],
        classification: classification as HashDeltaCount["classification"],
        state: state as HashDeltaCount["state"],
        count,
      };
    });
}

function processSummaries(
  snapshot: ScenarioSnapshot,
  events: readonly ProbeEvent[],
): readonly ProducerProcessSummary[] {
  return [...snapshot.segments]
    .sort((left, right) => compareIds(left.producerId, right.producerId))
    .map((segment) => {
      const producerEvents = events.filter(
        (event) => event.producerId === segment.producerId,
      );
      const pids = new Set(producerEvents.map((event) => event.pid));
      const parentLinks = new Set(
        producerEvents.map((event) => `${event.pid}\0${event.ppid}`),
      );
      let internalParentLinks = 0;
      let externalParentLinks = 0;
      for (const link of parentLinks) {
        const separator = link.indexOf("\0");
        const parent = Number(link.slice(separator + 1));
        if (pids.has(parent)) internalParentLinks += 1;
        else externalParentLinks += 1;
      }
      const workerIds = [
        ...new Set(producerEvents.map((event) => event.workerId)),
      ].sort((left, right) => {
        if (left === null) return right === null ? 0 : -1;
        if (right === null) return 1;
        return compareIds(left, right);
      });
      return {
        producerId: segment.producerId,
        processCount: pids.size,
        internalParentLinks,
        externalParentLinks,
        workerIds,
      };
    });
}

function metricComparisons(
  snapshot: ScenarioSnapshot,
  events: readonly ProbeEvent[],
  kinds: readonly EventKindCount[],
  phases: readonly RoutePhaseCount[],
  attempts: readonly AttemptOutcomeCount[],
  toolChanges: readonly ToolChangeOutcomeCount[],
  hashDeltas: readonly HashDeltaCount[],
): readonly MetricComparison[] {
  const metrics: MetricComparison[] = [
    {
      metric: "total-events",
      expected: snapshot.expected.totalEvents,
      observed: events.length,
      matches: snapshot.expected.totalEvents === events.length,
    },
  ];
  const observedKinds = new Map(
    kinds.map((item) => [item.eventKind, item.count] as const),
  );
  for (const expectation of snapshot.expected.eventKinds) {
    const observed = observedKinds.get(expectation.id) ?? 0;
    metrics.push({
      metric: `event-kind:${expectation.id}`,
      expected: expectation.count,
      observed,
      matches: expectation.count === observed,
    });
  }
  const expectedPhases = new Map(
    snapshot.expected.routePhases.map((item) => [item.id, item.count] as const),
  );
  const observedPhases = new Map(
    phases.map((item) => [item.phase, item.count] as const),
  );
  const phaseIds = new Set([
    ...expectedPhases.keys(),
    ...observedPhases.keys(),
  ]);
  for (const phase of [...phaseIds].sort(compareIds)) {
    const expected = expectedPhases.get(phase) ?? 0;
    const observed = observedPhases.get(phase) ?? 0;
    metrics.push({
      metric: `route-phase:${phase}`,
      expected,
      observed,
      matches: expected === observed,
    });
  }

  const addOutcomeMetrics = <T extends string>(
    prefix: string,
    expectedItems: readonly OutcomeCountExpectation<T>[],
    observedItems: readonly {
      readonly outcome: string;
      readonly count: number;
    }[],
    observedId: (item: (typeof observedItems)[number]) => string,
  ): void => {
    const expected = new Map<string, number>(
      expectedItems.map(
        (item) => [`${item.id}\0${item.outcome}`, item.count] as const,
      ),
    );
    const observed = new Map<string, number>(
      observedItems.map(
        (item) => [`${observedId(item)}\0${item.outcome}`, item.count] as const,
      ),
    );
    const keys = new Set([...expected.keys(), ...observed.keys()]);
    for (const key of [...keys].sort(compareIds)) {
      const separator = key.indexOf("\0");
      const id = key.slice(0, separator);
      const outcome = key.slice(separator + 1);
      const expectedCount = expected.get(key) ?? 0;
      const observedCount = observed.get(key) ?? 0;
      metrics.push({
        metric: `${prefix}:${id}:${outcome}`,
        expected: expectedCount,
        observed: observedCount,
        matches: expectedCount === observedCount,
      });
    }
  };
  addOutcomeMetrics(
    "attempt-outcome",
    snapshot.expected.attemptOutcomes,
    attempts,
    (item) => (item as AttemptOutcomeCount).attemptType,
  );
  addOutcomeMetrics(
    "tool-change-outcome",
    snapshot.expected.toolChangeOutcomes,
    toolChanges,
    (item) => (item as ToolChangeOutcomeCount).changeKind,
  );

  const expectedHashes = new Map(
    snapshot.expected.hashDeltas.map(
      (item) =>
        [
          `${item.evidenceKind}\0${item.classification}\0${item.state}`,
          item.count,
        ] as const,
    ),
  );
  const observedHashes = new Map(
    hashDeltas.map(
      (item) =>
        [
          `${item.evidenceKind}\0${item.classification}\0${item.state}`,
          item.count,
        ] as const,
    ),
  );
  const hashKeys = new Set([
    ...expectedHashes.keys(),
    ...observedHashes.keys(),
  ]);
  for (const key of [...hashKeys].sort(compareIds)) {
    const [evidenceKind, classification, state] = key.split("\0");
    const expected = expectedHashes.get(key) ?? 0;
    const observed = observedHashes.get(key) ?? 0;
    metrics.push({
      metric: `hash-delta:${evidenceKind}:${classification}:${state}`,
      expected,
      observed,
      matches: expected === observed,
    });
  }
  return Object.freeze(metrics);
}

interface PendingFileHash {
  readonly producerId: string;
  readonly targetId: string;
  readonly classification: "source" | "artifact";
  beforeDeclared: boolean;
  afterDeclared: boolean;
  beforeSeen: boolean;
  afterSeen: boolean;
  beforeHash: HashEvidenceRecord["beforeHash"];
  afterHash: HashEvidenceRecord["afterHash"];
  readonly globalSequences: number[];
}

function hashEvidence(
  snapshot: ScenarioSnapshot,
  envelopes: readonly CanonicalEventEnvelope[],
): HashEvidence {
  const manifests = new Map(
    snapshot.segments.map((segment) => [segment.producerId, segment.manifest]),
  );
  const pending = new Map<string, PendingFileHash>();
  for (const segment of snapshot.segments) {
    for (const attempt of segment.manifest.attempts) {
      if (attempt.type !== "file-hash") continue;
      const target = segment.manifest.targets.find(
        (candidate) => candidate.targetId === attempt.targetId,
      );
      if (target?.kind !== "file-hash") {
        throw new LabError("HASH_EVIDENCE_INVALID");
      }
      const key = `${segment.producerId}\0${target.targetId}`;
      let entry = pending.get(key);
      if (entry === undefined) {
        entry = {
          producerId: segment.producerId,
          targetId: target.targetId,
          classification: target.classification,
          beforeDeclared: false,
          afterDeclared: false,
          beforeSeen: false,
          afterSeen: false,
          beforeHash: null,
          afterHash: null,
          globalSequences: [],
        };
        pending.set(key, entry);
      }
      if (
        (attempt.hashPosition === "before" && entry.beforeDeclared) ||
        (attempt.hashPosition === "after" && entry.afterDeclared)
      ) {
        throw new LabError("HASH_EVIDENCE_INVALID");
      }
      if (attempt.hashPosition === "before") entry.beforeDeclared = true;
      else entry.afterDeclared = true;
    }
  }
  const toolRecords: HashEvidenceRecord[] = [];
  for (const envelope of envelopes) {
    const event = envelope.event;
    if (
      event.eventKind === "capability-attempt" &&
      event.attemptType === "file-hash"
    ) {
      const manifest = manifests.get(event.producerId);
      const target = manifest?.targets.find(
        (candidate) => candidate.targetId === event.targetId,
      );
      const attempt = manifest?.attempts.find(
        (candidate) => candidate.attemptId === event.attemptId,
      );
      const entry = pending.get(`${event.producerId}\0${event.targetId}`);
      if (
        target?.kind !== "file-hash" ||
        attempt?.type !== "file-hash" ||
        entry === undefined
      ) {
        throw new LabError("HASH_EVIDENCE_INVALID");
      }
      if (attempt.hashPosition === "before") {
        if (entry.beforeSeen) throw new LabError("HASH_EVIDENCE_INVALID");
        entry.beforeSeen = true;
        entry.beforeHash =
          event.outcome === "success" ? event.beforeHash : null;
      } else {
        if (entry.afterSeen) throw new LabError("HASH_EVIDENCE_INVALID");
        entry.afterSeen = true;
        entry.afterHash = event.outcome === "success" ? event.afterHash : null;
      }
      entry.globalSequences.push(envelope.globalSequence);
    } else if (event.eventKind === "tool-api-change") {
      const changed = event.outcome === "success" ? event.changed : null;
      toolRecords.push(
        Object.freeze({
          evidenceKind: "tool-api-change",
          producerId: event.producerId,
          targetId: event.targetId,
          classification: event.targetClassification,
          state:
            changed === null
              ? "unavailable"
              : changed
                ? "changed"
                : "unchanged",
          changed,
          beforeHash: event.beforeHash,
          afterHash: event.afterHash,
          globalSequences: Object.freeze([envelope.globalSequence]),
        }),
      );
    }
  }
  const fileRecords = [...pending.values()].map((entry) => {
    const available =
      entry.beforeDeclared &&
      entry.afterDeclared &&
      entry.beforeSeen &&
      entry.afterSeen &&
      entry.beforeHash !== null &&
      entry.afterHash !== null;
    const changed = available ? entry.beforeHash !== entry.afterHash : null;
    return Object.freeze({
      evidenceKind: "file-hash" as const,
      producerId: entry.producerId,
      targetId: entry.targetId,
      classification: entry.classification,
      state:
        changed === null
          ? ("unavailable" as const)
          : changed
            ? ("changed" as const)
            : ("unchanged" as const),
      changed,
      beforeHash: entry.beforeHash,
      afterHash: entry.afterHash,
      globalSequences: Object.freeze(
        [...entry.globalSequences].sort((a, b) => a - b),
      ),
    });
  });
  const records = [...fileRecords, ...toolRecords].sort((left, right) => {
    const leftSequence = left.globalSequences[0] ?? Number.MAX_SAFE_INTEGER;
    const rightSequence = right.globalSequences[0] ?? Number.MAX_SAFE_INTEGER;
    if (leftSequence !== rightSequence) return leftSequence - rightSequence;
    const producerOrder = compareIds(left.producerId, right.producerId);
    return producerOrder === 0
      ? compareIds(left.targetId, right.targetId)
      : producerOrder;
  });
  return Object.freeze({
    schemaVersion: HASH_EVIDENCE_SCHEMA_VERSION,
    runId: snapshot.runId,
    scenarioId: snapshot.scenarioId,
    records: Object.freeze(records),
  });
}

function producerRuntimeContexts(
  snapshot: ScenarioSnapshot,
  events: readonly ProbeEvent[],
): CompleteRunMetadata["runtimeContext"]["producers"] {
  return Object.freeze(
    [...snapshot.segments]
      .sort((left, right) => compareIds(left.producerId, right.producerId))
      .map((segment) => {
        const producerEvents = events.filter(
          (event) => event.producerId === segment.producerId,
        );
        const nodeVersions = new Set(
          producerEvents.map((event) => event.nodeVersion),
        );
        if (nodeVersions.size > 1) {
          throw new LabError("RUNTIME_CONTEXT_INVALID");
        }
        return Object.freeze({
          producerId: segment.producerId,
          adapterVersion: segment.manifest.adapterVersion,
          nodeVersion: [...nodeVersions][0] ?? null,
          toolName: segment.manifest.toolName,
          toolVersion: segment.manifest.toolVersion,
        });
      }),
  );
}

export interface ReducedRun {
  readonly metadata: CompleteRunMetadata;
  readonly summary: CompleteSummary;
  readonly hashes: HashEvidence;
}

export function reduceRun(
  snapshot: ScenarioSnapshot,
  completion: RunCompletion,
  envelopes: readonly CanonicalEventEnvelope[],
  segmentMetadata: readonly SegmentMetadata[],
): ReducedRun {
  const events = envelopes.map((envelope) => envelope.event);
  const kinds = eventKindCounts(events);
  const phases = routePhaseCounts(events);
  const hashes = hashEvidence(snapshot, envelopes);
  const attempts = attemptOutcomeCounts(events);
  const toolChanges = toolChangeOutcomeCounts(events);
  const hashDeltas = hashDeltaCounts(hashes.records);
  const comparisons = metricComparisons(
    snapshot,
    events,
    kinds,
    phases,
    attempts,
    toolChanges,
    hashDeltas,
  );
  const metadata: CompleteRunMetadata = Object.freeze({
    schemaVersion: RUN_METADATA_SCHEMA_VERSION,
    runId: snapshot.runId,
    scenarioId: snapshot.scenarioId,
    evidenceClass: snapshot.evidenceClass,
    profileId: snapshot.profileId,
    validity: "complete",
    timedOut: false,
    errorCodes: [] as const,
    ordering: Object.freeze({
      key: "producer-id-then-segment-id",
      preservesSegmentLineOrder: true,
      causalOrder: false,
    }),
    runtimeContext: Object.freeze({
      profileRevision: "not-applicable",
      containerInput: "not-applicable",
      segmentRetention: "immutable-raw-input",
      producers: producerRuntimeContexts(snapshot, events),
    }),
    segments: Object.freeze([...segmentMetadata]),
    evidenceLocations: Object.freeze({
      manifest: EVIDENCE_LOCATIONS.manifest,
      completion: EVIDENCE_LOCATIONS.completion,
      events: EVIDENCE_LOCATIONS.events,
      summary: EVIDENCE_LOCATIONS.summary,
      comparison: EVIDENCE_LOCATIONS.comparison,
      hashes: EVIDENCE_LOCATIONS.hashes,
      segments: EVIDENCE_LOCATIONS.segments,
    }),
  });
  const summary: CompleteSummary = Object.freeze({
    schemaVersion: SUMMARY_SCHEMA_VERSION,
    runId: snapshot.runId,
    scenarioId: snapshot.scenarioId,
    validity: "complete",
    counts: Object.freeze({
      totalEvents: events.length,
      eventKinds: Object.freeze(kinds),
      routePhases: Object.freeze(phases),
      attempts: Object.freeze(attempts),
      toolChanges: Object.freeze(toolChanges),
      hashDeltas: Object.freeze(hashDeltas),
    }),
    processes: Object.freeze(processSummaries(snapshot, events)),
    hashRecordCount: hashes.records.length,
    comparison: Object.freeze({
      matches: comparisons.every((comparison) => comparison.matches),
      metrics: comparisons,
    }),
    evidenceLocation: EVIDENCE_LOCATIONS.events,
  });
  return Object.freeze({ metadata, summary, hashes });
}

export function observedEventKindCount(
  counts: readonly EventKindCount[],
  eventKind: EventKind,
): number {
  return counts.find((item) => item.eventKind === eventKind)?.count ?? 0;
}
