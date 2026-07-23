import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readdir,
  rename,
  rm,
  utimes,
} from "node:fs/promises";
import path from "node:path";
import { clearTimeout, setTimeout } from "node:timers";
import { types } from "node:util";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const INTEGRITY_PATTERN = /^sha512-[A-Za-z0-9+/]+={0,2}$/u;
const SAFE_LOGICAL_PATH =
  // eslint-disable-next-line no-control-regex -- control bytes are forbidden input.
  /^(?!\/)(?!.*(?:^|\/)\.\.?(?:\/|$))(?!.*[\u0000-\u001f\u007f])[^\\]+$/u;
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(MODULE_DIRECTORY, "../../..");
const fakeConstructionBackendBrand = new WeakSet();
const fakeProcessTraceBrand = new WeakSet();
const fixedConstructionAuthorityBrand = new WeakSet();
const validatedAcquisitionBrand = new WeakSet();
const constructionCorrelationBrand = new WeakSet();

const SOURCE_INPUTS = Object.freeze([
  "package-lock.json",
  "packages/probe-core/package.json",
  "packages/npm-lifecycle-probe/package.json",
  "packages/npm-lifecycle-probe/fixture/consumer/package.json",
  "packages/npm-lifecycle-probe/fixture/dependency/package.json",
  "packages/npm-lifecycle-probe/src/constants.ts",
  "packages/npm-lifecycle-probe/src/coordinator-input.ts",
  "packages/npm-lifecycle-probe/src/errors.ts",
  "packages/npm-lifecycle-probe/src/index.ts",
  "packages/npm-lifecycle-probe/src/lifecycle-entry.ts",
  "packages/npm-lifecycle-probe/src/manifest.ts",
  "packages/npm-lifecycle-probe/src/types.ts",
  "packages/probe-core/src/attempts/child.ts",
  "packages/probe-core/src/attempts/environment.ts",
  "packages/probe-core/src/attempts/file.ts",
  "packages/probe-core/src/attempts/network.ts",
  "packages/probe-core/src/attempts/types.ts",
  "packages/probe-core/src/constants.ts",
  "packages/probe-core/src/errors.ts",
  "packages/probe-core/src/event.ts",
  "packages/probe-core/src/file-preflight.ts",
  "packages/probe-core/src/fixed-child.js",
  "packages/probe-core/src/hash.ts",
  "packages/probe-core/src/index.ts",
  "packages/probe-core/src/path-policy.ts",
  "packages/probe-core/src/preparation.ts",
  "packages/probe-core/src/safe-data.ts",
  "packages/probe-core/src/session.ts",
  "packages/probe-core/src/sink.ts",
  "packages/probe-core/src/types.ts",
  "packages/probe-core/src/validation.ts",
]);
const CONSTRUCTION_ADDITIONS = Object.freeze([
  "package.json",
  "tsconfig.base.json",
  "packages/probe-core/tsconfig.json",
  "packages/probe-core/tsconfig.build.json",
  "packages/npm-lifecycle-probe/tsconfig.json",
  "packages/npm-lifecycle-probe/tsconfig.build.json",
  "experiments/npm12-install/Containerfile.m2a-transfer",
  "experiments/npm12-install/m2a-transfer-manifest.json",
  "experiments/npm12-install/container/initialize-m2a-volume.mjs",
  "experiments/npm12-install/container/run-m2a-transfer.mjs",
]);
const CONSTRUCTION_INPUTS = Object.freeze([
  ...SOURCE_INPUTS,
  ...CONSTRUCTION_ADDITIONS,
]);
const COMPILER_STEPS = Object.freeze([
  Object.freeze({
    stepId: "compile-probe-core",
    executableLogicalId: "constructor-node",
    argvLogicalId: "compile-probe-core-argv",
    cwdLogicalId: "private-compiler-workspace",
    environmentKeys: Object.freeze([]),
    deadlineMs: 30_000,
    combinedOutputLimitBytes: 65_536,
    termToKillGraceMs: 250,
    closeDeadlineMs: 1_000,
    executable: "/usr/bin/node",
    argv: Object.freeze([
      "node_modules/typescript/bin/tsc",
      "--project",
      "packages/probe-core/tsconfig.build.json",
      "--outDir",
      "packages/probe-core/dist",
      "--pretty",
      "false",
      "--incremental",
      "false",
    ]),
    shell: false,
    environment: Object.freeze({}),
  }),
  Object.freeze({
    stepId: "compile-npm-lifecycle-probe",
    executableLogicalId: "constructor-node",
    argvLogicalId: "compile-npm-lifecycle-probe-argv",
    cwdLogicalId: "private-compiler-workspace",
    environmentKeys: Object.freeze([]),
    deadlineMs: 30_000,
    combinedOutputLimitBytes: 65_536,
    termToKillGraceMs: 250,
    closeDeadlineMs: 1_000,
    executable: "/usr/bin/node",
    argv: Object.freeze([
      "node_modules/typescript/bin/tsc",
      "--project",
      "packages/npm-lifecycle-probe/tsconfig.build.json",
      "--outDir",
      "packages/npm-lifecycle-probe/dist",
      "--pretty",
      "false",
      "--incremental",
      "false",
    ]),
    shell: false,
    environment: Object.freeze({}),
  }),
]);
const TOOLCHAIN_PACKAGES = Object.freeze([
  Object.freeze({
    name: "typescript",
    version: "5.9.3",
    integrity:
      "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
  }),
  Object.freeze({
    name: "@types/node",
    version: "20.19.43",
    integrity:
      "sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==",
  }),
  Object.freeze({
    name: "undici-types",
    version: "6.21.0",
    integrity:
      "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
  }),
]);
const CONSTRUCTION_STEPS = Object.freeze([
  "validate-source-baseline",
  "validate-acquisition",
  "validate-toolchain",
  "assert-fixed-roots-absent",
  "compile-probe-core",
  "compile-npm-lifecycle-probe",
  "parse-npm-archive",
  "derive-context",
  "settle-private-workspace",
  "second-clean-derivation",
  "publish-context",
  "publish-manifest",
]);
const REQUIRED_CONTEXT_PATHS = Object.freeze([
  "Containerfile.m2a-transfer",
  "container",
  "container/initialize-m2a-volume.mjs",
  "container/run-m2a-transfer.mjs",
  "m2a-context",
  "m2a-context/npm",
  "m2a-context/npm/bin/npm-cli.js",
  "m2a-context/npm-cli.js",
  "m2a-context/probe-core",
  "m2a-context/probe-core/package.json",
  "m2a-context/probe-core/dist",
  "m2a-context/probe-core/dist/index.js",
  "m2a-context/npm-lifecycle-probe",
  "m2a-context/npm-lifecycle-probe/package.json",
  "m2a-context/npm-lifecycle-probe/dist",
  "m2a-context/npm-lifecycle-probe/dist/index.js",
  "m2a-context/npm-lifecycle-probe/dist/lifecycle-entry.js",
  "m2a-context/consumer",
  "m2a-context/consumer/package.json",
  "m2a-context/m2a-install-probe-1.0.0.tgz",
]);

function fail(code) {
  throw new Error(code);
}

