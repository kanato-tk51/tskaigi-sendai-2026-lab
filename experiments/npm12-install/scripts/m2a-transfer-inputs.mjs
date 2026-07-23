import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  readdirSync,
  renameSync,
  writeSync,
} from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readdir,
  readFile,
  rename,
} from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { types } from "node:util";

import {
  M2A_CONSTRUCTION,
  calculateTrackedInputAggregates,
} from "./m2a-transfer-construction.mjs";

const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(MODULE_DIRECTORY, "../../..");
const WORK_ROOT = path.join(REPOSITORY_ROOT, "experiments/npm12-install/.work");
const ACQUISITION_ROOT = path.join(
  WORK_ROOT,
  "m2a-transfer-acquisition-20260721-01",
);
const TOOLCHAIN_ATTEMPT_ROOT = path.join(
  WORK_ROOT,
  "m2a-transfer-toolchain-attempt-20260721-01",
);
const TOOLCHAIN_ROOT = path.join(
  WORK_ROOT,
  "m2a-transfer-toolchain-20260721-01",
);

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const SRI_PATTERN = /^sha512-[A-Za-z0-9+/]{86}==$/u;
const SAFE_COMPONENT = /^(?!\.{1,2}$)[A-Za-z0-9@._+-]+$/u;
const fakeNpmBackendBrand = new WeakSet();
const fakeToolchainBackendBrand = new WeakSet();

const PACKAGE_SPECS = Object.freeze([
  Object.freeze({
    name: "typescript",
    version: "5.9.3",
    integrity:
      "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
    sourceRoot: "node_modules/typescript",
    logicalPrefix: "packages/typescript",
  }),
  Object.freeze({
    name: "@types/node",
    version: "20.19.43",
    integrity:
      "sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==",
    sourceRoot: "node_modules/@types/node",
    logicalPrefix: "packages/@types/node",
  }),
  Object.freeze({
    name: "undici-types",
    version: "6.21.0",
    integrity:
      "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
    sourceRoot: "node_modules/undici-types",
    logicalPrefix: "packages/undici-types",
  }),
]);

const NPM_REQUESTS = Object.freeze([
  Object.freeze({
    id: "metadata",
    protocol: "https:",
    method: "GET",
    hostname: "registry.npmjs.org",
    port: 443,
    servername: "registry.npmjs.org",
    pathname: "/npm/12.0.1",
    url: "https://registry.npmjs.org/npm/12.0.1",
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    agent: false,
    headers: Object.freeze({
      Accept: "application/vnd.npm.install-v1+json",
      "Accept-Encoding": "identity",
      Connection: "close",
    }),
    contentTypes: Object.freeze([
      "application/json",
      "application/vnd.npm.install-v1+json",
    ]),
    maximumBytes: 1_048_576,
    absoluteDeadlineMs: 30_000,
    destroyGraceMs: 250,
    closeDeadlineMs: 1_000,
  }),
  Object.freeze({
    id: "tarball",
    protocol: "https:",
    method: "GET",
    hostname: "registry.npmjs.org",
    port: 443,
    servername: "registry.npmjs.org",
    pathname: "/npm/-/npm-12.0.1.tgz",
    url: "https://registry.npmjs.org/npm/-/npm-12.0.1.tgz",
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    agent: false,
    headers: Object.freeze({
      Accept: "application/octet-stream",
      "Accept-Encoding": "identity",
      Connection: "close",
    }),
    contentTypes: Object.freeze(["application/octet-stream"]),
    maximumBytes: 67_108_864,
    absoluteDeadlineMs: 30_000,
    destroyGraceMs: 250,
    closeDeadlineMs: 1_000,
  }),
]);

export const M2A_INPUTS = Object.freeze({
  generation: "20260721-01",
  npmVersion: "12.0.1",
  acquisitionRoot:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01",
  acquisitionArchive:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/npm-12.0.1.tgz",
  acquisitionReceipt:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/acquisition.json",
  toolchainAttemptRoot:
    "experiments/npm12-install/.work/m2a-transfer-toolchain-attempt-20260721-01",
  toolchainRoot:
    "experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01",
  toolchainReceipt:
    "experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01/toolchain.json",
  sourceAggregate:
    "sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04",
  constructionBaselineAggregate:
    "sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526",
  requestAbsoluteDeadlineMs: 30_000,
  requestDestroyGraceMs: 250,
  requestCloseDeadlineMs: 1_000,
  toolchainAbsoluteDeadlineMs: 120_000,
  descriptorCloseDeadlineMs: 1_000,
  metadataMaximumBytes: 1_048_576,
  fileMaximumBytes: 67_108_864,
  familyMaximumBytes: 536_870_912,
  inventoryMaximumBytes: 1_073_741_824,
  inventoryMaximumRows: 50_000,
  runtimeMaximumRows: 256,
  receiptMaximumBytes: 4_194_304,
  evidenceReview: "not-performed",
});

function fail(code) {
  throw new Error(code);
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function sha512Sri(value) {
  return `sha512-${createHash("sha512").update(value).digest("base64")}`;
}

function deepFreeze(value) {
  if (ArrayBuffer.isView(value)) return value;
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    if (types.isProxy(value)) fail("M2A_INPUT_UNTRUSTED_VALUE");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const descriptor of Object.values(descriptors)) {
      if ("value" in descriptor) deepFreeze(descriptor.value);
    }
    Object.freeze(value);
  }
  return value;
}

function readRecord(value, code) {
  try {
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Object.getOwnPropertySymbols(value).length !== 0
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const output = {};
    for (const key of Object.keys(descriptors)) {
      const descriptor = descriptors[key];
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true
      ) {
        fail(code);
      }
      output[key] = descriptor.value;
    }
    return output;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function readArray(value, code) {
  try {
    if (
      !Array.isArray(value) ||
      types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Array.prototype ||
      Object.getOwnPropertySymbols(value).length !== 0
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Object.keys(descriptors);
    const expected = [
      ...Array.from({ length: value.length }, (_, index) => String(index)),
      "length",
    ];
    if (JSON.stringify(keys) !== JSON.stringify(expected)) fail(code);
    const output = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = descriptors[String(index)];
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true
      ) {
        fail(code);
      }
      output.push(descriptor.value);
    }
    return output;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function assertKeys(value, keys, code) {
  if (JSON.stringify(Object.keys(value)) !== JSON.stringify(keys)) fail(code);
}

function assertSha256(value, code) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) fail(code);
}

function assertSri(value, code) {
  if (typeof value !== "string" || !SRI_PATTERN.test(value)) fail(code);
}

function asBytes(value, code) {
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  fail(code);
}

function canonicalLine(record) {
  return Buffer.from(`${JSON.stringify(record)}\n`, "utf8");
}

function parseCanonicalLine(value, maximumBytes, code) {
  const bytes = asBytes(value, code);
  if (
    bytes.length === 0 ||
    bytes.length > maximumBytes ||
    bytes.at(-1) !== 0x0a ||
    bytes.subarray(0, -1).includes(0x0a)
  ) {
    fail(code);
  }
  let parsed;
  try {
    parsed = JSON.parse(bytes.subarray(0, -1).toString("utf8"));
  } catch {
    fail(code);
  }
  const record = readRecord(parsed, code);
  if (!canonicalLine(record).equals(bytes)) fail(code);
  return { bytes, record };
}

function compareExactOwnData(valueInput, expectedInput, code) {
  const value = readRecord(valueInput, code);
  const expected = readRecord(expectedInput, code);
  assertKeys(value, Object.keys(expected), code);
  for (const key of Object.keys(expected)) {
    const left = value[key];
    const right = expected[key];
    if (
      left !== null &&
      typeof left === "object" &&
      right !== null &&
      typeof right === "object"
    ) {
      if (Array.isArray(right)) {
        const leftArray = readArray(left, code);
        const rightArray = readArray(right, code);
        if (leftArray.length !== rightArray.length) fail(code);
        for (let index = 0; index < rightArray.length; index += 1) {
          const leftItem = leftArray[index];
          const rightItem = rightArray[index];
          if (
            rightItem !== null &&
            typeof rightItem === "object" &&
            !Array.isArray(rightItem)
          ) {
            compareExactOwnData(leftItem, rightItem, code);
          } else if (leftItem !== rightItem) {
            fail(code);
          }
        }
      } else {
        compareExactOwnData(left, right, code);
      }
    } else if (left !== right) {
      fail(code);
    }
  }
  return deepFreeze(value);
}

function safeLogicalPath(value, code) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    Buffer.byteLength(value, "utf8") > 1_024
  ) {
    fail(code);
  }
  const components = value.split("/");
  if (
    components.length > 64 ||
    components.some((component) => !SAFE_COMPONENT.test(component))
  ) {
    fail(code);
  }
  return value;
}

export function createFixedNpmRequestPlan() {
  return NPM_REQUESTS;
}

export function validateFixedNpmRequestPlan(valueInput) {
  const value = readArray(valueInput, "M2A_INPUT_REQUEST_PLAN_INVALID");
  if (value.length !== NPM_REQUESTS.length) {
    fail("M2A_INPUT_REQUEST_PLAN_INVALID");
  }
  for (let index = 0; index < NPM_REQUESTS.length; index += 1) {
    compareExactOwnData(
      value[index],
      NPM_REQUESTS[index],
      "M2A_INPUT_REQUEST_PLAN_INVALID",
    );
  }
  return NPM_REQUESTS;
}

export function validateNpmMetadataBytes(value) {
  const bytes = asBytes(value, "M2A_INPUT_METADATA_INVALID");
  if (bytes.length === 0 || bytes.length > M2A_INPUTS.metadataMaximumBytes) {
    fail("M2A_INPUT_METADATA_INVALID");
  }
  let parsed;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("M2A_INPUT_METADATA_INVALID");
  }
  const metadata = readRecord(parsed, "M2A_INPUT_METADATA_INVALID");
  const dist = readRecord(metadata.dist, "M2A_INPUT_METADATA_INVALID");
  if (
    metadata.name !== "npm" ||
    metadata.version !== "12.0.1" ||
    dist.tarball !== NPM_REQUESTS[1].url
  ) {
    fail("M2A_INPUT_METADATA_INVALID");
  }
  assertSri(dist.integrity, "M2A_INPUT_METADATA_INVALID");
  return deepFreeze({ integrity: dist.integrity });
}

function normalizeContentType(value, plan, code) {
  if (typeof value !== "string") fail(code);
  const [mediaType, ...parameters] = value
    .split(";")
    .map((item) => item.trim().toLowerCase());
  if (!plan.contentTypes.includes(mediaType)) fail(code);
  if (
    parameters.length > 1 ||
    (parameters.length === 1 && parameters[0] !== "charset=utf-8")
  ) {
    fail(code);
  }
}

export function validateNpmResponseForTest(planId, responseInput) {
  const plan = NPM_REQUESTS.find((item) => item.id === planId);
  if (plan === undefined) fail("M2A_INPUT_RESPONSE_INVALID");
  const response = readRecord(responseInput, "M2A_INPUT_RESPONSE_INVALID");
  assertKeys(
    response,
    [
      "status",
      "contentType",
      "contentEncoding",
      "contentLength",
      "chunks",
      "eof",
      "deadlineExceeded",
      "requestSettled",
      "responseSettled",
    ],
    "M2A_INPUT_RESPONSE_INVALID",
  );
  const chunks = readArray(response.chunks, "M2A_INPUT_RESPONSE_INVALID").map(
    (chunk) => asBytes(chunk, "M2A_INPUT_RESPONSE_INVALID"),
  );
  const bytes = Buffer.concat(chunks);
  normalizeContentType(
    response.contentType,
    plan,
    "M2A_INPUT_RESPONSE_INVALID",
  );
  if (
    response.status !== 200 ||
    ![null, "identity"].includes(response.contentEncoding) ||
    (response.contentLength !== null &&
      (!Number.isSafeInteger(response.contentLength) ||
        response.contentLength !== bytes.length)) ||
    bytes.length > plan.maximumBytes ||
    response.eof !== true ||
    response.deadlineExceeded !== false ||
    response.requestSettled !== true ||
    response.responseSettled !== true
  ) {
    fail("M2A_INPUT_RESPONSE_INVALID");
  }
  return Buffer.from(bytes);
}

export function createAcquisitionReceiptBytes(observationInput) {
  const observation = readRecord(
    observationInput,
    "M2A_INPUT_ACQUISITION_INVALID",
  );
  assertKeys(
    observation,
    ["tarballSize", "tarballSha256", "integrity"],
    "M2A_INPUT_ACQUISITION_INVALID",
  );
  if (
    !Number.isSafeInteger(observation.tarballSize) ||
    observation.tarballSize <= 0 ||
    observation.tarballSize > M2A_INPUTS.fileMaximumBytes
  ) {
    fail("M2A_INPUT_ACQUISITION_INVALID");
  }
  assertSha256(observation.tarballSha256, "M2A_INPUT_ACQUISITION_INVALID");
  assertSri(observation.integrity, "M2A_INPUT_ACQUISITION_INVALID");
  return canonicalLine({
    schemaVersion: "m2a-transfer-acquisition/v1",
    generation: M2A_INPUTS.generation,
    packageName: "npm",
    version: M2A_INPUTS.npmVersion,
    tarballSize: observation.tarballSize,
    tarballSha256: observation.tarballSha256,
    integrity: observation.integrity,
    status: "complete",
    scriptsRun: false,
    credentialsUsed: false,
    externalNetworkPhase: "dependency-acquisition-only",
    evidenceReview: "not-performed",
  });
}

