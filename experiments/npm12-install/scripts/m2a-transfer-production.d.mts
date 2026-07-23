export interface M2aProductionConstants {
  readonly generation: "20260721-01";
  readonly expectedRevision: "m2a-transfer-expected-20260721-01";
  readonly runId: string;
  readonly scenarioId: "m2a-npm-lifecycle";
  readonly baseReference: string;
  readonly baseRepositoryDigest: string;
  readonly constructionRoot: string;
  readonly buildRoot: string;
  readonly runtimeRoot: string;
  readonly buildCommands: readonly Readonly<Record<string, unknown>>[];
  readonly absenceSteps: readonly string[];
  readonly reviewedConstructionManifestSha256: null;
  readonly reviewedContextAggregate: null;
  readonly reviewedNpmAcquisitionSha256: null;
  readonly reviewedConstructorToolchainSha256: null;
  readonly reviewedLocalImageId: null;
  readonly buildExecutionApproved: false;
  readonly runtimeExecutionApproved: false;
  readonly evidenceReview: "not-performed";
}

export const M2A_PRODUCTION: M2aProductionConstants;
export function createFixedImageBuildPlan(): Readonly<Record<string, unknown>>;
export function validateFixedImageBuildPlan(
  value: unknown,
): Readonly<Record<string, unknown>>;
export function validateImageBuildObservation(
  value: unknown,
): Readonly<Record<string, unknown>>;
export function createImageBindingBytesForTest(
  observation: unknown,
  construction: unknown,
): Buffer;
export function validateImageBindingBytes(
  value: string | Uint8Array,
  reviewedConstruction: unknown,
  reviewedLocalImageId: string,
): Readonly<Record<string, unknown>>;

export interface FakeM2aHeldDirectoryIdentity {
  readonly type: "directory";
  readonly dev: bigint;
  readonly ino: bigint;
  readonly mode: bigint;
  readonly uid: bigint;
  readonly gid: bigint;
  readonly nlink: bigint;
  readonly size: bigint;
  readonly mtimeNs: bigint;
}

export interface FakeM2aHeldChildIdentity {
  readonly name: string;
  readonly type: "directory" | "file";
  readonly dev: bigint;
  readonly ino: bigint;
  readonly mode: bigint;
  readonly uid: bigint;
  readonly gid: bigint;
  readonly nlink: bigint;
  readonly size: bigint;
  readonly mtimeNs: bigint;
}

export interface FakeM2aHeldDirectorySnapshot {
  readonly identity: FakeM2aHeldDirectoryIdentity;
  readonly entries: readonly Readonly<{
    name: string;
    type: "directory" | "file";
  }>[];
  readonly children: readonly FakeM2aHeldChildIdentity[];
}

export type FakeM2aHeldDirectoryOperation = Readonly<{
  kind:
    | "create-attempt-next"
    | "rename-attempt-next"
    | "create-completion-copy"
    | "create-segment-copy"
    | "create-probe-output"
    | "create-nested-marker";
}>;

export interface FakeM2aHeldDirectoryStep {
  readonly before: FakeM2aHeldDirectorySnapshot;
  readonly after: FakeM2aHeldDirectorySnapshot;
  readonly expectedBefore: readonly Readonly<Record<string, unknown>>[];
  readonly expectedAfter: readonly Readonly<Record<string, unknown>>[];
  readonly linkDelta: number;
  readonly operation: FakeM2aHeldDirectoryOperation;
  readonly correlated?: Omit<FakeM2aHeldDirectoryStep, "correlated">;
}

export interface FakeM2aHeldDirectoryTrace {
  readonly steps: readonly FakeM2aHeldDirectoryStep[];
  snapshotActions(): string[];
}

export function createFakeM2aHeldDirectoryTrace(
  steps?: readonly FakeM2aHeldDirectoryStep[],
): FakeM2aHeldDirectoryTrace;
export function runM2aHeldDirectoryTraceForTest(
  trace: FakeM2aHeldDirectoryTrace,
): Readonly<{ status: "complete"; actions: readonly string[] }>;

export interface FakeM2aImageBuildBackend {
  perform(step: string): Promise<unknown>;
  publishBinding(bytes: Uint8Array): Promise<unknown>;
  snapshotActions(): string[];
}

export function createFakeM2aImageBuildBackend(
  overrides?: Record<string, unknown>,
): FakeM2aImageBuildBackend;
export function runM2aImageBuildForTest(
  backend: FakeM2aImageBuildBackend,
  construction: unknown,
): Promise<Readonly<Record<string, unknown>>>;
export function createFixedProductionExecutionPlan(
  imageId: string,
): Readonly<Record<string, unknown>>;
export function validateFixedProductionExecutionPlan(
  value: unknown,
  imageId: string,
): Readonly<Record<string, unknown>>;
export function createPessimisticAttemptCheckpointBytes(
  imageId: string,
  step: string,
): Buffer;

export interface FakeM2aProductionBackend {
  publishCheckpoint(step: string, bytes: Uint8Array): Promise<unknown>;
  runChild(
    row: Readonly<Record<string, unknown>>,
    imageId: string,
  ): Promise<unknown>;
  settleValidation(step: string, valueSha256: string): Promise<unknown>;
  prepareMarkerParent(): Promise<unknown>;
  publishFinal(bytes: Uint8Array): Promise<unknown>;
  snapshotActions(): string[];
}

export function createFakeM2aProductionBackend(
  overrides?: Record<string, unknown>,
): FakeM2aProductionBackend;
export function runM2aProductionTransactionForTest(
  backend: FakeM2aProductionBackend,
  imageId: string,
): Promise<Readonly<Record<string, unknown>>>;
export function runFixedM2aImageBuildEntry(): Promise<
  Readonly<Record<string, unknown>>
>;
export function runFixedM2aExecutionEntry(): Promise<
  Readonly<Record<string, unknown>>
>;
