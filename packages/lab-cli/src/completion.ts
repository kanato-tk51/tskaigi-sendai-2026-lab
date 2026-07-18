import { RUN_COMPLETION_SCHEMA_VERSION } from "./constants.js";
import { LabError } from "./errors.js";
import {
  assertBoolean,
  assertExactKeys,
  assertId,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  RunCompletion,
  ScenarioSnapshot,
  SegmentCloseStatus,
} from "./types.js";

export function validateRunCompletion(input: unknown): RunCompletion {
  try {
    const value = readPlainRecord(input, "INVALID_RUN_COMPLETION");
    assertExactKeys(
      value,
      [
        "schemaVersion",
        "scenarioStarted",
        "toolTerminated",
        "scenarioEnded",
        "hashFinalized",
        "timedOut",
        "segmentCloses",
      ],
      "INVALID_RUN_COMPLETION",
    );
    if (value.schemaVersion !== RUN_COMPLETION_SCHEMA_VERSION) {
      throw new LabError("INVALID_RUN_COMPLETION");
    }
    const seen = new Set<string>();
    const segmentCloses: SegmentCloseStatus[] = [];
    for (const inputStatus of readPlainArray(
      value.segmentCloses,
      "INVALID_RUN_COMPLETION",
    )) {
      const status = readPlainRecord(inputStatus, "INVALID_RUN_COMPLETION");
      assertExactKeys(
        status,
        ["segmentId", "complete"],
        "INVALID_RUN_COMPLETION",
      );
      const segmentId = assertId(status.segmentId, "INVALID_RUN_COMPLETION");
      if (seen.has(segmentId)) {
        throw new LabError("INVALID_RUN_COMPLETION");
      }
      seen.add(segmentId);
      segmentCloses.push(
        Object.freeze({
          segmentId,
          complete: assertBoolean(status.complete, "INVALID_RUN_COMPLETION"),
        }),
      );
    }
    return Object.freeze({
      schemaVersion: RUN_COMPLETION_SCHEMA_VERSION,
      scenarioStarted: assertBoolean(
        value.scenarioStarted,
        "INVALID_RUN_COMPLETION",
      ),
      toolTerminated: assertBoolean(
        value.toolTerminated,
        "INVALID_RUN_COMPLETION",
      ),
      scenarioEnded: assertBoolean(
        value.scenarioEnded,
        "INVALID_RUN_COMPLETION",
      ),
      hashFinalized: assertBoolean(
        value.hashFinalized,
        "INVALID_RUN_COMPLETION",
      ),
      timedOut: assertBoolean(value.timedOut, "INVALID_RUN_COMPLETION"),
      segmentCloses: Object.freeze(segmentCloses),
    });
  } catch {
    throw new LabError("INVALID_RUN_COMPLETION");
  }
}

export function assertRunComplete(
  completion: RunCompletion,
  snapshot: ScenarioSnapshot,
): void {
  if (!completion.scenarioStarted) throw new LabError("RUN_NOT_STARTED");
  if (completion.timedOut) throw new LabError("RUN_TIMEOUT");
  if (!completion.toolTerminated) throw new LabError("TOOL_NOT_TERMINATED");
  if (!completion.scenarioEnded) throw new LabError("RUN_NOT_ENDED");
  if (!completion.hashFinalized) {
    throw new LabError("HASH_FINALIZATION_INCOMPLETE");
  }
  const expectedIds = new Set(
    snapshot.segments.map((segment) => segment.segmentId),
  );
  if (
    completion.segmentCloses.length !== expectedIds.size ||
    completion.segmentCloses.some(
      (status) => !expectedIds.has(status.segmentId),
    )
  ) {
    throw new LabError("INVALID_RUN_COMPLETION");
  }
  if (completion.segmentCloses.some((status) => !status.complete)) {
    throw new LabError("SEGMENT_CLOSE_INCOMPLETE");
  }
}
