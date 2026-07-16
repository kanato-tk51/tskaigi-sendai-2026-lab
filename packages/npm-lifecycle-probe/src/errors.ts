export const ADAPTER_ERROR_CODES = Object.freeze([
  "M2A_CONTEXT_INVALID",
  "M2A_VERSION_MISMATCH",
  "M2A_MANIFEST_INVALID",
  "M2A_LIFECYCLE_FAILED",
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
  return error instanceof AdapterError ? error.code : "M2A_LIFECYCLE_FAILED";
}
