import { describe, expect, it } from "vitest";

import { runFixedVitestScenario } from "../src/scenario.js";

function deterministicProjection(
  result: Awaited<ReturnType<typeof runFixedVitestScenario>>,
) {
  return result.events.map((event) => ({
    eventKind: event.eventKind,
    phase: event.phase,
    triggerType: event.triggerType,
    outcome: event.outcome,
    normalizedErrorCode: event.normalizedErrorCode,
    producerSequence: event.producerSequence,
    routeInvocationId:
      event.eventKind === "route-invocation"
        ? event.routeInvocationId
        : undefined,
    invocationKind:
      event.eventKind === "route-invocation" ? event.invocationKind : undefined,
    logicalUnitId:
      event.eventKind === "route-invocation" ? event.logicalUnitId : undefined,
    attemptId:
      event.eventKind === "capability-attempt" ? event.attemptId : undefined,
    attemptType:
      event.eventKind === "capability-attempt" ? event.attemptType : undefined,
    beforeHash:
      event.eventKind === "capability-attempt" ? event.beforeHash : undefined,
    afterHash:
      event.eventKind === "capability-attempt" &&
      event.attemptType !== "direct-filesystem-write"
        ? event.afterHash
        : undefined,
    details:
      event.eventKind === "capability-attempt" ? event.details : undefined,
    workerId: event.workerId,
    nodeVersion: event.nodeVersion,
    toolVersion: event.toolVersion,
  }));
}

describe("M2-C deterministic projection", () => {
  it("matches across two fresh processes and run directories", async () => {
    const first = await runFixedVitestScenario();
    const second = await runFixedVitestScenario();
    expect(second.runId).not.toBe(first.runId);
    expect(second.coordinatorPid).not.toBe(first.coordinatorPid);
    expect(deterministicProjection(second)).toEqual(
      deterministicProjection(first),
    );
  });
});
