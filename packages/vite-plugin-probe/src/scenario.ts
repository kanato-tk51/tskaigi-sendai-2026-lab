import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { lstat, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  CANARY_FILE_CONTENT,
  CANARY_RELATIVE_PATH,
  DISPOSABLE_CANARY_VALUE,
  ENVIRONMENT_VARIABLE,
  LOOPBACK_PORT_VARIABLE,
  OUT_DIR_RELATIVE_PATH,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  SEGMENT_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
  VARIANT_VARIABLE,
} from "./constants.js";
import type { ScenarioVariant } from "./constants.js";
import {
  createDeterministicProjection,
  parseAndValidateSegment,
  validateMaterializedOutputs,
} from "./evidence.js";
import { AdapterError } from "./errors.js";
import type { AdapterErrorCode } from "./errors.js";
import {
  assertApprovedInputHashesUnchanged,
  captureApprovedInputHashes,
} from "./input-contract.js";
import { createFixedManifest } from "./manifest.js";
import {
  validateTrustedPartialSegment,
  type TrustedPartialProgress,
} from "./partial-segment.js";
import { runFixedViteProcess } from "./process-lifecycle.js";
import { ProcessLifecycleError } from "./process-lifecycle.js";
import {
  assertConfigTemporaryAbsent,
  captureOwnedRunBoundary,
  cleanupOwnedRunBoundary,
  inspectTemporaryInventory,
  resolveFixedConfigTemporaryBoundary,
} from "./tool-temporary.js";
import type { ScenarioResult } from "./types.js";
import { validateFixedVersions } from "./version-contract.js";

interface LoopbackServer {
  readonly port: number;
  readonly requestCount: number;
  close(): Promise<void>;
}

export class ScenarioProgressError extends AdapterError {
  readonly trustedEventCount: number | null;
  readonly lastEventId: string | null;

  constructor(
    primary: ProcessLifecycleError,
    progressCodes: readonly AdapterErrorCode[],
    progress: TrustedPartialProgress,
  ) {
    super(primary.code, mergeCodes(primary.secondaryCodes, progressCodes));
    this.name = "ScenarioProgressError";
    this.trustedEventCount = progress.trustedEventCount;
    this.lastEventId = progress.lastEventId;
  }
}

async function startFixedLoopbackServer(): Promise<LoopbackServer> {
  let requestCount = 0;
  const server = createServer((request, response) => {
    requestCount += 1;
    if (request.method !== "GET" || request.url !== "/probe-canary") {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": "text/plain",
      "x-tskaigi-probe-canary": "probe-network-v1",
    });
    response.end("probe-network-v1\n");
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  server.unref();
  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new AdapterError("M2D_SCENARIO_FAILED");
  }
  return Object.freeze({
    port: (address as AddressInfo).port,
    get requestCount() {
      return requestCount;
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined ? resolve() : reject(error),
        );
      }),
  });
}

function mergeCodes(
  first: readonly AdapterErrorCode[],
  second: readonly AdapterErrorCode[],
): readonly AdapterErrorCode[] {
  return Object.freeze([...new Set([...first, ...second])]);
}

export function combineScenarioFailures(
  primary: unknown,
  secondary: AdapterError,
): AdapterError {
  if (!(primary instanceof AdapterError)) {
    return primary === undefined
      ? secondary
      : new AdapterError("M2D_SCENARIO_FAILED", [secondary.code]);
  }
  return new AdapterError(
    primary.code,
    mergeCodes(primary.secondaryCodes, [
      secondary.code,
      ...secondary.secondaryCodes,
    ]),
  );
}

export function cleanupIsSafeAfter(error: unknown): boolean {
  return !(error instanceof ProcessLifecycleError) || error.processSettled;
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw new AdapterError("M2D_CLEANUP_FAILED");
  }
}

