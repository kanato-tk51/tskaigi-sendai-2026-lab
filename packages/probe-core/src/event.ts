import {
  ATTEMPT_TYPES,
  EVENT_KINDS,
  INVOCATION_KINDS,
  MAX_EVENT_LINE_BYTES,
  MAX_ID_LENGTH,
  MAX_VERSION_LENGTH,
  NORMALIZED_ERROR_CODES,
  NETWORK_CANARY_BODY,
  NETWORK_CANARY_STATUS,
  OUTCOMES,
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MARKER_SCHEMA_VERSION,
  ROUTES,
  TOOL_API_CHANGE_KINDS,
  TRIGGER_TYPES,
} from "./constants.js";
import { ProbeError } from "./errors.js";
import {
  frozenNullRecord,
  readPlainRecord,
  snapshotPlainRecord,
} from "./safe-data.js";
import type {
  CapabilityAttempt,
  CapabilityAttemptEvent,
  NormalizedErrorCode,
  ProbeEvent,
  ProbeEventDetails,
  ProbeManifest,
  RouteInvocationDefinition,
  RouteInvocationEvent,
  Sha256Digest,
  ToolApiChangeDefinition,
  ToolApiChangeEvent,
  ToolApiTarget,
} from "./types.js";
import { validateProbeManifest } from "./validation.js";

const commonKeys = [
  "schemaVersion",
  "eventKind",
  "runId",
  "scenarioId",
  "route",
  "phase",
  "triggerType",
  "adapterVersion",
  "producerId",
  "producerSequence",
  "timestamp",
  "durationMs",
  "pid",
  "ppid",
  "workerId",
  "cwdId",
  "nodeVersion",
  "toolName",
  "toolVersion",
  "outcome",
  "normalizedErrorCode",
] as const;

const capabilityEventKeys = [
  ...commonKeys,
  "attemptId",
  "attemptType",
  "targetId",
  "beforeHash",
  "afterHash",
  "details",
] as const;

const routeInvocationEventKeys = [
  ...commonKeys,
  "routeInvocationId",
  "invocationKind",
  "logicalUnitId",
] as const;

const toolApiChangeEventKeys = [
  ...commonKeys,
  "toolApiChangeId",
  "changeKind",
  "targetId",
  "targetClassification",
  "changed",
  "beforeHash",
  "afterHash",
  "byteSizeBefore",
  "byteSizeAfter",
] as const;

const capabilityDraftKeys = [
  "attemptId",
  "attemptType",
  "targetId",
  "outcome",
  "normalizedErrorCode",
  "beforeHash",
  "afterHash",
  "details",
  "durationMs",
] as const;

const routeInvocationDraftKeys = [
  "routeInvocationId",
  "outcome",
  "durationMs",
] as const;

const toolApiChangeDraftKeys = [
  "toolApiChangeId",
  "outcome",
  "changed",
  "beforeHash",
  "afterHash",
  "byteSizeBefore",
  "byteSizeAfter",
  "durationMs",
] as const;

const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const versionPattern = /^[A-Za-z0-9][A-Za-z0-9._+-]*$/u;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const sha256Pattern = /^sha256:[a-f0-9]{64}$/u;

const attemptFailureCodes: Readonly<
  Record<
    CapabilityAttemptEvent["attemptType"],
    ReadonlySet<NormalizedErrorCode>
  >
