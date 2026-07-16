import { describe, expect, it } from "vitest";

import { EXPECTED_EVENT_ORDER } from "../src/constants.js";
import { createLocalRunnerFailureProjection } from "../src/local-runner.js";
import { validateTrustedPartialSegment } from "../src/partial-segment.js";
import type { TrustedPartialProgress } from "../src/partial-segment.js";
import { ProcessLifecycleError } from "../src/process-lifecycle.js";
import { ScenarioProgressError } from "../src/scenario.js";
import type { ScenarioResult } from "../src/types.js";
import { getIntegrationRuns } from "./integration-fixture.js";

const POISONED_EVENT_ID = "r01-poisoned-event-sentinel";
const ABSOLUTE_PATH_SENTINEL = "/r01/absolute-path-sentinel";
const INCOMPLETE_FRAGMENT_SENTINEL = "r01-incomplete-fragment-sentinel";

function segmentLines(result: ScenarioResult): string[] {
  return result.rawSegment.slice(0, -1).split("\n");
}

function parseLine(line: string): Record<string, unknown> {
  return JSON.parse(line) as Record<string, unknown>;
}

function mutatedLine(
  line: string,
  mutate: (event: Record<string, unknown>) => void,
): string {
  const event = parseLine(line);
  mutate(event);
  return JSON.stringify(event);
}

