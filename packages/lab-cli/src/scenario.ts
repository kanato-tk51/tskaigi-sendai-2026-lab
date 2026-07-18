import {
  ATTEMPT_TYPES,
  EVENT_KINDS,
  OUTCOMES,
  TOOL_API_CHANGE_KINDS,
  validateProbeManifest,
} from "@tskaigi-lab/probe-core";
import type {
  AttemptType,
  EventKind,
  Outcome,
  ToolApiChangeKind,
} from "@tskaigi-lab/probe-core";

import {
  FIXED_EVIDENCE_CLASS,
  FIXED_PROFILE_ID,
  FIXED_RESULTS_LOCATION,
  MAX_SEGMENTS_PER_RUN,
  SCENARIO_DEFINITION_SCHEMA_VERSION,
  SCENARIO_SNAPSHOT_SCHEMA_VERSION,
} from "./constants.js";
import { LabError } from "./errors.js";
import {
  assertCount,
  assertExactKeys,
  assertId,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  CountExpectation,
  HashDeltaExpectation,
  HashDeltaState,
  HashEvidenceKind,
  OutcomeCountExpectation,
  ScenarioDefinition,
  ScenarioExpected,
  ScenarioSnapshot,
  SegmentDefinition,
} from "./types.js";

const HASH_EVIDENCE_KINDS = ["file-hash", "tool-api-change"] as const;
const HASH_CLASSIFICATIONS = ["source", "artifact"] as const;
const HASH_DELTA_STATES = ["changed", "unchanged", "unavailable"] as const;

function parseCountExpectations<T extends string>(
  input: unknown,
  allowedIds: readonly T[] | null,
): readonly CountExpectation<T>[] {
  const values = readPlainArray(input, "INVALID_SCENARIO_SNAPSHOT");
  const seen = new Set<string>();
  const output = values.map((inputValue) => {
    const value = readPlainRecord(inputValue, "INVALID_SCENARIO_SNAPSHOT");
    assertExactKeys(value, ["id", "count"], "INVALID_SCENARIO_SNAPSHOT");
    const id = assertId(value.id, "INVALID_SCENARIO_SNAPSHOT") as T;
    if (seen.has(id) || (allowedIds !== null && !allowedIds.includes(id))) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    seen.add(id);
    return Object.freeze({
      id,
      count: assertCount(value.count, "INVALID_SCENARIO_SNAPSHOT"),
    });
  });
  if (
    allowedIds !== null &&
    (output.length !== allowedIds.length ||
      allowedIds.some((id) => !seen.has(id)))
  ) {
    throw new LabError("INVALID_SCENARIO_SNAPSHOT");
  }
  return Object.freeze(output);
}

function parseOutcomeExpectations<T extends string>(
  input: unknown,
  allowedIds: readonly T[],
): readonly OutcomeCountExpectation<T>[] {
  const seen = new Set<string>();
  const output = readPlainArray(input, "INVALID_SCENARIO_SNAPSHOT").map(
    (inputValue) => {
      const value = readPlainRecord(inputValue, "INVALID_SCENARIO_SNAPSHOT");
      assertExactKeys(
        value,
        ["id", "outcome", "count"],
        "INVALID_SCENARIO_SNAPSHOT",
      );
      const id = assertId(value.id, "INVALID_SCENARIO_SNAPSHOT") as T;
      if (
        !allowedIds.includes(id) ||
        !OUTCOMES.includes(value.outcome as Outcome)
      ) {
        throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      }
      const outcome = value.outcome as Outcome;
      const key = `${id}\0${outcome}`;
      if (seen.has(key)) throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      seen.add(key);
      return Object.freeze({
        id,
        outcome,
        count: assertCount(value.count, "INVALID_SCENARIO_SNAPSHOT"),
      });
    },
  );
  return Object.freeze(output);
}

function parseHashExpectations(
  input: unknown,
): readonly HashDeltaExpectation[] {
  const seen = new Set<string>();
  const output = readPlainArray(input, "INVALID_SCENARIO_SNAPSHOT").map(
    (inputValue) => {
      const value = readPlainRecord(inputValue, "INVALID_SCENARIO_SNAPSHOT");
      assertExactKeys(
        value,
        ["evidenceKind", "classification", "state", "count"],
        "INVALID_SCENARIO_SNAPSHOT",
      );
      if (
        !HASH_EVIDENCE_KINDS.includes(value.evidenceKind as HashEvidenceKind) ||
        !HASH_CLASSIFICATIONS.includes(
          value.classification as "source" | "artifact",
        ) ||
        !HASH_DELTA_STATES.includes(value.state as HashDeltaState)
      ) {
        throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      }
      const evidenceKind = value.evidenceKind as HashEvidenceKind;
      const classification = value.classification as "source" | "artifact";
      const state = value.state as HashDeltaState;
      const key = `${evidenceKind}\0${classification}\0${state}`;
      if (seen.has(key)) throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      seen.add(key);
      return Object.freeze({
        evidenceKind,
        classification,
        state,
        count: assertCount(value.count, "INVALID_SCENARIO_SNAPSHOT"),
      });
    },
  );
  return Object.freeze(output);
}