> = {
  "environment-canary-read": new Set([
    "ENVIRONMENT_VARIABLE_ABSENT",
    "INTERNAL_ERROR",
  ]),
  "canary-file-read": new Set([
    "INVALID_TARGET",
    "PATH_OUTSIDE_ALLOWED_ROOT",
    "PATH_TRAVERSAL",
    "SYMLINK_ESCAPE",
    "FILE_NOT_FOUND",
    "FILE_ALREADY_EXISTS",
    "FILE_TOO_LARGE",
    "FILE_NOT_REGULAR",
    "READ_DENIED",
    "INTERNAL_ERROR",
  ]),
  "direct-filesystem-write": new Set([
    "INVALID_TARGET",
    "PATH_OUTSIDE_ALLOWED_ROOT",
    "PATH_TRAVERSAL",
    "SYMLINK_ESCAPE",
    "FILE_NOT_FOUND",
    "FILE_ALREADY_EXISTS",
    "FILE_TOO_LARGE",
    "FILE_NOT_REGULAR",
    "WRITE_DENIED",
    "INTERNAL_ERROR",
  ]),
  "loopback-connect": new Set([
    "NETWORK_TIMEOUT",
    "NETWORK_FAILURE",
    "NETWORK_PROTOCOL_ERROR",
    "NETWORK_RESPONSE_TOO_LARGE",
    "INTERNAL_ERROR",
  ]),
  "child-node-process": new Set([
    "CHILD_PROCESS_TIMEOUT",
    "CHILD_PROCESS_FAILURE",
    "CHILD_OUTPUT_TOO_LARGE",
    "INTERNAL_ERROR",
  ]),
  "file-hash": new Set([
    "INVALID_TARGET",
    "PATH_OUTSIDE_ALLOWED_ROOT",
    "PATH_TRAVERSAL",
    "SYMLINK_ESCAPE",
    "FILE_NOT_FOUND",
    "FILE_TOO_LARGE",
    "FILE_NOT_REGULAR",
    "HASH_DENIED",
    "INTERNAL_ERROR",
  ]),
};

function fail(): never {
  throw new ProbeError("SERIALIZATION_FAILURE");
}

function isId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH &&
    idPattern.test(value)
  );
}

function isVersion(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_VERSION_LENGTH &&
    versionPattern.test(value)
  );
}

function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isNonnegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && sha256Pattern.test(value);
}

function assertExactKeys(
  value: Readonly<Record<string, unknown>>,
  expectedKeys: readonly string[],
): void {
  const expected = new Set(expectedKeys);
  const actual = Object.keys(value);
  if (
    actual.length !== expectedKeys.length ||
    actual.some((key) => !expected.has(key))
  ) {
    fail();
  }
}

function canonicalDetails(
  input: unknown,
  attemptType: CapabilityAttemptEvent["attemptType"],
  outcome: CapabilityAttemptEvent["outcome"],
): ProbeEventDetails {
  if (outcome === "skipped") {
    const details = readPlainRecord(input, ["kind"], "SERIALIZATION_FAILURE");
    if (details.kind !== "skipped") {
      return fail();
    }
    return frozenNullRecord({ kind: "skipped" as const });
  }

  switch (attemptType) {
    case "environment-canary-read": {
      const details = readPlainRecord(
        input,
        ["kind", "present", "byteLength"],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "environment" ||
        typeof details.present !== "boolean" ||
        !(
          details.byteLength === null ||
          isNonnegativeInteger(details.byteLength)
        )
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "environment" as const,
        present: details.present,
        byteLength: details.byteLength,
      });
    }
    case "canary-file-read": {
      const details = readPlainRecord(
        input,
        ["kind", "present", "regularFile", "readSucceeded", "sizeBytes"],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "file-read" ||
        typeof details.present !== "boolean" ||
        typeof details.regularFile !== "boolean" ||
        typeof details.readSucceeded !== "boolean" ||
        !(details.sizeBytes === null || isNonnegativeInteger(details.sizeBytes))
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "file-read" as const,
        present: details.present,
        regularFile: details.regularFile,
        readSucceeded: details.readSucceeded,
        sizeBytes: details.sizeBytes,
      });
    }
    case "direct-filesystem-write": {
      const details = readPlainRecord(
        input,
        ["kind", "markerSchemaVersion"],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "file-write" ||
        details.markerSchemaVersion !== PROBE_MARKER_SCHEMA_VERSION
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "file-write" as const,
        markerSchemaVersion: PROBE_MARKER_SCHEMA_VERSION,
      });
    }
    case "loopback-connect": {
      const details = readPlainRecord(
        input,
        ["kind", "statusCode", "timedOut", "protocolVerified", "bodyBytes"],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "loopback" ||
        !(
          details.statusCode === null ||
          (isNonnegativeInteger(details.statusCode) &&
            details.statusCode >= 100 &&
            details.statusCode <= 599)
        ) ||
        typeof details.timedOut !== "boolean" ||
        typeof details.protocolVerified !== "boolean" ||
        !isNonnegativeInteger(details.bodyBytes)
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "loopback" as const,
        statusCode: details.statusCode,
        timedOut: details.timedOut,
        protocolVerified: details.protocolVerified,
        bodyBytes: details.bodyBytes,
      });
    }
    case "child-node-process": {
      const details = readPlainRecord(
        input,
        [
          "kind",
          "exitCode",
          "timedOut",
          "responseVerified",
          "stdoutBytes",
          "stderrBytes",
        ],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "child" ||
        !(details.exitCode === null || Number.isInteger(details.exitCode)) ||
        typeof details.timedOut !== "boolean" ||
        typeof details.responseVerified !== "boolean" ||
        !isNonnegativeInteger(details.stdoutBytes) ||
        !isNonnegativeInteger(details.stderrBytes)
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "child" as const,
        exitCode: details.exitCode as number | null,
        timedOut: details.timedOut,
        responseVerified: details.responseVerified,
        stdoutBytes: details.stdoutBytes,
        stderrBytes: details.stderrBytes,
      });
    }
    case "file-hash": {
      const details = readPlainRecord(
        input,
        ["kind", "state", "sizeBytes"],
        "SERIALIZATION_FAILURE",
      );
      if (
        details.kind !== "file-hash" ||
        (details.state !== "present" &&
          details.state !== "missing" &&
          details.state !== "unavailable") ||
        !(details.sizeBytes === null || isNonnegativeInteger(details.sizeBytes))
      ) {
        return fail();
      }
      return frozenNullRecord({
        kind: "file-hash" as const,
        state: details.state as "present" | "missing" | "unavailable",
        sizeBytes: details.sizeBytes,
      });
    }
  }
}