function partialSegment(lines: readonly string[]): string {
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

function inspect(
  result: ScenarioResult,
  rawSegment: string,
  variant: "observe" | "api" = result.variant,
): TrustedPartialProgress {
  return validateTrustedPartialSegment(
    rawSegment,
    result.manifest,
    variant,
    [],
  );
}

function progressError(
  progress: TrustedPartialProgress,
): ScenarioProgressError {
  return new ScenarioProgressError(
    new ProcessLifecycleError("M2D_TOOL_COMMAND_FAILED", [], true),
    progress.partialSegmentInvalid
      ? ["M2D_SEGMENT_INVALID"]
      : ["M2D_ROUTE_INVALID"],
    progress,
  );
}

function serializedProjection(progress: TrustedPartialProgress): string {
  return JSON.stringify(
    createLocalRunnerFailureProjection(progressError(progress)),
  );
}

describe("trusted failure-prefix projection", () => {
  it("rejects a syntactically valid poisoned event ID without projecting it", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const lines = segmentLines(result);
    const poisoned = mutatedLine(lines[2]!, (event) => {
      event.routeInvocationId = POISONED_EVENT_ID;
    });
    const rawSegment = partialSegment([lines[0]!, lines[1]!, poisoned]);
    const progress = inspect(result, rawSegment);
    const projection = serializedProjection(progress);

    expect(progress).toEqual({
      trustedEventCount: null,
      lastEventId: null,
      partialSegmentInvalid: true,
    });
    expect(projection).not.toContain(POISONED_EVENT_ID);
    expect(projection).not.toContain(poisoned);
    expect(JSON.parse(projection)).toMatchObject({
      status: "failure",
      code: "M2D_TOOL_COMMAND_FAILED",
      secondaryCodes: ["M2D_SEGMENT_INVALID"],
      trustedEventCount: null,
      lastEventId: null,
    });
  });

  it("rejects absolute-path-shaped event data without projecting raw data", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const lines = segmentLines(result);
    const poisoned = mutatedLine(lines[0]!, (event) => {
      event.routeInvocationId = ABSOLUTE_PATH_SENTINEL;
    });
    const projection = serializedProjection(
      inspect(result, partialSegment([poisoned])),
    );

    expect(projection).not.toContain(ABSOLUTE_PATH_SENTINEL);
    expect(projection).not.toContain(poisoned);
    expect(JSON.parse(projection)).toMatchObject({
      secondaryCodes: ["M2D_SEGMENT_INVALID"],
      trustedEventCount: null,
      lastEventId: null,
    });
  });

  it("projects only the fixed ID and count for a valid contiguous prefix", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const lines = segmentLines(result).slice(0, 7);
    const rawSegment = partialSegment(lines);
    const progress = inspect(result, rawSegment);
    const projection = serializedProjection(progress);

    expect(progress).toEqual({
      trustedEventCount: 7,
      lastEventId: "vite-attempt-file-write",
      partialSegmentInvalid: false,
    });
    expect(JSON.parse(projection)).toMatchObject({
      trustedEventCount: 7,
      lastEventId: "vite-attempt-file-write",
    });
    for (const line of lines) {
      expect(projection).not.toContain(line);
    }
  });

  it("rejects individually valid events when their prefix order changes", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const lines = segmentLines(result);
    const progress = inspect(
      result,
      partialSegment([lines[0]!, lines[2]!, lines[1]!]),
    );

    expect(progress.trustedEventCount).toBeNull();
    expect(progress.lastEventId).toBeNull();
    expect(JSON.parse(serializedProjection(progress))).toMatchObject({
      secondaryCodes: ["M2D_SEGMENT_INVALID"],
      trustedEventCount: null,
      lastEventId: null,
    });
  });

  it.each([
    [
      "sequence gap",
      (event: Record<string, unknown>) => {
        event.producerSequence = 2;
      },
    ],
    [
      "duplicate sequence",
      (event: Record<string, unknown>) => {
        event.producerSequence = 0;
      },
    ],
    [
      "unexpected producer",
      (event: Record<string, unknown>) => {
        event.producerId = "r01-unexpected-producer";
      },
    ],
    [
      "non-null worker",
      (event: Record<string, unknown>) => {
        event.workerId = "r01-unexpected-worker";
      },
    ],
    [
      "global sequence",
      (event: Record<string, unknown>) => {
        event.sequence = 1;
      },
    ],
  ] as const)("rejects %s", async (_label, mutate) => {
    const result = (await getIntegrationRuns()).observe[0];
    const lines = segmentLines(result);
    const invalid = mutatedLine(lines[1]!, mutate);
    const progress = inspect(result, partialSegment([lines[0]!, invalid]));

    expect(progress).toEqual({
      trustedEventCount: null,
      lastEventId: null,
      partialSegmentInvalid: true,
    });
    expect(JSON.parse(serializedProjection(progress))).toMatchObject({
      secondaryCodes: ["M2D_SEGMENT_INVALID"],
      trustedEventCount: null,
      lastEventId: null,
    });
  });

  it("trusts only complete lines and never parses or projects an incomplete fragment", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const completeLines = segmentLines(result).slice(0, 4);
    const fragment = `{"routeInvocationId":"${INCOMPLETE_FRAGMENT_SENTINEL}`;
    const progress = inspect(
      result,
      `${partialSegment(completeLines)}${fragment}`,
    );
    const projection = serializedProjection(progress);

    expect(progress).toEqual({
      trustedEventCount: 4,
      lastEventId: "vite-attempt-environment",
      partialSegmentInvalid: true,
    });
    expect(projection).not.toContain(INCOMPLETE_FRAGMENT_SENTINEL);
    expect(projection).not.toContain(fragment);
    expect(JSON.parse(projection)).toMatchObject({
      secondaryCodes: ["M2D_SEGMENT_INVALID"],
      trustedEventCount: 4,
      lastEventId: "vite-attempt-environment",
    });
  });

  it("rejects variant mismatch and adapter-specific tool hash drift", async () => {
    const runs = await getIntegrationRuns();
    const apiLines = segmentLines(runs.api[0]);
    const observeLines = segmentLines(runs.observe[0]);
    expect(
      inspect(runs.api[0], partialSegment(apiLines.slice(0, 11)), "observe"),
    ).toMatchObject({ trustedEventCount: null, lastEventId: null });
    expect(
      inspect(
        runs.observe[0],
        partialSegment(observeLines.slice(0, 11)),
        "api",
      ),
    ).toMatchObject({ trustedEventCount: null, lastEventId: null });

    const driftedTransform = mutatedLine(apiLines[10]!, (event) => {
      event.afterHash = `sha256:${"0".repeat(64)}`;
    });
    expect(
      inspect(
        runs.api[0],
        partialSegment([...apiLines.slice(0, 10), driftedTransform]),
      ),
    ).toMatchObject({ trustedEventCount: null, lastEventId: null });
  });

  it("re-normalizes progress against the expected index before local-runner output", () => {
    const mismatchedAllowlistedId = "vite-plugin-factory";
    const error = progressError({
      trustedEventCount: 3,
      lastEventId: mismatchedAllowlistedId,
      partialSegmentInvalid: false,
    });
    const projection = JSON.stringify(
      createLocalRunnerFailureProjection(error),
    );

    expect(projection).not.toContain(mismatchedAllowlistedId);
    expect(JSON.parse(projection)).toMatchObject({
      secondaryCodes: ["M2D_ROUTE_INVALID", "M2D_SEGMENT_INVALID"],
      trustedEventCount: null,
      lastEventId: null,
    });
    expect(EXPECTED_EVENT_ORDER[2]).toBe("route-invocation:vite-build-start");
  });
});
