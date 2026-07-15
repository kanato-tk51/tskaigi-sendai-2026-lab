import { describe, expect, it } from "vitest";

import {
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
} from "../src/constants.js";
import { runFixedVitestScenario } from "../src/scenario.js";

function eventOrderValue(
  event: Awaited<ReturnType<typeof runFixedVitestScenario>>["events"][number],
): string {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

describe("fixed Vitest setupFiles scenario", () => {
  it("runs one file/case in one fork worker and closes one 8-event segment", async () => {
    const result = await runFixedVitestScenario();
    expect(result.eventCount).toBe(EXPECTED_EVENT_COUNT);
    expect(result.routeCount).toBe(EXPECTED_ROUTE_COUNT);
    expect(result.capabilityCount).toBe(EXPECTED_CAPABILITY_COUNT);
    expect(result.toolApiChangeCount).toBe(EXPECTED_TOOL_API_CHANGE_COUNT);
    expect(result.events.map((event) => event.producerSequence)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(result.events.map(eventOrderValue)).toEqual(EXPECTED_EVENT_ORDER);
    expect(new Set(result.events.map((event) => event.pid)).size).toBe(1);
    expect(result.workerPpid).toBe(result.coordinatorPid);
    expect(result.events.every((event) => event.workerId === null)).toBe(true);
    expect(result.coordinatorReport).toMatchObject({
      testFileCount: 1,
      testCaseCount: 1,
      passedTestCaseCount: 1,
      failedTestCaseCount: 0,
      reason: "passed",
    });
    expect(result.loopbackRequestCount).toBe(1);
    expect(result.sourceHashUnchanged).toBe(true);
    expect(result.committedFixtureHashesUnchanged).toBe(true);
    expect(result.directWriteMarkerCreated).toBe(true);
    expect(result.segmentCloseComplete).toBe(true);
    expect(result.toolTempPreEntryCount).toBe(0);
    expect(result.toolTempPostEntryCount).toBe(0);
    expect(result.toolCachePreEntryCount).toBe(0);
    expect(result.configTempPreexisting).toBe(false);
    expect(result.configTempPostexisting).toBe(false);
    expect(result.toolTempCleanupComplete).toBe(true);
    expect(result.runRootCleanupComplete).toBe(true);
  });
});
