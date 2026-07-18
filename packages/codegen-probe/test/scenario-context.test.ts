import { describe, expect, it } from "vitest";

import { AdapterError } from "../src/errors.js";
import { createFixedManifest } from "../src/manifest.js";
import { resolveFixedScenarioContext } from "../src/scenario-context.js";

describe("M2-E selected profile context", () => {
  it("preserves the existing local context", () => {
    const context = resolveFixedScenarioContext({
      variant: "observe",
      runId: "m2e-codegen-observe-00000000000000000000000000000000",
      requestedScenarioId: undefined,
    });
    expect(context).toEqual({
      scenarioId: "m2e-codegen-observe",
      runId: "m2e-codegen-observe-00000000000000000000000000000000",
      profileId: null,
      selectedProfile: false,
    });
  });

  it.each([
    ["codegen-observe-p", "p2-codegen-observe-p-20260719-01", "permissive"],
    ["codegen-observe-c", "p2-codegen-observe-c-20260719-01", "constrained"],
  ] as const)(
    "binds exact selected tuple %s",
    (scenarioId, runId, profileId) => {
      const context = resolveFixedScenarioContext({
        variant: "observe",
        runId,
        requestedScenarioId: scenarioId,
      });
      expect(context).toEqual({
        scenarioId,
        runId,
        profileId,
        selectedProfile: true,
      });
      expect(createFixedManifest("observe", runId, scenarioId).scenarioId).toBe(
        scenarioId,
      );
    },
  );

  it.each([
    {
      variant: "api",
      runId: "p2-codegen-observe-p-20260719-01",
      requestedScenarioId: "codegen-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-codegen-observe-c-20260719-01",
      requestedScenarioId: "codegen-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-codegen-observe-p-20260719-02",
      requestedScenarioId: "codegen-observe-p",
    },
    {
      variant: "observe",
      runId: "m2e-codegen-observe-00000000000000000000000000000000",
      requestedScenarioId: "unknown",
    },
  ] as const)("rejects mismatched or unknown context %#", (input) => {
    expect(() => resolveFixedScenarioContext(input)).toThrowError(AdapterError);
  });
});
