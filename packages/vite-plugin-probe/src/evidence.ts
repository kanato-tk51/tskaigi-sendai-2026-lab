import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { validateProbeEvent } from "@tskaigi-lab/probe-core";
import type {
  ProbeEvent,
  ProbeManifest,
  ToolApiChangeEvent,
} from "@tskaigi-lab/probe-core";

import {
  APPROVED_DESIGNATED_SOURCE_HASH,
  ASSET_OUTPUT_FILE,
  BUNDLE_MUTATION_LITERAL,
  DESIGNATED_SOURCE_CONTENT,
  DIRECT_OUTPUT_RELATIVE_PATH,
  EMITTED_ASSET_CONTENT,
  ENTRY_OUTPUT_FILE,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  NODE_VERSION,
  PLUGIN_NAME,
  PRODUCER_ID,
  TOOL_CHANGE_IDS,
  TRANSFORMED_LITERAL,
  TRANSFORMED_SOURCE_CONTENT,
  VITE_VERSION,
} from "./constants.js";
import type { ScenarioVariant } from "./constants.js";
import { AdapterError } from "./errors.js";
import { hashBytes, hashFile } from "./hash.js";
import type { InputHashEvidence, OutputEvidence } from "./types.js";

export class EvidenceValidationError extends AdapterError {
  readonly checkId: string;

  constructor(checkId: string) {
    super("M2D_OUTPUT_INVALID");
    this.name = "EvidenceValidationError";
    this.checkId = checkId;
  }
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
    DESIGNATED_SOURCE_CONTENT,
    TRANSFORMED_SOURCE_CONTENT,
    EMITTED_ASSET_CONTENT,
    BUNDLE_MUTATION_LITERAL,
    "probe-network-v1",
    '"stack"',
    '"message"',
    '"error"',
    '"stdout"',
    '"stderr"',
    '"moduleId"',
    '"referenceId"',
    '"bundleKey"',
    '"fileName"',
    "/tmp/",
    "/home/",
  ];
  if (forbiddenLiterals.some((value) => rawSegment.includes(value))) {
    throw new AdapterError("M2D_DATA_POLICY_VIOLATION");
  }
}

function toolEvents(
  events: readonly ProbeEvent[],
): readonly ToolApiChangeEvent[] {
  return events.filter(
    (event): event is ToolApiChangeEvent =>
      event.eventKind === "tool-api-change",
  );
}

function assertToolChangeSemantics(
  events: readonly ProbeEvent[],
  variant: ScenarioVariant,
): void {
  const changes = toolEvents(events);
  if (
    changes.length !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    changes.some(
      (event, index) =>
        event.toolApiChangeId !== Object.values(TOOL_CHANGE_IDS)[index],
    )
  ) {
    throw new AdapterError("M2D_SEGMENT_INVALID");
  }
  if (variant === "observe") {
    if (
      changes.some(
        (event) =>
          event.outcome !== "skipped" ||
          event.normalizedErrorCode !== "NOT_APPLICABLE" ||
          event.changed ||
          event.beforeHash !== null ||
          event.afterHash !== null ||
          event.byteSizeBefore !== null ||
          event.byteSizeAfter !== null,
      )
    ) {
      throw new AdapterError("M2D_SEGMENT_INVALID");
    }
    return;
  }
  const transform = changes[0];
  const emitted = changes[1];
  const mutation = changes[2];
  const transformedBefore = Buffer.from(DESIGNATED_SOURCE_CONTENT);
  const transformedAfter = Buffer.from(TRANSFORMED_SOURCE_CONTENT);
  const asset = Buffer.from(EMITTED_ASSET_CONTENT);
  if (
    transform?.outcome !== "success" ||
    transform.normalizedErrorCode !== null ||
    !transform.changed ||
    transform.beforeHash !== hashBytes(transformedBefore) ||
    transform.afterHash !== hashBytes(transformedAfter) ||
    transform.byteSizeBefore !== transformedBefore.byteLength ||
    transform.byteSizeAfter !== transformedAfter.byteLength ||
    emitted?.outcome !== "success" ||
    emitted.normalizedErrorCode !== null ||
    !emitted.changed ||
    emitted.beforeHash !== null ||
    emitted.afterHash !== hashBytes(asset) ||
    emitted.byteSizeBefore !== null ||
    emitted.byteSizeAfter !== asset.byteLength ||
    mutation?.outcome !== "success" ||
    mutation.normalizedErrorCode !== null ||
    !mutation.changed ||
    mutation.beforeHash === null ||
    mutation.afterHash === null ||
    mutation.beforeHash === mutation.afterHash ||
    mutation.byteSizeBefore === null ||
    mutation.byteSizeAfter === null ||
    mutation.byteSizeAfter <= mutation.byteSizeBefore
  ) {
    throw new AdapterError("M2D_SEGMENT_INVALID");
  }
}