function freeze(value) {
  if (ArrayBuffer.isView(value)) return value;
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if ("value" in descriptor) freeze(descriptor.value);
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
      value === null ||
      typeof value !== "object" ||
      !Array.isArray(value) ||
      types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Array.prototype ||
      Object.getOwnPropertySymbols(value).length !== 0
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const length = descriptors.length;
    if (
      length === undefined ||
      !("value" in length) ||
      length.enumerable !== false ||
      !Number.isSafeInteger(length.value) ||
      length.value < 0 ||
      Object.keys(descriptors).length !== length.value + 1
    ) {
      fail(code);
    }
    const output = [];
    for (let index = 0; index < length.value; index += 1) {
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

function assertKeys(record, keys, code) {
  if (JSON.stringify(Object.keys(record)) !== JSON.stringify(keys)) fail(code);
}

function snapshotBytes(value, maximum, code) {
  try {
    if (typeof value === "string") {
      const bytes = Buffer.from(value, "utf8");
      if (bytes.byteLength === 0 || bytes.byteLength > maximum) fail(code);
      return bytes;
    }
    if (
      value === null ||
      typeof value !== "object" ||
      types.isProxy(value) ||
      !types.isUint8Array(value) ||
      ![Uint8Array.prototype, Buffer.prototype].includes(
        Object.getPrototypeOf(value),
      ) ||
      types.isSharedArrayBuffer(value.buffer)
    ) {
      fail(code);
    }
    const bytes = Buffer.from(value);
    if (bytes.byteLength === 0 || bytes.byteLength > maximum) fail(code);
    return bytes;
  } catch (error) {
    if (error instanceof Error && error.message === code) throw error;
    fail(code);
  }
}

function parseCanonicalLine(value, maximum, code) {
  const bytes = snapshotBytes(value, maximum, code);
  if (
    bytes.at(-1) !== 0x0a ||
    bytes.includes(0x0d) ||
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
  if (!Buffer.from(`${JSON.stringify(parsed)}\n`).equals(bytes)) fail(code);
  return { bytes, record };
}

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function assertSha256(value, code) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) fail(code);
}

function assertSafePath(value, code) {
  if (
    typeof value !== "string" ||
    !SAFE_LOGICAL_PATH.test(value) ||
    value.includes("//") ||
    value.endsWith("/")
  ) {
    fail(code);
  }
}

function compareExact(value, expected, code) {
  if (Array.isArray(expected)) {
    const actual = readArray(value, code);
    if (actual.length !== expected.length) fail(code);
    actual.forEach((item, index) => compareExact(item, expected[index], code));
    return;
  }
  if (expected !== null && typeof expected === "object") {
    const actual = readRecord(value, code);
    assertKeys(actual, Object.keys(expected), code);
    for (const key of Object.keys(expected)) {
      compareExact(actual[key], expected[key], code);
    }
    return;
  }
  if (!Object.is(value, expected)) fail(code);
}

function readProcessTuple(event, code) {
  if (
    !(event.code === null || Number.isSafeInteger(event.code)) ||
    !(event.signal === null || typeof event.signal === "string")
  ) {
    fail(code);
  }
  return { code: event.code, signal: event.signal };
}

// This undocumented module export is shared only by the two fixed private
// process helpers. It is intentionally absent from the declaration surface and
// package scripts; the separately branded trace below is the only test API.
export function createM2aPrivateProcessSettlementState() {
  let firstFailure = null;
  let firstExit = null;
  let firstClose = null;
  let timedOut = false;
  let stdoutTruncated = false;
  let stderrTruncated = false;
  let childClosed = false;
  let stdoutClosed = false;
  let stderrClosed = false;
  let settled = false;
  let ignoredEvents = 0;
  const ownedTimers = new Set();
  const timerClearCounts = { primary: 0, kill: 0, close: 0 };

  const recordFailure = (kind) => {
    if (firstFailure === null) firstFailure = kind;
  };
  const ownTimer = (name) => {
    if (!settled) ownedTimers.add(name);
  };
  const clearOwnedTimers = () => {
    for (const name of ownedTimers) timerClearCounts[name] += 1;
    ownedTimers.clear();
  };
  const finalize = () => {
    if (settled) return false;
    settled = true;
    clearOwnedTimers();
    return true;
  };
  const record = (eventInput) => {
    if (settled) {
      ignoredEvents += 1;
      return false;
    }
    const event = readRecord(eventInput, "M2A_PROCESS_TRACE_INVALID");
    if (typeof event.type !== "string") fail("M2A_PROCESS_TRACE_INVALID");
    if (event.type === "spawn-failure") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      recordFailure("spawn-failure");
      finalize();
    } else if (event.type === "error") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      recordFailure("error");
      ownTimer("close");
    } else if (event.type === "timeout") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      timedOut = true;
      recordFailure("timeout");
      ownTimer("kill");
      ownTimer("close");
    } else if (event.type === "overflow") {
      assertKeys(event, ["type", "stream"], "M2A_PROCESS_TRACE_INVALID");
      if (!["stdout", "stderr"].includes(event.stream)) {
        fail("M2A_PROCESS_TRACE_INVALID");
      }
      if (event.stream === "stdout") stdoutTruncated = true;
      else stderrTruncated = true;
      recordFailure(`${event.stream}-overflow`);
      ownTimer("kill");
      ownTimer("close");
    } else if (event.type === "signal-failure") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      recordFailure("signal-failure");
      ownTimer("close");
    } else if (event.type === "exit") {
      assertKeys(
        event,
        ["type", "code", "signal"],
        "M2A_PROCESS_TRACE_INVALID",
      );
      const tuple = readProcessTuple(event, "M2A_PROCESS_TRACE_INVALID");
      if (firstExit === null) {
        firstExit = tuple;
        if (tuple.code !== 0 || tuple.signal !== null) recordFailure("exit");
      } else if (
        firstExit.code !== tuple.code ||
        firstExit.signal !== tuple.signal
      ) {
        recordFailure("inconsistent-exit");
      }
      ownTimer("close");
    } else if (event.type === "close") {
      assertKeys(
        event,
        [
          "type",
          "code",
          "signal",
          "childClosed",
          "stdoutClosed",
          "stderrClosed",
        ],
        "M2A_PROCESS_TRACE_INVALID",
      );
      for (const key of ["childClosed", "stdoutClosed", "stderrClosed"]) {
        if (typeof event[key] !== "boolean") fail("M2A_PROCESS_TRACE_INVALID");
      }
      const tuple = readProcessTuple(event, "M2A_PROCESS_TRACE_INVALID");
      if (firstClose === null) firstClose = tuple;
      else if (
        firstClose.code !== tuple.code ||
        firstClose.signal !== tuple.signal
      ) {
        recordFailure("inconsistent-close");
      }
      childClosed = event.childClosed;
      stdoutClosed = event.stdoutClosed;
      stderrClosed = event.stderrClosed;
      if (firstExit === null) recordFailure("close-without-exit");
      else if (
        firstExit.code !== tuple.code ||
        firstExit.signal !== tuple.signal
      ) {
        recordFailure("inconsistent-close");
      }
      if (!(childClosed && stdoutClosed && stderrClosed)) {
        recordFailure("descriptor-uncertain");
      }
      finalize();
    } else if (event.type === "descriptor-uncertain") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      recordFailure("descriptor-uncertain");
      ownTimer("close");
    } else if (event.type === "final-bound") {
      assertKeys(event, ["type"], "M2A_PROCESS_TRACE_INVALID");
      recordFailure("final-bound");
      finalize();
    } else {
      fail("M2A_PROCESS_TRACE_INVALID");
    }
    return true;
  };
  const snapshot = () => {
    const descriptorsClosed = childClosed && stdoutClosed && stderrClosed;
    const known =
      settled &&
      [null, "exit"].includes(firstFailure) &&
      firstExit !== null &&
      firstClose !== null &&
      firstExit.code === firstClose.code &&
      firstExit.signal === firstClose.signal &&
      timedOut === false &&
      stdoutTruncated === false &&
      stderrTruncated === false &&
      descriptorsClosed;
    const successful =
      known &&
      firstFailure === null &&
      firstExit?.code === 0 &&
      firstExit.signal === null &&
      firstClose?.code === 0 &&
      firstClose.signal === null &&
      timedOut === false &&
      stdoutTruncated === false &&
      stderrTruncated === false &&
      descriptorsClosed;
    return freeze({
      firstFailure,
      firstExit: firstExit === null ? null : { ...firstExit },
      firstClose: firstClose === null ? null : { ...firstClose },
      timedOut,
      stdoutTruncated,
      stderrTruncated,
      childClosed,
      stdoutClosed,
      stderrClosed,
      descriptorsClosed,
      known,
      successful,
      settled,
      timersCleared:
        settled &&
        ownedTimers.size === 0 &&
        Object.values(timerClearCounts).every((count) => count <= 1),
      timerClearCounts: { ...timerClearCounts },
      ignoredEvents,
    });
  };
  return Object.freeze({ ownTimer, record, finalize, snapshot });
}

export function createFakeM2aProcessTrace(eventsInput = []) {
  const events = readArray(eventsInput, "M2A_PROCESS_TRACE_INVALID").map(
    (event) => ({ ...readRecord(event, "M2A_PROCESS_TRACE_INVALID") }),
  );
  const trace = freeze({ events });
  fakeProcessTraceBrand.add(trace);
  return trace;
}

export function runM2aProcessSettlementTraceForTest(trace) {
  if (!fakeProcessTraceBrand.has(trace))
    fail("M2A_PROCESS_TRACE_FAKE_REQUIRED");
  const state = createM2aPrivateProcessSettlementState();
  state.ownTimer("primary");
  for (const event of trace.events) state.record(event);
  if (!state.snapshot().settled) state.record({ type: "final-bound" });
  return state.snapshot();
}

export const M2A_CONSTRUCTION = freeze({
  generation: "20260721-01",
  expectedRevision: "m2a-transfer-expected-20260721-01",
  runId: "m2a-npm-lifecycle-20260721000000000000000000000001",
  scenarioId: "m2a-npm-lifecycle",
  sourceInputs: SOURCE_INPUTS,
  constructionInputs: CONSTRUCTION_INPUTS,
  sourceAggregate:
    "sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04",
  constructionBaselineAggregate:
    "sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526",
  acquisitionRoot:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01",
  acquisitionReceipt:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/acquisition.json",
  npmArchive:
    "experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/npm-12.0.1.tgz",
  toolchainRoot:
    "experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01",
  toolchainReceipt:
    "experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01/toolchain.json",
  constructionRoot:
    "experiments/npm12-install/.work/m2a-transfer-construction-20260721-01",
  resultRoot:
    "results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001",
  compilerSteps: COMPILER_STEPS,
  toolchainPackages: TOOLCHAIN_PACKAGES,
  reviewedAcquisitionReceiptSha256: null,
  reviewedAcquisitionTarballSha256: null,
  reviewedToolchainReceiptSha256: null,
  reviewedToolchainInventoryAggregate: null,
  reviewedConstructorSourceSha256: null,
  runtimeExecutionApproved: false,
  evidenceReview: "not-performed",
});

export function createFixedConstructionPlan() {
  return freeze({
    executable: "/usr/bin/node",
    argumentsAccepted: false,
    inheritedEnvironmentAccepted: false,
    sourceInputs: [...M2A_CONSTRUCTION.sourceInputs],
    constructionInputs: [...M2A_CONSTRUCTION.constructionInputs],
    sourceAggregate: M2A_CONSTRUCTION.sourceAggregate,
    constructionBaselineAggregate:
      M2A_CONSTRUCTION.constructionBaselineAggregate,
    prerequisites: {
      npmReceipt: M2A_CONSTRUCTION.acquisitionReceipt,
      npmArchive: M2A_CONSTRUCTION.npmArchive,
      toolchainReceipt: M2A_CONSTRUCTION.toolchainReceipt,
    },
    fixedAbsentRoots: [
      M2A_CONSTRUCTION.constructionRoot,
      M2A_CONSTRUCTION.resultRoot,
    ],
    privateCompilerWorkspace: "construction-private/compiler-workspace",
    compilerSteps: COMPILER_STEPS.map((step) => ({ ...step })),
    contextCommit: {
      stagingName: "context.next",
      publishedName: "context",
      operation: "directory-rename",
    },
    manifestCommit: {
      stagingName: "construction-manifest.next",
      publishedName: "construction-manifest.json",
      operation: "same-descriptor-write-read-sync-close-rename",
      lastFallibleOperation: true,
    },
    retry: false,
    cleanup: false,
    productionEnabled: false,
  });
}

export function validateFixedConstructionPlan(value) {
  const expected = createFixedConstructionPlan();
  compareExact(value, expected, "M2A_CONSTRUCTION_PLAN_INVALID");
  return expected;
}

