import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  EXPECTED_FORCE_CLOSE_SIGNAL,
  EXPECTED_GRACEFUL_CLOSE_SIGNAL,
  FIXED_VITE_ARGUMENTS,
  FORCE_TERMINATION_CLOSE_MS,
  MAX_TOOL_OUTPUT_BYTES,
  OUTER_PROCESS_TIMEOUT_MS,
  PROCESS_RESIDUE_POLL_MS,
  PROCESS_RESIDUE_TIMEOUT_MS,
  TERMINATION_GRACE_MS,
} from "./constants.js";
import { ADAPTER_ERROR_CODES, AdapterError } from "./errors.js";
import type { AdapterErrorCode } from "./errors.js";
import { FIXED_ADAPTER_ROOT } from "./paths.js";
import { validateFixedVersions } from "./version-contract.js";

export type ProcessLifecycleStage =
  | "primary-failure"
  | "termination-requested"
  | "force-termination-requested"
  | "coordinator-close"
  | "close-disposition-validated"
  | "process-group-gone"
  | "settlement-unknown";

export type FixedLifecycleFault =
  | "graceful-signal-failure"
  | "force-signal-failure"
  | "close-deadline"
  | "unexpected-close-disposition"
  | "process-residue";

export interface ToolProcessResult {
  readonly coordinatorPid: number;
  readonly closeCode: 0;
  readonly closeSignal: null;
  readonly processGroupAbsent: true;
  readonly esbuildResidueAbsent: true;
}

interface CloseResult {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}

interface ProcessTrace {
  push(stage: ProcessLifecycleStage): unknown;
}

interface FixedProcessDefinition {
  readonly executable: string;
  readonly arguments: readonly string[];
  readonly cwd: string;
  readonly environment: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly maxOutputBytes: number;
  readonly testFault?: FixedLifecycleFault;
}

export class ProcessLifecycleError extends AdapterError {
  readonly processSettled: boolean;

  constructor(
    code: AdapterErrorCode,
    secondaryCodes: readonly AdapterErrorCode[],
    processSettled: boolean,
  ) {
    super(code, secondaryCodes);
    this.name = "ProcessLifecycleError";
    this.processSettled = processSettled;
  }
}

const FIXED_LIFECYCLE_COORDINATOR = fileURLToPath(
  new URL("../fixture/lifecycle-coordinator.mjs", import.meta.url),
);

function appendSecondary(
  codes: AdapterErrorCode[],
  code: AdapterErrorCode,
): void {
  if (!codes.includes(code)) {
    codes.push(code);
  }
}

function waitForClose(
  closePromise: Promise<CloseResult>,
  timeoutMs: number,
): Promise<CloseResult | undefined> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: CloseResult | undefined): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(undefined), timeoutMs);
    void closePromise.then(finish);
  });
}

function processGroupExists(processGroupId: number): boolean {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

async function waitForProcessGroupExit(
  processGroupId: number,
): Promise<boolean> {
  const deadline = performance.now() + PROCESS_RESIDUE_TIMEOUT_MS;
  while (performance.now() <= deadline) {
    if (!processGroupExists(processGroupId)) {
      return true;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, PROCESS_RESIDUE_POLL_MS);
    });
  }
  return !processGroupExists(processGroupId);
}

function signalGroup(
  processGroupId: number,
  signal: "SIGTERM" | "SIGKILL",
): boolean {
  try {
    process.kill(-processGroupId, signal);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ESRCH";
  }
}

async function observedClose(
  closePromise: Promise<CloseResult>,
  timeoutMs: number,
  testFault: FixedLifecycleFault | undefined,
  afterForce: boolean,
): Promise<CloseResult | undefined> {
  const value = await waitForClose(closePromise, timeoutMs);
  if (afterForce && testFault === "close-deadline") {
    return undefined;
  }
  if (value !== undefined && testFault === "unexpected-close-disposition") {
    return Object.freeze({ code: 0, signal: null });
  }
  return value;
}

function expectedDisposition(close: CloseResult, forced: boolean): boolean {
  return (
    close.code === null &&
    close.signal ===
      (forced ? EXPECTED_FORCE_CLOSE_SIGNAL : EXPECTED_GRACEFUL_CLOSE_SIGNAL)
  );
}

