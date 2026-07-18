import { describe, expect, it } from "vitest";

import { collectRun } from "../src/collector.js";
import { clone, fixedInput } from "./helpers.js";

describe("M3 raw-to-derived regeneration", () => {
  it("produces identical bytes regardless of input record insertion order", () => {
    const firstInput = fixedInput("m3-deterministic-run");
    const secondInput = clone(firstInput);
    const secondSnapshot = secondInput.snapshot as {
      segments: unknown[];
    };
    secondSnapshot.segments.reverse();
    const secondCompletion = secondInput.completion as {
      segmentCloses: unknown[];
    };
    secondCompletion.segmentCloses.reverse();
    const secondSegments = secondInput.segments as Record<string, Uint8Array>;
    const reversedSegments = {
      "segment-a": secondSegments["segment-a"],
      "segment-b": secondSegments["segment-b"],
    };
    const second = collectRun({
      snapshot: secondInput.snapshot,
      completion: secondInput.completion,
      segments: reversedSegments,
    });
    const first = collectRun(firstInput);
    expect(first.validity).toBe("complete");
    expect(second.validity).toBe("complete");
    if (first.validity !== "complete" || second.validity !== "complete") {
      return;
    }
    expect(second.eventsJsonl).toBe(first.eventsJsonl);
    expect(second.metadataJson).toBe(first.metadataJson);
    expect(second.summaryJson).toBe(first.summaryJson);
    expect(second.hashesJson).toBe(first.hashesJson);
    expect(second.comparisonMarkdown).toBe(first.comparisonMarkdown);
  });
});