export function validateAcquisitionReceiptBytes(value) {
  const parsed = parseCanonicalLine(
    value,
    65_536,
    "M2A_INPUT_ACQUISITION_INVALID",
  );
  const receipt = parsed.record;
  assertKeys(
    receipt,
    [
      "schemaVersion",
      "generation",
      "packageName",
      "version",
      "tarballSize",
      "tarballSha256",
      "integrity",
      "status",
      "scriptsRun",
      "credentialsUsed",
      "externalNetworkPhase",
      "evidenceReview",
    ],
    "M2A_INPUT_ACQUISITION_INVALID",
  );
  if (
    receipt.schemaVersion !== "m2a-transfer-acquisition/v1" ||
    receipt.generation !== M2A_INPUTS.generation ||
    receipt.packageName !== "npm" ||
    receipt.version !== M2A_INPUTS.npmVersion ||
    !Number.isSafeInteger(receipt.tarballSize) ||
    receipt.tarballSize <= 0 ||
    receipt.tarballSize > M2A_INPUTS.fileMaximumBytes ||
    receipt.status !== "complete" ||
    receipt.scriptsRun !== false ||
    receipt.credentialsUsed !== false ||
    receipt.externalNetworkPhase !== "dependency-acquisition-only" ||
    receipt.evidenceReview !== "not-performed"
  ) {
    fail("M2A_INPUT_ACQUISITION_INVALID");
  }
  assertSha256(receipt.tarballSha256, "M2A_INPUT_ACQUISITION_INVALID");
  assertSri(receipt.integrity, "M2A_INPUT_ACQUISITION_INVALID");
  return deepFreeze({ bytes: parsed.bytes, receipt });
}

function defaultNpmStep(step) {
  if (step === "metadata-response") {
    return {
      status: 200,
      contentType: "application/vnd.npm.install-v1+json; charset=utf-8",
      contentEncoding: "identity",
      contentLength: null,
      chunks: [
        Buffer.from(
          JSON.stringify({
            name: "npm",
            version: "12.0.1",
            dist: {
              tarball: NPM_REQUESTS[1].url,
              integrity: sha512Sri(Buffer.from("test")),
            },
          }),
        ),
      ],
      eof: true,
      deadlineExceeded: false,
      requestSettled: true,
      responseSettled: true,
    };
  }
  if (step === "tarball-response") {
    return {
      status: 200,
      contentType: "application/octet-stream",
      contentEncoding: null,
      contentLength: 4,
      chunks: [Buffer.from("test")],
      eof: true,
      deadlineExceeded: false,
      requestSettled: true,
      responseSettled: true,
    };
  }
  if (step === "root-preflight") {
    return { acquisitionRoot: "absent", staging: "absent" };
  }
  if (step === "final-inventory") {
    return {
      children: ["acquisition.json", "npm-12.0.1.tgz"],
      modes: [0o444, 0o444],
      links: [1, 1],
      staging: false,
    };
  }
  return { ok: true, settlement: "known" };
}

export function createFakeM2aNpmInputBackend(overridesInput = {}) {
  const overrides = readRecord(
    overridesInput,
    "M2A_INPUT_FAKE_BACKEND_INVALID",
  );
  const backend = {
    async perform(step) {
      return Object.hasOwn(overrides, step)
        ? overrides[step]
        : defaultNpmStep(step);
    },
  };
  fakeNpmBackendBrand.add(backend);
  return backend;
}

function validateKnownStep(valueInput, code) {
  const value = readRecord(valueInput, code);
  if (value.ok !== true || value.settlement !== "known") fail(code);
}

function validateAttemptParentSync(valueInput) {
  const code = "M2A_TOOLCHAIN_ATTEMPT-PARENT-SYNC";
  const value = readRecord(valueInput, code);
  assertKeys(value, ["ok", "settlement", "parentSynced"], code);
  if (
    value.ok !== true ||
    value.settlement !== "known" ||
    value.parentSynced !== true
  ) {
    fail(code);
  }
  return deepFreeze({ parentSynced: value.parentSynced });
}

function failedProjection(issue, trace, requestCount, rootCreated) {
  return deepFreeze({
    performed: true,
    status: "failed",
    issue,
    requestCount,
    rootCreated,
    published: false,
    retained: true,
    retry: false,
    cleanup: false,
    evidenceReview: "not-performed",
    trace: [...trace],
  });
}

export async function runM2aNpmAcquisitionForTest(backend) {
  if (!fakeNpmBackendBrand.has(backend)) fail("M2A_INPUT_FAKE_REQUIRED");
  const trace = [];
  let requestCount = 0;
  let rootCreated = false;
  const perform = async (step) => {
    trace.push(step);
    return backend.perform(step);
  };
  try {
    const preflight = readRecord(
      await perform("root-preflight"),
      "M2A_INPUT_ROOT_PRESENT",
    );
    if (
      preflight.acquisitionRoot !== "absent" ||
      preflight.staging !== "absent"
    ) {
      fail("M2A_INPUT_ROOT_PRESENT");
    }
    validateKnownStep(await perform("create-root"), "M2A_INPUT_ROOT_CREATE");
    rootCreated = true;
    const metadataResponse = validateNpmResponseForTest(
      "metadata",
      await perform("metadata-response"),
    );
    requestCount += 1;
    const metadata = validateNpmMetadataBytes(metadataResponse);
    validateKnownStep(
      await perform("create-archive-next"),
      "M2A_INPUT_ARCHIVE_CREATE",
    );
    const tarball = validateNpmResponseForTest(
      "tarball",
      await perform("tarball-response"),
    );
    requestCount += 1;
    if (sha512Sri(tarball) !== metadata.integrity) {
      fail("M2A_INPUT_INTEGRITY_MISMATCH");
    }
    for (const step of [
      "archive-write",
      "archive-sync",
      "archive-reread",
      "archive-mode",
      "archive-identity",
      "archive-close",
      "archive-rename",
      "archive-root-sync",
    ]) {
      validateKnownStep(await perform(step), `M2A_INPUT_${step.toUpperCase()}`);
    }
    const receiptBytes = createAcquisitionReceiptBytes({
      tarballSize: tarball.length,
      tarballSha256: sha256(tarball),
      integrity: metadata.integrity,
    });
    for (const step of [
      "create-receipt-next",
      "receipt-write",
      "receipt-sync",
      "receipt-reread",
      "receipt-mode",
      "receipt-identity",
      "receipt-close",
      "receipt-rename",
      "receipt-root-sync",
    ]) {
      validateKnownStep(await perform(step), `M2A_INPUT_${step.toUpperCase()}`);
    }
    const inventory = readRecord(
      await perform("final-inventory"),
      "M2A_INPUT_FINAL_INVENTORY",
    );
    compareExactOwnData(
      inventory,
      defaultNpmStep("final-inventory"),
      "M2A_INPUT_FINAL_INVENTORY",
    );
    return deepFreeze({
      performed: true,
      status: "complete",
      issue: null,
      requestCount,
      rootCreated,
      published: true,
      retained: true,
      retry: false,
      cleanup: false,
      receiptSha256: sha256(receiptBytes),
      evidenceReview: "not-performed",
      trace,
    });
  } catch (error) {
    const issue =
      error instanceof Error && error.message.startsWith("M2A_INPUT_")
        ? error.message
        : "M2A_INPUT_FAILED";
    return failedProjection(issue, trace, requestCount, rootCreated);
  }
}

function readIdentity(valueInput, code) {
  const value = readRecord(valueInput, code);
  assertKeys(
    value,
    [
      "path",
      "parent",
      "name",
      "type",
      "mode",
      "uid",
      "gid",
      "links",
      "device",
      "inode",
      "size",
      "mtimeNs",
      "sparse",
      "sha256",
    ],
    code,
  );
  safeLogicalPath(value.path, code);
  if (
    typeof value.parent !== "string" ||
    typeof value.name !== "string" ||
    !["directory", "file", "virtual"].includes(value.type) ||
    !Number.isSafeInteger(value.mode) ||
    !Number.isSafeInteger(value.uid) ||
    !Number.isSafeInteger(value.gid) ||
    !Number.isSafeInteger(value.links) ||
    value.links <= 0 ||
    !isCanonicalNonnegativeDecimal(value.device) ||
    !isCanonicalNonnegativeDecimal(value.inode) ||
    !isCanonicalNonnegativeDecimal(value.size) ||
    !isCanonicalNonnegativeDecimal(value.mtimeNs) ||
    typeof value.sparse !== "boolean"
  ) {
    fail(code);
  }
  if (value.type === "file") assertSha256(value.sha256, code);
  else if (value.sha256 !== null) fail(code);
  return value;
}

export function validateHeldGraphPair(firstInput, secondInput) {
  const first = readArray(firstInput, "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID").map(
    (row) => readIdentity(row, "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID"),
  );
  const second = readArray(
    secondInput,
    "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID",
  ).map((row) => readIdentity(row, "M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID"));
  if (
    first.length === 0 ||
    first.length > M2A_INPUTS.inventoryMaximumRows ||
    JSON.stringify(first) !== JSON.stringify(second)
  ) {
    fail("M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID");
  }
  const paths = first.map((row) => row.path);
  const folded = paths.map((item) => item.toLowerCase());
  const identities = first.map((row) => `${row.device}:${row.inode}`);
  const roots = [
    "packages/@types/node",
    "packages/typescript",
    "packages/undici-types",
  ];
  const firstOwner = first[0];
  if (
    JSON.stringify(paths) !==
      JSON.stringify(
        [...paths].sort((left, right) =>
          Buffer.from(left).compare(Buffer.from(right)),
        ),
      ) ||
    new Set(paths).size !== paths.length ||
    new Set(folded).size !== folded.length ||
    new Set(identities).size !== identities.length ||
    roots.some(
      (root) =>
        first.filter((row) => row.path === root && row.type === "directory")
          .length !== 1 ||
        !first.some(
          (row) => row.type === "file" && row.path.startsWith(`${root}/`),
        ),
    ) ||
    first.some(
      (row) =>
        !roots.some(
          (root) => row.path === root || row.path.startsWith(`${root}/`),
        ) ||
        row.name !== path.posix.basename(row.path) ||
        row.parent !==
          (row.path.includes("/") ? path.posix.dirname(row.path) : "") ||
        !["directory", "file"].includes(row.type) ||
        row.uid !== firstOwner.uid ||
        row.gid !== firstOwner.gid ||
        (row.type === "directory"
          ? row.mode !== 0o700 ||
            row.links < 1 ||
            row.sparse !== false ||
            row.sha256 !== null ||
            (!roots.includes(row.path) &&
              !first.some(
                (candidate) =>
                  candidate.path === row.parent &&
                  candidate.type === "directory",
              ))
          : BigInt(row.size) <= 0n ||
            row.links !== 1 ||
            row.mode !== 0o444 ||
            row.sparse !== false ||
            !first.some(
              (candidate) =>
                candidate.path === row.parent && candidate.type === "directory",
            )),
    )
  ) {
    fail("M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID");
  }
  return deepFreeze(first);
}

function validateInventoryRows(valueInput, code) {
  const rows = readArray(valueInput, code).map((item) => {
    const row = readRecord(item, code);
    assertKeys(row, ["logicalPath", "mode", "size", "sha256"], code);
    safeLogicalPath(row.logicalPath, code);
    const isNode = row.logicalPath === "runtime/constructor-node";
    const isRuntime = row.logicalPath.startsWith("runtime/");
    const isPackage = row.logicalPath.startsWith("packages/");
    if (
      (!isRuntime && !isPackage) ||
      (isNode ? row.mode !== 0o555 : row.mode !== 0o444) ||
      !Number.isSafeInteger(row.size) ||
      row.size <= 0
    ) {
      fail(code);
    }
    assertSha256(row.sha256, code);
    return row;
  });
  const paths = rows.map((row) => row.logicalPath);
  if (
    rows.length === 0 ||
    rows.length > M2A_INPUTS.inventoryMaximumRows ||
    JSON.stringify(paths) !== JSON.stringify([...paths].sort()) ||
    new Set(paths).size !== paths.length ||
    new Set(paths.map((item) => item.toLowerCase())).size !== paths.length ||
    rows.filter((row) => row.logicalPath === "runtime/constructor-node")
      .length !== 1
  ) {
    fail(code);
  }
  return rows;
}

export function validateDestinationGraph(graphInput, inventoryInput) {
  const graph = readArray(
    graphInput,
    "M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID",
  ).map((row) => readIdentity(row, "M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID"));
  const inventory = validateInventoryRows(
    inventoryInput,
    "M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID",
  );
  const expectedDirectories = [
    "packages",
    "packages/@types",
    "packages/@types/node",
    "packages/typescript",
    "packages/undici-types",
    "runtime",
    "runtime/shared",
  ];
  const expectedFiles = inventory
    .filter((row) => row.logicalPath !== "runtime/constructor-node")
    .map((row) => row.logicalPath);
  const directoryRows = graph.filter((row) => row.type === "directory");
  const fileRows = graph.filter((row) => row.type === "file");
  const expectedPaths = [...expectedDirectories, ...expectedFiles].sort(
    (left, right) => Buffer.from(left).compare(Buffer.from(right)),
  );
  const paths = graph.map((row) => row.path);
  const physicalIdentities = graph.map((row) => `${row.device}:${row.inode}`);
  const firstOwner = graph[0];
  if (
    firstOwner === undefined ||
    JSON.stringify(paths) !== JSON.stringify(expectedPaths) ||
    new Set(paths.map((item) => item.toLowerCase())).size !== paths.length ||
    new Set(physicalIdentities).size !== physicalIdentities.length ||
    JSON.stringify(directoryRows.map((row) => row.path)) !==
      JSON.stringify(expectedDirectories) ||
    JSON.stringify(fileRows.map((row) => row.path)) !==
      JSON.stringify(expectedFiles) ||
    graph.some(
      (row) =>
        row.name !== path.posix.basename(row.path) ||
        row.parent !==
          (row.path.includes("/") ? path.posix.dirname(row.path) : "") ||
        row.uid !== firstOwner.uid ||
        row.gid !== firstOwner.gid ||
        !["directory", "file"].includes(row.type) ||
        (row.type === "directory" &&
          (row.mode !== 0o700 ||
            row.links < 1 ||
            row.sparse !== false ||
            row.sha256 !== null)) ||
        (row.type === "file" && row.sparse !== false),
    ) ||
    graph.some((row) => row.path.endsWith(".next")) ||
    fileRows.some((row, index) => {
      const expected = inventory.find(
        (item) => item.logicalPath === expectedFiles[index],
      );
      return (
        expected === undefined ||
        row.mode !== 0o444 ||
        row.links !== 1 ||
        row.size !== String(expected.size) ||
        row.sha256 !== expected.sha256
      );
    })
  ) {
    fail("M2A_TOOLCHAIN_DESTINATION_GRAPH_INVALID");
  }
  return deepFreeze(graph);
}

