import path from "node:path";

import {
  CONFIG_RELATIVE_PATH,
  DESIGNATED_RELATIVE_PATH,
  ENTRY_RELATIVE_PATH,
  PLUGIN_RUNTIME_SOURCE_RELATIVE_PATH,
  PLUGIN_SOURCE_RELATIVE_PATH,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import { hashFile } from "./hash.js";
import { FIXED_ADAPTER_ROOT } from "./paths.js";
import type { InputHashEvidence } from "./types.js";

export const APPROVED_INPUTS = Object.freeze([
  {
    logicalId: "vite-fixture-entry",
    relativePath: ENTRY_RELATIVE_PATH,
    hash: "sha256:d259a7ec20036a8d289c95bbbe254df4278a7a7ca520cb46889eca1b08c3c382",
  },
  {
    logicalId: "vite-fixture-designated",
    relativePath: DESIGNATED_RELATIVE_PATH,
    hash: "sha256:379ba4149c5492855bdbbcd7a9f207c223cc8578dc62e51228e06416354ab770",
  },
  {
    logicalId: "vite-scenario-config",
    relativePath: CONFIG_RELATIVE_PATH,
    hash: "sha256:605e2c0be2e7ee124d60beeab093b9487f46381fc5c9c4e49c71496d65994427",
  },
  {
    logicalId: "vite-plugin-entry-source",
    relativePath: PLUGIN_SOURCE_RELATIVE_PATH,
    hash: "sha256:8290cadad71fa2a4f00650540e3234b1f398dfe50382b860e37921d9c17b6590",
  },
  {
    logicalId: "vite-plugin-runtime-source",
    relativePath: PLUGIN_RUNTIME_SOURCE_RELATIVE_PATH,
    hash: "sha256:b90ddbdfe8df1298318b2ffcdad4fdd4e6898ea5cbfb81b6a0b4dc395c62bd92",
  },
] as const);

export async function captureApprovedInputHashes(): Promise<
  readonly InputHashEvidence[]
> {
  const evidence: InputHashEvidence[] = [];
  for (const input of APPROVED_INPUTS) {
    const actual = await hashFile(
      path.join(FIXED_ADAPTER_ROOT, input.relativePath),
    );
    if (actual.hash !== input.hash) {
      throw new AdapterError("M2D_OUTPUT_INVALID");
    }
    evidence.push(
      Object.freeze({
        logicalId: input.logicalId,
        hash: actual.hash,
        sizeBytes: actual.sizeBytes,
      }),
    );
  }
  return Object.freeze(evidence);
}

export async function assertApprovedInputHashesUnchanged(
  before: readonly InputHashEvidence[],
): Promise<void> {
  const after = await captureApprovedInputHashes();
  if (
    before.length !== after.length ||
    before.some(
      (value, index) =>
        value.logicalId !== after[index]?.logicalId ||
        value.hash !== after[index]?.hash ||
        value.sizeBytes !== after[index]?.sizeBytes,
    )
  ) {
    throw new AdapterError("M2D_OUTPUT_INVALID");
  }
}
