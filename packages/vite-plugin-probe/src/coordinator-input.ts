import path from "node:path";

import {
  CACHE_RELATIVE_PATH,
  OUT_DIR_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { CoordinatorInputs } from "./types.js";

function readRunId(): string | undefined {
  return process.env.PROBE_CANARY_M2D_RUN_ID;
}

function readRunRoot(): string | undefined {
  return process.env.PROBE_CANARY_M2D_RUN_ROOT;
}

function readLoopbackPort(): string | undefined {
  return process.env.PROBE_CANARY_M2D_LOOPBACK_PORT;
}

function readVariant(): string | undefined {
  return process.env.PROBE_CANARY_M2D_VARIANT;
}

export function readCoordinatorInputs(): CoordinatorInputs {
  const runId = readRunId();
  const runRoot = readRunRoot();
  const portValue = readLoopbackPort();
  const variant = readVariant();
  const loopbackPort = Number(portValue);
  if (
    runId === undefined ||
    !/^m2d-vite-[0-9a-f]{32}$/u.test(runId) ||
    runRoot === undefined ||
    !runRoot.startsWith("/tmp/tskaigi-vite-m2d-") ||
    path.resolve(runRoot) !== runRoot ||
    portValue === undefined ||
    !/^[0-9]{1,5}$/u.test(portValue) ||
    !Number.isInteger(loopbackPort) ||
    loopbackPort < 1 ||
    loopbackPort > 65_535 ||
    (variant !== "observe" && variant !== "api")
  ) {
    throw new AdapterError("M2D_CONTEXT_INVALID");
  }
  return Object.freeze({
    runId,
    runRoot,
    loopbackPort,
    variant,
    toolTempRoot: path.join(runRoot, TOOL_TEMP_RELATIVE_PATH),
    cacheDir: path.join(runRoot, CACHE_RELATIVE_PATH),
    outDir: path.join(runRoot, OUT_DIR_RELATIVE_PATH),
  });
}
