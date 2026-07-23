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
  CODEGEN_HASH_EVIDENCE_SCHEMA_VERSION,
  CODEGEN_RUN_METADATA_SCHEMA_VERSION,
  CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION,
  CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION,
  CODEGEN_SUMMARY_SCHEMA_VERSION,
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

export type CodegenProfileId = "permissive" | "constrained";

export interface CodegenRouteExpectation {
  readonly routeInvocationId: string;
  readonly phase: string;
  readonly outcome: "success";
  readonly normalizedErrorCodes: readonly [null];
}

export interface CodegenAttemptExpectation {
  readonly attemptId: string;
  readonly attemptType: AttemptType;
  readonly outcome: Outcome;
  readonly normalizedErrorCodes: readonly (string | null)[];
}

export interface CodegenToolExpectation {
  readonly toolApiChangeId: string;
  readonly changeKind: ToolApiChangeKind;
  readonly targetId: string;
  readonly targetClassification: HashClassification;
  readonly outcome: "skipped";
  readonly normalizedErrorCodes: readonly ["NOT_APPLICABLE"];
  readonly changeState: "unavailable";
}

export interface CodegenHashExpectation {
  readonly evidenceKind: HashEvidenceKind;
  readonly producerId: string;
  readonly targetId: string;
  readonly classification: HashClassification;
  readonly state: HashDeltaState;
}

export interface CodegenScenarioExpected {
  readonly routes: readonly CodegenRouteExpectation[];
  readonly attempts: readonly CodegenAttemptExpectation[];
  readonly toolChanges: readonly CodegenToolExpectation[];
  readonly hashes: readonly CodegenHashExpectation[];
}

export interface CodegenScenarioDefinition {
  readonly schemaVersion: typeof CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c";
  readonly adapterId: "codegen";
  readonly evidenceClass: "adapter-run";
  readonly profileId: CodegenProfileId;
  readonly outputLocation: "results/runs/m3-codegen";
  readonly producerId: "codegen-cli-producer";
  readonly segmentId: "codegen-cli-producer";
  readonly expected: CodegenScenarioExpected;
}

export interface CodegenRuntimeContext {
  readonly profileRevision: string;
  readonly containerInput: Sha256Digest;
  readonly segmentRetention: "immutable-raw-input";
}

export interface CodegenScenarioSnapshot extends Omit<
  CodegenScenarioDefinition,
  "schemaVersion"
> {
  readonly schemaVersion: typeof CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION;
  readonly runId: string;
  readonly runtimeContext: CodegenRuntimeContext;
  readonly segments: readonly [SegmentDefinition];
}

export interface CodegenRawInputIdentity {
  readonly location:
    | "raw/manifest.snapshot.json"
    | "raw/run-completion.snapshot.json"
    | "raw/segments/codegen-cli-producer.jsonl";
  readonly byteLength: number;
  readonly sha256: Sha256Digest;
}

export interface CodegenObservedRoute {
  readonly routeInvocationId: string;
  readonly phase: string;
  readonly outcome: Outcome;
  readonly normalizedErrorCode: string | null;
}

export interface CodegenObservedAttempt {
  readonly attemptId: string;
  readonly attemptType: AttemptType;
  readonly outcome: Outcome;
  readonly normalizedErrorCode: string | null;
}

export interface CodegenObservedToolChange {
  readonly toolApiChangeId: string;
  readonly changeKind: ToolApiChangeKind;
  readonly targetId: string;
  readonly targetClassification: HashClassification;
  readonly outcome: Outcome;
  readonly normalizedErrorCode: string | null;
  readonly changeState: HashDeltaState;
}

export interface CodegenHashEvidenceRecord {
  readonly evidenceKind: HashEvidenceKind;
  readonly producerId: string;
  readonly targetId: string;
  readonly classification: HashClassification;
  readonly state: HashDeltaState;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly globalSequences: readonly number[];
}

export interface CodegenComparisonRecord {
  readonly identity: string;
  readonly expected: string;
  readonly observed: string;
  readonly matches: boolean;
}

