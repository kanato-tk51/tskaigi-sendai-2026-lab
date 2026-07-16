export const ADAPTER_ERROR_CODES = Object.freeze([
  "M2E_CONTEXT_INVALID",
  "M2E_ARGUMENTS_INVALID",
  "M2E_VERSION_MISMATCH",
  "M2E_MANIFEST_INVALID",
  "M2E_SEGMENT_INVALID",
  "M2E_DATA_POLICY_VIOLATION",
  "M2E_OUTPUT_INVALID",
  "M2E_CLI_FAILED",
  "M2E_CLI_TIMEOUT",
  "M2E_CLEANUP_FAILED",
] as const);

export type AdapterErrorCode = (typeof ADAPTER_ERROR_CODES)[number];

export class AdapterError extends Error {
  readonly code: AdapterErrorCode;

  constructor(code: AdapterErrorCode) {
    super(code);
    this.name = "AdapterError";
    this.code = code;
  }
}

export function errorCode(error: unknown): AdapterErrorCode {
  return error instanceof AdapterError ? error.code : "M2E_CLI_FAILED";
}
