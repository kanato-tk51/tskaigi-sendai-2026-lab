import {
  MAX_EVENTS_PER_SEGMENT,
  MAX_EVENT_LINE_BYTES,
  MAX_SEGMENT_BYTES,
  serializeProbeEvent,
  validateProbeEvent,
} from "@tskaigi-lab/probe-core";
import type { ProbeEvent } from "@tskaigi-lab/probe-core";
import { types } from "node:util";

import { assertRunComplete, validateRunCompletion } from "./completion.js";
import {
  CANONICAL_EVENT_SCHEMA_VERSION,
  EVIDENCE_LOCATIONS,
  MAX_RUN_SEGMENT_BYTES,
  RUN_METADATA_SCHEMA_VERSION,
  SUMMARY_SCHEMA_VERSION,
} from "./constants.js";
import { LabError, normalizeLabError } from "./errors.js";
import { reduceRun } from "./reducer.js";
import { assertExactKeys, compareIds, readPlainRecord } from "./safe-data.js";
import {
  renderComparison,
  serializeInconclusive,
  serializeJson,
} from "./renderer.js";
import { validateScenarioSnapshot } from "./scenario.js";
import type {
  CanonicalEventEnvelope,
  CollectionResult,
  CollectRunInput,
  InconclusiveRunMetadata,
  InconclusiveSummary,
  RunCompletion,
  ScenarioSnapshot,
  SegmentMetadata,
} from "./types.js";

interface ValidatedCollectionInput {
  readonly snapshot: ScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly segments: Readonly<Record<string, Uint8Array>>;
}

function validateSegmentBytes(
  input: unknown,
  snapshot: ScenarioSnapshot,
): Readonly<Record<string, Uint8Array>> {
  const value = readPlainRecord(input, "INVALID_COLLECTION_INPUT");
  const expectedIds = new Set(
    snapshot.segments.map((segment) => segment.segmentId),
  );
  const actualIds = Object.keys(value);
  if (actualIds.some((id) => !expectedIds.has(id))) {
    throw new LabError("SEGMENT_UNEXPECTED");
  }
  if (actualIds.length !== expectedIds.size) {
    throw new LabError("SEGMENT_MISSING");
  }
  const output: Record<string, Uint8Array> = Object.create(null);
  let totalBytes = 0;
  for (const segmentId of expectedIds) {
    const bytes = value[segmentId];
    if (
      typeof bytes !== "object" ||
      bytes === null ||
      types.isProxy(bytes) ||
      !types.isUint8Array(bytes)
    ) {
      throw new LabError("INVALID_COLLECTION_INPUT");
    }
    let copy: Uint8Array;
    try {
      copy = new Uint8Array(bytes);
    } catch {
      throw new LabError("INVALID_COLLECTION_INPUT");
    }
    totalBytes += copy.byteLength;
    if (totalBytes > MAX_RUN_SEGMENT_BYTES) {
      throw new LabError("SEGMENT_TOO_LARGE");
    }
    output[segmentId] = copy;
  }
  return Object.freeze(output);
}

function validateInput(input: unknown): ValidatedCollectionInput {
  const value = readPlainRecord(input, "INVALID_COLLECTION_INPUT");
  assertExactKeys(
    value,
    ["snapshot", "completion", "segments"],
    "INVALID_COLLECTION_INPUT",
  );
  const snapshot = validateScenarioSnapshot(value.snapshot);
  const completion = validateRunCompletion(value.completion);
  return Object.freeze({
    snapshot,
    completion,
    segments: validateSegmentBytes(value.segments, snapshot),
  });
}

function validateSegment(
  rawSegment: Uint8Array,
  definition: ScenarioSnapshot["segments"][number],
): readonly ProbeEvent[] {
  if (rawSegment.byteLength > MAX_SEGMENT_BYTES) {
    throw new LabError("SEGMENT_TOO_LARGE");
  }
  if (
    rawSegment.byteLength === 0 ||
    rawSegment[rawSegment.byteLength - 1] !== 0x0a
  ) {
    throw new LabError("SEGMENT_NOT_LF_TERMINATED");
  }
  const lines: Uint8Array[] = [];
  let lineStart = 0;
  for (let index = 0; index < rawSegment.byteLength; index += 1) {
    if (rawSegment[index] !== 0x0a) continue;
    if (index === lineStart) throw new LabError("SEGMENT_BLANK_LINE");
    lines.push(rawSegment.slice(lineStart, index));
    lineStart = index + 1;
  }
  if (lines.length > MAX_EVENTS_PER_SEGMENT) {
    throw new LabError("SEGMENT_EVENT_LIMIT_EXCEEDED");
  }
  const events: ProbeEvent[] = [];
  for (const [index, lineBytes] of lines.entries()) {
    if (lineBytes.byteLength + 1 > MAX_EVENT_LINE_BYTES) {
      throw new LabError("SEGMENT_LINE_TOO_LARGE");
    }
    let line: string;
    try {
      line = new TextDecoder("utf-8", {
        fatal: true,
        ignoreBOM: true,
      }).decode(lineBytes);
    } catch {
      throw new LabError("SEGMENT_UTF8_INVALID");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(line) as unknown;
    } catch {
      throw new LabError("SEGMENT_JSON_INVALID");
    }
    let event: ProbeEvent;
    let canonical: string;
    try {
      event = validateProbeEvent(parsed, definition.manifest);
      canonical = serializeProbeEvent(event, definition.manifest);
    } catch {
      throw new LabError("SEGMENT_EVENT_INVALID");
    }
    if (!Buffer.from(canonical, "utf8").equals(Buffer.from(lineBytes))) {
      throw new LabError("SEGMENT_NONCANONICAL");
    }
    if (event.producerSequence !== index) {
      throw new LabError("SEGMENT_SEQUENCE_INVALID");
    }
    events.push(event);
  }
  return Object.freeze(events);
}