export function parseAndValidateSegment(
  rawSegment: string,
  manifest: ProbeManifest,
  variant: ScenarioVariant,
  coordinatorPid: number,
  parentPid: number,
  forbiddenValues: readonly string[],
): readonly ProbeEvent[] {
  assertRawDataPolicy(rawSegment, forbiddenValues);
  if (!rawSegment.endsWith("\n")) {
    throw new AdapterError("M2D_SEGMENT_INVALID");
  }
  const lines = rawSegment.slice(0, -1).split("\n");
  if (
    lines.length !== EXPECTED_EVENT_COUNT ||
    lines.some((line) => line.length === 0)
  ) {
    throw new AdapterError("M2D_EVENT_COUNT_MISMATCH");
  }
  const events: ProbeEvent[] = [];
  try {
    for (const line of lines) {
      events.push(validateProbeEvent(JSON.parse(line), manifest));
    }
  } catch {
    throw new AdapterError("M2D_SEGMENT_INVALID");
  }
  const routeCount = events.filter(
    (event) => event.eventKind === "route-invocation",
  ).length;
  const capabilityCount = events.filter(
    (event) => event.eventKind === "capability-attempt",
  ).length;
  const changeCount = events.filter(
    (event) => event.eventKind === "tool-api-change",
  ).length;
  if (
    routeCount !== EXPECTED_ROUTE_COUNT ||
    capabilityCount !== EXPECTED_CAPABILITY_COUNT ||
    changeCount !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    events.some(
      (event, index) =>
        event.producerSequence !== index ||
        eventOrderValue(event) !== EXPECTED_EVENT_ORDER[index],
    ) ||
    events.some(
      (event) =>
        event.producerId !== PRODUCER_ID ||
        event.pid !== coordinatorPid ||
        event.ppid !== parentPid ||
        event.workerId !== null ||
        event.nodeVersion !== NODE_VERSION ||
        event.toolName !== "vite" ||
        event.toolVersion !== VITE_VERSION,
    ) ||
    events.some(
      (event) =>
        event.eventKind === "route-invocation" && event.outcome !== "success",
    )
  ) {
    throw new AdapterError("M2D_SEGMENT_INVALID");
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
    sourceHash?.beforeHash !== APPROVED_DESIGNATED_SOURCE_HASH ||
    loopback?.details.kind !== "loopback" ||
    !loopback.details.protocolVerified ||
    loopback.details.timedOut ||
    child?.details.kind !== "child" ||
    !child.details.responseVerified ||
    child.details.timedOut
  ) {
    throw new AdapterError("M2D_SEGMENT_INVALID");
  }
  assertToolChangeSemantics(events, variant);
  return Object.freeze(events);
}

