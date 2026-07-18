import { mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { collectRun } from "./collector.js";
import { FIXED_RESULTS_LOCATION, FIXED_SCENARIO_ID } from "./constants.js";
import { LabError } from "./errors.js";
import { createFixedFixture } from "./fixture.js";
import {
  persistFixtureRun,
  regenerateFixtureRunInOwnedRoot,
} from "./persistence.js";
import { assertId } from "./safe-data.js";
import { validateScenarioDefinition } from "./scenario.js";
import type { CollectionResult, ScenarioDefinition } from "./types.js";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const scenarioPath = path.join(
  repositoryRoot,
  "scenarios",
  `${FIXED_SCENARIO_ID}.json`,
);

async function loadFixedDefinition(): Promise<ScenarioDefinition> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(scenarioPath, "utf8")) as unknown;
  } catch {
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
  const definition = validateScenarioDefinition(parsed);
  if (definition.scenarioId !== FIXED_SCENARIO_ID) {
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
  return definition;
}

export interface FixedRunResult {
  readonly runId: string;
  readonly scenarioId: typeof FIXED_SCENARIO_ID;
  readonly validity: CollectionResult["validity"];
  readonly evidenceLocation: string;
}

export async function runFixedScenarioInOwnedRoot(
  outputRoot: string,
  runIdInput: string,
): Promise<FixedRunResult> {
  const runId = assertId(runIdInput, "INVALID_COLLECTION_INPUT");
  const definition = await loadFixedDefinition();
  const fixture = createFixedFixture(definition, runId);
  const result = collectRun(fixture);
  await persistFixtureRun(
    outputRoot,
    fixture.snapshot,
    fixture.completion,
    fixture.segments,
    result,
  );
  return Object.freeze({
    runId,
    scenarioId: FIXED_SCENARIO_ID,
    validity: result.validity,
    evidenceLocation: `${FIXED_RESULTS_LOCATION}/${runId}`,
  });
}

export async function regenerateFixedScenarioInOwnedRoot(
  outputRoot: string,
  runIdInput: string,
): Promise<FixedRunResult> {
  const runId = assertId(runIdInput, "INVALID_COLLECTION_INPUT");
  const result = await regenerateFixtureRunInOwnedRoot(outputRoot, runId);
  return Object.freeze({
    runId,
    scenarioId: FIXED_SCENARIO_ID,
    validity: result.validity,
    evidenceLocation: `${FIXED_RESULTS_LOCATION}/${runId}`,
  });
}

async function fixedOutputRoot(): Promise<string> {
  const canonicalRepositoryRoot = await realpath(repositoryRoot);
  const resultsRoot = path.join(canonicalRepositoryRoot, "results");
  const runsRoot = path.join(resultsRoot, "runs");
  if (
    (await realpath(resultsRoot)) !== resultsRoot ||
    (await realpath(runsRoot)) !== runsRoot
  ) {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  const outputRoot = path.join(
    canonicalRepositoryRoot,
    ...FIXED_RESULTS_LOCATION.split("/"),
  );
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  if ((await realpath(outputRoot)) !== outputRoot) {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  return outputRoot;
}

export async function runFixedScenario(
  scenarioId: string,
): Promise<FixedRunResult> {
  if (scenarioId !== FIXED_SCENARIO_ID) {
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
  const runId = `m3-${randomUUID()}`;
  return runFixedScenarioInOwnedRoot(await fixedOutputRoot(), runId);
}

export async function regenerateFixedScenario(
  runIdInput: string,
): Promise<FixedRunResult> {
  return regenerateFixedScenarioInOwnedRoot(
    await fixedOutputRoot(),
    runIdInput,
  );
}
