import { NORMALIZED_ERROR_CODES } from "./constants.js";
import type { NormalizedErrorCode } from "./types.js";
import { types } from "node:util";

const normalizedCodes = new Set<string>(NORMALIZED_ERROR_CODES);

export type ProbeOperation =
  "read" | "hash" | "write" | "network" | "child" | "sink" | "internal";

export class ProbeError extends Error {
  readonly code: NormalizedErrorCode;

  constructor(code: NormalizedErrorCode) {
    super(code);
    this.name = "ProbeError";
    this.code = code;
  }
}

function nodeErrorCode(error: unknown): string | null {
  try {
    if (typeof error !== "object" || error === null || types.isProxy(error)) {
      return null;
    }
    const descriptor = Object.getOwnPropertyDescriptor(error, "code");
    return descriptor !== undefined &&
      "value" in descriptor &&
      typeof descriptor.value === "string"
      ? descriptor.value
      : null;
  } catch {
    return null;
  }
}

export function normalizeProbeError(
  error: unknown,
  operation: ProbeOperation = "internal",
): NormalizedErrorCode {
  try {
    if (error instanceof ProbeError) {
      return error.code;
    }
  } catch {
    return "INTERNAL_ERROR";
  }

  const code = nodeErrorCode(error);
  if (code === "ENOENT") {
    return "FILE_NOT_FOUND";
  }
  if (code === "EEXIST") {
    return "FILE_ALREADY_EXISTS";
  }
  if (code === "ELOOP") {
    return "SYMLINK_ESCAPE";
  }
  if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
    switch (operation) {
      case "read":
        return "READ_DENIED";
      case "hash":
        return "HASH_DENIED";
      case "write":
        return "WRITE_DENIED";
      case "sink":
        return "EVIDENCE_WRITE_FAILURE";
      default:
        return "INTERNAL_ERROR";
    }
  }
  if (code === "ETIMEDOUT" && operation === "network") {
    return "NETWORK_TIMEOUT";
  }
  return normalizedCodes.has(code ?? "")
    ? (code as NormalizedErrorCode)
    : "INTERNAL_ERROR";
}
