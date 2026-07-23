import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
} from "node:fs/promises";
import http from "node:http";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";

const GENERATION = "20260721-01";
const EXPECTED_REVISION = "m2a-transfer-expected-20260721-01";
const RUN_ID = "m2a-npm-lifecycle-20260721000000000000000000000001";
const SCENARIO_ID = "m2a-npm-lifecycle";
const RUN_ROOT = `/work/${RUN_ID}`;
const CONSUMER_ROOT = "/work/consumer";
const INPUT_ROOT = "/work/input";
const SEGMENT_PATH = `${RUN_ROOT}/npm-lifecycle-producer.jsonl`;
const MARKER_PATH = `${RUN_ROOT}/probe-output/direct-write-marker.json`;
const COMPLETION_NEXT = `${RUN_ROOT}/transfer-completion.next`;
const COMPLETION_PATH = `${RUN_ROOT}/transfer-completion.json`;
const NPM = "/usr/local/bin/npm";
const DEPENDENCY = "@tskaigi-lab/m2a-install-probe";
const TARBALL = `${INPUT_ROOT}/m2a-install-probe-1.0.0.tgz`;
const MAX_OUTPUT = 65_536;
const CHILD_TIMEOUT = 120_000;
const ISSUE_CODES = new Set([
  "M2A_SETUP_INVALID",
  "M2A_NPM_INSTALL_FAILED",
  "M2A_APPROVAL_FAILED",
  "M2A_APPROVAL_INVALID",
  "M2A_REBUILD_FAILED",
  "M2A_CHILD_SETTLEMENT_UNKNOWN",
  "M2A_LOOPBACK_SETTLEMENT_UNKNOWN",
  "M2A_OUTPUT_INVALID",
  "M2A_PUBLICATION_FAILED",
]);
const READY_BYTES = Buffer.from(
  `${JSON.stringify({
    schemaVersion: "m2a-volume-ready/v1",
    generation: GENERATION,
    runId: RUN_ID,
    volumeId: "tskaigi-m2a-evidence-20260721-01",
  })}\n`,
  "utf8",
);

