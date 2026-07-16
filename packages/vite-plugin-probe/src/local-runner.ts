import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ADAPTER_VERSION,
  ESBUILD_VERSION,
  EXPECTED_EVENT_ORDER,
  LOCAL_RESULT_DIRECTORY,
  NODE_VERSION,
  NPM_VERSION,
  PRODUCER_ID,
  ROLLUP_VERSION,
  VITE_VERSION,
} from "./constants.js";
import type { ScenarioVariant } from "./constants.js";
import { ADAPTER_ERROR_CODES, AdapterError } from "./errors.js";
import type { AdapterErrorCode } from "./errors.js";
import { hashBytes } from "./hash.js";
import { FIXED_REPOSITORY_ROOT } from "./paths.js";
import {
  runFixedApiScenario,
  runFixedObserveScenario,
  ScenarioProgressError,
} from "./scenario.js";

function fixedVariant(): ScenarioVariant {
  if (
    process.argv.length !== 3 ||
    (process.argv[2] !== "observe" && process.argv[2] !== "api")
  ) {
    throw new AdapterError("M2D_TOOL_COMMAND_FAILED");
  }
  return process.argv[2];
}

async function main(): Promise<void> {
  const variant = fixedVariant();
  const result =
    variant === "observe"
      ? await runFixedObserveScenario()
      : await runFixedApiScenario();
  const relativeDirectory = path.join(
    LOCAL_RESULT_DIRECTORY,
    variant,
    result.runId,
  );
  const outputDirectory = path.join(FIXED_REPOSITORY_ROOT, relativeDirectory);
  const relativeSegmentPath = path.join(
    relativeDirectory,
    `${PRODUCER_ID}.jsonl`,
  );
  const relativeSummaryPath = path.join(relativeDirectory, "summary.json");
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(FIXED_REPOSITORY_ROOT, relativeSegmentPath),
    result.rawSegment,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );
  const operationsStarted = variant === "api";
  const summary = Object.freeze({
    status: "success",
    runId: result.runId,
    variant,
    nodeVersion: NODE_VERSION,
    npmLauncherVersion: NPM_VERSION,
    viteVersion: VITE_VERSION,
    rollupVersion: ROLLUP_VERSION,
    esbuildVersion: ESBUILD_VERSION,
    adapterVersion: ADAPTER_VERSION,
    coordinatorPid: result.coordinatorPid,
    producerCount: result.producerCount,
    workerId: result.workerId,
    eventCount: result.eventCount,
    routeCount: result.routeCount,
    capabilityCount: result.capabilityCount,
    toolApiChangeCount: result.toolApiChangeCount,
    producerSequence: "0..14",
    designatedTransformCount: result.designatedTransformCount,
    operationStarted: {
      moduleTransform: operationsStarted,
      emittedAsset: operationsStarted,
      bundleMutation: operationsStarted,
    },
    sourceConfigPluginHashesUnchanged: result.sourceConfigPluginHashesUnchanged,
    inputHashEvidence: result.inputHashEvidence,
    outputEvidence: result.outputEvidence,
    outputFileCount: result.outputEvidence.length,
    directWriteMarkerCreated: result.directWriteMarkerCreated,
    directMarkerOutsideOutDir: true,
    ordinaryOutputWriteIsToolChange: false,
    segmentCloseComplete: result.segmentCloseComplete,
    configTempPreexisting: result.configTempPreexisting,
    configTempPostexisting: result.configTempPostexisting,
    toolTempPreEntryCount: result.toolTempPreEntryCount,
    toolTempPostEntryCount: result.toolTempPostEntryCount,
    cachePreEntryCount: result.cachePreEntryCount,
    cachePostEntryCount: result.cachePostEntryCount,
    outDirPreEntryCount: result.outDirPreEntryCount,
    outDirPostEntryCount: result.outDirPostEntryCount,
    processGroupAbsent: result.processGroupAbsent,
    esbuildResidueAbsent: result.esbuildResidueAbsent,
    cleanupComplete: result.cleanupComplete,
    deterministicProjectionHash: hashBytes(result.deterministicProjection),
  });
  await writeFile(
    path.join(FIXED_REPOSITORY_ROOT, relativeSummaryPath),
    `${JSON.stringify(summary, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

function isAdapterErrorCode(value: unknown): value is AdapterErrorCode {
  return (
    typeof value === "string" &&
    ADAPTER_ERROR_CODES.includes(value as AdapterErrorCode)
  );
}

function expectedEventId(index: number): string | null {
  const orderValue = EXPECTED_EVENT_ORDER[index];
  if (orderValue === undefined) {
    return null;
  }
  const separatorIndex = orderValue.indexOf(":");
  return separatorIndex === -1 ? null : orderValue.slice(separatorIndex + 1);
}

function normalizedProgress(error: ScenarioProgressError): {
  readonly trustedEventCount: number | null;
  readonly lastEventId: string | null;
  readonly progressInvalid: boolean;
} {
  const count = error.trustedEventCount;
  if (count === null) {
    return {
      trustedEventCount: null,
      lastEventId: null,
      progressInvalid: true,
    };
  }
  if (
    !Number.isSafeInteger(count) ||
    count < 0 ||
    count > EXPECTED_EVENT_ORDER.length
  ) {
    return {
      trustedEventCount: null,
      lastEventId: null,
      progressInvalid: true,
    };
  }
  const normalizedLastEventId = count === 0 ? null : expectedEventId(count - 1);
  if (error.lastEventId !== normalizedLastEventId) {
    return {
      trustedEventCount: null,
      lastEventId: null,
      progressInvalid: true,
    };
  }
  return {
    trustedEventCount: count,
    lastEventId: normalizedLastEventId,
    progressInvalid: false,
  };
}

export function createLocalRunnerFailureProjection(error: unknown): object {
  const code =
    error instanceof AdapterError && isAdapterErrorCode(error.code)
      ? error.code
      : "M2D_SCENARIO_FAILED";
  const secondaryCodes =
    error instanceof AdapterError
      ? error.secondaryCodes.filter(isAdapterErrorCode)
      : [];
  if (!(error instanceof ScenarioProgressError)) {
    return Object.freeze({ status: "failure", code, secondaryCodes });
  }
  const progress = normalizedProgress(error);
  const normalizedSecondaryCodes = [...secondaryCodes];
  if (
    progress.progressInvalid &&
    !normalizedSecondaryCodes.includes("M2D_SEGMENT_INVALID")
  ) {
    normalizedSecondaryCodes.push("M2D_SEGMENT_INVALID");
  }
  return Object.freeze({
    status: "failure",
    code,
    secondaryCodes: Object.freeze(normalizedSecondaryCodes),
    trustedEventCount: progress.trustedEventCount,
    lastEventId: progress.lastEventId,
  });
}

async function runLocalRunner(): Promise<void> {
  try {
    await main();
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify(createLocalRunnerFailureProjection(error))}\n`,
    );
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  await runLocalRunner();
}