export function calculateTrackedInputAggregates(rowsInput) {
  const rows = readArray(rowsInput, "M2A_TRACKED_INPUT_INVALID");
  if (rows.length !== CONSTRUCTION_INPUTS.length) {
    fail("M2A_TRACKED_INPUT_INVALID");
  }
  const digestRows = rows.map((rowInput, index) => {
    const row = readRecord(rowInput, "M2A_TRACKED_INPUT_INVALID");
    assertKeys(
      row,
      ["path", "bytes", "type", "linkCount", "descriptorSettled"],
      "M2A_TRACKED_INPUT_INVALID",
    );
    if (
      row.path !== CONSTRUCTION_INPUTS[index] ||
      row.type !== "regular" ||
      row.linkCount !== 1 ||
      row.descriptorSettled !== true
    ) {
      fail("M2A_TRACKED_INPUT_INVALID");
    }
    const bytes = snapshotBytes(
      row.bytes,
      16 * 1024 * 1024,
      "M2A_TRACKED_INPUT_INVALID",
    );
    return `${digest(bytes).slice(7)}  ${row.path}\n`;
  });
  const sourceAggregate = digest(digestRows.slice(0, 31).join(""));
  const constructionBaselineAggregate = digest(digestRows.join(""));
  if (
    sourceAggregate !== M2A_CONSTRUCTION.sourceAggregate ||
    constructionBaselineAggregate !==
      M2A_CONSTRUCTION.constructionBaselineAggregate
  ) {
    fail("M2A_TRACKED_INPUT_DRIFT");
  }
  return freeze({ sourceAggregate, constructionBaselineAggregate });
}

function parseOctal(bytes, code) {
  const text = bytes.toString("ascii").replace(/\0.*$/u, "").trim();
  if (!/^[0-7]+$/u.test(text)) fail(code);
  const value = Number.parseInt(text, 8);
  if (!Number.isSafeInteger(value) || value < 0) fail(code);
  return value;
}

function parsePax(bytes, code) {
  const fields = Object.create(null);
  let offset = 0;
  while (offset < bytes.length) {
    const space = bytes.indexOf(0x20, offset);
    if (space < 0) fail(code);
    const lengthText = bytes.subarray(offset, space).toString("ascii");
    if (!/^[1-9][0-9]*$/u.test(lengthText)) fail(code);
    const length = Number.parseInt(lengthText, 10);
    const end = offset + length;
    if (
      !Number.isSafeInteger(length) ||
      end > bytes.length ||
      bytes[end - 1] !== 0x0a
    ) {
      fail(code);
    }
    const record = bytes.subarray(space + 1, end - 1).toString("utf8");
    const separator = record.indexOf("=");
    if (separator <= 0) fail(code);
    const key = record.slice(0, separator);
    const value = record.slice(separator + 1);
    if (!["path", "size"].includes(key) || Object.hasOwn(fields, key))
      fail(code);
    fields[key] = value;
    offset = end;
  }
  return fields;
}

export function parseNpmArchive(archiveInput) {
  const compressed = snapshotBytes(
    archiveInput,
    64 * 1024 * 1024,
    "M2A_NPM_ARCHIVE_INVALID",
  );
  let archive;
  try {
    archive = gunzipSync(compressed, { maxOutputLength: 256 * 1024 * 1024 });
  } catch {
    fail("M2A_NPM_ARCHIVE_INVALID");
  }
  if (archive.length === 0 || archive.length % 512 !== 0) {
    fail("M2A_NPM_ARCHIVE_INVALID");
  }
  const entries = [];
  const names = new Set();
  let pendingPax = null;
  let zeroBlocks = 0;
  for (let offset = 0; offset < archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    offset += 512;
    if (header.every((byte) => byte === 0)) {
      zeroBlocks += 1;
      continue;
    }
    if (zeroBlocks !== 0) fail("M2A_NPM_ARCHIVE_INVALID");
    const storedChecksum = parseOctal(
      header.subarray(148, 156),
      "M2A_NPM_ARCHIVE_INVALID",
    );
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    if (
      checksumHeader.reduce((sum, byte) => sum + byte, 0) !== storedChecksum
    ) {
      fail("M2A_NPM_ARCHIVE_INVALID");
    }
    const type = String.fromCharCode(header[156] ?? 0);
    if (!["\0", "0", "5", "x"].includes(type)) fail("M2A_NPM_ARCHIVE_INVALID");
    if (header.subarray(157, 257).some((byte) => byte !== 0)) {
      fail("M2A_NPM_ARCHIVE_INVALID");
    }
    const size = parseOctal(
      header.subarray(124, 136),
      "M2A_NPM_ARCHIVE_INVALID",
    );
    if (offset + Math.ceil(size / 512) * 512 > archive.length) {
      fail("M2A_NPM_ARCHIVE_INVALID");
    }
    const content = Buffer.from(archive.subarray(offset, offset + size));
    offset += Math.ceil(size / 512) * 512;
    if (type === "x") {
      if (pendingPax !== null) fail("M2A_NPM_ARCHIVE_INVALID");
      pendingPax = parsePax(content, "M2A_NPM_ARCHIVE_INVALID");
      continue;
    }
    const prefix = header
      .subarray(345, 500)
      .toString("utf8")
      .replace(/\0.*$/u, "");
    const namePart = header
      .subarray(0, 100)
      .toString("utf8")
      .replace(/\0.*$/u, "");
    let name = prefix === "" ? namePart : `${prefix}/${namePart}`;
    if (pendingPax?.path !== undefined) name = pendingPax.path;
    const effectiveSize =
      pendingPax?.size === undefined
        ? size
        : Number.parseInt(pendingPax.size, 10);
    if (
      !Number.isSafeInteger(effectiveSize) ||
      effectiveSize !== size ||
      !name.startsWith("package/") ||
      name === "package/" ||
      names.has(name)
    ) {
      fail("M2A_NPM_ARCHIVE_INVALID");
    }
    assertSafePath(name, "M2A_NPM_ARCHIVE_INVALID");
    names.add(name);
    pendingPax = null;
    if (["\0", "0"].includes(type)) {
      entries.push(
        freeze({
          path: name.slice("package/".length),
          size,
          sha256: digest(content),
          bytes: content,
        }),
      );
    } else if (size !== 0) {
      fail("M2A_NPM_ARCHIVE_INVALID");
    }
  }
  if (zeroBlocks < 2 || pendingPax !== null || entries.length === 0) {
    fail("M2A_NPM_ARCHIVE_INVALID");
  }
  const paths = entries.map((entry) => entry.path);
  if (
    JSON.stringify(paths) !== JSON.stringify([...paths].sort()) ||
    !paths.includes("bin/npm-cli.js")
  ) {
    fail("M2A_NPM_ARCHIVE_INVALID");
  }
  return freeze(entries);
}

export function validateNpmAcquisition(
  receiptInput,
  archiveInput,
  reviewedBindingInput,
) {
  const parsed = parseCanonicalLine(
    receiptInput,
    16_384,
    "M2A_ACQUISITION_INVALID",
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
    "M2A_ACQUISITION_INVALID",
  );
  const archive = snapshotBytes(
    archiveInput,
    64 * 1024 * 1024,
    "M2A_ACQUISITION_INVALID",
  );
  const binding = readRecord(reviewedBindingInput, "M2A_ACQUISITION_INVALID");
  assertKeys(
    binding,
    ["receiptSha256", "tarballSha256", "integrity"],
    "M2A_ACQUISITION_INVALID",
  );
  [binding.receiptSha256, binding.tarballSha256].forEach((value) =>
    assertSha256(value, "M2A_ACQUISITION_INVALID"),
  );
  if (
    receipt.schemaVersion !== "m2a-transfer-acquisition/v1" ||
    receipt.generation !== M2A_CONSTRUCTION.generation ||
    receipt.packageName !== "npm" ||
    receipt.version !== "12.0.1" ||
    !Number.isSafeInteger(receipt.tarballSize) ||
    receipt.tarballSize !== archive.length ||
    receipt.tarballSha256 !== digest(archive) ||
    receipt.tarballSha256 !== binding.tarballSha256 ||
    receipt.integrity !== binding.integrity ||
    typeof receipt.integrity !== "string" ||
    !INTEGRITY_PATTERN.test(receipt.integrity) ||
    receipt.status !== "complete" ||
    receipt.scriptsRun !== false ||
    receipt.credentialsUsed !== false ||
    receipt.externalNetworkPhase !== "dependency-acquisition-only" ||
    receipt.evidenceReview !== "not-performed" ||
    digest(parsed.bytes) !== binding.receiptSha256
  ) {
    fail("M2A_ACQUISITION_INVALID");
  }
  const inventory = parseNpmArchive(archive);
  const validated = freeze({
    receiptSha256: binding.receiptSha256,
    tarballSize: archive.length,
    tarballSha256: binding.tarballSha256,
    integrity: binding.integrity,
    inventory,
  });
  validatedAcquisitionBrand.add(validated);
  return validated;
}

