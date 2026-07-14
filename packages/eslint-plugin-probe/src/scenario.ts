import { createHash, randomUUID } from "node:crypto";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { Server } from "node:http";
import path from "node:path";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
  validateProbeEvent,
} from "@tskaigi-lab/probe-core";
import type {
  ProbeEvent,
  ProbeSession,
  Sha256Digest,
} from "@tskaigi-lab/probe-core";
import { ESLint } from "eslint";

import {
  CAPABILITY_ATTEMPT_COUNT,
  CANARY_FILE_CONTENT,
  DISPOSABLE_CANARY_VALUE,
  ENVIRONMENT_VARIABLE,
  ESLINT_VERSION,
  FIXTURE_FILE_COUNT,
  FIXTURE_FIXED_SOURCE,
  FIXTURE_INITIAL_SOURCE,
  OUTPUT_TARGET_ID,
  PRODUCER_ID,
  ROUTE_IDS,
  RULE_ID,
  SCENARIO_MODES,
  SOURCE_SNAPSHOT_CONTENT,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import {
  createScenarioManifest,
  createScenarioRuntimeBindings,
  validateEslintManifestContract,
} from "./manifest.js";
import {
  disposeScenarioContext,
  drainScenarioTasks,
  installScenarioContext,
  loadFixedPluginEntry,
  scheduleOfficialSourceFix,
  scheduleSkippedOfficialSourceFix,
} from "./runtime-context.js";
import type {
  ScenarioContextHandle,
  ScenarioMode,
  ScenarioResult,
  ScenarioRouteCounts,
} from "./types.js";

const NETWORK_METHOD = "GET";
const NETWORK_PATH = "/probe-canary";
const NETWORK_STATUS = 200;
const NETWORK_HEADER_NAME = "x-tskaigi-probe-canary";
const NETWORK_HEADER_VALUE = "probe-network-v1";
const NETWORK_BODY = "probe-network-v1\n";

interface LoopbackServer {
  readonly port: number;
  close(): Promise<void>;
}

export function parseScenarioMode(value: string | undefined): ScenarioMode {
  if (!SCENARIO_MODES.includes(value as ScenarioMode)) {
    throw new AdapterError("ESLINT_SCENARIO_MODE_UNSUPPORTED");
  }
  return value as ScenarioMode;
}

export function assertEslintVersion(actual: string): void {
  if (actual !== ESLINT_VERSION) {
    throw new AdapterError("ESLINT_VERSION_MISMATCH");
  }
}

function sha256(value: string): Sha256Digest {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

async function startLoopbackServer(): Promise<LoopbackServer> {
  const server: Server = createServer((request, response) => {
    if (request.method !== NETWORK_METHOD || request.url !== NETWORK_PATH) {
      response.writeHead(404, { connection: "close" });
      response.end();
      return;
    }
    response.writeHead(NETWORK_STATUS, {
      [NETWORK_HEADER_NAME]: NETWORK_HEADER_VALUE,
      connection: "close",
      "content-type": "text/plain",
    });
    response.end(NETWORK_BODY);
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (): void => {
      server.off("listening", onListening);
      reject(new AdapterError("ESLINT_SCENARIO_FAILED"));
    };
    const onListening = (): void => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(0, "127.0.0.1");
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new AdapterError("ESLINT_SCENARIO_FAILED");
  }
  let closed = false;
  return Object.freeze({
    port: address.port,
    async close(): Promise<void> {
      if (closed) {
        return;
      }
      closed = true;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error === undefined) {
            resolve();
          } else {
            reject(new AdapterError("ESLINT_SCENARIO_FAILED"));
          }
        });
      });
    },
  });
}

function routeCounts(events: readonly ProbeEvent[]): ScenarioRouteCounts {
  const count = (routeInvocationId: string): number =>
    events.filter(
      (event) =>
        event.eventKind === "route-invocation" &&
        event.routeInvocationId === routeInvocationId,
    ).length;
  return Object.freeze({
    moduleEvaluation: count(ROUTE_IDS.moduleEvaluation),
    pluginInitialization: count(ROUTE_IDS.pluginInitialization),
    ruleCreate: count(ROUTE_IDS.ruleCreate),
    visitorCallback: count(ROUTE_IDS.visitorCallback),
    fixerCallback: count(ROUTE_IDS.fixerCallback),
  });
}

