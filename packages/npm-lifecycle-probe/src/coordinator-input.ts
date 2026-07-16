import path from "node:path";

import {
  LOOPBACK_PORT_VARIABLE,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { LifecycleInputs } from "./types.js";

function isAllowedRunRoot(value: string): boolean {
  return (
    path.resolve(value) === value &&
    (value.startsWith("/work/m2a-npm-lifecycle-") ||
      value.startsWith("/tmp/tskaigi-npm-lifecycle-m2a-"))
  );
}

export function readLifecycleInputs(): LifecycleInputs {
  const runId = process.env[RUN_ID_VARIABLE];
  const runRoot = process.env[RUN_ROOT_VARIABLE];
  const portValue = process.env[LOOPBACK_PORT_VARIABLE];
  const loopbackPort = Number(portValue);
  if (
    runId === undefined ||
    !/^m2a-npm-lifecycle-[0-9a-f]{32}$/u.test(runId) ||
    runRoot === undefined ||
    !isAllowedRunRoot(runRoot) ||
    portValue === undefined ||
    !/^[0-9]{1,5}$/u.test(portValue) ||
    !Number.isInteger(loopbackPort) ||
    loopbackPort < 1 ||
    loopbackPort > 65_535
  ) {
    throw new AdapterError("M2A_CONTEXT_INVALID");
  }
  return Object.freeze({ runId, runRoot, loopbackPort });
}
