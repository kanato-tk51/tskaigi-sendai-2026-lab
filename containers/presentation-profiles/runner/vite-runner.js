import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

const FIXED_NODE_VERSION = "v20.18.2";
const FIXED_VITE_EXPECTED_REVISION = "p2-vite-expected-20260723-01";
const FIXED_LOOPBACK_ADDRESS = "127.0.0.1";
const FIXED_LOOPBACK_PORT = 47_832;
const FIXED_VITE_CLI_PATH = "/opt/p2/input/node_modules/vite/bin/vite.js";
const FIXED_ADAPTER_ROOT = "/opt/p2/input/packages/vite-plugin-probe";
const FIXED_SOURCE_PATH = `${FIXED_ADAPTER_ROOT}/fixture/designated.ts`;
const FIXED_TOOL_ROOT = "/tmp/p2-tool";
const FIXED_TOOL_TEMP_ROOT = `${FIXED_TOOL_ROOT}/tool-temp`;
const FIXED_CACHE_ROOT = `${FIXED_TOOL_ROOT}/cache/vite`;
const FIXED_OUTPUT_ROOT = `${FIXED_TOOL_ROOT}/out`;
const FIXED_CANARY_DIRECTORY = `${FIXED_TOOL_ROOT}/canary`;
const FIXED_CANARY_PATH = `${FIXED_CANARY_DIRECTORY}/input.txt`;
const FIXED_EVENT_SEGMENT = "/tmp/p2-result/vite-coordinator.jsonl";
const FIXED_DIRECT_WRITE_PATH = "/tmp/p2-direct-write/direct-write-marker.json";
const FIXED_SOURCE_CONTENT =
  'export const designatedValue = "M2D_DESIGNATED_ORIGINAL";\n';
const FIXED_FILE_CANARY = "m2d disposable file canary\n";
const FIXED_ENVIRONMENT_CANARY = "m2d-disposable-environment-canary";
const FIXED_OUTPUT_FILE = "entry.js";
const FIXED_PROGRESS_ROOT = "/tmp/p2-progress";
const FIXED_PROGRESS_FILE = "runner-progress.json";
const FIXED_PROGRESS_NEXT = "runner-progress.next";
const FIXED_PROGRESS_SCHEMA = "p2-vite-progress/v2";
const MAX_PROGRESS_BYTES = 4_096;
const MAX_PROGRESS_RECORDS = 13;
const MAX_CHILD_OUTPUT_BYTES = 65_536;
const MAX_EVENT_SEGMENT_BYTES = 65_536;
const MAX_OUTPUT_FILE_BYTES = 65_536;
export const FIXED_VITE_RUNNER_LIMITS = Object.freeze({
  childTimeoutMs: 30_000,
  terminationGraceMs: 500,
  forceSettlementMs: 1_000,
  serverSettlementMs: 1_000,
});
const CHILD_TIMEOUT_MS = FIXED_VITE_RUNNER_LIMITS.childTimeoutMs;
const TERMINATION_GRACE_MS = FIXED_VITE_RUNNER_LIMITS.terminationGraceMs;
const FORCE_SETTLEMENT_MS = FIXED_VITE_RUNNER_LIMITS.forceSettlementMs;
const SERVER_SETTLEMENT_MS = FIXED_VITE_RUNNER_LIMITS.serverSettlementMs;
const PROCESS_POLL_MS = 25;
const FIXED_OUTPUT_PATHS = Object.freeze({
  sourcePath: FIXED_SOURCE_PATH,
  eventPath: FIXED_EVENT_SEGMENT,
  outputRoot: FIXED_OUTPUT_ROOT,
});
const FIXED_TEST_OUTPUT_PATHS = Object.freeze({
  sourcePath: fileURLToPath(
    new URL(
      "../test/.vite-output-fixture/input/designated.ts",
      import.meta.url,
    ),
  ),
  eventPath: fileURLToPath(
    new URL(
      "../test/.vite-output-fixture/result/vite-coordinator.jsonl",
      import.meta.url,
    ),
  ),
  outputRoot: fileURLToPath(
    new URL("../test/.vite-output-fixture/tool/out", import.meta.url),
  ),
});

const RUN_ID_VARIABLE = "PROBE_CANARY_M2D_RUN_ID";
const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2D_RUN_ROOT";
const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2D_LOOPBACK_PORT";
const VARIANT_VARIABLE = "PROBE_CANARY_M2D_VARIANT";
const SCENARIO_ID_VARIABLE = "PROBE_CANARY_M2D_SCENARIO_ID";
const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2D_ENVIRONMENT";

const DEFINITIONS = Object.freeze([
  Object.freeze({
    scenarioId: "vite-observe-p",
    profileId: "permissive",
    runId: "p2-vite-observe-p-20260723-01",
  }),
  Object.freeze({
    scenarioId: "vite-observe-c",
    profileId: "constrained",
    runId: "p2-vite-observe-c-20260723-01",
  }),
]);

