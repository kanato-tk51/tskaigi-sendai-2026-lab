import { describe, expect, it } from "vitest";

import {
  CAPABILITY_ATTEMPT_COUNT,
  ESLINT_VERSION,
  ROUTE_IDS,
} from "../src/constants.js";
import { runEslintScenario } from "../src/scenario.js";

describe("lint-only ESLint integration", () => {
  it("records the fixed configured route without changing the fixture", async () => {
    const result = await runEslintScenario("lint-only");
    expect(result.fixtureChanged).toBe(false);
    expect(result.fixtureMatchesExpected).toBe(true);
    expect(result.directWriteMarkerCreated).toBe(true);
    expect(result.routeCounts).toEqual({
      moduleEvaluation: 1,
      pluginInitialization: 1,
      ruleCreate: 1,
      visitorCallback: 1,
      fixerCallback: 1,
    });
    expect(result.capabilityAttemptCount).toBe(CAPABILITY_ATTEMPT_COUNT);
    expect(result.toolApiChangeCount).toBe(1);
    expect(result.events).toHaveLength(12);
    expect(result.events.map((event) => event.producerSequence)).toEqual(
      Array.from({ length: 12 }, (_, index) => index),
    );
    expect(
      result.events.every((event) => event.toolVersion === ESLINT_VERSION),
    ).toBe(true);

    const attempts = result.events.filter(
      (event) => event.eventKind === "capability-attempt",
    );
    expect(attempts.map((event) => event.attemptType)).toEqual([
      "environment-canary-read",
      "canary-file-read",
      "file-hash",
      "direct-filesystem-write",
      "loopback-connect",
      "child-node-process",
    ]);
    expect(attempts.every((event) => event.outcome === "success")).toBe(true);

    const toolChange = result.events.find(
      (event) => event.eventKind === "tool-api-change",
    );
    expect(toolChange).toMatchObject({
      outcome: "skipped",
      normalizedErrorCode: "NOT_APPLICABLE",
      changed: false,
      beforeHash: null,
      afterHash: null,
    });
    expect(result.events[0]).toMatchObject({
      eventKind: "route-invocation",
      routeInvocationId: ROUTE_IDS.moduleEvaluation,
    });
    expect(result.events[1]).toMatchObject({
      eventKind: "route-invocation",
      routeInvocationId: ROUTE_IDS.pluginInitialization,
    });
  });
});