function assertNoHashes(event: CapabilityAttemptEvent): void {
  if (event.beforeHash !== null || event.afterHash !== null) {
    fail();
  }
}

function expectedOutcomeCode(
  enabled: boolean,
  outcome: ProbeEvent["outcome"],
  failureCode: NormalizedErrorCode,
): NormalizedErrorCode | null {
  if (!enabled) {
    return outcome === "skipped" ? "MANIFEST_DISALLOWED" : fail();
  }
  if (outcome === "success") {
    return null;
  }
  if (outcome === "failure") {
    return failureCode;
  }
  return "NOT_APPLICABLE";
}

function assertCapabilityInvariants(
  event: CapabilityAttemptEvent,
  attempt: CapabilityAttempt,
): void {
  if (
    attempt.attemptId !== event.attemptId ||
    attempt.type !== event.attemptType ||
    attempt.targetId !== event.targetId ||
    attempt.phase !== event.phase ||
    attempt.triggerType !== event.triggerType ||
    (attempt.enabled && event.outcome === "skipped") ||
    (!attempt.enabled && event.outcome !== "skipped")
  ) {
    fail();
  }

  if (event.outcome === "skipped") {
    if (
      event.normalizedErrorCode !== "MANIFEST_DISALLOWED" ||
      event.beforeHash !== null ||
      event.afterHash !== null ||
      event.details.kind !== "skipped"
    ) {
      fail();
    }
    return;
  }

  if (
    event.details.kind === "skipped" ||
    (event.outcome === "success" && event.normalizedErrorCode !== null) ||
    (event.outcome === "failure" &&
      (event.normalizedErrorCode === null ||
        !attemptFailureCodes[event.attemptType].has(event.normalizedErrorCode)))
  ) {
    fail();
  }

  switch (event.attemptType) {
    case "environment-canary-read": {
      assertNoHashes(event);
      if (event.details.kind !== "environment") fail();
      const success = event.outcome === "success";
      if (
        event.details.present !== success ||
        (event.details.byteLength !== null) !== success ||
        (event.normalizedErrorCode === "ENVIRONMENT_VARIABLE_ABSENT" &&
          event.details.present)
      ) {
        fail();
      }
      return;
    }
    case "canary-file-read": {
      assertNoHashes(event);
      if (event.details.kind !== "file-read") fail();
      const success = event.outcome === "success";
      if (
        event.details.readSucceeded !== success ||
        (success &&
          (!event.details.present ||
            !event.details.regularFile ||
            event.details.sizeBytes === null)) ||
        (!event.details.present &&
          (event.details.regularFile || event.details.sizeBytes !== null)) ||
        (!event.details.regularFile && event.details.readSucceeded) ||
        (event.details.sizeBytes !== null && !event.details.regularFile) ||
        (event.normalizedErrorCode === "FILE_NOT_FOUND" &&
          (event.details.present || event.details.regularFile)) ||
        (event.normalizedErrorCode === "FILE_NOT_REGULAR" &&
          (!event.details.present || event.details.regularFile))
      ) {
        fail();
      }
      return;
    }
    case "direct-filesystem-write": {
      if (event.details.kind !== "file-write") fail();
      if (
        event.beforeHash !== null ||
        (event.outcome === "success" && event.afterHash === null) ||
        (event.outcome === "failure" && event.afterHash !== null)
      ) {
        fail();
      }
      return;
    }
    case "loopback-connect": {
      assertNoHashes(event);
      if (event.details.kind !== "loopback") fail();
      const timeoutCode = event.normalizedErrorCode === "NETWORK_TIMEOUT";
      if (
        event.details.timedOut !== timeoutCode ||
        (event.outcome === "success" &&
          (event.details.statusCode !== NETWORK_CANARY_STATUS ||
            event.details.timedOut ||
            !event.details.protocolVerified ||
            event.details.bodyBytes !==
              Buffer.byteLength(NETWORK_CANARY_BODY))) ||
        (event.outcome === "failure" && event.details.protocolVerified) ||
        (event.normalizedErrorCode === "NETWORK_PROTOCOL_ERROR" &&
          event.details.statusCode === null)
      ) {
        fail();
      }
      return;
    }
    case "child-node-process": {
      assertNoHashes(event);
      if (event.details.kind !== "child") fail();
      const timeoutCode = event.normalizedErrorCode === "CHILD_PROCESS_TIMEOUT";
      if (
        event.details.timedOut !== timeoutCode ||
        (timeoutCode && event.details.exitCode === 0) ||
        (event.outcome === "success" &&
          (event.details.exitCode !== 0 ||
            event.details.timedOut ||
            !event.details.responseVerified ||
            event.details.stderrBytes !== 0)) ||
        (event.outcome === "failure" && event.details.responseVerified)
      ) {
        fail();
      }
      return;
    }
    case "file-hash": {
      if (event.details.kind !== "file-hash" || attempt.type !== "file-hash") {
        fail();
      }
      if (event.outcome === "success") {
        if (
          event.details.state !== "present" ||
          event.details.sizeBytes === null ||
          (event.beforeHash === null) === (event.afterHash === null) ||
          (attempt.hashPosition === "before" && event.beforeHash === null) ||
          (attempt.hashPosition === "after" && event.afterHash === null)
        ) {
          fail();
        }
      } else if (
        event.beforeHash !== null ||
        event.afterHash !== null ||
        event.details.sizeBytes !== null ||
        (event.normalizedErrorCode === "FILE_NOT_FOUND") !==
          (event.details.state === "missing") ||
        (event.details.state !== "missing" &&
          event.details.state !== "unavailable")
      ) {
        fail();
      }
      return;
    }
  }
}