export function validateConstructorToolchain(
  receiptInput,
  reviewedBindingInput,
) {
  const parsed = parseCanonicalLine(
    receiptInput,
    4 * 1024 * 1024,
    "M2A_TOOLCHAIN_INVALID",
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
    "M2A_TOOLCHAIN_INVALID",
  );
  const runtime = readRecord(receipt.runtime, "M2A_TOOLCHAIN_INVALID");
  assertKeys(
    runtime,
    [
      "logicalId",
      "version",
      "platform",
      "architecture",
      "executableSize",
      "executableSha256",
      "loadedRuntimeInventoryAggregate",
    ],
    "M2A_TOOLCHAIN_INVALID",
  );
  const packages = readArray(receipt.packages, "M2A_TOOLCHAIN_INVALID");
  const normalizedPackages = packages.map((item, index) => {
    const row = readRecord(item, "M2A_TOOLCHAIN_INVALID");
    assertKeys(
      row,
      ["name", "version", "integrity", "inventoryAggregate"],
      "M2A_TOOLCHAIN_INVALID",
    );
    const expected = TOOLCHAIN_PACKAGES[index];
    if (
      expected === undefined ||
      row.name !== expected.name ||
      row.version !== expected.version ||
      row.integrity !== expected.integrity
    ) {
      fail("M2A_TOOLCHAIN_INVALID");
    }
    assertSha256(row.inventoryAggregate, "M2A_TOOLCHAIN_INVALID");
    return { ...row };
  });
  if (normalizedPackages.length !== TOOLCHAIN_PACKAGES.length) {
    fail("M2A_TOOLCHAIN_INVALID");
  }
  const inventory = readArray(receipt.inventory, "M2A_TOOLCHAIN_INVALID");
  const normalizedInventory = inventory.map((item) => {
    const row = readRecord(item, "M2A_TOOLCHAIN_INVALID");
    assertKeys(
      row,
      ["logicalPath", "mode", "size", "sha256"],
      "M2A_TOOLCHAIN_INVALID",
    );
    assertSafePath(row.logicalPath, "M2A_TOOLCHAIN_INVALID");
    const isConstructorNode = row.logicalPath === "runtime/constructor-node";
    const isCopiedRuntime =
      row.logicalPath.startsWith("runtime/") && !isConstructorNode;
    const isPackage = row.logicalPath.startsWith("packages/");
    if (
      (isConstructorNode && row.mode !== 0o555) ||
      (isCopiedRuntime && row.mode !== 0o444) ||
      (isPackage && row.mode !== 0o444) ||
      !Number.isSafeInteger(row.size) ||
      row.size < 0 ||
      (isPackage && row.size === 0)
    ) {
      fail("M2A_TOOLCHAIN_INVALID");
    }
    assertSha256(row.sha256, "M2A_TOOLCHAIN_INVALID");
    return { ...row };
  });
  const inventoryPaths = normalizedInventory.map((row) => row.logicalPath);
  const aggregate = digest(JSON.stringify(normalizedInventory));
  const runtimeRows = normalizedInventory.filter((row) =>
    row.logicalPath.startsWith("runtime/"),
  );
  const packagePrefixes = [
    "packages/typescript/",
    "packages/@types/node/",
    "packages/undici-types/",
  ];
  const packageRows = packagePrefixes.map((prefix) =>
    normalizedInventory.filter((row) => row.logicalPath.startsWith(prefix)),
  );
  const familyCounts = normalizedInventory.map(
    (row) =>
      Number(row.logicalPath.startsWith("runtime/")) +
      packagePrefixes.filter((prefix) => row.logicalPath.startsWith(prefix))
        .length,
  );
  const binding = readRecord(reviewedBindingInput, "M2A_TOOLCHAIN_INVALID");
  assertKeys(
    binding,
    ["receiptSha256", "inventoryAggregate"],
    "M2A_TOOLCHAIN_INVALID",
  );
  [
    runtime.executableSha256,
    runtime.loadedRuntimeInventoryAggregate,
    receipt.inventoryAggregate,
    binding.receiptSha256,
    binding.inventoryAggregate,
  ].forEach((value) => assertSha256(value, "M2A_TOOLCHAIN_INVALID"));
  if (
    receipt.schemaVersion !== "m2a-transfer-toolchain/v1" ||
    receipt.generation !== M2A_CONSTRUCTION.generation ||
    runtime.logicalId !== "constructor-node" ||
    runtime.version !== "v20.18.2" ||
    runtime.platform !== "linux" ||
    runtime.architecture !== "x64" ||
    !Number.isSafeInteger(runtime.executableSize) ||
    runtime.executableSize <= 0 ||
    inventoryPaths.length === 0 ||
    familyCounts.some((count) => count !== 1) ||
    runtimeRows.length === 0 ||
    packageRows.some((rows) => rows.length === 0) ||
    runtime.loadedRuntimeInventoryAggregate !==
      digest(JSON.stringify(runtimeRows)) ||
    normalizedPackages.some(
      (item, index) =>
        item.inventoryAggregate !== digest(JSON.stringify(packageRows[index])),
    ) ||
    !runtimeRows.some(
      (row) =>
        row.logicalPath === "runtime/constructor-node" &&
        row.size === runtime.executableSize &&
        row.sha256 === runtime.executableSha256,
    ) ||
    JSON.stringify(inventoryPaths) !==
      JSON.stringify([...inventoryPaths].sort()) ||
    new Set(inventoryPaths).size !== inventoryPaths.length ||
    receipt.inventoryAggregate !== aggregate ||
    receipt.inventoryAggregate !== binding.inventoryAggregate ||
    digest(parsed.bytes) !== binding.receiptSha256 ||
    receipt.status !== "complete" ||
    receipt.evidenceReview !== "not-performed"
  ) {
    fail("M2A_TOOLCHAIN_INVALID");
  }
  return freeze({
    receiptSha256: binding.receiptSha256,
    runtimeSha256: runtime.executableSha256,
    inventoryAggregate: aggregate,
    packages: normalizedPackages,
    inventory: normalizedInventory,
  });
}

const FIXED_CONTEXT_INPUTS = Object.freeze([
  Object.freeze({
    sourcePath: "experiments/npm12-install/Containerfile.m2a-transfer",
    destinationPath: "Containerfile.m2a-transfer",
  }),
  Object.freeze({
    sourcePath: "experiments/npm12-install/container/initialize-m2a-volume.mjs",
    destinationPath: "container/initialize-m2a-volume.mjs",
  }),
  Object.freeze({
    sourcePath: "experiments/npm12-install/container/run-m2a-transfer.mjs",
    destinationPath: "container/run-m2a-transfer.mjs",
  }),
  Object.freeze({
    sourcePath: "packages/probe-core/package.json",
    destinationPath: "m2a-context/probe-core/package.json",
  }),
  Object.freeze({
    sourcePath: "packages/npm-lifecycle-probe/package.json",
    destinationPath: "m2a-context/npm-lifecycle-probe/package.json",
  }),
  Object.freeze({
    sourcePath: "packages/npm-lifecycle-probe/fixture/consumer/package.json",
    destinationPath: "m2a-context/consumer/package.json",
  }),
  Object.freeze({
    sourcePath: "packages/npm-lifecycle-probe/fixture/dependency/package.json",
    destinationPath: null,
  }),
]);

function validateSettledCompilerOutput(value, code) {
  const result = readRecord(value, code);
  assertKeys(result, ["terminal", "inventory"], code);
  const terminal = readRecord(result.terminal, code);
  assertKeys(
    terminal,
    [
      "exitCode",
      "signal",
      "timedOut",
      "stdoutTruncated",
      "stderrTruncated",
      "childClosed",
      "stdoutClosed",
      "stderrClosed",
      "descriptorsClosed",
    ],
    code,
  );
  if (
    terminal.exitCode !== 0 ||
    terminal.signal !== null ||
    terminal.timedOut !== false ||
    terminal.stdoutTruncated !== false ||
    terminal.stderrTruncated !== false ||
    terminal.childClosed !== true ||
    terminal.stdoutClosed !== true ||
    terminal.stderrClosed !== true ||
    terminal.descriptorsClosed !== true
  ) {
    fail(code);
  }
  const inventory = readArray(result.inventory, code).map((item) => {
    const row = readRecord(item, code);
    assertKeys(
      row,
      ["path", "bytes", "type", "linkCount", "sparse", "descriptorSettled"],
      code,
    );
    assertSafePath(row.path, code);
    if (
      !row.path.endsWith(".js") ||
      row.type !== "regular" ||
      row.linkCount !== 1 ||
      row.sparse !== false ||
      row.descriptorSettled !== true
    ) {
      fail(code);
    }
    const bytes = snapshotBytes(row.bytes, 16 * 1024 * 1024, code);
    return { path: row.path, bytes };
  });
  const paths = inventory.map((row) => row.path);
  if (
    inventory.length === 0 ||
    JSON.stringify(paths) !== JSON.stringify([...paths].sort()) ||
    new Set(paths).size !== paths.length
  ) {
    fail(code);
  }
  return inventory;
}

function regularContextRow(destinationPath, bytes) {
  return {
    path: destinationPath,
    type: "regular",
    mode: destinationPath === "m2a-context/npm-cli.js" ? 0o555 : 0o444,
    size: bytes.length,
    sha256: digest(bytes),
    mtimeNs: "0",
  };
}

function deriveCompleteContextInventory(
  npmInventory,
  probeCoreCompilerInventory,
  lifecycleCompilerInventory,
  fixedInputs,
) {
  const rows = [];
  const addRegular = (destinationPath, bytesInput) => {
    const bytes = snapshotBytes(
      bytesInput,
      64 * 1024 * 1024,
      "M2A_CONTEXT_CORRELATION_INVALID",
    );
    rows.push(regularContextRow(destinationPath, bytes));
  };
  fixedInputs.forEach((row, index) => {
    const definition = FIXED_CONTEXT_INPUTS[index];
    if (definition?.destinationPath !== null) {
      addRegular(definition.destinationPath, row.bytes);
    }
  });
  npmInventory.forEach((row) =>
    addRegular(`m2a-context/npm/${row.path}`, row.bytes),
  );
  const npmCli = npmInventory.find((row) => row.path === "bin/npm-cli.js");
  if (npmCli === undefined) fail("M2A_CONTEXT_CORRELATION_INVALID");
  addRegular("m2a-context/npm-cli.js", npmCli.bytes);
  probeCoreCompilerInventory.forEach((row) =>
    addRegular(`m2a-context/probe-core/dist/${row.path}`, row.bytes),
  );
  lifecycleCompilerInventory.forEach((row) =>
    addRegular(`m2a-context/npm-lifecycle-probe/dist/${row.path}`, row.bytes),
  );
  const fixtureInput = fixedInputs.at(-1);
  if (fixtureInput === undefined) fail("M2A_CONTEXT_CORRELATION_INVALID");
  addRegular(
    "m2a-context/m2a-install-probe-1.0.0.tgz",
    createDeterministicFixtureArchive(fixtureInput.bytes),
  );
  const directories = new Set();
  for (const row of rows) {
    let parent = path.posix.dirname(row.path);
    while (parent !== ".") {
      directories.add(parent);
      parent = path.posix.dirname(parent);
    }
  }
  for (const directory of directories) {
    rows.push({
      path: directory,
      type: "directory",
      mode: 0o555,
      size: null,
      sha256: null,
      mtimeNs: "0",
    });
  }
  rows.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  const paths = rows.map((row) => row.path);
  if (new Set(paths).size !== paths.length) {
    fail("M2A_CONTEXT_CORRELATION_INVALID");
  }
  return rows;
}

