import { failProfile } from "./errors.js";
import { readPlainArray } from "./safe-data.js";

export const ORCHESTRATOR_OPERATIONS = Object.freeze([
  "doctor",
  "build",
  "run-controls",
  "verify",
  "clean",
] as const);

export type OrchestratorOperation = (typeof ORCHESTRATOR_OPERATIONS)[number];

export function parseOrchestratorArguments(
  argv: readonly string[],
): OrchestratorOperation {
  const args = readPlainArray(argv, "ORCHESTRATOR_ARGUMENT_REJECTED");
  if (
    args.length !== 1 ||
    !ORCHESTRATOR_OPERATIONS.includes(args[0] as OrchestratorOperation)
  ) {
    return failProfile("ORCHESTRATOR_ARGUMENT_REJECTED");
  }
  return args[0] as OrchestratorOperation;
}

export async function runApprovedOrchestrator(
  argv: readonly string[],
): Promise<never> {
  parseOrchestratorArguments(argv);
  return failProfile("M4_EXECUTION_NOT_APPROVED");
}