function envelopeJson(envelope: CanonicalEventEnvelope): string {
  return JSON.stringify({
    schemaVersion: envelope.schemaVersion,
    globalSequence: envelope.globalSequence,
    event: envelope.event,
  });
}

function inconclusive(
  error: unknown,
  snapshot: ScenarioSnapshot | null,
  completion: RunCompletion | null,
): CollectionResult {
  const code = normalizeLabError(error);
  const metadata: InconclusiveRunMetadata = Object.freeze({
    schemaVersion: RUN_METADATA_SCHEMA_VERSION,
    runId: snapshot?.runId ?? null,
    scenarioId: snapshot?.scenarioId ?? null,
    evidenceClass: snapshot?.evidenceClass ?? null,
    profileId: snapshot?.profileId ?? null,
    validity: "inconclusive",
    timedOut: completion?.timedOut ?? false,
    errorCodes: Object.freeze([code]),
    ordering: null,
    runtimeContext: null,
    segments: null,
    evidenceLocations: Object.freeze({
      manifest: snapshot === null ? null : EVIDENCE_LOCATIONS.manifest,
      completion: completion === null ? null : EVIDENCE_LOCATIONS.completion,
      events: null,
      summary: EVIDENCE_LOCATIONS.summary,
      comparison: null,
      hashes: null,
      segments: EVIDENCE_LOCATIONS.segments,
    }),
  });
  const summary: InconclusiveSummary = Object.freeze({
    schemaVersion: SUMMARY_SCHEMA_VERSION,
    runId: snapshot?.runId ?? null,
    scenarioId: snapshot?.scenarioId ?? null,
    validity: "inconclusive",
    counts: null,
    processes: null,
    hashRecordCount: null,
    comparison: null,
    evidenceLocation: null,
    errorCodes: Object.freeze([code]),
  });
  const serialized = serializeInconclusive(metadata, summary);
  return Object.freeze({
    validity: "inconclusive",
    snapshot,
    completion,
    events: null,
    metadata,
    summary,
    hashes: null,
    eventsJsonl: null,
    metadataJson: serialized.metadataJson,
    summaryJson: serialized.summaryJson,
    hashesJson: null,
    comparisonMarkdown: null,
  });
}

export function collectRun(input: CollectRunInput | unknown): CollectionResult {
  let snapshot: ScenarioSnapshot | null = null;
  let completion: RunCompletion | null = null;
  try {
    const validated = validateInput(input);
    snapshot = validated.snapshot;
    completion = validated.completion;
    assertRunComplete(completion, snapshot);
    const definitions = [...snapshot.segments].sort((left, right) => {
      const producerOrder = compareIds(left.producerId, right.producerId);
      return producerOrder === 0
        ? compareIds(left.segmentId, right.segmentId)
        : producerOrder;
    });
    const envelopes: CanonicalEventEnvelope[] = [];
    const segmentMetadata: SegmentMetadata[] = [];
    for (const definition of definitions) {
      const rawSegment = validated.segments[definition.segmentId];
      if (rawSegment === undefined) throw new LabError("SEGMENT_MISSING");
      const events = validateSegment(rawSegment, definition);
      for (const event of events) {
        envelopes.push(
          Object.freeze({
            schemaVersion: CANONICAL_EVENT_SCHEMA_VERSION,
            globalSequence: envelopes.length,
            event,
          }),
        );
      }
      segmentMetadata.push(
        Object.freeze({
          segmentId: definition.segmentId,
          producerId: definition.producerId,
          eventCount: events.length,
          closeComplete: true,
        }),
      );
    }
    const reduced = reduceRun(snapshot, completion, envelopes, segmentMetadata);
    const frozenEnvelopes = Object.freeze(envelopes);
    return Object.freeze({
      validity: "complete",
      snapshot,
      completion,
      events: frozenEnvelopes,
      metadata: reduced.metadata,
      summary: reduced.summary,
      hashes: reduced.hashes,
      eventsJsonl:
        frozenEnvelopes.length === 0
          ? ""
          : `${frozenEnvelopes.map(envelopeJson).join("\n")}\n`,
      metadataJson: serializeJson(reduced.metadata),
      summaryJson: serializeJson(reduced.summary),
      hashesJson: serializeJson(reduced.hashes),
      comparisonMarkdown: renderComparison(reduced.summary),
    });
  } catch (error) {
    return inconclusive(error, snapshot, completion);
  }
}
