export type FixedViteScenarioId = "vite-observe-p" | "vite-observe-c";
export type FixedViteProfileId = "permissive" | "constrained";

export interface FixedViteScenario {
  readonly scenarioId: FixedViteScenarioId;
  readonly profileId: FixedViteProfileId;
  readonly runId: string;
}

export interface FixedViteInvocation {
  readonly executable: "/usr/local/bin/node";
  readonly arguments: readonly string[];
  readonly environment: Readonly<Record<string, string>>;
  readonly cwd: "/opt/p2/input/packages/vite-plugin-probe";
  readonly shell: false;
}

export interface FixedViteProcessHandle {
  readonly pid: number | undefined;
  onStdout(listener: (chunk: Buffer) => void): void;
  onStderr(listener: (chunk: Buffer) => void): void;
  onceError(listener: () => void): void;
  onceClose(
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): void;
}

export interface FixedViteProcessBackend {
  launch(invocation: FixedViteInvocation): FixedViteProcessHandle;
  processGroupExists(processGroupId: number): boolean;
  signalProcessGroup(
    processGroupId: number,
    signal: "SIGTERM" | "SIGKILL",
  ): boolean;
  waitForProcessGroupExit(
    processGroupId: number,
    timeoutMs: number,
  ): Promise<boolean>;
}

export interface FixedViteProcessLimits {
  readonly timeoutMs: number;
  readonly terminationGraceMs: number;
  readonly settlementMs: number;
  readonly outputBytes: number;
}

export class FixedViteRunnerError extends Error {
  constructor(
    failureCode:
      | "P2_CHILD_FAILED"
      | "P2_CHILD_TIMEOUT"
      | "P2_OUTPUT_LIMIT"
      | "P2_RESULT_INVALID"
      | "P2_SERVER_CLOSE_FAILED",
    settlement: "known" | "unknown",
    settlementCode?:
      "P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN" | null,
  );
  readonly failureCode:
    | "P2_CHILD_FAILED"
    | "P2_CHILD_TIMEOUT"
    | "P2_OUTPUT_LIMIT"
    | "P2_RESULT_INVALID"
    | "P2_SERVER_CLOSE_FAILED";
  readonly settlement: "known" | "unknown";
  readonly settlementCode:
    "P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN" | null;
}

export function resolveFixedViteScenario(scenarioId: string): FixedViteScenario;

export function createFixedViteInvocation(
  definition: FixedViteScenario,
): FixedViteInvocation;

export function executeBoundedViteChildWithBackendForTest(
  invocation: FixedViteInvocation,
  backend: FixedViteProcessBackend,
  limits: FixedViteProcessLimits,
): Promise<void>;

export function closeFixedViteServerWithBackendForTest(
  requestClose: (done: (error?: Error) => void) => void,
  timeoutMs: number,
): Promise<boolean>;

export function executeFixedViteLifecycleWithBackendForTest<T>(
  backend: Readonly<{
    executeChild(): Promise<void>;
    verifyOutput(): Promise<T>;
    closeServer(): Promise<boolean>;
    makeEventSegmentHostReadable(): Promise<void>;
  }>,
): Promise<T>;

export function verifyFixedViteOutputForTest(): Promise<
  Readonly<{
    sourceAfterHash: string;
    outputFiles: readonly Readonly<{
      logicalId: "vite-entry-output";
      bytes: number;
    }>[];
  }>
>;

export function projectFixedViteRunnerFailure(error: unknown): Readonly<{
  status: "failure";
  code: "P2_RUNNER_FAILED";
  failureCode:
    | "P2_CHILD_FAILED"
    | "P2_CHILD_TIMEOUT"
    | "P2_OUTPUT_LIMIT"
    | "P2_RESULT_INVALID"
    | "P2_SERVER_CLOSE_FAILED"
    | "P2_RUNNER_FAILED";
  settlement: "known" | "unknown";
  settlementCode:
    "P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN" | null;
}>;

export function executeFixedViteScenario(): Promise<void>;
