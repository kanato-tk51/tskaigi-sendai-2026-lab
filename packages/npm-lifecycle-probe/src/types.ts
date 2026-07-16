import type { ProbeEvent, ProbeManifest } from "@tskaigi-lab/probe-core";

export interface LifecycleInputs {
  readonly runId: string;
  readonly runRoot: string;
  readonly loopbackPort: number;
}

export interface LifecycleContract {
  readonly manifest: ProbeManifest;
  readonly events: readonly ProbeEvent[];
  readonly rawSegment: string;
}
