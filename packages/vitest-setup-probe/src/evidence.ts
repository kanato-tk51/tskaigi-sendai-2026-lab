import { validateProbeEvent } from "@tskaigi-lab/probe-core";
import type { ProbeEvent, ProbeManifest } from "@tskaigi-lab/probe-core";

import {
  APPROVED_SOURCE_HASH,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TEST_CASE_COUNT,
  EXPECTED_TEST_FILE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  NODE_VERSION,
  PRODUCER_ID,
  REPORT_SCHEMA_VERSION,
  VITEST_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { CoordinatorReport } from "./types.js";

const REPORT_KEYS = Object.freeze([
  "schemaVersion",
  "coordinatorPid",
  "testFileCount",
  "testCaseCount",
  "passedTestCaseCount",
  "failedTestCaseCount",
  "unhandledErrorCount",
  "reason",
] as const);

function plainObject(value: unknown): Record<string, unknown> | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      return undefined;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      Object.values(descriptors).some(
        (descriptor) =>
          !("value" in descriptor) ||
          descriptor.get !== undefined ||
          descriptor.set !== undefined,
      )
    ) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function parseCoordinatorReport(raw: string): CoordinatorReport {
  let parsed: unknown;
  try {
    if (!raw.endsWith("\n") || raw.slice(0, -1).includes("\n")) {
      throw new AdapterError("M2C_REPORT_INVALID");
    }
    parsed = JSON.parse(raw);
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2C_REPORT_INVALID");
  }
  const report = plainObject(parsed);
  if (
    report === undefined ||
    !REPORT_KEYS.every((key, index) => Object.keys(report)[index] === key) ||
    Object.keys(report).length !== REPORT_KEYS.length ||
    report.schemaVersion !== REPORT_SCHEMA_VERSION ||
    !Number.isInteger(report.coordinatorPid) ||
    (report.coordinatorPid as number) <= 0 ||
    report.testFileCount !== EXPECTED_TEST_FILE_COUNT ||
    report.testCaseCount !== EXPECTED_TEST_CASE_COUNT ||
    report.passedTestCaseCount !== EXPECTED_TEST_CASE_COUNT ||
    report.failedTestCaseCount !== 0 ||
    report.unhandledErrorCount !== 0 ||
    report.reason !== "passed"
  ) {
    throw new AdapterError("M2C_REPORT_INVALID");
  }
  return Object.freeze(report) as unknown as CoordinatorReport;
}

function eventOrderValue(event: ProbeEvent): string {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

export function assertRawDataPolicy(
  rawSegment: string,
  forbiddenValues: readonly string[],
): void {
  const forbiddenLiterals = [
    ...forbiddenValues,
    "probe-network-v1",
    "designated fixture completes after setup",
    '"stack"',
    '"diff"',
    '"message"',
    '"moduleId"',
    "/tmp/",
    "/home/",
  ];
  if (forbiddenLiterals.some((value) => rawSegment.includes(value))) {
    throw new AdapterError("M2C_DATA_POLICY_VIOLATION");
  }
}

export function parseAndValidateSegment(
  rawSegment: string,
  manifest: ProbeManifest,
  coordinatorPid: number,
  forbiddenValues: readonly string[],
): readonly ProbeEvent[] {
  assertRawDataPolicy(rawSegment, forbiddenValues);
  if (!rawSegment.endsWith("\n")) {
    throw new AdapterError("M2C_SEGMENT_INVALID");
  }
  const lines = rawSegment.slice(0, -1).split("\n");
  if (
    lines.length !== EXPECTED_EVENT_COUNT ||
    lines.some((line) => line === "")
  ) {
    throw new AdapterError("M2C_EVENT_COUNT_MISMATCH");
  }
  const events: ProbeEvent[] = [];
  try {
    for (const line of lines) {
      events.push(validateProbeEvent(JSON.parse(line), manifest));
    }
  } catch {
    throw new AdapterError("M2C_SEGMENT_INVALID");
  }
  const routeCount = events.filter(
    (event) => event.eventKind === "route-invocation",
  ).length;
  const capabilityCount = events.filter(
    (event) => event.eventKind === "capability-attempt",
  ).length;
  const toolApiChangeCount = events.filter(
    (event) => event.eventKind === "tool-api-change",
  ).length;
  const workerPid = events[0]?.pid;

  if (
    routeCount !== EXPECTED_ROUTE_COUNT ||
    capabilityCount !== EXPECTED_CAPABILITY_COUNT ||
    toolApiChangeCount !== EXPECTED_TOOL_API_CHANGE_COUNT
  ) {
    throw new AdapterError("M2C_EVENT_COUNT_MISMATCH");
  }
  if (
    events.some(
      (event, index) =>
        event.producerSequence !== index ||
        eventOrderValue(event) !== EXPECTED_EVENT_ORDER[index],
    )
  ) {
    throw new AdapterError("M2C_SEGMENT_INVALID");
  }
  if (
    workerPid === undefined ||
    events.some(
      (event) =>
        event.producerId !== PRODUCER_ID ||
        event.pid !== workerPid ||
        event.ppid !== coordinatorPid ||
        event.workerId !== null ||
        event.nodeVersion !== NODE_VERSION ||
        event.toolName !== "vitest" ||
        event.toolVersion !== VITEST_VERSION,
    )
  ) {
    throw new AdapterError("M2C_PROCESS_MISMATCH");
  }

  const capabilities = events.filter(
    (event) => event.eventKind === "capability-attempt",
  );
  const sourceHash = capabilities.find(
    (event) => event.attemptType === "file-hash",
  );
  const loopback = capabilities.find(
    (event) => event.attemptType === "loopback-connect",
  );
  const child = capabilities.find(
    (event) => event.attemptType === "child-node-process",
  );
  if (
    capabilities.some((event) => event.outcome !== "success") ||
    sourceHash?.beforeHash !== APPROVED_SOURCE_HASH ||
    loopback?.details.kind !== "loopback" ||
    !loopback.details.protocolVerified ||
    loopback.details.timedOut ||
    child?.details.kind !== "child" ||
    !child.details.responseVerified ||
    child.details.timedOut
  ) {
    throw new AdapterError("M2C_SEGMENT_INVALID");
  }
  return Object.freeze(events);
}

export function assertSingleProducer(
  segmentCount: number,
  events: readonly ProbeEvent[],
): void {
  const producerIds = new Set(events.map((event) => event.producerId));
  if (segmentCount !== 1 || producerIds.size !== 1) {
    throw new AdapterError("M2C_PROCESS_MISMATCH");
  }
}
