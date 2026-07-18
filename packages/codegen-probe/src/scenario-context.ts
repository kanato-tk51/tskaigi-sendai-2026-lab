import {
  SCENARIO_ID_PREFIX,
  SELECTED_PROFILE_SCENARIO_IDS,
} from "./constants.js";
import type {
  CodegenScenarioId,
  ScenarioVariant,
  SelectedProfileScenarioId,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export type SelectedProfileId = "permissive" | "constrained";

export interface FixedScenarioContext {
  readonly scenarioId: CodegenScenarioId;
  readonly runId: string;
  readonly profileId: SelectedProfileId | null;
  readonly selectedProfile: boolean;
}

interface SelectedContextDefinition {
  readonly scenarioId: SelectedProfileScenarioId;
  readonly runId: string;
  readonly profileId: SelectedProfileId;
}

const SELECTED_CONTEXTS: readonly SelectedContextDefinition[] = Object.freeze([
  Object.freeze({
    scenarioId: SELECTED_PROFILE_SCENARIO_IDS[0],
    runId: "p2-codegen-observe-p-20260719-01",
    profileId: "permissive",
  }),
  Object.freeze({
    scenarioId: SELECTED_PROFILE_SCENARIO_IDS[1],
    runId: "p2-codegen-observe-c-20260719-01",
    profileId: "constrained",
  }),
]);

function localRunId(variant: ScenarioVariant, runId: string): boolean {
  return new RegExp(`^m2e-codegen-${variant}-[0-9a-f]{32}$`, "u").test(runId);
}

export function resolveFixedScenarioContext(input: {
  readonly variant: ScenarioVariant;
  readonly runId: string;
  readonly requestedScenarioId: string | undefined;
}): FixedScenarioContext {
  if (input.requestedScenarioId === undefined) {
    if (!localRunId(input.variant, input.runId)) {
      throw new AdapterError("M2E_CONTEXT_INVALID");
    }
    return Object.freeze({
      scenarioId: `${SCENARIO_ID_PREFIX}-${input.variant}`,
      runId: input.runId,
      profileId: null,
      selectedProfile: false,
    });
  }

  const selected = SELECTED_CONTEXTS.find(
    (candidate) =>
      candidate.scenarioId === input.requestedScenarioId &&
      candidate.runId === input.runId,
  );
  if (input.variant !== "observe" || selected === undefined) {
    throw new AdapterError("M2E_CONTEXT_INVALID");
  }
  return Object.freeze({
    ...selected,
    selectedProfile: true,
  });
}
