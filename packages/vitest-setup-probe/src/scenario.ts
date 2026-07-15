import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

import {
  APPROVED_SOURCE_HASH,
  CANARY_FILE_CONTENT,
  CANARY_RELATIVE_PATH,
  DESIGNATED_SOURCE_RELATIVE_PATH,
  DESIGNATED_TEST_RELATIVE_PATH,
  DISPOSABLE_CANARY_VALUE,
  ENVIRONMENT_VARIABLE,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  LOOPBACK_PORT_VARIABLE,
  LOOPBACK_RESPONSE_BODY,
  OUTPUT_RELATIVE_PATH,
  REPORT_RELATIVE_PATH,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  SEGMENT_RELATIVE_PATH,
  SETUP_ENTRY_RELATIVE_PATH,
  SOURCE_COPY_RELATIVE_PATH,
  SOURCE_TARGET_CONTENT,
  TOOL_TEMP_RELATIVE_PATH,
  TOOL_TEMP_ROOT_VARIABLE,
} from "./constants.js";
import { ADAPTER_ROOT } from "./config-contract.js";
import {
  assertSingleProducer,
  parseAndValidateSegment,
  parseCoordinatorReport,
} from "./evidence.js";
import {
  AdapterError,
  adapterErrorCode,
  preservePrimaryFailure,
} from "./errors.js";
import { createFixedManifest } from "./manifest.js";
import {
  ProcessLifecycleError,
  runFixedLifecycleFixtureProcess,
  runFixedVitestProcess,
} from "./process-lifecycle.js";
import type {
  FixedLifecycleFault,
  FixedLifecycleFixtureProcessMode,
  ProcessLifecycleStage,
} from "./process-lifecycle.js";
import {
  assertPostRunTemporaryInventory,
  cleanupToolTemporaryBoundary,
  initializeToolTemporaryBoundary,
  inspectToolTemporaryBoundary,
  TOOL_TEMPORARY_TEST_ONLY,
} from "./tool-temporary.js";
import type {
  ToolTemporaryBoundary,
  ToolTemporaryInventory,
} from "./tool-temporary.js";
import type { ScenarioResult } from "./types.js";
import { verifyVersionContract } from "./version-contract.js";

interface LoopbackServer {
  readonly port: number;
  readonly requestCount: number;
  close(): Promise<void>;
}

type ScenarioLifecycleStage =
  | ProcessLifecycleStage
  | "loopback-close"
  | "environment-restore"
  | "tool-temp-inventory"
  | "tool-temp-cleanup"
  | "run-root-cleanup"
  | "cleanup-allowed"
  | "unsafe-cleanup-suppressed"
  | "final-reject";

type LifecycleFixtureMode =
  | "timeout"
  | "output-limit"
  | "timeout-cleanup-failure"
  | "output-cleanup-failure"
  | "graceful-close"
  | "graceful-signal-failure"
  | "force-signal-failure"
  | "close-deadline"
  | "unexpected-close-disposition"
  | "process-residue"
  | "cleanup-failure";

interface UnsafeLifecycleTestState {
  runRootRetainedBeforeDisposal: boolean;
}

interface ScenarioExecutionOptions {
  readonly fixtureMode?: FixedLifecycleFixtureProcessMode;
  readonly lifecycleFault?: FixedLifecycleFault;
  readonly simulateCleanupFailure: boolean;
  readonly trace?: ScenarioLifecycleStage[];
  readonly unsafeTestState?: UnsafeLifecycleTestState;
}

export interface LifecycleTestDiagnostic {
  readonly primaryCode: ReturnType<typeof adapterErrorCode>;
  readonly secondaryCodes: readonly ReturnType<typeof adapterErrorCode>[];
  readonly stages: readonly ScenarioLifecycleStage[];
  readonly processGroupGone: boolean;
  readonly cleanupComplete: boolean;
  readonly closeDispositionValidated: boolean;
  readonly unsafeCleanupSuppressed: boolean;
  readonly runRootRetainedBeforeTestDisposal: boolean;
  readonly rawOutputPersisted: false;
}

