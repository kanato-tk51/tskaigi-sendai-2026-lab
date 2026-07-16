import { pathToFileURL } from "node:url";
import path from "node:path";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";

import { ATTEMPT_IDS, NODE_VERSION, ROUTE_ID } from "./constants.js";
import { readLifecycleInputs } from "./coordinator-input.js";
import { AdapterError, errorCode } from "./errors.js";
import {
  createLifecycleManifest,
  createLifecycleRuntimeBindings,
  validateLifecycleManifest,
} from "./manifest.js";

const ATTEMPT_ORDER = Object.freeze([
  ATTEMPT_IDS.environment,
  ATTEMPT_IDS.fileRead,
  ATTEMPT_IDS.fileHash,
  ATTEMPT_IDS.fileWrite,
  ATTEMPT_IDS.loopback,
  ATTEMPT_IDS.child,
] as const);

export async function runLifecycleProbe(): Promise<void> {
  const inputs = readLifecycleInputs();
  const manifest = createLifecycleManifest(inputs.runId);
  validateLifecycleManifest(manifest);
  const validated = validateProbeConfiguration(
    manifest,
    createLifecycleRuntimeBindings(inputs.runRoot, inputs.loopbackPort),
  );
  const prepared = await prepareProbeConfiguration(validated);
  const session = await createProbeSession(prepared);
  try {
    await session.recordRouteInvocation(ROUTE_ID, { outcome: "success" });
    for (const attemptId of ATTEMPT_ORDER) {
      await session.runAttempt(attemptId);
    }
    await session.close();
  } catch (error) {
    await session.close().catch(() => undefined);
    throw error;
  }
}

function assertRuntimeVersion(): void {
  if (process.version !== NODE_VERSION) {
    throw new AdapterError("M2A_VERSION_MISMATCH");
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    assertRuntimeVersion();
    await runLifecycleProbe();
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ status: "failure", code: errorCode(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
