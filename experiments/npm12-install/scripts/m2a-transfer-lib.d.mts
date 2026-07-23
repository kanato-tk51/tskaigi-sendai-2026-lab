export interface M2aTransferConstants {
  readonly schemaVersion: "m2a-transfer-manifest/v1";
  readonly generation: "20260721-01";
  readonly expectedRevision: "m2a-transfer-expected-20260721-01";
  readonly scenarioId: "m2a-npm-lifecycle";
  readonly runId: string;
  readonly resultRoot: string;
  readonly containerRunRoot: string;
  readonly initializerContainer: string;
  readonly measurementContainer: string;
  readonly transferVolume: string;
  readonly candidateImageTag: string;
  readonly sourceAggregate: string;
  readonly nodeVersion: "v24.18.0";
  readonly npmVersion: "12.0.1";
  readonly loopbackPort: 37001;
  readonly completionPath: string;
  readonly segmentPath: string;
  readonly markerPath: string;
  readonly runtimeExecutionApproved: false;
  readonly evidenceReview: "not-performed";
}

export const M2A_TRANSFER: M2aTransferConstants;
export function sha256(value: string | Uint8Array): string;
export function createFixedDockerPlan(
  imageId: string,
): Readonly<Record<string, unknown>>;
export function validateFixedDockerPlan(
  value: unknown,
  imageId: string,
): Readonly<Record<string, unknown>>;
export function validateImageBinding(
  value: unknown,
  reviewedImageId: string,
): Readonly<Record<string, unknown>>;
export function validateInspectionProjection(
  value: unknown,
  role: "initializer" | "measurement",
  imageId: string,
): Readonly<Record<string, unknown>>;
export function validateCompletionBytes(value: string | Uint8Array): Readonly<{
  bytes: Buffer;
  completion: Record<string, unknown>;
}>;
export function validateTransferredFile(
  value: unknown,
  expected: unknown,
  hostOwner: { uid: number; gid: number },
): Readonly<Record<string, unknown>>;
export function validateProducerSegmentBytes(
  value: string | Uint8Array,
): Readonly<{
  bytes: Buffer;
  sha256: string;
  events: readonly Record<string, unknown>[];
}>;
export function validateMarkerBytes(
  value: string | Uint8Array,
  events: readonly Record<string, unknown>[],
): Readonly<{ bytes: Buffer; marker: Record<string, unknown> }>;
export function validateCompletionArtifacts(
  completion: string | Uint8Array | Record<string, unknown>,
  segment: string | Uint8Array | null,
  marker: string | Uint8Array | null,
): Readonly<Record<string, unknown>>;
export function validateCandidateTransfer(
  attempt: string | Uint8Array,
  reviewedImageId: string,
  completion: string | Uint8Array,
  segment: string | Uint8Array | null,
  marker: string | Uint8Array | null,
): Readonly<{
  attempt: Readonly<Record<string, unknown>>;
  completion: Readonly<Record<string, unknown>>;
  segment: Readonly<Record<string, unknown>> | null;
  marker: Readonly<Record<string, unknown>> | null;
}>;
export function validateAttemptBytes(
  value: string | Uint8Array,
  reviewedImageId: string,
): Readonly<{ bytes: Buffer; attempt: Record<string, unknown> }>;

export interface FakeM2aTransferBackend {
  perform(step: string): Promise<unknown>;
}

export function createFakeM2aTransferBackend(
  overrides?: Record<string, unknown>,
): FakeM2aTransferBackend;
export function runM2aTransferStateMachineForTest(
  backend: FakeM2aTransferBackend,
): Promise<Readonly<Record<string, unknown>>>;
