import { describe, expect, it } from "vitest";

import { readCoordinatorInputs } from "../src/coordinator-input.js";
import { AdapterError } from "../src/errors.js";
import { createFixedManifest } from "../src/manifest.js";
import { resolveFixedScenarioContext } from "../src/scenario-context.js";

describe("M2-D selected profile context", () => {
  it("preserves the existing local context", () => {
    const context = resolveFixedScenarioContext({
      variant: "observe",
      runId: "m2d-vite-00000000000000000000000000000000",
      requestedScenarioId: undefined,
    });
    expect(context).toEqual({
      scenarioId: "m2d-vite-plugin-local-contract",
      runId: "m2d-vite-00000000000000000000000000000000",
      profileId: null,
      selectedProfile: false,
    });
  });

  it.each([
    ["vite-observe-p", "p2-vite-observe-p-20260723-01", "permissive"],
    ["vite-observe-c", "p2-vite-observe-c-20260723-01", "constrained"],
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
      expect(createFixedManifest(runId).scenarioId).toBe(scenarioId);
    },
  );

  it.each([
    {
      variant: "api",
      runId: "p2-vite-observe-p-20260723-01",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260723-01",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260719-01",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260719-01",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260719-02",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260719-02",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260719-03",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260719-03",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260719-11",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260719-11",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260720-01",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260720-01",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-p-20260720-02",
      requestedScenarioId: "vite-observe-p",
    },
    {
      variant: "observe",
      runId: "p2-vite-observe-c-20260720-02",
      requestedScenarioId: "vite-observe-c",
    },
    {
      variant: "observe",
      runId: "m2d-vite-00000000000000000000000000000000",
      requestedScenarioId: "unknown",
    },
  ] as const)("rejects mismatched or unknown context %#", (input) => {
    expect(() => resolveFixedScenarioContext(input)).toThrowError(AdapterError);
  });

  it("derives only the fixed selected event and tool roots", () => {
    const variables = [
      "PROBE_CANARY_M2D_RUN_ID",
      "PROBE_CANARY_M2D_RUN_ROOT",
      "PROBE_CANARY_M2D_LOOPBACK_PORT",
      "PROBE_CANARY_M2D_VARIANT",
      "PROBE_CANARY_M2D_SCENARIO_ID",
    ] as const;
    const previous = new Map(
      variables.map((variable) => [variable, process.env[variable]] as const),
    );
    try {
      process.env.PROBE_CANARY_M2D_RUN_ID = "p2-vite-observe-c-20260723-01";
      process.env.PROBE_CANARY_M2D_RUN_ROOT = "/tmp/p2-result";
      process.env.PROBE_CANARY_M2D_LOOPBACK_PORT = "4321";
      process.env.PROBE_CANARY_M2D_VARIANT = "observe";
      process.env.PROBE_CANARY_M2D_SCENARIO_ID = "vite-observe-c";
      expect(readCoordinatorInputs()).toEqual({
        runId: "p2-vite-observe-c-20260723-01",
        scenarioId: "vite-observe-c",
        profileId: "constrained",
        runRoot: "/tmp/p2-result",
        toolRoot: "/tmp/p2-tool",
        loopbackPort: 4321,
        variant: "observe",
        toolTempRoot: "/tmp/p2-tool/tool-temp",
        cacheDir: "/tmp/p2-tool/cache/vite",
        outDir: "/tmp/p2-tool/out",
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
