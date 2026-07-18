import { NORMALIZED_ERROR_CODES, OUTCOMES } from "@tskaigi-lab/probe-core";
import type { NormalizedErrorCode, Outcome } from "@tskaigi-lab/probe-core";

import type { SelectedProfileId, SelectedScenarioId } from "./plan.js";

export type CodegenScenarioId = Extract<
  SelectedScenarioId,
  `codegen-${string}`
>;

export interface SelectedEventInput {
  readonly eventKind:
    "route-invocation" | "capability-attempt" | "tool-api-change";
  readonly runId: string;
  readonly scenarioId: string;
  readonly producerSequence: number;
  readonly outcome: Outcome;
  readonly normalizedErrorCode: NormalizedErrorCode | null;
  readonly routeInvocationId?: string;
  readonly attemptId?: string;
  readonly toolApiChangeId?: string;
}

export interface CodegenProfileProjection {
  readonly schemaVersion: "p2-codegen-profile-summary/v1";
  readonly scenarioId: CodegenScenarioId;
  readonly profileId: SelectedProfileId;
  readonly runId: string | null;
  readonly validity: "matches-expected" | "mismatch" | "inconclusive";
  readonly counts: Readonly<{
    route: number;
    capability: number;
    toolApiChange: number;
    total: number;
  }>;
  readonly attempts: readonly Readonly<{
    attemptId: string;
    outcome: Outcome;
    normalizedErrorCode: NormalizedErrorCode | null;
  }>[];
  readonly issues: readonly (
    | "IDENTITY_OR_ORDER_MISMATCH"
    | "COUNT_MISMATCH"
    | "ROUTE_OR_TOOL_MISMATCH"
    | "CAPABILITY_OUTCOME_MISMATCH"
    | "RUNTIME_SUMMARY_MISMATCH"
  )[];
}

const MAX_RAW_SEGMENT_BYTES = 65_536;
const MAX_RAW_EVENTS = 32;
const normalizedErrorCodes = new Set<string>(NORMALIZED_ERROR_CODES);
const outcomes = new Set<string>(OUTCOMES);
const EXPECTED_EVENT_ORDER = Object.freeze([
  "route-invocation:codegen-cli-startup",
  "route-invocation:codegen-argument-parse",
  "route-invocation:codegen-generation-start",
  "capability-attempt:codegen-attempt-environment",
  "capability-attempt:codegen-attempt-file-read",
  "capability-attempt:codegen-attempt-file-hash",
  "capability-attempt:codegen-attempt-file-write",
  "capability-attempt:codegen-attempt-loopback",
  "capability-attempt:codegen-attempt-child",
  "tool-api-change:codegen-generation-api-change",
  "route-invocation:codegen-file-write",
  "route-invocation:codegen-completion",
] as const);

const ATTEMPT_IDS = Object.freeze([
  "codegen-attempt-environment",
  "codegen-attempt-file-read",
  "codegen-attempt-file-hash",
  "codegen-attempt-file-write",
  "codegen-attempt-loopback",
  "codegen-attempt-child",
] as const);

const SELECTED_TUPLES = Object.freeze({
  "codegen-observe-p": Object.freeze({
    profileId: "permissive",
    runId: "p2-codegen-observe-p-20260719-01",
  }),
  "codegen-observe-c": Object.freeze({
    profileId: "constrained",
    runId: "p2-codegen-observe-c-20260719-01",
  }),
} as const);