const FIXED_VITE_ARGUMENTS = Object.freeze([
  FIXED_VITE_CLI_PATH,
  "build",
  "--config",
  "vite.scenario.config.ts",
  "--configLoader",
  "runner",
  "--mode",
  "production",
]);

/** @typedef {"vite-observe-p" | "vite-observe-c"} ScenarioId */
/** @typedef {"permissive" | "constrained"} ProfileId */
/**
 * @typedef {Readonly<{
 *   executable: "/usr/local/bin/node",
 *   arguments: readonly string[],
 *   environment: Readonly<Record<string, string>>,
 *   cwd: "/opt/p2/input/packages/vite-plugin-probe",
 *   shell: false,
 * }>} FixedInvocation
 */
/**
 * @typedef {Readonly<{
 *   pid: number | undefined,
 *   onStdout(listener: (chunk: Buffer) => void): void,
 *   onStderr(listener: (chunk: Buffer) => void): void,
 *   onceError(listener: () => void): void,
 *   onceClose(listener: (code: number | null, signal: NodeJS.Signals | null) => void): void,
 * }>} FixedProcessHandle
 */
/**
 * @typedef {Readonly<{
 *   launch(invocation: FixedInvocation): FixedProcessHandle,
 *   processGroupExists(processGroupId: number): boolean,
 *   signalProcessGroup(processGroupId: number, signal: "SIGTERM" | "SIGKILL"): boolean,
 *   waitForProcessGroupExit(processGroupId: number, timeoutMs: number): Promise<boolean>,
 * }>} FixedProcessBackend
 */
/**
 * @typedef {Readonly<{
 *   timeoutMs: number,
 *   terminationGraceMs: number,
 *   settlementMs: number,
 *   outputBytes: number,
 * }>} FixedProcessLimits
 */
/** @typedef {"P2_CHILD_FAILED" | "P2_CHILD_TIMEOUT" | "P2_OUTPUT_LIMIT"} FixedChildFailureCode */

export class FixedViteRunnerError extends Error {
  /**
   * @param {FixedChildFailureCode | "P2_RESULT_INVALID" | "P2_SERVER_CLOSE_FAILED"} failureCode
   * @param {"known" | "unknown"} settlement
   * @param {"P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN" | null} settlementCode
   */
  constructor(failureCode, settlement, settlementCode = null) {
    super(settlementCode ?? failureCode);
    this.name = "FixedViteRunnerError";
    this.failureCode = failureCode;
    this.settlement = settlement;
    this.settlementCode = settlementCode;
  }
}

export class FixedViteTransferWriteError extends Error {
  constructor() {
    super("P2_TRANSFER_WRITE_FAILED");
    this.name = "FixedViteTransferWriteError";
  }
}

