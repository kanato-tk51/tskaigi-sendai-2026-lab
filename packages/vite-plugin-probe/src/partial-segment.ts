import {
  serializeProbeEvent,
  validateProbeEvent,
  validateProbeManifest,
} from "@tskaigi-lab/probe-core";
import type {
  ProbeEvent,
  ProbeManifest,
  ToolApiChangeEvent,
} from "@tskaigi-lab/probe-core";

import {
  DESIGNATED_SOURCE_CONTENT,
  EMITTED_ASSET_CONTENT,
  EXPECTED_EVENT_ORDER,
  TOOL_CHANGE_IDS,
  TRANSFORMED_SOURCE_CONTENT,
} from "./constants.js";
import type { ScenarioVariant } from "./constants.js";
import { assertRawDataPolicy } from "./evidence.js";
import { hashBytes } from "./hash.js";
import { validateViteManifestContract } from "./manifest.js";

export interface TrustedPartialProgress {
  readonly trustedEventCount: number | null;
  readonly lastEventId: string | null;
  readonly partialSegmentInvalid: boolean;
}

const INVALID_PARTIAL_PROGRESS: TrustedPartialProgress = Object.freeze({
  trustedEventCount: null,
  lastEventId: null,
  partialSegmentInvalid: true,
});

function eventOrderValue(event: ProbeEvent): string {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

function expectedEventId(index: number): string | null {
  const orderValue = EXPECTED_EVENT_ORDER[index];
  if (orderValue === undefined) {
    return null;
  }
  const separatorIndex = orderValue.indexOf(":");
  return separatorIndex === -1 ? null : orderValue.slice(separatorIndex + 1);
}

function isObserveToolChange(event: ToolApiChangeEvent): boolean {
  return (
    event.outcome === "skipped" &&
    event.normalizedErrorCode === "NOT_APPLICABLE" &&
    !event.changed &&
    event.beforeHash === null &&
    event.afterHash === null &&
    event.byteSizeBefore === null &&
    event.byteSizeAfter === null
  );
}

function isApiToolChange(event: ToolApiChangeEvent): boolean {
  if (
    event.outcome !== "success" ||
    event.normalizedErrorCode !== null ||
    !event.changed
  ) {
    return false;
  }
  if (event.toolApiChangeId === TOOL_CHANGE_IDS.moduleTransform) {
    const before = Buffer.from(DESIGNATED_SOURCE_CONTENT);
    const after = Buffer.from(TRANSFORMED_SOURCE_CONTENT);
    return (
      event.beforeHash === hashBytes(before) &&
      event.afterHash === hashBytes(after) &&
      event.byteSizeBefore === before.byteLength &&
      event.byteSizeAfter === after.byteLength
    );
  }
  if (event.toolApiChangeId === TOOL_CHANGE_IDS.emittedAsset) {
    const asset = Buffer.from(EMITTED_ASSET_CONTENT);
    return (
      event.beforeHash === null &&
      event.afterHash === hashBytes(asset) &&
      event.byteSizeBefore === null &&
      event.byteSizeAfter === asset.byteLength
    );
  }
  return (
    event.toolApiChangeId === TOOL_CHANGE_IDS.bundleMutation &&
    event.beforeHash !== null &&
    event.afterHash !== null &&
    event.beforeHash !== event.afterHash &&
    event.byteSizeBefore !== null &&
    event.byteSizeAfter !== null &&
    event.byteSizeAfter > event.byteSizeBefore
  );
}

function isVariantCompatible(
  event: ProbeEvent,
  variant: ScenarioVariant,
): boolean {
  if (event.eventKind !== "tool-api-change") {
    return true;
  }
  return variant === "observe"
    ? isObserveToolChange(event)
    : isApiToolChange(event);
}

function completeLines(rawSegment: string): {
  readonly lines: readonly string[];
  readonly completePortion: string;
  readonly hasIncompleteFinalLine: boolean;
} {
  const finalNewlineIndex = rawSegment.lastIndexOf("\n");
  const completePortion =
    finalNewlineIndex === -1 ? "" : rawSegment.slice(0, finalNewlineIndex + 1);
  return {
    lines:
      completePortion.length === 0
        ? []
        : completePortion.slice(0, -1).split("\n"),
    completePortion,
    hasIncompleteFinalLine: finalNewlineIndex !== rawSegment.length - 1,
  };
}

export function validateTrustedPartialSegment(
  rawSegment: string | null,
  manifest: ProbeManifest,
  variant: ScenarioVariant,
  forbiddenValues: readonly string[],
): TrustedPartialProgress {
  if (rawSegment === null) {
    return INVALID_PARTIAL_PROGRESS;
  }
  const { lines, completePortion, hasIncompleteFinalLine } =
    completeLines(rawSegment);
  if (lines.length > EXPECTED_EVENT_ORDER.length) {
    return INVALID_PARTIAL_PROGRESS;
  }

  try {
    const validatedManifest = validateProbeManifest(manifest);
    validateViteManifestContract(validatedManifest);
    assertRawDataPolicy(completePortion, forbiddenValues);
    for (const [index, line] of lines.entries()) {
      const event = validateProbeEvent(JSON.parse(line), validatedManifest);
      if (
        serializeProbeEvent(event, validatedManifest) !== line ||
        event.producerSequence !== index ||
        eventOrderValue(event) !== EXPECTED_EVENT_ORDER[index] ||
        !isVariantCompatible(event, variant)
      ) {
        return INVALID_PARTIAL_PROGRESS;
      }
    }
  } catch {
    return INVALID_PARTIAL_PROGRESS;
  }

  return Object.freeze({
    trustedEventCount: lines.length,
    lastEventId: lines.length === 0 ? null : expectedEventId(lines.length - 1),
    partialSegmentInvalid: hasIncompleteFinalLine,
  });
}