function parseSegment(
  rawSegment: string,
  manifest: ReturnType<typeof createScenarioManifest>,
): readonly ProbeEvent[] {
  const lines = rawSegment.endsWith("\n")
    ? rawSegment.slice(0, -1).split("\n")
    : [];
  if (lines.length === 0) {
    throw new AdapterError("ESLINT_SCENARIO_FAILED");
  }
  const events = lines.map((line) =>
    validateProbeEvent(JSON.parse(line) as unknown, manifest),
  );
  if (
    events.some((event, index) => event.producerSequence !== index) ||
    events.some((event) => event.producerId !== PRODUCER_ID)
  ) {
    throw new AdapterError("ESLINT_SCENARIO_FAILED");
  }
  return Object.freeze(events);
}

function assertSegmentDataPolicy(rawSegment: string, runRoot: string): void {
  const forbidden = [
    runRoot,
    DISPOSABLE_CANARY_VALUE,
    CANARY_FILE_CONTENT,
    SOURCE_SNAPSHOT_CONTENT,
    FIXTURE_INITIAL_SOURCE,
    FIXTURE_FIXED_SOURCE,
    NETWORK_BODY,
    "The fixed fixture answer must use its intended value.",
    '"stack"',
    '"diff"',
  ];
  if (forbidden.some((value) => rawSegment.includes(value))) {
    throw new AdapterError("ESLINT_SCENARIO_FAILED");
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runScenario(
  mode: ScenarioMode,
  loopbackAvailable: boolean,
): Promise<ScenarioResult> {
  assertEslintVersion(ESLint.version);
  const runId = `m2b-${mode}-${randomUUID()}`;
  const runRoot = await mkdtemp("/tmp/tskaigi-eslint-m2b-");
  const canaryRelativePath = "canary.txt";
  const sourceSnapshotRelativePath = "source-snapshot.js";
  const fixtureRelativePath = "fixture-main.js";
  const outputRelativePath = "direct-write-marker.json";
  const fixturePath = path.join(runRoot, fixtureRelativePath);
  const outputPath = path.join(runRoot, outputRelativePath);
  const eventPath = path.join(runRoot, `${PRODUCER_ID}.jsonl`);
  const previousCanary = process.env[ENVIRONMENT_VARIABLE];
  let environmentChanged = false;
  let loopback: LoopbackServer | undefined;
  let session: ProbeSession | undefined;
  let context: ScenarioContextHandle | undefined;
  let completedResult: ScenarioResult | undefined;
  let failure: unknown;

  try {
    await Promise.all([
      writeFile(path.join(runRoot, canaryRelativePath), CANARY_FILE_CONTENT, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      }),
      writeFile(
        path.join(runRoot, sourceSnapshotRelativePath),
        SOURCE_SNAPSHOT_CONTENT,
        { encoding: "utf8", mode: 0o600, flag: "wx" },
      ),
      writeFile(fixturePath, FIXTURE_INITIAL_SOURCE, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      }),
    ]);
    loopback = await startLoopbackServer();
    process.env[ENVIRONMENT_VARIABLE] = DISPOSABLE_CANARY_VALUE;
    environmentChanged = true;

    const manifest = createScenarioManifest(mode, runId);
    const runtimeBindings = createScenarioRuntimeBindings(
      {
        rootPath: runRoot,
        canaryRelativePath,
        sourceSnapshotRelativePath,
        outputRelativePath,
      },
      loopback.port,
    );
    validateEslintManifestContract(manifest);
    const validated = validateProbeConfiguration(manifest, runtimeBindings);
    const prepared = await prepareProbeConfiguration(validated);
    session = await createProbeSession(prepared);
    context = installScenarioContext({ session, scenarioToken: runId });
    const plugin = await loadFixedPluginEntry(context);

    if (!loopbackAvailable) {
      await loopback.close();
      loopback = undefined;
    }

    const eslint = new ESLint({
      cwd: runRoot,
      cache: false,
      concurrency: "off",
      fix: mode === "fix",
      globInputPaths: false,
      ignore: false,
      overrideConfigFile: true,
      allowInlineConfig: false,
      overrideConfig: [
        {
          files: ["**/*.js"],
          languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
          },
          plugins: { probe: plugin },
          rules: { [RULE_ID]: "error" },
        },
      ],
    });

    const beforeSource = await readFile(fixturePath, "utf8");
    const lintResults = await eslint.lintFiles([fixturePath]);
    if (
      lintResults.length !== FIXTURE_FILE_COUNT ||
      lintResults[0]?.fatalErrorCount !== 0
    ) {
      throw new AdapterError("ESLINT_SCENARIO_FAILED");
    }
    if (mode === "fix") {
      await ESLint.outputFixes(lintResults);
    }
    const afterSource = await readFile(fixturePath, "utf8");
    const beforeHash = sha256(beforeSource);
    const afterHash = sha256(afterSource);
    const fixtureChanged = beforeHash !== afterHash;

    if (mode === "fix") {
      scheduleOfficialSourceFix({
        changed: fixtureChanged,
        beforeHash,
        afterHash,
        byteSizeBefore: Buffer.byteLength(beforeSource, "utf8"),
        byteSizeAfter: Buffer.byteLength(afterSource, "utf8"),
      });
    } else {
      scheduleSkippedOfficialSourceFix();
    }

    await drainScenarioTasks(context);
    await session.close();
    await disposeScenarioContext(context);
    context = undefined;
    session = undefined;
    await loopback?.close();
    loopback = undefined;
    if (environmentChanged) {
      if (previousCanary === undefined) {
        delete process.env[ENVIRONMENT_VARIABLE];
      } else {
        process.env[ENVIRONMENT_VARIABLE] = previousCanary;
      }
      environmentChanged = false;
    }

    const rawSegment = await readFile(eventPath, "utf8");
    assertSegmentDataPolicy(rawSegment, runRoot);
    const events = parseSegment(rawSegment, manifest);
    const capabilityAttemptCount = events.filter(
      (event) => event.eventKind === "capability-attempt",
    ).length;
    const toolApiChangeCount = events.filter(
      (event) => event.eventKind === "tool-api-change",
    ).length;
    if (
      capabilityAttemptCount !== CAPABILITY_ATTEMPT_COUNT ||
      toolApiChangeCount !== 1
    ) {
      throw new AdapterError("ESLINT_SCENARIO_FAILED");
    }

    completedResult = Object.freeze({
      runId,
      mode,
      manifest,
      events,
      rawSegment,
      routeCounts: routeCounts(events),
      capabilityAttemptCount,
      toolApiChangeCount,
      fixtureChanged,
      fixtureMatchesExpected:
        afterSource ===
        (mode === "fix" ? FIXTURE_FIXED_SOURCE : FIXTURE_INITIAL_SOURCE),
      directWriteMarkerCreated: await fileExists(outputPath),
    });
  } catch (error) {
    failure = error;
  }

  if (context !== undefined) {
    try {
      await disposeScenarioContext(context);
    } catch (error) {
      failure ??= error;
    }
  }
  if (session !== undefined) {
    try {
      await session.close();
    } catch (error) {
      failure ??= error;
    }
  }
  if (loopback !== undefined) {
    try {
      await loopback.close();
    } catch (error) {
      failure ??= error;
    }
  }
  if (environmentChanged) {
    if (previousCanary === undefined) {
      delete process.env[ENVIRONMENT_VARIABLE];
    } else {
      process.env[ENVIRONMENT_VARIABLE] = previousCanary;
    }
  }
  await rm(runRoot, { recursive: true, force: true });

  if (failure !== undefined) {
    throw failure;
  }
  if (completedResult === undefined) {
    throw new AdapterError("ESLINT_SCENARIO_FAILED");
  }
  return completedResult;
}

export function runEslintScenario(mode: ScenarioMode): Promise<ScenarioResult> {
  return runScenario(mode, true);
}

export function runEslintScenarioWithUnavailableLoopbackForTest(
  mode: ScenarioMode,
): Promise<ScenarioResult> {
  return runScenario(mode, false);
}

export const DIRECT_WRITE_TARGET_ID_FOR_TEST = OUTPUT_TARGET_ID;