function eventOrderValue(event: SelectedEventInput): string | null {
  if (event.eventKind === "route-invocation") {
    return event.routeInvocationId === undefined
      ? null
      : `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return event.attemptId === undefined
      ? null
      : `${event.eventKind}:${event.attemptId}`;
  }
  return event.toolApiChangeId === undefined
    ? null
    : `${event.eventKind}:${event.toolApiChangeId}`;
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function boundedString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

function parseSelectedEvent(value: unknown): SelectedEventInput | null {
  if (
    !plainRecord(value) ||
    !["route-invocation", "capability-attempt", "tool-api-change"].includes(
      value.eventKind as string,
    ) ||
    !boundedString(value.runId) ||
    !boundedString(value.scenarioId) ||
    !Number.isInteger(value.producerSequence) ||
    (value.producerSequence as number) < 0 ||
    !outcomes.has(value.outcome as string) ||
    !(
      value.normalizedErrorCode === null ||
      normalizedErrorCodes.has(value.normalizedErrorCode as string)
    )
  ) {
    return null;
  }
  const eventKind = value.eventKind as SelectedEventInput["eventKind"];
  const id =
    eventKind === "route-invocation"
      ? value.routeInvocationId
      : eventKind === "capability-attempt"
        ? value.attemptId
        : value.toolApiChangeId;
  if (!boundedString(id)) {
    return null;
  }
  return Object.freeze({
    eventKind,
    runId: value.runId,
    scenarioId: value.scenarioId,
    producerSequence: value.producerSequence as number,
    outcome: value.outcome as Outcome,
    normalizedErrorCode:
      value.normalizedErrorCode as NormalizedErrorCode | null,
    ...(eventKind === "route-invocation"
      ? { routeInvocationId: id }
      : eventKind === "capability-attempt"
        ? { attemptId: id }
        : { toolApiChangeId: id }),
  });
}

function expectedCapability(
  profileId: SelectedProfileId,
  attemptId: string,
  outcome: Outcome,
  code: NormalizedErrorCode | null,
): boolean {
  if (profileId === "permissive" || attemptId === ATTEMPT_IDS[2]) {
    return outcome === "success" && code === null;
  }
  const expectedCodes: Readonly<
    Record<string, readonly NormalizedErrorCode[]>
  > = {
    [ATTEMPT_IDS[0]]: ["ENVIRONMENT_VARIABLE_ABSENT"],
    [ATTEMPT_IDS[1]]: ["FILE_NOT_FOUND", "READ_DENIED"],
    [ATTEMPT_IDS[3]]: ["WRITE_DENIED"],
    [ATTEMPT_IDS[4]]: ["NETWORK_FAILURE", "NETWORK_TIMEOUT"],
    [ATTEMPT_IDS[5]]: ["CHILD_PROCESS_FAILURE"],
  };
  return (
    outcome === "failure" &&
    code !== null &&
    expectedCodes[attemptId]?.includes(code) === true
  );
}

export function projectCodegenProfileEvents(input: {
  readonly scenarioId: CodegenScenarioId;
  readonly profileId: SelectedProfileId;
  readonly runId: string;
  readonly events: readonly SelectedEventInput[];
}): CodegenProfileProjection {
  const issues: CodegenProfileProjection["issues"][number][] = [];
  const route = input.events.filter(
    (event) => event.eventKind === "route-invocation",
  );
  const capability = input.events.filter(
    (event) => event.eventKind === "capability-attempt",
  );
  const tool = input.events.filter(
    (event) => event.eventKind === "tool-api-change",
  );
  const selectedTuple = SELECTED_TUPLES[input.scenarioId];
  const tupleMatches =
    selectedTuple.profileId === input.profileId &&
    selectedTuple.runId === input.runId;

  if (
    !tupleMatches ||
    input.events.some(
      (event, index) =>
        event.runId !== input.runId ||
        event.scenarioId !== input.scenarioId ||
        event.producerSequence !== index ||
        eventOrderValue(event) !== EXPECTED_EVENT_ORDER[index],
    )
  ) {
    issues.push("IDENTITY_OR_ORDER_MISMATCH");
  }
  if (
    route.length !== 5 ||
    capability.length !== 6 ||
    tool.length !== 1 ||
    input.events.length !== 12
  ) {
    issues.push("COUNT_MISMATCH");
  }
  if (
    route.some(
      (event) =>
        event.outcome !== "success" || event.normalizedErrorCode !== null,
    ) ||
    tool.some(
      (event) =>
        event.outcome !== "skipped" ||
        event.normalizedErrorCode !== "NOT_APPLICABLE",
    )
  ) {
    issues.push("ROUTE_OR_TOOL_MISMATCH");
  }
  if (
    capability.some(
      (event) =>
        event.attemptId === undefined ||
        !expectedCapability(
          input.profileId,
          event.attemptId,
          event.outcome,
          event.normalizedErrorCode,
        ),
    )
  ) {
    issues.push("CAPABILITY_OUTCOME_MISMATCH");
  }

  const structuralMismatch = issues.some((issue) =>
    [
      "IDENTITY_OR_ORDER_MISMATCH",
      "COUNT_MISMATCH",
      "ROUTE_OR_TOOL_MISMATCH",
    ].includes(issue),
  );
  return Object.freeze({
    schemaVersion: "p2-codegen-profile-summary/v1",
    scenarioId: input.scenarioId,
    profileId: input.profileId,
    runId: tupleMatches ? input.runId : null,
    validity: structuralMismatch
      ? "inconclusive"
      : issues.includes("CAPABILITY_OUTCOME_MISMATCH")
        ? "mismatch"
        : "matches-expected",
    counts: Object.freeze({
      route: route.length,
      capability: capability.length,
      toolApiChange: tool.length,
      total: input.events.length,
    }),
    attempts: Object.freeze(
      capability.map((event) =>
        Object.freeze({
          attemptId:
            ATTEMPT_IDS.find((attemptId) => attemptId === event.attemptId) ??
            "INVALID_ATTEMPT",
          outcome: event.outcome,
          normalizedErrorCode: event.normalizedErrorCode,
        }),
      ),
    ),
    issues: Object.freeze(issues),
  });
}

export function projectCodegenProfileSegment(input: {
  readonly scenarioId: CodegenScenarioId;
  readonly profileId: SelectedProfileId;
  readonly runId: string;
  readonly rawSegment: string;
}): CodegenProfileProjection {
  let events: readonly SelectedEventInput[] = [];
  if (
    Buffer.byteLength(input.rawSegment) <= MAX_RAW_SEGMENT_BYTES &&
    input.rawSegment.endsWith("\n")
  ) {
    const lines = input.rawSegment.slice(0, -1).split("\n");
    if (
      lines.length <= MAX_RAW_EVENTS &&
      lines.every((line) => line.length > 0)
    ) {
      try {
        const parsed = lines.map((line) =>
          parseSelectedEvent(JSON.parse(line)),
        );
        if (parsed.every((event) => event !== null)) {
          events = parsed;
        }
      } catch {
        events = [];
      }
    }
  }
  return projectCodegenProfileEvents({
    scenarioId: input.scenarioId,
    profileId: input.profileId,
    runId: input.runId,
    events,
  });
}