const digest = (bytes) =>
  `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

async function closeHandles(handles, keys) {
  let firstFailure;
  for (const key of keys) {
    const handle = handles[key];
    if (handle === undefined) continue;
    handles[key] = undefined;
    try {
      await handle.close();
    } catch (error) {
      firstFailure ??= error;
    }
  }
  if (firstFailure !== undefined) throw firstFailure;
}

function createPrePublicationDescriptorTracker() {
  let opened = 0;
  let settled = 0;
  let everyCloseSucceeded = true;
  return Object.freeze({
    own(handle) {
      opened += 1;
      let closeAttempted = false;
      return async () => {
        if (closeAttempted) throw new Error("M2A_DESCRIPTOR_CLOSE_REPEATED");
        closeAttempted = true;
        try {
          await handle.close();
        } catch (error) {
          everyCloseSucceeded = false;
          throw error;
        } finally {
          settled += 1;
        }
      };
    },
    allClosed() {
      return opened === settled && everyCloseSucceeded;
    },
  });
}

async function awaitAllSettledOwnership(branches) {
  const results = await Promise.allSettled(branches);
  const firstRejection = results.find((result) => result.status === "rejected");
  if (firstRejection !== undefined) throw firstRejection.reason;
  return results.map((result) => result.value);
}

function fixedEnvironment() {
  return Object.freeze({
    HOME: "/work/npm-home",
    PATH: "/usr/local/bin:/usr/bin:/bin",
    npm_config_cache: "/work/npm-cache",
    npm_config_prefix: "/work/npm-prefix",
    npm_config_offline: "true",
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_update_notifier: "false",
    PROBE_CANARY_M2A_RUN_ID: RUN_ID,
    PROBE_CANARY_M2A_RUN_ROOT: RUN_ROOT,
    PROBE_CANARY_M2A_LOOPBACK_PORT: "37001",
    PROBE_CANARY_M2A_ENVIRONMENT: "m2a-private-environment-canary-v1",
  });
}

function boundedCollector(stream) {
  let bytes = 0;
  let truncated = false;
  stream.on("data", (chunk) => {
    bytes += Buffer.byteLength(chunk);
    if (bytes > MAX_OUTPUT) {
      truncated = true;
      stream.destroy();
    }
  });
  return () => truncated;
}

function runNpm(stepId, argv) {
  return new Promise((resolve) => {
    const child = spawn(NPM, argv, {
      cwd: CONSUMER_ROOT,
      env: fixedEnvironment(),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdoutTruncated = boundedCollector(child.stdout);
    const stderrTruncated = boundedCollector(child.stderr);
    let exitCode = null;
    let exitSignal = null;
    let timedOut = false;
    let settled = false;
    let killTimer;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 2_000);
      killTimer.unref();
    }, CHILD_TIMEOUT);
    timer.unref();
    child.once("exit", (code, signal) => {
      exitCode = code;
      exitSignal = signal;
    });
    child.once("error", () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        clearTimeout(killTimer);
        resolve({
          stepId,
          argv,
          exitCode: null,
          signal: null,
          timedOut,
          stdoutTruncated: stdoutTruncated(),
          stderrTruncated: stderrTruncated(),
          closed: false,
        });
      }
    });
    child.once("close", () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        clearTimeout(killTimer);
        resolve({
          stepId,
          argv,
          exitCode,
          signal: exitSignal,
          timedOut,
          stdoutTruncated: stdoutTruncated(),
          stderrTruncated: stderrTruncated(),
          closed: true,
        });
      }
    });
  });
}

function isSuccessfulNpmTerminal(result) {
  return (
    result.closed === true &&
    result.exitCode === 0 &&
    result.signal === null &&
    result.timedOut === false &&
    result.stdoutTruncated === false &&
    result.stderrTruncated === false
  );
}

async function fileHash(filePath) {
  try {
    return digest(await readFile(filePath));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function approvalState() {
  const packageJson = JSON.parse(
    await readFile(`${CONSUMER_ROOT}/package.json`, "utf8"),
  );
  const entries = packageJson.allowScripts ?? {};
  const keys = Object.keys(entries);
  if (keys.length === 0) return "absent";
  return keys.length === 1 &&
    keys[0] === "file:/work/input/m2a-install-probe-1.0.0.tgz" &&
    entries[keys[0]] === true
    ? "present"
    : "invalid";
}

async function allAbsent(paths) {
  for (const filePath of paths) {
    try {
      await lstat(filePath);
      return false;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return true;
}

async function validateReadyRecord(descriptorTracker) {
  const handle = await open(
    `${RUN_ROOT}/.volume-ready.json`,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  const close = descriptorTracker.own(handle);
  try {
    const before = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.nlink !== 1n ||
      Number(before.mode & 0o7777n) !== 0o444 ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      !bytes.equals(READY_BYTES)
    ) {
      throw new Error("M2A_SETUP_INVALID");
    }
  } finally {
    await close();
  }
}

async function writePrivateInput(descriptorTracker, filePath, contents) {
  const bytes = Buffer.from(contents, "utf8");
  const handle = await open(filePath, "wx+", 0o600);
  const close = descriptorTracker.own(handle);
  try {
    const written = await handle.write(bytes, 0, bytes.length, 0);
    await handle.sync();
    const readBack = Buffer.alloc(bytes.length);
    const read = await handle.read(readBack, 0, readBack.length, 0);
    const stats = await handle.stat({ bigint: true });
    if (
      written.bytesWritten !== bytes.length ||
      read.bytesRead !== bytes.length ||
      !readBack.equals(bytes) ||
      !stats.isFile() ||
      stats.nlink !== 1n ||
      stats.size !== BigInt(bytes.length) ||
      Number(stats.mode & 0o7777n) !== 0o600
    ) {
      throw new Error("M2A_SETUP_INVALID");
    }
  } finally {
    await close();
  }
}

function startLoopback() {
  const server = http.createServer((request, response) => {
    if (request.method !== "GET" || request.url !== "/probe-canary") {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "x-tskaigi-probe-canary": "probe-network-v1",
    });
    response.end("probe-network-v1\n");
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(37_001, "127.0.0.1", () => resolve(server));
  });
}

function closeLoopback(server) {
  if (server === undefined) return Promise.resolve(true);
  return new Promise((resolve) => {
    server.close((error) => resolve(error === undefined));
  });
}

async function captureOutput(descriptorTracker, filePath, relativePath) {
  let handle;
  try {
    handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  const close = descriptorTracker.own(handle);
  try {
    const before = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1n ||
      before.size < 1n ||
      before.size > 4_194_304n ||
      Number(before.mode & 0o7777n) !== 0o600
    ) {
      throw new Error("M2A_OUTPUT_INVALID");
    }
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      bytes.length !== Number(before.size)
    ) {
      throw new Error("M2A_OUTPUT_INVALID");
    }
    return {
      path: relativePath,
      size: bytes.length,
      sha256: digest(bytes),
      mode: 0o600,
    };
  } finally {
    await close();
  }
}

function emptyFlow(stepId, argv) {
  return {
    stepId,
    argv,
    exitCode: null,
    signal: null,
    timedOut: false,
    stdoutTruncated: false,
    stderrTruncated: false,
    approval: "not-checked",
    lockBefore: null,
    lockAfter: null,
  };
}

async function publishCompletion(completion) {
  const bytes = Buffer.from(`${JSON.stringify(completion)}\n`, "utf8");
  if (bytes.length > 16_384) throw new Error("M2A_PUBLICATION_FAILED");
  const handles = {
    root: await open(
      RUN_ROOT,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    ),
    next: undefined,
  };
  try {
    const rootBefore = await handles.root.stat({ bigint: true });
    handles.next = await open(
      COMPLETION_NEXT,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_RDWR |
        constants.O_NOFOLLOW,
      0o600,
    );
    const written = await handles.next.write(bytes, 0, bytes.length, 0);
    if (written.bytesWritten !== bytes.length) {
      throw new Error("M2A_PUBLICATION_FAILED");
    }
    await handles.next.sync();
    const readBack = Buffer.alloc(bytes.length);
    const read = await handles.next.read(readBack, 0, readBack.length, 0);
    if (read.bytesRead !== bytes.length || !readBack.equals(bytes)) {
      throw new Error("M2A_PUBLICATION_FAILED");
    }
    await handles.next.chmod(0o444);
    const publishedIdentity = await handles.next.stat({ bigint: true });
    await closeHandles(handles, ["next"]);
    await rename(COMPLETION_NEXT, COMPLETION_PATH);
    const [rootAfter, completionAfter] = await Promise.all([
      lstat(RUN_ROOT, { bigint: true }),
      lstat(COMPLETION_PATH, { bigint: true }),
    ]);
    if (
      rootAfter.dev !== rootBefore.dev ||
      rootAfter.ino !== rootBefore.ino ||
      !rootAfter.isDirectory() ||
      completionAfter.dev !== publishedIdentity.dev ||
      completionAfter.ino !== publishedIdentity.ino ||
      !completionAfter.isFile() ||
      completionAfter.isSymbolicLink()
    ) {
      throw new Error("M2A_PUBLICATION_FAILED");
    }
    await handles.root.sync();
  } finally {
    await closeHandles(handles, ["next", "root"]);
  }
}

async function run() {
  if (process.argv.length !== 2) return 70;
  let issue = null;
  let loopback;
  let npmChildClosed = true;
  const prePublicationDescriptors = createPrePublicationDescriptorTracker();
  const npmFlow = [
    emptyFlow("install", ["install"]),
    emptyFlow("approve-scripts", ["approve-scripts", DEPENDENCY]),
    emptyFlow("rebuild", ["rebuild", DEPENDENCY]),
  ];
  try {
    if (process.version !== "v24.18.0") {
      throw new Error("M2A_SETUP_INVALID");
    }
    const inventory = (await readdir(RUN_ROOT)).sort();
    if (JSON.stringify(inventory) !== JSON.stringify([".volume-ready.json"])) {
      throw new Error("M2A_SETUP_INVALID");
    }
    await validateReadyRecord(prePublicationDescriptors);
    await Promise.all([
      mkdir(CONSUMER_ROOT, { recursive: false, mode: 0o700 }),
      mkdir(INPUT_ROOT, { recursive: false, mode: 0o700 }),
      mkdir("/work/npm-home", { recursive: false, mode: 0o700 }),
      mkdir("/work/npm-cache", { recursive: false, mode: 0o700 }),
      mkdir("/work/npm-prefix", { recursive: false, mode: 0o700 }),
      mkdir(`${RUN_ROOT}/canary`, { recursive: false, mode: 0o700 }),
      mkdir(`${RUN_ROOT}/probe-output`, { recursive: false, mode: 0o700 }),
    ]);
    await copyFile(
      "/opt/m2a-input/consumer/package.json",
      `${CONSUMER_ROOT}/package.json`,
      constants.COPYFILE_EXCL,
    );
    await copyFile(
      "/opt/m2a-input/m2a-install-probe-1.0.0.tgz",
      TARBALL,
      constants.COPYFILE_EXCL,
    );
    if ((await approvalState()) !== "absent") {
      throw new Error("M2A_SETUP_INVALID");
    }
    const install = await runNpm("install", ["install"]);
    npmChildClosed = install.closed;
    npmFlow[0] = {
      ...install,
      approval: "not-checked",
      lockBefore: null,
      lockAfter: null,
    };
    delete npmFlow[0].closed;
    if (!install.closed) throw new Error("M2A_CHILD_SETTLEMENT_UNKNOWN");
    npmFlow[0].approval = await approvalState();
    npmFlow[0].lockAfter = await fileHash(`${CONSUMER_ROOT}/package-lock.json`);
    if (
      !isSuccessfulNpmTerminal(install) ||
      npmFlow[0].approval !== "absent" ||
      npmFlow[0].lockAfter === null
    ) {
      throw new Error("M2A_NPM_INSTALL_FAILED");
    }
    const lockBeforeApproval = npmFlow[0].lockAfter;
    const approve = await runNpm("approve-scripts", [
      "approve-scripts",
      DEPENDENCY,
    ]);
    npmChildClosed = approve.closed;
    npmFlow[1] = {
      ...approve,
      approval: "not-checked",
      lockBefore: lockBeforeApproval,
      lockAfter: null,
    };
    delete npmFlow[1].closed;
    if (!approve.closed) throw new Error("M2A_CHILD_SETTLEMENT_UNKNOWN");
    npmFlow[1].approval = await approvalState();
    npmFlow[1].lockAfter = await fileHash(`${CONSUMER_ROOT}/package-lock.json`);
    if (!isSuccessfulNpmTerminal(approve)) {
      throw new Error("M2A_APPROVAL_FAILED");
    }
    if (
      npmFlow[1].approval !== "present" ||
      npmFlow[1].lockBefore !== npmFlow[1].lockAfter ||
      !(await allAbsent([SEGMENT_PATH, MARKER_PATH]))
    ) {
      throw new Error("M2A_APPROVAL_INVALID");
    }
    await awaitAllSettledOwnership([
      writePrivateInput(
        prePublicationDescriptors,
        `${RUN_ROOT}/canary/input.txt`,
        "m2a-private-file-canary-v1\n",
      ),
      writePrivateInput(
        prePublicationDescriptors,
        `${RUN_ROOT}/input-snapshot.txt`,
        "m2a-source-snapshot-v1\n",
      ),
    ]);
    loopback = await startLoopback();
    const rebuild = await runNpm("rebuild", ["rebuild", DEPENDENCY]);
    npmChildClosed = rebuild.closed;
    npmFlow[2] = {
      ...rebuild,
      approval: "not-checked",
      lockBefore: npmFlow[1].lockAfter,
      lockAfter: null,
    };
    delete npmFlow[2].closed;
    if (!rebuild.closed) throw new Error("M2A_CHILD_SETTLEMENT_UNKNOWN");
    npmFlow[2].approval = await approvalState();
    npmFlow[2].lockAfter = await fileHash(`${CONSUMER_ROOT}/package-lock.json`);
    if (!isSuccessfulNpmTerminal(rebuild)) {
      throw new Error("M2A_REBUILD_FAILED");
    }
    if (
      npmFlow[2].approval !== "present" ||
      npmFlow[2].lockBefore !== npmFlow[2].lockAfter
    ) {
      throw new Error("M2A_APPROVAL_INVALID");
    }
  } catch (error) {
    issue = ISSUE_CODES.has(error?.message)
      ? error.message
      : "M2A_SETUP_INVALID";
  }
  const loopbackClosed = await closeLoopback(loopback);
  if (!loopbackClosed && issue === null)
    issue = "M2A_LOOPBACK_SETTLEMENT_UNKNOWN";
  let outputInventory = [];
  try {
    outputInventory = (
      await awaitAllSettledOwnership([
        captureOutput(
          prePublicationDescriptors,
          SEGMENT_PATH,
          "npm-lifecycle-producer.jsonl",
        ),
        captureOutput(
          prePublicationDescriptors,
          MARKER_PATH,
          "probe-output/direct-write-marker.json",
        ),
      ])
    ).filter((entry) => entry !== null);
  } catch {
    issue ??= "M2A_OUTPUT_INVALID";
  }
  const prePublicationDescriptorsClosed = prePublicationDescriptors.allClosed();
  if (!prePublicationDescriptorsClosed) issue ??= "M2A_OUTPUT_INVALID";
  if (
    issue === null &&
    outputInventory[0]?.path !== "npm-lifecycle-producer.jsonl"
  ) {
    issue = "M2A_OUTPUT_INVALID";
  }
  const completion = {
    schemaVersion: "m2a-transfer-completion/v1",
    generation: GENERATION,
    expectedRevision: EXPECTED_REVISION,
    runId: RUN_ID,
    scenarioId: SCENARIO_ID,
    toolchain: { node: process.version, npm: "12.0.1" },
    npmFlow,
    runnerSettlement: {
      npmChildClosed,
      loopbackClosed,
      prePublicationDescriptorsClosed,
    },
    outputInventory,
    status: issue === null ? "complete" : "inconclusive",
    issue,
  };
  try {
    await publishCompletion(completion);
  } catch {
    return 70;
  }
  return issue === null ? 0 : 70;
}

run().then((exitCode) => {
  process.exitCode = exitCode;
});
