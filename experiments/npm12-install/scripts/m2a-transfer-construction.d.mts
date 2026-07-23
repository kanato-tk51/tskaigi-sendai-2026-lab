export interface M2aConstructionConstants {
  readonly generation: "20260721-01";
  readonly expectedRevision: "m2a-transfer-expected-20260721-01";
  readonly runId: string;
  readonly scenarioId: "m2a-npm-lifecycle";
  readonly sourceInputs: readonly string[];
  readonly constructionInputs: readonly string[];
  readonly sourceAggregate: string;
  readonly constructionBaselineAggregate: string;
  readonly acquisitionRoot: string;
  readonly acquisitionReceipt: string;
  readonly npmArchive: string;
  readonly toolchainRoot: string;
  readonly toolchainReceipt: string;
  readonly constructionRoot: string;
  readonly resultRoot: string;
  readonly compilerSteps: readonly Readonly<Record<string, unknown>>[];
  readonly toolchainPackages: readonly Readonly<Record<string, unknown>>[];
  readonly reviewedAcquisitionReceiptSha256: null;
  readonly reviewedAcquisitionTarballSha256: null;
  readonly reviewedToolchainReceiptSha256: null;
  readonly reviewedToolchainInventoryAggregate: null;
  readonly reviewedConstructorSourceSha256: null;
  readonly runtimeExecutionApproved: false;
  readonly evidenceReview: "not-performed";
}

export const M2A_CONSTRUCTION: M2aConstructionConstants;
export function createFixedConstructionPlan(): Readonly<
  Record<string, unknown>
>;
export function validateFixedConstructionPlan(
  value: unknown,
): Readonly<Record<string, unknown>>;
export function calculateTrackedInputAggregates(
  rows: unknown,
): Readonly<Record<string, unknown>>;
export function parseNpmArchive(
  archive: string | Uint8Array,
): readonly Readonly<Record<string, unknown>>[];
export function validateNpmAcquisition(
  receipt: string | Uint8Array,
  archive: string | Uint8Array,
  reviewedBinding: unknown,
): Readonly<Record<string, unknown>>;
export function validateConstructorToolchain(
  receipt: string | Uint8Array,
  reviewedBinding: unknown,
): Readonly<Record<string, unknown>>;
export function validateConstructionContextInputs(
  value: unknown,
): Readonly<Record<string, unknown>>;
export function validateConstructionManifestBytes(
  value: string | Uint8Array,
  bindings: unknown,
  correlation: unknown,
): Readonly<Record<string, unknown>>;
export function createDeterministicFixtureArchive(
  packageJson: string | Uint8Array,
): Buffer;
export function createSyntheticNpmArchiveForTest(entries: unknown): Buffer;

export interface FakeM2aProcessTrace {
  readonly events: readonly Readonly<Record<string, unknown>>[];
}

export interface M2aProcessSettlementTraceResult {
  readonly firstFailure: string | null;
  readonly firstExit: Readonly<{
    code: number | null;
    signal: string | null;
  }> | null;
  readonly firstClose: Readonly<{
    code: number | null;
    signal: string | null;
  }> | null;
  readonly timedOut: boolean;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
  readonly childClosed: boolean;
  readonly stdoutClosed: boolean;
  readonly stderrClosed: boolean;
  readonly descriptorsClosed: boolean;
  readonly known: boolean;
  readonly successful: boolean;
  readonly settled: boolean;
  readonly timersCleared: boolean;
  readonly timerClearCounts: Readonly<Record<string, number>>;
  readonly ignoredEvents: number;
}

export function createFakeM2aProcessTrace(
  events?: readonly Readonly<Record<string, unknown>>[],
): FakeM2aProcessTrace;
export function runM2aProcessSettlementTraceForTest(
  trace: FakeM2aProcessTrace,
): M2aProcessSettlementTraceResult;

export interface FakeM2aConstructionBackend {
  perform(step: string): Promise<unknown>;
}

export function createFakeM2aConstructionBackend(
  overrides?: Record<string, unknown>,
): FakeM2aConstructionBackend;
export function runM2aConstructionForTest(
  backend: FakeM2aConstructionBackend,
): Promise<Readonly<Record<string, unknown>>>;
export function runFixedM2aConstructionEntry(): Promise<
  Readonly<Record<string, unknown>>
>;
