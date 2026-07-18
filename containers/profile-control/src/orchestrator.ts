import { failProfile } from "./errors.js";

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
  if (
    argv.length !== 1 ||
    !ORCHESTRATOR_OPERATIONS.includes(argv[0] as OrchestratorOperation)
  ) {
    return failProfile("ORCHESTRATOR_ARGUMENT_REJECTED");
  }
  return argv[0] as OrchestratorOperation;
}

export async function runApprovedOrchestrator(
  argv: readonly string[],
): Promise<never> {
  parseOrchestratorArguments(argv);
  return failProfile("M4_EXECUTION_NOT_APPROVED");
}