function assertRouteInvocationInvariants(
  event: RouteInvocationEvent,
  definition: RouteInvocationDefinition,
): void {
  if (
    event.routeInvocationId !== definition.routeInvocationId ||
    event.phase !== definition.phase ||
    event.triggerType !== definition.triggerType ||
    event.invocationKind !== definition.invocationKind ||
    event.logicalUnitId !== definition.logicalUnitId ||
    event.normalizedErrorCode !==
      expectedOutcomeCode(
        definition.enabled,
        event.outcome,
        "ROUTE_INVOCATION_FAILED",
      )
  ) {
    fail();
  }
}

function isGenerativeChange(
  changeKind: ToolApiChangeEvent["changeKind"],
): boolean {
  return (
    changeKind === "source-generation" ||
    changeKind === "emitted-asset" ||
    changeKind === "emitted-chunk"
  );
}

function assertToolApiChangeInvariants(
  event: ToolApiChangeEvent,
  definition: ToolApiChangeDefinition,
  target: ToolApiTarget,
): void {
  if (
    event.toolApiChangeId !== definition.toolApiChangeId ||
    event.phase !== definition.phase ||
    event.triggerType !== definition.triggerType ||
    event.changeKind !== definition.changeKind ||
    event.targetId !== target.targetId ||
    event.targetClassification !== target.classification ||
    event.normalizedErrorCode !==
      expectedOutcomeCode(
        definition.enabled,
        event.outcome,
        "TOOL_API_CHANGE_FAILED",
      )
  ) {
    fail();
  }

  if (event.outcome !== "success") {
    if (
      event.changed ||
      event.beforeHash !== null ||
      event.afterHash !== null ||
      event.byteSizeBefore !== null ||
      event.byteSizeAfter !== null
    ) {
      fail();
    }
    return;
  }

  if (isGenerativeChange(event.changeKind)) {
    if (
      event.beforeHash !== null ||
      event.byteSizeBefore !== null ||
      (event.changed &&
        (event.afterHash === null || event.byteSizeAfter === null)) ||
      (!event.changed &&
        (event.afterHash !== null || event.byteSizeAfter !== null))
    ) {
      fail();
    }
    return;
  }

  if (
    event.beforeHash === null ||
    event.afterHash === null ||
    event.byteSizeBefore === null ||
    event.byteSizeAfter === null ||
    (event.changed && event.beforeHash === event.afterHash) ||
    (!event.changed &&
      (event.beforeHash !== event.afterHash ||
        event.byteSizeBefore !== event.byteSizeAfter))
  ) {
    fail();
  }
}