async function settleFailedProcess(
  processGroupId: number,
  closePromise: Promise<CloseResult>,
  primaryCode:
    "M2D_TOOL_TIMEOUT" | "M2D_TOOL_OUTPUT_LIMIT" | "M2D_TOOL_COMMAND_FAILED",
  trace: ProcessTrace | undefined,
  fault: FixedLifecycleFault | undefined,
): Promise<never> {
  const secondaryCodes: AdapterErrorCode[] = [];
  trace?.push("primary-failure");
  trace?.push("termination-requested");
  const termDelivered = signalGroup(processGroupId, "SIGTERM");
  if (!termDelivered || fault === "graceful-signal-failure") {
    appendSecondary(secondaryCodes, "M2D_SIGNAL_FAILED");
  }
  let forced = false;
  let close = await observedClose(
    closePromise,
    TERMINATION_GRACE_MS,
    fault,
    false,
  );
  if (close === undefined) {
    forced = true;
    trace?.push("force-termination-requested");
    const killDelivered = signalGroup(processGroupId, "SIGKILL");
    if (!killDelivered || fault === "force-signal-failure") {
      appendSecondary(secondaryCodes, "M2D_SIGNAL_FAILED");
    }
    close = await observedClose(
      closePromise,
      FORCE_TERMINATION_CLOSE_MS,
      fault,
      true,
    );
  }
  let closeValid = false;
  if (close === undefined) {
    appendSecondary(secondaryCodes, "M2D_CLOSE_DEADLINE");
  } else {
    trace?.push("coordinator-close");
    closeValid = expectedDisposition(close, forced);
    if (closeValid) {
      trace?.push("close-disposition-validated");
    } else {
      appendSecondary(secondaryCodes, "M2D_CLOSE_DISPOSITION_MISMATCH");
    }
  }
  let groupGone = await waitForProcessGroupExit(processGroupId);
  if (fault === "process-residue") {
    groupGone = false;
  }
  if (groupGone) {
    trace?.push("process-group-gone");
  } else {
    appendSecondary(secondaryCodes, "M2D_PROCESS_RESIDUE");
    appendSecondary(secondaryCodes, "M2D_ESBUILD_RESIDUE");
  }
  const processSettled = close !== undefined && closeValid && groupGone;
  if (!processSettled) {
    appendSecondary(secondaryCodes, "M2D_SETTLEMENT_UNKNOWN");
    trace?.push("settlement-unknown");
  }
  throw new ProcessLifecycleError(primaryCode, secondaryCodes, processSettled);
}

async function settleResidueAfterClose(
  processGroupId: number,
  primaryCode: "M2D_TOOL_COMMAND_FAILED" | "M2D_ESBUILD_RESIDUE",
): Promise<never> {
  const secondaryCodes: AdapterErrorCode[] = [];
  signalGroup(processGroupId, "SIGTERM");
  if (!(await waitForProcessGroupExit(processGroupId))) {
    signalGroup(processGroupId, "SIGKILL");
  }
  const groupGone = await waitForProcessGroupExit(processGroupId);
  if (!groupGone) {
    appendSecondary(secondaryCodes, "M2D_PROCESS_RESIDUE");
    appendSecondary(secondaryCodes, "M2D_SETTLEMENT_UNKNOWN");
  }
  throw new ProcessLifecycleError(primaryCode, secondaryCodes, groupGone);
}

