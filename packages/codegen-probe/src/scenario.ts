import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  validateProbeEvent,
  type ProbeEvent,
  type ToolApiChangeEvent,
} from "@tskaigi-lab/probe-core";

import {
  ATTEMPT_IDS,
  CANARY_FILE_CONTENT,
  CANARY_RELATIVE_PATH,
  CLI_OUTPUT_BYTES,
  CLI_TIMEOUT_MS,
  CODEGEN_VERSION,
  DISPOSABLE_CANARY_VALUE,
  ENTRY_RELATIVE_PATH,
  ENVIRONMENT_VARIABLE,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  GENERATED_ARTIFACT_CONTENT,
  INPUT_CONTENT,
  INPUT_SNAPSHOT_CONTENT,
  LOOPBACK_PORT_VARIABLE,
  NODE_VERSION,
  OUTPUT_FILE,
  PRODUCER_ID,
  ROUTE_IDS,
  RUN_ID_VARIABLE,
  RUN_ROOT_VARIABLE,
  SEGMENT_RELATIVE_PATH,
  TOOL_API_CHANGE_ID,
  VARIANT_VARIABLE,
} from "./constants.js";
import type { ScenarioVariant } from "./constants.js";
import { AdapterError } from "./errors.js";
import { hashBytes, hashFile } from "./hash.js";
import { createFixedManifest, validateManifestContract } from "./manifest.js";
import { FIXED_PACKAGE_ROOT } from "./paths.js";
import type { OutputEvidence, ScenarioResult } from "./types.js";

interface LoopbackServer {
  readonly port: number;
  readonly requestCount: number;
  close(): Promise<void>;
}

interface ChildResult {
  readonly pid: number;
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}

function eventOrderValue(event: ProbeEvent): string {
  if (event.eventKind === "route-invocation") {
    return `${event.eventKind}:${event.routeInvocationId}`;
  }
  if (event.eventKind === "capability-attempt") {
    return `${event.eventKind}:${event.attemptId}`;
  }
  return `${event.eventKind}:${event.toolApiChangeId}`;
}

async function startLoopbackServer(): Promise<LoopbackServer> {
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
  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new AdapterError("M2E_CLI_FAILED");
  }
  return Object.freeze({
    port: (address as AddressInfo).port,
    get requestCount() {
      return requestCount;
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined
            ? resolve()
            : reject(new AdapterError("M2E_CLEANUP_FAILED")),
        );
      }),
  });
}

function fixedRunId(variant: ScenarioVariant): string {
  return `m2e-codegen-${variant}-${randomBytes(16).toString("hex")}`;
}

