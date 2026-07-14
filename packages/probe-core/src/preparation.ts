import { ProbeError } from "./errors.js";
import {
  prepareFileTargets,
  type PreparedFileTarget,
} from "./file-preflight.js";
import type {
  PreparedProbeConfiguration,
  ValidatedProbeConfiguration,
} from "./types.js";
import { getValidatedProbeConfigurationSnapshot } from "./validation.js";

type ValidatedSnapshot = ReturnType<
  typeof getValidatedProbeConfigurationSnapshot
>;

export interface InternalPreparedProbeConfiguration extends ValidatedSnapshot {
  readonly fileTargets: readonly PreparedFileTarget[];
}

const preparedConfigurations = new WeakMap<
  object,
  InternalPreparedProbeConfiguration
>();

export async function prepareProbeConfiguration(
  configuration: ValidatedProbeConfiguration,
): Promise<PreparedProbeConfiguration> {
  const validated = getValidatedProbeConfigurationSnapshot(configuration);
  try {
    const fileTargets = await prepareFileTargets(
      validated.manifest,
      validated.runtimeBindings,
    );
    const internalSnapshot = Object.freeze({
      ...validated,
      fileTargets,
    });
    const prepared = Object.freeze({
      manifest: validated.manifest,
      runtimeBindings: validated.runtimeBindings,
    }) as PreparedProbeConfiguration;
    preparedConfigurations.set(prepared, internalSnapshot);
    return prepared;
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError("INTERNAL_ERROR");
  }
}

export function getPreparedProbeConfigurationSnapshot(
  configuration: PreparedProbeConfiguration,
): InternalPreparedProbeConfiguration {
  const snapshot = preparedConfigurations.get(configuration);
  if (snapshot === undefined) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  return snapshot;
}
