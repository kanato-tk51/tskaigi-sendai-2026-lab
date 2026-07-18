import type {
  AttemptType,
  EventKind,
  Outcome,
  ProbeEvent,
  ProbeManifest,
  Sha256Digest,
  ToolApiChangeKind,
} from "@tskaigi-lab/probe-core";

import type {
  CANONICAL_EVENT_SCHEMA_VERSION,
  HASH_EVIDENCE_SCHEMA_VERSION,
  LabErrorCode,
  RUN_COMPLETION_SCHEMA_VERSION,
  RUN_METADATA_SCHEMA_VERSION,
  SCENARIO_DEFINITION_SCHEMA_VERSION,
  SCENARIO_SNAPSHOT_SCHEMA_VERSION,
  SUMMARY_SCHEMA_VERSION,
} from "./constants.js";

export interface CountExpectation<T extends string> {
  readonly id: T;
  readonly count: number;
}

export interface OutcomeCountExpectation<T extends string> {
  readonly id: T;
  readonly outcome: Outcome;
  readonly count: number;
}

export type HashEvidenceKind = "file-hash" | "tool-api-change";
export type HashDeltaState = "changed" | "unchanged" | "unavailable";
export type HashClassification = "source" | "artifact";

export interface HashDeltaExpectation {
  readonly evidenceKind: HashEvidenceKind;
  readonly classification: HashClassification;
  readonly state: HashDeltaState;
  readonly count: number;
}

export interface ScenarioExpected {
  readonly totalEvents: number;
  readonly eventKinds: readonly CountExpectation<EventKind>[];
  readonly routePhases: readonly CountExpectation<string>[];
  readonly attemptOutcomes: readonly OutcomeCountExpectation<AttemptType>[];
  readonly toolChangeOutcomes: readonly OutcomeCountExpectation<ToolApiChangeKind>[];
  readonly hashDeltas: readonly HashDeltaExpectation[];
}

export interface ScenarioDefinition {
  readonly schemaVersion: typeof SCENARIO_DEFINITION_SCHEMA_VERSION;
  readonly scenarioId: string;
  readonly evidenceClass: "contract-fixture";
  readonly profileId: "not-applicable";
  readonly outputLocation: "results/runs/m3-harness";
  readonly expected: ScenarioExpected;
}

export interface SegmentDefinition {
  readonly segmentId: string;
  readonly producerId: string;
  readonly manifest: ProbeManifest;
}

export interface ScenarioSnapshot {
  readonly schemaVersion: typeof SCENARIO_SNAPSHOT_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: string;
  readonly evidenceClass: "contract-fixture";
  readonly profileId: "not-applicable";
  readonly outputLocation: "results/runs/m3-harness";
  readonly expected: ScenarioExpected;
  readonly segments: readonly SegmentDefinition[];
}

export interface SegmentCloseStatus {
  readonly segmentId: string;
  readonly complete: boolean;
}

export interface RunCompletion {
  readonly schemaVersion: typeof RUN_COMPLETION_SCHEMA_VERSION;
  readonly scenarioStarted: boolean;
  readonly toolTerminated: boolean;
  readonly scenarioEnded: boolean;
  readonly hashFinalized: boolean;
  readonly timedOut: boolean;
  readonly segmentCloses: readonly SegmentCloseStatus[];
}

export interface CanonicalEventEnvelope {
  readonly schemaVersion: typeof CANONICAL_EVENT_SCHEMA_VERSION;
  readonly globalSequence: number;
  readonly event: ProbeEvent;
}

export interface SegmentMetadata {
  readonly segmentId: string;
  readonly producerId: string;
  readonly eventCount: number;
  readonly closeComplete: true;
}

export interface CompleteRunMetadata {
  readonly schemaVersion: typeof RUN_METADATA_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: string;
  readonly evidenceClass: "contract-fixture";
  readonly profileId: "not-applicable";
  readonly validity: "complete";
  readonly timedOut: false;
  readonly errorCodes: readonly [];
  readonly ordering: {
    readonly key: "producer-id-then-segment-id";
    readonly preservesSegmentLineOrder: true;
    readonly causalOrder: false;
  };
  readonly runtimeContext: {
    readonly profileRevision: "not-applicable";
    readonly containerInput: "not-applicable";
    readonly segmentRetention: "immutable-raw-input";
    readonly producers: readonly ProducerRuntimeContext[];
  };
  readonly segments: readonly SegmentMetadata[];
  readonly evidenceLocations: {
    readonly manifest: "manifest.snapshot.json";
    readonly completion: "run-completion.snapshot.json";
    readonly events: "events.jsonl";
    readonly summary: "summary.json";
    readonly comparison: "comparison.md";
    readonly hashes: "hashes.json";
    readonly segments: "segments";
  };
}

