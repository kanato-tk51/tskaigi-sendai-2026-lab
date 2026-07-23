import { NORMALIZED_ERROR_CODES, OUTCOMES } from "@tskaigi-lab/probe-core";
import type { NormalizedErrorCode, Outcome } from "@tskaigi-lab/probe-core";

import type { SelectedProfileId, SelectedScenarioId } from "./plan.js";

export type ViteScenarioId = Extract<SelectedScenarioId, `vite-${string}`>;

export interface ViteSelectedEventInput {
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

export interface ViteProfileProjection {
  readonly schemaVersion: "p2-vite-profile-summary/v1";
  readonly scenarioId: ViteScenarioId;
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
  readonly limitations: readonly "CONSTRAINED_CHILD_REQUIRED_BY_TOOL"[];
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
  "route-invocation:vite-late-plugin-module-checkpoint",
  "route-invocation:vite-plugin-factory",
  "route-invocation:vite-build-start",
  "capability-attempt:vite-attempt-environment",
  "capability-attempt:vite-attempt-file-read",
  "capability-attempt:vite-attempt-file-hash",
  "capability-attempt:vite-attempt-file-write",
  "capability-attempt:vite-attempt-loopback",
  "capability-attempt:vite-attempt-child",
  "route-invocation:vite-designated-transform",
  "tool-api-change:vite-module-transform-change",
  "route-invocation:vite-generate-bundle",
  "tool-api-change:vite-emitted-asset-change",
  "tool-api-change:vite-bundle-mutation-change",
  "route-invocation:vite-write-bundle",
] as const);

const ATTEMPT_IDS = Object.freeze([
  "vite-attempt-environment",
  "vite-attempt-file-read",
  "vite-attempt-file-hash",
  "vite-attempt-file-write",
  "vite-attempt-loopback",
  "vite-attempt-child",
] as const);

const SELECTED_TUPLES = Object.freeze({
  "vite-observe-p": Object.freeze({
    profileId: "permissive",
    runId: "p2-vite-observe-p-20260723-01",
  }),
  "vite-observe-c": Object.freeze({
    profileId: "constrained",
    runId: "p2-vite-observe-c-20260723-01",
  }),
} as const);

function eventOrderValue(event: ViteSelectedEventInput): string | null {
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

function parseSelectedEvent(value: unknown): ViteSelectedEventInput | null {
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
  const eventKind = value.eventKind as ViteSelectedEventInput["eventKind"];
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
  if (
    profileId === "permissive" ||
    attemptId === ATTEMPT_IDS[2] ||
    attemptId === ATTEMPT_IDS[5]
  ) {
    return outcome === "success" && code === null;
  }
  const expectedCodes: Readonly<
    Record<string, readonly NormalizedErrorCode[]>
  > = {
    [ATTEMPT_IDS[0]]: ["ENVIRONMENT_VARIABLE_ABSENT"],
    [ATTEMPT_IDS[1]]: ["FILE_NOT_FOUND", "READ_DENIED"],
    [ATTEMPT_IDS[3]]: ["WRITE_DENIED"],
    [ATTEMPT_IDS[4]]: ["NETWORK_FAILURE", "NETWORK_TIMEOUT"],
  };
  return (
    outcome === "failure" &&
    code !== null &&
    expectedCodes[attemptId]?.includes(code) === true
  );
}

export function projectViteProfileEvents(input: {
  readonly scenarioId: ViteScenarioId;
  readonly profileId: SelectedProfileId;
  readonly runId: string;
  readonly events: readonly ViteSelectedEventInput[];
}): ViteProfileProjection {
  const issues: ViteProfileProjection["issues"][number][] = [];
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
    route.length !== 6 ||
    capability.length !== 6 ||
    tool.length !== 3 ||
    input.events.length !== 15
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
    schemaVersion: "p2-vite-profile-summary/v1",
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
    limitations: Object.freeze(
      input.profileId === "constrained"
        ? (["CONSTRAINED_CHILD_REQUIRED_BY_TOOL"] as const)
        : [],
    ),
    issues: Object.freeze(issues),
  });
}

export function projectViteProfileSegment(input: {
  readonly scenarioId: ViteScenarioId;
  readonly profileId: SelectedProfileId;
  readonly runId: string;
  readonly rawSegment: string;
}): ViteProfileProjection {
  let events: readonly ViteSelectedEventInput[] = [];
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
  return projectViteProfileEvents({
    scenarioId: input.scenarioId,
    profileId: input.profileId,
    runId: input.runId,
    events,
  });
}
