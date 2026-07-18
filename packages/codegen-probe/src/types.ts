import type { ProbeEvent, ProbeManifest } from "@tskaigi-lab/probe-core";

import type { ScenarioVariant } from "./constants.js";
import type { CodegenScenarioId } from "./constants.js";
import type { Sha256Digest } from "./hash.js";
import type { SelectedProfileId } from "./scenario-context.js";

export interface CoordinatorInputs {
  readonly runId: string;
  readonly scenarioId: CodegenScenarioId;
  readonly profileId: SelectedProfileId | null;
  readonly runRoot: string;
  readonly loopbackPort: number;
  readonly variant: ScenarioVariant;
  readonly outDir: string;
}

export interface OutputEvidence {
  readonly logicalId: "codegen-generated-artifact";
  readonly hash: Sha256Digest;
  readonly sizeBytes: number;
}

export interface InputEvidence {
  readonly logicalId: "codegen-input" | "codegen-input-snapshot";
  readonly hash: Sha256Digest;
  readonly sizeBytes: number;
}

export interface ScenarioResult {
  readonly runId: string;
  readonly variant: ScenarioVariant;
  readonly manifest: ProbeManifest;
  readonly events: readonly ProbeEvent[];
  readonly rawSegment: string;
  readonly coordinatorPid: number;
  readonly eventCount: 12;
  readonly routeCount: 5;
  readonly capabilityCount: 6;
  readonly toolApiChangeCount: 1;
  readonly producerCount: 1;
  readonly workerId: null;
  readonly directWriteMarkerCreated: boolean;
  readonly outputEvidence: readonly OutputEvidence[];
  readonly inputEvidence: readonly InputEvidence[];
  readonly cleanupComplete: true;
}
