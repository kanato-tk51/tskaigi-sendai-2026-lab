import { spawn } from "node:child_process";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { pathToFileURL } from "node:url";

const FIXED_NODE_VERSION = "v20.18.2";
const FIXED_LOOPBACK_ADDRESS = "127.0.0.1";
const FIXED_LOOPBACK_PORT = 47_831;
const FIXED_CLI_PATH = "/opt/p2/input/codegen/dist/cli.js";
const FIXED_INPUT_SNAPSHOT_PATH = "/opt/p2/input/input-snapshot.txt";
const FIXED_CANARY_DIRECTORY = "/tmp/p2-tool/canary";
const FIXED_CANARY_PATH = "/tmp/p2-tool/canary/input.txt";
const FIXED_EVENT_SEGMENT = "/tmp/p2-result/codegen-cli-producer.jsonl";
const FIXED_DIRECT_WRITE_PATH = "/tmp/p2-direct-write/direct-write-marker.json";
const FIXED_INPUT_SNAPSHOT = "m2e input snapshot\n";
const FIXED_FILE_CANARY = "m2e disposable file canary\n";
const FIXED_ENVIRONMENT_CANARY = "m2e-disposable-environment-canary";
const MAX_CHILD_OUTPUT_BYTES = 8_192;
const MAX_EVENT_SEGMENT_BYTES = 65_536;
const CHILD_TIMEOUT_MS = 10_000;

const RUN_ID_VARIABLE = "PROBE_CANARY_M2E_RUN_ID";
const RUN_ROOT_VARIABLE = "PROBE_CANARY_M2E_RUN_ROOT";
const LOOPBACK_PORT_VARIABLE = "PROBE_CANARY_M2E_LOOPBACK_PORT";
const VARIANT_VARIABLE = "PROBE_CANARY_M2E_VARIANT";
const SCENARIO_ID_VARIABLE = "PROBE_CANARY_M2E_SCENARIO_ID";
const ENVIRONMENT_VARIABLE = "PROBE_CANARY_M2E_ENVIRONMENT";

const DEFINITIONS = Object.freeze([
  Object.freeze({
    scenarioId: "codegen-observe-p",
    profileId: "permissive",
    runId: "p2-codegen-observe-p-20260719-01",
  }),
  Object.freeze({
    scenarioId: "codegen-observe-c",
    profileId: "constrained",
    runId: "p2-codegen-observe-c-20260719-01",
  }),
]);

const CONSTRAINED_PERMISSION_ARGUMENTS = Object.freeze([
  "--experimental-permission",
  "--allow-fs-read=/opt/p2/input",
  "--allow-fs-read=/tmp/p2-result",
  "--allow-fs-read=/tmp/p2-tool",
  "--allow-fs-read=/tmp/p2-direct-write",
  "--allow-fs-write=/tmp/p2-result",
  "--allow-fs-write=/tmp/p2-direct-write",
]);

/** @typedef {"codegen-observe-p" | "codegen-observe-c"} ScenarioId */
/** @typedef {"permissive" | "constrained"} ProfileId */
/**
 * @typedef {Readonly<{
 *   executable: "/usr/local/bin/node",
 *   arguments: readonly string[],
 *   environment: Readonly<Record<string, string>>,
 *   cwd: "/opt/p2/input/codegen",
 *   shell: false,
 * }>} FixedInvocation
 */

/**
 * @param {string} scenarioId
 * @returns {Readonly<{scenarioId: ScenarioId, profileId: ProfileId, runId: string}>}
 */
