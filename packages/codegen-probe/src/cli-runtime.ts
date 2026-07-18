import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";
import type { ProbeSession } from "@tskaigi-lab/probe-core";

import { readCoordinatorInputs } from "./coordinator-input.js";
import { ADAPTER_VERSION, NODE_VERSION, NPM_VERSION } from "./constants.js";
import { AdapterError } from "./errors.js";
import {
  createFixedManifest,
  createFixedRuntimeBindings,
  createSelectedProfileRuntimeBindings,
  validateManifestContract,
} from "./manifest.js";
import type { CoordinatorInputs } from "./types.js";

export interface CliRuntime {
  readonly inputs: CoordinatorInputs;
  readonly packageRoot: string;
  readonly inputPath: string;
  readonly outputPath: string;
  readonly session: ProbeSession;
}

export async function createCliRuntime(): Promise<CliRuntime> {
  if (process.version !== NODE_VERSION) {
    throw new AdapterError("M2E_VERSION_MISMATCH");
  }
  if (ADAPTER_VERSION !== "0.0.0" || NPM_VERSION !== "11.12.1") {
    throw new AdapterError("M2E_VERSION_MISMATCH");
  }
  const inputs = readCoordinatorInputs();
  const packageRoot = path.resolve(
    fileURLToPath(new URL("../", import.meta.url)),
  );
  const manifest = createFixedManifest(
    inputs.variant,
    inputs.runId,
    inputs.scenarioId,
  );
  validateManifestContract(manifest, inputs.variant, inputs.scenarioId);
  const validated = validateProbeConfiguration(
    manifest,
    inputs.profileId === null
      ? createFixedRuntimeBindings(inputs.runRoot, inputs.loopbackPort)
      : createSelectedProfileRuntimeBindings(inputs.loopbackPort),
  );
  const prepared = await prepareProbeConfiguration(validated);
  const session = await createProbeSession(prepared);
  return Object.freeze({
    inputs,
    packageRoot,
    inputPath: path.join(packageRoot, "fixture/input.txt"),
    outputPath: path.join(inputs.outDir, "generated-artifact.txt"),
    session,
  });
}
