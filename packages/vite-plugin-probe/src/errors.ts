export const ADAPTER_ERROR_CODES = Object.freeze([
  "M2D_CONTEXT_INVALID",
  "M2D_VERSION_MISMATCH",
  "M2D_CONFIG_INVALID",
  "M2D_ROUTE_INVALID",
  "M2D_TRANSFORM_TARGET_INVALID",
  "M2D_TOOL_CHANGE_INVALID",
  "M2D_OUTPUT_INVALID",
  "M2D_SEGMENT_INVALID",
  "M2D_EVENT_COUNT_MISMATCH",
  "M2D_DATA_POLICY_VIOLATION",
  "M2D_TEMP_BOUNDARY_VIOLATION",
  "M2D_TOOL_TIMEOUT",
  "M2D_TOOL_OUTPUT_LIMIT",
  "M2D_TOOL_COMMAND_FAILED",
  "M2D_SIGNAL_FAILED",
  "M2D_CLOSE_DEADLINE",
  "M2D_CLOSE_DISPOSITION_MISMATCH",
  "M2D_PROCESS_RESIDUE",
  "M2D_ESBUILD_RESIDUE",
  "M2D_SETTLEMENT_UNKNOWN",
  "M2D_CLEANUP_FAILED",
  "M2D_SCENARIO_FAILED",
] as const);

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
  return error instanceof AdapterError ? error.code : "M2D_SCENARIO_FAILED";
}