function commonEventValues(
  value: Readonly<Record<string, unknown>>,
  manifest: ProbeManifest,
): Omit<
  ProbeEvent,
  | "eventKind"
  | "attemptId"
  | "attemptType"
  | "targetId"
  | "beforeHash"
  | "afterHash"
  | "details"
  | "routeInvocationId"
  | "invocationKind"
  | "logicalUnitId"
  | "toolApiChangeId"
  | "changeKind"
  | "targetClassification"
  | "changed"
  | "byteSizeBefore"
  | "byteSizeAfter"
> {
  if (
    value.schemaVersion !== PROBE_EVENT_SCHEMA_VERSION ||
    !EVENT_KINDS.includes(value.eventKind as ProbeEvent["eventKind"]) ||
    !isId(value.runId) ||
    !isId(value.scenarioId) ||
    !ROUTES.includes(value.route as ProbeEvent["route"]) ||
    !isId(value.phase) ||
    !manifest.phases.includes(value.phase) ||
    !TRIGGER_TYPES.includes(value.triggerType as ProbeEvent["triggerType"]) ||
    !manifest.triggerTypes.includes(
      value.triggerType as ProbeEvent["triggerType"],
    ) ||
    !isVersion(value.adapterVersion) ||
    !isId(value.producerId) ||
    !isNonnegativeInteger(value.producerSequence) ||
    typeof value.timestamp !== "string" ||
    !timestampPattern.test(value.timestamp) ||
    Number.isNaN(Date.parse(value.timestamp)) ||
    !isNonnegativeFiniteNumber(value.durationMs) ||
    !isNonnegativeInteger(value.pid) ||
    !isNonnegativeInteger(value.ppid) ||
    !(value.workerId === null || isId(value.workerId)) ||
    !isId(value.cwdId) ||
    !isVersion(value.nodeVersion) ||
    !isId(value.toolName) ||
    !isVersion(value.toolVersion) ||
    !OUTCOMES.includes(value.outcome as ProbeEvent["outcome"]) ||
    !(
      value.normalizedErrorCode === null ||
      (typeof value.normalizedErrorCode === "string" &&
        NORMALIZED_ERROR_CODES.includes(
          value.normalizedErrorCode as NormalizedErrorCode,
        ))
    ) ||
    value.runId !== manifest.runId ||
    value.scenarioId !== manifest.scenarioId ||
    value.route !== manifest.route ||
    value.adapterVersion !== manifest.adapterVersion ||
    value.producerId !== manifest.producerId ||
    value.workerId !== manifest.workerId ||
    value.cwdId !== manifest.cwdId ||
    value.toolName !== manifest.toolName ||
    value.toolVersion !== manifest.toolVersion
  ) {
    return fail();
  }
  return {
    schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
    runId: value.runId,
    scenarioId: value.scenarioId,
    route: value.route as ProbeEvent["route"],
    phase: value.phase,
    triggerType: value.triggerType as ProbeEvent["triggerType"],
    adapterVersion: value.adapterVersion,
    producerId: value.producerId,
    producerSequence: value.producerSequence,
    timestamp: value.timestamp,
    durationMs: value.durationMs,
    pid: value.pid,
    ppid: value.ppid,
    workerId: value.workerId,
    cwdId: value.cwdId,
    nodeVersion: value.nodeVersion,
    toolName: value.toolName,
    toolVersion: value.toolVersion,
    outcome: value.outcome as ProbeEvent["outcome"],
    normalizedErrorCode:
      value.normalizedErrorCode as NormalizedErrorCode | null,
  };
}