export async function validateMaterializedOutputs(
  runRoot: string,
  outDir: string,
  variant: ScenarioVariant,
  events: readonly ProbeEvent[],
): Promise<readonly OutputEvidence[]> {
  let entries;
  try {
    entries = await readdir(outDir, { withFileTypes: true });
  } catch {
    throw new AdapterError("M2D_OUTPUT_INVALID");
  }
  const expected = (
    variant === "api"
      ? [ASSET_OUTPUT_FILE, ENTRY_OUTPUT_FILE]
      : [ENTRY_OUTPUT_FILE]
  ).sort();
  const actual = entries.map((entry) => entry.name).sort();
  if (
    entries.some((entry) => !entry.isFile() || entry.isSymbolicLink()) ||
    actual.length !== expected.length ||
    actual.some((name, index) => name !== expected[index])
  ) {
    throw new EvidenceValidationError("output-inventory");
  }
  const entryPath = path.join(outDir, ENTRY_OUTPUT_FILE);
  const entryCode = await readFile(entryPath, "utf8");
  if (
    variant === "observe"
      ? entryCode.includes(TRANSFORMED_LITERAL) ||
        entryCode.includes(BUNDLE_MUTATION_LITERAL)
      : !entryCode.includes(TRANSFORMED_LITERAL) ||
        !entryCode.includes(BUNDLE_MUTATION_LITERAL)
  ) {
    throw new EvidenceValidationError("entry-marker-materialization");
  }
  const outputEvidence: OutputEvidence[] = [];
  const entryHash = await hashFile(entryPath);
  outputEvidence.push(
    Object.freeze({
      logicalId: "vite-entry-output" as const,
      hash: entryHash.hash,
      sizeBytes: entryHash.sizeBytes,
    }),
  );
  if (variant === "api") {
    const assetPath = path.join(outDir, ASSET_OUTPUT_FILE);
    const assetBytes = await readFile(assetPath);
    if (!assetBytes.equals(Buffer.from(EMITTED_ASSET_CONTENT))) {
      throw new EvidenceValidationError("asset-content-materialization");
    }
    const assetHash = await hashFile(assetPath);
    outputEvidence.push(
      Object.freeze({
        logicalId: "vite-emitted-asset-output" as const,
        hash: assetHash.hash,
        sizeBytes: assetHash.sizeBytes,
      }),
    );
    const changes = toolEvents(events);
    if (
      changes[1]?.afterHash !== assetHash.hash ||
      changes[1]?.byteSizeAfter !== assetHash.sizeBytes
    ) {
      throw new EvidenceValidationError("asset-event-disk-mismatch");
    }
    if (
      changes[2]?.afterHash !== entryHash.hash ||
      changes[2]?.byteSizeAfter !== entryHash.sizeBytes
    ) {
      throw new EvidenceValidationError("bundle-event-disk-mismatch");
    }
  }

  const directPath = path.join(runRoot, DIRECT_OUTPUT_RELATIVE_PATH);
  const directMetadata = await lstat(directPath).catch(() => undefined);
  const directEvent = events.find(
    (event) =>
      event.eventKind === "capability-attempt" &&
      event.attemptType === "direct-filesystem-write",
  );
  const directHash = await hashFile(directPath).catch(() => undefined);
  const relativeToOutput = path.relative(outDir, directPath);
  if (
    directMetadata === undefined ||
    directMetadata.isSymbolicLink() ||
    !directMetadata.isFile() ||
    directHash === undefined ||
    directEvent?.eventKind !== "capability-attempt" ||
    directEvent.afterHash !== directHash.hash ||
    (!relativeToOutput.startsWith("..") && !path.isAbsolute(relativeToOutput))
  ) {
    throw new EvidenceValidationError("direct-write-materialization");
  }
  return Object.freeze(outputEvidence);
}

export function createDeterministicProjection(
  variant: ScenarioVariant,
  events: readonly ProbeEvent[],
  inputEvidence: readonly InputHashEvidence[],
  outputEvidence: readonly OutputEvidence[],
): string {
  const projectedEvents = events.map((event) => {
    const common = {
      eventKind: event.eventKind,
      route: event.route,
      phase: event.phase,
      triggerType: event.triggerType,
      producerId: event.producerId,
      producerSequence: event.producerSequence,
      workerId: event.workerId,
      cwdId: event.cwdId,
      nodeVersion: event.nodeVersion,
      toolName: event.toolName,
      toolVersion: event.toolVersion,
      outcome: event.outcome,
      normalizedErrorCode: event.normalizedErrorCode,
    };
    if (event.eventKind === "route-invocation") {
      return {
        ...common,
        routeInvocationId: event.routeInvocationId,
        invocationKind: event.invocationKind,
        logicalUnitId: event.logicalUnitId,
      };
    }
    if (event.eventKind === "tool-api-change") {
      return {
        ...common,
        toolApiChangeId: event.toolApiChangeId,
        changeKind: event.changeKind,
        targetId: event.targetId,
        targetClassification: event.targetClassification,
        changed: event.changed,
        beforeHash: event.beforeHash,
        afterHash: event.afterHash,
        byteSizeBefore: event.byteSizeBefore,
        byteSizeAfter: event.byteSizeAfter,
      };
    }
    return {
      ...common,
      attemptId: event.attemptId,
      attemptType: event.attemptType,
      targetId: event.targetId,
      beforeHash: event.beforeHash,
      afterHash:
        event.attemptType === "direct-filesystem-write"
          ? "<run-specific-direct-marker>"
          : event.afterHash,
      details: event.details,
    };
  });
  return JSON.stringify({
    variant,
    pluginName: PLUGIN_NAME,
    events: projectedEvents,
    inputEvidence,
    outputEvidence,
  });
}