export function createToolchainAttemptBytes(stateInput) {
  const state = readRecord(stateInput, "M2A_TOOLCHAIN_ATTEMPT_INVALID");
  assertKeys(
    state,
    ["state", "issue", "toolchainReceiptSha256", "inventoryAggregate"],
    "M2A_TOOLCHAIN_ATTEMPT_INVALID",
  );
  if (!["in-progress", "failed", "complete"].includes(state.state)) {
    fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
  }
  if (
    state.state === "in-progress" &&
    (state.issue !== "M2A_TOOLCHAIN_IN_PROGRESS" ||
      state.toolchainReceiptSha256 !== null ||
      state.inventoryAggregate !== null)
  ) {
    fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
  }
  if (
    state.state === "failed" &&
    (!["M2A_TOOLCHAIN_FAILED", "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN"].includes(
      state.issue,
    ) ||
      state.toolchainReceiptSha256 !== null ||
      state.inventoryAggregate !== null)
  ) {
    fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
  }
  if (state.state === "complete") {
    if (state.issue !== null) fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
    assertSha256(state.toolchainReceiptSha256, "M2A_TOOLCHAIN_ATTEMPT_INVALID");
    assertSha256(state.inventoryAggregate, "M2A_TOOLCHAIN_ATTEMPT_INVALID");
  }
  return canonicalLine({
    schemaVersion: "m2a-transfer-toolchain-attempt/v1",
    generation: M2A_INPUTS.generation,
    state: state.state,
    issue: state.issue,
    toolchainReceiptSha256: state.toolchainReceiptSha256,
    inventoryAggregate: state.inventoryAggregate,
    evidenceReview: "not-performed",
  });
}

export function validateToolchainAttemptBytes(value) {
  const parsed = parseCanonicalLine(
    value,
    65_536,
    "M2A_TOOLCHAIN_ATTEMPT_INVALID",
  );
  const attempt = parsed.record;
  assertKeys(
    attempt,
    [
      "schemaVersion",
      "generation",
      "state",
      "issue",
      "toolchainReceiptSha256",
      "inventoryAggregate",
      "evidenceReview",
    ],
    "M2A_TOOLCHAIN_ATTEMPT_INVALID",
  );
  if (
    attempt.schemaVersion !== "m2a-transfer-toolchain-attempt/v1" ||
    attempt.generation !== M2A_INPUTS.generation ||
    attempt.evidenceReview !== "not-performed"
  ) {
    fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
  }
  const rebuilt = createToolchainAttemptBytes({
    state: attempt.state,
    issue: attempt.issue,
    toolchainReceiptSha256: attempt.toolchainReceiptSha256,
    inventoryAggregate: attempt.inventoryAggregate,
  });
  if (!rebuilt.equals(parsed.bytes)) fail("M2A_TOOLCHAIN_ATTEMPT_INVALID");
  return deepFreeze({ bytes: parsed.bytes, attempt });
}

