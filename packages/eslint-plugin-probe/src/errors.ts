export const ADAPTER_ERROR_CODES = [
  "ESLINT_CONTEXT_NOT_INSTALLED",
  "ESLINT_CONTEXT_ALREADY_INSTALLED",
  "ESLINT_CONTEXT_INVALID",
  "ESLINT_CONTEXT_DISPOSED",
  "ESLINT_QUEUE_FAILED",
  "ESLINT_PLUGIN_LOAD_FAILED",
  "ESLINT_SCENARIO_MODE_UNSUPPORTED",
  "ESLINT_VERSION_MISMATCH",
  "ESLINT_MANIFEST_CONTRACT_INVALID",
  "ESLINT_SCENARIO_FAILED",
] as const;

export type AdapterErrorCode = (typeof ADAPTER_ERROR_CODES)[number];

export class AdapterError extends Error {
  readonly code: AdapterErrorCode;

  constructor(code: AdapterErrorCode) {
    super(code);
    this.name = "AdapterError";
    this.code = code;
  }
}

export function adapterErrorCode(error: unknown): AdapterErrorCode {
  if (error instanceof AdapterError) {
    return error.code;
  }
  return "ESLINT_SCENARIO_FAILED";
}
