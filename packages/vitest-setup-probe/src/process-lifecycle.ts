import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DISPOSABLE_CANARY_VALUE,
  ENVIRONMENT_VARIABLE,
  EXPECTED_FORCE_CLOSE_SIGNAL,
  EXPECTED_GRACEFUL_CLOSE_SIGNAL,
  FIXED_VITEST_ARGUMENTS,
  FORCE_TERMINATION_CLOSE_MS,
  LIFECYCLE_TEST_MAX_OUTPUT_BYTES,
  LIFECYCLE_TEST_TIMEOUT_MS,
  LOOPBACK_PORT_VARIABLE,
  MAX_TOOL_OUTPUT_BYTES,
  OUTER_PROCESS_TIMEOUT_MS,
  PROCESS_RESIDUE_POLL_MS,
  PROCESS_RESIDUE_TIMEOUT_MS,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  TERMINATION_GRACE_MS,
  TOOL_TEMP_ROOT_VARIABLE,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { AdapterErrorCode } from "./errors.js";

export type ProcessLifecycleStage =
  | "primary-failure"
  | "termination-requested"
  | "force-termination-requested"
  | "coordinator-close"
  | "close-disposition-validated"
  | "worker-pool-gone"
  | "settlement-unknown";

export type FixedLifecycleFixtureProcessMode =
  "hang" | "output" | "graceful" | "exit";

export type FixedLifecycleFault =
  | "graceful-signal-failure"
  | "force-signal-failure"
  | "close-deadline"
  | "unexpected-close-disposition"
  | "process-residue";

export interface ToolProcessResult {
  readonly exitCode: number;
  readonly coordinatorPid: number;
}

interface ProcessLifecycleTrace {
  push(stage: ProcessLifecycleStage): unknown;
}

export class ProcessLifecycleError extends AdapterError {
  readonly processSettled: boolean;

  constructor(
    code: ConstructorParameters<typeof AdapterError>[0],
    secondaryCodes: ConstructorParameters<typeof AdapterError>[1],
    processSettled: boolean,
  ) {
    super(code, secondaryCodes);
    this.name = "ProcessLifecycleError";
    this.processSettled = processSettled;
  }
}

interface CloseResult {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
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

const FIXED_ADAPTER_ROOT = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const FIXED_LIFECYCLE_COORDINATOR = path.join(
  FIXED_ADAPTER_ROOT,
  "fixture/lifecycle-coordinator.mjs",
);

function appendStage(
  trace: ProcessLifecycleTrace | undefined,
  stage: ProcessLifecycleStage,
): void {
  trace?.push(stage);
}

function appendSecondary(
  secondaryCodes: AdapterErrorCode[],
  code: AdapterErrorCode,
): void {
  if (!secondaryCodes.includes(code)) {
    secondaryCodes.push(code);
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
    void closePromise.then((result) => finish(result));
  });
}

function fixedGroupExists(processGroupId: number): boolean {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

async function waitForFixedGroupExit(processGroupId: number): Promise<boolean> {
  const deadline = performance.now() + PROCESS_RESIDUE_TIMEOUT_MS;
  while (performance.now() <= deadline) {
    if (!fixedGroupExists(processGroupId)) {
      return true;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, PROCESS_RESIDUE_POLL_MS);
    });
  }
  return !fixedGroupExists(processGroupId);
}

function gracefulTerminateFixedProcessGroup(
  processGroupId: number,
  testFault: FixedLifecycleFault | undefined,
): boolean {
  let delivered = false;
  try {
    process.kill(-processGroupId, "SIGTERM");
    delivered = true;
  } catch (error) {
    delivered = (error as NodeJS.ErrnoException).code === "ESRCH";
  }
  return testFault === "graceful-signal-failure" ? false : delivered;
}

function forceTerminateFixedProcessGroup(
  processGroupId: number,
  testFault: FixedLifecycleFault | undefined,
): boolean {
  let delivered = false;
  try {
    process.kill(-processGroupId, "SIGKILL");
    delivered = true;
  } catch (error) {
    delivered = (error as NodeJS.ErrnoException).code === "ESRCH";
  }
  return testFault === "force-signal-failure" ? false : delivered;
}

async function observedClose(
  closePromise: Promise<CloseResult>,
  timeoutMs: number,
  testFault: FixedLifecycleFault | undefined,
  afterForce: boolean,
): Promise<CloseResult | undefined> {
  const closeResult = await waitForClose(closePromise, timeoutMs);
  if (afterForce && testFault === "close-deadline") {
    return undefined;
  }
  if (
    closeResult !== undefined &&
    testFault === "unexpected-close-disposition"
  ) {
    return Object.freeze({ code: 0, signal: null });
  }
  return closeResult;
}