interface CanaryEnvironmentSnapshot {
  readonly runId: string | undefined;
  readonly runRoot: string | undefined;
  readonly toolTempRoot: string | undefined;
  readonly loopbackPort: string | undefined;
  readonly environmentCanary: string | undefined;
}

function sha256(value: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
}

const LIFECYCLE_CONFIG_WORKSPACE_RELATIVE_PATH = "lifecycle-config-workspace";
const LIFECYCLE_CONFIG_ADAPTER_RELATIVE_PATH = "packages/vitest-setup-probe";

async function initializeLifecycleTemporaryBoundaryForTest(
  runRoot: string,
): Promise<ToolTemporaryBoundary> {
  const workspaceRoot = path.join(
    runRoot,
    LIFECYCLE_CONFIG_WORKSPACE_RELATIVE_PATH,
  );
  const adapterRoot = path.join(
    workspaceRoot,
    LIFECYCLE_CONFIG_ADAPTER_RELATIVE_PATH,
  );
  await mkdir(path.join(adapterRoot, "node_modules"), {
    recursive: true,
    mode: 0o700,
  });
  await writeFile(path.join(adapterRoot, "vitest.scenario.config.ts"), "", {
    encoding: "utf8",
    mode: 0o600,
    flag: "wx",
  });
  return TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
    runRoot,
    workspaceRoot,
  );
}

function captureCanaryEnvironment(): CanaryEnvironmentSnapshot {
  return Object.freeze({
    runId: process.env.PROBE_CANARY_M2C_RUN_ID,
    runRoot: process.env.PROBE_CANARY_M2C_RUN_ROOT,
    toolTempRoot: process.env.PROBE_CANARY_M2C_TOOL_TEMP_ROOT,
    loopbackPort: process.env.PROBE_CANARY_M2C_LOOPBACK_PORT,
    environmentCanary: process.env.PROBE_CANARY_M2C_ENVIRONMENT,
  });
}

function assertCanaryEnvironmentRestored(
  before: CanaryEnvironmentSnapshot,
): void {
  const after = captureCanaryEnvironment();
  if (
    after.runId !== before.runId ||
    after.runRoot !== before.runRoot ||
    after.toolTempRoot !== before.toolTempRoot ||
    after.loopbackPort !== before.loopbackPort ||
    after.environmentCanary !== before.environmentCanary
  ) {
    throw new AdapterError("M2C_CLEANUP_FAILED");
  }
}

function addFailure(primary: unknown, next: AdapterError): unknown {
  return primary === undefined ? next : preservePrimaryFailure(primary, next);
}

async function startFixedLoopbackServer(): Promise<LoopbackServer> {
  let requestCount = 0;
  const server = createServer((request, response) => {
    requestCount += 1;
    if (request.method !== "GET" || request.url !== "/probe-canary") {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not-found\n");
      return;
    }
    response.writeHead(200, {
      "content-type": "text/plain",
      "x-tskaigi-probe-canary": "probe-network-v1",
    });
    response.end(LOOPBACK_RESPONSE_BODY);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new AdapterError("M2C_SCENARIO_FAILED");
  }
  let closed = false;
  return {
    port: address.port,
    get requestCount() {
      return requestCount;
    },
    async close() {
      if (closed) {
        return;
      }
      closed = true;
      await new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined ? resolve() : reject(error),
        );
      });
    },
  };
}

async function validateSuccessfulRun(
  runId: string,
  runRoot: string,
  coordinatorPid: number,
  loopbackRequestCount: number,
  committedSource: string,
  committedTest: string,
  committedSetup: string,
  committedHashesBefore: readonly string[],
  preInventory: ToolTemporaryInventory,
  postInventory: ToolTemporaryInventory,
): Promise<
  Omit<ScenarioResult, "toolTempCleanupComplete" | "runRootCleanupComplete">
