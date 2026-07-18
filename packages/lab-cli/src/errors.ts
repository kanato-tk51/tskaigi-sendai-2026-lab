import type { LabErrorCode } from "./constants.js";

export class LabError extends Error {
  readonly code: LabErrorCode;

  constructor(code: LabErrorCode) {
    super(code);
    this.name = "LabError";
    this.code = code;
  }
}

export function normalizeLabError(error: unknown): LabErrorCode {
  return error instanceof LabError ? error.code : "INVALID_COLLECTION_INPUT";
}
