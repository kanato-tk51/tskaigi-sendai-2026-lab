import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ADAPTER_VERSION,
  CODEGEN_VERSION,
  EXPECTED_EVENT_ORDER,
  LOCAL_RESULT_DIRECTORY,
  NODE_VERSION,
  NPM_VERSION,
  PRODUCER_ID,
} from "./constants.js";
import { AdapterError, errorCode } from "./errors.js";
import { hashBytes } from "./hash.js";
import { FIXED_REPOSITORY_ROOT } from "./paths.js";
import {
  runFixedApiScenario,
  runFixedDryRunScenario,
  runFixedObserveScenario,
} from "./scenario.js";
import type { ScenarioVariant } from "./constants.js";

function parseVariant(): ScenarioVariant {
  if (process.argv.length !== 3) {
    throw new AdapterError("M2E_ARGUMENTS_INVALID");
  }
  const variant = process.argv[2];
  if (variant !== "observe" && variant !== "api" && variant !== "dry-run") {
    throw new AdapterError("M2E_ARGUMENTS_INVALID");
  }
  return variant;
}

async function main(): Promise<void> {
  const variant = parseVariant();
  const result =
    variant === "observe"
      ? await runFixedObserveScenario()
      : variant === "api"
        ? await runFixedApiScenario()
        : await runFixedDryRunScenario();
  const relativeDirectory = path.join(
    LOCAL_RESULT_DIRECTORY,
    variant,
    result.runId,
  );
  const outputDirectory = path.join(FIXED_REPOSITORY_ROOT, relativeDirectory);
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(outputDirectory, `${PRODUCER_ID}.jsonl`),
    result.rawSegment,
    {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    },
  );
  await writeFile(
    path.join(outputDirectory, "summary.json"),
    `${JSON.stringify(
      {
        status: "success",
        runId: result.runId,
        variant,
        nodeVersion: NODE_VERSION,
        npmLauncherVersion: NPM_VERSION,
        codegenVersion: CODEGEN_VERSION,
        adapterVersion: ADAPTER_VERSION,
        coordinatorPid: result.coordinatorPid,
        producerId: PRODUCER_ID,
        producerCount: result.producerCount,
        workerId: result.workerId,
        eventCount: result.eventCount,
        routeCount: result.routeCount,
        capabilityCount: result.capabilityCount,
        toolApiChangeCount: result.toolApiChangeCount,
        producerSequence: `0..${EXPECTED_EVENT_ORDER.length - 1}`,
        directWriteMarkerCreated: result.directWriteMarkerCreated,
        outputEvidence: result.outputEvidence,
        inputEvidence: result.inputEvidence,
        cleanupComplete: result.cleanupComplete,
        deterministicProjectionHash: hashBytes(
          Buffer.from(
            JSON.stringify({
              variant,
              events: result.events,
              output: result.outputEvidence,
            }),
          ),
        ),
      },
      null,
      2,
    )}\n`,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );
  process.stdout.write(
    `${JSON.stringify({
      status: "success",
      runId: result.runId,
      variant,
      nodeVersion: NODE_VERSION,
      npmLauncherVersion: NPM_VERSION,
      codegenVersion: CODEGEN_VERSION,
      eventCount: result.eventCount,
      routeCount: result.routeCount,
      capabilityCount: result.capabilityCount,
      toolApiChangeCount: result.toolApiChangeCount,
      producerSequence: `0..${EXPECTED_EVENT_ORDER.length - 1}`,
      directWriteMarkerCreated: result.directWriteMarkerCreated,
      outputFileCount: result.outputEvidence.length,
      cleanupComplete: result.cleanupComplete,
    })}\n`,
  );
}

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ status: "failure", code: errorCode(error) })}\n`,
  );
  process.exitCode = 1;
}
