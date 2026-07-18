import {
  MAX_EVENTS_PER_SEGMENT,
  MAX_EVENT_LINE_BYTES,
  MAX_SEGMENT_BYTES,
} from "@tskaigi-lab/probe-core";
import { describe, expect, it } from "vitest";

import type { LabErrorCode } from "../src/constants.js";
import { collectRun } from "../src/collector.js";
import type { CollectRunInput } from "../src/types.js";
import {
  clone,
  fixedInput,
  replaceSegmentEvent,
  segmentText,
  utf8Bytes,
} from "./helpers.js";

function expectInconclusive(
  input: CollectRunInput | unknown,
  code: LabErrorCode,
): void {
  const result = collectRun(input);
  expect(result.validity).toBe("inconclusive");
  if (result.validity !== "inconclusive") return;
  expect(result.metadata.errorCodes).toEqual([code]);
  expect(result.summary.counts).toBeNull();
  expect(result.events).toBeNull();
  expect(result.eventsJsonl).toBeNull();
  expect(result.hashesJson).toBeNull();
  expect(result.comparisonMarkdown).toBeNull();
}

describe("M3 fail-closed collection", () => {
  it("does not turn missing or unexpected segments into zero invocations", () => {
    const missing = clone(fixedInput());
    const missingSegments = missing.segments as Record<string, Uint8Array>;
    delete missingSegments["segment-b"];
    expectInconclusive(missing, "SEGMENT_MISSING");

    const unexpected = clone(fixedInput());
    (unexpected.segments as Record<string, Uint8Array>)["segment-extra"] =
      utf8Bytes("{}\n");
    expectInconclusive(unexpected, "SEGMENT_UNEXPECTED");
  });

  it("rejects timeout, incomplete close, and unfinished run metadata", () => {
    const timedOut = clone(fixedInput());
    (timedOut.completion as { timedOut: boolean }).timedOut = true;
    expectInconclusive(timedOut, "RUN_TIMEOUT");

    const closeFailure = clone(fixedInput());
    const statuses = (
      closeFailure.completion as {
        segmentCloses: { segmentId: string; complete: boolean }[];
      }
    ).segmentCloses;
    const first = statuses[0];
    if (first === undefined) throw new Error("missing close fixture");
    first.complete = false;
    expectInconclusive(closeFailure, "SEGMENT_CLOSE_INCOMPLETE");

    const noHash = clone(fixedInput());
    (noHash.completion as { hashFinalized: boolean }).hashFinalized = false;
    expectInconclusive(noHash, "HASH_FINALIZATION_INCOMPLETE");
  });

  it("rejects partial, blank, corrupt, noncanonical, and oversized lines", () => {
    const partial = clone(fixedInput());
    const partialSegments = partial.segments as Record<string, Uint8Array>;
    partialSegments["segment-a"] =
      partialSegments["segment-a"]?.slice(0, -1) ?? new Uint8Array();
    expectInconclusive(partial, "SEGMENT_NOT_LF_TERMINATED");

    const blank = clone(fixedInput());
    (blank.segments as Record<string, Uint8Array>)["segment-a"] =
      utf8Bytes("{}\n\n");
    expectInconclusive(blank, "SEGMENT_BLANK_LINE");

    const corrupt = clone(fixedInput());
    (corrupt.segments as Record<string, Uint8Array>)["segment-a"] =
      utf8Bytes("{\n");
    expectInconclusive(corrupt, "SEGMENT_JSON_INVALID");

    const noncanonical = clone(fixedInput());
    const noncanonicalSegments = noncanonical.segments as Record<
      string,
      Uint8Array
    >;
    noncanonicalSegments["segment-a"] = utf8Bytes(
      ` ${segmentText(noncanonicalSegments["segment-a"] ?? new Uint8Array())}`,
    );
    expectInconclusive(noncanonical, "SEGMENT_NONCANONICAL");

    const longLine = clone(fixedInput());
    (longLine.segments as Record<string, Uint8Array>)["segment-a"] = utf8Bytes(
      `${"x".repeat(MAX_EVENT_LINE_BYTES + 1)}\n`,
    );
    expectInconclusive(longLine, "SEGMENT_LINE_TOO_LARGE");

    const invalidUtf8 = clone(fixedInput());
    (invalidUtf8.segments as Record<string, Uint8Array>)["segment-a"] =
      new Uint8Array([0xc3, 0x28, 0x0a]);
    expectInconclusive(invalidUtf8, "SEGMENT_UTF8_INVALID");
  });

  it("rejects unknown event data and producer sequence gaps", () => {
    const unknown = clone(fixedInput());
    const unknownSegments = unknown.segments as Record<string, Uint8Array>;
    const event = JSON.parse(
      segmentText(unknownSegments["segment-a"] ?? utf8Bytes("{}")).trimEnd(),
    ) as Record<string, unknown>;
    event.rawSecret = "not-allowed";
    unknownSegments["segment-a"] = utf8Bytes(`${JSON.stringify(event)}\n`);
    expectInconclusive(unknown, "SEGMENT_EVENT_INVALID");

    const gap = replaceSegmentEvent(fixedInput(), "segment-a", (value) => ({
      ...value,
      producerSequence: 1,
    }));
    expectInconclusive(gap, "SEGMENT_SEQUENCE_INVALID");
  });

  it("enforces segment event and byte limits before partial adoption", () => {
    const tooMany = clone(fixedInput());
    const tooManySegments = tooMany.segments as Record<string, Uint8Array>;
    const line = tooManySegments["segment-a"] ?? new Uint8Array();
    tooManySegments["segment-a"] = utf8Bytes(
      segmentText(line).repeat(MAX_EVENTS_PER_SEGMENT + 1),
    );
    expectInconclusive(tooMany, "SEGMENT_EVENT_LIMIT_EXCEEDED");

    const tooLarge = clone(fixedInput());
    (tooLarge.segments as Record<string, Uint8Array>)["segment-a"] = utf8Bytes(
      `${"x".repeat(MAX_SEGMENT_BYTES)}\n`,
    );
    expectInconclusive(tooLarge, "SEGMENT_TOO_LARGE");
  });

  it("rejects custom prototypes and accessors at structural boundaries", () => {
    const customSnapshot = clone(fixedInput());
    Object.setPrototypeOf(customSnapshot.snapshot as object, {
      inherited: true,
    });
    expectInconclusive(customSnapshot, "INVALID_SCENARIO_SNAPSHOT");

    const accessorInput = clone(fixedInput()) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(accessorInput, "segments", {
      enumerable: true,
      get() {
        return {};
      },
    });
    expectInconclusive(accessorInput, "INVALID_COLLECTION_INPUT");

    const nonEnumerableUnknown = clone(fixedInput());
    Object.defineProperty(nonEnumerableUnknown.snapshot as object, "hidden", {
      enumerable: false,
      value: true,
    });
    expectInconclusive(nonEnumerableUnknown, "INVALID_SCENARIO_SNAPSHOT");

    const nonEnumerableAccessor = clone(fixedInput());
    Object.defineProperty(
      nonEnumerableAccessor.snapshot as object,
      "hiddenAccessor",
      {
        enumerable: false,
        get() {
          throw new Error("must not execute");
        },
      },
    );
    expectInconclusive(nonEnumerableAccessor, "INVALID_SCENARIO_SNAPSHOT");

    const completionUnknown = clone(fixedInput());
    Object.defineProperty(completionUnknown.completion as object, "hidden", {
      enumerable: false,
      value: true,
    });
    expectInconclusive(completionUnknown, "INVALID_RUN_COMPLETION");

    const segmentMetadataUnknown = clone(fixedInput());
    const firstSegment = (
      segmentMetadataUnknown.snapshot as { segments: object[] }
    ).segments[0];
    if (firstSegment === undefined) throw new Error("missing segment metadata");
    Object.defineProperty(firstSegment, "hidden", {
      enumerable: false,
      value: true,
    });
    expectInconclusive(segmentMetadataUnknown, "INVALID_SCENARIO_SNAPSHOT");

    const expectedUnknown = clone(fixedInput());
    Object.defineProperty(
      (expectedUnknown.snapshot as { expected: object }).expected,
      "hidden",
      {
        enumerable: false,
        value: true,
      },
    );
    expectInconclusive(expectedUnknown, "INVALID_SCENARIO_SNAPSHOT");

    const arrayUnknown = clone(fixedInput());
    const segmentDefinitions = (
      arrayUnknown.snapshot as { segments: unknown[] }
    ).segments;
    Object.defineProperty(segmentDefinitions, "hidden", {
      enumerable: false,
      value: true,
    });
    expectInconclusive(arrayUnknown, "INVALID_SCENARIO_SNAPSHOT");

    expectInconclusive(
      new Proxy(fixedInput() as object, {}),
      "INVALID_COLLECTION_INPUT",
    );
  });

  it("requires copied byte-sequence segment input", () => {
    const stringSegment = clone(fixedInput());
    (stringSegment.segments as Record<string, unknown>)["segment-a"] = "{}\n";
    expectInconclusive(stringSegment, "INVALID_COLLECTION_INPUT");

    const proxiedSegment = clone(fixedInput());
    const segments = proxiedSegment.segments as Record<string, Uint8Array>;
    const bytes = segments["segment-a"];
    if (bytes === undefined) throw new Error("missing segment fixture");
    segments["segment-a"] = new Proxy(bytes, {});
    expectInconclusive(proxiedSegment, "INVALID_COLLECTION_INPUT");
  });

  it("rejects duplicate producers and manifest context mismatches", () => {
    const duplicate = clone(fixedInput());
    const duplicateSegments = (
      duplicate.snapshot as {
        segments: { producerId: string }[];
      }
    ).segments;
    const first = duplicateSegments[0];
    const second = duplicateSegments[1];
    if (first === undefined || second === undefined) {
      throw new Error("missing producer fixture");
    }
    second.producerId = first.producerId;
    expectInconclusive(duplicate, "INVALID_SCENARIO_SNAPSHOT");

    const mismatch = clone(fixedInput());
    const mismatchSegment = (
      mismatch.snapshot as {
        segments: { producerId: string }[];
      }
    ).segments[0];
    if (mismatchSegment === undefined) {
      throw new Error("missing context fixture");
    }
    mismatchSegment.producerId = "producer-mismatch";
    expectInconclusive(mismatch, "INVALID_SCENARIO_SNAPSHOT");
  });
});
