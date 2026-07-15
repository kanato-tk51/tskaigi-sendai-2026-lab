import { tmpdir } from "node:os";

import type { GlobalSetupContext } from "vitest/node";
import { version as runtimeVitestVersion } from "vitest/node";

import {
  assertProvidedBindingPaths,
  assertResolvedConfigContract,
} from "./config-contract.js";
import {
  createFixedProvidedContext,
  validateFixedProvidedContext,
} from "./context.js";
import { readCoordinatorInputs } from "./coordinator-input.js";
import { PROVIDED_CONTEXT_KEY } from "./constants.js";

export default function globalSetup(project: GlobalSetupContext): void {
  const inputs = readCoordinatorInputs();
  const context = validateFixedProvidedContext(
    createFixedProvidedContext(
      inputs.runId,
      inputs.runRoot,
      inputs.loopbackPort,
    ),
  );
  assertProvidedBindingPaths(context, inputs.runRoot);
  assertResolvedConfigContract(
    project,
    inputs.runRoot,
    runtimeVitestVersion,
    tmpdir(),
  );
  project.provide(PROVIDED_CONTEXT_KEY, context);
}