async function observedGroupExit(
  processGroupId: number,
  testFault: FixedLifecycleFault | undefined,
): Promise<boolean> {
  const groupGone = await waitForFixedGroupExit(processGroupId);
  return testFault === "process-residue" ? false : groupGone;
}

function expectedCloseDisposition(
  closeResult: CloseResult,
  forceRequested: boolean,
): boolean {
  return (
    closeResult.code === null &&
    closeResult.signal ===
      (forceRequested
        ? EXPECTED_FORCE_CLOSE_SIGNAL
        : EXPECTED_GRACEFUL_CLOSE_SIGNAL)
  );
}

async function settleFailedProcess(
  processGroupId: number,
  closePromise: Promise<CloseResult>,
  primaryCode:
    | "M2C_TOOL_TIMEOUT"
    | "M2C_TOOL_OUTPUT_LIMIT"
    | "M2C_TOOL_COMMAND_FAILED"
    | "M2C_PROCESS_RESIDUE",
  trace: ProcessLifecycleTrace | undefined,
  testFault: FixedLifecycleFault | undefined,
): Promise<never> {
  const secondaryCodes: AdapterErrorCode[] = [];
  let forceRequested = false;
  appendStage(trace, "primary-failure");
  appendStage(trace, "termination-requested");
  if (!gracefulTerminateFixedProcessGroup(processGroupId, testFault)) {
    appendSecondary(secondaryCodes, "M2C_GRACEFUL_TERMINATION_FAILED");
  }

  let closeResult = await observedClose(
    closePromise,
    TERMINATION_GRACE_MS,
    testFault,
    false,
  );
  if (closeResult === undefined) {
    forceRequested = true;
    appendStage(trace, "force-termination-requested");
    if (!forceTerminateFixedProcessGroup(processGroupId, testFault)) {
      appendSecondary(secondaryCodes, "M2C_FORCE_TERMINATION_FAILED");
    }
    closeResult = await observedClose(
      closePromise,
      FORCE_TERMINATION_CLOSE_MS,
      testFault,
      true,
    );
  }

  let closeDispositionValid = false;
  if (closeResult === undefined) {
    appendSecondary(secondaryCodes, "M2C_CLOSE_DEADLINE_EXCEEDED");
  } else {
    appendStage(trace, "coordinator-close");
    closeDispositionValid = expectedCloseDisposition(
      closeResult,
      forceRequested,
    );
    if (closeDispositionValid) {
      appendStage(trace, "close-disposition-validated");
    } else {
      appendSecondary(secondaryCodes, "M2C_CLOSE_DISPOSITION_MISMATCH");
    }
  }

  let groupGone = await observedGroupExit(processGroupId, testFault);
  if (!groupGone && !forceRequested) {
    forceRequested = true;
    appendStage(trace, "force-termination-requested");
    if (!forceTerminateFixedProcessGroup(processGroupId, testFault)) {
      appendSecondary(secondaryCodes, "M2C_FORCE_TERMINATION_FAILED");
    }
    groupGone = await observedGroupExit(processGroupId, testFault);
  }
  if (groupGone) {
    appendStage(trace, "worker-pool-gone");
  } else {
    appendSecondary(secondaryCodes, "M2C_PROCESS_RESIDUE");
  }

  const processSettled =
    closeResult !== undefined && closeDispositionValid && groupGone;
  if (!processSettled) {
    appendSecondary(secondaryCodes, "M2C_SETTLEMENT_UNKNOWN");
    appendStage(trace, "settlement-unknown");
  }
  throw new ProcessLifecycleError(primaryCode, secondaryCodes, processSettled);
}

