export interface M2aInputConstants {
  readonly generation: "20260721-01";
  readonly npmVersion: "12.0.1";
  readonly acquisitionRoot: string;
  readonly acquisitionArchive: string;
  readonly acquisitionReceipt: string;
  readonly toolchainAttemptRoot: string;
  readonly toolchainRoot: string;
  readonly toolchainReceipt: string;
  readonly sourceAggregate: string;
  readonly constructionBaselineAggregate: string;
  readonly requestAbsoluteDeadlineMs: 30000;
  readonly requestDestroyGraceMs: 250;
  readonly requestCloseDeadlineMs: 1000;
  readonly toolchainAbsoluteDeadlineMs: 120000;
  readonly descriptorCloseDeadlineMs: 1000;
  readonly metadataMaximumBytes: 1048576;
  readonly fileMaximumBytes: 67108864;
  readonly familyMaximumBytes: 536870912;
  readonly inventoryMaximumBytes: 1073741824;
  readonly inventoryMaximumRows: 50000;
  readonly runtimeMaximumRows: 256;
  readonly receiptMaximumBytes: 4194304;
  readonly evidenceReview: "not-performed";
}

export const M2A_INPUTS: M2aInputConstants;
export function createFixedNpmRequestPlan(): readonly Readonly<
  Record<string, unknown>
>[];
export function validateFixedNpmRequestPlan(
  value: unknown,
): readonly Readonly<Record<string, unknown>>[];
export function validateNpmMetadataBytes(
  value: string | Uint8Array,
): Readonly<{ integrity: string }>;
export function validateNpmResponseForTest(
  planId: "metadata" | "tarball",
  response: unknown,
): Buffer;
export function createAcquisitionReceiptBytes(observation: unknown): Buffer;
export function validateAcquisitionReceiptBytes(
  value: string | Uint8Array,
): Readonly<Record<string, unknown>>;

export interface FakeM2aNpmInputBackend {
  perform(step: string): Promise<unknown>;
}

export function createFakeM2aNpmInputBackend(
  overrides?: Record<string, unknown>,
): FakeM2aNpmInputBackend;
export function runM2aNpmAcquisitionForTest(
  backend: FakeM2aNpmInputBackend,
): Promise<Readonly<Record<string, unknown>>>;

export function validateHeldGraphPair(
  first: unknown,
  second: unknown,
): readonly Readonly<Record<string, unknown>>[];
export function validateDestinationGraph(
  graph: unknown,
  inventory: unknown,
): readonly Readonly<Record<string, unknown>>[];
export function createToolchainAttemptBytes(state: unknown): Buffer;
export function validateToolchainAttemptBytes(
  value: string | Uint8Array,
): Readonly<Record<string, unknown>>;
export function createToolchainReceiptBytes(receipt: unknown): Buffer;
export function validateToolchainReceiptBytes(
  value: string | Uint8Array,
): Readonly<Record<string, unknown>>;

export interface FakeM2aToolchainInputBackend {
  createAttemptRoot(): unknown;
  perform(step: string): Promise<unknown>;
}

export function createFakeM2aToolchainInputBackend(
  overrides?: Record<string, unknown>,
): FakeM2aToolchainInputBackend;
export function classifyToolchainAttemptCommitForTest(
  event:
    | "known-no-create"
    | "process-loss-before-commit"
    | "existing-root"
    | "commit-returned"
    | "process-loss-after-commit"
    | "process-loss-before-checkpoint",
): Readonly<Record<string, unknown>>;
export function runM2aToolchainCaptureForTest(
  backend: FakeM2aToolchainInputBackend,
): Promise<Readonly<Record<string, unknown>>>;
export function runFixedNpmAcquisitionEntry(): Promise<
  Readonly<Record<string, unknown>>
>;
export function runFixedToolchainCaptureEntry(): Promise<
  Readonly<Record<string, unknown>>
>;