export function createToolchainReceiptBytes(receiptInput) {
  const receipt = readRecord(receiptInput, "M2A_TOOLCHAIN_RECEIPT_INVALID");
  assertKeys(
    receipt,
    ["runtime", "packages", "inventory"],
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  const runtime = readRecord(receipt.runtime, "M2A_TOOLCHAIN_RECEIPT_INVALID");
  assertKeys(
    runtime,
    [
      "logicalId",
      "version",
      "platform",
      "architecture",
      "executableSize",
      "executableSha256",
    ],
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  if (
    runtime.logicalId !== "constructor-node" ||
    runtime.version !== "v20.18.2" ||
    runtime.platform !== "linux" ||
    runtime.architecture !== "x64" ||
    !Number.isSafeInteger(runtime.executableSize) ||
    runtime.executableSize <= 0
  ) {
    fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
  }
  assertSha256(runtime.executableSha256, "M2A_TOOLCHAIN_RECEIPT_INVALID");
  const inventory = validateInventoryRows(
    receipt.inventory,
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  const runtimeRows = inventory.filter((row) =>
    row.logicalPath.startsWith("runtime/"),
  );
  const nodeRow = runtimeRows.find(
    (row) => row.logicalPath === "runtime/constructor-node",
  );
  if (
    nodeRow === undefined ||
    nodeRow.size !== runtime.executableSize ||
    nodeRow.sha256 !== runtime.executableSha256
  ) {
    fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
  }
  const packages = readArray(receipt.packages, "M2A_TOOLCHAIN_RECEIPT_INVALID");
  if (packages.length !== PACKAGE_SPECS.length) {
    fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
  }
  const normalizedPackages = packages.map((item, index) => {
    const row = readRecord(item, "M2A_TOOLCHAIN_RECEIPT_INVALID");
    assertKeys(
      row,
      ["name", "version", "integrity"],
      "M2A_TOOLCHAIN_RECEIPT_INVALID",
    );
    const expected = PACKAGE_SPECS[index];
    if (
      row.name !== expected.name ||
      row.version !== expected.version ||
      row.integrity !== expected.integrity
    ) {
      fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
    }
    const packageRows = inventory.filter((inventoryRow) =>
      inventoryRow.logicalPath.startsWith(`${expected.logicalPrefix}/`),
    );
    if (packageRows.length === 0) fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
    return {
      name: row.name,
      version: row.version,
      integrity: row.integrity,
      inventoryAggregate: sha256(JSON.stringify(packageRows)),
    };
  });
  const output = {
    schemaVersion: "m2a-transfer-toolchain/v1",
    generation: M2A_INPUTS.generation,
    runtime: {
      logicalId: "constructor-node",
      version: "v20.18.2",
      platform: "linux",
      architecture: "x64",
      executableSize: runtime.executableSize,
      executableSha256: runtime.executableSha256,
      loadedRuntimeInventoryAggregate: sha256(JSON.stringify(runtimeRows)),
    },
    packages: normalizedPackages,
    inventory,
    inventoryAggregate: sha256(JSON.stringify(inventory)),
    status: "complete",
    evidenceReview: "not-performed",
  };
  const bytes = canonicalLine(output);
  if (bytes.length > M2A_INPUTS.receiptMaximumBytes) {
    fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
  }
  return bytes;
}

export function validateToolchainReceiptBytes(value) {
  const parsed = parseCanonicalLine(
    value,
    M2A_INPUTS.receiptMaximumBytes,
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  const receipt = parsed.record;
  assertKeys(
    receipt,
    [
      "schemaVersion",
      "generation",
      "runtime",
      "packages",
      "inventory",
      "inventoryAggregate",
      "status",
      "evidenceReview",
    ],
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  const canonicalRuntime = readRecord(
    receipt.runtime,
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  assertKeys(
    canonicalRuntime,
    [
      "logicalId",
      "version",
      "platform",
      "architecture",
      "executableSize",
      "executableSha256",
      "loadedRuntimeInventoryAggregate",
    ],
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  );
  const canonicalPackages = readArray(
    receipt.packages,
    "M2A_TOOLCHAIN_RECEIPT_INVALID",
  ).map((rowInput) => {
    const row = readRecord(rowInput, "M2A_TOOLCHAIN_RECEIPT_INVALID");
    assertKeys(
      row,
      ["name", "version", "integrity", "inventoryAggregate"],
      "M2A_TOOLCHAIN_RECEIPT_INVALID",
    );
    return row;
  });
  const rebuilt = createToolchainReceiptBytes({
    runtime: {
      logicalId: canonicalRuntime.logicalId,
      version: canonicalRuntime.version,
      platform: canonicalRuntime.platform,
      architecture: canonicalRuntime.architecture,
      executableSize: canonicalRuntime.executableSize,
      executableSha256: canonicalRuntime.executableSha256,
    },
    packages: canonicalPackages.map((row) => ({
      name: row.name,
      version: row.version,
      integrity: row.integrity,
    })),
    inventory: receipt.inventory,
  });
  if (
    receipt.schemaVersion !== "m2a-transfer-toolchain/v1" ||
    receipt.generation !== M2A_INPUTS.generation ||
    receipt.status !== "complete" ||
    receipt.evidenceReview !== "not-performed" ||
    !rebuilt.equals(parsed.bytes)
  ) {
    fail("M2A_TOOLCHAIN_RECEIPT_INVALID");
  }
  return deepFreeze({ bytes: parsed.bytes, receipt });
}

function fakeIdentity(
  logicalPath,
  type,
  index,
  mode = type === "directory" ? 0o700 : 0o444,
) {
  const parent = logicalPath.includes("/")
    ? logicalPath.slice(0, logicalPath.lastIndexOf("/"))
    : "";
  const name = logicalPath.slice(logicalPath.lastIndexOf("/") + 1);
  return {
    path: logicalPath,
    parent,
    name,
    type,
    mode,
    uid: 1000,
    gid: 1000,
    links: 1,
    device: "1",
    inode: String(index + 1),
    size: String(type === "file" ? index + 1 : 0),
    mtimeNs: String(1_000 + index),
    sparse: false,
    sha256: type === "file" ? `sha256:${String(index % 10).repeat(64)}` : null,
  };
}

function defaultSourceGraph() {
  return [
    fakeIdentity("packages/@types/node", "directory", 1),
    fakeIdentity("packages/@types/node/index.d.ts", "file", 2),
    fakeIdentity("packages/typescript", "directory", 3),
    fakeIdentity("packages/typescript/bin", "directory", 4),
    fakeIdentity("packages/typescript/bin/tsc", "file", 5),
    fakeIdentity("packages/undici-types", "directory", 6),
    fakeIdentity("packages/undici-types/index.d.ts", "file", 7),
  ];
}

function defaultToolchainInventory() {
  return [
    {
      logicalPath: "packages/@types/node/index.d.ts",
      mode: 0o444,
      size: 3,
      sha256: `sha256:${"2".repeat(64)}`,
    },
    {
      logicalPath: "packages/typescript/bin/tsc",
      mode: 0o444,
      size: 6,
      sha256: `sha256:${"5".repeat(64)}`,
    },
    {
      logicalPath: "packages/undici-types/index.d.ts",
      mode: 0o444,
      size: 8,
      sha256: `sha256:${"7".repeat(64)}`,
    },
    {
      logicalPath: "runtime/constructor-node",
      mode: 0o555,
      size: 9,
      sha256: `sha256:${"9".repeat(64)}`,
    },
    {
      logicalPath: "runtime/shared/000-libc.so",
      mode: 0o444,
      size: 10,
      sha256: `sha256:${"8".repeat(64)}`,
    },
  ];
}

function defaultDestinationGraph() {
  const inventory = defaultToolchainInventory();
  const directories = [
    "packages",
    "packages/@types",
    "packages/@types/node",
    "packages/typescript",
    "packages/undici-types",
    "runtime",
    "runtime/shared",
  ].map((item, index) => fakeIdentity(item, "directory", index + 20));
  const files = inventory
    .filter((row) => row.logicalPath !== "runtime/constructor-node")
    .map((row, index) => {
      const identity = fakeIdentity(row.logicalPath, "file", index + 40);
      return {
        ...identity,
        size: String(row.size),
        sha256: row.sha256,
      };
    });
  return [...directories, ...files].sort((left, right) =>
    Buffer.from(left.path).compare(Buffer.from(right.path)),
  );
}

function defaultAttemptTransition() {
  const parentBefore = {
    type: "directory",
    mode: 0o700,
    uid: 1000,
    gid: 1000,
    links: 2,
    device: "1",
    inode: "100",
    size: "1",
    mtimeNs: "1000",
  };
  const parentAfter = {
    ...parentBefore,
    links: 3,
    size: "2",
    mtimeNs: "1001",
  };
  const retained = {
    name: "retained",
    identity: {
      type: "file",
      mode: 0o444,
      uid: 1000,
      gid: 1000,
      links: 1,
      device: "1",
      inode: "101",
      size: "1",
      mtimeNs: "900",
    },
  };
  const child = {
    type: "directory",
    mode: 0o700,
    uid: 1000,
    gid: 1000,
    links: 2,
    device: "1",
    inode: "102",
    size: "9007199254740993",
    mtimeNs: "1001",
  };
  const committed = {
    name: path.basename(TOOLCHAIN_ATTEMPT_ROOT),
    identity: child,
  };
  return {
    parentBefore,
    parentAfter,
    pathParentBefore: parentBefore,
    pathParentAfter: parentAfter,
    childrenBefore: [retained],
    childrenAfter: [committed, retained].sort((left, right) =>
      Buffer.from(left.name).compare(Buffer.from(right.name)),
    ),
    pathChild: child,
    heldChild: child,
    effectiveUid: 1000,
    effectiveGid: 1000,
  };
}

function defaultToolchainStep(step) {
  if (step === "root-preflight") {
    return { attemptRoot: "absent", toolchainRoot: "absent" };
  }
  if (step === "create-attempt-root") return { outcome: "created" };
  if (step === "open-attempt-root") {
    const transition = defaultAttemptTransition();
    return {
      ok: true,
      settlement: "known",
      pathParentBefore: transition.pathParentBefore,
      pathParentAfter: transition.pathParentAfter,
      pathChild: transition.pathChild,
      heldChild: transition.heldChild,
      effectiveUid: transition.effectiveUid,
      effectiveGid: transition.effectiveGid,
    };
  }
  if (step === "correlate-attempt-root") {
    const transition = defaultAttemptTransition();
    return {
      ok: true,
      settlement: "known",
      parentBefore: transition.parentBefore,
      parentAfter: transition.parentAfter,
      childrenBefore: transition.childrenBefore,
      childrenAfter: transition.childrenAfter,
    };
  }
  if (step === "attempt-parent-sync") {
    return { ok: true, settlement: "known", parentSynced: true };
  }
  if (step === "runtime") {
    return {
      version: "v20.18.2",
      platform: "linux",
      architecture: "x64",
      executableType: "file",
      executableSize: 9,
      executableSha256: `sha256:${"9".repeat(64)}`,
      mode: 0o555,
      links: 1,
      sparse: false,
      reportDense: true,
      sharedObjects: ["/synthetic/libc.so"],
      sharedObjectRows: [
        {
          sourcePath: "/synthetic/libc.so",
          logicalPath: "runtime/shared/000-libc.so",
          type: "file",
          mode: 0o555,
          links: 1,
          size: 10,
          sha256: `sha256:${"8".repeat(64)}`,
          device: "1",
          inode: "200",
          sparse: false,
          sourceConnected: true,
        },
      ],
    };
  }
  if (step === "source-first" || step === "source-second") {
    return defaultSourceGraph();
  }
  if (step === "inventory") return defaultToolchainInventory();
  if (step === "destination-final") return defaultDestinationGraph();
  return { ok: true, settlement: "known" };
}

export function createFakeM2aToolchainInputBackend(overridesInput = {}) {
  const overrides = readRecord(
    overridesInput,
    "M2A_TOOLCHAIN_FAKE_BACKEND_INVALID",
  );
  const backend = {
    createAttemptRoot() {
      return Object.hasOwn(overrides, "create-attempt-root")
        ? overrides["create-attempt-root"]
        : defaultToolchainStep("create-attempt-root");
    },
    async perform(step) {
      return Object.hasOwn(overrides, step)
        ? overrides[step]
        : defaultToolchainStep(step);
    },
  };
  fakeToolchainBackendBrand.add(backend);
  return backend;
}

export function classifyToolchainAttemptCommitForTest(event) {
  switch (event) {
    case "known-no-create":
    case "process-loss-before-commit":
      return deepFreeze({
        root: "absent",
        occurrence: "not-started",
        freshInvocationMayCommit: true,
      });
    case "existing-root":
      return deepFreeze({
        root: "present",
        occurrence: "existing-wins",
        freshInvocationMayCommit: false,
      });
    case "commit-returned":
    case "process-loss-after-commit":
    case "process-loss-before-checkpoint":
      return deepFreeze({
        root: "present",
        occurrence: "started-non-evidence",
        freshInvocationMayCommit: false,
      });
    default:
      fail("M2A_TOOLCHAIN_INITIAL_CREATE_INVALID");
  }
}

function validateRuntimeProjection(valueInput) {
  const value = readRecord(valueInput, "M2A_TOOLCHAIN_RUNTIME_INVALID");
  assertKeys(
    value,
    [
      "version",
      "platform",
      "architecture",
      "executableType",
      "executableSize",
      "executableSha256",
      "mode",
      "links",
      "sparse",
      "reportDense",
      "sharedObjects",
      "sharedObjectRows",
    ],
    "M2A_TOOLCHAIN_RUNTIME_INVALID",
  );
  const sharedObjects = readArray(
    value.sharedObjects,
    "M2A_TOOLCHAIN_RUNTIME_INVALID",
  );
  const sharedObjectRows = readArray(
    value.sharedObjectRows,
    "M2A_TOOLCHAIN_RUNTIME_INVALID",
  ).map((rowInput) => {
    const row = readRecord(rowInput, "M2A_TOOLCHAIN_RUNTIME_INVALID");
    assertKeys(
      row,
      [
        "sourcePath",
        "logicalPath",
        "type",
        "mode",
        "links",
        "size",
        "sha256",
        "device",
        "inode",
        "sparse",
        "sourceConnected",
      ],
      "M2A_TOOLCHAIN_RUNTIME_INVALID",
    );
    if (
      typeof row.sourcePath !== "string" ||
      !path.posix.isAbsolute(row.sourcePath) ||
      typeof row.logicalPath !== "string" ||
      row.type !== "file" ||
      !Number.isSafeInteger(row.mode) ||
      row.mode <= 0 ||
      (row.mode & 0o7000) !== 0 ||
      row.links !== 1 ||
      !Number.isSafeInteger(row.size) ||
      row.size <= 0 ||
      typeof row.device !== "string" ||
      !/^[0-9]+$/u.test(row.device) ||
      typeof row.inode !== "string" ||
      !/^[0-9]+$/u.test(row.inode) ||
      row.sparse !== false ||
      row.sourceConnected !== true
    ) {
      fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
    }
    assertSha256(row.sha256, "M2A_TOOLCHAIN_RUNTIME_INVALID");
    return row;
  });
  if (
    value.version !== "v20.18.2" ||
    value.platform !== "linux" ||
    value.architecture !== "x64" ||
    value.executableType !== "file" ||
    !Number.isSafeInteger(value.executableSize) ||
    value.executableSize <= 0 ||
    value.mode !== 0o555 ||
    value.links !== 1 ||
    value.sparse !== false ||
    value.reportDense !== true ||
    sharedObjects.length > M2A_INPUTS.runtimeMaximumRows ||
    sharedObjects.some(
      (item) => typeof item !== "string" || !path.posix.isAbsolute(item),
    ) ||
    new Set(sharedObjects).size !== sharedObjects.length ||
    sharedObjectRows.length !== sharedObjects.length
  ) {
    fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
  }
  const sortedSharedObjects = [...sharedObjects].sort((left, right) =>
    Buffer.from(left).compare(Buffer.from(right)),
  );
  const physicalIdentities = sharedObjectRows.map(
    (row) => `${row.device}:${row.inode}`,
  );
  for (let index = 0; index < sortedSharedObjects.length; index += 1) {
    const sourcePath = sortedSharedObjects[index];
    const row = sharedObjectRows[index];
    const basename = path.posix.basename(sourcePath);
    if (
      !SAFE_COMPONENT.test(basename) ||
      row.sourcePath !== sourcePath ||
      row.logicalPath !==
        `runtime/shared/${String(index).padStart(3, "0")}-${basename}`
    ) {
      fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
    }
  }
  if (
    new Set(physicalIdentities).size !== physicalIdentities.length ||
    new Set(sharedObjectRows.map((row) => row.logicalPath)).size !==
      sharedObjectRows.length
  ) {
    fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
  }
  assertSha256(value.executableSha256, "M2A_TOOLCHAIN_RUNTIME_INVALID");
  return deepFreeze(value);
}

function validateRuntimeInventoryProjection(runtime, inventory) {
  const runtimeRows = inventory.filter((row) =>
    row.logicalPath.startsWith("runtime/"),
  );
  const expected = [
    {
      logicalPath: "runtime/constructor-node",
      mode: 0o555,
      size: runtime.executableSize,
      sha256: runtime.executableSha256,
    },
    ...runtime.sharedObjectRows.map((row) => ({
      logicalPath: row.logicalPath,
      mode: 0o444,
      size: row.size,
      sha256: row.sha256,
    })),
  ].sort((left, right) =>
    Buffer.from(left.logicalPath).compare(Buffer.from(right.logicalPath)),
  );
  if (JSON.stringify(runtimeRows) !== JSON.stringify(expected)) {
    fail("M2A_TOOLCHAIN_RUNTIME_INVENTORY_INVALID");
  }
}

function failedToolchainProjection(
  issue,
  trace,
  committed,
  freshInvocationAllowed = false,
) {
  return deepFreeze({
    performed: committed,
    status: committed ? "failed" : "not-started",
    issue,
    attemptRootCommitted: committed,
    checkpoint: committed ? "retained" : "absent",
    toolchainPublished: false,
    retry: freshInvocationAllowed,
    cleanup: false,
    evidenceReview: "not-performed",
    trace: [...trace],
  });
}

export async function runM2aToolchainCaptureForTest(backend) {
  if (!fakeToolchainBackendBrand.has(backend)) {
    fail("M2A_TOOLCHAIN_FAKE_REQUIRED");
  }
  const trace = [];
  let committed = false;
  let freshInvocationAllowed = false;
  const perform = async (step) => {
    trace.push(step);
    return backend.perform(step);
  };
  try {
    const preflight = readRecord(
      await perform("root-preflight"),
      "M2A_TOOLCHAIN_ROOT_PRESENT",
    );
    if (
      preflight.attemptRoot !== "absent" ||
      preflight.toolchainRoot !== "absent"
    ) {
      fail("M2A_TOOLCHAIN_ROOT_PRESENT");
    }
    trace.push("create-attempt-root");
    const create = readRecord(
      backend.createAttemptRoot(),
      "M2A_TOOLCHAIN_INITIAL_CREATE_INVALID",
    );
    assertKeys(create, ["outcome"], "M2A_TOOLCHAIN_INITIAL_CREATE_INVALID");
    if (create.outcome === "exists") fail("M2A_TOOLCHAIN_ROOT_PRESENT");
    if (create.outcome === "error") {
      freshInvocationAllowed = true;
      fail("M2A_TOOLCHAIN_ROOT_CREATE_FAILED");
    }
    if (create.outcome !== "created") {
      fail("M2A_TOOLCHAIN_INITIAL_CREATE_INVALID");
    }
    committed = true;
    const opened = readRecord(
      await perform("open-attempt-root"),
      "M2A_TOOLCHAIN_OPEN-ATTEMPT-ROOT",
    );
    validateKnownStep(opened, "M2A_TOOLCHAIN_OPEN-ATTEMPT-ROOT");
    const correlated = readRecord(
      await perform("correlate-attempt-root"),
      "M2A_TOOLCHAIN_CORRELATE-ATTEMPT-ROOT",
    );
    validateKnownStep(correlated, "M2A_TOOLCHAIN_CORRELATE-ATTEMPT-ROOT");
    const parentSync = validateAttemptParentSync(
      await perform("attempt-parent-sync"),
    );
    validateAttemptRootCommitTransition({
      parentBefore: correlated.parentBefore,
      parentAfter: correlated.parentAfter,
      pathParentBefore: opened.pathParentBefore,
      pathParentAfter: opened.pathParentAfter,
      childrenBefore: correlated.childrenBefore,
      childrenAfter: correlated.childrenAfter,
      pathChild: opened.pathChild,
      heldChild: opened.heldChild,
      effectiveUid: opened.effectiveUid,
      effectiveGid: opened.effectiveGid,
      parentSynced: parentSync.parentSynced,
    });
    for (const step of [
      "attempt-in-progress-write",
      "attempt-in-progress-sync",
      "attempt-in-progress-reread",
      "attempt-in-progress-mode",
      "attempt-in-progress-close",
      "attempt-in-progress-rename",
      "attempt-root-sync",
      "attempt-child-close",
      "attempt-parent-close",
    ]) {
      validateKnownStep(
        await perform(step),
        `M2A_TOOLCHAIN_${step.toUpperCase()}`,
      );
    }
    validateToolchainAttemptBytes(
      createToolchainAttemptBytes({
        state: "in-progress",
        issue: "M2A_TOOLCHAIN_IN_PROGRESS",
        toolchainReceiptSha256: null,
        inventoryAggregate: null,
      }),
    );
    validateKnownStep(
      await perform("tracked-closure"),
      "M2A_TOOLCHAIN_TRACKED_CLOSURE",
    );
    const runtime = validateRuntimeProjection(await perform("runtime"));
    const firstGraph = await perform("source-first");
    const secondGraph = await perform("source-second");
    validateHeldGraphPair(firstGraph, secondGraph);
    validateKnownStep(
      await perform("source-directories-close"),
      "M2A_TOOLCHAIN_SOURCE_DIRECTORIES_CLOSE",
    );
    for (const step of [
      "create-toolchain-root",
      "create-seven-directories",
      "copy-source-files",
      "copy-source-close",
    ]) {
      validateKnownStep(
        await perform(step),
        `M2A_TOOLCHAIN_${step.toUpperCase()}`,
      );
    }
    const inventory = validateInventoryRows(
      await perform("inventory"),
      "M2A_TOOLCHAIN_INVENTORY_INVALID",
    );
    validateRuntimeInventoryProjection(runtime, inventory);
    validateDestinationGraph(await perform("destination-final"), inventory);
    const receiptBytes = createToolchainReceiptBytes({
      runtime: {
        logicalId: "constructor-node",
        version: runtime.version,
        platform: runtime.platform,
        architecture: runtime.architecture,
        executableSize: runtime.executableSize,
        executableSha256: runtime.executableSha256,
      },
      packages: PACKAGE_SPECS.map(({ name, version, integrity }) => ({
        name,
        version,
        integrity,
      })),
      inventory,
    });
    for (const step of [
      "receipt-write",
      "receipt-sync",
      "receipt-reread",
      "receipt-mode",
      "receipt-close",
      "receipt-rename",
      "toolchain-root-sync",
      "complete-checkpoint-write",
      "complete-checkpoint-sync",
      "complete-checkpoint-reread",
      "complete-checkpoint-mode",
      "complete-checkpoint-close",
      "complete-checkpoint-rename",
      "complete-checkpoint-root-sync",
    ]) {
      validateKnownStep(
        await perform(step),
        `M2A_TOOLCHAIN_${step.toUpperCase()}`,
      );
    }
    const inventoryAggregate = sha256(JSON.stringify(inventory));
    validateToolchainAttemptBytes(
      createToolchainAttemptBytes({
        state: "complete",
        issue: null,
        toolchainReceiptSha256: sha256(receiptBytes),
        inventoryAggregate,
      }),
    );
    return deepFreeze({
      performed: true,
      status: "complete",
      issue: null,
      attemptRootCommitted: true,
      checkpoint: "complete",
      toolchainPublished: true,
      receiptSha256: sha256(receiptBytes),
      inventoryAggregate,
      retry: false,
      cleanup: false,
      evidenceReview: "not-performed",
      trace,
    });
  } catch (error) {
    const issue =
      error instanceof Error && error.message.startsWith("M2A_TOOLCHAIN_")
        ? error.message
        : "M2A_TOOLCHAIN_FAILED";
    if (committed) {
      try {
        validateKnownStep(
          await perform("failed-checkpoint"),
          "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN",
        );
      } catch {
        return failedToolchainProjection(
          "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN",
          trace,
          true,
          false,
        );
      }
    }
    return failedToolchainProjection(
      issue,
      trace,
      committed,
      freshInvocationAllowed,
    );
  }
}

function statIdentity(stat) {
  return {
    type: stat.isDirectory()
      ? "directory"
      : stat.isFile()
        ? "file"
        : "unsupported",
    mode: Number(stat.mode & 0o7777n),
    uid: Number(stat.uid),
    gid: Number(stat.gid),
    links: Number(stat.nlink),
    device: stat.dev.toString(),
    inode: stat.ino.toString(),
    size: stat.size.toString(),
    mtimeNs: stat.mtimeNs.toString(),
  };
}

function sameIdentity(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isCanonicalNonnegativeDecimal(value) {
  return (
    typeof value === "string" &&
    /^(?:0|[1-9][0-9]*)$/u.test(value) &&
    BigInt(value).toString() === value
  );
}

function readAttemptIdentity(valueInput) {
  const code = "M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID";
  const value = readRecord(valueInput, code);
  assertKeys(
    value,
    [
      "type",
      "mode",
      "uid",
      "gid",
      "links",
      "device",
      "inode",
      "size",
      "mtimeNs",
    ],
    code,
  );
  if (
    !["directory", "file"].includes(value.type) ||
    !Number.isSafeInteger(value.mode) ||
    value.mode < 0 ||
    value.mode > 0o7777 ||
    !Number.isSafeInteger(value.uid) ||
    value.uid < 0 ||
    !Number.isSafeInteger(value.gid) ||
    value.gid < 0 ||
    !Number.isSafeInteger(value.links) ||
    value.links <= 0 ||
    !isCanonicalNonnegativeDecimal(value.device) ||
    !isCanonicalNonnegativeDecimal(value.inode) ||
    !isCanonicalNonnegativeDecimal(value.size) ||
    !isCanonicalNonnegativeDecimal(value.mtimeNs)
  ) {
    fail(code);
  }
  return value;
}

function readAttemptChildren(valueInput) {
  const code = "M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID";
  const children = readArray(valueInput, code).map((item) => {
    const row = readRecord(item, code);
    assertKeys(row, ["name", "identity"], code);
    if (typeof row.name !== "string" || !SAFE_COMPONENT.test(row.name)) {
      fail(code);
    }
    return {
      name: row.name,
      identity: readAttemptIdentity(row.identity),
    };
  });
  const names = children.map((row) => row.name);
  if (
    JSON.stringify(names) !==
      JSON.stringify(
        [...names].sort((left, right) =>
          Buffer.from(left).compare(Buffer.from(right)),
        ),
      ) ||
    new Set(names).size !== names.length
  ) {
    fail(code);
  }
  return children;
}

function validateAttemptRootCommitTransition(valueInput) {
  const code = "M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID";
  const value = readRecord(valueInput, code);
  assertKeys(
    value,
    [
      "parentBefore",
      "parentAfter",
      "pathParentBefore",
      "pathParentAfter",
      "childrenBefore",
      "childrenAfter",
      "pathChild",
      "heldChild",
      "effectiveUid",
      "effectiveGid",
      "parentSynced",
    ],
    code,
  );
  const parentBefore = readAttemptIdentity(value.parentBefore);
  const parentAfter = readAttemptIdentity(value.parentAfter);
  const pathParentBefore = readAttemptIdentity(value.pathParentBefore);
  const pathParentAfter = readAttemptIdentity(value.pathParentAfter);
  const childrenBefore = readAttemptChildren(value.childrenBefore);
  const childrenAfter = readAttemptChildren(value.childrenAfter);
  const pathChild = readAttemptIdentity(value.pathChild);
  const heldChild = readAttemptIdentity(value.heldChild);
  const attemptName = path.basename(TOOLCHAIN_ATTEMPT_ROOT);
  const toolchainName = path.basename(TOOLCHAIN_ROOT);
  if (
    !Number.isSafeInteger(value.effectiveUid) ||
    !Number.isSafeInteger(value.effectiveGid) ||
    value.parentSynced !== true ||
    !sameIdentity(parentBefore, pathParentBefore) ||
    !sameIdentity(parentAfter, pathParentAfter) ||
    parentBefore.type !== "directory" ||
    parentAfter.type !== "directory" ||
    (parentBefore.mode & 0o7000) !== 0 ||
    parentAfter.mode !== parentBefore.mode ||
    parentAfter.uid !== parentBefore.uid ||
    parentAfter.gid !== parentBefore.gid ||
    parentAfter.device !== parentBefore.device ||
    parentAfter.inode !== parentBefore.inode ||
    parentAfter.links !== parentBefore.links + 1 ||
    BigInt(parentAfter.mtimeNs) < BigInt(parentBefore.mtimeNs) ||
    childrenBefore.some(
      (row) => row.name === attemptName || row.name === toolchainName,
    ) ||
    !sameIdentity(pathChild, heldChild) ||
    heldChild.type !== "directory" ||
    heldChild.mode !== 0o700 ||
    heldChild.uid !== value.effectiveUid ||
    heldChild.gid !== value.effectiveGid ||
    heldChild.links !== 2 ||
    heldChild.device !== parentAfter.device
  ) {
    fail(code);
  }
  const committed = childrenAfter.find((row) => row.name === attemptName);
  const unchanged = childrenAfter.filter((row) => row.name !== attemptName);
  const physicalIdentities = childrenAfter.map(
    (row) => `${row.identity.device}:${row.identity.inode}`,
  );
  if (
    committed === undefined ||
    !sameIdentity(committed.identity, heldChild) ||
    JSON.stringify(unchanged) !== JSON.stringify(childrenBefore) ||
    new Set(physicalIdentities).size !== physicalIdentities.length
  ) {
    fail(code);
  }
  return deepFreeze({
    parentBefore,
    parentAfter,
    childrenBefore,
    childrenAfter,
    child: heldChild,
  });
}

async function pathAbsent(candidate) {
  try {
    await lstat(candidate);
    return false;
  } catch (error) {
    if (error && error.code === "ENOENT") return true;
    throw error;
  }
}

async function assertHeldParentNamesAbsent(parentPath, names, code) {
  const handle = await open(
    parentPath,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    const before = statIdentity(await handle.stat({ bigint: true }));
    const children = await readdir(parentPath);
    const after = statIdentity(await handle.stat({ bigint: true }));
    if (
      !sameIdentity(before, after) ||
      names.some((name) => children.includes(name))
    ) {
      fail(code);
    }
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directoryPath) {
  const handle = await open(
    directoryPath,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function heldDirectorySnapshot(parentPath, handle) {
  const before = statIdentity(await handle.stat({ bigint: true }));
  const rows = [];
  for (const name of (await readdir(parentPath)).sort((left, right) =>
    Buffer.from(left).compare(Buffer.from(right)),
  )) {
    if (!SAFE_COMPONENT.test(name)) fail("M2A_INPUT_DIRECTORY_INVALID");
    rows.push({
      name,
      identity: statIdentity(
        await lstat(path.join(parentPath, name), { bigint: true }),
      ),
    });
  }
  const after = statIdentity(await handle.stat({ bigint: true }));
  if (!sameIdentity(before, after)) fail("M2A_INPUT_DIRECTORY_INVALID");
  return rows;
}

async function createHeldDirectoryChild(parentPath, childName) {
  const handle = await open(
    parentPath,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  try {
    const parentBefore = statIdentity(await handle.stat({ bigint: true }));
    const before = await heldDirectorySnapshot(parentPath, handle);
    if (before.some((row) => row.name === childName)) {
      fail("M2A_INPUT_DIRECTORY_PRESENT");
    }
    await mkdir(path.join(parentPath, childName), {
      mode: 0o700,
      recursive: false,
    });
    const after = await heldDirectorySnapshot(parentPath, handle);
    const added = after.find((row) => row.name === childName);
    const unchanged = after.filter((row) => row.name !== childName);
    const parentAfter = statIdentity(await handle.stat({ bigint: true }));
    if (
      added === undefined ||
      added.identity.type !== "directory" ||
      added.identity.mode !== 0o700 ||
      added.identity.links < 1 ||
      added.identity.uid !== process.geteuid() ||
      added.identity.gid !== process.getegid() ||
      JSON.stringify(unchanged) !== JSON.stringify(before) ||
      parentAfter.type !== "directory" ||
      parentAfter.device !== parentBefore.device ||
      parentAfter.inode !== parentBefore.inode ||
      parentAfter.mode !== parentBefore.mode ||
      parentAfter.uid !== parentBefore.uid ||
      parentAfter.gid !== parentBefore.gid
    ) {
      fail("M2A_INPUT_DIRECTORY_TRANSITION_INVALID");
    }
    await handle.sync();
    return added.identity;
  } finally {
    await handle.close();
  }
}

async function publishFileTransaction(
  root,
  stagingName,
  finalName,
  bytesInput,
) {
  const stagingPath = path.join(root, stagingName);
  const finalPath = path.join(root, finalName);
  const directoryHandle = await open(
    root,
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
  );
  let handle;
  let fileClosed = false;
  try {
    const initial = await heldDirectorySnapshot(root, directoryHandle);
    if (
      initial.some((row) => row.name === stagingName || row.name === finalName)
    ) {
      fail("M2A_INPUT_PUBLICATION_PRESENT");
    }
    handle = await open(
      stagingPath,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW |
        constants.O_RDWR,
      0o600,
    );
    const afterCreate = await heldDirectorySnapshot(root, directoryHandle);
    const created = afterCreate.find((row) => row.name === stagingName);
    if (
      created === undefined ||
      created.identity.type !== "file" ||
      created.identity.mode !== 0o600 ||
      created.identity.links !== 1 ||
      JSON.stringify(afterCreate.filter((row) => row.name !== stagingName)) !==
        JSON.stringify(initial)
    ) {
      fail("M2A_INPUT_PUBLICATION_TRANSITION_INVALID");
    }
    let offset = 0;
    const writeChunk = async (chunkInput) => {
      const chunk = asBytes(chunkInput, "M2A_INPUT_WRITE_FAILED");
      let chunkOffset = 0;
      while (chunkOffset < chunk.length) {
        const result = await handle.write(
          chunk,
          chunkOffset,
          chunk.length - chunkOffset,
          offset,
        );
        if (result.bytesWritten <= 0) fail("M2A_INPUT_WRITE_FAILED");
        chunkOffset += result.bytesWritten;
        offset += result.bytesWritten;
      }
    };
    const bytes =
      typeof bytesInput === "function"
        ? asBytes(await bytesInput(writeChunk), "M2A_INPUT_PUBLICATION_INVALID")
        : asBytes(bytesInput, "M2A_INPUT_PUBLICATION_INVALID");
    if (typeof bytesInput !== "function") await writeChunk(bytes);
    if (offset !== bytes.length) fail("M2A_INPUT_WRITE_FAILED");
    await handle.sync();
    const before = statIdentity(await handle.stat({ bigint: true }));
    const reread = Buffer.alloc(bytes.length);
    let readOffset = 0;
    while (readOffset < reread.length) {
      const result = await handle.read(
        reread,
        readOffset,
        reread.length - readOffset,
        readOffset,
      );
      if (result.bytesRead <= 0) fail("M2A_INPUT_REREAD_FAILED");
      readOffset += result.bytesRead;
    }
    if (!reread.equals(bytes)) fail("M2A_INPUT_REREAD_FAILED");
    await handle.chmod(0o444);
    const finalIdentity = statIdentity(await handle.stat({ bigint: true }));
    if (
      before.device !== finalIdentity.device ||
      before.inode !== finalIdentity.inode ||
      finalIdentity.type !== "file" ||
      finalIdentity.mode !== 0o444 ||
      finalIdentity.links !== 1 ||
      finalIdentity.uid !== process.geteuid() ||
      finalIdentity.gid !== process.getegid() ||
      finalIdentity.size !== String(bytes.length)
    ) {
      fail("M2A_INPUT_IDENTITY_FAILED");
    }
    const beforeRename = await heldDirectorySnapshot(root, directoryHandle);
    const staging = beforeRename.find((row) => row.name === stagingName);
    if (
      staging === undefined ||
      !sameIdentity(staging.identity, finalIdentity) ||
      beforeRename.some((row) => row.name === finalName) ||
      JSON.stringify(beforeRename.filter((row) => row.name !== stagingName)) !==
        JSON.stringify(initial)
    ) {
      fail("M2A_INPUT_PUBLICATION_TRANSITION_INVALID");
    }
    await handle.close();
    fileClosed = true;
    await rename(stagingPath, finalPath);
    const afterRename = await heldDirectorySnapshot(root, directoryHandle);
    const final = afterRename.find((row) => row.name === finalName);
    if (
      final === undefined ||
      !sameIdentity(final.identity, finalIdentity) ||
      afterRename.some((row) => row.name === stagingName) ||
      JSON.stringify(afterRename.filter((row) => row.name !== finalName)) !==
        JSON.stringify(initial)
    ) {
      fail("M2A_INPUT_PUBLICATION_TRANSITION_INVALID");
    }
    await directoryHandle.sync();
  } finally {
    const settlements = await Promise.allSettled([
      ...(!fileClosed && handle !== undefined ? [handle.close()] : []),
      directoryHandle.close(),
    ]);
    if (settlements.some((result) => result.status !== "fulfilled")) {
      fail("M2A_INPUT_CLOSE_UNKNOWN");
    }
  }
}

function requestProductionBytes(plan, onChunk = async () => {}) {
  return new Promise((resolve, reject) => {
    let terminal = false;
    let responseEnded = false;
    let requestClosed = false;
    let responseClosed = false;
    let responseBytes = null;
    let response;
    let closeTimer = null;
    const chunks = [];
    let size = 0;
    let writeChain = Promise.resolve();
    const finish = (error, value) => {
      if (terminal) return;
      terminal = true;
      clearTimeout(absoluteTimer);
      if (closeTimer !== null) clearTimeout(closeTimer);
      if (error === null) resolve(value);
      else reject(error);
    };
    const maybeFinish = () => {
      if (
        responseEnded &&
        requestClosed &&
        responseClosed &&
        responseBytes !== null
      ) {
        finish(null, responseBytes);
      }
    };
    const request = https.request(
      {
        protocol: plan.protocol,
        method: plan.method,
        hostname: plan.hostname,
        port: plan.port,
        servername: plan.servername,
        path: plan.pathname,
        rejectUnauthorized: plan.rejectUnauthorized,
        minVersion: plan.minVersion,
        agent: false,
        headers: plan.headers,
      },
      (incoming) => {
        response = incoming;
        const contentType = response.headers["content-type"];
        const contentEncoding = response.headers["content-encoding"] ?? null;
        const contentLengthValue = response.headers["content-length"] ?? null;
        if (
          Array.isArray(contentType) ||
          Array.isArray(contentEncoding) ||
          Array.isArray(contentLengthValue)
        ) {
          request.destroy(new Error("M2A_INPUT_RESPONSE_INVALID"));
          return;
        }
        try {
          normalizeContentType(contentType, plan, "M2A_INPUT_RESPONSE_INVALID");
          if (
            response.statusCode !== 200 ||
            ![null, "identity"].includes(contentEncoding) ||
            (contentLengthValue !== null &&
              !/^(0|[1-9][0-9]*)$/u.test(contentLengthValue))
          ) {
            fail("M2A_INPUT_RESPONSE_INVALID");
          }
        } catch (error) {
          request.destroy(error);
          return;
        }
        response.on("data", (chunk) => {
          const bytes = Buffer.from(chunk);
          size += bytes.length;
          if (size > plan.maximumBytes) {
            request.destroy(new Error("M2A_INPUT_RESPONSE_INVALID"));
            return;
          }
          chunks.push(bytes);
          response.pause();
          writeChain = writeChain
            .then(() => onChunk(bytes))
            .then(
              () => response.resume(),
              (error) => {
                request.destroy(error);
                throw error;
              },
            );
        });
        response.once("aborted", () => {
          finish(new Error("M2A_INPUT_RESPONSE_INVALID"));
        });
        response.once("error", () => {
          finish(new Error("M2A_INPUT_RESPONSE_INVALID"));
        });
        response.once("end", async () => {
          try {
            await writeChain;
          } catch {
            finish(new Error("M2A_INPUT_WRITE_FAILED"));
            return;
          }
          const bytes = Buffer.concat(chunks);
          if (
            response.complete !== true ||
            (contentLengthValue !== null &&
              Number(contentLengthValue) !== bytes.length)
          ) {
            finish(new Error("M2A_INPUT_RESPONSE_INVALID"));
            return;
          }
          responseBytes = bytes;
          responseEnded = true;
          closeTimer = setTimeout(() => {
            request.destroy(new Error("M2A_INPUT_CLOSE_UNKNOWN"));
            finish(new Error("M2A_INPUT_CLOSE_UNKNOWN"));
          }, plan.closeDeadlineMs);
          closeTimer.unref();
          maybeFinish();
        });
        response.once("close", () => {
          responseClosed = true;
          maybeFinish();
        });
      },
    );
    const absoluteTimer = setTimeout(() => {
      request.destroy(new Error("M2A_INPUT_DEADLINE"));
      const destroyTimer = setTimeout(() => {
        finish(new Error("M2A_INPUT_CLOSE_UNKNOWN"));
      }, plan.destroyGraceMs);
      destroyTimer.unref();
    }, plan.absoluteDeadlineMs);
    absoluteTimer.unref();
    request.once("error", (error) => {
      finish(error instanceof Error ? error : new Error("M2A_INPUT_FAILED"));
    });
    request.once("close", () => {
      requestClosed = true;
      maybeFinish();
    });
    request.end();
  });
}

export async function runFixedNpmAcquisitionEntry() {
  await assertHeldParentNamesAbsent(
    WORK_ROOT,
    [path.basename(ACQUISITION_ROOT)],
    "M2A_INPUT_ROOT_PRESENT",
  );
  await createHeldDirectoryChild(WORK_ROOT, path.basename(ACQUISITION_ROOT));
  const metadataBytes = await requestProductionBytes(NPM_REQUESTS[0]);
  const metadata = validateNpmMetadataBytes(metadataBytes);
  let tarball;
  await publishFileTransaction(
    ACQUISITION_ROOT,
    "npm-12.0.1.tgz.next",
    "npm-12.0.1.tgz",
    async (writeChunk) => {
      tarball = await requestProductionBytes(NPM_REQUESTS[1], writeChunk);
      if (tarball.length === 0 || sha512Sri(tarball) !== metadata.integrity) {
        fail("M2A_INPUT_INTEGRITY_MISMATCH");
      }
      return tarball;
    },
  );
  const receipt = createAcquisitionReceiptBytes({
    tarballSize: tarball.length,
    tarballSha256: sha256(tarball),
    integrity: metadata.integrity,
  });
  await publishFileTransaction(
    ACQUISITION_ROOT,
    "acquisition.next",
    "acquisition.json",
    receipt,
  );
  const children = await readdir(ACQUISITION_ROOT);
  if (
    JSON.stringify(children.sort()) !==
    JSON.stringify(["acquisition.json", "npm-12.0.1.tgz"])
  ) {
    fail("M2A_INPUT_FINAL_INVENTORY");
  }
  for (const child of children) {
    const identity = statIdentity(
      await lstat(path.join(ACQUISITION_ROOT, child), { bigint: true }),
    );
    if (
      identity.type !== "file" ||
      identity.mode !== 0o444 ||
      identity.links !== 1 ||
      identity.uid !== process.geteuid() ||
      identity.gid !== process.getegid()
    ) {
      fail("M2A_INPUT_FINAL_INVENTORY");
    }
  }
  return deepFreeze({
    status: "complete",
    evidenceReview: "not-performed",
  });
}

function heldDirectorySnapshotSync(parentPath, parentFd, code) {
  const heldBefore = statIdentity(fstatSync(parentFd, { bigint: true }));
  const pathBefore = statIdentity(lstatSync(parentPath, { bigint: true }));
  if (!sameIdentity(heldBefore, pathBefore)) fail(code);
  const rows = readdirSync(parentPath)
    .sort((left, right) => Buffer.from(left).compare(Buffer.from(right)))
    .map((name) => {
      if (!SAFE_COMPONENT.test(name)) fail(code);
      return {
        name,
        identity: statIdentity(
          lstatSync(path.join(parentPath, name), { bigint: true }),
        ),
      };
    });
  const heldAfter = statIdentity(fstatSync(parentFd, { bigint: true }));
  const pathAfter = statIdentity(lstatSync(parentPath, { bigint: true }));
  if (
    !sameIdentity(heldBefore, heldAfter) ||
    !sameIdentity(heldAfter, pathAfter)
  ) {
    fail(code);
  }
  return rows;
}

function closeAttemptAuthority(authority) {
  const failures = [];
  for (const key of ["stagingFd", "childFd", "parentFd"]) {
    const descriptor = authority[key];
    if (descriptor !== null) {
      authority[key] = null;
      try {
        closeSync(descriptor);
      } catch (error) {
        failures.push(error);
      }
    }
  }
  if (failures.length > 0) fail("M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN");
}

function createAttemptRootSynchronously() {
  const authority = {
    parentFd: null,
    childFd: null,
    stagingFd: null,
    transition: null,
  };
  let committed = false;
  let failure = null;
  try {
    authority.parentFd = openSync(
      WORK_ROOT,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    const parentBefore = statIdentity(
      fstatSync(authority.parentFd, { bigint: true }),
    );
    const pathParentBefore = statIdentity(
      lstatSync(WORK_ROOT, { bigint: true }),
    );
    const childrenBefore = heldDirectorySnapshotSync(
      WORK_ROOT,
      authority.parentFd,
      "M2A_TOOLCHAIN_ATTEMPT_PARENT_CHANGED",
    );
    if (
      childrenBefore.some(
        (row) =>
          row.name === path.basename(TOOLCHAIN_ATTEMPT_ROOT) ||
          row.name === path.basename(TOOLCHAIN_ROOT),
      )
    ) {
      fail("M2A_TOOLCHAIN_ROOT_PRESENT");
    }
    mkdirSync(TOOLCHAIN_ATTEMPT_ROOT, { mode: 0o700, recursive: false });
    committed = true;
    authority.childFd = openSync(
      TOOLCHAIN_ATTEMPT_ROOT,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    const heldChild = statIdentity(
      fstatSync(authority.childFd, { bigint: true }),
    );
    const pathChild = statIdentity(
      lstatSync(TOOLCHAIN_ATTEMPT_ROOT, { bigint: true }),
    );
    const parentAfter = statIdentity(
      fstatSync(authority.parentFd, { bigint: true }),
    );
    const pathParentAfter = statIdentity(
      lstatSync(WORK_ROOT, { bigint: true }),
    );
    const childrenAfter = heldDirectorySnapshotSync(
      WORK_ROOT,
      authority.parentFd,
      "M2A_TOOLCHAIN_ATTEMPT_PARENT_CHANGED",
    );
    fsyncSync(authority.parentFd);
    const parentSync = validateAttemptParentSync({
      ok: true,
      settlement: "known",
      parentSynced: true,
    });
    authority.transition = validateAttemptRootCommitTransition({
      parentBefore,
      parentAfter,
      pathParentBefore,
      pathParentAfter,
      childrenBefore,
      childrenAfter,
      pathChild,
      heldChild,
      effectiveUid: process.geteuid(),
      effectiveGid: process.getegid(),
      parentSynced: parentSync.parentSynced,
    });
  } catch (error) {
    failure = error;
  }
  if (failure !== null) {
    try {
      closeAttemptAuthority(authority);
    } catch (closeError) {
      failure = closeError;
    }
    Object.defineProperty(failure, "attemptRootCommitted", {
      value: committed,
    });
    throw failure;
  }
  return authority;
}

function publishInitialAttempt(authority, state) {
  const code = "M2A_TOOLCHAIN_ATTEMPT_TRANSITION_INVALID";
  const bytes = createToolchainAttemptBytes(state);
  const stagingName = "attempt.next";
  const finalName = "attempt.json";
  const stagingPath = path.join(TOOLCHAIN_ATTEMPT_ROOT, stagingName);
  const finalPath = path.join(TOOLCHAIN_ATTEMPT_ROOT, finalName);
  let failure = null;
  try {
    const initial = heldDirectorySnapshotSync(
      TOOLCHAIN_ATTEMPT_ROOT,
      authority.childFd,
      code,
    );
    if (
      initial.some((row) => row.name === stagingName || row.name === finalName)
    ) {
      fail("M2A_TOOLCHAIN_ATTEMPT_PRESENT");
    }
    authority.stagingFd = openSync(
      stagingPath,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW |
        constants.O_RDWR,
      0o600,
    );
    const createdHeld = statIdentity(
      fstatSync(authority.stagingFd, { bigint: true }),
    );
    const createdPath = statIdentity(lstatSync(stagingPath, { bigint: true }));
    const afterCreate = heldDirectorySnapshotSync(
      TOOLCHAIN_ATTEMPT_ROOT,
      authority.childFd,
      code,
    );
    const created = afterCreate.find((row) => row.name === stagingName);
    if (
      !sameIdentity(createdHeld, createdPath) ||
      created === undefined ||
      !sameIdentity(created.identity, createdHeld) ||
      createdHeld.type !== "file" ||
      createdHeld.mode !== 0o600 ||
      createdHeld.links !== 1 ||
      createdHeld.uid !== process.geteuid() ||
      createdHeld.gid !== process.getegid() ||
      JSON.stringify(afterCreate.filter((row) => row.name !== stagingName)) !==
        JSON.stringify(initial)
    ) {
      fail(code);
    }
    let offset = 0;
    while (offset < bytes.length) {
      const written = writeSync(
        authority.stagingFd,
        bytes,
        offset,
        bytes.length - offset,
        offset,
      );
      if (written <= 0) fail("M2A_INPUT_WRITE_FAILED");
      offset += written;
    }
    fsyncSync(authority.stagingFd);
    const reread = Buffer.alloc(bytes.length);
    let readOffset = 0;
    while (readOffset < reread.length) {
      const count = readSync(
        authority.stagingFd,
        reread,
        readOffset,
        reread.length - readOffset,
        readOffset,
      );
      if (count <= 0) fail("M2A_INPUT_REREAD_FAILED");
      readOffset += count;
    }
    if (!reread.equals(bytes)) fail("M2A_INPUT_REREAD_FAILED");
    fchmodSync(authority.stagingFd, 0o444);
    const finalIdentity = statIdentity(
      fstatSync(authority.stagingFd, { bigint: true }),
    );
    const beforeRename = heldDirectorySnapshotSync(
      TOOLCHAIN_ATTEMPT_ROOT,
      authority.childFd,
      code,
    );
    const staging = beforeRename.find((row) => row.name === stagingName);
    if (
      finalIdentity.type !== "file" ||
      finalIdentity.mode !== 0o444 ||
      finalIdentity.links !== 1 ||
      finalIdentity.uid !== process.geteuid() ||
      finalIdentity.gid !== process.getegid() ||
      finalIdentity.size !== String(bytes.length) ||
      staging === undefined ||
      !sameIdentity(staging.identity, finalIdentity) ||
      beforeRename.some((row) => row.name === finalName) ||
      JSON.stringify(beforeRename.filter((row) => row.name !== stagingName)) !==
        JSON.stringify(initial)
    ) {
      fail(code);
    }
    const stagingFd = authority.stagingFd;
    authority.stagingFd = null;
    closeSync(stagingFd);
    renameSync(stagingPath, finalPath);
    const afterRename = heldDirectorySnapshotSync(
      TOOLCHAIN_ATTEMPT_ROOT,
      authority.childFd,
      code,
    );
    const published = afterRename.find((row) => row.name === finalName);
    if (
      published === undefined ||
      !sameIdentity(published.identity, finalIdentity) ||
      afterRename.some((row) => row.name === stagingName) ||
      JSON.stringify(afterRename.filter((row) => row.name !== finalName)) !==
        JSON.stringify(initial)
    ) {
      fail(code);
    }
    fsyncSync(authority.childFd);
    const heldChild = statIdentity(
      fstatSync(authority.childFd, { bigint: true }),
    );
    const pathChild = statIdentity(
      lstatSync(TOOLCHAIN_ATTEMPT_ROOT, { bigint: true }),
    );
    const parentAfter = statIdentity(
      fstatSync(authority.parentFd, { bigint: true }),
    );
    const pathParentAfter = statIdentity(
      lstatSync(WORK_ROOT, { bigint: true }),
    );
    const parentChildren = heldDirectorySnapshotSync(
      WORK_ROOT,
      authority.parentFd,
      code,
    );
    const committed = parentChildren.find(
      (row) => row.name === path.basename(TOOLCHAIN_ATTEMPT_ROOT),
    );
    const unchanged = parentChildren.filter(
      (row) => row.name !== path.basename(TOOLCHAIN_ATTEMPT_ROOT),
    );
    if (
      !sameIdentity(parentAfter, authority.transition.parentAfter) ||
      !sameIdentity(parentAfter, pathParentAfter) ||
      !sameIdentity(heldChild, pathChild) ||
      heldChild.type !== "directory" ||
      heldChild.mode !== 0o700 ||
      heldChild.uid !== process.geteuid() ||
      heldChild.gid !== process.getegid() ||
      heldChild.links !== 2 ||
      committed === undefined ||
      !sameIdentity(committed.identity, heldChild) ||
      JSON.stringify(unchanged) !==
        JSON.stringify(authority.transition.childrenBefore)
    ) {
      fail(code);
    }
  } catch (error) {
    failure = error;
  }
  try {
    closeAttemptAuthority(authority);
  } catch (closeError) {
    failure = closeError;
  }
  if (failure !== null) throw failure;
}

async function publishAttempt(state) {
  const bytes = createToolchainAttemptBytes(state);
  const finalPath = path.join(TOOLCHAIN_ATTEMPT_ROOT, "attempt.json");
  const stagingPath = path.join(TOOLCHAIN_ATTEMPT_ROOT, "attempt.next");
  if (!(await pathAbsent(stagingPath))) fail("M2A_TOOLCHAIN_ATTEMPT_PRESENT");
  if (state.state === "in-progress" && !(await pathAbsent(finalPath))) {
    fail("M2A_TOOLCHAIN_ATTEMPT_PRESENT");
  }
  if (state.state !== "in-progress" && (await pathAbsent(finalPath))) {
    fail("M2A_TOOLCHAIN_ATTEMPT_MISSING");
  }
  await publishFileTransaction(
    TOOLCHAIN_ATTEMPT_ROOT,
    "attempt.next",
    state.state === "in-progress" ? "attempt.json" : "attempt.replacement",
    bytes,
  );
  if (state.state !== "in-progress") {
    const replacement = path.join(
      TOOLCHAIN_ATTEMPT_ROOT,
      "attempt.replacement",
    );
    const directoryHandle = await open(
      TOOLCHAIN_ATTEMPT_ROOT,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    try {
      const before = await heldDirectorySnapshot(
        TOOLCHAIN_ATTEMPT_ROOT,
        directoryHandle,
      );
      const prior = before.find((row) => row.name === "attempt.json");
      const next = before.find((row) => row.name === "attempt.replacement");
      if (prior === undefined || next === undefined) {
        fail("M2A_TOOLCHAIN_ATTEMPT_MISSING");
      }
      await rename(replacement, finalPath);
      const after = await heldDirectorySnapshot(
        TOOLCHAIN_ATTEMPT_ROOT,
        directoryHandle,
      );
      const published = after.find((row) => row.name === "attempt.json");
      if (
        published === undefined ||
        !sameIdentity(published.identity, next.identity) ||
        after.some((row) => row.name === "attempt.replacement") ||
        JSON.stringify(after.filter((row) => row.name !== "attempt.json")) !==
          JSON.stringify(
            before.filter(
              (row) =>
                row.name !== "attempt.json" &&
                row.name !== "attempt.replacement",
            ),
          )
      ) {
        fail("M2A_TOOLCHAIN_ATTEMPT_TRANSITION_INVALID");
      }
      await directoryHandle.sync();
    } finally {
      await directoryHandle.close();
    }
  }
}

async function holdStableFile(filePath, expectedMode) {
  const handle = await open(
    filePath,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const stat = await handle.stat({ bigint: true });
    const identity = statIdentity(stat);
    const size = BigInt(identity.size);
    if (
      identity.type !== "file" ||
      identity.links !== 1 ||
      identity.mode !== expectedMode ||
      size <= 0n ||
      size > BigInt(M2A_INPUTS.fileMaximumBytes) ||
      stat.blocks * 512n < stat.size
    ) {
      fail("M2A_TOOLCHAIN_SOURCE_INVALID");
    }
    const bytes = Buffer.alloc(Number(size));
    let offset = 0;
    while (offset < bytes.length) {
      const result = await handle.read(
        bytes,
        offset,
        bytes.length - offset,
        offset,
      );
      if (result.bytesRead <= 0) fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      offset += result.bytesRead;
    }
    const after = statIdentity(await handle.stat({ bigint: true }));
    if (!sameIdentity(identity, after)) {
      fail("M2A_TOOLCHAIN_SOURCE_INVALID");
    }
    return { bytes, identity, handle, settled: false };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

async function readHeldFile(filePath, expectedMode) {
  const held = await holdStableFile(filePath, expectedMode);
  try {
    return { bytes: held.bytes, identity: held.identity };
  } finally {
    await held.handle.close();
    held.settled = true;
  }
}

async function collectPackageGraph(spec) {
  const root = path.join(REPOSITORY_ROOT, spec.sourceRoot);
  const rows = [];
  const directoryAuthorities = new Map();
  const fileAuthorities = new Map();
  const physicalIdentities = new Set();

  const holdFile = async (absolutePath, logicalPath, parentLogical, name) => {
    const handle = await open(
      absolutePath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      const stat = await handle.stat({ bigint: true });
      const identity = statIdentity(stat);
      const size = BigInt(identity.size);
      if (
        identity.type !== "file" ||
        identity.links !== 1 ||
        size <= 0n ||
        size > BigInt(M2A_INPUTS.fileMaximumBytes) ||
        stat.blocks * 512n < stat.size
      ) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      const physical = `${identity.device}:${identity.inode}`;
      if (physicalIdentities.has(physical)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      physicalIdentities.add(physical);
      const bytes = Buffer.alloc(Number(size));
      let offset = 0;
      while (offset < bytes.length) {
        const result = await handle.read(
          bytes,
          offset,
          bytes.length - offset,
          offset,
        );
        if (result.bytesRead <= 0) fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        offset += result.bytesRead;
      }
      const after = statIdentity(await handle.stat({ bigint: true }));
      if (!sameIdentity(identity, after)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      const row = {
        logicalPath,
        parentLogical,
        name,
        type: "file",
        identity,
        sha256: sha256(bytes),
        bytes,
        handle,
      };
      fileAuthorities.set(logicalPath, row);
      rows.push(row);
    } catch (error) {
      await handle.close();
      throw error;
    }
  };

  const visit = async (absoluteDirectory, relativeDirectory, parentLogical) => {
    const logicalDirectory =
      relativeDirectory === ""
        ? spec.logicalPrefix
        : `${spec.logicalPrefix}/${relativeDirectory}`;
    const name =
      relativeDirectory === ""
        ? path.basename(spec.logicalPrefix)
        : path.basename(relativeDirectory);
    const directoryHandle = await open(
      absoluteDirectory,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    try {
      const identity = statIdentity(
        await directoryHandle.stat({ bigint: true }),
      );
      if (identity.type !== "directory") {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      const physical = `${identity.device}:${identity.inode}`;
      if (physicalIdentities.has(physical)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      physicalIdentities.add(physical);
      const authority = {
        logicalPath: logicalDirectory,
        parentLogical,
        name,
        type: "directory",
        identity,
        absolutePath: absoluteDirectory,
        handle: directoryHandle,
      };
      directoryAuthorities.set(logicalDirectory, authority);
      rows.push(authority);
      const names = (await readdir(absoluteDirectory)).sort((left, right) =>
        Buffer.from(left).compare(Buffer.from(right)),
      );
      for (const childName of names) {
        if (!SAFE_COMPONENT.test(childName)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        const beforeChild = statIdentity(
          await directoryHandle.stat({ bigint: true }),
        );
        if (!sameIdentity(identity, beforeChild)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        const absoluteChild = path.join(absoluteDirectory, childName);
        const relativeChild =
          relativeDirectory === ""
            ? childName
            : `${relativeDirectory}/${childName}`;
        const childStat = await lstat(absoluteChild, { bigint: true });
        if (childStat.isDirectory()) {
          await visit(absoluteChild, relativeChild, logicalDirectory);
        } else if (childStat.isFile()) {
          await holdFile(
            absoluteChild,
            `${spec.logicalPrefix}/${relativeChild}`,
            logicalDirectory,
            childName,
          );
        } else {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        const afterChild = statIdentity(
          await directoryHandle.stat({ bigint: true }),
        );
        if (!sameIdentity(identity, afterChild)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
      }
      const after = statIdentity(await directoryHandle.stat({ bigint: true }));
      if (!sameIdentity(identity, after)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
    } catch (error) {
      if (!directoryAuthorities.has(logicalDirectory)) {
        await directoryHandle.close();
      }
      throw error;
    }
  };

  try {
    await visit(root, "", "");
  } catch (error) {
    const settlements = await Promise.allSettled([
      ...[...directoryAuthorities.values()].map((row) => row.handle.close()),
      ...[...fileAuthorities.values()].map((row) => row.handle.close()),
    ]);
    if (settlements.some((result) => result.status !== "fulfilled")) {
      fail("M2A_TOOLCHAIN_SOURCE_CLOSE_UNKNOWN");
    }
    throw error;
  }
  rows.sort((left, right) =>
    Buffer.from(left.logicalPath).compare(Buffer.from(right.logicalPath)),
  );
  const firstProjection = rows.map((row) => ({
    logicalPath: row.logicalPath,
    parentLogical: row.parentLogical,
    name: row.name,
    type: row.type,
    identity: row.identity,
    sha256: row.type === "file" ? row.sha256 : null,
  }));

  const secondTraversal = async () => {
    const projection = [];
    const revisit = async (logicalDirectory) => {
      const authority = directoryAuthorities.get(logicalDirectory);
      if (authority === undefined) fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      const before = statIdentity(
        await authority.handle.stat({ bigint: true }),
      );
      if (!sameIdentity(before, authority.identity)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
      projection.push({
        logicalPath: authority.logicalPath,
        parentLogical: authority.parentLogical,
        name: authority.name,
        type: "directory",
        identity: authority.identity,
        sha256: null,
      });
      const names = (await readdir(authority.absolutePath)).sort(
        (left, right) => Buffer.from(left).compare(Buffer.from(right)),
      );
      for (const childName of names) {
        const childLogical = `${logicalDirectory}/${childName}`;
        const directory = directoryAuthorities.get(childLogical);
        const file = fileAuthorities.get(childLogical);
        if ((directory === undefined) === (file === undefined)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        if (directory !== undefined) {
          if (
            directory.parentLogical !== logicalDirectory ||
            directory.name !== childName
          ) {
            fail("M2A_TOOLCHAIN_SOURCE_INVALID");
          }
          await revisit(childLogical);
        } else {
          const current = statIdentity(
            await file.handle.stat({ bigint: true }),
          );
          if (
            file.parentLogical !== logicalDirectory ||
            file.name !== childName ||
            !sameIdentity(current, file.identity)
          ) {
            fail("M2A_TOOLCHAIN_SOURCE_INVALID");
          }
          projection.push({
            logicalPath: file.logicalPath,
            parentLogical: file.parentLogical,
            name: file.name,
            type: "file",
            identity: file.identity,
            sha256: file.sha256,
          });
        }
      }
      const after = statIdentity(await authority.handle.stat({ bigint: true }));
      if (!sameIdentity(after, authority.identity)) {
        fail("M2A_TOOLCHAIN_SOURCE_INVALID");
      }
    };
    await revisit(spec.logicalPrefix);
    projection.sort((left, right) =>
      Buffer.from(left.logicalPath).compare(Buffer.from(right.logicalPath)),
    );
    if (JSON.stringify(projection) !== JSON.stringify(firstProjection)) {
      fail("M2A_TOOLCHAIN_SOURCE_GRAPH_INVALID");
    }
  };

  const closeAll = async (authorities, code) => {
    const settlements = await Promise.allSettled(
      [...authorities.values()].map((authority) => authority.handle.close()),
    );
    if (settlements.some((result) => result.status !== "fulfilled")) fail(code);
  };

  return {
    rows,
    firstProjection,
    secondTraversal,
    closeDirectories: () =>
      closeAll(
        directoryAuthorities,
        "M2A_TOOLCHAIN_SOURCE_DIRECTORY_CLOSE_UNKNOWN",
      ),
    closeFiles: () =>
      closeAll(fileAuthorities, "M2A_TOOLCHAIN_SOURCE_CLOSE_UNKNOWN"),
  };
}

async function ensureTrackedClosure() {
  const rows = [];
  for (const relativePath of M2A_CONSTRUCTION.constructionInputs) {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    const sourceMode = (await lstat(absolutePath)).mode & 0o7777;
    const held = await readHeldFile(absolutePath, sourceMode);
    rows.push({
      path: relativePath,
      bytes: held.bytes,
      type: "regular",
      linkCount: 1,
      descriptorSettled: true,
    });
  }
  const aggregates = calculateTrackedInputAggregates(rows);
  if (
    aggregates.sourceAggregate !== M2A_INPUTS.sourceAggregate ||
    aggregates.constructionBaselineAggregate !==
      M2A_INPUTS.constructionBaselineAggregate
  ) {
    fail("M2A_TOOLCHAIN_TRACKED_CLOSURE");
  }
}

async function copyInventoryFile(logicalPath, bytes) {
  const destination = path.join(TOOLCHAIN_ROOT, logicalPath);
  if (!destination.startsWith(`${TOOLCHAIN_ROOT}${path.sep}`)) {
    fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
  }
  await publishFileTransaction(
    path.dirname(destination),
    `${path.basename(destination)}.next`,
    path.basename(destination),
    bytes,
  );
}

async function validateProductionDestinationTree(inventory) {
  const expectedDirectories = new Set([
    "packages",
    "packages/@types",
    "packages/@types/node",
    "packages/typescript",
    "packages/undici-types",
    "runtime",
    "runtime/shared",
  ]);
  const expectedFiles = new Map(
    inventory
      .filter((row) => row.logicalPath !== "runtime/constructor-node")
      .map((row) => [row.logicalPath, row]),
  );
  const seenDirectories = new Set();
  const seenFiles = new Set();
  const directoryHandles = [];
  const visit = async (absoluteDirectory, logicalDirectory) => {
    const handle = await open(
      absoluteDirectory,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    directoryHandles.push(handle);
    const before = statIdentity(await handle.stat({ bigint: true }));
    if (
      before.type !== "directory" ||
      before.mode !== 0o700 ||
      before.links < 1
    ) {
      fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
    }
    if (logicalDirectory !== "") seenDirectories.add(logicalDirectory);
    const names = (await readdir(absoluteDirectory)).sort((left, right) =>
      Buffer.from(left).compare(Buffer.from(right)),
    );
    for (const name of names) {
      if (!SAFE_COMPONENT.test(name)) {
        fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
      }
      const logicalChild =
        logicalDirectory === "" ? name : `${logicalDirectory}/${name}`;
      const absoluteChild = path.join(absoluteDirectory, name);
      const childStat = await lstat(absoluteChild, { bigint: true });
      if (childStat.isDirectory()) {
        if (!expectedDirectories.has(logicalChild)) {
          fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
        }
        await visit(absoluteChild, logicalChild);
      } else if (childStat.isFile()) {
        const expected = expectedFiles.get(logicalChild);
        if (expected === undefined || seenFiles.has(logicalChild)) {
          fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
        }
        const held = await readHeldFile(absoluteChild, 0o444);
        if (
          held.bytes.length !== expected.size ||
          sha256(held.bytes) !== expected.sha256
        ) {
          fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
        }
        seenFiles.add(logicalChild);
      } else {
        fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
      }
    }
    const after = statIdentity(await handle.stat({ bigint: true }));
    if (!sameIdentity(before, after)) {
      fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
    }
  };
  try {
    await visit(TOOLCHAIN_ROOT, "");
    if (
      JSON.stringify([...seenDirectories].sort()) !==
        JSON.stringify([...expectedDirectories].sort()) ||
      JSON.stringify([...seenFiles].sort()) !==
        JSON.stringify([...expectedFiles.keys()].sort())
    ) {
      fail("M2A_TOOLCHAIN_DESTINATION_INVALID");
    }
  } finally {
    const settlements = await Promise.allSettled(
      directoryHandles.map((handle) => handle.close()),
    );
    if (settlements.some((result) => result.status !== "fulfilled")) {
      fail("M2A_TOOLCHAIN_DESTINATION_CLOSE_UNKNOWN");
    }
  }
}

export async function runFixedToolchainCaptureEntry() {
  let committed = false;
  let packageDirectoriesClosed = false;
  let packageFilesClosed = false;
  const packageAuthorities = [];
  let runtimeFilesClosed = false;
  const runtimeAuthorities = [];
  const deadline = Date.now() + M2A_INPUTS.toolchainAbsoluteDeadlineMs;
  const assertDeadline = () => {
    if (Date.now() > deadline) fail("M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN");
  };
  const settlePackageAuthorities = async (kind) => {
    const method = kind === "directories" ? "closeDirectories" : "closeFiles";
    const settlements = await Promise.allSettled(
      packageAuthorities.map((authority) => authority[method]()),
    );
    if (settlements.some((result) => result.status !== "fulfilled")) {
      fail("M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN");
    }
    if (kind === "directories") packageDirectoriesClosed = true;
    else packageFilesClosed = true;
  };
  const settleRuntimeAuthorities = async () => {
    const settlements = await Promise.allSettled(
      runtimeAuthorities
        .filter((authority) => authority.settled !== true)
        .map(async (authority) => {
          await authority.handle.close();
          authority.settled = true;
        }),
    );
    if (settlements.some((result) => result.status !== "fulfilled")) {
      fail("M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN");
    }
    runtimeFilesClosed = true;
  };
  try {
    let attemptAuthority;
    try {
      attemptAuthority = createAttemptRootSynchronously();
      committed = true;
    } catch (error) {
      committed = error instanceof Error && error.attemptRootCommitted === true;
      throw error;
    }
    publishInitialAttempt(attemptAuthority, {
      state: "in-progress",
      issue: "M2A_TOOLCHAIN_IN_PROGRESS",
      toolchainReceiptSha256: null,
      inventoryAggregate: null,
    });
    assertDeadline();
    await ensureTrackedClosure();
    if (
      process.version !== "v20.18.2" ||
      process.platform !== "linux" ||
      process.arch !== "x64"
    ) {
      fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
    }
    const nodeHeld = await holdStableFile("/usr/bin/node", 0o555);
    runtimeAuthorities.push(nodeHeld);
    const report = process.report?.getReport();
    const sharedObjects = readArray(
      report?.sharedObjects,
      "M2A_TOOLCHAIN_RUNTIME_INVALID",
    );
    if (
      sharedObjects.length > M2A_INPUTS.runtimeMaximumRows ||
      sharedObjects.some(
        (item) => typeof item !== "string" || !path.isAbsolute(item),
      ) ||
      new Set(sharedObjects).size !== sharedObjects.length
    ) {
      fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
    }
    const sortedShared = [...sharedObjects].sort((left, right) =>
      Buffer.from(left).compare(Buffer.from(right)),
    );
    const runtimeFiles = [];
    const runtimePhysicalIdentities = new Set();
    let runtimeBytes = 0;
    for (let index = 0; index < sortedShared.length; index += 1) {
      assertDeadline();
      const source = sortedShared[index];
      const basename = path.basename(source);
      if (!SAFE_COMPONENT.test(basename)) fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
      const sourceStat = await lstat(source, { bigint: true });
      const held = await holdStableFile(source, sourceStat.mode & 0o7777);
      runtimeAuthorities.push(held);
      const physical = `${held.identity.device}:${held.identity.inode}`;
      if (runtimePhysicalIdentities.has(physical)) {
        fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
      }
      runtimePhysicalIdentities.add(physical);
      runtimeBytes += held.bytes.length;
      if (runtimeBytes > M2A_INPUTS.familyMaximumBytes) {
        fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
      }
      runtimeFiles.push({
        sourcePath: source,
        logicalPath: `runtime/shared/${String(index).padStart(3, "0")}-${basename}`,
        bytes: held.bytes,
        identity: held.identity,
        authority: held,
      });
    }
    const runtimeProjection = validateRuntimeProjection({
      version: process.version,
      platform: process.platform,
      architecture: process.arch,
      executableType: nodeHeld.identity.type,
      executableSize: nodeHeld.bytes.length,
      executableSha256: sha256(nodeHeld.bytes),
      mode: nodeHeld.identity.mode,
      links: nodeHeld.identity.links,
      sparse: false,
      reportDense: true,
      sharedObjects,
      sharedObjectRows: runtimeFiles.map((runtimeFile) => ({
        sourcePath: runtimeFile.sourcePath,
        logicalPath: runtimeFile.logicalPath,
        type: runtimeFile.identity.type,
        mode: runtimeFile.identity.mode,
        links: runtimeFile.identity.links,
        size: runtimeFile.bytes.length,
        sha256: sha256(runtimeFile.bytes),
        device: runtimeFile.identity.device,
        inode: runtimeFile.identity.inode,
        sparse: false,
        sourceConnected: true,
      })),
    });
    for (const spec of PACKAGE_SPECS) {
      assertDeadline();
      packageAuthorities.push(await collectPackageGraph(spec));
    }
    const allSourceFiles = packageAuthorities.flatMap((authority) =>
      authority.rows.filter((row) => row.type === "file"),
    );
    const sourcePhysicalIdentities = allSourceFiles.map(
      (row) => `${row.identity.device}:${row.identity.inode}`,
    );
    if (
      new Set(sourcePhysicalIdentities).size !== sourcePhysicalIdentities.length
    ) {
      fail("M2A_TOOLCHAIN_SOURCE_INVALID");
    }
    for (let index = 0; index < packageAuthorities.length; index += 1) {
      const authority = packageAuthorities[index];
      const spec = PACKAGE_SPECS[index];
      const packageJson = authority.rows.find(
        (row) => row.logicalPath === `${spec.logicalPrefix}/package.json`,
      );
      if (packageJson === undefined || packageJson.type !== "file") {
        fail("M2A_TOOLCHAIN_PACKAGE_INVALID");
      }
      let packageRecord;
      try {
        packageRecord = readRecord(
          JSON.parse(packageJson.bytes.toString("utf8")),
          "M2A_TOOLCHAIN_PACKAGE_INVALID",
        );
      } catch {
        fail("M2A_TOOLCHAIN_PACKAGE_INVALID");
      }
      if (
        packageRecord.name !== spec.name ||
        packageRecord.version !== spec.version
      ) {
        fail("M2A_TOOLCHAIN_PACKAGE_INVALID");
      }
      await authority.secondTraversal();
    }
    await settlePackageAuthorities("directories");
    assertDeadline();
    await createHeldDirectoryChild(WORK_ROOT, path.basename(TOOLCHAIN_ROOT));
    for (const directory of [
      "runtime",
      "runtime/shared",
      "packages",
      "packages/typescript",
      "packages/@types",
      "packages/@types/node",
      "packages/undici-types",
    ]) {
      const absoluteDirectory = path.join(TOOLCHAIN_ROOT, directory);
      await createHeldDirectoryChild(
        path.dirname(absoluteDirectory),
        path.basename(absoluteDirectory),
      );
    }
    const inventory = [
      {
        logicalPath: "runtime/constructor-node",
        mode: 0o555,
        size: nodeHeld.bytes.length,
        sha256: sha256(nodeHeld.bytes),
      },
    ];
    for (const runtimeFile of runtimeFiles) {
      assertDeadline();
      const before = statIdentity(
        await runtimeFile.authority.handle.stat({ bigint: true }),
      );
      if (!sameIdentity(before, runtimeFile.identity)) {
        fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
      }
      await copyInventoryFile(runtimeFile.logicalPath, runtimeFile.bytes);
      const after = statIdentity(
        await runtimeFile.authority.handle.stat({ bigint: true }),
      );
      if (!sameIdentity(after, runtimeFile.identity)) {
        fail("M2A_TOOLCHAIN_RUNTIME_INVALID");
      }
      inventory.push({
        logicalPath: runtimeFile.logicalPath,
        mode: 0o444,
        size: runtimeFile.bytes.length,
        sha256: sha256(runtimeFile.bytes),
      });
    }
    await settleRuntimeAuthorities();
    let packageBytes = 0;
    for (const authority of packageAuthorities) {
      for (const row of authority.rows.filter((item) => item.type === "file")) {
        assertDeadline();
        const before = statIdentity(await row.handle.stat({ bigint: true }));
        if (!sameIdentity(before, row.identity)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        await copyInventoryFile(row.logicalPath, row.bytes);
        const after = statIdentity(await row.handle.stat({ bigint: true }));
        if (!sameIdentity(after, row.identity)) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        packageBytes += row.bytes.length;
        if (packageBytes > M2A_INPUTS.familyMaximumBytes) {
          fail("M2A_TOOLCHAIN_SOURCE_INVALID");
        }
        inventory.push({
          logicalPath: row.logicalPath,
          mode: 0o444,
          size: row.bytes.length,
          sha256: row.sha256,
        });
      }
    }
    await settlePackageAuthorities("files");
    inventory.sort((left, right) =>
      Buffer.from(left.logicalPath).compare(Buffer.from(right.logicalPath)),
    );
    const inventoryBytes = inventory.reduce((sum, row) => sum + row.size, 0);
    if (
      inventory.length > M2A_INPUTS.inventoryMaximumRows ||
      inventoryBytes > M2A_INPUTS.inventoryMaximumBytes
    ) {
      fail("M2A_TOOLCHAIN_INVENTORY_INVALID");
    }
    validateRuntimeInventoryProjection(runtimeProjection, inventory);
    await validateProductionDestinationTree(inventory);
    assertDeadline();
    const receipt = createToolchainReceiptBytes({
      runtime: {
        logicalId: "constructor-node",
        version: process.version,
        platform: process.platform,
        architecture: process.arch,
        executableSize: nodeHeld.bytes.length,
        executableSha256: sha256(nodeHeld.bytes),
      },
      packages: PACKAGE_SPECS.map(({ name, version, integrity }) => ({
        name,
        version,
        integrity,
      })),
      inventory,
    });
    await publishFileTransaction(
      TOOLCHAIN_ROOT,
      "toolchain.next",
      "toolchain.json",
      receipt,
    );
    const inventoryAggregate = sha256(JSON.stringify(inventory));
    await publishAttempt({
      state: "complete",
      issue: null,
      toolchainReceiptSha256: sha256(receipt),
      inventoryAggregate,
    });
    return deepFreeze({
      status: "complete",
      evidenceReview: "not-performed",
    });
  } catch (error) {
    let settlementUnknown =
      error instanceof Error &&
      error.message === "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN";
    if (!runtimeFilesClosed && runtimeAuthorities.length > 0) {
      try {
        await settleRuntimeAuthorities();
      } catch {
        settlementUnknown = true;
      }
    }
    if (!packageDirectoriesClosed && packageAuthorities.length > 0) {
      try {
        await settlePackageAuthorities("directories");
      } catch {
        settlementUnknown = true;
      }
    }
    if (!packageFilesClosed && packageAuthorities.length > 0) {
      try {
        await settlePackageAuthorities("files");
      } catch {
        settlementUnknown = true;
      }
    }
    if (committed) {
      try {
        await publishAttempt({
          state: "failed",
          issue: settlementUnknown
            ? "M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN"
            : "M2A_TOOLCHAIN_FAILED",
          toolchainReceiptSha256: null,
          inventoryAggregate: null,
        });
      } catch {
        // The retained root and any previously synced in-progress checkpoint
        // remain the durable settlement-unknown non-evidence occurrence.
      }
    }
    throw error;
  }
}
