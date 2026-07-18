import { describe, expect, it } from "vitest";

import { AdapterError } from "../src/errors.js";
import { createCliRuntime } from "../src/cli-runtime.js";
import {
  LOOPBACK_PORT_VARIABLE,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  SCENARIO_ID_VARIABLE,
  VARIANT_VARIABLE,
} from "../src/constants.js";
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

  it("keeps selected execution fail closed until separated bindings exist", async () => {
    const variables = [
      RUN_ID_VARIABLE,
      RUN_ROOT_VARIABLE,
      LOOPBACK_PORT_VARIABLE,
      VARIANT_VARIABLE,
      SCENARIO_ID_VARIABLE,
    ] as const;
    const previous = new Map(
      variables.map((variable) => [variable, process.env[variable]] as const),
    );
    try {
      process.env[RUN_ID_VARIABLE] = "p2-codegen-observe-p-20260719-01";
      process.env[RUN_ROOT_VARIABLE] = "/tmp/p2-result";
      process.env[LOOPBACK_PORT_VARIABLE] = "1";
      process.env[VARIANT_VARIABLE] = "observe";
      process.env[SCENARIO_ID_VARIABLE] = "codegen-observe-p";
      await expect(createCliRuntime()).rejects.toMatchObject({
        code: "M2E_CONTEXT_INVALID",
      });
    } finally {
      for (const variable of variables) {
        const value = previous.get(variable);
        if (value === undefined) {
          delete process.env[variable];
        } else {
          process.env[variable] = value;
        }
      }
    }
  });
});