/** @param {unknown} error */
function missingPath(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

/**
 * @param {Readonly<{scenarioId: ScenarioId, profileId: ProfileId, runId: string}>} definition
 * @param {string} progressRoot
 */
async function createFixedViteProgressWriter(definition, progressRoot) {
  const canonicalPath = path.join(progressRoot, FIXED_PROGRESS_FILE);
  const nextPath = path.join(progressRoot, FIXED_PROGRESS_NEXT);
  /** @type {import("node:fs/promises").FileHandle | null} */
  let directoryHandle = null;
  /** @type {readonly Readonly<{sequence: number, stage: string, value: string}>[]} */
  let records = Object.freeze([]);
  let terminalPublished = false;
  let writeFailed = false;
  /** @type {Readonly<{dev: bigint | number, ino: bigint | number}> | null} */
  let directoryIdentity = null;

  /** @returns {never} */
  const fail = () => {
    writeFailed = true;
    throw new FixedViteTransferWriteError();
  };
  const verifyDirectory = async () => {
    if (directoryHandle === null || directoryIdentity === null) fail();
    const identity = directoryIdentity;
    /** @type {import("node:fs").BigIntStats} */
    let current;
    try {
      current = await lstat(progressRoot, { bigint: true });
    } catch {
      fail();
    }
    if (
      !current.isDirectory() ||
      current.isSymbolicLink() ||
      (current.mode & 0o7777n) !== 0o1777n ||
      current.dev !== identity.dev ||
      current.ino !== identity.ino
    ) {
      fail();
    }
  };
  /**
   * @param {null | Readonly<Record<string, unknown>>} terminal
   */
  const publishSnapshot = async (terminal) => {
    if (
      writeFailed ||
      terminalPublished ||
      records.length > MAX_PROGRESS_RECORDS
    )
      fail();
    const snapshot = {
      schemaVersion: FIXED_PROGRESS_SCHEMA,
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      scenarioId: definition.scenarioId,
      profileId: definition.profileId,
      runId: definition.runId,
      records,
      terminal,
    };
    const line = `${JSON.stringify(snapshot)}\n`;
    if (Buffer.byteLength(line) > MAX_PROGRESS_BYTES) fail();
    /** @type {import("node:fs/promises").FileHandle | null} */
    let nextHandle = null;
    try {
      await verifyDirectory();
      try {
        await lstat(nextPath);
        fail();
      } catch (error) {
        if (!missingPath(error)) throw error;
      }
      nextHandle = await open(
        nextPath,
        fsConstants.O_WRONLY |
          fsConstants.O_CREAT |
          fsConstants.O_EXCL |
          fsConstants.O_NOFOLLOW,
        0o644,
      );
      await nextHandle.writeFile(line, "utf8");
      await nextHandle.sync();
      await nextHandle.chmod(terminal === null ? 0o644 : 0o444);
      const nextStat = await nextHandle.stat();
      if (
        !nextStat.isFile() ||
        (nextStat.mode & 0o7777) !== (terminal === null ? 0o644 : 0o444)
      ) {
        fail();
      }
      await nextHandle.close();
      nextHandle = null;
      await rename(nextPath, canonicalPath);
      const activeDirectoryHandle = directoryHandle;
      if (activeDirectoryHandle === null) fail();
      await activeDirectoryHandle.sync();
      if (terminal !== null) terminalPublished = true;
    } catch (error) {
      if (nextHandle !== null) await nextHandle.close().catch(() => undefined);
      if (error instanceof FixedViteTransferWriteError) throw error;
      fail();
    }
  };

  try {
    const directory = await lstat(progressRoot, { bigint: true });
    if (
      !directory.isDirectory() ||
      directory.isSymbolicLink() ||
      (directory.mode & 0o7777n) !== 0o1777n
    ) {
      fail();
    }
    await Promise.all([requireAbsent(canonicalPath), requireAbsent(nextPath)]);
    directoryHandle = await open(
      progressRoot,
      fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW,
    );
    const opened = await directoryHandle.stat({ bigint: true });
    if (
      !opened.isDirectory() ||
      opened.dev !== directory.dev ||
      opened.ino !== directory.ino
    ) {
      fail();
    }
    directoryIdentity = Object.freeze({ dev: opened.dev, ino: opened.ino });
  } catch (error) {
    if (directoryHandle !== null)
      await directoryHandle.close().catch(() => undefined);
    if (error instanceof FixedViteTransferWriteError) throw error;
    fail();
  }

  return Object.freeze({
    /** @param {string} stage @param {string} value */
    async publish(stage, value) {
      if (
        terminalPublished ||
        records.some((record) => record.stage === stage) ||
        records.length >= MAX_PROGRESS_RECORDS
      ) {
        fail();
      }
      records = Object.freeze([
        ...records,
        Object.freeze({ sequence: records.length, stage, value }),
      ]);
      await publishSnapshot(null);
    },
    /**
     * @param {Readonly<{sourceBeforeHash: string, sourceAfterHash: string, entryOutputBytes: number}>} summary
     */
    async complete(summary) {
      await publishSnapshot(
        Object.freeze({
          status: "completed",
          failureCode: null,
          settlement: "known",
          settlementCode: null,
          sourceBeforeHash: summary.sourceBeforeHash,
          sourceAfterHash: summary.sourceAfterHash,
          entryOutputBytes: summary.entryOutputBytes,
        }),
      );
    },
    /** @param {FixedViteRunnerError} error */
    async fail(error) {
      await publishSnapshot(
        Object.freeze({
          status: "failure",
          failureCode: error.failureCode,
          settlement: error.settlement,
          settlementCode: error.settlementCode,
        }),
      );
    },
    async close() {
      if (directoryHandle !== null) {
        const handle = directoryHandle;
        directoryHandle = null;
        try {
          await handle.close();
        } catch {
          fail();
        }
      }
    },
  });
}

/**
 * @param {Readonly<{scenarioId: ScenarioId, profileId: ProfileId, runId: string}>} definition
 * @param {string} progressRoot
 */
export function createFixedViteProgressWriterForTest(definition, progressRoot) {
  return createFixedViteProgressWriter(definition, progressRoot);
}

/** @param {string | Buffer} value */
function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

/**
 * @param {string} scenarioId
 * @returns {Readonly<{scenarioId: ScenarioId, profileId: ProfileId, runId: string}>}
 */
export function resolveFixedViteScenario(scenarioId) {
  const definition = DEFINITIONS.find(
    (candidate) => candidate.scenarioId === scenarioId,
  );
  if (definition === undefined) {
    throw new Error("P2_SCENARIO_INVALID");
  }
  return definition;
}

/**
 * @param {Readonly<{scenarioId: ScenarioId, profileId: ProfileId, runId: string}>} definition
 * @returns {FixedInvocation}
 */
export function createFixedViteInvocation(definition) {
  const environment = {
    [RUN_ID_VARIABLE]: definition.runId,
    [RUN_ROOT_VARIABLE]: "/tmp/p2-result",
    [LOOPBACK_PORT_VARIABLE]: String(FIXED_LOOPBACK_PORT),
    [VARIANT_VARIABLE]: "observe",
    [SCENARIO_ID_VARIABLE]: definition.scenarioId,
    TMPDIR: FIXED_TOOL_TEMP_ROOT,
    TMP: FIXED_TOOL_TEMP_ROOT,
    TEMP: FIXED_TOOL_TEMP_ROOT,
    ...(definition.profileId === "permissive"
      ? { [ENVIRONMENT_VARIABLE]: FIXED_ENVIRONMENT_CANARY }
      : {}),
  };
  return Object.freeze({
    executable: "/usr/local/bin/node",
    arguments: FIXED_VITE_ARGUMENTS,
    environment: Object.freeze(environment),
    cwd: FIXED_ADAPTER_ROOT,
    shell: false,
  });
}

/** @param {string} filePath */
async function requireAbsent(filePath) {
  try {
    await lstat(filePath);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
  throw new Error("P2_OUTPUT_NOT_EMPTY");
}

/** @param {ProfileId} profileId */
async function prepareFixedInputs(profileId) {
  const source = await readFile(FIXED_SOURCE_PATH);
  if (!source.equals(Buffer.from(FIXED_SOURCE_CONTENT, "utf8"))) {
    throw new Error("P2_INPUT_INVALID");
  }
  await Promise.all([
    requireAbsent(FIXED_EVENT_SEGMENT),
    requireAbsent(FIXED_DIRECT_WRITE_PATH),
    requireAbsent(FIXED_TOOL_TEMP_ROOT),
    requireAbsent(path.dirname(FIXED_CACHE_ROOT)),
    requireAbsent(FIXED_OUTPUT_ROOT),
    requireAbsent(FIXED_CANARY_DIRECTORY),
  ]);
  await Promise.all([
    mkdir(FIXED_TOOL_TEMP_ROOT, { mode: 0o700 }),
    mkdir(FIXED_CACHE_ROOT, { recursive: true, mode: 0o700 }),
    mkdir(FIXED_OUTPUT_ROOT, { mode: 0o700 }),
    mkdir(FIXED_CANARY_DIRECTORY, { mode: 0o700 }),
  ]);
  await writeFile(FIXED_CANARY_PATH, FIXED_FILE_CANARY, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  await chmod(FIXED_CANARY_PATH, profileId === "constrained" ? 0o000 : 0o400);
  return sha256(source);
}

/** @returns {Promise<import("node:http").Server>} */
function startFixedLoopbackServer() {
  const server = createServer((request, response) => {
    if (request.method !== "GET" || request.url !== "/probe-canary") {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": "text/plain",
      "x-tskaigi-probe-canary": "probe-network-v1",
      connection: "close",
    });
    response.end("probe-network-v1\n");
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(FIXED_LOOPBACK_PORT, FIXED_LOOPBACK_ADDRESS, () => {
      resolve(server);
    });
  });
}

/**
 * @param {(done: (error?: Error) => void) => void} requestClose
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
function settleServerClose(requestClose, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    /** @param {boolean} value */
    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    try {
      requestClose((error) => finish(error === undefined));
    } catch {
      finish(false);
    }
  });
}