async function runFixedCliProcess(
  runId: string,
  runRoot: string,
  variant: ScenarioVariant,
  loopbackPort: number,
): Promise<ChildResult> {
  const cliPath = path.join(FIXED_PACKAGE_ROOT, "dist/cli.js");
  const child = spawn(process.execPath, [cliPath, variant], {
    cwd: FIXED_PACKAGE_ROOT,
    env: {
      [RUN_ID_VARIABLE]: runId,
      [RUN_ROOT_VARIABLE]: runRoot,
      [LOOPBACK_PORT_VARIABLE]: String(loopbackPort),
      [VARIANT_VARIABLE]: variant,
      [ENVIRONMENT_VARIABLE]: DISPOSABLE_CANARY_VALUE,
    },
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const pid = child.pid;
  if (pid === undefined || pid <= 0) {
    throw new AdapterError("M2E_CLI_FAILED");
  }
  let outputBytes = 0;
  const countOutput = (chunk: Buffer): void => {
    outputBytes += chunk.byteLength;
    if (outputBytes > CLI_OUTPUT_BYTES) {
      child.kill("SIGTERM");
    }
  };
  child.stdout.on("data", countOutput);
  child.stderr.on("data", countOutput);
  child.stdout.resume();
  child.stderr.resume();
  const close = new Promise<ChildResult>((resolve) => {
    child.once("close", (code, signal) => resolve({ pid, code, signal }));
    child.once("error", () => resolve({ pid, code: 1, signal: null }));
  });
  const timeout = new Promise<null>((resolve) => {
    const timer = setTimeout(() => resolve(null), CLI_TIMEOUT_MS);
    timer.unref();
  });
  const result = await Promise.race([close, timeout]);
  if (result === null) {
    child.kill("SIGTERM");
    const afterTerm = await Promise.race([
      close,
      new Promise<null>((resolve) => {
        const timer = setTimeout(() => resolve(null), 500);
        timer.unref();
      }),
    ]);
    if (afterTerm === null) {
      child.kill("SIGKILL");
      await close;
    }
    throw new AdapterError("M2E_CLI_TIMEOUT");
  }
  if (
    outputBytes > CLI_OUTPUT_BYTES ||
    result.code !== 0 ||
    result.signal !== null
  ) {
    throw new AdapterError("M2E_CLI_FAILED");
  }
  return result;
}

function assertRawDataPolicy(rawSegment: string): void {
  const forbidden = [
    DISPOSABLE_CANARY_VALUE,
    CANARY_FILE_CONTENT,
    INPUT_CONTENT,
    INPUT_SNAPSHOT_CONTENT,
    GENERATED_ARTIFACT_CONTENT,
    "probe-network-v1",
    '"stack"',
    '"message"',
    '"error"',
    '"stdout"',
    '"stderr"',
    '"fileName"',
    "/tmp/",
    "/home/",
  ];
  if (forbidden.some((value) => rawSegment.includes(value))) {
    throw new AdapterError("M2E_DATA_POLICY_VIOLATION");
  }
}

function parseSegment(
  rawSegment: string,
  manifest: ReturnType<typeof createFixedManifest>,
  variant: ScenarioVariant,
  coordinatorPid: number,
  parentPid: number,
): readonly ProbeEvent[] {
  assertRawDataPolicy(rawSegment);
  if (!rawSegment.endsWith("\n")) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const lines = rawSegment.slice(0, -1).split("\n");
  if (
    lines.length !== EXPECTED_EVENT_COUNT ||
    lines.some((line) => line.length === 0)
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  let events: ProbeEvent[];
  try {
    events = lines.map((line) =>
      validateProbeEvent(JSON.parse(line), manifest),
    );
  } catch {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const routeCount = events.filter(
    (event) => event.eventKind === "route-invocation",
  ).length;
  const capabilityCount = events.filter(
    (event) => event.eventKind === "capability-attempt",
  ).length;
  const toolCount = events.filter(
    (event) => event.eventKind === "tool-api-change",
  ).length;
  if (
    routeCount !== EXPECTED_ROUTE_COUNT ||
    capabilityCount !== EXPECTED_CAPABILITY_COUNT ||
    toolCount !== EXPECTED_TOOL_API_CHANGE_COUNT ||
    events.some(
      (event, index) =>
        event.producerSequence !== index ||
        eventOrderValue(event) !== EXPECTED_EVENT_ORDER[index],
    ) ||
    events.some(
      (event) =>
        event.producerId !== PRODUCER_ID ||
        event.pid !== coordinatorPid ||
        event.ppid !== parentPid ||
        event.workerId !== null ||
        event.nodeVersion !== NODE_VERSION ||
        event.toolName !== "codegen" ||
        event.toolVersion !== CODEGEN_VERSION,
    )
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const routes = events.filter(
    (event): event is Extract<ProbeEvent, { eventKind: "route-invocation" }> =>
      event.eventKind === "route-invocation",
  );
  if (
    routes.some(
      (event) =>
        event.triggerType !== "explicit" ||
        (event.routeInvocationId !== ROUTE_IDS.fileWrite &&
          event.outcome !== "success") ||
        (event.routeInvocationId === ROUTE_IDS.fileWrite &&
          event.outcome !== (variant === "dry-run" ? "skipped" : "success")),
    )
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const capabilities = events.filter(
    (
      event,
    ): event is Extract<ProbeEvent, { eventKind: "capability-attempt" }> =>
      event.eventKind === "capability-attempt",
  );
  const expectedAttemptIds = Object.values(ATTEMPT_IDS);
  if (
    capabilities.some(
      (event, index) =>
        event.attemptId !== expectedAttemptIds[index] ||
        (event.attemptId === ATTEMPT_IDS.fileWrite
          ? event.outcome !== (variant === "observe" ? "success" : "skipped")
          : event.outcome !== "success"),
    )
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const loopback = capabilities.find(
    (event) => event.attemptId === ATTEMPT_IDS.loopback,
  );
  const child = capabilities.find(
    (event) => event.attemptId === ATTEMPT_IDS.child,
  );
  if (
    loopback?.details.kind !== "loopback" ||
    !loopback.details.protocolVerified ||
    child?.details.kind !== "child" ||
    !child.details.responseVerified
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  const tool = events.find(
    (event): event is ToolApiChangeEvent =>
      event.eventKind === "tool-api-change",
  );
  if (
    tool?.toolApiChangeId !== TOOL_API_CHANGE_ID ||
    (variant === "api"
      ? tool.outcome !== "success" ||
        !tool.changed ||
        tool.beforeHash !== null ||
        tool.afterHash !== hashBytes(Buffer.from(GENERATED_ARTIFACT_CONTENT)) ||
        tool.byteSizeBefore !== null ||
        tool.byteSizeAfter !== Buffer.byteLength(GENERATED_ARTIFACT_CONTENT)
      : tool.outcome !== "skipped" ||
        tool.normalizedErrorCode !== "NOT_APPLICABLE" ||
        tool.changed ||
        tool.afterHash !== null)
  ) {
    throw new AdapterError("M2E_SEGMENT_INVALID");
  }
  return Object.freeze(events);
}

async function validateOutputs(
  runRoot: string,
  variant: ScenarioVariant,
  events: readonly ProbeEvent[],
): Promise<{
  readonly outputEvidence: readonly OutputEvidence[];
  readonly directWriteMarkerCreated: boolean;
}> {
  const outDir = path.join(runRoot, "out");
  const entries = await readdir(outDir, { withFileTypes: true });
  const expectedNames = variant === "api" ? [OUTPUT_FILE] : [];
  const actualNames = entries.map((entry) => entry.name).sort();
  if (
    entries.some((entry) => !entry.isFile() || entry.isSymbolicLink()) ||
    actualNames.length !== expectedNames.length ||
    actualNames.some((name, index) => name !== expectedNames[index])
  ) {
    throw new AdapterError("M2E_OUTPUT_INVALID");
  }
  const tool = events.find(
    (event): event is ToolApiChangeEvent =>
      event.eventKind === "tool-api-change",
  );
  const outputEvidence: OutputEvidence[] = [];
  if (variant === "api") {
    const outputPath = path.join(outDir, OUTPUT_FILE);
    const bytes = await readFile(outputPath);
    if (!bytes.equals(Buffer.from(GENERATED_ARTIFACT_CONTENT))) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
    const evidence = await hashFile(outputPath);
    if (
      tool?.afterHash !== evidence.hash ||
      tool.byteSizeAfter !== evidence.sizeBytes
    ) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
    outputEvidence.push({
      logicalId: "codegen-generated-artifact",
      hash: evidence.hash,
      sizeBytes: evidence.sizeBytes,
    });
  }
  const directPath = path.join(
    runRoot,
    "probe-output/direct-write-marker.json",
  );
  let directWriteMarkerCreated = false;
  try {
    const metadata = await lstat(directPath);
    directWriteMarkerCreated = true;
    if (
      metadata.isSymbolicLink() ||
      !metadata.isFile() ||
      variant !== "observe"
    ) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
    const directHash = await hashFile(directPath);
    const directEvent = events.find(
      (
        event,
      ): event is Extract<ProbeEvent, { eventKind: "capability-attempt" }> =>
        event.eventKind === "capability-attempt" &&
        event.attemptId === ATTEMPT_IDS.fileWrite,
    );
    if (directEvent?.afterHash !== directHash.hash) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    if (variant === "observe") {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
  }
  return Object.freeze({ outputEvidence, directWriteMarkerCreated });
}

export async function runFixedScenario(
  variant: ScenarioVariant,
): Promise<ScenarioResult> {
  const runId = fixedRunId(variant);
  const runRoot = await mkdtemp("/tmp/tskaigi-codegen-m2e-");
  const loopback = await startLoopbackServer();
  try {
    await Promise.all([
      mkdir(path.join(runRoot, "canary"), { recursive: true, mode: 0o700 }),
      mkdir(path.join(runRoot, "probe-output"), {
        recursive: true,
        mode: 0o700,
      }),
      mkdir(path.join(runRoot, "out"), { recursive: true, mode: 0o700 }),
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
    await writeFile(
      path.join(runRoot, "input-snapshot.txt"),
      INPUT_SNAPSHOT_CONTENT,
      { encoding: "utf8", mode: 0o600, flag: "wx" },
    );
    const manifest = createFixedManifest(variant, runId);
    validateManifestContract(manifest, variant);
    const inputPath = path.join(FIXED_PACKAGE_ROOT, ENTRY_RELATIVE_PATH);
    const inputBefore = await hashFile(inputPath);
    const snapshotBefore = await hashFile(
      path.join(runRoot, "input-snapshot.txt"),
    );
    const processResult = await runFixedCliProcess(
      runId,
      runRoot,
      variant,
      loopback.port,
    );
    const rawSegment = await readFile(
      path.join(runRoot, SEGMENT_RELATIVE_PATH),
      "utf8",
    );
    const events = parseSegment(
      rawSegment,
      manifest,
      variant,
      processResult.pid,
      process.pid,
    );
    if (loopback.requestCount !== 1) {
      throw new AdapterError("M2E_SEGMENT_INVALID");
    }
    const output = await validateOutputs(runRoot, variant, events);
    const inputAfter = await hashFile(inputPath);
    const snapshotAfter = await hashFile(
      path.join(runRoot, "input-snapshot.txt"),
    );
    if (
      inputBefore.hash !== inputAfter.hash ||
      inputBefore.sizeBytes !== inputAfter.sizeBytes ||
      snapshotBefore.hash !== snapshotAfter.hash ||
      snapshotBefore.sizeBytes !== snapshotAfter.sizeBytes
    ) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
    return Object.freeze({
      runId,
      variant,
      manifest,
      events,
      rawSegment,
      coordinatorPid: processResult.pid,
      eventCount: 12,
      routeCount: 5,
      capabilityCount: 6,
      toolApiChangeCount: 1,
      producerCount: 1,
      workerId: null,
      directWriteMarkerCreated: output.directWriteMarkerCreated,
      outputEvidence: output.outputEvidence,
      inputEvidence: [
        {
          logicalId: "codegen-input" as const,
          hash: inputBefore.hash,
          sizeBytes: inputBefore.sizeBytes,
        },
        {
          logicalId: "codegen-input-snapshot" as const,
          hash: snapshotBefore.hash,
          sizeBytes: snapshotBefore.sizeBytes,
        },
      ],
      cleanupComplete: true,
    });
  } finally {
    await loopback.close().catch(() => undefined);
    await rm(runRoot, { recursive: true, force: true });
  }
}

export function runFixedObserveScenario(): Promise<ScenarioResult> {
  return runFixedScenario("observe");
}

export function runFixedApiScenario(): Promise<ScenarioResult> {
  return runFixedScenario("api");
}

export function runFixedDryRunScenario(): Promise<ScenarioResult> {
  return runFixedScenario("dry-run");
}