async function executeFixedScenario(
  variant: ScenarioVariant,
): Promise<ScenarioResult> {
  await validateFixedVersions();
  const inputEvidence = await captureApprovedInputHashes();
  const configBoundary = await resolveFixedConfigTemporaryBoundary();
  await assertConfigTemporaryAbsent(configBoundary);

  const runId = `m2d-vite-${randomBytes(16).toString("hex")}`;
  const runRoot = await mkdtemp("/tmp/tskaigi-vite-m2d-");
  let loopback: LoopbackServer | undefined;
  let runBoundary:
    Awaited<ReturnType<typeof captureOwnedRunBoundary>> | undefined;
  let primaryFailure: unknown;
  let cleanupSafe = true;
  let resultBeforeCleanup: Omit<ScenarioResult, "cleanupComplete"> | undefined;

  try {
    await Promise.all([
      mkdir(path.join(runRoot, path.dirname(CANARY_RELATIVE_PATH)), {
        recursive: true,
        mode: 0o700,
      }),
      mkdir(path.join(runRoot, path.dirname("probe-output/marker")), {
        recursive: true,
        mode: 0o700,
      }),
      mkdir(path.join(runRoot, TOOL_TEMP_RELATIVE_PATH), {
        recursive: true,
        mode: 0o700,
      }),
      mkdir(path.join(runRoot, "cache/vite"), {
        recursive: true,
        mode: 0o700,
      }),
      mkdir(path.join(runRoot, OUT_DIR_RELATIVE_PATH), {
        recursive: true,
        mode: 0o700,
      }),
    ]);
    await writeFile(
      path.join(runRoot, CANARY_RELATIVE_PATH),
      CANARY_FILE_CONTENT,
      {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      },
    );
    runBoundary = await captureOwnedRunBoundary(runRoot);
    const preInventory = await inspectTemporaryInventory(
      runBoundary,
      configBoundary,
    );
    if (
      preInventory.toolTempEntries !== 0 ||
      preInventory.cacheEntries !== 0 ||
      preInventory.outDirEntries !== 0 ||
      preInventory.configTempExists
    ) {
      throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
    }
    loopback = await startFixedLoopbackServer();
    const environment = Object.freeze({
      [RUN_ID_VARIABLE]: runId,
      [RUN_ROOT_VARIABLE]: runRoot,
      [LOOPBACK_PORT_VARIABLE]: String(loopback.port),
      [VARIANT_VARIABLE]: variant,
      [ENVIRONMENT_VARIABLE]: DISPOSABLE_CANARY_VALUE,
      TMPDIR: runBoundary.toolTempRoot,
      TMP: runBoundary.toolTempRoot,
      TEMP: runBoundary.toolTempRoot,
    });
    const processResult = await runFixedViteProcess(environment);

    const rawSegment = await readFile(
      path.join(runRoot, SEGMENT_RELATIVE_PATH),
      "utf8",
    );
    const manifest = createFixedManifest(runId);
    const events = parseAndValidateSegment(
      rawSegment,
      manifest,
      variant,
      processResult.coordinatorPid,
      process.pid,
      [
        runRoot,
        runBoundary.canonicalRunRoot,
        DISPOSABLE_CANARY_VALUE,
        CANARY_FILE_CONTENT,
      ],
    );
    if (loopback.requestCount !== 1) {
      throw new AdapterError("M2D_SEGMENT_INVALID");
    }
    await assertApprovedInputHashesUnchanged(inputEvidence);
    const outputEvidence = await validateMaterializedOutputs(
      runRoot,
      runBoundary.outDir,
      variant,
      events,
    );
    const postInventory = await inspectTemporaryInventory(
      runBoundary,
      configBoundary,
    );
    const expectedOutputCount = variant === "api" ? 2 : 1;
    if (
      postInventory.configTempExists ||
      postInventory.outDirEntries !== expectedOutputCount
    ) {
      throw new AdapterError("M2D_TEMP_BOUNDARY_VIOLATION");
    }
    const producerCount = new Set(events.map((event) => event.producerId)).size;
    if (producerCount !== 1) {
      throw new AdapterError("M2D_SEGMENT_INVALID");
    }
    resultBeforeCleanup = Object.freeze({
      runId,
      variant,
      manifest,
      events,
      rawSegment,
      coordinatorPid: processResult.coordinatorPid,
      eventCount: 15,
      routeCount: 6,
      capabilityCount: 6,
      toolApiChangeCount: 3,
      producerCount: 1,
      workerId: null,
      designatedTransformCount: 1,
      loopbackRequestCount: 1,
      directWriteMarkerCreated: true,
      sourceConfigPluginHashesUnchanged: true,
      outputEvidence,
      inputHashEvidence: inputEvidence,
      segmentCloseComplete: true,
      deterministicProjection: createDeterministicProjection(
        variant,
        events,
        inputEvidence,
        outputEvidence,
      ),
      configTempPreexisting: false,
      configTempPostexisting: false,
      toolTempPreEntryCount: 0,
      toolTempPostEntryCount: postInventory.toolTempEntries,
      cachePreEntryCount: 0,
      cachePostEntryCount: postInventory.cacheEntries,
      outDirPreEntryCount: 0,
      outDirPostEntryCount: expectedOutputCount,
      processGroupAbsent: true,
      esbuildResidueAbsent: true,
    });
  } catch (error) {
    primaryFailure = error;
    if (!cleanupIsSafeAfter(error)) {
      cleanupSafe = false;
    } else if (
      error instanceof ProcessLifecycleError &&
      error.code === "M2D_TOOL_COMMAND_FAILED"
    ) {
      const partialSegment = await readFile(
        path.join(runRoot, SEGMENT_RELATIVE_PATH),
        "utf8",
      ).catch(() => null);
      const progress = validateTrustedPartialSegment(
        partialSegment,
        createFixedManifest(runId),
        variant,
        [
          runRoot,
          runBoundary?.canonicalRunRoot ?? runRoot,
          DISPOSABLE_CANARY_VALUE,
          CANARY_FILE_CONTENT,
        ],
      );
      const progressCodes: AdapterErrorCode[] = [];
      if (progress.trustedEventCount !== null) {
        progressCodes.push(
          progress.trustedEventCount === 0
            ? "M2D_CONTEXT_INVALID"
            : "M2D_ROUTE_INVALID",
        );
      }
      if (progress.partialSegmentInvalid) {
        progressCodes.push("M2D_SEGMENT_INVALID");
      }
      primaryFailure = new ScenarioProgressError(
        error,
        progressCodes,
        progress,
      );
    }
  }

  if (!cleanupSafe) {
    throw primaryFailure;
  }
  if (loopback !== undefined) {
    try {
      await loopback.close();
    } catch {
      if (primaryFailure === undefined) {
        primaryFailure = new AdapterError("M2D_CLEANUP_FAILED");
      }
    }
  }
  if (runBoundary !== undefined) {
    try {
      await cleanupOwnedRunBoundary(runBoundary);
    } catch (error) {
      primaryFailure = combineScenarioFailures(
        primaryFailure,
        error instanceof AdapterError
          ? error
          : new AdapterError("M2D_CLEANUP_FAILED"),
      );
    }
  }
  if (await exists(runRoot)) {
    primaryFailure = combineScenarioFailures(
      primaryFailure,
      new AdapterError("M2D_CLEANUP_FAILED"),
    );
  }
  if (primaryFailure !== undefined) {
    throw primaryFailure;
  }
  if (resultBeforeCleanup === undefined) {
    throw new AdapterError("M2D_SCENARIO_FAILED");
  }
  return Object.freeze({ ...resultBeforeCleanup, cleanupComplete: true });
}

export function runFixedObserveScenario(): Promise<ScenarioResult> {
  return executeFixedScenario("observe");
}

export function runFixedApiScenario(): Promise<ScenarioResult> {
  return executeFixedScenario("api");
}
