import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";
import type { ProbeSession } from "@tskaigi-lab/probe-core";

import { readCoordinatorInputs } from "./coordinator-input.js";
import { AdapterError } from "./errors.js";
import {
  createFixedManifest,
  createFixedRuntimeBindings,
  validateViteManifestContract,
} from "./manifest.js";
import type { CoordinatorInputs } from "./types.js";
import { validateFixedVersions } from "./version-contract.js";

export interface PluginRuntime {
  readonly inputs: CoordinatorInputs;
  readonly adapterRoot: string;
  readonly designatedModuleId: string;
  readonly session: ProbeSession;
}

export async function createPluginRuntime(): Promise<PluginRuntime> {
  await validateFixedVersions();
  const inputs = readCoordinatorInputs();
  const adapterRoot = path.resolve(
    fileURLToPath(new URL("../", import.meta.url)),
  );
  const manifest = createFixedManifest(inputs.runId);
  const runtimeBindings = createFixedRuntimeBindings(
    inputs.runRoot,
    adapterRoot,
    inputs.loopbackPort,
  );
  try {
    const validated = validateProbeConfiguration(manifest, runtimeBindings);
    validateViteManifestContract(validated.manifest);
    const prepared = await prepareProbeConfiguration(validated);
    const session = await createProbeSession(prepared);
    return Object.freeze({
      inputs,
      adapterRoot,
      designatedModuleId: path.join(adapterRoot, "fixture/designated.ts"),
      session,
    });
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2D_CONTEXT_INVALID");
  }
}