/**
 * @param {import("node:http").Server | null} server
 * @returns {Promise<boolean>}
 */
function closeServer(server) {
  if (server === null) {
    return Promise.resolve(true);
  }
  return settleServerClose(
    (done) => server.close((error) => done(error ?? undefined)),
    SERVER_SETTLEMENT_MS,
  );
}

/**
 * @param {(done: (error?: Error) => void) => void} requestClose
 * @param {number} timeoutMs
 */
export function closeFixedViteServerWithBackendForTest(
  requestClose,
  timeoutMs,
) {
  return settleServerClose(requestClose, timeoutMs);
}

/** @param {number} milliseconds */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/** @param {number} processGroupId */
function processGroupExists(processGroupId) {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    return !(
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ESRCH"
    );
  }
}

/**
 * @param {number} processGroupId
 * @param {number} timeoutMs
 */
async function waitForProcessGroupExit(processGroupId, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() <= deadline) {
    if (!processGroupExists(processGroupId)) {
      return true;
    }
    await delay(PROCESS_POLL_MS);
  }
  return !processGroupExists(processGroupId);
}

/**
 * @param {number} processGroupId
 * @param {"SIGTERM" | "SIGKILL"} signal
 */
function signalProcessGroup(processGroupId, signal) {
  try {
    process.kill(-processGroupId, signal);
    return true;
  } catch {
    return false;
  }
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {number} timeoutMs
 * @returns {Promise<T | undefined>}
 */
function within(promise, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(undefined);
      }
    }, timeoutMs);
    void promise.then((value) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(value);
      }
    });
  });
}

/**
 * @param {Readonly<{code: number | null, signal: NodeJS.Signals | null}>} result
 */
function isNaturalClose(result) {
  return result.code !== null && result.signal === null;
}

/**
 * @param {Readonly<{code: number | null, signal: NodeJS.Signals | null}>} result
 * @param {"SIGTERM" | "SIGKILL"} signal
 */
function isSignalClose(result, signal) {
  return result.code === null && result.signal === signal;
}

/**
 * @param {FixedChildFailureCode} failureCode
 * @param {"known" | "unknown"} settlement
 */
function childFailure(failureCode, settlement) {
  return new FixedViteRunnerError(
    failureCode,
    settlement,
    settlement === "unknown" ? "P2_CHILD_SETTLEMENT_UNKNOWN" : null,
  );
}

