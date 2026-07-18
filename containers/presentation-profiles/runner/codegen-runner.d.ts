export type FixedCodegenScenarioId = "codegen-observe-p" | "codegen-observe-c";
export type FixedCodegenProfileId = "permissive" | "constrained";

export interface FixedCodegenScenario {
  readonly scenarioId: FixedCodegenScenarioId;
  readonly profileId: FixedCodegenProfileId;
  readonly runId: string;
}

export interface FixedCodegenInvocation {
  readonly executable: "/usr/local/bin/node";
  readonly arguments: readonly string[];
  readonly environment: Readonly<Record<string, string>>;
  readonly cwd: "/opt/p2/input/codegen";
  readonly shell: false;
}

export function resolveFixedCodegenScenario(
  scenarioId: string,
): FixedCodegenScenario;

export function createFixedCodegenInvocation(
  definition: FixedCodegenScenario,
): FixedCodegenInvocation;

export function executeFixedCodegenScenario(): Promise<void>;
