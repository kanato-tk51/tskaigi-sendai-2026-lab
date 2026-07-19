import path from "node:path";

import {
  CACHE_RELATIVE_PATH,
  OUT_DIR_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import { resolveFixedScenarioContext } from "./scenario-context.js";
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

function readScenarioId(): string | undefined {
  return process.env.PROBE_CANARY_M2D_SCENARIO_ID;
}

export function readCoordinatorInputs(): CoordinatorInputs {
  const runId = readRunId();
  const runRoot = readRunRoot();
  const portValue = readLoopbackPort();
  const variant = readVariant();
  const requestedScenarioId = readScenarioId();
  const loopbackPort = Number(portValue);
  if (
    runId === undefined ||
    runRoot === undefined ||
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
  const scenarioContext = resolveFixedScenarioContext({
    variant,
    runId,
    requestedScenarioId,
  });
  if (
    scenarioContext.selectedProfile
      ? runRoot !== "/tmp/p2-result"
      : !runRoot.startsWith("/tmp/tskaigi-vite-m2d-")
  ) {
    throw new AdapterError("M2D_CONTEXT_INVALID");
  }
  const toolRoot =
    scenarioContext.profileId === null ? runRoot : "/tmp/p2-tool";
  return Object.freeze({
    runId,
    scenarioId: scenarioContext.scenarioId,
    profileId: scenarioContext.profileId,
    runRoot,
    toolRoot,
    loopbackPort,
    variant,
    toolTempRoot: path.join(toolRoot, TOOL_TEMP_RELATIVE_PATH),
    cacheDir: path.join(toolRoot, CACHE_RELATIVE_PATH),
    outDir: path.join(toolRoot, OUT_DIR_RELATIVE_PATH),
  });
}