> {
  const sourceCopyPath = path.join(runRoot, SOURCE_COPY_RELATIVE_PATH);
  const outputPath = path.join(runRoot, OUTPUT_RELATIVE_PATH);
  const segmentPath = path.join(runRoot, SEGMENT_RELATIVE_PATH);
  const reportPath = path.join(runRoot, REPORT_RELATIVE_PATH);
  const committedSourcePath = path.join(
    ADAPTER_ROOT,
    DESIGNATED_SOURCE_RELATIVE_PATH,
  );
  const committedTestPath = path.join(
    ADAPTER_ROOT,
    DESIGNATED_TEST_RELATIVE_PATH,
  );
  const committedSetupPath = path.join(ADAPTER_ROOT, SETUP_ENTRY_RELATIVE_PATH);
  const [
    rawSegment,
    rawReport,
    sourceAfter,
    outputMarker,
    committedSourceAfter,
    committedTestAfter,
    committedSetupAfter,
    runEntries,
    outputEntries,
  ] = await Promise.all([
    readFile(segmentPath, "utf8"),
    readFile(reportPath, "utf8"),
    readFile(sourceCopyPath, "utf8"),
    readFile(outputPath),
    readFile(committedSourcePath, "utf8"),
    readFile(committedTestPath, "utf8"),
    readFile(committedSetupPath, "utf8"),
    readdir(runRoot),
    readdir(path.dirname(outputPath)),
  ]);
  const expectedRunEntries = [
    "cache",
    REPORT_RELATIVE_PATH,
    "fixture",
    "output",
    SEGMENT_RELATIVE_PATH,
    TOOL_TEMP_RELATIVE_PATH,
  ].sort();
  if (
    JSON.stringify([...runEntries].sort()) !==
    JSON.stringify(expectedRunEntries)
  ) {
    throw new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION");
  }
  const report = parseCoordinatorReport(rawReport);
  if (report.coordinatorPid !== coordinatorPid) {
    throw new AdapterError("M2C_PROCESS_MISMATCH");
  }
  const manifest = createFixedManifest(runId);
  const events = parseAndValidateSegment(rawSegment, manifest, coordinatorPid, [
    DISPOSABLE_CANARY_VALUE,
    CANARY_FILE_CONTENT,
    SOURCE_TARGET_CONTENT,
    committedTest,
    committedSetup,
    runRoot,
    ENVIRONMENT_VARIABLE,
    RUN_ID_VARIABLE,
    RUN_ROOT_VARIABLE,
    TOOL_TEMP_ROOT_VARIABLE,
    LOOPBACK_PORT_VARIABLE,
  ]);
  const segmentCount = runEntries.filter((entry) =>
    entry.endsWith(".jsonl"),
  ).length;
  assertSingleProducer(segmentCount, events);
  const committedHashesAfter = [
    sha256(committedSourceAfter),
    sha256(committedTestAfter),
    sha256(committedSetupAfter),
  ];
  const sourceHash = sha256(sourceAfter);
  const directWriteMarkerCreated = await exists(outputPath);
  const directWriteEvent = events.find(
    (event) =>
      event.eventKind === "capability-attempt" &&
      event.attemptType === "direct-filesystem-write",
  );
  const directWriteHash =
    directWriteEvent?.eventKind === "capability-attempt"
      ? directWriteEvent.afterHash
      : undefined;
  const sourceHashUnchanged = sourceHash === APPROVED_SOURCE_HASH;
  const committedFixtureHashesUnchanged = committedHashesAfter.every(
    (hash, index) => hash === committedHashesBefore[index],
  );
  if (
    loopbackRequestCount !== 1 ||
    !sourceHashUnchanged ||
    !committedFixtureHashesUnchanged ||
    !directWriteMarkerCreated ||
    outputEntries.length !== 1 ||
    outputEntries[0] !== path.basename(outputPath) ||
    directWriteHash !== sha256(outputMarker)
  ) {
    throw new AdapterError("M2C_FIXTURE_CHANGED");
  }
  const workerPid = events[0]?.pid;
  const workerPpid = events[0]?.ppid;
  if (workerPid === undefined || workerPpid === undefined) {
    throw new AdapterError("M2C_PROCESS_MISMATCH");
  }
  return Object.freeze({
    runId,
    manifest,
    events,
    rawSegment,
    coordinatorReport: report,
    coordinatorPid,
    workerPid,
    workerPpid,
    eventCount: EXPECTED_EVENT_COUNT,
    routeCount: EXPECTED_ROUTE_COUNT,
    capabilityCount: EXPECTED_CAPABILITY_COUNT,
    toolApiChangeCount: EXPECTED_TOOL_API_CHANGE_COUNT,
    loopbackRequestCount,
    sourceHash,
    sourceHashUnchanged,
    committedFixtureHashesUnchanged,
    directWriteMarkerCreated,
    segmentCloseComplete: rawSegment.endsWith("\n"),
    toolTempPreEntryCount: preInventory.toolEntryCount as 0,
    toolTempPostEntryCount: postInventory.toolEntryCount as 0,
    toolCachePreEntryCount: preInventory.cacheEntryCount as 0,
    toolCachePostEntryCount: postInventory.cacheEntryCount,
    configTempPreexisting: preInventory.configTempExists as false,
    configTempPostexisting: postInventory.configTempExists as false,
  });
}