export function validateConstructionContextInputs(value) {
  const input = readRecord(value, "M2A_CONTEXT_CORRELATION_INVALID");
  assertKeys(
    input,
    [
      "npmAcquisition",
      "probeCoreCompiler",
      "lifecycleCompiler",
      "fixedInputs",
      "heldContextInventory",
    ],
    "M2A_CONTEXT_CORRELATION_INVALID",
  );
  if (!validatedAcquisitionBrand.has(input.npmAcquisition)) {
    fail("M2A_CONTEXT_CORRELATION_INVALID");
  }
  const npmInventory = input.npmAcquisition.inventory.map((row) => ({
    path: row.path,
    bytes: snapshotBytes(
      row.bytes,
      64 * 1024 * 1024,
      "M2A_CONTEXT_CORRELATION_INVALID",
    ),
  }));
  const probeCoreCompilerInventory = validateSettledCompilerOutput(
    input.probeCoreCompiler,
    "M2A_CONTEXT_CORRELATION_INVALID",
  );
  const lifecycleCompilerInventory = validateSettledCompilerOutput(
    input.lifecycleCompiler,
    "M2A_CONTEXT_CORRELATION_INVALID",
  );
  const fixedInputs = readArray(
    input.fixedInputs,
    "M2A_CONTEXT_CORRELATION_INVALID",
  ).map((item, index) => {
    const row = readRecord(item, "M2A_CONTEXT_CORRELATION_INVALID");
    assertKeys(
      row,
      [
        "sourcePath",
        "bytes",
        "type",
        "linkCount",
        "sparse",
        "descriptorSettled",
      ],
      "M2A_CONTEXT_CORRELATION_INVALID",
    );
    const expected = FIXED_CONTEXT_INPUTS[index];
    if (
      expected === undefined ||
      row.sourcePath !== expected.sourcePath ||
      row.type !== "regular" ||
      row.linkCount !== 1 ||
      row.sparse !== false ||
      row.descriptorSettled !== true
    ) {
      fail("M2A_CONTEXT_CORRELATION_INVALID");
    }
    return {
      sourcePath: row.sourcePath,
      bytes: snapshotBytes(
        row.bytes,
        16 * 1024 * 1024,
        "M2A_CONTEXT_CORRELATION_INVALID",
      ),
    };
  });
  if (fixedInputs.length !== FIXED_CONTEXT_INPUTS.length) {
    fail("M2A_CONTEXT_CORRELATION_INVALID");
  }
  const expectedInventory = deriveCompleteContextInventory(
    npmInventory,
    probeCoreCompilerInventory,
    lifecycleCompilerInventory,
    fixedInputs,
  );
  const secondDerivedInventory = deriveCompleteContextInventory(
    npmInventory.map((row) => ({
      path: row.path,
      bytes: Buffer.from(row.bytes),
    })),
    probeCoreCompilerInventory.map((row) => ({
      path: row.path,
      bytes: Buffer.from(row.bytes),
    })),
    lifecycleCompilerInventory.map((row) => ({
      path: row.path,
      bytes: Buffer.from(row.bytes),
    })),
    fixedInputs.map((row) => ({
      sourcePath: row.sourcePath,
      bytes: Buffer.from(row.bytes),
    })),
  );
  compareExact(
    secondDerivedInventory,
    expectedInventory,
    "M2A_CONTEXT_CORRELATION_INVALID",
  );
  const heldInventory = readArray(
    input.heldContextInventory,
    "M2A_CONTEXT_CORRELATION_INVALID",
  ).map((item) => {
    const row = readRecord(item, "M2A_CONTEXT_CORRELATION_INVALID");
    assertKeys(
      row,
      [
        "path",
        "type",
        "mode",
        "size",
        "sha256",
        "mtimeNs",
        "linkCount",
        "sparse",
        "descriptorSettled",
      ],
      "M2A_CONTEXT_CORRELATION_INVALID",
    );
    if (
      row.linkCount !== (row.type === "regular" ? 1 : null) ||
      row.sparse !== false ||
      row.descriptorSettled !== true
    ) {
      fail("M2A_CONTEXT_CORRELATION_INVALID");
    }
    const projected = {
      path: row.path,
      type: row.type,
      mode: row.mode,
      size: row.size,
      sha256: row.sha256,
      mtimeNs: row.mtimeNs,
    };
    assertContextPath(projected.path, "M2A_CONTEXT_CORRELATION_INVALID");
    return projected;
  });
  compareExact(
    heldInventory,
    expectedInventory,
    "M2A_CONTEXT_CORRELATION_INVALID",
  );
  const correlation = freeze({
    contextInventory: expectedInventory,
    contextAggregate: digest(JSON.stringify(expectedInventory)),
  });
  constructionCorrelationBrand.add(correlation);
  return correlation;
}

function assertContextPath(value, code) {
  assertSafePath(value, code);
  const accepted =
    value === "Containerfile.m2a-transfer" ||
    value === "container" ||
    value === "container/initialize-m2a-volume.mjs" ||
    value === "container/run-m2a-transfer.mjs" ||
    value === "m2a-context" ||
    value === "m2a-context/npm" ||
    value.startsWith("m2a-context/npm/") ||
    value === "m2a-context/npm-cli.js" ||
    value === "m2a-context/probe-core" ||
    value === "m2a-context/probe-core/package.json" ||
    value === "m2a-context/probe-core/dist" ||
    value.startsWith("m2a-context/probe-core/dist/") ||
    value === "m2a-context/npm-lifecycle-probe" ||
    value === "m2a-context/npm-lifecycle-probe/package.json" ||
    value === "m2a-context/npm-lifecycle-probe/dist" ||
    value.startsWith("m2a-context/npm-lifecycle-probe/dist/") ||
    value === "m2a-context/consumer" ||
    value === "m2a-context/consumer/package.json" ||
    value === "m2a-context/m2a-install-probe-1.0.0.tgz";
  if (!accepted) fail(code);
}

