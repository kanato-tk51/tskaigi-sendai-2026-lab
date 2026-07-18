import path from "node:path";

import {
  CANARY_RELATIVE_PATH,
  INPUT_SNAPSHOT_RELATIVE_PATH,
  LOOPBACK_PORT_VARIABLE,
  OUTPUT_RELATIVE_PATH,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  SCENARIO_ID_VARIABLE,
  VARIANT_VARIABLE,
  VARIANTS,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { CoordinatorInputs } from "./types.js";
import { resolveFixedScenarioContext } from "./scenario-context.js";

export function readCoordinatorInputs(): CoordinatorInputs {
  const runId = process.env[RUN_ID_VARIABLE];
  const runRoot = process.env[RUN_ROOT_VARIABLE];
  const portValue = process.env[LOOPBACK_PORT_VARIABLE];
  const variant = process.env[VARIANT_VARIABLE];
  const requestedScenarioId = process.env[SCENARIO_ID_VARIABLE];
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
    !VARIANTS.includes(variant as (typeof VARIANTS)[number])
  ) {
    throw new AdapterError("M2E_CONTEXT_INVALID");
  }
  const scenarioContext = resolveFixedScenarioContext({
    variant: variant as CoordinatorInputs["variant"],
    runId,
    requestedScenarioId,
  });
  if (
    scenarioContext.selectedProfile
      ? runRoot !== "/tmp/p2-result"
      : !runRoot.startsWith("/tmp/tskaigi-codegen-m2e-")
  ) {
    throw new AdapterError("M2E_CONTEXT_INVALID");
  }
  return Object.freeze({
    runId,
    scenarioId: scenarioContext.scenarioId,
    profileId: scenarioContext.profileId,
    runRoot,
    loopbackPort,
    variant: variant as CoordinatorInputs["variant"],
    outDir:
      scenarioContext.profileId === null
        ? path.join(runRoot, path.dirname(OUTPUT_RELATIVE_PATH))
        : "/tmp/p2-tool/out",
  });
}

export function fixedRuntimePath(
  runRoot: string,
  relativePath: string,
): string {
  const resolved = path.resolve(runRoot, relativePath);
  const relative = path.relative(runRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AdapterError("M2E_CONTEXT_INVALID");
  }
  return resolved;
}

export const FIXED_CANARY_PATH = CANARY_RELATIVE_PATH;
export const FIXED_INPUT_SNAPSHOT_PATH = INPUT_SNAPSHOT_RELATIVE_PATH;
