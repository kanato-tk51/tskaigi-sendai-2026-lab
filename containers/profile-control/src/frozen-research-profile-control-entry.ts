import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { parseOrchestratorArguments } from "./orchestrator.js";
import {
  runFixedProductionControls,
  serializeCanonicalPairExecutionResult,
} from "./run-controls.js";

try {
  if (parseOrchestratorArguments(process.argv.slice(2)) !== "run-controls") {
    throw new Error("M4_CONTROL_OPERATION");
  }
  const result = await runFixedProductionControls();
  process.stdout.write(serializeCanonicalPairExecutionResult(result));
  process.exitCode = result.validity === "complete" ? 0 : 1;
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_CONTROL_EXECUTION_FAILED";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
}
