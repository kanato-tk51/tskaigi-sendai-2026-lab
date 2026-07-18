import process from "node:process";

import { FIXED_SCENARIO_ID } from "./constants.js";
import { LabError } from "./errors.js";
import { runFixedScenario } from "./runner.js";

export interface ParsedCliArguments {
  readonly command: "run";
  readonly scenarioId: typeof FIXED_SCENARIO_ID;
}

export function parseCliArguments(argv: readonly string[]): ParsedCliArguments {
  if (argv.length !== 2 || argv[0] !== "run" || argv[1] !== FIXED_SCENARIO_ID) {
    throw new LabError("INVALID_SCENARIO_DEFINITION");
  }
  return Object.freeze({ command: "run", scenarioId: FIXED_SCENARIO_ID });
}

export async function main(argv: readonly string[]): Promise<number> {
  try {
    const parsed = parseCliArguments(argv);
    const result = await runFixedScenario(parsed.scenarioId);
    process.stdout.write(
      `${JSON.stringify({
        runId: result.runId,
        scenarioId: result.scenarioId,
        validity: result.validity,
        evidenceLocation: result.evidenceLocation,
      })}\n`,
    );
    return result.validity === "complete" ? 0 : 1;
  } catch (error) {
    const code =
      error instanceof LabError ? error.code : "INVALID_COLLECTION_INPUT";
    process.stderr.write(`${JSON.stringify({ errorCode: code })}\n`);
    return 1;
  }
}