async function executeScenario(
  options: ScenarioExecutionOptions,
): Promise<ScenarioResult | undefined> {
  const environmentBefore = captureCanaryEnvironment();
  const versionContract = await verifyVersionContract();
  const runId = `m2c-vitest-${randomUUID().replaceAll("-", "")}`;
  const runRoot = await mkdtemp("/tmp/tskaigi-vitest-m2c-");
  const toolTempRoot = path.join(runRoot, TOOL_TEMP_RELATIVE_PATH);
  const canaryPath = path.join(runRoot, CANARY_RELATIVE_PATH);
  const sourceCopyPath = path.join(runRoot, SOURCE_COPY_RELATIVE_PATH);
  const outputPath = path.join(runRoot, OUTPUT_RELATIVE_PATH);
  const committedSourcePath = path.join(
    ADAPTER_ROOT,
    DESIGNATED_SOURCE_RELATIVE_PATH,
  );
  const committedTestPath = path.join(
    ADAPTER_ROOT,
    DESIGNATED_TEST_RELATIVE_PATH,
  );
  const committedSetupPath = path.join(ADAPTER_ROOT, SETUP_ENTRY_RELATIVE_PATH);
  let loopback: LoopbackServer | undefined;
  let primaryFailure: unknown;
  let cleanupSafe = true;
  let temporaryBoundary: ToolTemporaryBoundary | undefined;
  let preInventory: ToolTemporaryInventory | undefined;
  let postInventory: ToolTemporaryInventory | undefined;
  let processResult:
    Awaited<ReturnType<typeof runFixedVitestProcess>> | undefined;
  let committedSource = "";
  let committedTest = "";
  let committedSetup = "";
  let committedHashesBefore: readonly string[] = [];
  let resultBeforeCleanup:
    | Omit<ScenarioResult, "toolTempCleanupComplete" | "runRootCleanupComplete">
    | undefined;

  try {
    await Promise.all([
      mkdir(path.dirname(canaryPath), { recursive: true, mode: 0o700 }),
      mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 }),
    ]);
    temporaryBoundary =
      options.fixtureMode === undefined
        ? await initializeToolTemporaryBoundary(runRoot)
        : await initializeLifecycleTemporaryBoundaryForTest(runRoot);
    preInventory = await inspectToolTemporaryBoundary(temporaryBoundary);
    [committedSource, committedTest, committedSetup] = await Promise.all([
      readFile(committedSourcePath, "utf8"),
      readFile(committedTestPath, "utf8"),
      readFile(committedSetupPath, "utf8"),
    ]);
    if (
      committedSource !== SOURCE_TARGET_CONTENT ||
      sha256(committedSource) !== APPROVED_SOURCE_HASH
    ) {
      throw new AdapterError("M2C_FIXTURE_CHANGED");
    }
    committedHashesBefore = [
      sha256(committedSource),
      sha256(committedTest),
      sha256(committedSetup),
    ];
    await Promise.all([
      writeFile(canaryPath, CANARY_FILE_CONTENT, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      }),
      writeFile(sourceCopyPath, SOURCE_TARGET_CONTENT, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      }),
    ]);
    loopback = await startFixedLoopbackServer();
    processResult =
      options.fixtureMode === undefined
        ? await runFixedVitestProcess(
            versionContract.vitestCliPath,
            runId,
            runRoot,
            toolTempRoot,
            loopback.port,
            options.trace,
          )
        : await runFixedLifecycleFixtureProcess(
            options.fixtureMode,
            options.lifecycleFault,
            runId,
            runRoot,
            toolTempRoot,
            loopback.port,
            options.trace ?? [],
          );
    if (processResult.exitCode !== 0) {
      throw new AdapterError("M2C_TOOL_COMMAND_FAILED");
    }
  } catch (error) {
    primaryFailure = error;
    if (error instanceof ProcessLifecycleError && !error.processSettled) {
      cleanupSafe = false;
    }
  }

  if (!cleanupSafe) {
    options.trace?.push("unsafe-cleanup-suppressed");
    if (options.unsafeTestState !== undefined) {
      options.unsafeTestState.runRootRetainedBeforeDisposal =
        await exists(runRoot);
      if (loopback !== undefined) {
        await loopback.close().catch(() => undefined);
      }
      if (temporaryBoundary !== undefined) {
        await cleanupToolTemporaryBoundary(temporaryBoundary).catch(
          () => undefined,
        );
      }
      await rm(runRoot, { recursive: true, force: true }).catch(
        () => undefined,
      );
    }
    throw primaryFailure;
  }
  options.trace?.push("cleanup-allowed");

  if (loopback !== undefined) {
    try {
      await loopback.close();
    } catch {
      primaryFailure = addFailure(
        primaryFailure,
        new AdapterError("M2C_CLEANUP_FAILED"),
      );
    }
    options.trace?.push("loopback-close");
  }

  try {
    assertCanaryEnvironmentRestored(environmentBefore);
  } catch {
    primaryFailure = addFailure(
      primaryFailure,
      new AdapterError("M2C_CLEANUP_FAILED"),
    );
  }
  options.trace?.push("environment-restore");

  if (temporaryBoundary !== undefined) {
    try {
      postInventory = await inspectToolTemporaryBoundary(temporaryBoundary);
      assertPostRunTemporaryInventory(
        postInventory,
        primaryFailure === undefined && options.fixtureMode === undefined,
      );
    } catch (error) {
      primaryFailure = addFailure(
        primaryFailure,
        error instanceof AdapterError
          ? error
          : new AdapterError("M2C_TEMP_BOUNDARY_VIOLATION"),
      );
    }
    options.trace?.push("tool-temp-inventory");
  }

  if (
    primaryFailure === undefined &&
    options.fixtureMode === undefined &&
    processResult !== undefined &&
    loopback !== undefined &&
    preInventory !== undefined &&
    postInventory !== undefined
  ) {
    try {
      resultBeforeCleanup = await validateSuccessfulRun(
        runId,
        runRoot,
        processResult.coordinatorPid,
        loopback.requestCount,
        committedSource,
        committedTest,
        committedSetup,
        committedHashesBefore,
        preInventory,
        postInventory,
      );
    } catch (error) {
      primaryFailure = error;
    }
  }

  if (temporaryBoundary !== undefined) {
    try {
      await cleanupToolTemporaryBoundary(temporaryBoundary);
      if (options.simulateCleanupFailure) {
        throw new AdapterError("M2C_CLEANUP_FAILED");
      }
    } catch (error) {
      primaryFailure = addFailure(
        primaryFailure,
        error instanceof AdapterError
          ? error
          : new AdapterError("M2C_CLEANUP_FAILED"),
      );
    }
    options.trace?.push("tool-temp-cleanup");
  }

  try {
    await rm(runRoot, { recursive: true, force: true });
    if (await exists(runRoot)) {
      throw new AdapterError("M2C_CLEANUP_FAILED");
    }
  } catch {
    primaryFailure = addFailure(
      primaryFailure,
      new AdapterError("M2C_CLEANUP_FAILED"),
    );
  }
  options.trace?.push("run-root-cleanup");

  if (primaryFailure !== undefined) {
    throw primaryFailure;
  }
  if (options.fixtureMode !== undefined) {
    return undefined;
  }
  if (resultBeforeCleanup === undefined) {
    throw new AdapterError("M2C_SCENARIO_FAILED");
  }
  return Object.freeze({
    ...resultBeforeCleanup,
    toolTempCleanupComplete: true,
    runRootCleanupComplete: true,
  });
}