/** @param {FixedChildFailureCode} failureCode */
function childFailureValue(failureCode) {
  return failureCode === "P2_CHILD_TIMEOUT"
    ? "deadline"
    : failureCode === "P2_OUTPUT_LIMIT"
      ? "output-limit"
      : "process-error";
}

/** @param {Readonly<{code: number | null, signal: NodeJS.Signals | null}>} result */
function closeValue(result) {
  if (isNaturalClose(result)) {
    return result.code === 0 ? "exit-0" : "exit-nonzero";
  }
  if (isSignalClose(result, "SIGTERM")) return "sigterm";
  if (isSignalClose(result, "SIGKILL")) return "sigkill";
  return null;
}

/**
 * @param {FixedProcessBackend} backend
 * @param {number} processGroupId
 * @param {"SIGTERM" | "SIGKILL"} signal
 * @param {(stage: string, value: string) => Promise<void>} publish
 */
async function signalWithProgress(backend, processGroupId, signal, publish) {
  const stage =
    signal === "SIGTERM" ? "child-terminate-sent" : "child-force-sent";
  if (!backend.processGroupExists(processGroupId)) {
    await publish(stage, "group-already-absent");
    return "group-already-absent";
  }
  if (!backend.signalProcessGroup(processGroupId, signal)) return null;
  await publish(stage, "sent");
  return "sent";
}

/**
 * @param {FixedProcessBackend} backend
 * @param {number} processGroupId
 * @param {Promise<Readonly<{code: number | null, signal: NodeJS.Signals | null}>>} close
 * @param {FixedProcessLimits} limits
 */
async function settleChildAfterTransferFailure(
  backend,
  processGroupId,
  close,
  limits,
) {
  if (!backend.processGroupExists(processGroupId)) return;
  backend.signalProcessGroup(processGroupId, "SIGTERM");
  const termClose = await within(close, limits.terminationGraceMs);
  if (termClose !== undefined && !backend.processGroupExists(processGroupId)) {
    return;
  }
  if (backend.processGroupExists(processGroupId)) {
    backend.signalProcessGroup(processGroupId, "SIGKILL");
  }
  await Promise.all([
    within(close, limits.settlementMs),
    backend.waitForProcessGroupExit(processGroupId, limits.settlementMs),
  ]);
}

/**
 * @param {FixedInvocation} invocation
 * @param {FixedProcessBackend} backend
 * @param {FixedProcessLimits} limits
 * @param {(() => void) | Readonly<{publish(stage: string, value: string): Promise<void>}>} [progress]
 * @returns {Promise<void>}
 */