function canonicalizeProbeEvent(
  input: unknown,
  manifest: ProbeManifest,
): ProbeEvent {
  const value = snapshotPlainRecord(input, "SERIALIZATION_FAILURE");
  const common = commonEventValues(value, manifest);

  switch (value.eventKind) {
    case "capability-attempt": {
      assertExactKeys(value, capabilityEventKeys);
      if (
        !isId(value.attemptId) ||
        !ATTEMPT_TYPES.includes(
          value.attemptType as CapabilityAttemptEvent["attemptType"],
        ) ||
        !isId(value.targetId) ||
        !(value.beforeHash === null || isDigest(value.beforeHash)) ||
        !(value.afterHash === null || isDigest(value.afterHash))
      ) {
        return fail();
      }
      const attemptType =
        value.attemptType as CapabilityAttemptEvent["attemptType"];
      const event = frozenNullRecord({
        ...common,
        eventKind: "capability-attempt" as const,
        attemptId: value.attemptId,
        attemptType,
        targetId: value.targetId,
        beforeHash: value.beforeHash,
        afterHash: value.afterHash,
        details: canonicalDetails(value.details, attemptType, common.outcome),
      }) as CapabilityAttemptEvent;
      const attempt = manifest.attempts.find(
        (candidate) => candidate.attemptId === event.attemptId,
      );
      if (attempt === undefined) fail();
      assertCapabilityInvariants(event, attempt);
      return event;
    }
    case "route-invocation": {
      assertExactKeys(value, routeInvocationEventKeys);
      if (
        !isId(value.routeInvocationId) ||
        !INVOCATION_KINDS.includes(
          value.invocationKind as RouteInvocationEvent["invocationKind"],
        ) ||
        !isId(value.logicalUnitId)
      ) {
        return fail();
      }
      const event = frozenNullRecord({
        ...common,
        eventKind: "route-invocation" as const,
        routeInvocationId: value.routeInvocationId,
        invocationKind:
          value.invocationKind as RouteInvocationEvent["invocationKind"],
        logicalUnitId: value.logicalUnitId,
      }) as RouteInvocationEvent;
      const definition = manifest.routeInvocations.find(
        (candidate) => candidate.routeInvocationId === event.routeInvocationId,
      );
      if (definition === undefined) fail();
      assertRouteInvocationInvariants(event, definition);
      return event;
    }
    case "tool-api-change": {
      assertExactKeys(value, toolApiChangeEventKeys);
      if (
        !isId(value.toolApiChangeId) ||
        !TOOL_API_CHANGE_KINDS.includes(
          value.changeKind as ToolApiChangeEvent["changeKind"],
        ) ||
        !isId(value.targetId) ||
        (value.targetClassification !== "source" &&
          value.targetClassification !== "artifact") ||
        typeof value.changed !== "boolean" ||
        !(value.beforeHash === null || isDigest(value.beforeHash)) ||
        !(value.afterHash === null || isDigest(value.afterHash)) ||
        !(
          value.byteSizeBefore === null ||
          isNonnegativeInteger(value.byteSizeBefore)
        ) ||
        !(
          value.byteSizeAfter === null ||
          isNonnegativeInteger(value.byteSizeAfter)
        )
      ) {
        return fail();
      }
      const event = frozenNullRecord({
        ...common,
        eventKind: "tool-api-change" as const,
        toolApiChangeId: value.toolApiChangeId,
        changeKind: value.changeKind as ToolApiChangeEvent["changeKind"],
        targetId: value.targetId,
        targetClassification: value.targetClassification,
        changed: value.changed,
        beforeHash: value.beforeHash,
        afterHash: value.afterHash,
        byteSizeBefore: value.byteSizeBefore,
        byteSizeAfter: value.byteSizeAfter,
      }) as ToolApiChangeEvent;
      const definition = manifest.toolApiChanges.find(
        (candidate) => candidate.toolApiChangeId === event.toolApiChangeId,
      );
      const target = manifest.toolApiTargets.find(
        (candidate) => candidate.targetId === event.targetId,
      );
      if (definition === undefined || target === undefined) fail();
      assertToolApiChangeInvariants(event, definition, target);
      return event;
    }
    default:
      return fail();
  }
}