export function validateConstructionManifestBytes(
  value,
  bindingsInput,
  correlationInput,
) {
  const parsed = parseCanonicalLine(
    value,
    4 * 1024 * 1024,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const manifest = parsed.record;
  assertKeys(
    manifest,
    [
      "schemaVersion",
      "generation",
      "expectedRevision",
      "runId",
      "scenarioId",
      "trackedInputs",
      "npmAcquisition",
      "constructorToolchain",
      "constructor",
      "contextInventory",
      "contextAggregate",
    ],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const bindings = readRecord(
    bindingsInput,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  if (!constructionCorrelationBrand.has(correlationInput)) {
    fail("M2A_CONSTRUCTION_MANIFEST_INVALID");
  }
  assertKeys(
    bindings,
    [
      "npmReceiptSha256",
      "npmTarballSha256",
      "npmIntegrity",
      "toolchainReceiptSha256",
      "toolchainRuntimeSha256",
      "toolchainInventoryAggregate",
      "constructorSourceSha256",
    ],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  for (const [key, item] of Object.entries(bindings)) {
    if (key === "npmIntegrity") {
      if (typeof item !== "string" || !INTEGRITY_PATTERN.test(item)) {
        fail("M2A_CONSTRUCTION_MANIFEST_INVALID");
      }
    } else {
      assertSha256(item, "M2A_CONSTRUCTION_MANIFEST_INVALID");
    }
  }
  const tracked = readRecord(
    manifest.trackedInputs,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  assertKeys(
    tracked,
    ["sourceAggregate", "constructionBaselineAggregate"],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const acquisition = readRecord(
    manifest.npmAcquisition,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  assertKeys(
    acquisition,
    ["receiptSha256", "tarballSize", "tarballSha256", "integrity"],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const toolchain = readRecord(
    manifest.constructorToolchain,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  assertKeys(
    toolchain,
    ["receiptSha256", "runtimeSha256", "inventoryAggregate"],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const constructor = readRecord(
    manifest.constructor,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  assertKeys(
    constructor,
    ["sourceSha256", "compilerSteps"],
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const compilerRows = readArray(
    constructor.compilerSteps,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const expectedCompilerRows = COMPILER_STEPS.map((step) => ({
    stepId: step.stepId,
    executableLogicalId: step.executableLogicalId,
    argvLogicalId: step.argvLogicalId,
    cwdLogicalId: step.cwdLogicalId,
    environmentKeys: [],
    deadlineMs: step.deadlineMs,
    combinedOutputLimitBytes: step.combinedOutputLimitBytes,
    termToKillGraceMs: step.termToKillGraceMs,
    closeDeadlineMs: step.closeDeadlineMs,
  }));
  compareExact(
    compilerRows,
    expectedCompilerRows,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const inventory = readArray(
    manifest.contextInventory,
    "M2A_CONSTRUCTION_MANIFEST_INVALID",
  );
  const normalizedInventory = inventory.map((item) => {
    const row = readRecord(item, "M2A_CONSTRUCTION_MANIFEST_INVALID");
    assertKeys(
      row,
      ["path", "type", "mode", "size", "sha256", "mtimeNs"],
      "M2A_CONSTRUCTION_MANIFEST_INVALID",
    );
    assertContextPath(row.path, "M2A_CONSTRUCTION_MANIFEST_INVALID");
    if (
      row.mtimeNs !== "0" ||
      (row.type === "directory"
        ? row.mode !== 0o555 || row.size !== null || row.sha256 !== null
        : row.type !== "regular" ||
          row.mode !==
            (row.path === "m2a-context/npm-cli.js" ? 0o555 : 0o444) ||
          !Number.isSafeInteger(row.size) ||
          row.size < 0 ||
          typeof row.sha256 !== "string" ||
          !SHA256_PATTERN.test(row.sha256))
    ) {
      fail("M2A_CONSTRUCTION_MANIFEST_INVALID");
    }
    return { ...row };
  });
  const paths = normalizedInventory.map((row) => row.path);
  if (
    normalizedInventory.length === 0 ||
    JSON.stringify(paths) !== JSON.stringify([...paths].sort()) ||
    new Set(paths).size !== paths.length ||
    REQUIRED_CONTEXT_PATHS.some((required) => !paths.includes(required)) ||
    manifest.contextAggregate !== digest(JSON.stringify(normalizedInventory)) ||
    manifest.contextAggregate !== correlationInput.contextAggregate ||
    JSON.stringify(normalizedInventory) !==
      JSON.stringify(correlationInput.contextInventory) ||
    manifest.schemaVersion !== "m2a-transfer-construction/v1" ||
    manifest.generation !== M2A_CONSTRUCTION.generation ||
    manifest.expectedRevision !== M2A_CONSTRUCTION.expectedRevision ||
    manifest.runId !== M2A_CONSTRUCTION.runId ||
    manifest.scenarioId !== M2A_CONSTRUCTION.scenarioId ||
    tracked.sourceAggregate !== M2A_CONSTRUCTION.sourceAggregate ||
    tracked.constructionBaselineAggregate !==
      M2A_CONSTRUCTION.constructionBaselineAggregate ||
    acquisition.receiptSha256 !== bindings.npmReceiptSha256 ||
    acquisition.tarballSha256 !== bindings.npmTarballSha256 ||
    acquisition.integrity !== bindings.npmIntegrity ||
    !Number.isSafeInteger(acquisition.tarballSize) ||
    acquisition.tarballSize <= 0 ||
    toolchain.receiptSha256 !== bindings.toolchainReceiptSha256 ||
    toolchain.runtimeSha256 !== bindings.toolchainRuntimeSha256 ||
    toolchain.inventoryAggregate !== bindings.toolchainInventoryAggregate ||
    constructor.sourceSha256 !== bindings.constructorSourceSha256
  ) {
    fail("M2A_CONSTRUCTION_MANIFEST_INVALID");
  }
  return freeze({
    bytes: Buffer.from(parsed.bytes),
    manifest,
    manifestSha256: digest(parsed.bytes),
  });
}

function writeOctal(header, offset, width, value) {
  const text = value.toString(8).padStart(width - 1, "0");
  header.write(text, offset, width - 1, "ascii");
  header[offset + width - 1] = 0;
}

function tarHeader(name, size) {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100, "utf8");
  writeOctal(header, 100, 8, 0o444);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  header.write("root", 265, 4, "ascii");
  header.write("root", 297, 4, "ascii");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  const checksumText = checksum.toString(8).padStart(6, "0");
  header.write(checksumText, 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

export function createDeterministicFixtureArchive(packageJsonInput) {
  const packageJson = snapshotBytes(
    packageJsonInput,
    16_384,
    "M2A_FIXTURE_ARCHIVE_INVALID",
  );
  let parsed;
  try {
    parsed = JSON.parse(packageJson.toString("utf8"));
  } catch {
    fail("M2A_FIXTURE_ARCHIVE_INVALID");
  }
  const canonical = Buffer.from(`${JSON.stringify(parsed)}\n`);
  if (!canonical.equals(packageJson)) fail("M2A_FIXTURE_ARCHIVE_INVALID");
  const padding = Buffer.alloc((512 - (packageJson.length % 512)) % 512);
  const tar = Buffer.concat([
    tarHeader("package/package.json", packageJson.length),
    packageJson,
    padding,
    Buffer.alloc(1_024),
  ]);
  return gzipSync(tar, { level: 9, mtime: 0 });
}

export function createSyntheticNpmArchiveForTest(entriesInput) {
  const entries = readArray(entriesInput, "M2A_SYNTHETIC_ARCHIVE_INVALID");
  const normalized = entries.map((item) => {
    const row = readRecord(item, "M2A_SYNTHETIC_ARCHIVE_INVALID");
    assertKeys(row, ["path", "bytes"], "M2A_SYNTHETIC_ARCHIVE_INVALID");
    assertSafePath(row.path, "M2A_SYNTHETIC_ARCHIVE_INVALID");
    if (row.path.length > 92) fail("M2A_SYNTHETIC_ARCHIVE_INVALID");
    return {
      path: row.path,
      bytes: snapshotBytes(
        row.bytes,
        4 * 1024 * 1024,
        "M2A_SYNTHETIC_ARCHIVE_INVALID",
      ),
    };
  });
  const paths = normalized.map((entry) => entry.path);
  if (
    normalized.length === 0 ||
    JSON.stringify(paths) !== JSON.stringify([...paths].sort()) ||
    new Set(paths).size !== paths.length ||
    !paths.includes("bin/npm-cli.js")
  ) {
    fail("M2A_SYNTHETIC_ARCHIVE_INVALID");
  }
  const parts = [];
  for (const entry of normalized) {
    parts.push(tarHeader(`package/${entry.path}`, entry.bytes.length));
    parts.push(entry.bytes);
    parts.push(Buffer.alloc((512 - (entry.bytes.length % 512)) % 512));
  }
  parts.push(Buffer.alloc(1_024));
  return gzipSync(Buffer.concat(parts), { level: 9, mtime: 0 });
}

export function createFakeM2aConstructionBackend(overridesInput = {}) {
  const overrides = readRecord(overridesInput, "M2A_CONSTRUCTION_FAKE_INVALID");
  if (Object.keys(overrides).some((key) => !CONSTRUCTION_STEPS.includes(key))) {
    fail("M2A_CONSTRUCTION_FAKE_INVALID");
  }
  const backend = {
    async perform(step) {
      if (!CONSTRUCTION_STEPS.includes(step)) {
        fail("M2A_CONSTRUCTION_FAKE_INVALID");
      }
      const value = Object.hasOwn(overrides, step)
        ? overrides[step]
        : { settlement: "settled", ok: true };
      const record = readRecord(value, "M2A_CONSTRUCTION_FAKE_INVALID");
      assertKeys(record, ["settlement", "ok"], "M2A_CONSTRUCTION_FAKE_INVALID");
      if (
        !["settled", "unknown"].includes(record.settlement) ||
        typeof record.ok !== "boolean" ||
        (record.settlement === "unknown" && record.ok !== false)
      ) {
        fail("M2A_CONSTRUCTION_FAKE_INVALID");
      }
      return freeze({ ...record });
    },
  };
  fakeConstructionBackendBrand.add(backend);
  return freeze(backend);
}

export async function runM2aConstructionForTest(backend) {
  if (!fakeConstructionBackendBrand.has(backend)) {
    fail("M2A_CONSTRUCTION_FAKE_REQUIRED");
  }
  const performed = [];
  let outputStarted = false;
  let contextPublished = false;
  let manifestPublished = false;
  let status = "complete";
  let issue = null;
  for (const step of CONSTRUCTION_STEPS) {
    const result = await backend.perform(step);
    performed.push(step);
    if (step === "assert-fixed-roots-absent") outputStarted = true;
    if (result.settlement === "unknown" || result.ok !== true) {
      status = "inconclusive";
      issue =
        result.settlement === "unknown"
          ? "M2A_CONSTRUCTION_SETTLEMENT_UNKNOWN"
          : "M2A_CONSTRUCTION_STEP_FAILED";
      break;
    }
    if (step === "publish-context") contextPublished = true;
    if (step === "publish-manifest") manifestPublished = true;
  }
  if (!manifestPublished) status = "inconclusive";
  return freeze({
    status,
    issue,
    performed,
    outputStarted,
    contextPublished,
    manifestPublished,
    retained: outputStarted,
    retry: false,
    cleanup: false,
    evidenceReview: "not-performed",
  });
}

function createHeldConstructionInputRegistry() {
  const owned = [];
  let settled = false;
  const hold = async (target, maximum, expected = {}) => {
    if (settled) fail("M2A_CONSTRUCTION_INPUT_INVALID");
    const handle = await open(
      target,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const entry = { handle, target, identity: null };
    owned.push(entry);
    const before = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.nlink !== 1n ||
      bytes.length === 0 ||
      bytes.length > maximum ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      BigInt(bytes.length) !== after.size ||
      (expected.mode !== undefined &&
        Number(after.mode & 0o777n) !== expected.mode) ||
      (expected.size !== undefined && bytes.length !== expected.size) ||
      (expected.sha256 !== undefined && digest(bytes) !== expected.sha256)
    ) {
      fail("M2A_CONSTRUCTION_INPUT_INVALID");
    }
    entry.identity = {
      dev: after.dev,
      ino: after.ino,
      size: after.size,
      mtimeNs: after.mtimeNs,
      mode: after.mode & 0o777n,
      uid: after.uid,
      gid: after.gid,
      nlink: after.nlink,
    };
    return Buffer.from(bytes);
  };
  const settle = async () => {
    if (settled) return;
    settled = true;
    let identityFailed = false;
    for (const entry of owned) {
      try {
        const after = await entry.handle.stat({ bigint: true });
        const expected = entry.identity;
        if (
          expected === null ||
          !after.isFile() ||
          after.dev !== expected.dev ||
          after.ino !== expected.ino ||
          after.size !== expected.size ||
          after.mtimeNs !== expected.mtimeNs ||
          (after.mode & 0o777n) !== expected.mode ||
          after.uid !== expected.uid ||
          after.gid !== expected.gid ||
          after.nlink !== expected.nlink
        ) {
          identityFailed = true;
        }
      } catch {
        identityFailed = true;
      }
    }
    const closeResults = await Promise.allSettled(
      owned.map((entry) => entry.handle.close()),
    );
    if (
      identityFailed ||
      closeResults.some((result) => result.status === "rejected")
    ) {
      fail("M2A_CONSTRUCTION_INPUT_SETTLEMENT_UNKNOWN");
    }
  };
  return freeze({ hold, settle });
}

async function readFixedTrackedRows(registry) {
  const rows = [];
  for (const inputPath of CONSTRUCTION_INPUTS) {
    const bytes = await registry.hold(
      path.join(REPOSITORY_ROOT, inputPath),
      16 * 1024 * 1024,
    );
    rows.push({
      path: inputPath,
      bytes,
      type: "regular",
      linkCount: 1,
      descriptorSettled: true,
    });
  }
  return rows;
}

function fixedRepositoryPath(relativePath, code) {
  const resolved = path.resolve(REPOSITORY_ROOT, relativePath);
  if (
    resolved === REPOSITORY_ROOT ||
    !resolved.startsWith(`${REPOSITORY_ROOT}${path.sep}`)
  ) {
    fail(code);
  }
  return resolved;
}

async function assertFixedPathAbsent(relativePath) {
  try {
    await lstat(
      fixedRepositoryPath(relativePath, "M2A_CONSTRUCTION_PATH_INVALID"),
    );
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  fail("M2A_CONSTRUCTION_ROOT_PRESENT");
}

async function readFixedRegularFile(relativePath, maximum) {
  const handle = await open(
    fixedRepositoryPath(relativePath, "M2A_CONSTRUCTION_PATH_INVALID"),
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n) {
      fail("M2A_CONSTRUCTION_INPUT_INVALID");
    }
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      bytes.length > maximum ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      BigInt(bytes.length) !== after.size
    ) {
      fail("M2A_CONSTRUCTION_INPUT_INVALID");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

async function writeExclusiveFile(target, bytesInput, mode) {
  if (
    !types.isUint8Array(bytesInput) ||
    types.isProxy(bytesInput) ||
    types.isSharedArrayBuffer(bytesInput.buffer) ||
    ![Uint8Array.prototype, Buffer.prototype].includes(
      Object.getPrototypeOf(bytesInput),
    ) ||
    bytesInput.length > 64 * 1024 * 1024
  ) {
    fail("M2A_CONSTRUCTION_OUTPUT_INVALID");
  }
  const bytes = Buffer.from(bytesInput);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const handle = await open(
    target,
    constants.O_CREAT |
      constants.O_EXCL |
      constants.O_RDWR |
      constants.O_NOFOLLOW,
    mode,
  );
  try {
    await handle.writeFile(bytes);
    await handle.sync();
    const reread = Buffer.alloc(bytes.length);
    const result = await handle.read(reread, 0, reread.length, 0);
    if (result.bytesRead !== bytes.length || !reread.equals(bytes)) {
      fail("M2A_CONSTRUCTION_OUTPUT_INVALID");
    }
    await handle.chmod(mode);
    await handle.utimes(0, 0);
  } finally {
    await handle.close();
  }
}

async function runFixedCompiler(step, workspace) {
  return await new Promise((resolve) => {
    const state = createM2aPrivateProcessSettlementState();
    let child;
    try {
      child = spawn(step.executable, step.argv, {
        cwd: workspace,
        env: {},
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      state.record({ type: "spawn-failure" });
      const summary = state.snapshot();
      resolve({
        exitCode: summary.firstExit?.code ?? null,
        signal: summary.firstExit?.signal ?? null,
        timedOut: summary.timedOut,
        stdoutTruncated: summary.stdoutTruncated,
        stderrTruncated: summary.stderrTruncated,
        childClosed: summary.childClosed,
        stdoutClosed: summary.stdoutClosed,
        stderrClosed: summary.stderrClosed,
        descriptorsClosed: summary.descriptorsClosed,
        processSuccessful: summary.successful,
        firstFailure: summary.firstFailure,
      });
      return;
    }
    let outputBytes = 0;
    let finished = false;
    let terminationStarted = false;
    let deadline = null;
    let killDeadline = null;
    let closeDeadline = null;
    const clearTimers = () => {
      if (deadline !== null) clearTimeout(deadline);
      if (killDeadline !== null) clearTimeout(killDeadline);
      if (closeDeadline !== null) clearTimeout(closeDeadline);
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      if (!state.snapshot().settled) state.finalize();
      clearTimers();
      const summary = state.snapshot();
      resolve({
        exitCode: summary.firstExit?.code ?? null,
        signal: summary.firstExit?.signal ?? null,
        timedOut: summary.timedOut,
        stdoutTruncated: summary.stdoutTruncated,
        stderrTruncated: summary.stderrTruncated,
        childClosed: summary.childClosed,
        stdoutClosed: summary.stdoutClosed,
        stderrClosed: summary.stderrClosed,
        descriptorsClosed: summary.descriptorsClosed,
        processSuccessful: summary.successful,
        firstFailure: summary.firstFailure,
      });
    };
    const startFinalCloseBound = () => {
      if (finished || closeDeadline !== null) return;
      state.ownTimer("close");
      closeDeadline = setTimeout(() => {
        state.record({ type: "final-bound" });
        finish();
      }, step.closeDeadlineMs);
      closeDeadline.unref();
    };
    const signalChild = (signal) => {
      if (finished) return;
      try {
        if (child.kill(signal) !== true) {
          state.record({ type: "signal-failure" });
        }
      } catch {
        state.record({ type: "signal-failure" });
        startFinalCloseBound();
      }
    };
    const beginTermination = () => {
      if (finished || terminationStarted) return;
      terminationStarted = true;
      signalChild("SIGTERM");
      if (killDeadline === null) {
        state.ownTimer("kill");
        killDeadline = setTimeout(
          () => signalChild("SIGKILL"),
          step.termToKillGraceMs,
        );
        killDeadline.unref();
      }
      startFinalCloseBound();
    };
    const consume = (kind) => (chunk) => {
      if (finished) return;
      outputBytes += chunk.length;
      if (outputBytes > step.combinedOutputLimitBytes) {
        state.record({ type: "overflow", stream: kind });
        beginTermination();
      }
    };
    child.stdout.on("data", consume("stdout"));
    child.stderr.on("data", consume("stderr"));
    state.ownTimer("primary");
    deadline = setTimeout(() => {
      state.record({ type: "timeout" });
      beginTermination();
    }, step.deadlineMs);
    deadline.unref();
    child.once("error", () => {
      state.record({ type: "error" });
      startFinalCloseBound();
    });
    child.once("exit", (code, signal) => {
      state.record({ type: "exit", code, signal });
      startFinalCloseBound();
    });
    child.once("close", (code, signal) => {
      state.record({
        type: "close",
        code,
        signal,
        childClosed: true,
        stdoutClosed: child.stdout.closed,
        stderrClosed: child.stderr.closed,
      });
      finish();
    });
  });
}

function assertSuccessfulFixedCompilerTerminal(terminalInput) {
  const terminal = readRecord(terminalInput, "M2A_COMPILER_SETTLEMENT_INVALID");
  assertKeys(
    terminal,
    [
      "exitCode",
      "signal",
      "timedOut",
      "stdoutTruncated",
      "stderrTruncated",
      "childClosed",
      "stdoutClosed",
      "stderrClosed",
      "descriptorsClosed",
      "processSuccessful",
      "firstFailure",
    ],
    "M2A_COMPILER_SETTLEMENT_INVALID",
  );
  if (
    terminal.exitCode !== 0 ||
    terminal.signal !== null ||
    terminal.timedOut !== false ||
    terminal.stdoutTruncated !== false ||
    terminal.stderrTruncated !== false ||
    terminal.childClosed !== true ||
    terminal.stdoutClosed !== true ||
    terminal.stderrClosed !== true ||
    terminal.descriptorsClosed !== true ||
    terminal.processSuccessful !== true ||
    terminal.firstFailure !== null
  ) {
    fail("M2A_COMPILER_SETTLEMENT_INVALID");
  }
}

async function readCompilerInventory(root) {
  const output = [];
  const visit = async (current, prefix) => {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      const logicalPath =
        prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target, logicalPath);
      else if (entry.isFile()) {
        const handle = await open(
          target,
          constants.O_RDONLY | constants.O_NOFOLLOW,
        );
        try {
          const stat = await handle.stat();
          const bytes = await handle.readFile();
          if (!stat.isFile() || stat.nlink !== 1) {
            fail("M2A_COMPILER_OUTPUT_INVALID");
          }
          output.push({
            path: logicalPath,
            bytes,
            type: "regular",
            linkCount: 1,
            sparse: false,
            descriptorSettled: true,
          });
        } finally {
          await handle.close();
        }
      } else fail("M2A_COMPILER_OUTPUT_INVALID");
    }
  };
  await visit(root, "");
  return output;
}

async function normalizeContextTree(root) {
  const visit = async (current) => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (!entry.isFile()) fail("M2A_CONSTRUCTION_OUTPUT_INVALID");
    }
    await chmod(current, 0o555);
    await utimes(current, 0, 0);
  };
  await visit(root);
}

async function readHeldContextInventory(root) {
  const rows = [];
  const visit = async (current, prefix) => {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      const logicalPath =
        prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      const target = path.join(current, entry.name);
      const stat = await lstat(target, { bigint: true });
      const mode = Number(stat.mode & 0o777n);
      if (entry.isDirectory()) {
        rows.push({
          path: logicalPath,
          type: "directory",
          mode,
          size: null,
          sha256: null,
          mtimeNs: stat.mtimeNs.toString(),
          linkCount: null,
          sparse: false,
          descriptorSettled: true,
        });
        await visit(target, logicalPath);
      } else if (entry.isFile()) {
        const bytes = await readFixedRegularFile(
          path.relative(REPOSITORY_ROOT, target),
          64 * 1024 * 1024,
        );
        rows.push({
          path: logicalPath,
          type: "regular",
          mode,
          size: bytes.length,
          sha256: digest(bytes),
          mtimeNs: stat.mtimeNs.toString(),
          linkCount: Number(stat.nlink),
          sparse: stat.blocks * 512n < stat.size,
          descriptorSettled: true,
        });
      } else fail("M2A_CONSTRUCTION_OUTPUT_INVALID");
    }
  };
  await visit(root, "");
  rows.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  return rows;
}

function createFixedConstructionAuthority() {
  const authority = {
    async execute() {
      const heldInputs = createHeldConstructionInputRegistry();
      try {
        const trackedRows = await readFixedTrackedRows(heldInputs);
        const tracked = calculateTrackedInputAggregates(trackedRows);
        const acquisitionReceiptBytes = await heldInputs.hold(
          fixedRepositoryPath(
            M2A_CONSTRUCTION.acquisitionReceipt,
            "M2A_CONSTRUCTION_PATH_INVALID",
          ),
          16_384,
        );
        const npmArchiveBytes = await heldInputs.hold(
          fixedRepositoryPath(
            M2A_CONSTRUCTION.npmArchive,
            "M2A_CONSTRUCTION_PATH_INVALID",
          ),
          64 * 1024 * 1024,
        );
        const acquisitionReceipt = JSON.parse(acquisitionReceiptBytes);
        const npmAcquisition = validateNpmAcquisition(
          acquisitionReceiptBytes,
          npmArchiveBytes,
          {
            receiptSha256: M2A_CONSTRUCTION.reviewedAcquisitionReceiptSha256,
            tarballSha256: M2A_CONSTRUCTION.reviewedAcquisitionTarballSha256,
            integrity: acquisitionReceipt.integrity,
          },
        );
        const toolchainReceiptBytes = await heldInputs.hold(
          fixedRepositoryPath(
            M2A_CONSTRUCTION.toolchainReceipt,
            "M2A_CONSTRUCTION_PATH_INVALID",
          ),
          4 * 1024 * 1024,
        );
        const toolchain = validateConstructorToolchain(toolchainReceiptBytes, {
          receiptSha256: M2A_CONSTRUCTION.reviewedToolchainReceiptSha256,
          inventoryAggregate:
            M2A_CONSTRUCTION.reviewedToolchainInventoryAggregate,
        });
        const toolchainBytesByPath = new Map();
        for (const row of toolchain.inventory) {
          const target =
            row.logicalPath === "runtime/constructor-node"
              ? "/usr/bin/node"
              : fixedRepositoryPath(
                  `${M2A_CONSTRUCTION.toolchainRoot}/${row.logicalPath}`,
                  "M2A_CONSTRUCTION_PATH_INVALID",
                );
          const bytes = await heldInputs.hold(target, 64 * 1024 * 1024, {
            mode: row.mode,
            size: row.size,
            sha256: row.sha256,
          });
          toolchainBytesByPath.set(row.logicalPath, bytes);
        }
        await assertFixedPathAbsent(M2A_CONSTRUCTION.constructionRoot);
        await assertFixedPathAbsent(M2A_CONSTRUCTION.resultRoot);
        const constructionRoot = fixedRepositoryPath(
          M2A_CONSTRUCTION.constructionRoot,
          "M2A_CONSTRUCTION_PATH_INVALID",
        );
        const workspace = path.join(
          constructionRoot,
          "construction-private/compiler-workspace",
        );
        const contextNext = path.join(constructionRoot, "context.next");
        await mkdir(workspace, { recursive: true, mode: 0o700 });
        const trackedByPath = new Map(
          trackedRows.map((row) => [row.path, row.bytes]),
        );
        for (const inputPath of CONSTRUCTION_INPUTS) {
          if (
            inputPath === "tsconfig.base.json" ||
            inputPath.startsWith("packages/probe-core/") ||
            inputPath.startsWith("packages/npm-lifecycle-probe/")
          ) {
            await writeExclusiveFile(
              path.join(workspace, inputPath),
              trackedByPath.get(inputPath),
              0o444,
            );
          }
        }
        for (const row of toolchain.inventory) {
          if (!row.logicalPath.startsWith("packages/")) continue;
          const relativePath = row.logicalPath.slice("packages/".length);
          const bytes = toolchainBytesByPath.get(row.logicalPath);
          if (bytes === undefined) fail("M2A_TOOLCHAIN_INVALID");
          await writeExclusiveFile(
            path.join(workspace, "node_modules", relativePath),
            bytes,
            row.mode,
          );
        }
        const probeTerminal = await runFixedCompiler(
          COMPILER_STEPS[0],
          workspace,
        );
        assertSuccessfulFixedCompilerTerminal(probeTerminal);
        const probeCoreCompilerInventory = await readCompilerInventory(
          path.join(workspace, "packages/probe-core/dist"),
        );
        for (const row of probeCoreCompilerInventory) {
          await writeExclusiveFile(
            path.join(
              workspace,
              "node_modules/@tskaigi-lab/probe-core/dist",
              row.path,
            ),
            row.bytes,
            0o444,
          );
        }
        await writeExclusiveFile(
          path.join(
            workspace,
            "node_modules/@tskaigi-lab/probe-core/package.json",
          ),
          trackedByPath.get("packages/probe-core/package.json"),
          0o444,
        );
        const lifecycleTerminal = await runFixedCompiler(
          COMPILER_STEPS[1],
          workspace,
        );
        assertSuccessfulFixedCompilerTerminal(lifecycleTerminal);
        const lifecycleCompilerInventory = await readCompilerInventory(
          path.join(workspace, "packages/npm-lifecycle-probe/dist"),
        );
        await mkdir(contextNext, { recursive: false, mode: 0o700 });
        const fixedRows = FIXED_CONTEXT_INPUTS.map((definition) => ({
          sourcePath: definition.sourcePath,
          bytes: trackedByPath.get(definition.sourcePath),
          type: "regular",
          linkCount: 1,
          sparse: false,
          descriptorSettled: true,
        }));
        for (const [index, definition] of FIXED_CONTEXT_INPUTS.entries()) {
          if (definition.destinationPath !== null) {
            await writeExclusiveFile(
              path.join(contextNext, definition.destinationPath),
              fixedRows[index].bytes,
              0o444,
            );
          }
        }
        for (const row of npmAcquisition.inventory) {
          await writeExclusiveFile(
            path.join(contextNext, "m2a-context/npm", row.path),
            row.bytes,
            0o444,
          );
        }
        const npmCli = npmAcquisition.inventory.find(
          (row) => row.path === "bin/npm-cli.js",
        );
        await writeExclusiveFile(
          path.join(contextNext, "m2a-context/npm-cli.js"),
          npmCli.bytes,
          0o555,
        );
        for (const [packagePath, inventory] of [
          ["probe-core", probeCoreCompilerInventory],
          ["npm-lifecycle-probe", lifecycleCompilerInventory],
        ]) {
          for (const row of inventory) {
            await writeExclusiveFile(
              path.join(
                contextNext,
                "m2a-context",
                packagePath,
                "dist",
                row.path,
              ),
              row.bytes,
              0o444,
            );
          }
        }
        await writeExclusiveFile(
          path.join(contextNext, "m2a-context/m2a-install-probe-1.0.0.tgz"),
          createDeterministicFixtureArchive(fixedRows.at(-1).bytes),
          0o444,
        );
        await normalizeContextTree(contextNext);
        const heldContextInventory =
          await readHeldContextInventory(contextNext);
        const correlation = validateConstructionContextInputs({
          npmAcquisition,
          probeCoreCompiler: {
            terminal: probeTerminal,
            inventory: probeCoreCompilerInventory,
          },
          lifecycleCompiler: {
            terminal: lifecycleTerminal,
            inventory: lifecycleCompilerInventory,
          },
          fixedInputs: fixedRows,
          heldContextInventory,
        });
        await heldInputs.settle();
        await rm(path.join(constructionRoot, "construction-private"), {
          recursive: true,
          force: false,
        });
        await rename(contextNext, path.join(constructionRoot, "context"));
        const bindings = {
          npmReceiptSha256: npmAcquisition.receiptSha256,
          npmTarballSha256: npmAcquisition.tarballSha256,
          npmIntegrity: npmAcquisition.integrity,
          toolchainReceiptSha256: toolchain.receiptSha256,
          toolchainRuntimeSha256: toolchain.runtimeSha256,
          toolchainInventoryAggregate: toolchain.inventoryAggregate,
          constructorSourceSha256:
            M2A_CONSTRUCTION.reviewedConstructorSourceSha256,
        };
        const compilerSteps = COMPILER_STEPS.map((step) => ({
          stepId: step.stepId,
          executableLogicalId: step.executableLogicalId,
          argvLogicalId: step.argvLogicalId,
          cwdLogicalId: step.cwdLogicalId,
          environmentKeys: [],
          deadlineMs: step.deadlineMs,
          combinedOutputLimitBytes: step.combinedOutputLimitBytes,
          termToKillGraceMs: step.termToKillGraceMs,
          closeDeadlineMs: step.closeDeadlineMs,
        }));
        const manifestBytes = Buffer.from(
          `${JSON.stringify({
            schemaVersion: "m2a-transfer-construction/v1",
            generation: M2A_CONSTRUCTION.generation,
            expectedRevision: M2A_CONSTRUCTION.expectedRevision,
            runId: M2A_CONSTRUCTION.runId,
            scenarioId: M2A_CONSTRUCTION.scenarioId,
            trackedInputs: tracked,
            npmAcquisition: {
              receiptSha256: npmAcquisition.receiptSha256,
              tarballSize: npmAcquisition.tarballSize,
              tarballSha256: npmAcquisition.tarballSha256,
              integrity: npmAcquisition.integrity,
            },
            constructorToolchain: {
              receiptSha256: toolchain.receiptSha256,
              runtimeSha256: toolchain.runtimeSha256,
              inventoryAggregate: toolchain.inventoryAggregate,
            },
            constructor: {
              sourceSha256: M2A_CONSTRUCTION.reviewedConstructorSourceSha256,
              compilerSteps,
            },
            contextInventory: correlation.contextInventory,
            contextAggregate: correlation.contextAggregate,
          })}\n`,
        );
        validateConstructionManifestBytes(manifestBytes, bindings, correlation);
        const manifestNext = path.join(
          constructionRoot,
          "construction-manifest.next",
        );
        await writeExclusiveFile(manifestNext, manifestBytes, 0o444);
        await rename(
          manifestNext,
          path.join(constructionRoot, "construction-manifest.json"),
        );
        return freeze({ status: "complete", evidenceReview: "not-performed" });
      } finally {
        await heldInputs.settle();
      }
    },
  };
  fixedConstructionAuthorityBrand.add(authority);
  return freeze(authority);
}

export async function runFixedM2aConstructionEntry() {
  if (
    M2A_CONSTRUCTION.reviewedAcquisitionReceiptSha256 === null ||
    M2A_CONSTRUCTION.reviewedAcquisitionTarballSha256 === null ||
    M2A_CONSTRUCTION.reviewedToolchainReceiptSha256 === null ||
    M2A_CONSTRUCTION.reviewedToolchainInventoryAggregate === null ||
    M2A_CONSTRUCTION.reviewedConstructorSourceSha256 === null
  ) {
    fail("M2A_CONSTRUCTION_PREREQUISITES_UNREVIEWED");
  }
  if (M2A_CONSTRUCTION.runtimeExecutionApproved !== true) {
    fail("M2A_CONSTRUCTION_EXECUTION_NOT_APPROVED");
  }
  const authority = createFixedConstructionAuthority();
  if (!fixedConstructionAuthorityBrand.has(authority)) {
    fail("M2A_CONSTRUCTION_AUTHORITY_INVALID");
  }
  return await authority.execute();
}