export interface InconclusiveRunMetadata {
  readonly schemaVersion: typeof RUN_METADATA_SCHEMA_VERSION;
  readonly runId: string | null;
  readonly scenarioId: string | null;
  readonly evidenceClass: "contract-fixture" | null;
  readonly profileId: "not-applicable" | null;
  readonly validity: "inconclusive";
  readonly timedOut: boolean;
  readonly errorCodes: readonly LabErrorCode[];
  readonly ordering: null;
  readonly runtimeContext: null;
  readonly segments: null;
  readonly evidenceLocations: {
    readonly manifest: "manifest.snapshot.json" | null;
    readonly completion: "run-completion.snapshot.json" | null;
    readonly events: null;
    readonly summary: "summary.json";
    readonly comparison: null;
    readonly hashes: null;
    readonly segments: "segments";
  };
}

export interface ProducerRuntimeContext {
  readonly producerId: string;
  readonly adapterVersion: string;
  readonly nodeVersion: string | null;
  readonly toolName: string;
  readonly toolVersion: string;
}

export interface EventKindCount {
  readonly eventKind: EventKind;
  readonly count: number;
}

export interface RoutePhaseCount {
  readonly phase: string;
  readonly count: number;
}

export interface AttemptOutcomeCount {
  readonly attemptType: AttemptType;
  readonly outcome: Outcome;
  readonly count: number;
}

export interface ToolChangeOutcomeCount {
  readonly changeKind: ToolApiChangeKind;
  readonly outcome: Outcome;
  readonly count: number;
}

export interface HashDeltaCount {
  readonly evidenceKind: HashEvidenceKind;
  readonly classification: HashClassification;
  readonly state: HashDeltaState;
  readonly count: number;
}

export interface ProducerProcessSummary {
  readonly producerId: string;
  readonly processCount: number;
  readonly internalParentLinks: number;
  readonly externalParentLinks: number;
  readonly workerIds: readonly (string | null)[];
}

export interface MetricComparison {
  readonly metric: string;
  readonly expected: number;
  readonly observed: number;
  readonly matches: boolean;
}

export interface CompleteSummary {
  readonly schemaVersion: typeof SUMMARY_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: string;
  readonly validity: "complete";
  readonly counts: {
    readonly totalEvents: number;
    readonly eventKinds: readonly EventKindCount[];
    readonly routePhases: readonly RoutePhaseCount[];
    readonly attempts: readonly AttemptOutcomeCount[];
    readonly toolChanges: readonly ToolChangeOutcomeCount[];
    readonly hashDeltas: readonly HashDeltaCount[];
  };
  readonly processes: readonly ProducerProcessSummary[];
  readonly hashRecordCount: number;
  readonly comparison: {
    readonly matches: boolean;
    readonly metrics: readonly MetricComparison[];
  };
  readonly evidenceLocation: "events.jsonl";
}

export interface InconclusiveSummary {
  readonly schemaVersion: typeof SUMMARY_SCHEMA_VERSION;
  readonly runId: string | null;
  readonly scenarioId: string | null;
  readonly validity: "inconclusive";
  readonly counts: null;
  readonly processes: null;
  readonly hashRecordCount: null;
  readonly comparison: null;
  readonly evidenceLocation: null;
  readonly errorCodes: readonly LabErrorCode[];
}

export interface HashEvidenceRecord {
  readonly evidenceKind: HashEvidenceKind;
  readonly producerId: string;
  readonly targetId: string;
  readonly classification: HashClassification;
  readonly state: HashDeltaState;
  readonly changed: boolean | null;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly globalSequences: readonly number[];
}

export interface HashEvidence {
  readonly schemaVersion: typeof HASH_EVIDENCE_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: string;
  readonly records: readonly HashEvidenceRecord[];
}

export interface CompleteCollection {
  readonly validity: "complete";
  readonly snapshot: ScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly events: readonly CanonicalEventEnvelope[];
  readonly metadata: CompleteRunMetadata;
  readonly summary: CompleteSummary;
  readonly hashes: HashEvidence;
  readonly eventsJsonl: string;
  readonly metadataJson: string;
  readonly summaryJson: string;
  readonly hashesJson: string;
  readonly comparisonMarkdown: string;
}

export interface InconclusiveCollection {
  readonly validity: "inconclusive";
  readonly snapshot: ScenarioSnapshot | null;
  readonly completion: RunCompletion | null;
  readonly events: null;
  readonly metadata: InconclusiveRunMetadata;
  readonly summary: InconclusiveSummary;
  readonly hashes: null;
  readonly eventsJsonl: null;
  readonly metadataJson: string;
  readonly summaryJson: string;
  readonly hashesJson: null;
  readonly comparisonMarkdown: null;
}

export type CollectionResult = CompleteCollection | InconclusiveCollection;

export interface CollectRunInput {
  readonly snapshot: unknown;
  readonly completion: unknown;
  readonly segments: unknown;
}

export interface PersistedRunInput {
  readonly snapshot: ScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly segments: Readonly<Record<string, Uint8Array>>;
}