async function executeBoundedChild(
  invocation,
  backend,
  limits,
  progress = () => undefined,
) {
  /** @param {string} stage @param {string} value */
  const publish = async (stage, value) => {
    if (typeof progress === "function") {
      if (stage === "child-launched") progress();
      return;
    }
    await progress.publish(stage, value);
  };
  /** @type {FixedProcessHandle} */
  let child;
  try {
    child = backend.launch(invocation);
  } catch {
    await publish("child-failure-detected", "spawn-error");
    throw childFailure("P2_CHILD_FAILED", "known");
  }
  const processGroupId = child.pid;
  if (processGroupId === undefined || processGroupId <= 0) {
    child.onceError(() => undefined);
    await publish("child-failure-detected", "invalid-process-group");
    throw childFailure("P2_CHILD_FAILED", "unknown");
  }

  /** @type {(value: FixedChildFailureCode) => void} */
  let fail = () => undefined;
  const failure = /** @type {Promise<FixedChildFailureCode>} */ (
    new Promise((resolve) => {
      fail = resolve;
    })
  );
  /** @type {FixedChildFailureCode | null} */
  let failureCode = null;
  let outputBytes = 0;
  /** @param {FixedChildFailureCode} code */
  const beginFailure = (code) => {
    if (failureCode === null) {
      failureCode = code;
      fail(code);
    }
  };
  /** @param {Buffer} chunk */
  const countOutput = (chunk) => {
    if (failureCode !== null) {
      return;
    }
    outputBytes += chunk.byteLength;
    if (outputBytes > limits.outputBytes) {
      beginFailure("P2_OUTPUT_LIMIT");
    }
  };
  child.onStdout(countOutput);
  child.onStderr(countOutput);
  child.onceError(() => beginFailure("P2_CHILD_FAILED"));
  const close = /** @type {Promise<Readonly<{
    code: number | null,
    signal: NodeJS.Signals | null,
  }>>} */ (
    new Promise((resolve) => {
      child.onceClose((code, signal) => resolve({ code, signal }));
    })
  );
  const timer = setTimeout(
    () => beginFailure("P2_CHILD_TIMEOUT"),
    limits.timeoutMs,
  );
  try {
    await publish("child-launched", "positive-process-group");
    await publish("child-watch-armed", "close-error-output-deadline");
  } catch (error) {
    clearTimeout(timer);
    await settleChildAfterTransferFailure(
      backend,
      processGroupId,
      close,
      limits,
    );
    throw error;
  }
  const first = await Promise.race([
    close.then((value) => /** @type {const} */ ({ kind: "close", value })),
    failure.then((code) => /** @type {const} */ ({ kind: "failure", code })),
  ]);
  clearTimeout(timer);

  if (first.kind === "close") {
    const result = first.value;
    const observedClose = closeValue(result);
    if (observedClose !== null) {
      await publish("child-close-observed", observedClose);
    }
    const postCloseResidue = backend.processGroupExists(processGroupId);
    let groupExited = !postCloseResidue;
    if (postCloseResidue) {
      await publish("child-residue-detected", "post-close-group-present");
      const forceDisposition = await signalWithProgress(
        backend,
        processGroupId,
        "SIGKILL",
        publish,
      );
      if (forceDisposition === null) {
        throw childFailure("P2_CHILD_FAILED", "unknown");
      }
      groupExited = await backend.waitForProcessGroupExit(
        processGroupId,
        limits.settlementMs,
      );
      if (!groupExited || !isNaturalClose(result)) {
        throw childFailure("P2_CHILD_FAILED", "unknown");
      }
      await publish("child-group-absent", "confirmed");
      await publish("child-settled", "known-failure");
      throw childFailure("P2_CHILD_FAILED", "known");
    }
    if (!isNaturalClose(result)) {
      throw childFailure("P2_CHILD_FAILED", "unknown");
    }
    await publish("child-group-absent", "confirmed");
    if (result.code === 0) {
      await publish("child-settled", "success");
      return;
    }
    await publish("child-settled", "known-failure");
    throw childFailure("P2_CHILD_FAILED", "known");
  }

  await publish("child-failure-detected", childFailureValue(first.code));
  const termDisposition = await signalWithProgress(
    backend,
    processGroupId,
    "SIGTERM",
    publish,
  );
  if (termDisposition === null) {
    throw childFailure(first.code, "unknown");
  }
  const termClose = await within(close, limits.terminationGraceMs);
  if (termClose !== undefined) {
    const acceptedClose =
      termDisposition === "group-already-absent"
        ? isNaturalClose(termClose)
        : isSignalClose(termClose, "SIGTERM");
    const observedClose = closeValue(termClose);
    if (observedClose !== null) {
      await publish("child-close-observed", observedClose);
    }
    let groupExited = !backend.processGroupExists(processGroupId);
    if (!groupExited) {
      const forceDisposition = await signalWithProgress(
        backend,
        processGroupId,
        "SIGKILL",
        publish,
      );
      if (forceDisposition === null) {
        throw childFailure(first.code, "unknown");
      }
      groupExited = await backend.waitForProcessGroupExit(
        processGroupId,
        limits.settlementMs,
      );
    }
    if (!acceptedClose || !groupExited) {
      throw childFailure(first.code, "unknown");
    }
    await publish("child-group-absent", "confirmed");
    await publish("child-settled", "known-failure");
    throw childFailure(first.code, "known");
  }

  const forceDisposition = await signalWithProgress(
    backend,
    processGroupId,
    "SIGKILL",
    publish,
  );
  if (forceDisposition === null) {
    throw childFailure(first.code, "unknown");
  }
  const [killClose, groupExited] = await Promise.all([
    within(close, limits.settlementMs),
    backend.waitForProcessGroupExit(processGroupId, limits.settlementMs),
  ]);
  if (
    killClose === undefined ||
    !isSignalClose(killClose, "SIGKILL") ||
    !groupExited
  ) {
    throw childFailure(first.code, "unknown");
  }
  await publish("child-close-observed", "sigkill");
  await publish("child-group-absent", "confirmed");
  await publish("child-settled", "known-failure");
  throw childFailure(first.code, "known");
}

