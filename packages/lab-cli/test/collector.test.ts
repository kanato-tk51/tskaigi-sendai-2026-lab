import { describe, expect, it } from "vitest";

import { collectRun } from "../src/collector.js";
import {
  completeWithoutSegments,
  fixedInput,
  hashAndToolChangeInput,
  mismatchingExpectedInput,
  replaceEventBySequence,
  rewriteSegmentEvents,
} from "./helpers.js";

describe("M3 deterministic collector", () => {
  it("revalidates, orders, envelopes, and reduces closed producer segments", () => {
    const input = fixedInput();
    const originalSegments = Object.fromEntries(
      Object.entries(input.segments as Record<string, Uint8Array>).map(
        ([id, bytes]) => [id, Buffer.from(bytes).toString("hex")],
      ),
    );
    const result = collectRun(input);

    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") return;
    expect(result.events.map((item) => item.globalSequence)).toEqual([0, 1]);
    expect(result.events.map((item) => item.event.producerId)).toEqual([
      "producer-a",
      "producer-b",
    ]);
    expect(result.events.map((item) => item.event.timestamp)).toEqual([
      "2026-01-01T00:00:02.000Z",
      "2026-01-01T00:00:01.000Z",
    ]);
    expect(result.events[0]?.event).not.toHaveProperty("globalSequence");
    expect(result.metadata.ordering).toEqual({
      key: "producer-id-then-segment-id",
      preservesSegmentLineOrder: true,
      causalOrder: false,
    });
    expect(result.metadata.segments.map((item) => item.producerId)).toEqual([
      "producer-a",
      "producer-b",
    ]);
    expect(result.metadata.runtimeContext).toEqual({
      profileRevision: "not-applicable",
      containerInput: "not-applicable",
      segmentRetention: "immutable-raw-input",
      producers: [
        {
          producerId: "producer-a",
          adapterVersion: "0.0.0",
          nodeVersion: "v20.18.2",
          toolName: "synthetic-tool",
          toolVersion: "0.0.0",
        },
        {
          producerId: "producer-b",
          adapterVersion: "0.0.0",
          nodeVersion: "v20.18.2",
          toolName: "synthetic-tool",
          toolVersion: "0.0.0",
        },
      ],
    });
    expect(result.summary.counts.totalEvents).toBe(2);
    expect(result.summary.counts.eventKinds).toEqual([
      { eventKind: "capability-attempt", count: 0 },
      { eventKind: "route-invocation", count: 2 },
      { eventKind: "tool-api-change", count: 0 },
    ]);
    expect(result.summary.comparison.matches).toBe(true);
    expect(result.summary.processes).toEqual([
      {
        producerId: "producer-a",
        processCount: 1,
        internalParentLinks: 0,
        externalParentLinks: 1,
        workerIds: [null],
      },
      {
        producerId: "producer-b",
        processCount: 1,
        internalParentLinks: 0,
        externalParentLinks: 1,
        workerIds: [null],
      },
    ]);
    expect(result.hashes.records).toEqual([]);
    expect(result.comparisonMarkdown).toContain(
      "not causal or real-time order",
    );
    expect(
      Object.fromEntries(
        Object.entries(input.segments as Record<string, Uint8Array>).map(
          ([id, bytes]) => [id, Buffer.from(bytes).toString("hex")],
        ),
      ),
    ).toEqual(originalSegments);
  });

  it("keeps a valid run complete when Expected differs from Observed", () => {
    const result = collectRun(mismatchingExpectedInput());
    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") return;
    expect(result.summary.comparison.matches).toBe(false);
    expect(
      result.summary.comparison.metrics.filter((metric) => !metric.matches),
    ).toEqual([
      {
        metric: "total-events",
        expected: 1,
        observed: 2,
        matches: false,
      },
      {
        metric: "event-kind:route-invocation",
        expected: 1,
        observed: 2,
        matches: false,
      },
    ]);
  });

  it("allows a declared zero-producer baseline without treating missing evidence as zero", () => {
    const result = collectRun(completeWithoutSegments());
    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") return;
    expect(result.summary.counts.totalEvents).toBe(0);
    expect(result.events).toEqual([]);
    expect(result.eventsJsonl).toBe("");
  });

  it("keeps capability hash and official tool change evidence separate", () => {
    const result = collectRun(hashAndToolChangeInput());
    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") return;
    expect(result.summary.counts.attempts).toEqual([
      { attemptType: "file-hash", outcome: "success", count: 2 },
    ]);
    expect(result.summary.counts.toolChanges).toEqual([
      { changeKind: "emitted-asset", outcome: "success", count: 1 },
    ]);
    expect(result.hashes.records).toEqual([
      {
        evidenceKind: "file-hash",
        producerId: "producer-hash-tool",
        targetId: "source-hash-target",
        classification: "source",
        state: "unchanged",
        changed: false,
        beforeHash: `sha256:${"a".repeat(64)}`,
        afterHash: `sha256:${"a".repeat(64)}`,
        globalSequences: [1, 2],
      },
      {
        evidenceKind: "tool-api-change",
        producerId: "producer-hash-tool",
        targetId: "artifact-target",
        classification: "artifact",
        state: "changed",
        changed: true,
        beforeHash: null,
        afterHash: `sha256:${"b".repeat(64)}`,
        globalSequences: [3],
      },
    ]);
    expect(result.summary.counts.hashDeltas).toEqual([
      {
        evidenceKind: "file-hash",
        classification: "source",
        state: "unchanged",
        count: 1,
      },
      {
        evidenceKind: "tool-api-change",
        classification: "artifact",
        state: "changed",
        count: 1,
      },
    ]);
    expect(result.summary.hashRecordCount).toBe(2);
    expect(result.summary.comparison.matches).toBe(true);
  });

  it("derives changed and unavailable file-hash states without hiding mismatches", () => {
    const changed = collectRun(
      replaceEventBySequence(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        2,
        (event) => ({
          ...event,
          afterHash: `sha256:${"c".repeat(64)}`,
        }),
      ),
    );
    expect(changed.validity).toBe("complete");
    if (changed.validity !== "complete") return;
    expect(changed.hashes.records[0]).toMatchObject({
      evidenceKind: "file-hash",
      state: "changed",
      changed: true,
    });
    expect(changed.summary.comparison.matches).toBe(false);

    const unavailable = collectRun(
      replaceEventBySequence(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        2,
        (event) => ({
          ...event,
          outcome: "failure",
          normalizedErrorCode: "HASH_DENIED",
          afterHash: null,
          details: {
            kind: "file-hash",
            state: "unavailable",
            sizeBytes: null,
          },
        }),
      ),
    );
    expect(unavailable.validity).toBe("complete");
    if (unavailable.validity !== "complete") return;
    expect(unavailable.hashes.records[0]).toMatchObject({
      evidenceKind: "file-hash",
      state: "unavailable",
      changed: null,
    });
    expect(unavailable.summary.comparison.matches).toBe(false);
  });

  it("compares same-count outcome changes and runtime context consistency", () => {
    const skipped = collectRun(
      replaceEventBySequence(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        3,
        (event) => ({
          ...event,
          outcome: "skipped",
          normalizedErrorCode: "NOT_APPLICABLE",
          changed: false,
          beforeHash: null,
          afterHash: null,
          byteSizeBefore: null,
          byteSizeAfter: null,
        }),
      ),
    );
    expect(skipped.validity).toBe("complete");
    if (skipped.validity !== "complete") return;
    expect(skipped.summary.counts.totalEvents).toBe(4);
    expect(skipped.summary.comparison.matches).toBe(false);
    expect(
      skipped.summary.comparison.metrics.filter(
        (metric) =>
          metric.metric.startsWith("tool-change-outcome:") && !metric.matches,
      ),
    ).toHaveLength(2);

    const inconsistentRuntime = collectRun(
      replaceEventBySequence(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        2,
        (event) => ({ ...event, nodeVersion: "v20.18.3" }),
      ),
    );
    expect(inconsistentRuntime.validity).toBe("inconclusive");
    if (inconsistentRuntime.validity !== "inconclusive") return;
    expect(inconsistentRuntime.metadata.errorCodes).toEqual([
      "RUNTIME_CONTEXT_INVALID",
    ]);
  });

  it("reports missing hash positions unavailable and rejects duplicates", () => {
    const missingAfter = collectRun(
      rewriteSegmentEvents(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        (events) =>
          events
            .filter((event) => event.producerSequence !== 2)
            .map((event) => ({
              ...event,
              producerSequence:
                typeof event.producerSequence === "number" &&
                event.producerSequence > 2
                  ? event.producerSequence - 1
                  : event.producerSequence,
            })),
      ),
    );
    expect(missingAfter.validity).toBe("complete");
    if (missingAfter.validity !== "complete") return;
    expect(missingAfter.hashes.records[0]).toMatchObject({
      evidenceKind: "file-hash",
      state: "unavailable",
    });
    expect(missingAfter.summary.comparison.matches).toBe(false);

    const duplicateBefore = collectRun(
      rewriteSegmentEvents(
        hashAndToolChangeInput(),
        "segment-hash-tool",
        (events) => {
          const before = events.find((event) => event.producerSequence === 1);
          if (before === undefined)
            throw new Error("missing before hash event");
          return events.flatMap((event) => {
            if (event.producerSequence === 2) {
              return [
                { ...before, producerSequence: 2 },
                { ...event, producerSequence: 3 },
              ];
            }
            return [
              {
                ...event,
                producerSequence:
                  typeof event.producerSequence === "number" &&
                  event.producerSequence > 2
                    ? event.producerSequence + 1
                    : event.producerSequence,
              },
            ];
          });
        },
      ),
    );
    expect(duplicateBefore.validity).toBe("inconclusive");
    if (duplicateBefore.validity !== "inconclusive") return;
    expect(duplicateBefore.metadata.errorCodes).toEqual([
      "HASH_EVIDENCE_INVALID",
    ]);
  });
});
