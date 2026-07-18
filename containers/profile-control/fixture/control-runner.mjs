import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import { constants } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ENVIRONMENT_KEY = "PROBE_CANARY_M4_CONTROL";
const MANIFEST_PATH = "/input/control-manifest.json";
const EVIDENCE_PATH = "/result/control-evidence.json";
const RESULT_MARKER_PATH = "/result/result-marker.txt";
const SCRATCH_PATH = "/scratch/scratch-marker.txt";
const SOURCE_MUTATION_PATH = "/opt/m4-control/source-mutation.txt";
const PERMISSIVE_CANARY_PATH = "/opt/m4-control/canary.txt";
const CONSTRAINED_CANARY_PATH = "/opt/m4-control/absent-canary.txt";
const FIXED_CHILD_PATH = "/opt/m4-control/fixed-child.mjs";
const LOOPBACK_HOST = "127.0.0.1";
const LOOPBACK_PORT = 43117;
const LOOPBACK_PATH = "/m4-profile-control";
const LOOPBACK_BODY = "m4-loopback-v1\n";
const CONTROL_ORDER = Object.freeze([
  "environment-canary",
  "canary-file-read",
  "scratch-write",
  "source-mutation",
  "loopback-protocol",
  "fixed-child",
  "result-write",
]);

function fail() {
  throw new Error("M4_CONTROL_FAILURE");
}

function exactObject(value, keys) {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail();
  }
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    actual.some((key) => !keys.includes(key))
  ) {
    fail();
  }
  return value;
}

function validateManifest(input) {
  const value = exactObject(input, [
    "schemaVersion",
    "runId",
    "controlId",
    "profileId",
    "profileRevision",
    "containerInputId",
    "containerImageDigest",
    "nodeVersion",
    "controlOrder",
    "expected",
    "limits",
  ]);
  if (
    value.schemaVersion !== "lab-profile-control-manifest/v1" ||
    !/^m4-[a-z0-9][a-z0-9-]{7,47}$/u.test(value.runId) ||
    !["permissive", "constrained"].includes(value.profileId) ||
    value.controlId !==
      (value.profileId === "permissive"
        ? "m4-profile-control-p"
        : "m4-profile-control-c") ||
    value.profileRevision !== "m4-profile-v1" ||
    value.containerInputId !== "m4-profile-control-image-v1" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value.containerImageDigest) ||
    value.nodeVersion !== "v20.18.2" ||
    process.version !== value.nodeVersion ||
    !Array.isArray(value.controlOrder) ||
    value.controlOrder.length !== CONTROL_ORDER.length ||
    value.controlOrder.some((entry, index) => entry !== CONTROL_ORDER[index]) ||
    !Array.isArray(value.expected) ||
    value.expected.length !== CONTROL_ORDER.length
  ) {
    fail();
  }
  exactObject(value.limits, [
    "controlTimeoutMs",
    "outputBytes",
    "evidenceBytes",
    "evidenceFiles",
    "memoryBytes",
    "nanoCpus",
    "pids",
  ]);
  if (
    value.limits.controlTimeoutMs !== 5000 ||
    value.limits.outputBytes !== 65536 ||
    value.limits.evidenceBytes !== 65536 ||
    value.limits.evidenceFiles !== 8 ||
    value.limits.memoryBytes !== 268435456 ||
    value.limits.nanoCpus !== 1000000000 ||
    value.limits.pids !== 64
  ) {
    fail();
  }
  return value;
}

async function environmentObservation() {
  const present = Object.hasOwn(process.env, ENVIRONMENT_KEY);
  return {
    sequence: 0,
    control: "environment-canary",
    outcome: present ? "success" : "failure",
    reason: present ? "ENV_PRESENT" : "ENV_ABSENT",
  };
}

async function fileObservation(profileId) {
  const target =
    profileId === "permissive"
      ? PERMISSIVE_CANARY_PATH
      : CONSTRAINED_CANARY_PATH;
  try {
    await readFile(target);
    return {
      sequence: 1,
      control: "canary-file-read",
      outcome: "success",
      reason: "FILE_READABLE",
    };
  } catch (error) {
    if (error?.code !== "ENOENT") fail();
    return {
      sequence: 1,
      control: "canary-file-read",
      outcome: "failure",
      reason: "FILE_NOT_FOUND",
    };
  }
}