function parseExpected(input: unknown): ScenarioExpected {
  const value = readPlainRecord(input, "INVALID_SCENARIO_SNAPSHOT");
  assertExactKeys(
    value,
    [
      "totalEvents",
      "eventKinds",
      "routePhases",
      "attemptOutcomes",
      "toolChangeOutcomes",
      "hashDeltas",
    ],
    "INVALID_SCENARIO_SNAPSHOT",
  );
  const totalEvents = assertCount(
    value.totalEvents,
    "INVALID_SCENARIO_SNAPSHOT",
  );
  const eventKinds = parseCountExpectations<EventKind>(
    value.eventKinds,
    EVENT_KINDS,
  );
  if (
    eventKinds.reduce((total, expectation) => total + expectation.count, 0) !==
    totalEvents
  ) {
    throw new LabError("INVALID_SCENARIO_SNAPSHOT");
  }
  return Object.freeze({
    totalEvents,
    eventKinds,
    routePhases: parseCountExpectations(value.routePhases, null),
    attemptOutcomes: parseOutcomeExpectations<AttemptType>(
      value.attemptOutcomes,
      ATTEMPT_TYPES,
    ),
    toolChangeOutcomes: parseOutcomeExpectations<ToolApiChangeKind>(
      value.toolChangeOutcomes,
      TOOL_API_CHANGE_KINDS,
    ),
    hashDeltas: parseHashExpectations(value.hashDeltas),
  });
}

export function validateScenarioDefinition(input: unknown): ScenarioDefinition {
  try {
    const value = readPlainRecord(input, "INVALID_SCENARIO_DEFINITION");
    assertExactKeys(
      value,
      [
        "schemaVersion",
        "scenarioId",
        "evidenceClass",
        "profileId",
        "outputLocation",
        "expected",
      ],
      "INVALID_SCENARIO_DEFINITION",
    );
    if (
      value.schemaVersion !== SCENARIO_DEFINITION_SCHEMA_VERSION ||
      value.evidenceClass !== FIXED_EVIDENCE_CLASS ||
      value.profileId !== FIXED_PROFILE_ID ||
      value.outputLocation !== FIXED_RESULTS_LOCATION
    ) {
      throw new LabError("INVALID_SCENARIO_DEFINITION");
    }
    return Object.freeze({
      schemaVersion: SCENARIO_DEFINITION_SCHEMA_VERSION,
      scenarioId: assertId(value.scenarioId, "INVALID_SCENARIO_DEFINITION"),
      evidenceClass: FIXED_EVIDENCE_CLASS,
      profileId: FIXED_PROFILE_ID,
      outputLocation: FIXED_RESULTS_LOCATION,
      expected: parseExpected(value.expected),
    });
  } catch {
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
}

export function validateScenarioSnapshot(input: unknown): ScenarioSnapshot {
  try {
    const value = readPlainRecord(input, "INVALID_SCENARIO_SNAPSHOT");
    assertExactKeys(
      value,
      [
        "schemaVersion",
        "runId",
        "scenarioId",
        "evidenceClass",
        "profileId",
        "outputLocation",
        "expected",
        "segments",
      ],
      "INVALID_SCENARIO_SNAPSHOT",
    );
    if (
      value.schemaVersion !== SCENARIO_SNAPSHOT_SCHEMA_VERSION ||
      value.evidenceClass !== FIXED_EVIDENCE_CLASS ||
      value.profileId !== FIXED_PROFILE_ID ||
      value.outputLocation !== FIXED_RESULTS_LOCATION
    ) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    const runId = assertId(value.runId, "INVALID_SCENARIO_SNAPSHOT");
    const scenarioId = assertId(value.scenarioId, "INVALID_SCENARIO_SNAPSHOT");
    const seenSegments = new Set<string>();
    const seenProducers = new Set<string>();
    const segments: SegmentDefinition[] = [];
    const segmentInputs = readPlainArray(
      value.segments,
      "INVALID_SCENARIO_SNAPSHOT",
    );
    if (segmentInputs.length > MAX_SEGMENTS_PER_RUN) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    for (const segmentInput of segmentInputs) {
      const segment = readPlainRecord(
        segmentInput,
        "INVALID_SCENARIO_SNAPSHOT",
      );
      assertExactKeys(
        segment,
        ["segmentId", "producerId", "manifest"],
        "INVALID_SCENARIO_SNAPSHOT",
      );
      const segmentId = assertId(
        segment.segmentId,
        "INVALID_SCENARIO_SNAPSHOT",
      );
      const producerId = assertId(
        segment.producerId,
        "INVALID_SCENARIO_SNAPSHOT",
      );
      if (seenSegments.has(segmentId) || seenProducers.has(producerId)) {
        throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      }
      const manifest = validateProbeManifest(segment.manifest);
      if (
        manifest.runId !== runId ||
        manifest.scenarioId !== scenarioId ||
        manifest.producerId !== producerId
      ) {
        throw new LabError("INVALID_SCENARIO_SNAPSHOT");
      }
      seenSegments.add(segmentId);
      seenProducers.add(producerId);
      segments.push(Object.freeze({ segmentId, producerId, manifest }));
    }
    const expected = parseExpected(value.expected);
    const allowedPhases = new Set(
      segments.flatMap((segment) => segment.manifest.phases),
    );
    if (
      expected.routePhases.some(
        (expectation) => !allowedPhases.has(expectation.id),
      )
    ) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    return Object.freeze({
      schemaVersion: SCENARIO_SNAPSHOT_SCHEMA_VERSION,
      runId,
      scenarioId,
      evidenceClass: FIXED_EVIDENCE_CLASS,
      profileId: FIXED_PROFILE_ID,
      outputLocation: FIXED_RESULTS_LOCATION,
      expected,
      segments: Object.freeze(segments),
    });
  } catch {
    throw new LabError("INVALID_SCENARIO_SNAPSHOT");
  }
}
