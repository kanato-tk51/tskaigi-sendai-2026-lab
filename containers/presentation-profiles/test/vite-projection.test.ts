import { describe, expect, it } from "vitest";

import type {
  NormalizedErrorCode,
  Outcome,
} from "../../../packages/probe-core/src/types.js";
import { EXPECTED_EVENT_ORDER } from "../../../packages/vite-plugin-probe/src/constants.js";

import {
  projectViteProfileEvents,
  projectViteProfileSegment,
  type ViteScenarioId,
  type ViteSelectedEventInput,
} from "../src/vite-projection.js";

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
    "capability-attempt:vite-attempt-environment": [
      "failure",
      "ENVIRONMENT_VARIABLE_ABSENT",
    ],
    "capability-attempt:vite-attempt-file-read": ["failure", "FILE_NOT_FOUND"],
    "capability-attempt:vite-attempt-file-write": ["failure", "WRITE_DENIED"],
    "capability-attempt:vite-attempt-loopback": ["failure", "NETWORK_FAILURE"],
    "tool-api-change:vite-module-transform-change": [
      "skipped",
      "NOT_APPLICABLE",
    ],
    "tool-api-change:vite-emitted-asset-change": ["skipped", "NOT_APPLICABLE"],
    "tool-api-change:vite-bundle-mutation-change": [
      "skipped",
      "NOT_APPLICABLE",
    ],
  };
  return failures[orderValue] ?? ["success", null];
}

function eventsFor(
  scenarioId: ViteScenarioId,
  profileId: "permissive" | "constrained",
  runId: string,
): readonly ViteSelectedEventInput[] {
  return EXPECTED_EVENT_ORDER.map((orderValue, producerSequence) => {
    const [eventKind, id] = orderValue.split(":") as [
      ViteSelectedEventInput["eventKind"],
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

describe("P2 Vite profile projection", () => {
  it.each([
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260723-01"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260723-01"],
  ] as const)(
    "accepts the complete sanitized %s stream",
    (scenarioId, profileId, runId) => {
      const result = projectViteProfileEvents({
        scenarioId,
        profileId,
        runId,
        events: eventsFor(scenarioId, profileId, runId),
      });
      expect(result.validity).toBe("matches-expected");
      expect(result.counts).toEqual({
        route: 6,
        capability: 6,
        toolApiChange: 3,
        total: 15,
      });
      expect(result.attempts).toHaveLength(6);
      expect(result.limitations).toEqual(
        profileId === "constrained"
          ? ["CONSTRAINED_CHILD_REQUIRED_BY_TOOL"]
          : [],
      );
      expect(result.issues).toEqual([]);
    },
  );

  it.each([
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260719-01"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260719-01"],
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260719-02"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260719-02"],
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260719-03"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260719-03"],
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260719-11"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260719-11"],
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260720-01"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260720-01"],
    ["vite-observe-p", "permissive", "p2-vite-observe-p-20260720-02"],
    ["vite-observe-c", "constrained", "p2-vite-observe-c-20260720-02"],
  ] as const)(
    "rejects the exhausted historical tuple %s",
    (scenarioId, profileId, runId) => {
      const result = projectViteProfileEvents({
        scenarioId,
        profileId,
        runId,
        events: eventsFor(scenarioId, profileId, runId),
      });
      expect(result.validity).toBe("inconclusive");
      expect(result.runId).toBeNull();
      expect(result.issues).toContain("IDENTITY_OR_ORDER_MISMATCH");
    },
  );

  it("preserves an unexpected constrained child denial as a mismatch", () => {
    const scenarioId = "vite-observe-c";
    const runId = "p2-vite-observe-c-20260723-01";
    const events = eventsFor(scenarioId, "constrained", runId).map((event) =>
      event.attemptId === "vite-attempt-child"
        ? {
            ...event,
            outcome: "failure" as const,
            normalizedErrorCode: "CHILD_PROCESS_FAILURE" as const,
          }
        : event,
    );
    const result = projectViteProfileEvents({
      scenarioId,
      profileId: "constrained",
      runId,
      events,
    });
    expect(result.validity).toBe("mismatch");
    expect(result.issues).toEqual(["CAPABILITY_OUTCOME_MISMATCH"]);
    expect(result.attempts.at(-1)).toMatchObject({
      attemptId: "vite-attempt-child",
      outcome: "failure",
      normalizedErrorCode: "CHILD_PROCESS_FAILURE",
    });
  });

  it("marks missing or reordered evidence inconclusive", () => {
    const scenarioId = "vite-observe-p";
    const runId = "p2-vite-observe-p-20260723-01";
    const result = projectViteProfileEvents({
      scenarioId,
      profileId: "permissive",
      runId,
      events: eventsFor(scenarioId, "permissive", runId).slice(1),
    });
    expect(result.validity).toBe("inconclusive");
    expect(result.issues).toEqual([
      "IDENTITY_OR_ORDER_MISMATCH",
      "COUNT_MISMATCH",
    ]);
  });

  it("rejects a relabeled scenario/profile/run tuple", () => {
    const scenarioId = "vite-observe-p";
    const runId = "p2-vite-observe-p-20260723-01";
    const result = projectViteProfileEvents({
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
    const scenarioId = "vite-observe-p";
    const runId = "p2-vite-observe-p-20260723-01";
    const events = eventsFor(scenarioId, "permissive", runId).map((event) => ({
      ...event,
      ...(event.attemptId === "vite-attempt-environment"
        ? { attemptId: "raw-attacker-id" }
        : {}),
      rawSecret: "must-not-appear",
    }));
    const result = projectViteProfileEvents({
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
    const scenarioId = "vite-observe-c";
    const runId = "p2-vite-observe-c-20260723-01";
    const rawSegment = `${eventsFor(scenarioId, "constrained", runId)
      .map((event) => JSON.stringify({ ...event, rawSecret: "discard-me" }))
      .join("\n")}\n`;
    const result = projectViteProfileSegment({
      scenarioId,
      profileId: "constrained",
      runId,
      rawSegment,
    });
    expect(result.validity).toBe("matches-expected");
    expect(result.counts.total).toBe(15);
    expect(JSON.stringify(result)).not.toContain("discard-me");
  });

  it("makes malformed or oversized raw segments inconclusive", () => {
    for (const rawSegment of [
      "not-json\n",
      `${"x".repeat(65_537)}\n`,
      JSON.stringify({ eventKind: "capability-attempt" }),
    ]) {
      const result = projectViteProfileSegment({
        scenarioId: "vite-observe-p",
        profileId: "permissive",
        runId: "p2-vite-observe-p-20260723-01",
        rawSegment,
      });
      expect(result.validity).toBe("inconclusive");
      expect(result.runId).toBe("p2-vite-observe-p-20260723-01");
      expect(result.counts.total).toBe(0);
    }
  });
});
