import {
  runFixedApiScenario,
  runFixedObserveScenario,
} from "../src/scenario.js";
import type { ScenarioResult } from "../src/types.js";

export interface IntegrationRuns {
  readonly observe: readonly [ScenarioResult, ScenarioResult];
  readonly api: readonly [ScenarioResult, ScenarioResult];
}

let runs: Promise<IntegrationRuns> | undefined;

export function getIntegrationRuns(): Promise<IntegrationRuns> {
  if (runs === undefined) {
    runs = (async () => {
      const observeFirst = await runFixedObserveScenario();
      const observeSecond = await runFixedObserveScenario();
      const apiFirst = await runFixedApiScenario();
      const apiSecond = await runFixedApiScenario();
      return Object.freeze({
        observe: Object.freeze([observeFirst, observeSecond] as const),
        api: Object.freeze([apiFirst, apiSecond] as const),
      });
    })();
  }
  return runs;
}
