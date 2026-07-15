import type {
  ProbeEvent,
  ProbeManifest,
  ProbeRuntimeBindings,
} from "@tskaigi-lab/probe-core";

import type {
  PROVIDED_CONTEXT_SCHEMA_VERSION,
  REPORT_SCHEMA_VERSION,
} from "./constants.js";

export interface FixedProvidedContext {
  readonly schemaVersion: typeof PROVIDED_CONTEXT_SCHEMA_VERSION;
  readonly manifest: ProbeManifest;
  readonly runtimeBindings: ProbeRuntimeBindings;
  readonly fixtureContract: {
    readonly setupFileCount: 1;
    readonly testFileCount: 1;
    readonly testCaseCount: 1;
    readonly setupLogicalId: "vitest-setup-entry";
    readonly testFileLogicalId: "vitest-designated-test-file";
  };
}

export interface CoordinatorReport {
  readonly schemaVersion: typeof REPORT_SCHEMA_VERSION;
  readonly coordinatorPid: number;
  readonly testFileCount: number;
  readonly testCaseCount: number;
  readonly passedTestCaseCount: number;
  readonly failedTestCaseCount: number;
  readonly unhandledErrorCount: number;
  readonly reason: "passed" | "interrupted" | "failed";
}

export interface ScenarioResult {
  readonly runId: string;
  readonly manifest: ProbeManifest;
  readonly events: readonly ProbeEvent[];
  readonly rawSegment: string;
  readonly coordinatorReport: CoordinatorReport;
  readonly coordinatorPid: number;
  readonly workerPid: number;
  readonly workerPpid: number;
  readonly eventCount: number;
  readonly routeCount: number;
  readonly capabilityCount: number;
  readonly toolApiChangeCount: number;
  readonly loopbackRequestCount: number;
  readonly sourceHash: string;
  readonly sourceHashUnchanged: boolean;
  readonly committedFixtureHashesUnchanged: boolean;
  readonly directWriteMarkerCreated: boolean;
  readonly segmentCloseComplete: boolean;
  readonly toolTempPreEntryCount: 0;
  readonly toolTempPostEntryCount: 0;
  readonly toolCachePreEntryCount: 0;
  readonly toolCachePostEntryCount: number;
  readonly configTempPreexisting: false;
  readonly configTempPostexisting: false;
  readonly toolTempCleanupComplete: true;
  readonly runRootCleanupComplete: true;
}