/** @type {FixedProcessBackend} */
const PRODUCTION_PROCESS_BACKEND = Object.freeze({
  launch(invocation) {
    const child = spawn(invocation.executable, invocation.arguments, {
      cwd: invocation.cwd,
      env: invocation.environment,
      shell: false,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return {
      pid: child.pid,
      onStdout(listener) {
        child.stdout.on("data", listener);
      },
      onStderr(listener) {
        child.stderr.on("data", listener);
      },
      onceError(listener) {
        child.once("error", listener);
      },
      onceClose(listener) {
        child.once("close", listener);
      },
    };
  },
  processGroupExists,
  signalProcessGroup,
  waitForProcessGroupExit,
});

const PRODUCTION_PROCESS_LIMITS = Object.freeze({
  timeoutMs: CHILD_TIMEOUT_MS,
  terminationGraceMs: TERMINATION_GRACE_MS,
  settlementMs: FORCE_SETTLEMENT_MS,
  outputBytes: MAX_CHILD_OUTPUT_BYTES,
});

/**
 * @param {FixedInvocation} invocation
 * @param {FixedProcessBackend} backend
 * @param {FixedProcessLimits} limits
 * @param {() => void} [onLaunched]
 */
export function executeBoundedViteChildWithBackendForTest(
  invocation,
  backend,
  limits,
  onLaunched,
) {
  return executeBoundedChild(invocation, backend, limits, onLaunched);
}

/**
 * @param {Readonly<{
 *   sourcePath: string,
 *   eventPath: string,
 *   outputRoot: string,
 * }>} paths
 */
async function verifyFixedOutputAtPaths(paths) {
  const segment = await lstat(paths.eventPath);
  if (
    !segment.isFile() ||
    segment.isSymbolicLink() ||
    segment.size <= 0 ||
    segment.size > MAX_EVENT_SEGMENT_BYTES
  ) {
    throw new Error("P2_RESULT_INVALID");
  }
  const outputRoot = await lstat(paths.outputRoot);
  if (!outputRoot.isDirectory() || outputRoot.isSymbolicLink()) {
    throw new Error("P2_RESULT_INVALID");
  }
  const entries = await readdir(paths.outputRoot, { withFileTypes: true });
  if (
    entries.length !== 1 ||
    entries[0]?.name !== FIXED_OUTPUT_FILE ||
    !entries[0].isFile() ||
    entries[0].isSymbolicLink()
  ) {
    throw new Error("P2_RESULT_INVALID");
  }
  const outputPath = path.join(paths.outputRoot, FIXED_OUTPUT_FILE);
  const output = await lstat(outputPath);
  if (
    !output.isFile() ||
    output.isSymbolicLink() ||
    output.size <= 0 ||
    output.size > MAX_OUTPUT_FILE_BYTES
  ) {
    throw new Error("P2_RESULT_INVALID");
  }
  const source = await readFile(paths.sourcePath);
  if (!source.equals(Buffer.from(FIXED_SOURCE_CONTENT, "utf8"))) {
    throw new Error("P2_SOURCE_CHANGED");
  }
  await Promise.all([chmod(paths.eventPath, 0o444), chmod(outputPath, 0o444)]);
  await chmod(paths.outputRoot, 0o555);
  return Object.freeze({
    sourceAfterHash: sha256(source),
    outputFiles: Object.freeze([
      Object.freeze({ logicalId: "vite-entry-output", bytes: output.size }),
    ]),
  });
}

async function verifyFixedOutput() {
  return verifyFixedOutputAtPaths(FIXED_OUTPUT_PATHS);
}

export function verifyFixedViteOutputForTest() {
  return verifyFixedOutputAtPaths(FIXED_TEST_OUTPUT_PATHS);
}

async function makeEventSegmentHostReadable() {
  try {
    const segment = await lstat(FIXED_EVENT_SEGMENT);
    if (segment.isFile() && !segment.isSymbolicLink()) {
      await chmod(FIXED_EVENT_SEGMENT, 0o444);
    }
  } catch {
    // A missing or inaccessible partial segment is represented as inconclusive.
  }
}

/**
 * @template T
 * @param {Readonly<{
 *   executeChild(): Promise<void>,
 *   verifyOutput(): Promise<T>,
 *   closeServer(): Promise<boolean>,
 *   makeEventSegmentHostReadable(): Promise<void>,
 * }>} backend
 * @returns {Promise<T>}
 */
async function executeSettledViteLifecycle(backend) {
  /** @type {Error | null} */
  let primaryFailure = null;
  /** @type {T | undefined} */
  let output;
  try {
    await backend.executeChild();
  } catch (error) {
    primaryFailure =
      error instanceof Error ? error : new Error("P2_CHILD_FAILED");
  }

  if (
    primaryFailure instanceof FixedViteRunnerError &&
    primaryFailure.settlement === "unknown"
  ) {
    throw primaryFailure;
  }

  let serverSettled = false;
  try {
    serverSettled = await backend.closeServer();
  } catch {
    serverSettled = false;
  }
  if (!serverSettled) {
    if (
      primaryFailure instanceof FixedViteRunnerError &&
      primaryFailure.settlement === "unknown"
    ) {
      throw primaryFailure;
    }
    const firstFailure =
      primaryFailure instanceof FixedViteRunnerError
        ? primaryFailure.failureCode
        : primaryFailure === null
          ? "P2_SERVER_CLOSE_FAILED"
          : "P2_RESULT_INVALID";
    throw new FixedViteRunnerError(
      firstFailure,
      "unknown",
      "P2_SERVER_SETTLEMENT_UNKNOWN",
    );
  }

  if (primaryFailure !== null) {
    await backend.makeEventSegmentHostReadable();
    throw primaryFailure;
  }
  try {
    output = await backend.verifyOutput();
  } catch (error) {
    primaryFailure =
      error instanceof Error ? error : new Error("P2_RESULT_INVALID");
    await backend.makeEventSegmentHostReadable();
    throw primaryFailure;
  }
  if (output === undefined) {
    throw new FixedViteRunnerError("P2_RESULT_INVALID", "known");
  }
  return output;
}

/**
 * @template T
 * @param {Readonly<{
 *   executeChild(): Promise<void>,
 *   verifyOutput(): Promise<T>,
 *   closeServer(): Promise<boolean>,
 *   makeEventSegmentHostReadable(): Promise<void>,
 * }>} backend
 */
export function executeFixedViteLifecycleWithBackendForTest(backend) {
  return executeSettledViteLifecycle(backend);
}

/** @param {unknown} error */
export function projectFixedViteRunnerFailure(error) {
  if (error instanceof FixedViteRunnerError) {
    return Object.freeze({
      status: "failure",
      code: "P2_RUNNER_FAILED",
      failureCode: error.failureCode,
      settlement: error.settlement,
      settlementCode: error.settlementCode,
    });
  }
  return Object.freeze({
    status: "failure",
    code: "P2_RUNNER_FAILED",
    failureCode: "P2_RUNNER_FAILED",
    settlement: "known",
    settlementCode: null,
  });
}

export async function executeFixedViteScenario() {
  if (process.version !== FIXED_NODE_VERSION || process.argv.length !== 3) {
    throw new Error("P2_RUNTIME_INVALID");
  }
  const scenarioId = process.argv[2];
  if (scenarioId === undefined) {
    throw new Error("P2_RUNTIME_INVALID");
  }
  const definition = resolveFixedViteScenario(scenarioId);
  const invocation = createFixedViteInvocation(definition);
  const writer = await createFixedViteProgressWriter(
    definition,
    FIXED_PROGRESS_ROOT,
  );
  /** @type {import("node:http").Server | null} */
  let server = null;
  let sourceBeforeHash = "";
  let terminalPublished = false;
  /** @param {FixedViteRunnerError} error */
  const publishFailure = async (error) => {
    if (!terminalPublished) {
      await writer.fail(error);
      terminalPublished = true;
    }
  };
  try {
    await writer.publish("runner-entered", "accepted");
    try {
      sourceBeforeHash = await prepareFixedInputs(definition.profileId);
    } catch {
      const failure = new FixedViteRunnerError("P2_RESULT_INVALID", "known");
      await publishFailure(failure);
      throw failure;
    }
    await writer.publish("inputs-prepared", "accepted");
    if (definition.profileId === "permissive") {
      try {
        server = await startFixedLoopbackServer();
      } catch {
        const failure = new FixedViteRunnerError(
          "P2_SERVER_CLOSE_FAILED",
          "unknown",
          "P2_SERVER_SETTLEMENT_UNKNOWN",
        );
        await publishFailure(failure);
        throw failure;
      }
      try {
        await writer.publish("service-ready", "listening");
      } catch (error) {
        await closeServer(server);
        throw error;
      }
    } else {
      await writer.publish("service-ready", "not-required");
    }

    /** @type {FixedViteRunnerError | null} */
    let childError = null;
    try {
      await executeBoundedChild(
        invocation,
        PRODUCTION_PROCESS_BACKEND,
        PRODUCTION_PROCESS_LIMITS,
        writer,
      );
    } catch (error) {
      if (error instanceof FixedViteTransferWriteError) {
        await closeServer(server);
        throw error;
      }
      childError =
        error instanceof FixedViteRunnerError
          ? error
          : new FixedViteRunnerError(
              "P2_CHILD_FAILED",
              "unknown",
              "P2_CHILD_SETTLEMENT_UNKNOWN",
            );
    }

    if (childError?.settlement === "unknown") {
      await publishFailure(childError);
      throw childError;
    }
    const serverSettled = await closeServer(server);
    if (!serverSettled) {
      const failure = new FixedViteRunnerError(
        childError?.failureCode ?? "P2_SERVER_CLOSE_FAILED",
        "unknown",
        "P2_SERVER_SETTLEMENT_UNKNOWN",
      );
      await publishFailure(failure);
      throw failure;
    }
    await writer.publish(
      "service-settled",
      definition.profileId === "permissive" ? "closed" : "not-started",
    );
    if (childError !== null) {
      await makeEventSegmentHostReadable();
      await publishFailure(childError);
      throw childError;
    }

    let output;
    try {
      output = await verifyFixedOutput();
    } catch {
      const failure = new FixedViteRunnerError("P2_RESULT_INVALID", "known");
      await makeEventSegmentHostReadable();
      await publishFailure(failure);
      throw failure;
    }
    await writer.publish("output-exported", "validated-and-sealed");
    const outputEntry = output.outputFiles[0];
    if (outputEntry === undefined) {
      throw new FixedViteRunnerError("P2_RESULT_INVALID", "known");
    }
    await writer.complete({
      sourceBeforeHash,
      sourceAfterHash: output.sourceAfterHash,
      entryOutputBytes: outputEntry.bytes,
    });
    terminalPublished = true;
  } finally {
    await writer.close();
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    await executeFixedViteScenario();
  } catch (error) {
    if (error instanceof FixedViteTransferWriteError) {
      process.stderr.write(
        '{"status":"failure","code":"P2_TRANSFER_WRITE_FAILED"}\n',
      );
      process.exitCode = 70;
    } else {
      process.stderr.write(
        `${JSON.stringify(projectFixedViteRunnerFailure(error))}\n`,
      );
      process.exitCode = 1;
    }
  }
}
