import type {
  ProbeEvent,
  ProbeManifest,
  ProbeSession,
  Sha256Digest,
} from "@tskaigi-lab/probe-core";

import type { SCENARIO_MODES } from "./constants.js";

export type ScenarioMode = (typeof SCENARIO_MODES)[number];

export interface ScenarioContextInstallInput {
  readonly session: ProbeSession;
  readonly scenarioToken: string;
}

declare const scenarioContextHandleBrand: unique symbol;

export interface ScenarioContextHandle {
  readonly state: "active" | "failed" | "disposing" | "disposed";
  readonly [scenarioContextHandleBrand]: true;
}

export interface OfficialSourceFixEvidence {
  readonly changed: boolean;
  readonly beforeHash: Sha256Digest;
  readonly afterHash: Sha256Digest;
  readonly byteSizeBefore: number;
  readonly byteSizeAfter: number;
}

export interface ScenarioRouteCounts {
  readonly moduleEvaluation: number;
  readonly pluginInitialization: number;
  readonly ruleCreate: number;
  readonly visitorCallback: number;
  readonly fixerCallback: number;
}

export interface ScenarioResult {
  readonly runId: string;
  readonly mode: ScenarioMode;
  readonly manifest: ProbeManifest;
  readonly events: readonly ProbeEvent[];
  readonly rawSegment: string;
  readonly routeCounts: ScenarioRouteCounts;
  readonly capabilityAttemptCount: number;
  readonly toolApiChangeCount: number;
  readonly fixtureChanged: boolean;
  readonly fixtureMatchesExpected: boolean;
  readonly directWriteMarkerCreated: boolean;
}
