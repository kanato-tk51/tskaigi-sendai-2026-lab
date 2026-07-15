import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";
import { inject } from "vitest";

import { validateFixedProvidedContext } from "./context.js";
import { preservePrimaryFailure } from "./errors.js";
import { validateVitestManifestContract } from "./manifest.js";
import { ATTEMPT_IDS, PROVIDED_CONTEXT_KEY, ROUTE_IDS } from "./constants.js";

interface WorkerGuard {
  capabilityExecutionStarted: boolean;
}

const WORKER_GUARD_KEY = Symbol.for(
  "@tskaigi-lab/adapter-vitest-setup/worker-guard/v1",
);
const workerGlobal = globalThis as typeof globalThis & {
  [WORKER_GUARD_KEY]?: WorkerGuard;
};
const workerGuard = (workerGlobal[WORKER_GUARD_KEY] ??= {
  capabilityExecutionStarted: false,
});

const context = validateFixedProvidedContext(inject(PROVIDED_CONTEXT_KEY));
validateVitestManifestContract(context.manifest);
const validated = validateProbeConfiguration(
  context.manifest,
  context.runtimeBindings,
);
const prepared = await prepareProbeConfiguration(validated);
const session = await createProbeSession(prepared);
let primaryFailure: unknown;

try {
  await session.recordRouteInvocation(ROUTE_IDS.lateModuleCheckpoint, {
    outcome: "success",
  });
  await session.recordRouteInvocation(ROUTE_IDS.setupBodyCheckpoint, {
    outcome: "success",
  });

  if (!workerGuard.capabilityExecutionStarted) {
    workerGuard.capabilityExecutionStarted = true;
    await session.runAttempt(ATTEMPT_IDS.environment);
    await session.runAttempt(ATTEMPT_IDS.fileRead);
    await session.runAttempt(ATTEMPT_IDS.fileHash);
    await session.runAttempt(ATTEMPT_IDS.fileWrite);
    await session.runAttempt(ATTEMPT_IDS.loopback);
    await session.runAttempt(ATTEMPT_IDS.child);
  }
} catch (error) {
  primaryFailure = error;
}

try {
  await session.close();
} catch (cleanupFailure) {
  if (primaryFailure !== undefined) {
    throw preservePrimaryFailure(primaryFailure, cleanupFailure);
  }
  throw cleanupFailure;
}

if (primaryFailure !== undefined) {
  throw primaryFailure;
}
