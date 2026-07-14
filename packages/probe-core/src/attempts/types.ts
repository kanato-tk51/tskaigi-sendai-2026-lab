import type {
  NormalizedErrorCode,
  ProbeEvent,
  ProbeEventDetails,
  Sha256Digest,
} from "../types.js";

export interface AttemptExecutionResult {
  readonly outcome: ProbeEvent["outcome"];
  readonly normalizedErrorCode: NormalizedErrorCode | null;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly details: ProbeEventDetails;
}
