import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PROBE_EVENT_SCHEMA_VERSION } from "@tskaigi-lab/probe-core";
import { ESLint } from "eslint";

import {
  ADAPTER_VERSION,
  ESLINT_VERSION,
  NPM_VERSION,
  PRODUCER_ID,
} from "./constants.js";
import { AdapterError, adapterErrorCode } from "./errors.js";
import { parseScenarioMode, runEslintScenario } from "./scenario.js";

async function main(): Promise<void> {
  if (process.argv.length !== 3) {
    throw new AdapterError("ESLINT_SCENARIO_MODE_UNSUPPORTED");
  }
  const mode = parseScenarioMode(process.argv[2]);
  const result = await runEslintScenario(mode);
  const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
  const relativeDirectory = path.join(
    "results",
    "runs",
    "m2-b-eslint",
    result.runId,
  );
  const outputDirectory = path.join(repositoryRoot, relativeDirectory);
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  const relativeSegmentPath = path.join(
    relativeDirectory,
    `${PRODUCER_ID}.jsonl`,
  );
  await writeFile(
    path.join(repositoryRoot, relativeSegmentPath),
    result.rawSegment,
    { encoding: "utf8", mode: 0o600, flag: "wx" },
  );

  const capabilityOutcomes = { success: 0, failure: 0, skipped: 0 };
  for (const event of result.events) {
    if (event.eventKind === "capability-attempt") {
      capabilityOutcomes[event.outcome] += 1;
    }
  }
  const toolApiChange = result.events.find(
    (event) => event.eventKind === "tool-api-change",
  );
  process.stdout.write(
    `${JSON.stringify({
      schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
      scenarioMode: result.mode,
      nodeVersion: process.version,
      npmVersion: NPM_VERSION,
      eslintVersion: ESLint.version,
      adapterVersion: ADAPTER_VERSION,
      eventCount: result.events.length,
      routeCount: result.routeCounts,
      capabilityOutcome: capabilityOutcomes,
      toolApiChangeOutcome: toolApiChange?.outcome ?? "skipped",
      segmentPath: relativeSegmentPath.split(path.sep).join("/"),
    })}\n`,
  );
}

try {
  if (ESLint.version !== ESLINT_VERSION) {
    throw new AdapterError("ESLINT_VERSION_MISMATCH");
  }
  await main();
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({
      status: "failure",
      code: adapterErrorCode(error),
    })}\n`,
  );
  process.exitCode = 1;
}
