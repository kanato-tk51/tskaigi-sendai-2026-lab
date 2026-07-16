import process from "node:process";

import { createLocalRunnerFailureProjection } from "../../dist/local-runner.js";
import { createFixedManifest } from "../../dist/manifest.js";
import { validateTrustedPartialSegment } from "../../dist/partial-segment.js";
import { ProcessLifecycleError } from "../../dist/process-lifecycle.js";
import { ScenarioProgressError } from "../../dist/scenario.js";

if (process.argv.length !== 2) {
  process.exitCode = 2;
} else {
  const poisonedEventId = "r01-fresh-process-poisoned-sentinel";
  const runId = "m2d-fresh-process-projection";
  const manifest = createFixedManifest(runId);
  const firstEvent = {
    schemaVersion: "probe-event/v2",
    eventKind: "route-invocation",
    runId,
    scenarioId: manifest.scenarioId,
    route: manifest.route,
    phase: "late-plugin-module-checkpoint",
    triggerType: "configured",
    adapterVersion: manifest.adapterVersion,
    producerId: manifest.producerId,
    producerSequence: 0,
    timestamp: "2026-07-16T00:00:00.000Z",
    durationMs: 0,
    pid: 1,
    ppid: 0,
    workerId: null,
    cwdId: manifest.cwdId,
    nodeVersion: "v20.18.2",
    toolName: manifest.toolName,
    toolVersion: manifest.toolVersion,
    outcome: "success",
    normalizedErrorCode: null,
    routeInvocationId: "vite-late-plugin-module-checkpoint",
    invocationKind: "module-evaluation",
    logicalUnitId: "tskaigi-m2d-dependency-probe",
  };
  const poisonedEvent = {
    ...firstEvent,
    producerSequence: 1,
    routeInvocationId: poisonedEventId,
  };
  const rawSegment = `${JSON.stringify(firstEvent)}\n${JSON.stringify(poisonedEvent)}\n`;
  const progress = validateTrustedPartialSegment(
    rawSegment,
    manifest,
    "observe",
    [],
  );
  const error = new ScenarioProgressError(
    new ProcessLifecycleError("M2D_TOOL_COMMAND_FAILED", [], true),
    ["M2D_SEGMENT_INVALID"],
    progress,
  );
  process.stderr.write(
    `${JSON.stringify(createLocalRunnerFailureProjection(error))}\n`,
  );
  process.exitCode = 1;
}
