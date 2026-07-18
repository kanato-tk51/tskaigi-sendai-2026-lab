import { describe, expect, it } from "vitest";

import { ProfileControlError } from "../src/errors.js";
import {
  ORCHESTRATOR_OPERATIONS,
  parseOrchestratorArguments,
  runApprovedOrchestrator,
} from "../src/orchestrator.js";

describe("fixed host orchestrator gate", () => {
  it("accepts only the five fixed operation names", () => {
    for (const operation of ORCHESTRATOR_OPERATIONS) {
      expect(parseOrchestratorArguments([operation])).toBe(operation);
    }
    for (const input of [
      [],
      ["run-controls", "--mount", "/host"],
      ["docker"],
      ["build", "image"],
    ]) {
      expect(() => parseOrchestratorArguments(input)).toThrow(
        ProfileControlError,
      );
    }
  });

  it("fails closed before any Docker execution is approved", async () => {
    await expect(runApprovedOrchestrator(["doctor"])).rejects.toMatchObject({
      code: "M4_EXECUTION_NOT_APPROVED",
    });
  });
});
