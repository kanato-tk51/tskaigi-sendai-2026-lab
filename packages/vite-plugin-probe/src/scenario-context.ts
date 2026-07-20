import { SCENARIO_ID, SELECTED_PROFILE_SCENARIO_IDS } from "./constants.js";
import type {
  ScenarioVariant,
  SelectedProfileScenarioId,
  ViteScenarioId,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export type SelectedProfileId = "permissive" | "constrained";

export interface FixedScenarioContext {
  readonly scenarioId: ViteScenarioId;
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
    runId: "p2-vite-observe-p-20260720-02",
    profileId: "permissive",
  }),
  Object.freeze({
    scenarioId: SELECTED_PROFILE_SCENARIO_IDS[1],
    runId: "p2-vite-observe-c-20260720-02",
    profileId: "constrained",
  }),
]);

function localRunId(runId: string): boolean {
  return /^m2d-vite-[0-9a-f]{32}$/u.test(runId);
}

export function scenarioIdForRunId(runId: string): ViteScenarioId {
  return (
    SELECTED_CONTEXTS.find((candidate) => candidate.runId === runId)
      ?.scenarioId ?? SCENARIO_ID
  );
}

export function resolveFixedScenarioContext(input: {
  readonly variant: ScenarioVariant;
  readonly runId: string;
  readonly requestedScenarioId: string | undefined;
}): FixedScenarioContext {
  if (input.requestedScenarioId === undefined) {
    if (!localRunId(input.runId)) {
      throw new AdapterError("M2D_CONTEXT_INVALID");
    }
    return Object.freeze({
      scenarioId: SCENARIO_ID,
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
    throw new AdapterError("M2D_CONTEXT_INVALID");
  }
  return Object.freeze({
    ...selected,
    selectedProfile: true,
  });
}