export async function runFixedVitestScenario(): Promise<ScenarioResult> {
  const result = await executeScenario({ simulateCleanupFailure: false });
  if (result === undefined) {
    throw new AdapterError("M2C_SCENARIO_FAILED");
  }
  return result;
}

export async function runFixedLifecycleScenarioForTest(
  mode: LifecycleFixtureMode,
): Promise<LifecycleTestDiagnostic> {
  const trace: ScenarioLifecycleStage[] = [];
  const unsafeTestState: UnsafeLifecycleTestState = {
    runRootRetainedBeforeDisposal: false,
  };
  const fixtureMode =
    mode === "output-limit" || mode === "output-cleanup-failure"
      ? "output"
      : mode === "graceful-close"
        ? "graceful"
        : mode === "cleanup-failure"
          ? "exit"
          : "hang";
  const simulateCleanupFailure =
    mode === "timeout-cleanup-failure" ||
    mode === "output-cleanup-failure" ||
    mode === "cleanup-failure";
  const lifecycleFault: FixedLifecycleFault | undefined =
    mode === "graceful-signal-failure" ||
    mode === "force-signal-failure" ||
    mode === "close-deadline" ||
    mode === "unexpected-close-disposition" ||
    mode === "process-residue"
      ? mode
      : undefined;
  try {
    await executeScenario({
      fixtureMode,
      ...(lifecycleFault === undefined ? {} : { lifecycleFault }),
      simulateCleanupFailure,
      trace,
      unsafeTestState,
    });
    throw new AdapterError("M2C_SCENARIO_FAILED");
  } catch (error) {
    trace.push("final-reject");
    const adapterError =
      error instanceof AdapterError
        ? error
        : new AdapterError("M2C_SCENARIO_FAILED");
    return Object.freeze({
      primaryCode: adapterError.code,
      secondaryCodes: adapterError.secondaryCodes,
      stages: Object.freeze([...trace]),
      processGroupGone: trace.includes("worker-pool-gone"),
      cleanupComplete:
        trace.includes("tool-temp-cleanup") &&
        trace.includes("run-root-cleanup"),
      closeDispositionValidated: trace.includes("close-disposition-validated"),
      unsafeCleanupSuppressed: trace.includes("unsafe-cleanup-suppressed"),
      runRootRetainedBeforeTestDisposal:
        unsafeTestState.runRootRetainedBeforeDisposal,
      rawOutputPersisted: false,
    });
  }
}
