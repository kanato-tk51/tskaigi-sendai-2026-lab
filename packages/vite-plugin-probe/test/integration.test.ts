import { describe, expect, it } from "vitest";

import { EXPECTED_EVENT_ORDER, TOOL_CHANGE_IDS } from "../src/constants.js";
import { getIntegrationRuns } from "./integration-fixture.js";

function orderValue(
  event: Awaited<
    ReturnType<typeof getIntegrationRuns>
  >["observe"][0]["events"][number],
) {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

describe("production Vite integration", () => {
  it("produces exact 6/6/3/15 order for both variants", async () => {
    const runs = await getIntegrationRuns();
    for (const result of [runs.observe[0], runs.api[0]]) {
      expect(result).toMatchObject({
        eventCount: 15,
        routeCount: 6,
        capabilityCount: 6,
        toolApiChangeCount: 3,
        producerCount: 1,
        workerId: null,
        designatedTransformCount: 1,
        segmentCloseComplete: true,
      });
      expect(result.events.map(orderValue)).toEqual(EXPECTED_EVENT_ORDER);
      expect(result.events.map((event) => event.producerSequence)).toEqual(
        Array.from({ length: 15 }, (_, index) => index),
      );
    }
  });

  it("records observe changes as operation-not-started NOT_APPLICABLE", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const changes = result.events.filter(
      (event) => event.eventKind === "tool-api-change",
    );
    expect(changes.map((event) => event.toolApiChangeId)).toEqual(
      Object.values(TOOL_CHANGE_IDS),
    );
    expect(
      changes.every(
        (event) =>
          event.outcome === "skipped" &&
          event.normalizedErrorCode === "NOT_APPLICABLE" &&
          !event.changed &&
          event.beforeHash === null &&
          event.afterHash === null &&
          event.byteSizeBefore === null &&
          event.byteSizeAfter === null,
      ),
    ).toBe(true);
    expect(result.outputEvidence).toHaveLength(1);
  });

  it("records three distinct successful API changes and materialization", async () => {
    const result = (await getIntegrationRuns()).api[0];
    const changes = result.events.filter(
      (event) => event.eventKind === "tool-api-change",
    );
    expect(changes.map((event) => event.changeKind)).toEqual([
      "module-transform",
      "emitted-asset",
      "bundle-mutation",
    ]);
    expect(
      changes.every((event) => event.outcome === "success" && event.changed),
    ).toBe(true);
    expect(result.outputEvidence).toHaveLength(2);
    expect(result.outputEvidence.map((value) => value.logicalId)).toEqual([
      "vite-entry-output",
      "vite-emitted-asset-output",
    ]);
  });

  it("keeps source/config/plugin inputs immutable and separates direct/output writes", async () => {
    const runs = await getIntegrationRuns();
    for (const result of [runs.observe[0], runs.api[0]]) {
      expect(result.sourceConfigPluginHashesUnchanged).toBe(true);
      expect(result.inputHashEvidence).toHaveLength(5);
      expect(result.directWriteMarkerCreated).toBe(true);
      expect(
        result.outputEvidence.every((value) =>
          value.logicalId.includes("output"),
        ),
      ).toBe(true);
    }
  });

  it("proves fresh deterministic projections for observe and API", async () => {
    const runs = await getIntegrationRuns();
    expect(runs.observe[0].runId).not.toBe(runs.observe[1].runId);
    expect(runs.api[0].runId).not.toBe(runs.api[1].runId);
    expect(runs.observe[0].deterministicProjection).toBe(
      runs.observe[1].deterministicProjection,
    );
    expect(runs.api[0].deterministicProjection).toBe(
      runs.api[1].deterministicProjection,
    );
    expect(runs.observe[0].outputEvidence).toEqual(
      runs.observe[1].outputEvidence,
    );
    expect(runs.api[0].outputEvidence).toEqual(runs.api[1].outputEvidence);
  });

  it("leaves no owned temp/cache/outDir/run-root or process residue", async () => {
    const runs = await getIntegrationRuns();
    for (const result of [...runs.observe, ...runs.api]) {
      expect(result).toMatchObject({
        configTempPreexisting: false,
        configTempPostexisting: false,
        toolTempPreEntryCount: 0,
        cachePreEntryCount: 0,
        outDirPreEntryCount: 0,
        processGroupAbsent: true,
        esbuildResidueAbsent: true,
        cleanupComplete: true,
      });
    }
  });

  it("persists complete LF-terminated policy-safe producer segments", async () => {
    const runs = await getIntegrationRuns();
    for (const result of [runs.observe[0], runs.api[0]]) {
      expect(result.rawSegment.endsWith("\n")).toBe(true);
      expect(result.rawSegment.slice(0, -1).split("\n")).toHaveLength(15);
      expect(result.rawSegment).not.toMatch(
        /\/tmp\/|\/home\/|"stack"|"stdout"|"stderr"|"moduleId"|"referenceId"/u,
      );
      expect(new Set(result.events.map((event) => event.pid))).toEqual(
        new Set([result.coordinatorPid]),
      );
    }
  });
});