async function runFixedProcess(
  definition: FixedProcessDefinition,
  trace?: ProcessLifecycleTrace,
): Promise<ToolProcessResult> {
  if (process.platform !== "linux") {
    throw new AdapterError("M2C_CONFIG_MISMATCH");
  }
  const child = spawn(definition.executable, [...definition.arguments], {
    cwd: definition.cwd,
    detached: true,
    env: definition.environment,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let resolvePrimary!: (
    code:
      "M2C_TOOL_TIMEOUT" | "M2C_TOOL_OUTPUT_LIMIT" | "M2C_TOOL_COMMAND_FAILED",
  ) => void;
  const primaryPromise = new Promise<
    "M2C_TOOL_TIMEOUT" | "M2C_TOOL_OUTPUT_LIMIT" | "M2C_TOOL_COMMAND_FAILED"
  >((resolve) => {
    resolvePrimary = resolve;
  });
  let primaryFixed = false;
  const fixPrimary = (
    code:
      "M2C_TOOL_TIMEOUT" | "M2C_TOOL_OUTPUT_LIMIT" | "M2C_TOOL_COMMAND_FAILED",
  ): void => {
    if (!primaryFixed) {
      primaryFixed = true;
      resolvePrimary(code);
    }
  };
  child.once("error", () => fixPrimary("M2C_TOOL_COMMAND_FAILED"));
  const coordinatorPid = child.pid;
  if (coordinatorPid === undefined) {
    throw new AdapterError("M2C_TOOL_COMMAND_FAILED");
  }

  const closePromise = new Promise<CloseResult>((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  let outputBytes = 0;
  const consume = (chunk: Buffer): void => {
    outputBytes += chunk.byteLength;
    if (outputBytes > definition.maxOutputBytes) {
      fixPrimary("M2C_TOOL_OUTPUT_LIMIT");
    }
  };
  child.stdout?.on("data", consume);
  child.stderr?.on("data", consume);
  const timer = setTimeout(
    () => fixPrimary("M2C_TOOL_TIMEOUT"),
    definition.timeoutMs,
  );
  timer.unref();

  const first = await Promise.race([
    closePromise.then((close) => ({ kind: "close" as const, close })),
    primaryPromise.then((code) => ({ kind: "failure" as const, code })),
  ]);
  clearTimeout(timer);
  child.stdout?.off("data", consume);
  child.stderr?.off("data", consume);
  child.stdout?.resume();
  child.stderr?.resume();

  if (first.kind === "failure") {
    return settleFailedProcess(
      coordinatorPid,
      closePromise,
      first.code,
      trace,
      definition.testFault,
    );
  }

  appendStage(trace, "coordinator-close");
  if (first.close.signal !== null || first.close.code === null) {
    throw new AdapterError("M2C_TOOL_COMMAND_FAILED");
  }
  appendStage(trace, "close-disposition-validated");
  if (await waitForFixedGroupExit(coordinatorPid)) {
    appendStage(trace, "worker-pool-gone");
  } else {
    return settleFailedProcess(
      coordinatorPid,
      closePromise,
      "M2C_PROCESS_RESIDUE",
      trace,
      definition.testFault,
    );
  }
  return Object.freeze({
    exitCode: first.close.code,
    coordinatorPid,
  });
}

function fixedEnvironment(
  runId: string,
  runRoot: string,
  toolTempRoot: string,
  loopbackPort: number,
): Readonly<Record<string, string>> {
  return Object.freeze({
    [RUN_ID_VARIABLE]: runId,
    [RUN_ROOT_VARIABLE]: runRoot,
    [TOOL_TEMP_ROOT_VARIABLE]: toolTempRoot,
    [LOOPBACK_PORT_VARIABLE]: String(loopbackPort),
    [ENVIRONMENT_VARIABLE]: DISPOSABLE_CANARY_VALUE,
    TMPDIR: toolTempRoot,
    TMP: toolTempRoot,
    TEMP: toolTempRoot,
  });
}

export function runFixedVitestProcess(
  vitestCliPath: string,
  runId: string,
  runRoot: string,
  toolTempRoot: string,
  loopbackPort: number,
  trace?: ProcessLifecycleTrace,
): Promise<ToolProcessResult> {
  return runFixedProcess(
    {
      executable: process.execPath,
      arguments: [vitestCliPath, ...FIXED_VITEST_ARGUMENTS],
      cwd: FIXED_ADAPTER_ROOT,
      environment: fixedEnvironment(runId, runRoot, toolTempRoot, loopbackPort),
      timeoutMs: OUTER_PROCESS_TIMEOUT_MS,
      maxOutputBytes: MAX_TOOL_OUTPUT_BYTES,
    },
    trace,
  );
}

export function runFixedLifecycleFixtureProcess(
  mode: FixedLifecycleFixtureProcessMode,
  fault: FixedLifecycleFault | undefined,
  runId: string,
  runRoot: string,
  toolTempRoot: string,
  loopbackPort: number,
  trace: ProcessLifecycleTrace,
): Promise<ToolProcessResult> {
  return runFixedProcess(
    {
      executable: process.execPath,
      arguments: [FIXED_LIFECYCLE_COORDINATOR, mode],
      cwd: FIXED_ADAPTER_ROOT,
      environment: fixedEnvironment(runId, runRoot, toolTempRoot, loopbackPort),
      timeoutMs: LIFECYCLE_TEST_TIMEOUT_MS,
      maxOutputBytes: LIFECYCLE_TEST_MAX_OUTPUT_BYTES,
      ...(fault === undefined ? {} : { testFault: fault }),
    },
    trace,
  );
}
