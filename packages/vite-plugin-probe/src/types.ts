import type { ProbeEvent, ProbeManifest } from "@tskaigi-lab/probe-core";

import type { ScenarioVariant } from "./constants.js";
import type { ViteScenarioId } from "./constants.js";
import type { SelectedProfileId } from "./scenario-context.js";

export interface CoordinatorInputs {
  readonly runId: string;
  readonly scenarioId: ViteScenarioId;
  readonly profileId: SelectedProfileId | null;
  readonly runRoot: string;
  readonly toolRoot: string;
  readonly loopbackPort: number;
  readonly variant: ScenarioVariant;
  readonly toolTempRoot: string;
  readonly cacheDir: string;
  readonly outDir: string;
}

export interface OutputEvidence {
  readonly logicalId: "vite-entry-output" | "vite-emitted-asset-output";
  readonly hash: string;
  readonly sizeBytes: number;
}

export interface InputHashEvidence {
  readonly logicalId: string;
  readonly hash: string;
  readonly sizeBytes: number;
}

export interface ScenarioResult {
  readonly runId: string;
  readonly variant: ScenarioVariant;
  readonly manifest: ProbeManifest;
  readonly events: readonly ProbeEvent[];
  readonly rawSegment: string;
  readonly coordinatorPid: number;
  readonly eventCount: 15;
  readonly routeCount: 6;
  readonly capabilityCount: 6;
  readonly toolApiChangeCount: 3;
  readonly producerCount: 1;
  readonly workerId: null;
  readonly designatedTransformCount: 1;
  readonly loopbackRequestCount: 1;
  readonly directWriteMarkerCreated: true;
  readonly sourceConfigPluginHashesUnchanged: true;
  readonly outputEvidence: readonly OutputEvidence[];
  readonly inputHashEvidence: readonly InputHashEvidence[];
  readonly segmentCloseComplete: true;
  readonly deterministicProjection: string;
  readonly configTempPreexisting: false;
  readonly configTempPostexisting: false;
  readonly toolTempPreEntryCount: 0;
  readonly toolTempPostEntryCount: number;
  readonly cachePreEntryCount: 0;
  readonly cachePostEntryCount: number;
  readonly outDirPreEntryCount: 0;
  readonly outDirPostEntryCount: 1 | 2;
  readonly processGroupAbsent: true;
  readonly esbuildResidueAbsent: true;
  readonly cleanupComplete: true;
}
