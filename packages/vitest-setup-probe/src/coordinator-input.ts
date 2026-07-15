import path from "node:path";

import {
  LOOPBACK_PORT_VARIABLE,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  TOOL_TEMP_RELATIVE_PATH,
  TOOL_TEMP_ROOT_VARIABLE,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export interface CoordinatorInputs {
  readonly runId: string;
  readonly runRoot: string;
  readonly toolTempRoot: string;
  readonly loopbackPort: number;
}

function readRunId(): string | undefined {
  return process.env.PROBE_CANARY_M2C_RUN_ID;
}

function readRunRoot(): string | undefined {
  return process.env.PROBE_CANARY_M2C_RUN_ROOT;
}

function readLoopbackPort(): string | undefined {
  return process.env.PROBE_CANARY_M2C_LOOPBACK_PORT;
}

function readToolTempRoot(): string | undefined {
  return process.env.PROBE_CANARY_M2C_TOOL_TEMP_ROOT;
}

export function readCoordinatorInputs(): CoordinatorInputs {
  const runId = readRunId();
  const runRoot = readRunRoot();
  const toolTempRoot = readToolTempRoot();
  const portValue = readLoopbackPort();
  const loopbackPort = Number(portValue);
  if (
    runId === undefined ||
    !/^m2c-vitest-[0-9a-f]{32}$/u.test(runId) ||
    runRoot === undefined ||
    !runRoot.startsWith("/tmp/tskaigi-vitest-m2c-") ||
    path.resolve(runRoot) !== runRoot ||
    toolTempRoot === undefined ||
    toolTempRoot !== path.join(runRoot, TOOL_TEMP_RELATIVE_PATH) ||
    portValue === undefined ||
    !/^[0-9]{1,5}$/u.test(portValue) ||
    !Number.isInteger(loopbackPort) ||
    loopbackPort < 1 ||
    loopbackPort > 65_535
  ) {
    throw new AdapterError("M2C_CONTEXT_INVALID");
  }
  return Object.freeze({ runId, runRoot, toolTempRoot, loopbackPort });
}

export const COORDINATOR_INPUT_VARIABLES = Object.freeze([
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  LOOPBACK_PORT_VARIABLE,
  TOOL_TEMP_ROOT_VARIABLE,
] as const);