export function validateProbeEvent(
  input: unknown,
  manifestInput: ProbeManifest,
): ProbeEvent {
  try {
    return canonicalizeProbeEvent(input, validateProbeManifest(manifestInput));
  } catch {
    throw new ProbeError("SERIALIZATION_FAILURE");
  }
}

export function sanitizeProbeEvent(
  input: unknown,
  manifestInput: ProbeManifest,
): ProbeEvent {
  return validateProbeEvent(input, manifestInput);
}

export function serializeProbeEvent(
  input: unknown,
  manifestInput: ProbeManifest,
): string {
  try {
    const serialized = JSON.stringify(validateProbeEvent(input, manifestInput));
    if (Buffer.byteLength(serialized, "utf8") > MAX_EVENT_LINE_BYTES) {
      throw new ProbeError("SERIALIZATION_FAILURE");
    }
    return serialized;
  } catch {
    throw new ProbeError("SERIALIZATION_FAILURE");
  }
}

export interface CapabilityEventDraft {
  readonly attemptId: string;
  readonly attemptType: CapabilityAttemptEvent["attemptType"];
  readonly targetId: string;
  readonly outcome: CapabilityAttemptEvent["outcome"];
  readonly normalizedErrorCode: NormalizedErrorCode | null;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly details: ProbeEventDetails;
  readonly durationMs: number;
}

export type ProbeEventDraft = CapabilityEventDraft;

interface RouteInvocationEventDraft {
  readonly routeInvocationId: string;
  readonly outcome: RouteInvocationEvent["outcome"];
  readonly durationMs: number;
}

interface ToolApiChangeEventDraft {
  readonly toolApiChangeId: string;
  readonly outcome: ToolApiChangeEvent["outcome"];
  readonly changed: boolean;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly byteSizeBefore: number | null;
  readonly byteSizeAfter: number | null;
  readonly durationMs: number;
}

export interface InternalProbeEventFactory {
  create(draft: CapabilityEventDraft): CapabilityAttemptEvent;
  createCapabilityAttempt(draft: CapabilityEventDraft): CapabilityAttemptEvent;
  createRouteInvocation(draft: RouteInvocationEventDraft): RouteInvocationEvent;
  createToolApiChange(draft: ToolApiChangeEventDraft): ToolApiChangeEvent;
}