export interface CodegenCompleteRunMetadata {
  readonly schemaVersion: typeof CODEGEN_RUN_METADATA_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c";
  readonly adapterId: "codegen";
  readonly evidenceClass: "adapter-run";
  readonly profileId: CodegenProfileId;
  readonly validity: "complete";
  readonly timedOut: false;
  readonly errorCodes: readonly [];
  readonly ordering: {
    readonly key: "producer-id-then-segment-id";
    readonly preservesSegmentLineOrder: true;
    readonly causalOrder: false;
  };
  readonly runtimeContext: CodegenRuntimeContext;
  readonly rawInputs: readonly CodegenRawInputIdentity[];
  readonly evidenceLocations: {
    readonly manifest: "raw/manifest.snapshot.json";
    readonly completion: "raw/run-completion.snapshot.json";
    readonly events: "derived/events.jsonl";
    readonly summary: "derived/summary.json";
    readonly comparison: "derived/comparison.md";
    readonly hashes: "derived/hashes.json";
    readonly segment: "raw/segments/codegen-cli-producer.jsonl";
  };
}

export interface CodegenInconclusiveRunMetadata {
  readonly schemaVersion: typeof CODEGEN_RUN_METADATA_SCHEMA_VERSION;
  readonly runId: string | null;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c" | null;
  readonly adapterId: "codegen" | null;
  readonly evidenceClass: "adapter-run" | null;
  readonly profileId: CodegenProfileId | null;
  readonly validity: "inconclusive";
  readonly timedOut: boolean;
  readonly errorCodes: readonly LabErrorCode[];
  readonly ordering: null;
  readonly runtimeContext: null;
  readonly rawInputs: null;
  readonly evidenceLocations: {
    readonly manifest: "raw/manifest.snapshot.json" | null;
    readonly completion: "raw/run-completion.snapshot.json" | null;
    readonly events: null;
    readonly summary: "derived/summary.json";
    readonly comparison: null;
    readonly hashes: null;
    readonly segment: "raw/segments/codegen-cli-producer.jsonl";
  };
}

export interface CodegenCompleteSummary {
  readonly schemaVersion: typeof CODEGEN_SUMMARY_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c";
  readonly validity: "complete";
  readonly counts: {
    readonly totalEvents: number;
    readonly routeInvocations: number;
    readonly capabilityAttempts: number;
    readonly toolApiChanges: number;
  };
  readonly routes: readonly CodegenObservedRoute[];
  readonly attempts: readonly CodegenObservedAttempt[];
  readonly toolChanges: readonly CodegenObservedToolChange[];
  readonly hashes: readonly CodegenHashEvidenceRecord[];
  readonly comparison: {
    readonly matches: boolean;
    readonly records: readonly CodegenComparisonRecord[];
  };
  readonly evidenceLocation: "derived/events.jsonl";
}

export interface CodegenInconclusiveSummary {
  readonly schemaVersion: typeof CODEGEN_SUMMARY_SCHEMA_VERSION;
  readonly runId: string | null;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c" | null;
  readonly validity: "inconclusive";
  readonly counts: null;
  readonly routes: null;
  readonly attempts: null;
  readonly toolChanges: null;
  readonly hashes: null;
  readonly comparison: null;
  readonly evidenceLocation: null;
  readonly errorCodes: readonly LabErrorCode[];
}

export interface CodegenHashEvidence {
  readonly schemaVersion: typeof CODEGEN_HASH_EVIDENCE_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: "codegen-observe-p" | "codegen-observe-c";
  readonly records: readonly CodegenHashEvidenceRecord[];
}

export interface CodegenCompleteCollection {
  readonly validity: "complete";
  readonly snapshot: CodegenScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly events: readonly CanonicalEventEnvelope[];
  readonly metadata: CodegenCompleteRunMetadata;
  readonly summary: CodegenCompleteSummary;
  readonly hashes: CodegenHashEvidence;
  readonly files: Readonly<{
    "run-metadata.json": string;
    "events.jsonl": string;
    "summary.json": string;
    "comparison.md": string;
    "hashes.json": string;
  }>;
}

export interface CodegenInconclusiveCollection {
  readonly validity: "inconclusive";
  readonly snapshot: CodegenScenarioSnapshot | null;
  readonly completion: RunCompletion | null;
  readonly events: null;
  readonly metadata: CodegenInconclusiveRunMetadata;
  readonly summary: CodegenInconclusiveSummary;
  readonly hashes: null;
  readonly files: Readonly<{
    "run-metadata.json": string;
    "summary.json": string;
  }>;
}

export type CodegenCollectionResult =
  CodegenCompleteCollection | CodegenInconclusiveCollection;

export interface CodegenCollectInput {
  readonly manifestSnapshotBytes: unknown;
  readonly completionSnapshotBytes: unknown;
  readonly segmentBytes: unknown;
}
