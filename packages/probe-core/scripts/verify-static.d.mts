export interface WorkspacePackageInput {
  readonly name: string;
  readonly directory: string;
  readonly packageJson?: Readonly<Record<string, unknown>>;
}

export interface StaticVerifierInput {
  readonly packageJson: Readonly<Record<string, unknown>>;
  readonly sources: Readonly<Record<string, string>>;
  readonly packageDirectory: string;
  readonly workspacePackages?: readonly WorkspacePackageInput[];
  readonly compilerOptions?: Readonly<Record<string, unknown>>;
}

export interface StaticVerifierResult {
  readonly status: "success" | "failure";
  readonly checkedSourceFiles: number;
  readonly failures: readonly string[];
  readonly limitation: string;
}

export function runtimeSourceFilePolicy(
  fileName: string,
): "supported" | "forbidden-jsx" | "ignored";

export function verifyProbeCoreStaticInputs(
  input: StaticVerifierInput,
): StaticVerifierResult;

export function verifyProbeCoreStaticSafety(): Promise<StaticVerifierResult>;
