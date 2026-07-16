import { describe, expect, it } from "vitest";

import {
  ATTEMPT_IDS,
  EXPECTED_EVENT_ORDER,
  GENERATED_ARTIFACT_CONTENT,
  ROUTE_IDS,
  TOOL_API_CHANGE_ID,
} from "../src/constants.js";
import {
  runFixedApiScenario,
  runFixedDryRunScenario,
  runFixedObserveScenario,
} from "../src/scenario.js";

function orderValue(
  event: Awaited<ReturnType<typeof runFixedApiScenario>>["events"][number],
): string {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

describe("M2-E explicit CLI integration", () => {
  it("separates direct write, generator API, and dry-run", async () => {
    const [observe, api, dryRun] = await Promise.all([
      runFixedObserveScenario(),
      runFixedApiScenario(),
      runFixedDryRunScenario(),
    ]);
    for (const result of [observe, api, dryRun]) {
      expect(result.events.map(orderValue)).toEqual(EXPECTED_EVENT_ORDER);
      expect(result).toMatchObject({
        eventCount: 12,
        routeCount: 5,
        capabilityCount: 6,
        toolApiChangeCount: 1,
        producerCount: 1,
        workerId: null,
        cleanupComplete: true,
      });
    }
    expect(observe.directWriteMarkerCreated).toBe(true);
    expect(observe.outputEvidence).toHaveLength(0);
    expect(api.directWriteMarkerCreated).toBe(false);
    expect(api.outputEvidence).toHaveLength(1);
    expect(api.outputEvidence[0]?.sizeBytes).toBe(
      Buffer.byteLength(GENERATED_ARTIFACT_CONTENT),
    );
    expect(dryRun.directWriteMarkerCreated).toBe(false);
    expect(dryRun.outputEvidence).toHaveLength(0);
  });

  it("keeps explicit phases and operation outcomes distinct", async () => {
    const observe = await runFixedObserveScenario();
    const api = await runFixedApiScenario();
    const dryRun = await runFixedDryRunScenario();
    for (const result of [observe, api, dryRun]) {
      expect(
        result.events
          .filter((event) => event.eventKind === "route-invocation")
          .every((event) => event.triggerType === "explicit"),
      ).toBe(true);
    }
    const observeTool = observe.events.find(
      (event) => event.eventKind === "tool-api-change",
    );
    const apiTool = api.events.find(
      (event) => event.eventKind === "tool-api-change",
    );
    const dryRunTool = dryRun.events.find(
      (event) => event.eventKind === "tool-api-change",
    );
    expect(observeTool).toMatchObject({
      toolApiChangeId: TOOL_API_CHANGE_ID,
      outcome: "skipped",
      normalizedErrorCode: "NOT_APPLICABLE",
    });
    expect(apiTool).toMatchObject({
      toolApiChangeId: TOOL_API_CHANGE_ID,
      outcome: "success",
      changed: true,
    });
    expect(dryRunTool).toMatchObject({
      toolApiChangeId: TOOL_API_CHANGE_ID,
      outcome: "skipped",
      normalizedErrorCode: "NOT_APPLICABLE",
    });
    const apiDirect = api.events.find(
      (event) =>
        event.eventKind === "capability-attempt" &&
        event.attemptId === ATTEMPT_IDS.fileWrite,
    );
    expect(apiDirect).toMatchObject({
      outcome: "skipped",
      normalizedErrorCode: "MANIFEST_DISALLOWED",
    });
    expect(observe.events[2]).toMatchObject({
      eventKind: "route-invocation",
      routeInvocationId: ROUTE_IDS.generationStart,
    });
  });
});
