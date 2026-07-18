import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { runApprovedOrchestrator } from "./orchestrator.js";

try {
  await runApprovedOrchestrator(process.argv.slice(2));
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_EXECUTION_NOT_APPROVED";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
}
