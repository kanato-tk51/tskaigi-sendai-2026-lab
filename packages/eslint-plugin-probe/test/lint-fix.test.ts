import { describe, expect, it } from "vitest";

import { CAPABILITY_ATTEMPT_COUNT } from "../src/constants.js";
import { runEslintScenario } from "../src/scenario.js";

describe("lint-with-fix ESLint integration", () => {
  it("applies the official source fix and retains actual multi-pass counts", async () => {
    const result = await runEslintScenario("fix");
    expect(result.fixtureChanged).toBe(true);
    expect(result.fixtureMatchesExpected).toBe(true);
    expect(result.directWriteMarkerCreated).toBe(true);
    expect(result.routeCounts).toEqual({
      moduleEvaluation: 1,
      pluginInitialization: 1,
      ruleCreate: 2,
      visitorCallback: 2,
      fixerCallback: 1,
    });
    expect(result.capabilityAttemptCount).toBe(CAPABILITY_ATTEMPT_COUNT);
    expect(result.toolApiChangeCount).toBe(1);
    expect(result.events).toHaveLength(14);
    expect(result.events.map((event) => event.producerSequence)).toEqual(
      Array.from({ length: 14 }, (_, index) => index),
    );

    const toolChange = result.events.find(
      (event) => event.eventKind === "tool-api-change",
    );
    expect(toolChange).toMatchObject({
      outcome: "success",
      changed: true,
      byteSizeBefore: 19,
      byteSizeAfter: 19,
      changeKind: "source-fix",
      targetClassification: "source",
    });
    if (toolChange?.eventKind !== "tool-api-change") {
      throw new Error("missing fixed tool change");
    }
    expect(toolChange.beforeHash).not.toBe(toolChange.afterHash);

    const directWrite = result.events.find(
      (event) =>
        event.eventKind === "capability-attempt" &&
        event.attemptType === "direct-filesystem-write",
    );
    expect(directWrite).toMatchObject({
      eventKind: "capability-attempt",
      outcome: "success",
      beforeHash: null,
    });
    expect(directWrite?.eventKind).not.toBe(toolChange.eventKind);
  });
});