export function resolveFixedCodegenScenario(scenarioId) {
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
 */
export function createFixedCodegenInvocation(definition) {
  const environment = {
    [RUN_ID_VARIABLE]: definition.runId,
    [RUN_ROOT_VARIABLE]: "/tmp/p2-result",
    [LOOPBACK_PORT_VARIABLE]: String(FIXED_LOOPBACK_PORT),
    [VARIANT_VARIABLE]: "observe",
    [SCENARIO_ID_VARIABLE]: definition.scenarioId,
    ...(definition.profileId === "permissive"
      ? { [ENVIRONMENT_VARIABLE]: FIXED_ENVIRONMENT_CANARY }
      : {}),
  };
  return Object.freeze({
    executable: "/usr/local/bin/node",
    arguments: Object.freeze([
      ...(definition.profileId === "constrained"
        ? CONSTRAINED_PERMISSION_ARGUMENTS
        : []),
      FIXED_CLI_PATH,
      "observe",
    ]),
    environment: Object.freeze(environment),
    cwd: "/opt/p2/input/codegen",
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
  const snapshot = await readFile(FIXED_INPUT_SNAPSHOT_PATH, "utf8");
  if (snapshot !== FIXED_INPUT_SNAPSHOT) {
    throw new Error("P2_INPUT_INVALID");
  }
  await requireAbsent(FIXED_EVENT_SEGMENT);
  await requireAbsent(FIXED_DIRECT_WRITE_PATH);
  await mkdir(FIXED_CANARY_DIRECTORY, { recursive: true, mode: 0o700 });
  await writeFile(FIXED_CANARY_PATH, FIXED_FILE_CANARY, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  await chmod(FIXED_CANARY_PATH, profileId === "constrained" ? 0o000 : 0o400);
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
 * @param {import("node:http").Server | null} server
 * @returns {Promise<void>}
 */
function closeServer(server) {
  if (server === null) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    server.close((error) => (error === undefined ? resolve() : reject(error)));
  });
}

/**
 * @param {FixedInvocation} invocation
 * @returns {Promise<void>}
 */
function executeBoundedChild(invocation) {
  return new Promise((resolve, reject) => {
    const child = spawn(invocation.executable, invocation.arguments, {
      cwd: invocation.cwd,
      env: invocation.environment,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let outputBytes = 0;
    let settled = false;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;
    /** @param {Error | null} error */
    const finish = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      if (error === null) {
        resolve();
      } else {
        reject(error);
      }
    };
    /** @param {Buffer} chunk */
    const countOutput = (chunk) => {
      outputBytes += chunk.byteLength;
      if (outputBytes > MAX_CHILD_OUTPUT_BYTES) {
        child.kill("SIGKILL");
        finish(new Error("P2_OUTPUT_LIMIT"));
      }
    };
    child.stdout.on("data", countOutput);
    child.stderr.on("data", countOutput);
    child.stdout.resume();
    child.stderr.resume();
    child.once("error", () => finish(new Error("P2_CHILD_FAILED")));
    child.once("close", (code, signal) => {
      finish(
        code === 0 && signal === null ? null : new Error("P2_CHILD_FAILED"),
      );
    });
    timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(new Error("P2_CHILD_TIMEOUT"));
    }, CHILD_TIMEOUT_MS);
  });
}

async function verifyFixedOutput() {
  const segment = await stat(FIXED_EVENT_SEGMENT);
  if (!segment.isFile() || segment.size > MAX_EVENT_SEGMENT_BYTES) {
    throw new Error("P2_RESULT_INVALID");
  }
  const snapshot = await readFile(FIXED_INPUT_SNAPSHOT_PATH, "utf8");
  if (snapshot !== FIXED_INPUT_SNAPSHOT) {
    throw new Error("P2_SOURCE_CHANGED");
  }
}

export async function executeFixedCodegenScenario() {
  if (process.version !== FIXED_NODE_VERSION || process.argv.length !== 3) {
    throw new Error("P2_RUNTIME_INVALID");
  }
  const scenarioId = process.argv[2];
  if (scenarioId === undefined) {
    throw new Error("P2_RUNTIME_INVALID");
  }
  const definition = resolveFixedCodegenScenario(scenarioId);
  const invocation = createFixedCodegenInvocation(definition);
  await prepareFixedInputs(definition.profileId);
  const server =
    definition.profileId === "permissive"
      ? await startFixedLoopbackServer()
      : null;
  try {
    await executeBoundedChild(invocation);
    await verifyFixedOutput();
  } finally {
    await closeServer(server);
  }
  process.stdout.write(
    `${JSON.stringify({
      status: "completed",
      scenarioId: definition.scenarioId,
      profileId: definition.profileId,
    })}\n`,
  );
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    await executeFixedCodegenScenario();
  } catch {
    process.stderr.write('{"status":"failure","code":"P2_RUNNER_FAILED"}\n');
    process.exitCode = 1;
  }
}