async function runFixedProcess(
  definition: FixedProcessDefinition,
  trace?: ProcessTrace,
): Promise<ToolProcessResult> {
  if (process.platform !== "linux") {
    throw new AdapterError("M2D_PROCESS_RESIDUE");
  }
  const child = spawn(definition.executable, [...definition.arguments], {
    cwd: definition.cwd,
    env: { ...definition.environment },
    shell: false,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const pid = child.pid;
  if (pid === undefined || pid <= 0) {
    throw new AdapterError("M2D_TOOL_COMMAND_FAILED");
  }
  let outputBytes = 0;
  let outputLimitExceeded = false;
  let diagnosticWindow = "";
  let normalizedToolDiagnostic: AdapterErrorCode | undefined;
  const countOutput = (chunk: Buffer): void => {
    diagnosticWindow = `${diagnosticWindow}${chunk.toString("utf8")}`.slice(
      -512,
    );
    normalizedToolDiagnostic ??= ADAPTER_ERROR_CODES.find((code) =>
      diagnosticWindow.includes(code),
    );
    normalizedToolDiagnostic ??= /failed to load config|config file/iu.test(
      diagnosticWindow,
    )
      ? "M2D_CONFIG_INVALID"
      : /ERR_MODULE_NOT_FOUND|Cannot find (?:module|package)|SyntaxError/iu.test(
            diagnosticWindow,
          )
        ? "M2D_CONTEXT_INVALID"
        : /Build failed|RollupError|TypeError|ReferenceError/iu.test(
              diagnosticWindow,
            )
          ? "M2D_TOOL_CHANGE_INVALID"
          : undefined;
    if (outputLimitExceeded) {
      return;
    }
    outputBytes += chunk.byteLength;
    if (outputBytes > definition.maxOutputBytes) {
      outputLimitExceeded = true;
    }
  };
  child.stdout.on("data", countOutput);
  child.stderr.on("data", countOutput);
  child.stdout.resume();
  child.stderr.resume();
  const closePromise = new Promise<CloseResult>((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
    child.once("error", () => resolve({ code: 1, signal: null }));
  });
  const deadlineResult = await Promise.race([
    closePromise.then((close) => ({ kind: "close" as const, close })),
    new Promise<{ readonly kind: "timeout" }>((resolve) => {
      const timer = setTimeout(
        () => resolve({ kind: "timeout" as const }),
        definition.timeoutMs,
      );
      timer.unref();
    }),
    new Promise<{ readonly kind: "output" }>((resolve) => {
      const poll = (): void => {
        if (outputLimitExceeded) {
          resolve({ kind: "output" as const });
          return;
        }
        if (child.exitCode === null && child.signalCode === null) {
          const timer = setTimeout(poll, 1);
          timer.unref();
        }
      };
      poll();
    }),
  ]);
  if (deadlineResult.kind === "timeout") {
    return settleFailedProcess(
      pid,
      closePromise,
      "M2D_TOOL_TIMEOUT",
      trace,
      definition.testFault,
    );
  }
  if (deadlineResult.kind === "output") {
    return settleFailedProcess(
      pid,
      closePromise,
      "M2D_TOOL_OUTPUT_LIMIT",
      trace,
      definition.testFault,
    );
  }
  const close = deadlineResult.close;
  trace?.push("coordinator-close");
  let groupGone = await waitForProcessGroupExit(pid);
  if (definition.testFault === "process-residue") {
    groupGone = false;
  }
  if (!groupGone) {
    return settleResidueAfterClose(
      pid,
      close.code === 0 && close.signal === null
        ? "M2D_ESBUILD_RESIDUE"
        : "M2D_TOOL_COMMAND_FAILED",
    );
  }
  trace?.push("process-group-gone");
  if (close.code !== 0 || close.signal !== null) {
    throw new ProcessLifecycleError(
      "M2D_TOOL_COMMAND_FAILED",
      normalizedToolDiagnostic === undefined ? [] : [normalizedToolDiagnostic],
      true,
    );
  }
  return Object.freeze({
    coordinatorPid: pid,
    closeCode: 0,
    closeSignal: null,
    processGroupAbsent: true,
    esbuildResidueAbsent: true,
  });
}

export async function runFixedViteProcess(
  environment: Readonly<Record<string, string>>,
  trace?: ProcessTrace,
): Promise<ToolProcessResult> {
  const { viteCliPath } = await validateFixedVersions();
  return runFixedProcess(
    {
      executable: process.execPath,
      arguments: [viteCliPath, ...FIXED_VITE_ARGUMENTS],
      cwd: FIXED_ADAPTER_ROOT,
      environment,
      timeoutMs: OUTER_PROCESS_TIMEOUT_MS,
      maxOutputBytes: MAX_TOOL_OUTPUT_BYTES,
    },
    trace,
  );
}

export async function runFixedLifecycleFixtureForTest(
  mode: "hang" | "output" | "graceful" | "exit" | "nonzero",
  fault?: FixedLifecycleFault,
  trace: ProcessLifecycleStage[] = [],
): Promise<ToolProcessResult> {
  return runFixedProcess(
    {
      executable: process.execPath,
      arguments: [FIXED_LIFECYCLE_COORDINATOR, mode],
      cwd: FIXED_ADAPTER_ROOT,
      environment: {},
      timeoutMs: mode === "hang" || mode === "graceful" ? 100 : 2_000,
      maxOutputBytes: mode === "output" ? 1_024 : 4_096,
      ...(fault === undefined ? {} : { testFault: fault }),
    },
    trace,
  );
}
