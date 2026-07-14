import { describe, expect, it } from "vitest";

import {
  ENVIRONMENT_VARIABLE,
  FIXTURE_FIXED_SOURCE,
  FIXTURE_INITIAL_SOURCE,
} from "../src/constants.js";
import {
  assertEslintVersion,
  parseScenarioMode,
  runEslintScenario,
  runEslintScenarioWithUnavailableLoopbackForTest,
} from "../src/scenario.js";
import {
  createScenarioManifest,
  validateEslintManifestContract,
} from "../src/manifest.js";

function deterministicProjection(
  result: Awaited<ReturnType<typeof runEslintScenario>>,
) {
  return {
    eventOrder: result.events.map(
      (event) => `${event.eventKind}:${event.phase}`,
    ),
    routeCounts: result.routeCounts,
    attempts: result.events
      .filter((event) => event.eventKind === "capability-attempt")
      .map((event) => event.attemptType),
    toolChange: result.events
      .filter((event) => event.eventKind === "tool-api-change")
      .map((event) => ({
        outcome: event.outcome,
        changed: event.changed,
        changeKind: event.changeKind,
        byteSizeBefore: event.byteSizeBefore,
        byteSizeAfter: event.byteSizeAfter,
      })),
  };
}

describe("M2-B event contract", () => {
  it.each(["lint-only", "fix"] as const)(
    "is deterministic across clean %s runs",
    async (mode) => {
      const first = await runEslintScenario(mode);
      const second = await runEslintScenario(mode);
      expect(deterministicProjection(second)).toEqual(
        deterministicProjection(first),
      );
      expect(second.runId).not.toBe(first.runId);
    },
  );

  it("keeps raw canary, path, source, diff, message, and stack data out of JSONL", async () => {
    const result = await runEslintScenario("fix");
    expect(result.rawSegment).not.toContain(ENVIRONMENT_VARIABLE);
    expect(result.rawSegment).not.toContain(FIXTURE_INITIAL_SOURCE);
    expect(result.rawSegment).not.toContain(FIXTURE_FIXED_SOURCE);
    expect(result.rawSegment).not.toContain("/tmp/");
    expect(result.rawSegment).not.toContain('"diff"');
    expect(result.rawSegment).not.toContain('"stack"');
    expect(result.rawSegment).not.toContain(
      "The fixed fixture answer must use its intended value.",
    );

    const canaryRead = result.events.find(
      (event) =>
        event.eventKind === "capability-attempt" &&
        event.attemptType === "canary-file-read",
    );
    expect(canaryRead).toMatchObject({ beforeHash: null, afterHash: null });
  });

  it("records a loopback failure as an attempted capability outcome", async () => {
    const result =
      await runEslintScenarioWithUnavailableLoopbackForTest("lint-only");
    const loopback = result.events.find(
      (event) =>
        event.eventKind === "capability-attempt" &&
        event.attemptType === "loopback-connect",
    );
    expect(loopback).toMatchObject({
      outcome: "failure",
      normalizedErrorCode: "NETWORK_FAILURE",
    });
  });

  it("rejects unsupported mode, version mismatch, and missing adapter definitions", () => {
    expect(() => parseScenarioMode("arbitrary")).toThrowError(
      expect.objectContaining({ code: "ESLINT_SCENARIO_MODE_UNSUPPORTED" }),
    );
    expect(() => assertEslintVersion("9.39.4")).toThrowError(
      expect.objectContaining({ code: "ESLINT_VERSION_MISMATCH" }),
    );
    const manifest = createScenarioManifest("lint-only", "missing-route-run");
    expect(() =>
      validateEslintManifestContract({
        ...manifest,
        routeInvocations: manifest.routeInvocations.slice(1),
      }),
    ).toThrowError(
      expect.objectContaining({ code: "ESLINT_MANIFEST_CONTRACT_INVALID" }),
    );
  });
});
