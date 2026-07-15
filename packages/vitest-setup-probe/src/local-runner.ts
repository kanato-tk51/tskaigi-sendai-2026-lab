import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ADAPTER_VERSION,
  NODE_VERSION,
  NPM_VERSION,
  PRODUCER_ID,
  VITEST_VERSION,
} from "./constants.js";
import { AdapterError, adapterErrorCode } from "./errors.js";
import { runFixedVitestScenario } from "./scenario.js";

async function main(): Promise<void> {
  if (process.argv.length !== 2) {
    throw new AdapterError("M2C_TOOL_COMMAND_FAILED");
  }
  const result = await runFixedVitestScenario();
  const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
  const relativeDirectory = path.join(
    "results",
    "runs",
    "m2-c-vitest",
    result.runId,
  );
  const outputDirectory = path.join(repositoryRoot, relativeDirectory);
  const relativeSegmentPath = path.join(
    relativeDirectory,
    `${PRODUCER_ID}.jsonl`,
  );
  const relativeSummaryPath = path.join(relativeDirectory, "summary.json");
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(repositoryRoot, relativeSegmentPath),
    result.rawSegment,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );
  const summary = Object.freeze({
    status: "success",
    runId: result.runId,
    nodeVersion: NODE_VERSION,
    npmVersion: NPM_VERSION,
    vitestVersion: VITEST_VERSION,
    adapterVersion: ADAPTER_VERSION,
    coordinatorPid: result.coordinatorPid,
    workerPid: result.workerPid,
    workerPpid: result.workerPpid,
    eventCount: result.eventCount,
    routeCount: result.routeCount,
    capabilityCount: result.capabilityCount,
    toolApiChangeCount: result.toolApiChangeCount,
    testFileCount: result.coordinatorReport.testFileCount,
    testCaseCount: result.coordinatorReport.testCaseCount,
    sourceHashUnchanged: result.sourceHashUnchanged,
    directWriteMarkerCreated: result.directWriteMarkerCreated,
    segmentCloseComplete: result.segmentCloseComplete,
    toolTempPreEntryCount: result.toolTempPreEntryCount,
    toolTempPostEntryCount: result.toolTempPostEntryCount,
    toolCachePreEntryCount: result.toolCachePreEntryCount,
    toolCachePostEntryCount: result.toolCachePostEntryCount,
    configTempPreexisting: result.configTempPreexisting,
    configTempPostexisting: result.configTempPostexisting,
    toolTempCleanupComplete: result.toolTempCleanupComplete,
    runRootCleanupComplete: result.runRootCleanupComplete,
    segmentPath: relativeSegmentPath.split(path.sep).join("/"),
  });
  await writeFile(
    path.join(repositoryRoot, relativeSummaryPath),
    `${JSON.stringify(summary, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ status: "failure", code: adapterErrorCode(error) })}\n`,
  );
  process.exitCode = 1;
}