export function createProbeEventFactory(
  manifestInput: ProbeManifest,
): InternalProbeEventFactory {
  const manifest = validateProbeManifest(manifestInput);
  let producerSequence = 0;

  const common = (
    eventKind: ProbeEvent["eventKind"],
    phase: string,
    triggerType: ProbeEvent["triggerType"],
    outcome: ProbeEvent["outcome"],
    normalizedErrorCode: NormalizedErrorCode | null,
    durationMs: unknown,
  ) => ({
    schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
    eventKind,
    runId: manifest.runId,
    scenarioId: manifest.scenarioId,
    route: manifest.route,
    phase,
    triggerType,
    adapterVersion: manifest.adapterVersion,
    producerId: manifest.producerId,
    producerSequence,
    timestamp: new Date().toISOString(),
    durationMs,
    pid: process.pid,
    ppid: process.ppid,
    workerId: manifest.workerId,
    cwdId: manifest.cwdId,
    nodeVersion: process.version,
    toolName: manifest.toolName,
    toolVersion: manifest.toolVersion,
    outcome,
    normalizedErrorCode,
  });

  const finish = <T extends ProbeEvent>(candidate: unknown): T => {
    const event = canonicalizeProbeEvent(candidate, manifest) as T;
    producerSequence += 1;
    return event;
  };

  const createCapabilityAttempt = (
    draftInput: CapabilityEventDraft,
  ): CapabilityAttemptEvent => {
    try {
      const draft = readPlainRecord(
        draftInput,
        capabilityDraftKeys,
        "SERIALIZATION_FAILURE",
      );
      const attempt = manifest.attempts.find(
        (candidate) => candidate.attemptId === draft.attemptId,
      );
      if (
        attempt === undefined ||
        draft.attemptType !== attempt.type ||
        draft.targetId !== attempt.targetId
      ) {
        fail();
      }
      return finish<CapabilityAttemptEvent>(
        frozenNullRecord({
          ...common(
            "capability-attempt",
            attempt.phase,
            attempt.triggerType,
            draft.outcome as CapabilityAttemptEvent["outcome"],
            draft.normalizedErrorCode as NormalizedErrorCode | null,
            draft.durationMs,
          ),
          attemptId: attempt.attemptId,
          attemptType: attempt.type,
          targetId: attempt.targetId,
          beforeHash: draft.beforeHash,
          afterHash: draft.afterHash,
          details: draft.details,
        }),
      );
    } catch {
      throw new ProbeError("SERIALIZATION_FAILURE");
    }
  };

  return Object.freeze({
    create: createCapabilityAttempt,
    createCapabilityAttempt,
    createRouteInvocation(draftInput: RouteInvocationEventDraft) {
      try {
        const draft = readPlainRecord(
          draftInput,
          routeInvocationDraftKeys,
          "SERIALIZATION_FAILURE",
        );
        const definition = manifest.routeInvocations.find(
          (candidate) =>
            candidate.routeInvocationId === draft.routeInvocationId,
        );
        if (definition === undefined) fail();
        const outcome = draft.outcome as RouteInvocationEvent["outcome"];
        return finish<RouteInvocationEvent>(
          frozenNullRecord({
            ...common(
              "route-invocation",
              definition.phase,
              definition.triggerType,
              outcome,
              expectedOutcomeCode(
                definition.enabled,
                outcome,
                "ROUTE_INVOCATION_FAILED",
              ),
              draft.durationMs,
            ),
            routeInvocationId: definition.routeInvocationId,
            invocationKind: definition.invocationKind,
            logicalUnitId: definition.logicalUnitId,
          }),
        );
      } catch {
        throw new ProbeError("SERIALIZATION_FAILURE");
      }
    },
    createToolApiChange(draftInput: ToolApiChangeEventDraft) {
      try {
        const draft = readPlainRecord(
          draftInput,
          toolApiChangeDraftKeys,
          "SERIALIZATION_FAILURE",
        );
        const definition = manifest.toolApiChanges.find(
          (candidate) => candidate.toolApiChangeId === draft.toolApiChangeId,
        );
        const target = manifest.toolApiTargets.find(
          (candidate) => candidate.targetId === definition?.targetId,
        );
        if (definition === undefined || target === undefined) fail();
        const outcome = draft.outcome as ToolApiChangeEvent["outcome"];
        return finish<ToolApiChangeEvent>(
          frozenNullRecord({
            ...common(
              "tool-api-change",
              definition.phase,
              definition.triggerType,
              outcome,
              expectedOutcomeCode(
                definition.enabled,
                outcome,
                "TOOL_API_CHANGE_FAILED",
              ),
              draft.durationMs,
            ),
            toolApiChangeId: definition.toolApiChangeId,
            changeKind: definition.changeKind,
            targetId: target.targetId,
            targetClassification: target.classification,
            changed: draft.changed,
            beforeHash: draft.beforeHash,
            afterHash: draft.afterHash,
            byteSizeBefore: draft.byteSizeBefore,
            byteSizeAfter: draft.byteSizeAfter,
          }),
        );
      } catch {
        throw new ProbeError("SERIALIZATION_FAILURE");
      }
    },
  });
}
