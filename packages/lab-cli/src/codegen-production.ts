import {
  MAX_EVENTS_PER_SEGMENT,
  MAX_EVENT_LINE_BYTES,
  MAX_SEGMENT_BYTES,
  PROBE_MANIFEST_SCHEMA_VERSION,
  serializeProbeEvent,
  validateProbeEvent,
  validateProbeManifest,
} from "@tskaigi-lab/probe-core";
import type {
  ProbeEvent,
  ProbeManifest,
  Sha256Digest,
} from "@tskaigi-lab/probe-core";
import { createHash } from "node:crypto";
import { constants as fsConstants, type BigIntStats } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  rename,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { validateRunCompletion } from "./completion.js";
import {
  CANONICAL_EVENT_SCHEMA_VERSION,
  CODEGEN_ADAPTER_ID,
  CODEGEN_DERIVED_FILENAMES,
  CODEGEN_EVIDENCE_CLASS,
  CODEGEN_HASH_EVIDENCE_SCHEMA_VERSION,
  CODEGEN_INCONCLUSIVE_FILENAMES,
  CODEGEN_OUTPUT_LOCATION,
  CODEGEN_PRODUCER_ID,
  CODEGEN_RAW_LOCATIONS,
  CODEGEN_RUN_METADATA_SCHEMA_VERSION,
  CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION,
  CODEGEN_SCENARIO_IDS,
  CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION,
  CODEGEN_SEGMENT_FILENAME,
  CODEGEN_SEGMENT_ID,
  CODEGEN_SUMMARY_SCHEMA_VERSION,
  MAX_COMPLETION_BYTES,
  MAX_SNAPSHOT_BYTES,
  type LabErrorCode,
} from "./constants.js";
import { LabError, normalizeLabError } from "./errors.js";
import { serializeJson } from "./renderer.js";
import {
  assertExactKeys,
  assertId,
  copyPlainBytes,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type {
  CanonicalEventEnvelope,
  CodegenAttemptExpectation,
  CodegenCollectionResult,
  CodegenComparisonRecord,
  CodegenCompleteCollection,
  CodegenCompleteRunMetadata,
  CodegenCompleteSummary,
  CodegenHashEvidence,
  CodegenHashEvidenceRecord,
  CodegenHashExpectation,
  CodegenInconclusiveCollection,
  CodegenInconclusiveRunMetadata,
  CodegenInconclusiveSummary,
  CodegenObservedAttempt,
  CodegenObservedRoute,
  CodegenObservedToolChange,
  CodegenProfileId,
  CodegenRawInputIdentity,
  CodegenRouteExpectation,
  CodegenRuntimeContext,
  CodegenScenarioDefinition,
  CodegenScenarioExpected,
  CodegenScenarioSnapshot,
  CodegenToolExpectation,
  RunCompletion,
} from "./types.js";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const UTF8 = new TextEncoder();

const ROUTES = Object.freeze([
  [
    "codegen-cli-startup",
    "cli-startup",
    "module-evaluation",
    "codegen-cli-entry",
  ],
  [
    "codegen-argument-parse",
    "argument-parse",
    "cli-stage",
    "codegen-fixed-arguments",
  ],
  [
    "codegen-generation-start",
    "generation-start",
    "cli-stage",
    "codegen-generation",
  ],
  ["codegen-file-write", "file-write", "cli-stage", "codegen-output"],
  ["codegen-completion", "completion", "cli-stage", "codegen-cli-completion"],
] as const);

const ATTEMPTS = Object.freeze([
  [
    "codegen-attempt-environment",
    "environment-canary-read",
    "codegen-environment-canary",
  ],
  ["codegen-attempt-file-read", "canary-file-read", "codegen-file-canary"],
  ["codegen-attempt-file-hash", "file-hash", "codegen-input-snapshot"],
  [
    "codegen-attempt-file-write",
    "direct-filesystem-write",
    "codegen-direct-output",
  ],
  ["codegen-attempt-loopback", "loopback-connect", "codegen-loopback"],
  ["codegen-attempt-child", "child-node-process", "codegen-fixed-child"],
] as const);

const CODEGEN_EXPECTED_EVENT_ORDER = Object.freeze([
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

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function snapshotPlainData(
  input: unknown,
  code: LabErrorCode,
  seen = new WeakSet<object>(),
): unknown {
  if (
    input === null ||
    typeof input === "string" ||
    typeof input === "boolean" ||
    (typeof input === "number" && Number.isSafeInteger(input))
  ) {
    return input;
  }
  if (typeof input !== "object") throw new LabError(code);
  if (seen.has(input)) throw new LabError(code);
  seen.add(input);
  if (Array.isArray(input)) {
    const output = readPlainArray(input, code).map((item) =>
      snapshotPlainData(item, code, seen),
    );
    return Object.freeze(output);
  }
  const record = readPlainRecord(input, code);
  const output: Record<string, unknown> = Object.create(null);
  for (const [key, child] of Object.entries(record)) {
    output[key] = snapshotPlainData(child, code, seen);
  }
  return Object.freeze(output);
}

function expectedForProfile(
  profileId: CodegenProfileId,
): CodegenScenarioExpected {
  const routes: CodegenRouteExpectation[] = ROUTES.map(([id, phase]) =>
    Object.freeze({
      routeInvocationId: id,
      phase,
      outcome: "success" as const,
      normalizedErrorCodes: Object.freeze([null] as [null]),
    }),
  );
  const constrained = profileId === "constrained";
  const attemptErrors: readonly (readonly (string | null)[])[] = constrained
    ? [
        ["ENVIRONMENT_VARIABLE_ABSENT"],
        ["FILE_NOT_FOUND", "READ_DENIED"],
        [null],
        ["WRITE_DENIED"],
        ["NETWORK_FAILURE", "NETWORK_TIMEOUT"],
        ["CHILD_PROCESS_FAILURE"],
      ]
    : ATTEMPTS.map(() => [null]);
  const attempts: CodegenAttemptExpectation[] = ATTEMPTS.map(
    ([attemptId, attemptType], index) => {
      const normalizedErrorCodes = Object.freeze([
        ...(attemptErrors[index] ?? []),
      ]);
      return Object.freeze({
        attemptId,
        attemptType,
        outcome:
          normalizedErrorCodes.length === 1 && normalizedErrorCodes[0] === null
            ? ("success" as const)
            : ("failure" as const),
        normalizedErrorCodes,
      });
    },
  );
  const toolChanges: readonly CodegenToolExpectation[] = Object.freeze([
    Object.freeze({
      toolApiChangeId: "codegen-generation-api-change",
      changeKind: "emitted-asset",
      targetId: "codegen-generated-artifact",
      targetClassification: "artifact",
      outcome: "skipped",
      normalizedErrorCodes: Object.freeze(["NOT_APPLICABLE"] as [
        "NOT_APPLICABLE",
      ]),
      changeState: "unavailable",
    }),
  ]);
  const hashes: readonly CodegenHashExpectation[] = Object.freeze([
    Object.freeze({
      evidenceKind: "file-hash",
      producerId: CODEGEN_PRODUCER_ID,
      targetId: "codegen-input-snapshot",
      classification: "source",
      state: "unavailable",
    }),
    Object.freeze({
      evidenceKind: "tool-api-change",
      producerId: CODEGEN_PRODUCER_ID,
      targetId: "codegen-generated-artifact",
      classification: "artifact",
      state: "unavailable",
    }),
  ]);
  return deepFreeze({ routes, attempts, toolChanges, hashes });
}

function scenarioProfile(
  scenarioId: unknown,
  profileId: unknown,
  code: LabErrorCode,
): CodegenProfileId {
  if (scenarioId === "codegen-observe-p" && profileId === "permissive") {
    return "permissive";
  }
  if (scenarioId === "codegen-observe-c" && profileId === "constrained") {
    return "constrained";
  }
  throw new LabError(code);
}

function validateExpected(
  input: unknown,
  profileId: CodegenProfileId,
  code: LabErrorCode,
): CodegenScenarioExpected {
  const snapshot = snapshotPlainData(input, code);
  const expected = expectedForProfile(profileId);
  if (
    !isDeepStrictEqual(
      JSON.parse(JSON.stringify(snapshot)) as unknown,
      JSON.parse(JSON.stringify(expected)) as unknown,
    )
  ) {
    throw new LabError(code);
  }
  return expected;
}

export function validateCodegenScenarioDefinition(
  input: unknown,
): CodegenScenarioDefinition {
  try {
    const value = readPlainRecord(input, "INVALID_SCENARIO_DEFINITION");
    assertExactKeys(
      value,
      [
        "schemaVersion",
        "scenarioId",
        "adapterId",
        "evidenceClass",
        "profileId",
        "outputLocation",
        "producerId",
        "segmentId",
        "expected",
      ],
      "INVALID_SCENARIO_DEFINITION",
    );
    const profileId = scenarioProfile(
      value.scenarioId,
      value.profileId,
      "INVALID_SCENARIO_DEFINITION",
    );
    if (
      value.schemaVersion !== CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION ||
      value.adapterId !== CODEGEN_ADAPTER_ID ||
      value.evidenceClass !== CODEGEN_EVIDENCE_CLASS ||
      value.outputLocation !== CODEGEN_OUTPUT_LOCATION ||
      value.producerId !== CODEGEN_PRODUCER_ID ||
      value.segmentId !== CODEGEN_SEGMENT_ID
    ) {
      throw new LabError("INVALID_SCENARIO_DEFINITION");
    }
    return deepFreeze({
      schemaVersion: CODEGEN_SCENARIO_DEFINITION_SCHEMA_VERSION,
      scenarioId: value.scenarioId as CodegenScenarioDefinition["scenarioId"],
      adapterId: CODEGEN_ADAPTER_ID,
      evidenceClass: CODEGEN_EVIDENCE_CLASS,
      profileId,
      outputLocation: CODEGEN_OUTPUT_LOCATION,
      producerId: CODEGEN_PRODUCER_ID,
      segmentId: CODEGEN_SEGMENT_ID,
      expected: validateExpected(
        value.expected,
        profileId,
        "CODEGEN_EXPECTED_INVALID",
      ),
    });
  } catch (error) {
    if (error instanceof LabError) throw error;
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
}

function fixedCodegenManifest(
  runId: string,
  scenarioId: CodegenScenarioSnapshot["scenarioId"],
): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli",
    phases: [
      "cli-startup",
      "argument-parse",
      "generation-start",
      "generation-api",
      "file-write",
      "completion",
    ],
    triggerTypes: ["explicit"],
    adapterVersion: "0.0.0",
    producerId: CODEGEN_PRODUCER_ID,
    workerId: null,
    cwdId: "codegen-adapter-workspace",
    toolName: "codegen",
    toolVersion: "0.0.0",
    eventSinkTargetId: "codegen-event-segment",
    targets: [
      { targetId: "codegen-event-segment", kind: "event-segment" },
      {
        targetId: "codegen-environment-canary",
        kind: "environment",
        variableName: "PROBE_CANARY_M2E_ENVIRONMENT",
      },
      {
        targetId: "codegen-file-canary",
        kind: "file-read",
        classification: "canary",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-input-snapshot",
        kind: "file-hash",
        classification: "source",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-direct-output",
        kind: "file-write",
        classification: "output",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-loopback",
        kind: "loopback-http",
        timeoutMs: 2000,
      },
      {
        targetId: "codegen-fixed-child",
        kind: "fixed-child",
        timeoutMs: 2000,
        maxOutputBytes: 1024,
      },
    ],
    attempts: [
      {
        attemptId: "codegen-attempt-environment",
        type: "environment-canary-read",
        targetId: "codegen-environment-canary",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-file-read",
        type: "canary-file-read",
        targetId: "codegen-file-canary",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-file-hash",
        type: "file-hash",
        targetId: "codegen-input-snapshot",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: "codegen-attempt-file-write",
        type: "direct-filesystem-write",
        targetId: "codegen-direct-output",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-loopback",
        type: "loopback-connect",
        targetId: "codegen-loopback",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-child",
        type: "child-node-process",
        targetId: "codegen-fixed-child",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
    ],
    routeInvocations: ROUTES.map(
      ([routeInvocationId, phase, invocationKind, logicalUnitId]) => ({
        routeInvocationId,
        phase,
        triggerType: "explicit" as const,
        invocationKind,
        logicalUnitId,
        enabled: true,
      }),
    ),
    toolApiTargets: [
      {
        targetId: "codegen-generated-artifact",
        classification: "artifact",
      },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: "codegen-generation-api-change",
        phase: "generation-api",
        triggerType: "explicit",
        changeKind: "emitted-asset",
        targetId: "codegen-generated-artifact",
        enabled: true,
      },
    ],
  };
}

function validateCodegenManifest(
  input: unknown,
  runId: string,
  scenarioId: CodegenScenarioSnapshot["scenarioId"],
): ProbeManifest {
  let manifest: ProbeManifest;
  try {
    manifest = validateProbeManifest(input);
  } catch {
    throw new LabError("CODEGEN_MANIFEST_INVALID");
  }
  const expected = validateProbeManifest(
    fixedCodegenManifest(runId, scenarioId),
  );
  if (!isDeepStrictEqual(manifest, expected)) {
    throw new LabError("CODEGEN_MANIFEST_INVALID");
  }
  return manifest;
}

export function validateCodegenScenarioSnapshot(
  input: unknown,
): CodegenScenarioSnapshot {
  try {
    const value = readPlainRecord(input, "INVALID_SCENARIO_SNAPSHOT");
    assertExactKeys(
      value,
      [
        "schemaVersion",
        "runId",
        "scenarioId",
        "adapterId",
        "evidenceClass",
        "profileId",
        "outputLocation",
        "producerId",
        "segmentId",
        "expected",
        "runtimeContext",
        "segments",
      ],
      "INVALID_SCENARIO_SNAPSHOT",
    );
    const runId = assertId(value.runId, "INVALID_SCENARIO_SNAPSHOT");
    const profileId = scenarioProfile(
      value.scenarioId,
      value.profileId,
      "INVALID_SCENARIO_SNAPSHOT",
    );
    if (
      value.schemaVersion !== CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION ||
      !CODEGEN_SCENARIO_IDS.includes(
        value.scenarioId as CodegenScenarioSnapshot["scenarioId"],
      ) ||
      value.adapterId !== CODEGEN_ADAPTER_ID ||
      value.evidenceClass !== CODEGEN_EVIDENCE_CLASS ||
      value.outputLocation !== CODEGEN_OUTPUT_LOCATION ||
      value.producerId !== CODEGEN_PRODUCER_ID ||
      value.segmentId !== CODEGEN_SEGMENT_ID
    ) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    const runtimeInput = readPlainRecord(
      value.runtimeContext,
      "CODEGEN_RUNTIME_CONTEXT_INVALID",
    );
    assertExactKeys(
      runtimeInput,
      ["profileRevision", "containerInput", "segmentRetention"],
      "CODEGEN_RUNTIME_CONTEXT_INVALID",
    );
    const profileRevision = assertId(
      runtimeInput.profileRevision,
      "CODEGEN_RUNTIME_CONTEXT_INVALID",
    );
    if (
      typeof runtimeInput.containerInput !== "string" ||
      !SHA256_PATTERN.test(runtimeInput.containerInput) ||
      runtimeInput.segmentRetention !== "immutable-raw-input"
    ) {
      throw new LabError("CODEGEN_RUNTIME_CONTEXT_INVALID");
    }
    const runtimeContext: CodegenRuntimeContext = Object.freeze({
      profileRevision,
      containerInput: runtimeInput.containerInput as Sha256Digest,
      segmentRetention: "immutable-raw-input",
    });
    const segmentInputs = readPlainArray(
      value.segments,
      "INVALID_SCENARIO_SNAPSHOT",
    );
    if (segmentInputs.length !== 1) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    const segmentInput = readPlainRecord(
      segmentInputs[0],
      "INVALID_SCENARIO_SNAPSHOT",
    );
    assertExactKeys(
      segmentInput,
      ["segmentId", "producerId", "manifest"],
      "INVALID_SCENARIO_SNAPSHOT",
    );
    if (
      segmentInput.segmentId !== CODEGEN_SEGMENT_ID ||
      segmentInput.producerId !== CODEGEN_PRODUCER_ID
    ) {
      throw new LabError("INVALID_SCENARIO_SNAPSHOT");
    }
    const scenarioId =
      value.scenarioId as CodegenScenarioSnapshot["scenarioId"];
    const segment = Object.freeze({
      segmentId: CODEGEN_SEGMENT_ID,
      producerId: CODEGEN_PRODUCER_ID,
      manifest: validateCodegenManifest(
        segmentInput.manifest,
        runId,
        scenarioId,
      ),
    });
    return deepFreeze({
      schemaVersion: CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION,
      runId,
      scenarioId,
      adapterId: CODEGEN_ADAPTER_ID,
      evidenceClass: CODEGEN_EVIDENCE_CLASS,
      profileId,
      outputLocation: CODEGEN_OUTPUT_LOCATION,
      producerId: CODEGEN_PRODUCER_ID,
      segmentId: CODEGEN_SEGMENT_ID,
      expected: validateExpected(
        value.expected,
        profileId,
        "CODEGEN_EXPECTED_INVALID",
      ),
      runtimeContext,
      segments: Object.freeze([segment] as const),
    });
  } catch (error) {
    if (error instanceof LabError) throw error;
    throw new LabError("INVALID_SCENARIO_SNAPSHOT");
  }
}

function sha256(bytes: Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalJson<T>(
  bytes: Uint8Array,
  maxBytes: number,
  code: LabErrorCode,
  validate: (input: unknown) => T,
): T {
  if (bytes.byteLength === 0 || bytes.byteLength > maxBytes) {
    throw new LabError(code);
  }
  let parsed: unknown;
  try {
    const source = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true,
    }).decode(bytes);
    parsed = JSON.parse(source) as unknown;
  } catch {
    throw new LabError(code);
  }
  const value = validate(parsed);
  if (!Buffer.from(serializeJson(value)).equals(Buffer.from(bytes))) {
    throw new LabError(code);
  }
  return value;
}

function validateCodegenSegment(
  rawSegment: Uint8Array,
  manifest: ProbeManifest,
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
  for (const [index, bytes] of lines.entries()) {
    if (bytes.byteLength + 1 > MAX_EVENT_LINE_BYTES) {
      throw new LabError("SEGMENT_LINE_TOO_LARGE");
    }
    let source: string;
    let parsed: unknown;
    try {
      source = new TextDecoder("utf-8", {
        fatal: true,
        ignoreBOM: true,
      }).decode(bytes);
      parsed = JSON.parse(source) as unknown;
    } catch {
      throw new LabError("SEGMENT_JSON_INVALID");
    }
    let event: ProbeEvent;
    let canonical: string;
    try {
      event = validateProbeEvent(parsed, manifest);
      canonical = serializeProbeEvent(event, manifest);
    } catch {
      throw new LabError("SEGMENT_EVENT_INVALID");
    }
    if (!Buffer.from(canonical).equals(Buffer.from(bytes))) {
      throw new LabError("SEGMENT_NONCANONICAL");
    }
    if (event.producerSequence !== index) {
      throw new LabError("SEGMENT_SEQUENCE_INVALID");
    }
    events.push(event);
  }
  return Object.freeze(events);
}

function rawIdentities(
  manifest: Uint8Array,
  completion: Uint8Array,
  segment: Uint8Array,
): readonly CodegenRawInputIdentity[] {
  return Object.freeze([
    Object.freeze({
      location: CODEGEN_RAW_LOCATIONS.manifest,
      byteLength: manifest.byteLength,
      sha256: sha256(manifest),
    }),
    Object.freeze({
      location: CODEGEN_RAW_LOCATIONS.completion,
      byteLength: completion.byteLength,
      sha256: sha256(completion),
    }),
    Object.freeze({
      location: CODEGEN_RAW_LOCATIONS.segment,
      byteLength: segment.byteLength,
      sha256: sha256(segment),
    }),
  ]);
}

function stringifyObserved(input: unknown): string {
  return JSON.stringify(input);
}

function eventIdentity(event: ProbeEvent): string {
  switch (event.eventKind) {
    case "route-invocation":
      return `${event.eventKind}:${event.routeInvocationId}`;
    case "capability-attempt":
      return `${event.eventKind}:${event.attemptId}`;
    case "tool-api-change":
      return `${event.eventKind}:${event.toolApiChangeId}`;
  }
}

function comparisonRecords(
  expected: CodegenScenarioExpected,
  events: readonly ProbeEvent[],
  routes: readonly CodegenObservedRoute[],
  attempts: readonly CodegenObservedAttempt[],
  tools: readonly CodegenObservedToolChange[],
  hashes: readonly CodegenHashEvidenceRecord[],
): readonly CodegenComparisonRecord[] {
  const output: CodegenComparisonRecord[] = [];
  const eventOrderLength = Math.max(
    CODEGEN_EXPECTED_EVENT_ORDER.length,
    events.length,
  );
  for (let index = 0; index < eventOrderLength; index += 1) {
    const wanted = CODEGEN_EXPECTED_EVENT_ORDER[index];
    const observedEvent = events[index];
    const observed =
      observedEvent === undefined ? undefined : eventIdentity(observedEvent);
    output.push(
      Object.freeze({
        identity: `event-order:${index}`,
        expected: stringifyObserved(wanted ?? null),
        observed: stringifyObserved(observed ?? null),
        matches: wanted !== undefined && wanted === observed,
      }),
    );
  }
  const length = Math.max(expected.routes.length, routes.length);
  for (let index = 0; index < length; index += 1) {
    const wanted = expected.routes[index];
    const observed = routes[index];
    const matches =
      wanted !== undefined &&
      observed !== undefined &&
      wanted.routeInvocationId === observed.routeInvocationId &&
      wanted.phase === observed.phase &&
      wanted.outcome === observed.outcome &&
      observed.normalizedErrorCode === null;
    output.push(
      Object.freeze({
        identity: `route:${index}:${wanted?.routeInvocationId ?? observed?.routeInvocationId ?? "missing"}`,
        expected: stringifyObserved(wanted ?? null),
        observed: stringifyObserved(observed ?? null),
        matches,
      }),
    );
  }
  const attemptLength = Math.max(expected.attempts.length, attempts.length);
  for (let index = 0; index < attemptLength; index += 1) {
    const wanted = expected.attempts[index];
    const observed = attempts[index];
    const matches =
      wanted !== undefined &&
      observed !== undefined &&
      wanted.attemptId === observed.attemptId &&
      wanted.attemptType === observed.attemptType &&
      wanted.outcome === observed.outcome &&
      wanted.normalizedErrorCodes.includes(observed.normalizedErrorCode);
    output.push(
      Object.freeze({
        identity: `attempt:${index}:${wanted?.attemptId ?? observed?.attemptId ?? "missing"}`,
        expected: stringifyObserved(wanted ?? null),
        observed: stringifyObserved(observed ?? null),
        matches,
      }),
    );
  }
  const toolLength = Math.max(expected.toolChanges.length, tools.length);
  for (let index = 0; index < toolLength; index += 1) {
    const wanted = expected.toolChanges[index];
    const observed = tools[index];
    const matches =
      wanted !== undefined &&
      observed !== undefined &&
      wanted.toolApiChangeId === observed.toolApiChangeId &&
      wanted.changeKind === observed.changeKind &&
      wanted.targetId === observed.targetId &&
      wanted.targetClassification === observed.targetClassification &&
      wanted.outcome === observed.outcome &&
      wanted.normalizedErrorCodes.includes(
        observed.normalizedErrorCode as "NOT_APPLICABLE",
      ) &&
      wanted.changeState === observed.changeState;
    output.push(
      Object.freeze({
        identity: `tool:${index}:${wanted?.toolApiChangeId ?? observed?.toolApiChangeId ?? "missing"}`,
        expected: stringifyObserved(wanted ?? null),
        observed: stringifyObserved(observed ?? null),
        matches,
      }),
    );
  }
  const hashLength = Math.max(expected.hashes.length, hashes.length);
  for (let index = 0; index < hashLength; index += 1) {
    const wanted = expected.hashes[index];
    const observed = hashes[index];
    const matches =
      wanted !== undefined &&
      observed !== undefined &&
      wanted.evidenceKind === observed.evidenceKind &&
      wanted.producerId === observed.producerId &&
      wanted.targetId === observed.targetId &&
      wanted.classification === observed.classification &&
      wanted.state === observed.state;
    output.push(
      Object.freeze({
        identity: `hash:${index}:${wanted?.targetId ?? observed?.targetId ?? "missing"}`,
        expected: stringifyObserved(wanted ?? null),
        observed: stringifyObserved(
          observed === undefined
            ? null
            : {
                evidenceKind: observed.evidenceKind,
                producerId: observed.producerId,
                targetId: observed.targetId,
                classification: observed.classification,
                state: observed.state,
              },
        ),
        matches,
      }),
    );
  }
  return Object.freeze(output);
}

function renderCodegenComparison(summary: CodegenCompleteSummary): string {
  const lines = [
    "# M3 codegen production comparison",
    "",
    `- Run validity: \`${summary.validity}\``,
    `- Expected/Observed match: \`${summary.comparison.matches ? "yes" : "no"}\``,
    `- Evidence: \`${summary.evidenceLocation}\``,
    "- Global sequence is deterministic ingestion order, not causal or real-time order.",
    "- Adapter-run evidence is not automatically profile, matrix, presentation, runtime-enforcement, or other Observed evidence.",
    "",
    "| Identity | Expected | Observed | Match |",
    "|---|---|---|---|",
  ];
  for (const record of summary.comparison.records) {
    lines.push(
      `| \`${record.identity}\` | \`${record.expected}\` | \`${record.observed}\` | ${record.matches ? "yes" : "no"} |`,
    );
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function inconclusiveCodegen(
  error: unknown,
  snapshot: CodegenScenarioSnapshot | null,
  completion: RunCompletion | null,
): CodegenInconclusiveCollection {
  const code = normalizeLabError(error);
  const metadata: CodegenInconclusiveRunMetadata = Object.freeze({
    schemaVersion: CODEGEN_RUN_METADATA_SCHEMA_VERSION,
    runId: snapshot?.runId ?? null,
    scenarioId: snapshot?.scenarioId ?? null,
    adapterId: snapshot?.adapterId ?? null,
    evidenceClass: snapshot?.evidenceClass ?? null,
    profileId: snapshot?.profileId ?? null,
    validity: "inconclusive",
    timedOut: completion?.timedOut ?? false,
    errorCodes: Object.freeze([code]),
    ordering: null,
    runtimeContext: null,
    rawInputs: null,
    evidenceLocations: Object.freeze({
      manifest: snapshot === null ? null : CODEGEN_RAW_LOCATIONS.manifest,
      completion: completion === null ? null : CODEGEN_RAW_LOCATIONS.completion,
      events: null,
      summary: "derived/summary.json",
      comparison: null,
      hashes: null,
      segment: CODEGEN_RAW_LOCATIONS.segment,
    }),
  });
  const summary: CodegenInconclusiveSummary = Object.freeze({
    schemaVersion: CODEGEN_SUMMARY_SCHEMA_VERSION,
    runId: snapshot?.runId ?? null,
    scenarioId: snapshot?.scenarioId ?? null,
    validity: "inconclusive",
    counts: null,
    routes: null,
    attempts: null,
    toolChanges: null,
    hashes: null,
    comparison: null,
    evidenceLocation: null,
    errorCodes: Object.freeze([code]),
  });
  return Object.freeze({
    validity: "inconclusive",
    snapshot,
    completion,
    events: null,
    metadata,
    summary,
    hashes: null,
    files: Object.freeze({
      "run-metadata.json": serializeJson(metadata),
      "summary.json": serializeJson(summary),
    }),
  });
}

function assertCodegenRunComplete(
  completion: RunCompletion,
  snapshot: CodegenScenarioSnapshot,
): void {
  if (!completion.scenarioStarted) throw new LabError("RUN_NOT_STARTED");
  if (completion.timedOut) throw new LabError("RUN_TIMEOUT");
  if (!completion.toolTerminated) throw new LabError("TOOL_NOT_TERMINATED");
  if (!completion.scenarioEnded) throw new LabError("RUN_NOT_ENDED");
  if (!completion.hashFinalized) {
    throw new LabError("HASH_FINALIZATION_INCOMPLETE");
  }
  if (
    completion.segmentCloses.length !== 1 ||
    completion.segmentCloses[0]?.segmentId !== snapshot.segmentId
  ) {
    throw new LabError("INVALID_RUN_COMPLETION");
  }
  if (!completion.segmentCloses[0].complete) {
    throw new LabError("SEGMENT_CLOSE_INCOMPLETE");
  }
}

export function collectCodegenProductionRun(
  input: unknown,
): CodegenCollectionResult {
  let snapshot: CodegenScenarioSnapshot | null = null;
  let completion: RunCompletion | null = null;
  try {
    const value = readPlainRecord(input, "INVALID_COLLECTION_INPUT");
    assertExactKeys(
      value,
      ["manifestSnapshotBytes", "completionSnapshotBytes", "segmentBytes"],
      "INVALID_COLLECTION_INPUT",
    );
    const manifestBytes = copyPlainBytes(
      value.manifestSnapshotBytes,
      "INVALID_COLLECTION_INPUT",
    );
    const completionBytes = copyPlainBytes(
      value.completionSnapshotBytes,
      "INVALID_COLLECTION_INPUT",
    );
    const segmentBytes = copyPlainBytes(
      value.segmentBytes,
      "INVALID_COLLECTION_INPUT",
    );
    snapshot = canonicalJson(
      manifestBytes,
      MAX_SNAPSHOT_BYTES,
      "INVALID_SCENARIO_SNAPSHOT",
      validateCodegenScenarioSnapshot,
    );
    completion = canonicalJson(
      completionBytes,
      MAX_COMPLETION_BYTES,
      "INVALID_RUN_COMPLETION",
      validateRunCompletion,
    );
    assertCodegenRunComplete(completion, snapshot);
    const events = validateCodegenSegment(
      segmentBytes,
      snapshot.segments[0].manifest,
    );
    const envelopes: readonly CanonicalEventEnvelope[] = Object.freeze(
      events.map((event, globalSequence) =>
        Object.freeze({
          schemaVersion: CANONICAL_EVENT_SCHEMA_VERSION,
          globalSequence,
          event,
        }),
      ),
    );
    const routes: readonly CodegenObservedRoute[] = Object.freeze(
      events
        .filter((event) => event.eventKind === "route-invocation")
        .map((event) =>
          Object.freeze({
            routeInvocationId: event.routeInvocationId,
            phase: event.phase,
            outcome: event.outcome,
            normalizedErrorCode: event.normalizedErrorCode,
          }),
        ),
    );
    const attempts: readonly CodegenObservedAttempt[] = Object.freeze(
      events
        .filter((event) => event.eventKind === "capability-attempt")
        .map((event) =>
          Object.freeze({
            attemptId: event.attemptId,
            attemptType: event.attemptType,
            outcome: event.outcome,
            normalizedErrorCode: event.normalizedErrorCode,
          }),
        ),
    );
    const tools: readonly CodegenObservedToolChange[] = Object.freeze(
      events
        .filter((event) => event.eventKind === "tool-api-change")
        .map((event) =>
          Object.freeze({
            toolApiChangeId: event.toolApiChangeId,
            changeKind: event.changeKind,
            targetId: event.targetId,
            targetClassification: event.targetClassification,
            outcome: event.outcome,
            normalizedErrorCode: event.normalizedErrorCode,
            changeState:
              event.outcome !== "success"
                ? ("unavailable" as const)
                : event.changed
                  ? ("changed" as const)
                  : ("unchanged" as const),
          }),
        ),
    );
    const hashRecords: CodegenHashEvidenceRecord[] = [];
    for (const envelope of envelopes) {
      const event = envelope.event;
      if (
        event.eventKind === "capability-attempt" &&
        event.attemptType === "file-hash"
      ) {
        hashRecords.push(
          Object.freeze({
            evidenceKind: "file-hash",
            producerId: event.producerId,
            targetId: event.targetId,
            classification: "source",
            state: "unavailable",
            beforeHash: event.outcome === "success" ? event.beforeHash : null,
            afterHash: null,
            globalSequences: Object.freeze([envelope.globalSequence]),
          }),
        );
      } else if (event.eventKind === "tool-api-change") {
        hashRecords.push(
          Object.freeze({
            evidenceKind: "tool-api-change",
            producerId: event.producerId,
            targetId: event.targetId,
            classification: event.targetClassification,
            state:
              event.outcome !== "success"
                ? "unavailable"
                : event.changed
                  ? "changed"
                  : "unchanged",
            beforeHash: event.beforeHash,
            afterHash: event.afterHash,
            globalSequences: Object.freeze([envelope.globalSequence]),
          }),
        );
      }
    }
    const frozenHashes = Object.freeze(hashRecords);
    const comparisons = comparisonRecords(
      snapshot.expected,
      events,
      routes,
      attempts,
      tools,
      frozenHashes,
    );
    const metadata: CodegenCompleteRunMetadata = Object.freeze({
      schemaVersion: CODEGEN_RUN_METADATA_SCHEMA_VERSION,
      runId: snapshot.runId,
      scenarioId: snapshot.scenarioId,
      adapterId: snapshot.adapterId,
      evidenceClass: snapshot.evidenceClass,
      profileId: snapshot.profileId,
      validity: "complete",
      timedOut: false,
      errorCodes: [] as const,
      ordering: Object.freeze({
        key: "producer-id-then-segment-id",
        preservesSegmentLineOrder: true,
        causalOrder: false,
      }),
      runtimeContext: snapshot.runtimeContext,
      rawInputs: rawIdentities(manifestBytes, completionBytes, segmentBytes),
      evidenceLocations: Object.freeze({
        manifest: CODEGEN_RAW_LOCATIONS.manifest,
        completion: CODEGEN_RAW_LOCATIONS.completion,
        events: "derived/events.jsonl",
        summary: "derived/summary.json",
        comparison: "derived/comparison.md",
        hashes: "derived/hashes.json",
        segment: CODEGEN_RAW_LOCATIONS.segment,
      }),
    });
    const hashes: CodegenHashEvidence = Object.freeze({
      schemaVersion: CODEGEN_HASH_EVIDENCE_SCHEMA_VERSION,
      runId: snapshot.runId,
      scenarioId: snapshot.scenarioId,
      records: frozenHashes,
    });
    const summary: CodegenCompleteSummary = Object.freeze({
      schemaVersion: CODEGEN_SUMMARY_SCHEMA_VERSION,
      runId: snapshot.runId,
      scenarioId: snapshot.scenarioId,
      validity: "complete",
      counts: Object.freeze({
        totalEvents: events.length,
        routeInvocations: routes.length,
        capabilityAttempts: attempts.length,
        toolApiChanges: tools.length,
      }),
      routes,
      attempts,
      toolChanges: tools,
      hashes: frozenHashes,
      comparison: Object.freeze({
        matches: comparisons.every((record) => record.matches),
        records: comparisons,
      }),
      evidenceLocation: "derived/events.jsonl",
    });
    const eventsJsonl =
      envelopes.length === 0
        ? ""
        : `${envelopes
            .map((envelope) =>
              JSON.stringify({
                schemaVersion: envelope.schemaVersion,
                globalSequence: envelope.globalSequence,
                event: envelope.event,
              }),
            )
            .join("\n")}\n`;
    const result: CodegenCompleteCollection = Object.freeze({
      validity: "complete",
      snapshot,
      completion,
      events: envelopes,
      metadata,
      summary,
      hashes,
      files: Object.freeze({
        "run-metadata.json": serializeJson(metadata),
        "events.jsonl": eventsJsonl,
        "summary.json": serializeJson(summary),
        "comparison.md": renderCodegenComparison(summary),
        "hashes.json": serializeJson(hashes),
      }),
    });
    return result;
  } catch (error) {
    return inconclusiveCodegen(error, snapshot, completion);
  }
}

export type CodegenProductionCheckpoint =
  | "before-r1"
  | "before-r2"
  | `after-open:${string}`
  | `before-close:${string}`
  | "before-rename";

export interface CodegenProductionTestControl {
  readonly checkpoint?: (
    checkpoint: CodegenProductionCheckpoint,
  ) => void | Promise<void>;
}

export type CodegenFilesystemCollectionResult =
  | Readonly<{
      status: "committed";
      validity: "complete" | "inconclusive";
      files: readonly string[];
    }>
  | Readonly<{
      status: "filesystem-rejected";
      code: "M3_CODEGEN_FILESYSTEM_REJECTED";
    }>;

interface HeldObject {
  readonly label: string;
  readonly filePath: string;
  readonly handle: FileHandle;
  readonly kind: "file" | "directory";
  status: BigIntStats | null;
  closed: boolean;
}

interface CapturedRaw {
  readonly held: HeldObject;
  readonly bytes: Uint8Array;
  readonly digest: Sha256Digest;
}

const FILESYSTEM_REJECTED: CodegenFilesystemCollectionResult = Object.freeze({
  status: "filesystem-rejected",
  code: "M3_CODEGEN_FILESYSTEM_REJECTED",
});

function errorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function currentOwner(): { readonly uid: bigint; readonly gid: bigint } {
  if (process.getuid === undefined || process.getgid === undefined) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  return Object.freeze({
    uid: BigInt(process.getuid()),
    gid: BigInt(process.getgid()),
  });
}

function fullMode(status: BigIntStats): number {
  return Number(status.mode & 0o7777n);
}

function sameObject(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.isFile() === right.isFile() &&
    left.isDirectory() === right.isDirectory()
  );
}

function sameDirectoryObject(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.mode === right.mode &&
    left.isDirectory() &&
    right.isDirectory()
  );
}

async function lstatBig(filePath: string): Promise<BigIntStats> {
  return lstat(filePath, { bigint: true });
}

function assertPrivateStatus(
  status: BigIntStats,
  kind: HeldObject["kind"],
  maxBytes?: number,
): void {
  const owner = currentOwner();
  if (
    status.uid !== owner.uid ||
    status.gid !== owner.gid ||
    fullMode(status) !== (kind === "directory" ? 0o700 : 0o600) ||
    (kind === "directory" ? !status.isDirectory() : !status.isFile()) ||
    (kind === "file" && status.nlink !== 1n) ||
    (maxBytes !== undefined &&
      (status.size < 0n || status.size > BigInt(maxBytes)))
  ) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
}

async function openHeldDirectory(
  label: string,
  filePath: string,
  handles: HeldObject[],
  control: CodegenProductionTestControl | undefined,
): Promise<HeldObject> {
  const pathStatus = await lstatBig(filePath);
  assertPrivateStatus(pathStatus, "directory");
  const handle = await open(
    filePath,
    fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW,
  );
  const held: HeldObject = {
    label,
    filePath,
    handle,
    kind: "directory",
    status: null,
    closed: false,
  };
  handles.push(held);
  await runCheckpoint(control, `after-open:${label}`);
  const status = await held.handle.stat({ bigint: true });
  held.status = status;
  if (!sameObject(pathStatus, status)) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  return held;
}

async function openHeldRawFile(
  label: string,
  filePath: string,
  maxBytes: number,
  handles: HeldObject[],
  control: CodegenProductionTestControl | undefined,
): Promise<HeldObject> {
  const pathStatus = await lstatBig(filePath);
  assertPrivateStatus(pathStatus, "file", maxBytes);
  const handle = await open(
    filePath,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  const held: HeldObject = {
    label,
    filePath,
    handle,
    kind: "file",
    status: null,
    closed: false,
  };
  handles.push(held);
  await runCheckpoint(control, `after-open:${label}`);
  const status = await held.handle.stat({ bigint: true });
  held.status = status;
  if (!sameObject(pathStatus, status)) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  return held;
}

function requireHeldStatus(held: HeldObject): BigIntStats {
  if (held.status === null) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  return held.status;
}

async function readHeldFile(held: HeldObject): Promise<Uint8Array> {
  const status = requireHeldStatus(held);
  if (held.kind !== "file" || status.size > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  const size = Number(status.size);
  const output = Buffer.alloc(size);
  let offset = 0;
  while (offset < size) {
    const { bytesRead } = await held.handle.read(
      output,
      offset,
      size - offset,
      offset,
    );
    if (bytesRead <= 0) throw new LabError("CODEGEN_RAW_CONTENT_CHANGED");
    offset += bytesRead;
  }
  const extra = Buffer.alloc(1);
  const { bytesRead: extraBytes } = await held.handle.read(extra, 0, 1, size);
  if (extraBytes !== 0) throw new LabError("CODEGEN_RAW_CONTENT_CHANGED");
  return new Uint8Array(output);
}

async function assertHeldPath(held: HeldObject): Promise<void> {
  const acceptedStatus = requireHeldStatus(held);
  const descriptorStatus = await held.handle.stat({ bigint: true });
  const pathStatus = await lstatBig(held.filePath);
  const matches =
    held.kind === "directory"
      ? sameDirectoryObject(acceptedStatus, descriptorStatus) &&
        sameDirectoryObject(acceptedStatus, pathStatus)
      : sameObject(acceptedStatus, descriptorStatus) &&
        sameObject(acceptedStatus, pathStatus);
  if (!matches || !sameObject(descriptorStatus, pathStatus)) {
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
}

async function captureRaw(held: HeldObject): Promise<CapturedRaw> {
  const bytes = await readHeldFile(held);
  await assertHeldPath(held);
  return Object.freeze({ held, bytes, digest: sha256(bytes) });
}

async function revalidateRaw(
  captured: readonly CapturedRaw[],
  ancestors: readonly HeldObject[],
): Promise<void> {
  for (const ancestor of ancestors) await assertHeldPath(ancestor);
  for (const item of captured) {
    const bytes = await readHeldFile(item.held);
    if (
      bytes.byteLength !== item.bytes.byteLength ||
      sha256(bytes) !== item.digest
    ) {
      throw new LabError("CODEGEN_RAW_CONTENT_CHANGED");
    }
    await assertHeldPath(item.held);
  }
  for (const ancestor of ancestors) await assertHeldPath(ancestor);
}

async function assertNames(
  directoryPath: string,
  expected: readonly string[],
): Promise<void> {
  const actual = (await readdir(directoryPath)).sort();
  const sortedExpected = [...expected].sort();
  if (
    actual.length !== sortedExpected.length ||
    actual.some((name, index) => name !== sortedExpected[index])
  ) {
    throw new LabError("INPUT_INVENTORY_INVALID");
  }
}

async function assertAbsent(filePath: string): Promise<void> {
  try {
    await lstatBig(filePath);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return;
    throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
  }
  throw new LabError("OUTPUT_ALREADY_EXISTS");
}

async function runCheckpoint(
  control: CodegenProductionTestControl | undefined,
  checkpoint: CodegenProductionCheckpoint,
): Promise<void> {
  await control?.checkpoint?.(checkpoint);
}

async function writeAll(handle: FileHandle, bytes: Uint8Array): Promise<void> {
  let offset = 0;
  while (offset < bytes.byteLength) {
    const { bytesWritten } = await handle.write(
      bytes,
      offset,
      bytes.byteLength - offset,
      offset,
    );
    if (bytesWritten <= 0) throw new LabError("CODEGEN_STAGING_INVALID");
    offset += bytesWritten;
  }
}

async function createStagedFile(
  stagingRoot: string,
  name: string,
  source: string,
  handles: HeldObject[],
  control: CodegenProductionTestControl | undefined,
): Promise<{ readonly held: HeldObject; readonly bytes: Uint8Array }> {
  const bytes = UTF8.encode(source);
  const filePath = path.join(stagingRoot, name);
  const handle = await open(
    filePath,
    fsConstants.O_CREAT |
      fsConstants.O_EXCL |
      fsConstants.O_RDWR |
      fsConstants.O_NOFOLLOW,
    0o600,
  );
  const held: HeldObject = {
    label: `staged-${name}`,
    filePath,
    handle,
    kind: "file",
    status: null,
    closed: false,
  };
  handles.push(held);
  await runCheckpoint(control, `after-open:${held.label}`);
  held.status = await held.handle.stat({ bigint: true });
  await writeAll(handle, bytes);
  await handle.sync();
  held.status = await handle.stat({ bigint: true });
  const acceptedStatus = requireHeldStatus(held);
  assertPrivateStatus(acceptedStatus, "file", bytes.byteLength);
  if (acceptedStatus.size !== BigInt(bytes.byteLength)) {
    throw new LabError("CODEGEN_STAGING_INVALID");
  }
  const pathStatus = await lstatBig(filePath);
  if (!sameObject(acceptedStatus, pathStatus)) {
    throw new LabError("CODEGEN_STAGING_INVALID");
  }
  const readBack = await readHeldFile(held);
  if (
    readBack.byteLength !== bytes.byteLength ||
    sha256(readBack) !== sha256(bytes)
  ) {
    throw new LabError("CODEGEN_STAGING_INVALID");
  }
  return Object.freeze({ held, bytes });
}

async function revalidateStaged(
  staged: readonly {
    readonly held: HeldObject;
    readonly bytes: Uint8Array;
  }[],
  stagingDirectory: HeldObject,
  expectedNames: readonly string[],
): Promise<void> {
  await assertNames(stagingDirectory.filePath, expectedNames);
  await assertHeldPath(stagingDirectory);
  for (const item of staged) {
    await assertHeldPath(item.held);
    const readBack = await readHeldFile(item.held);
    if (
      readBack.byteLength !== item.bytes.byteLength ||
      sha256(readBack) !== sha256(item.bytes)
    ) {
      throw new LabError("CODEGEN_STAGING_INVALID");
    }
  }
  await assertNames(stagingDirectory.filePath, expectedNames);
  await assertHeldPath(stagingDirectory);
}

async function settleHandles(
  handles: readonly HeldObject[],
  control: CodegenProductionTestControl | undefined,
): Promise<boolean> {
  let failed = false;
  const ordered = [...handles].sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === "file" ? -1 : 1;
    return left.label < right.label ? -1 : left.label > right.label ? 1 : 0;
  });
  for (const held of ordered) {
    if (held.closed) continue;
    try {
      await runCheckpoint(control, `before-close:${held.label}`);
    } catch {
      failed = true;
    }
    try {
      await held.handle.close();
    } catch {
      failed = true;
    }
    held.closed = true;
  }
  return failed;
}

export async function collectCodegenProductionRunInOwnedRoot(
  ownedRoot: string,
  runIdInput: string,
  control?: CodegenProductionTestControl,
): Promise<CodegenFilesystemCollectionResult> {
  const handles: HeldObject[] = [];
  try {
    const runId = assertId(runIdInput, "CODEGEN_RAW_IDENTITY_INVALID");
    const resolvedRoot = path.resolve(ownedRoot);
    if ((await realpath(resolvedRoot)) !== resolvedRoot) {
      throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
    }
    const rootStatus = await lstatBig(resolvedRoot);
    assertPrivateStatus(rootStatus, "directory");
    const runRoot = path.join(resolvedRoot, runId);
    if (path.dirname(runRoot) !== resolvedRoot) {
      throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
    }
    const rawRoot = path.join(runRoot, "raw");
    const segmentRoot = path.join(rawRoot, "segments");
    const stagingRoot = path.join(runRoot, "derived.staging");
    const derivedRoot = path.join(runRoot, "derived");
    await assertNames(runRoot, ["raw"]);
    await assertNames(rawRoot, [
      "manifest.snapshot.json",
      "run-completion.snapshot.json",
      "segments",
    ]);
    await assertNames(segmentRoot, [CODEGEN_SEGMENT_FILENAME]);
    await assertAbsent(stagingRoot);
    await assertAbsent(derivedRoot);

    const runDirectory = await openHeldDirectory(
      "run-directory",
      runRoot,
      handles,
      control,
    );
    const rawDirectory = await openHeldDirectory(
      "raw-directory",
      rawRoot,
      handles,
      control,
    );
    const segmentDirectory = await openHeldDirectory(
      "segments-directory",
      segmentRoot,
      handles,
      control,
    );
    const manifestFile = await openHeldRawFile(
      "raw-manifest",
      path.join(rawRoot, "manifest.snapshot.json"),
      MAX_SNAPSHOT_BYTES,
      handles,
      control,
    );
    const completionFile = await openHeldRawFile(
      "raw-completion",
      path.join(rawRoot, "run-completion.snapshot.json"),
      MAX_COMPLETION_BYTES,
      handles,
      control,
    );
    const segmentFile = await openHeldRawFile(
      "raw-segment",
      path.join(segmentRoot, CODEGEN_SEGMENT_FILENAME),
      MAX_SEGMENT_BYTES,
      handles,
      control,
    );
    const identities = new Set(
      [manifestFile, completionFile, segmentFile].map((held) => {
        const status = requireHeldStatus(held);
        return `${status.dev}:${status.ino}`;
      }),
    );
    if (identities.size !== 3) {
      throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
    }
    const captured = Object.freeze([
      await captureRaw(manifestFile),
      await captureRaw(completionFile),
      await captureRaw(segmentFile),
    ] as const);
    const collection = collectCodegenProductionRun({
      manifestSnapshotBytes: captured[0].bytes,
      completionSnapshotBytes: captured[1].bytes,
      segmentBytes: captured[2].bytes,
    });
    if (collection.snapshot !== null && collection.snapshot.runId !== runId) {
      throw new LabError("CODEGEN_RAW_IDENTITY_INVALID");
    }

    await runCheckpoint(control, "before-r1");
    await revalidateRaw(captured, [
      runDirectory,
      rawDirectory,
      segmentDirectory,
    ]);

    try {
      await mkdir(stagingRoot, { mode: 0o700 });
    } catch (error) {
      throw new LabError(
        errorCode(error) === "EEXIST"
          ? "OUTPUT_ALREADY_EXISTS"
          : "CODEGEN_STAGING_INVALID",
      );
    }
    const stagingDirectory = await openHeldDirectory(
      "staging-directory",
      stagingRoot,
      handles,
      control,
    );
    const expectedNames = Object.keys(collection.files).sort();
    const contractualNames =
      collection.validity === "complete"
        ? [...CODEGEN_DERIVED_FILENAMES].sort()
        : [...CODEGEN_INCONCLUSIVE_FILENAMES].sort();
    if (!isDeepStrictEqual(expectedNames, contractualNames)) {
      throw new LabError("CODEGEN_STAGING_INVALID");
    }
    const staged: {
      readonly held: HeldObject;
      readonly bytes: Uint8Array;
    }[] = [];
    for (const name of expectedNames) {
      const source = collection.files[name as keyof typeof collection.files];
      if (typeof source !== "string") {
        throw new LabError("CODEGEN_STAGING_INVALID");
      }
      staged.push(
        await createStagedFile(stagingRoot, name, source, handles, control),
      );
    }
    await revalidateStaged(staged, stagingDirectory, expectedNames);

    await runCheckpoint(control, "before-r2");
    await revalidateRaw(captured, [
      runDirectory,
      rawDirectory,
      segmentDirectory,
    ]);
    await revalidateStaged(staged, stagingDirectory, expectedNames);
    await stagingDirectory.handle.sync();

    const successResult: CodegenFilesystemCollectionResult = Object.freeze({
      status: "committed",
      validity: collection.validity,
      files: Object.freeze([...expectedNames]),
    });
    const closeFailed = await settleHandles(handles, control);
    if (closeFailed) return FILESYSTEM_REJECTED;
    try {
      await runCheckpoint(control, "before-rename");
      await rename(stagingRoot, derivedRoot);
    } catch {
      return FILESYSTEM_REJECTED;
    }
    return successResult;
  } catch {
    await settleHandles(handles, control);
    return FILESYSTEM_REJECTED;
  }
}
