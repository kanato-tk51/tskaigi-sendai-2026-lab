import { describe, expect, it } from "vitest";

import type {
  NormalizedErrorCode,
  Outcome,
} from "../../../packages/probe-core/src/types.js";
import { EXPECTED_EVENT_ORDER } from "../../../packages/codegen-probe/src/constants.js";

import {
  projectCodegenProfileEvents,
  projectCodegenProfileSegment,
  type CodegenScenarioId,
  type SelectedEventInput,
} from "../src/codegen-projection.js";

function outcomeFor(
  profileId: "permissive" | "constrained",
  orderValue: string,
): readonly [Outcome, NormalizedErrorCode | null] {
  if (profileId === "permissive") {
    return orderValue.startsWith("tool-api-change:")
      ? ["skipped", "NOT_APPLICABLE"]
      : ["success", null];
  }
  const failures: Readonly<
    Record<string, readonly [Outcome, NormalizedErrorCode | null]>
  > = {
    "capability-attempt:codegen-attempt-environment": [
      "failure",
      "ENVIRONMENT_VARIABLE_ABSENT",
    ],
    "capability-attempt:codegen-attempt-file-read": [
      "failure",
      "FILE_NOT_FOUND",
    ],
    "capability-attempt:codegen-attempt-file-write": [
      "failure",
      "WRITE_DENIED",
    ],
    "capability-attempt:codegen-attempt-loopback": [
      "failure",
      "NETWORK_FAILURE",
    ],
    "capability-attempt:codegen-attempt-child": [
      "failure",
      "CHILD_PROCESS_FAILURE",
    ],
    "tool-api-change:codegen-generation-api-change": [
      "skipped",
      "NOT_APPLICABLE",
    ],
  };
  return failures[orderValue] ?? ["success", null];
}

function eventsFor(
  scenarioId: CodegenScenarioId,
  profileId: "permissive" | "constrained",
  runId: string,
): readonly SelectedEventInput[] {
  return EXPECTED_EVENT_ORDER.map((orderValue, producerSequence) => {
    const [eventKind, id] = orderValue.split(":") as [
      SelectedEventInput["eventKind"],
      string,
    ];
    const [outcome, normalizedErrorCode] = outcomeFor(profileId, orderValue);
    return Object.freeze({
      eventKind,
      runId,
      scenarioId,
      producerSequence,
      outcome,
      normalizedErrorCode,
      ...(eventKind === "route-invocation"
        ? { routeInvocationId: id }
        : eventKind === "capability-attempt"
          ? { attemptId: id }
          : { toolApiChangeId: id }),
    });
  });
}

describe("P2 codegen profile projection", () => {
  it.each([
    ["codegen-observe-p", "permissive", "p2-codegen-observe-p-20260719-01"],
    ["codegen-observe-c", "constrained", "p2-codegen-observe-c-20260719-01"],
  ] as const)(
    "accepts the complete sanitized %s stream",
    (scenarioId, profileId, runId) => {
      const result = projectCodegenProfileEvents({
        scenarioId,
        profileId,
        runId,
        events: eventsFor(scenarioId, profileId, runId),
      });
      expect(result.validity).toBe("matches-expected");
      expect(result.counts).toEqual({
        route: 5,
        capability: 6,
        toolApiChange: 1,
        total: 12,
      });
      expect(result.attempts).toHaveLength(6);
      expect(result.issues).toEqual([]);
    },
  );

  it("preserves an unexpected capability result as a mismatch", () => {
    const scenarioId = "codegen-observe-c";
    const runId = "p2-codegen-observe-c-20260719-01";
    const events = eventsFor(scenarioId, "constrained", runId).map((event) =>
      event.attemptId === "codegen-attempt-child"
        ? { ...event, outcome: "success" as const, normalizedErrorCode: null }
        : event,
    );
    const result = projectCodegenProfileEvents({
      scenarioId,
      profileId: "constrained",
      runId,
      events,
    });
    expect(result.validity).toBe("mismatch");
    expect(result.issues).toEqual(["CAPABILITY_OUTCOME_MISMATCH"]);
    expect(result.attempts.at(-1)).toMatchObject({
      attemptId: "codegen-attempt-child",
      outcome: "success",
      normalizedErrorCode: null,
    });
  });

  it("marks missing or reordered evidence inconclusive", () => {
    const scenarioId = "codegen-observe-p";
    const runId = "p2-codegen-observe-p-20260719-01";
    const events = eventsFor(scenarioId, "permissive", runId).slice(1);
    const result = projectCodegenProfileEvents({
      scenarioId,
      profileId: "permissive",
      runId,
      events,
    });
    expect(result.validity).toBe("inconclusive");
    expect(result.issues).toEqual([
      "IDENTITY_OR_ORDER_MISMATCH",
      "COUNT_MISMATCH",
    ]);
  });

  it("rejects a relabeled scenario/profile/run tuple", () => {
    const scenarioId = "codegen-observe-p";
    const runId = "p2-codegen-observe-p-20260719-01";
    const result = projectCodegenProfileEvents({
      scenarioId,
      profileId: "constrained",
      runId,
      events: eventsFor(scenarioId, "constrained", runId),
    });
    expect(result.validity).toBe("inconclusive");
    expect(result.runId).toBeNull();
    expect(result.issues).toContain("IDENTITY_OR_ORDER_MISMATCH");
  });

  it("does not carry unknown raw fields into the projection", () => {
    const scenarioId = "codegen-observe-p";
    const runId = "p2-codegen-observe-p-20260719-01";
    const events = eventsFor(scenarioId, "permissive", runId).map((event) => ({
      ...event,
      ...(event.attemptId === "codegen-attempt-environment"
        ? { attemptId: "raw-attacker-id" }
        : {}),
      rawSecret: "must-not-appear",
    }));
    const result = projectCodegenProfileEvents({
      scenarioId,
      profileId: "permissive",
      runId,
      events,
    });
    expect(JSON.stringify(result)).not.toContain("must-not-appear");
    expect(JSON.stringify(result)).not.toContain("raw-attacker-id");
    expect(result.attempts[0]?.attemptId).toBe("INVALID_ATTEMPT");
  });

  it("parses a bounded JSONL segment into the same small projection", () => {
    const scenarioId = "codegen-observe-c";
    const runId = "p2-codegen-observe-c-20260719-01";
    const rawSegment = `${eventsFor(scenarioId, "constrained", runId)
      .map((event) => JSON.stringify({ ...event, rawSecret: "discard-me" }))
      .join("\n")}\n`;
    const result = projectCodegenProfileSegment({
      scenarioId,
      profileId: "constrained",
      runId,
      rawSegment,
    });
    expect(result.validity).toBe("matches-expected");
    expect(result.counts.total).toBe(12);
    expect(JSON.stringify(result)).not.toContain("discard-me");
  });

  it("makes malformed or oversized raw segments inconclusive", () => {
    for (const rawSegment of [
      "not-json\n",
      `${"x".repeat(65_537)}\n`,
      JSON.stringify({ eventKind: "capability-attempt" }),
    ]) {
      const result = projectCodegenProfileSegment({
        scenarioId: "codegen-observe-p",
        profileId: "permissive",
        runId: "p2-codegen-observe-p-20260719-01",
        rawSegment,
      });
      expect(result.validity).toBe("inconclusive");
      expect(result.runId).toBe("p2-codegen-observe-p-20260719-01");
      expect(result.counts.total).toBe(0);
    }
  });
});
