export const ADAPTER_ERROR_CODES = [
  "M2C_CONTEXT_MISSING",
  "M2C_CONTEXT_INVALID",
  "M2C_BINDING_INVALID",
  "M2C_VERSION_MISMATCH",
  "M2C_CONFIG_MISMATCH",
  "M2C_TOOL_COMMAND_FAILED",
  "M2C_TOOL_TIMEOUT",
  "M2C_TOOL_OUTPUT_LIMIT",
  "M2C_GRACEFUL_TERMINATION_FAILED",
  "M2C_FORCE_TERMINATION_FAILED",
  "M2C_CLOSE_DEADLINE_EXCEEDED",
  "M2C_CLOSE_DISPOSITION_MISMATCH",
  "M2C_PROCESS_RESIDUE",
  "M2C_SETTLEMENT_UNKNOWN",
  "M2C_TEMP_BOUNDARY_VIOLATION",
  "M2C_TEMP_RESIDUE",
  "M2C_REPORT_INVALID",
  "M2C_SEGMENT_INVALID",
  "M2C_EVENT_COUNT_MISMATCH",
  "M2C_PROCESS_MISMATCH",
  "M2C_DATA_POLICY_VIOLATION",
  "M2C_FIXTURE_CHANGED",
  "M2C_CLEANUP_FAILED",
  "M2C_SCENARIO_FAILED",
] as const;

export type AdapterErrorCode = (typeof ADAPTER_ERROR_CODES)[number];

export class AdapterError extends Error {
  readonly code: AdapterErrorCode;
  readonly secondaryCodes: readonly AdapterErrorCode[];

  constructor(
    code: AdapterErrorCode,
    secondaryCodes: readonly AdapterErrorCode[] = [],
  ) {
    super(code);
    this.name = "AdapterError";
    this.code = code;
    this.secondaryCodes = Object.freeze([...secondaryCodes]);
  }
}

export function adapterErrorCode(error: unknown): AdapterErrorCode {
  if (error instanceof AdapterError) {
    return error.code;
  }
  return "M2C_SCENARIO_FAILED";
}

export function preservePrimaryFailure(
  primary: unknown,
  cleanup: unknown,
): AdapterError {
  const primaryCode = adapterErrorCode(primary);
  const cleanupCode = adapterErrorCode(cleanup);
  const existingSecondary =
    primary instanceof AdapterError ? primary.secondaryCodes : [];
  return new AdapterError(primaryCode, [...existingSecondary, cleanupCode]);
}