async function writeObservation(sequence, control, target) {
  try {
    await writeFile(target, "m4-fixed-marker-v1\n", {
      encoding: "utf8",
      flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      mode: 0o600,
    });
    return { sequence, control, outcome: "success", reason: "WRITE_CREATED" };
  } catch (error) {
    if (!["EACCES", "EPERM", "EROFS"].includes(error?.code)) fail();
    return { sequence, control, outcome: "failure", reason: "WRITE_DENIED" };
  }
}

function startLoopbackService() {
  const server = http.createServer((request, response) => {
    if (request.method !== "GET" || request.url !== LOOPBACK_PATH) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": "text/plain",
      "x-m4-profile-control": "m4-loopback-v1",
    });
    response.end(LOOPBACK_BODY);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(LOOPBACK_PORT, LOOPBACK_HOST, () => resolve(server));
  });
}

async function closeServer(server) {
  if (server === undefined) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error === undefined ? resolve() : reject(error)));
  });
}

async function attemptLoopback() {
  return new Promise((resolve) => {
    const request = http.request(
      {
        host: LOOPBACK_HOST,
        port: LOOPBACK_PORT,
        path: LOOPBACK_PATH,
        method: "GET",
        timeout: 750,
      },
      (response) => {
        const chunks = [];
        let bytes = 0;
        response.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > 256) {
            request.destroy();
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          const verified =
            response.statusCode === 200 &&
            response.headers["x-m4-profile-control"] === "m4-loopback-v1" &&
            Buffer.concat(chunks).toString("utf8") === LOOPBACK_BODY;
          resolve({
            sequence: 4,
            control: "loopback-protocol",
            outcome: verified ? "success" : "failure",
            reason: verified ? "LOOPBACK_PROTOCOL_VERIFIED" : "NETWORK_FAILURE",
          });
        });
      },
    );
    request.once("timeout", () => request.destroy());
    request.once("error", () => {
      resolve({
        sequence: 4,
        control: "loopback-protocol",
        outcome: "failure",
        reason: "NETWORK_FAILURE",
      });
    });
    request.end();
  });
}

async function childObservation() {
  let result;
  try {
    result = await execFileAsync(process.execPath, [FIXED_CHILD_PATH], {
      cwd: "/opt/m4-control",
      env: {},
      encoding: "utf8",
      shell: false,
      timeout: 750,
      maxBuffer: 256,
    });
  } catch (error) {
    if (error?.code !== "ERR_ACCESS_DENIED") fail();
    return {
      sequence: 5,
      control: "fixed-child",
      outcome: "failure",
      reason: "CHILD_PROCESS_DENIED",
    };
  }
  if (result.stdout !== "m4-fixed-child-v1\n" || result.stderr !== "") fail();
  return {
    sequence: 5,
    control: "fixed-child",
    outcome: "success",
    reason: "CHILD_PROTOCOL_VERIFIED",
  };
}

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== MANIFEST_PATH) fail();
  const manifestBytes = await readFile(MANIFEST_PATH);
  if (manifestBytes.byteLength > 65_536) fail();
  const manifest = validateManifest(JSON.parse(manifestBytes.toString("utf8")));
  const observations = [];
  observations.push(await environmentObservation());
  observations.push(await fileObservation(manifest.profileId));
  observations.push(await writeObservation(2, "scratch-write", SCRATCH_PATH));
  observations.push(
    await writeObservation(3, "source-mutation", SOURCE_MUTATION_PATH),
  );
  const server =
    manifest.profileId === "permissive"
      ? await startLoopbackService()
      : undefined;
  try {
    observations.push(await attemptLoopback());
  } finally {
    await closeServer(server);
  }
  observations.push(await childObservation());
  await writeFile(RESULT_MARKER_PATH, "m4-result-channel-v1\n", {
    encoding: "utf8",
    flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
    mode: 0o600,
  });
  observations.push({
    sequence: 6,
    control: "result-write",
    outcome: "success",
    reason: "RESULT_WRITTEN",
  });
  const evidence = {
    schemaVersion: "lab-profile-control-evidence/v1",
    runId: manifest.runId,
    controlId: manifest.controlId,
    profileId: manifest.profileId,
    containerImageDigest: manifest.containerImageDigest,
    nodeVersion: process.version,
    observations,
    complete: true,
  };
  const evidenceBytes = `${JSON.stringify(evidence)}\n`;
  if (Buffer.byteLength(evidenceBytes) > manifest.limits.evidenceBytes) fail();
  await writeFile(EVIDENCE_PATH, evidenceBytes, {
    encoding: "utf8",
    flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
    mode: 0o600,
  });
}

await main();
