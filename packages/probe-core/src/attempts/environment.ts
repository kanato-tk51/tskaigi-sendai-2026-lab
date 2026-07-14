import type { EnvironmentTarget } from "../types.js";
import type { AttemptExecutionResult } from "./types.js";

export function executeEnvironmentAttempt(
  target: EnvironmentTarget,
): AttemptExecutionResult {
  const value = process.env[target.variableName];
  if (value === undefined) {
    return {
      outcome: "failure",
      normalizedErrorCode: "ENVIRONMENT_VARIABLE_ABSENT",
      beforeHash: null,
      afterHash: null,
      details: { kind: "environment", present: false, byteLength: null },
    };
  }
  return {
    outcome: "success",
    normalizedErrorCode: null,
    beforeHash: null,
    afterHash: null,
    details: {
      kind: "environment",
      present: true,
      byteLength: Buffer.byteLength(value, "utf8"),
    },
  };
}
