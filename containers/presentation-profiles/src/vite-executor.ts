import { spawn, type ChildProcessByStdio } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  type FileHandle,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import type { Readable } from "node:stream";
import { clearTimeout, setTimeout } from "node:timers";

import { createFixedViteStagingPlan } from "../runner/vite-staging.js";
import {
  FixedViteEvidenceAccessError,
  readBoundedViteEventHandleForTest,
  readFixedViteEvidenceFromRoot,
  readFixedViteEvidenceFromRootForTest,
  type FixedViteEvidence,
} from "./vite-evidence.js";
import {
  createFixedSelectedScenarioPlans,
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
  FIXED_NODE_IMAGE_ID,
  FIXED_VITE_EXPECTED_REVISION,
  type FixedDockerCommand,
  type SelectedScenarioPlan,
} from "./plan.js";
import {
  projectViteProfileSegment,
  type ViteProfileProjection,
  type ViteScenarioId,
} from "./vite-projection.js";

export { FixedViteEvidenceAccessError } from "./vite-evidence.js";
export {
  readBoundedViteEventHandleForTest,
  readFixedViteEvidenceFromRootForTest,
};

export const FIXED_VITE_EXECUTOR_LIMITS = Object.freeze({
  dockerCommandMs: 20_000,
  containerDeadlineMs: 60_000,
  dockerSettlementMs: 1_000,
});
const DOCKER_OUTPUT_BYTES = 16_384;
const PROGRESS_BYTES = 4_096;
const PROGRESS_RECORDS = 13;
const OUTPUT_FILE_BYTES = 65_536;
const ATTEMPT_FILE = "attempt.json";
const SUMMARY_FILE = "summary.json";
const PROGRESS_FILE = "runner-progress.json";
const PROGRESS_TRUST = "repository-cooperative-fixture" as const;
const NODE_VERSION = "v20.18.2";
const VITE_VERSION = "6.4.3";
const ROLLUP_VERSION = "4.62.2";
const ESBUILD_VERSION = "0.25.12";
const INSPECT_FORMAT =
  "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|{{.State.ExitCode}}";

type ViteSelectedPlan = SelectedScenarioPlan & {
  readonly scenarioId: ViteScenarioId;
  readonly adapterId: "vite";
  readonly expectedRevision: typeof FIXED_VITE_EXPECTED_REVISION;
};

export type ViteRunnerFailureCode =
  | "P2_CHILD_FAILED"
  | "P2_CHILD_TIMEOUT"
  | "P2_OUTPUT_LIMIT"
  | "P2_RESULT_INVALID"
  | "P2_RUNNER_FAILED"
  | "P2_SERVER_CLOSE_FAILED";
export type ViteRunnerSettlementCode =
  "P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN";
export type ViteProgressStage =
  | "runner-entered"
  | "inputs-prepared"
  | "service-ready"
  | "child-launched"
  | "child-watch-armed"
  | "child-failure-detected"
  | "child-terminate-sent"
  | "child-force-sent"
  | "child-close-observed"
  | "child-residue-detected"
  | "child-group-absent"
  | "child-settled"
  | "service-settled"
  | "output-exported";

export interface ViteProgressRecord {
  readonly sequence: number;
  readonly stage: ViteProgressStage;
  readonly value: string;
}

export interface ViteRunnerFailureTerminal {
  readonly status: "failure";
  readonly failureCode: ViteRunnerFailureCode;
  readonly settlement: "known" | "unknown";
  readonly settlementCode: ViteRunnerSettlementCode | null;
}

export interface ViteRunnerCompletedTerminal {
  readonly status: "completed";
  readonly failureCode: null;
  readonly settlement: "known";
  readonly settlementCode: null;
  readonly sourceBeforeHash: string;
  readonly sourceAfterHash: string;
  readonly entryOutputBytes: number;
}

export type ViteRunnerTerminal =
  ViteRunnerFailureTerminal | ViteRunnerCompletedTerminal;

export interface ViteRunnerProgressProjection {
  readonly schemaVersion: "p2-vite-progress/v2";
  readonly validity:
    "not-read" | "missing" | "invalid" | "valid-prefix" | "valid-terminal";
  readonly records: readonly ViteProgressRecord[];
  readonly terminal: ViteRunnerTerminal | null;
}

export interface ViteRunnerDisposition {
  readonly status: "completed" | "failure";
  readonly failureCode: ViteRunnerFailureCode | null;
  readonly settlement: "known" | "unknown";
  readonly settlementCode: ViteRunnerSettlementCode | null;
}

export interface FixedViteExecutionPlan {
  readonly selected: ViteSelectedPlan;
  readonly containerName: string;
  readonly create: FixedDockerCommand;
  readonly inspect: FixedDockerCommand;
  readonly start: FixedDockerCommand;
  readonly wait: FixedDockerCommand;
  readonly remove: FixedDockerCommand;
}

export interface FixedViteCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

type FixedCommandFailureCode =
  | "P2_EXECUTOR_DOCKER_FAILED"
  | "P2_EXECUTOR_DOCKER_OUTPUT"
  | "P2_EXECUTOR_DOCKER_TIMEOUT";
type ViteTransferFailureCode =
  | "P2_TRANSFER_MISSING"
  | "P2_TRANSFER_FILESYSTEM_INVALID"
  | "P2_TRANSFER_OVERSIZED"
  | "P2_TRANSFER_UNSTABLE"
  | "P2_TRANSFER_SCHEMA_INVALID"
  | "P2_TRANSFER_IDENTITY_MISMATCH"
  | "P2_TRANSFER_SEQUENCE_INVALID"
  | "P2_TRANSFER_WRITE_FAILED";
export type VitePrimaryLifecycleStage =
  | "create"
  | "created-inspect"
  | "detached-start"
  | "container-wait"
  | "final-inspect"
  | "cleanup"
  | "progress-transfer"
  | "runner-disposition";
export type VitePrimaryFailureCode =
  | FixedCommandFailureCode
  | ViteTransferFailureCode
  | ViteRunnerFailureCode
  | "P2_EXECUTOR_CREATE_INVALID"
  | "P2_EXECUTOR_INSPECT_INVALID"
  | "P2_EXECUTOR_RUNNER_INVALID"
  | "P2_EXECUTOR_FAILED";

type AttemptIssue =
  | "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED"
  | "P2_ATTEMPT_CONTAINER_SETTLEMENT_NOT_ESTABLISHED"
  | "P2_ATTEMPT_RUNNER_FAILED"
  | "P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN"
  | "P2_ATTEMPT_TRANSFER_FAILED"
  | "P2_ATTEMPT_CLEANUP_FAILED"
  | "P2_ATTEMPT_OUTPUT_NOT_INSPECTED";

export interface ViteExecutionAttemptRecord {
  readonly schemaVersion: "p2-vite-attempt/v4";
  readonly scenarioId: ViteScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly expectedRevision: typeof FIXED_VITE_EXPECTED_REVISION;
  readonly attemptStatus: "inconclusive" | "receipt-pending";
  readonly primaryFailureStage: VitePrimaryLifecycleStage | null;
  readonly primaryFailureCode: VitePrimaryFailureCode | null;
  readonly inspectedImageId: string | null;
  readonly inspectedContainerExitCode: number | null;
  readonly dockerSettlement: "known" | "unknown";
  readonly containerSettlement:
    "natural-exited" | "force-removed" | "not-established";
  readonly runnerProcessSettlement:
    "exited" | "force-stopped" | "not-established";
  readonly cleanupDisposition:
    | "completed"
    | "failed"
    | "not-required"
    | "suppressed-docker-settlement-unknown";
  readonly runner: ViteRunnerDisposition | null;
  readonly runnerProgress: ViteRunnerProgressProjection;
  readonly progressTrust: typeof PROGRESS_TRUST;
  readonly outputAvailability: "fixed-paths-exported" | "not-inspected";
  readonly issues: readonly AttemptIssue[];
}

export interface ViteExecutionReceipt {
  readonly schemaVersion: "p2-vite-execution/v4";
  readonly scenarioId: ViteScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly expectedRevision: typeof FIXED_VITE_EXPECTED_REVISION;
  readonly imageId: string;
  readonly nodeVersion: typeof NODE_VERSION;
  readonly viteVersion: typeof VITE_VERSION;
  readonly rollupVersion: typeof ROLLUP_VERSION;
  readonly esbuildVersion: typeof ESBUILD_VERSION;
  readonly containerExitCode: 0;
  readonly completion: "complete" | "inconclusive";
  readonly cleanup: "completed";
  readonly runner: ViteRunnerDisposition;
  readonly sourceBeforeHash: string;
  readonly sourceAfterHash: string;
  readonly progressTrust: typeof PROGRESS_TRUST;
  readonly output: Readonly<{
    eventSegmentPresent: boolean;
    eventSegmentBytes: number;
    entryOutputPresent: boolean;
    entryOutputBytes: number;
    directWritePresent: boolean;
    directWriteBytes: number;
  }>;
  readonly projection: ViteProfileProjection;
}

export interface ViteExecutionPairProjection {
  readonly schemaVersion: "p2-vite-pair/v4";
  readonly expectedRevision: typeof FIXED_VITE_EXPECTED_REVISION;
  readonly validity: "same-image" | "inconclusive";
  readonly imageId: string | null;
  readonly progressTrust: typeof PROGRESS_TRUST;
  readonly issues: readonly (
    | "IMAGE_ID_MISMATCH"
    | "PAIR_EXECUTION_INCOMPLETE"
    | "PAIR_IDENTITY_MISMATCH"
    | "PAIR_PROGRESS_TRUST_MISMATCH"
  )[];
}

type OutcomeIssue =
  | AttemptIssue
  | "P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN"
  | "P2_ATTEMPT_RECORD_WRITE_FAILED"
  | "P2_RECEIPT_ASSEMBLY_FAILED"
  | "P2_RECEIPT_WRITE_FAILED";

export interface ViteExecutionOutcome {
  readonly scenarioId: ViteScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly completion: "complete" | "failure" | "inconclusive";
  readonly attemptRecord: "not-written" | "written";
  readonly evidence: "inspected" | "not-inspected" | "partially-inspected";
  readonly receipt: ViteExecutionReceipt | null;
  readonly attempt: ViteExecutionAttemptRecord | null;
  readonly issues: readonly OutcomeIssue[];
}

export interface ViteExecutionPair {
  readonly projection: ViteExecutionPairProjection;
  readonly receipts: readonly ViteExecutionReceipt[];
  readonly outcomes: readonly ViteExecutionOutcome[];
}

interface FixedProcessHandle {
  onStdout(listener: (chunk: Buffer) => void): void;
  onStderr(listener: (chunk: Buffer) => void): void;
  onceError(listener: () => void): void;
  onceClose(
    listener: (
      exitCode: number | null,
      signalCode: NodeJS.Signals | null,
    ) => void,
  ): void;
  kill(): boolean;
}

export class FixedViteCommandError extends Error {
  constructor(
    readonly failureCode: FixedCommandFailureCode,
    readonly settlement: "closed" | "unknown",
    readonly signalAccepted: boolean | null,
  ) {
    super(failureCode);
    this.name = "FixedViteCommandError";
  }
}

interface InspectResult {
  readonly containerId: string;
  readonly imageId: string;
  readonly configuredImage: string;
  readonly state: string;
  readonly exitCode: number;
}

interface TransferResult {
  readonly projection: ViteRunnerProgressProjection;
  readonly failureCode: ViteTransferFailureCode | null;
}

interface LifecycleAttempt {
  readonly inspectedImageId: string | null;
  readonly inspectedContainerExitCode: number | null;
  readonly waitExitCode: number | null;
  readonly dockerSettlement: "known" | "unknown";
  readonly containerSettlement:
    "natural-exited" | "force-removed" | "not-established";
  readonly runnerProcessSettlement:
    "exited" | "force-stopped" | "not-established";
  readonly cleanupDisposition: ViteExecutionAttemptRecord["cleanupDisposition"];
  readonly primaryFailureStage: VitePrimaryLifecycleStage | null;
  readonly primaryFailureCode: VitePrimaryFailureCode | null;
  readonly cleanupFailed: boolean;
  readonly progress: TransferResult;
}

interface FinalizationBackend {
  writeAttempt(record: ViteExecutionAttemptRecord): Promise<void>;
  readEvidence(): Promise<FixedViteEvidence>;
  writeReceipt(receipt: ViteExecutionReceipt): Promise<void>;
}

const STAGE_VALUES: Readonly<Record<ViteProgressStage, readonly string[]>> =
  Object.freeze({
    "runner-entered": Object.freeze(["accepted"]),
    "inputs-prepared": Object.freeze(["accepted"]),
    "service-ready": Object.freeze(["listening", "not-required"]),
    "child-launched": Object.freeze(["positive-process-group"]),
    "child-watch-armed": Object.freeze(["close-error-output-deadline"]),
    "child-failure-detected": Object.freeze([
      "spawn-error",
      "invalid-process-group",
      "deadline",
      "output-limit",
      "process-error",
    ]),
    "child-terminate-sent": Object.freeze(["sent", "group-already-absent"]),
    "child-force-sent": Object.freeze(["sent", "group-already-absent"]),
    "child-close-observed": Object.freeze([
      "exit-0",
      "exit-nonzero",
      "sigterm",
      "sigkill",
    ]),
    "child-residue-detected": Object.freeze(["post-close-group-present"]),
    "child-group-absent": Object.freeze(["confirmed"]),
    "child-settled": Object.freeze(["success", "known-failure"]),
    "service-settled": Object.freeze(["closed", "not-started"]),
    "output-exported": Object.freeze(["validated-and-sealed"]),
  });

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactOrderedKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index])
  );
}

function progressProjection(
  validity: ViteRunnerProgressProjection["validity"],
  records: readonly ViteProgressRecord[] = [],
  terminal: ViteRunnerTerminal | null = null,
): ViteRunnerProgressProjection {
  return Object.freeze({
    schemaVersion: "p2-vite-progress/v2",
    validity,
    records: Object.freeze([...records]),
    terminal,
  });
}

const NOT_READ_PROGRESS = progressProjection("not-read");

function record(stage: ViteProgressStage, value: string): ViteProgressRecord {
  return Object.freeze({ sequence: -1, stage, value });
}

function sequence(...records: readonly ViteProgressRecord[]) {
  return Object.freeze(
    records.map((value, index) => Object.freeze({ ...value, sequence: index })),
  );
}

function knownRecordPaths(): readonly (readonly ViteProgressRecord[])[] {
  const runner = record("runner-entered", "accepted");
  const input = record("inputs-prepared", "accepted");
  const serviceValues = ["listening", "not-required"] as const;
  const paths: ViteProgressRecord[][] = [[runner], [runner, input]];
  for (const serviceValue of serviceValues) {
    const base = [runner, input, record("service-ready", serviceValue)];
    const serviceSettled = record(
      "service-settled",
      serviceValue === "listening" ? "closed" : "not-started",
    );
    paths.push(
      [...base],
      [...base, record("child-failure-detected", "spawn-error")],
      [
        ...base,
        record("child-failure-detected", "spawn-error"),
        serviceSettled,
      ],
      [...base, record("child-failure-detected", "invalid-process-group")],
    );
    const launched = [
      ...base,
      record("child-launched", "positive-process-group"),
      record("child-watch-armed", "close-error-output-deadline"),
    ];
    paths.push([...launched]);
    paths.push(
      [
        ...launched,
        record("child-close-observed", "exit-0"),
        record("child-group-absent", "confirmed"),
        record("child-settled", "success"),
        serviceSettled,
        record("output-exported", "validated-and-sealed"),
      ],
      [
        ...launched,
        record("child-close-observed", "exit-nonzero"),
        record("child-group-absent", "confirmed"),
        record("child-settled", "known-failure"),
        serviceSettled,
      ],
    );
    for (const close of ["exit-0", "exit-nonzero"] as const) {
      for (const force of ["sent", "group-already-absent"] as const) {
        paths.push([
          ...launched,
          record("child-close-observed", close),
          record("child-residue-detected", "post-close-group-present"),
          record("child-force-sent", force),
          record("child-group-absent", "confirmed"),
          record("child-settled", "known-failure"),
          serviceSettled,
        ]);
      }
    }
    for (const failure of [
      "deadline",
      "output-limit",
      "process-error",
    ] as const) {
      const failed = [...launched, record("child-failure-detected", failure)];
      paths.push([...failed]);
      for (const close of ["exit-0", "exit-nonzero"] as const) {
        paths.push([
          ...failed,
          record("child-terminate-sent", "group-already-absent"),
          record("child-close-observed", close),
          record("child-group-absent", "confirmed"),
          record("child-settled", "known-failure"),
          serviceSettled,
        ]);
      }
      paths.push([
        ...failed,
        record("child-terminate-sent", "sent"),
        record("child-close-observed", "sigterm"),
        record("child-group-absent", "confirmed"),
        record("child-settled", "known-failure"),
        serviceSettled,
      ]);
      for (const force of ["sent", "group-already-absent"] as const) {
        paths.push([
          ...failed,
          record("child-terminate-sent", "sent"),
          record("child-close-observed", "sigterm"),
          record("child-force-sent", force),
          record("child-group-absent", "confirmed"),
          record("child-settled", "known-failure"),
          serviceSettled,
        ]);
      }
      paths.push([
        ...failed,
        record("child-terminate-sent", "sent"),
        record("child-force-sent", "sent"),
        record("child-close-observed", "sigkill"),
        record("child-group-absent", "confirmed"),
        record("child-settled", "known-failure"),
        serviceSettled,
      ]);
    }
  }
  return Object.freeze(paths.map((path_) => sequence(...path_)));
}

const KNOWN_RECORD_PATHS = knownRecordPaths();

function sameRecord(left: ViteProgressRecord, right: ViteProgressRecord) {
  return (
    left.sequence === right.sequence &&
    left.stage === right.stage &&
    left.value === right.value
  );
}

function matchesKnownPrefix(records: readonly ViteProgressRecord[]): boolean {
  return KNOWN_RECORD_PATHS.some(
    (path_) =>
      records.length <= path_.length &&
      records.every((value, index) => sameRecord(value, path_[index]!)),
  );
}

function matchesUnknownFallback(
  records: readonly ViteProgressRecord[],
): boolean {
  if (records.length < 5) return false;
  const knownLaunchPrefix = KNOWN_RECORD_PATHS.some(
    (path_) =>
      path_.length >= 5 &&
      records
        .slice(0, 5)
        .every((value, index) => sameRecord(value, path_[index]!)),
  );
  if (!knownLaunchPrefix) return false;
  const suffix = records.slice(5).map((entry) => entry.stage);
  const failureFirst = [
    "child-failure-detected",
    "child-terminate-sent",
    "child-close-observed",
    "child-force-sent",
  ] as const;
  const closeFirst = [
    "child-close-observed",
    "child-residue-detected",
    "child-force-sent",
  ] as const;
  const matchesOrder = (allowed: readonly ViteProgressStage[]) => {
    let last = -1;
    for (const stage of suffix) {
      const index = allowed.indexOf(stage);
      if (index < 0 || index <= last) return false;
      last = index;
    }
    return suffix.length > 0 && suffix[0] === allowed[0];
  };
  return matchesOrder(failureFirst) || matchesOrder(closeFirst);
}

function matchesProgressPrefix(
  records: readonly ViteProgressRecord[],
): boolean {
  return matchesKnownPrefix(records) || matchesUnknownFallback(records);
}

function exactKnownPath(records: readonly ViteProgressRecord[]): boolean {
  return KNOWN_RECORD_PATHS.some(
    (path_) =>
      records.length === path_.length &&
      records.every((value, index) => sameRecord(value, path_[index]!)),
  );
}

function failureForRecords(records: readonly ViteProgressRecord[]) {
  const failure = records.find(
    (value) => value.stage === "child-failure-detected",
  )?.value;
  if (failure === "deadline") return "P2_CHILD_TIMEOUT" as const;
  if (failure === "output-limit") return "P2_OUTPUT_LIMIT" as const;
  return "P2_CHILD_FAILED" as const;
}

function unknownFailureForRecords(
  records: readonly ViteProgressRecord[],
  settlementCode: ViteRunnerSettlementCode,
  profileId: ViteSelectedPlan["profileId"],
): ViteRunnerFailureCode | null {
  const detectedValue = records.find(
    (entry) => entry.stage === "child-failure-detected",
  )?.value;
  const childSettled = records.find(
    (entry) => entry.stage === "child-settled",
  )?.value;

  if (settlementCode === "P2_CHILD_SETTLEMENT_UNKNOWN") {
    if (childSettled !== undefined) return null;
    if (detectedValue === "spawn-error") return null;
    if (detectedValue !== undefined) return failureForRecords(records);
    if (
      records.some((entry) =>
        ["child-close-observed", "child-residue-detected"].includes(
          entry.stage,
        ),
      )
    ) {
      return "P2_CHILD_FAILED";
    }
    return records.some((entry) => entry.stage === "child-launched")
      ? "P2_RUNNER_FAILED"
      : null;
  }

  if (profileId !== "permissive") return null;
  if (detectedValue === "spawn-error") return "P2_CHILD_FAILED";
  if (childSettled === "known-failure") return failureForRecords(records);
  if (childSettled === "success") return "P2_SERVER_CLOSE_FAILED";
  if (
    detectedValue !== undefined ||
    records.some((entry) => entry.stage === "child-launched")
  ) {
    return null;
  }
  if (records.length === 2) return "P2_SERVER_CLOSE_FAILED";
  return records.some(
    (entry) => entry.stage === "service-ready" && entry.value === "listening",
  )
    ? "P2_RUNNER_FAILED"
    : null;
}

function validateTerminal(
  value: unknown,
  records: readonly ViteProgressRecord[],
  containerExitCode: number | null,
  profileId: ViteSelectedPlan["profileId"],
): ViteRunnerTerminal | null {
  if (!plainRecord(value)) return null;
  if (value.status === "completed") {
    if (
      !exactOrderedKeys(value, [
        "status",
        "failureCode",
        "settlement",
        "settlementCode",
        "sourceBeforeHash",
        "sourceAfterHash",
        "entryOutputBytes",
      ]) ||
      value.failureCode !== null ||
      value.settlement !== "known" ||
      value.settlementCode !== null ||
      typeof value.sourceBeforeHash !== "string" ||
      typeof value.sourceAfterHash !== "string" ||
      !/^sha256:[0-9a-f]{64}$/u.test(value.sourceBeforeHash) ||
      !/^sha256:[0-9a-f]{64}$/u.test(value.sourceAfterHash) ||
      value.sourceBeforeHash !== value.sourceAfterHash ||
      !Number.isSafeInteger(value.entryOutputBytes) ||
      (value.entryOutputBytes as number) < 1 ||
      (value.entryOutputBytes as number) > OUTPUT_FILE_BYTES ||
      containerExitCode !== 0 ||
      records.at(-1)?.stage !== "output-exported" ||
      records.find((entry) => entry.stage === "child-settled")?.value !==
        "success" ||
      !exactKnownPath(records)
    ) {
      return null;
    }
    return Object.freeze(value) as unknown as ViteRunnerCompletedTerminal;
  }
  if (
    value.status !== "failure" ||
    !exactOrderedKeys(value, [
      "status",
      "failureCode",
      "settlement",
      "settlementCode",
    ]) ||
    ![
      "P2_CHILD_FAILED",
      "P2_CHILD_TIMEOUT",
      "P2_OUTPUT_LIMIT",
      "P2_RESULT_INVALID",
      "P2_RUNNER_FAILED",
      "P2_SERVER_CLOSE_FAILED",
    ].includes(value.failureCode as string) ||
    !["known", "unknown"].includes(value.settlement as string) ||
    !(
      (value.settlement === "known" && value.settlementCode === null) ||
      (value.settlement === "unknown" &&
        [
          "P2_CHILD_SETTLEMENT_UNKNOWN",
          "P2_SERVER_SETTLEMENT_UNKNOWN",
        ].includes(value.settlementCode as string))
    ) ||
    containerExitCode !== 1
  ) {
    return null;
  }
  if (records.some((entry) => entry.stage === "output-exported")) return null;
  const childSettled = records.find((entry) => entry.stage === "child-settled");
  if (
    value.settlement === "known" &&
    childSettled !== undefined &&
    childSettled.value !== "known-failure"
  ) {
    return null;
  }
  const detected = records.some(
    (entry) => entry.stage === "child-failure-detected",
  );
  if (detected && value.failureCode !== failureForRecords(records)) {
    return null;
  }
  const hasServiceReady = records.some(
    (entry) => entry.stage === "service-ready",
  );
  const hasServiceSettled = records.some(
    (entry) => entry.stage === "service-settled",
  );
  const detectedValue = records.find(
    (entry) => entry.stage === "child-failure-detected",
  )?.value;
  if (value.settlement === "known") {
    const knownInputFailure =
      value.failureCode === "P2_RESULT_INVALID" && records.length === 1;
    const knownServiceStartFailure =
      value.failureCode === "P2_SERVER_CLOSE_FAILED" && records.length === 2;
    const knownSpawnFailure =
      value.failureCode === "P2_CHILD_FAILED" &&
      detectedValue === "spawn-error" &&
      hasServiceSettled;
    const knownChildFailure =
      childSettled?.value === "known-failure" &&
      hasServiceSettled &&
      value.failureCode === failureForRecords(records);
    const knownOutputFailure =
      value.failureCode === "P2_RESULT_INVALID" &&
      childSettled?.value === "success" &&
      hasServiceSettled &&
      records.at(-1)?.stage === "service-settled";
    const knownUnexpectedFailure =
      value.failureCode === "P2_RUNNER_FAILED" && !hasServiceReady;
    if (
      !knownInputFailure &&
      !knownServiceStartFailure &&
      !knownSpawnFailure &&
      !knownChildFailure &&
      !knownOutputFailure &&
      !knownUnexpectedFailure
    ) {
      return null;
    }
  } else {
    const settlementCode = value.settlementCode as ViteRunnerSettlementCode;
    if (
      (settlementCode === "P2_CHILD_SETTLEMENT_UNKNOWN" &&
        (childSettled !== undefined || hasServiceSettled)) ||
      (settlementCode === "P2_SERVER_SETTLEMENT_UNKNOWN" &&
        hasServiceSettled) ||
      value.failureCode !==
        unknownFailureForRecords(records, settlementCode, profileId)
    ) {
      return null;
    }
  }
  return Object.freeze(value) as unknown as ViteRunnerFailureTerminal;
}

function parseProgressRecord(
  value: unknown,
  index: number,
): ViteProgressRecord | null {
  if (
    !plainRecord(value) ||
    !exactOrderedKeys(value, ["sequence", "stage", "value"]) ||
    value.sequence !== index ||
    typeof value.stage !== "string" ||
    !(value.stage in STAGE_VALUES) ||
    typeof value.value !== "string" ||
    !STAGE_VALUES[value.stage as ViteProgressStage].includes(value.value)
  ) {
    return null;
  }
  return Object.freeze({
    sequence: index,
    stage: value.stage as ViteProgressStage,
    value: value.value,
  });
}

export function validateFixedViteProgressSnapshotForTest(
  raw: string,
  selected: ViteSelectedPlan,
  containerExitCode: number | null,
): TransferResult {
  if (Buffer.byteLength(raw) > PROGRESS_BYTES) {
    return Object.freeze({
      projection: progressProjection("invalid"),
      failureCode: "P2_TRANSFER_OVERSIZED",
    });
  }
  let value: unknown;
  try {
    value = JSON.parse(raw.endsWith("\n") ? raw.slice(0, -1) : raw);
  } catch {
    return Object.freeze({
      projection: progressProjection("invalid"),
      failureCode: "P2_TRANSFER_SCHEMA_INVALID",
    });
  }
  if (
    !raw.endsWith("\n") ||
    raw.slice(0, -1).includes("\n") ||
    !plainRecord(value) ||
    JSON.stringify(value) + "\n" !== raw ||
    !exactOrderedKeys(value, [
      "schemaVersion",
      "expectedRevision",
      "scenarioId",
      "profileId",
      "runId",
      "records",
      "terminal",
    ]) ||
    value.schemaVersion !== "p2-vite-progress/v2" ||
    !Array.isArray(value.records) ||
    value.records.length === 0 ||
    value.records.length > PROGRESS_RECORDS
  ) {
    return Object.freeze({
      projection: progressProjection("invalid"),
      failureCode: "P2_TRANSFER_SCHEMA_INVALID",
    });
  }
  if (
    value.expectedRevision !== selected.expectedRevision ||
    value.scenarioId !== selected.scenarioId ||
    value.profileId !== selected.profileId ||
    value.runId !== selected.runId
  ) {
    return Object.freeze({
      projection: progressProjection("invalid"),
      failureCode: "P2_TRANSFER_IDENTITY_MISMATCH",
    });
  }
  const records: ViteProgressRecord[] = [];
  for (const [index, candidate] of value.records.entries()) {
    const parsed = parseProgressRecord(candidate, index);
    if (parsed === null) {
      return Object.freeze({
        projection: progressProjection("invalid", records),
        failureCode: "P2_TRANSFER_SEQUENCE_INVALID",
      });
    }
    records.push(parsed);
    if (!matchesProgressPrefix(records)) {
      return Object.freeze({
        projection: progressProjection("invalid", records.slice(0, -1)),
        failureCode: "P2_TRANSFER_SEQUENCE_INVALID",
      });
    }
  }
  if (value.terminal === null) {
    if (containerExitCode === 0 || containerExitCode === 1) {
      return Object.freeze({
        projection: progressProjection("invalid", records),
        failureCode: "P2_TRANSFER_MISSING",
      });
    }
    return Object.freeze({
      projection: progressProjection("valid-prefix", records),
      failureCode: null,
    });
  }
  const terminal = validateTerminal(
    value.terminal,
    records,
    containerExitCode,
    selected.profileId,
  );
  if (terminal === null) {
    return Object.freeze({
      projection: progressProjection("invalid", records),
      failureCode: "P2_TRANSFER_SEQUENCE_INVALID",
    });
  }
  return Object.freeze({
    projection: progressProjection("valid-terminal", records, terminal),
    failureCode: null,
  });
}

function missingPath(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

async function readFixedViteProgress(
  progressRoot: string,
  selected: ViteSelectedPlan,
  containerExitCode: number | null,
): Promise<TransferResult> {
  let directoryBefore;
  try {
    directoryBefore = await lstat(progressRoot, { bigint: true });
    if (
      !directoryBefore.isDirectory() ||
      directoryBefore.isSymbolicLink() ||
      (directoryBefore.mode & 0o7777n) !== 0o1777n
    ) {
      throw new Error("invalid");
    }
    await chmod(progressRoot, 0o555);
  } catch {
    return Object.freeze({
      projection: progressProjection("invalid"),
      failureCode: "P2_TRANSFER_FILESYSTEM_INVALID",
    });
  }
  try {
    const directory = await lstat(progressRoot, { bigint: true });
    const entries = await readdir(progressRoot, { withFileTypes: true });
    if (entries.length === 0) {
      return Object.freeze({
        projection: progressProjection("missing"),
        failureCode: "P2_TRANSFER_MISSING",
      });
    }
    if (
      !directory.isDirectory() ||
      directory.isSymbolicLink() ||
      (directory.mode & 0o7777n) !== 0o555n ||
      directory.dev !== directoryBefore.dev ||
      directory.ino !== directoryBefore.ino ||
      entries.length !== 1 ||
      entries[0]?.name !== PROGRESS_FILE ||
      !entries[0].isFile() ||
      entries[0].isSymbolicLink()
    ) {
      throw new Error("invalid");
    }
  } catch (error) {
    return Object.freeze({
      projection: missingPath(error)
        ? progressProjection("missing")
        : progressProjection("invalid"),
      failureCode: missingPath(error)
        ? "P2_TRANSFER_MISSING"
        : "P2_TRANSFER_FILESYSTEM_INVALID",
    });
  }
  const canonicalPath = path.join(progressRoot, PROGRESS_FILE);
  let handle: FileHandle;
  try {
    handle = await open(
      canonicalPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    return Object.freeze({
      projection: missingPath(error)
        ? progressProjection("missing")
        : progressProjection("invalid"),
      failureCode: missingPath(error)
        ? "P2_TRANSFER_MISSING"
        : "P2_TRANSFER_FILESYSTEM_INVALID",
    });
  }
  try {
    const before = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      ![0o444n, 0o644n].includes(before.mode & 0o7777n) ||
      before.size < 1n ||
      before.size > BigInt(PROGRESS_BYTES)
    ) {
      return Object.freeze({
        projection: progressProjection("invalid"),
        failureCode:
          before.size > BigInt(PROGRESS_BYTES)
            ? "P2_TRANSFER_OVERSIZED"
            : "P2_TRANSFER_FILESYSTEM_INVALID",
      });
    }
    const buffer = Buffer.alloc(PROGRESS_BYTES + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const read = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        offset,
      );
      if (read.bytesRead === 0) break;
      offset += read.bytesRead;
    }
    const [after, pathAfter] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(canonicalPath, { bigint: true }),
    ]);
    if (
      offset > PROGRESS_BYTES ||
      after.dev !== before.dev ||
      after.ino !== before.ino ||
      after.size !== before.size ||
      after.mode !== before.mode ||
      pathAfter.dev !== before.dev ||
      pathAfter.ino !== before.ino ||
      pathAfter.size !== before.size ||
      pathAfter.mode !== before.mode ||
      pathAfter.isSymbolicLink() ||
      !pathAfter.isFile()
    ) {
      return Object.freeze({
        projection: progressProjection("invalid"),
        failureCode: "P2_TRANSFER_UNSTABLE",
      });
    }
    let raw: string;
    try {
      raw = new TextDecoder("utf-8", { fatal: true }).decode(
        buffer.subarray(0, offset),
      );
    } catch {
      return Object.freeze({
        projection: progressProjection("invalid"),
        failureCode: "P2_TRANSFER_SCHEMA_INVALID",
      });
    }
    const parsed = validateFixedViteProgressSnapshotForTest(
      raw,
      selected,
      containerExitCode,
    );
    const expectedMode = parsed.projection.terminal === null ? 0o644n : 0o444n;
    if ((before.mode & 0o7777n) !== expectedMode) {
      return Object.freeze({
        projection: progressProjection("invalid", parsed.projection.records),
        failureCode: "P2_TRANSFER_FILESYSTEM_INVALID",
      });
    }
    return parsed;
  } finally {
    await handle.close().catch(() => undefined);
  }
}

export function readFixedViteProgressFromRootForTest(
  progressRoot: string,
  selected: ViteSelectedPlan,
  containerExitCode: number | null,
): Promise<TransferResult> {
  return readFixedViteProgress(progressRoot, selected, containerExitCode);
}

function fixedDockerCommand(
  environment: FixedDockerCommand["environment"],
  arguments_: readonly string[],
): FixedDockerCommand {
  return Object.freeze({
    executable: FIXED_DOCKER_EXECUTABLE,
    arguments: Object.freeze([...arguments_]),
    environment,
    shell: false,
  });
}

function isVitePlan(plan: SelectedScenarioPlan): plan is ViteSelectedPlan {
  return (
    plan.adapterId === "vite" &&
    plan.expectedRevision === FIXED_VITE_EXPECTED_REVISION
  );
}

const FIXED_CONTAINER_NAMES = Object.freeze({
  "vite-observe-p": "tskaigi-p2-vite-observe-p-20260720-02",
  "vite-observe-c": "tskaigi-p2-vite-observe-c-20260720-02",
} as const);

export function createFixedViteExecutionPlans(): readonly FixedViteExecutionPlan[] {
  return Object.freeze(
    createFixedSelectedScenarioPlans()
      .filter(isVitePlan)
      .map((selected) => {
        const nameIndex = selected.create.arguments.indexOf("--name");
        const containerName = selected.create.arguments[nameIndex + 1];
        if (
          nameIndex < 0 ||
          containerName !== FIXED_CONTAINER_NAMES[selected.scenarioId]
        ) {
          throw new Error("P2_EXECUTOR_PLAN_INVALID");
        }
        const environment = selected.create.environment;
        return Object.freeze({
          selected,
          containerName,
          create: selected.create,
          inspect: fixedDockerCommand(environment, [
            "inspect",
            "--type",
            "container",
            "--format",
            INSPECT_FORMAT,
            containerName,
          ]),
          start: fixedDockerCommand(environment, ["start", containerName]),
          wait: fixedDockerCommand(environment, ["wait", containerName]),
          remove: fixedDockerCommand(environment, [
            "rm",
            "--force",
            containerName,
          ]),
        });
      }),
  );
}

function adaptChildProcess(
  child: ChildProcessByStdio<null, Readable, Readable>,
): FixedProcessHandle {
  return {
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
    kill() {
      try {
        return child.kill("SIGKILL");
      } catch {
        return false;
      }
    },
  };
}

function runBoundedFixedDockerCommand(
  command: FixedDockerCommand,
  launch: (command: FixedDockerCommand) => FixedProcessHandle,
  limits: Readonly<{
    timeoutMs: number;
    settlementMs: number;
    outputBytes: number;
  }>,
): Promise<FixedViteCommandResult> {
  return new Promise((resolve, reject) => {
    let child: FixedProcessHandle;
    try {
      child = launch(command);
    } catch {
      reject(
        new FixedViteCommandError("P2_EXECUTOR_DOCKER_FAILED", "closed", null),
      );
      return;
    }
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let outputBytes = 0;
    let primary: FixedCommandFailureCode | null = null;
    let signalAccepted: boolean | null = null;
    let settled = false;
    let commandTimer: ReturnType<typeof setTimeout> | null = null;
    let settlementTimer: ReturnType<typeof setTimeout> | null = null;
    const clearTimers = () => {
      if (commandTimer !== null) clearTimeout(commandTimer);
      if (settlementTimer !== null) clearTimeout(settlementTimer);
    };
    const beginFailure = (code: FixedCommandFailureCode) => {
      if (settled || primary !== null) return;
      primary = code;
      stdout.length = 0;
      stderr.length = 0;
      if (commandTimer !== null) clearTimeout(commandTimer);
      signalAccepted = child.kill();
      settlementTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        clearTimers();
        reject(new FixedViteCommandError(code, "unknown", signalAccepted));
      }, limits.settlementMs);
    };
    const count = (target: Buffer[], chunk: Buffer) => {
      if (settled || primary !== null) return;
      outputBytes += chunk.byteLength;
      if (outputBytes > limits.outputBytes) {
        beginFailure("P2_EXECUTOR_DOCKER_OUTPUT");
        return;
      }
      target.push(Buffer.from(chunk));
    };
    child.onStdout((chunk) => count(stdout, chunk));
    child.onStderr((chunk) => count(stderr, chunk));
    child.onceError(() => beginFailure("P2_EXECUTOR_DOCKER_FAILED"));
    child.onceClose((exitCode, signalCode) => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (primary !== null) {
        const accepted =
          signalAccepted === true &&
          exitCode === null &&
          signalCode === "SIGKILL";
        reject(
          new FixedViteCommandError(
            primary,
            accepted ? "closed" : "unknown",
            signalAccepted,
          ),
        );
        return;
      }
      if (exitCode === null || signalCode !== null) {
        reject(
          new FixedViteCommandError(
            "P2_EXECUTOR_DOCKER_FAILED",
            "closed",
            null,
          ),
        );
        return;
      }
      resolve({
        exitCode,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    });
    commandTimer = setTimeout(
      () => beginFailure("P2_EXECUTOR_DOCKER_TIMEOUT"),
      limits.timeoutMs,
    );
  });
}

export function runFixedViteDockerCommandWithProcessForTest(
  command: FixedDockerCommand,
  launch: (command: FixedDockerCommand) => FixedProcessHandle,
  limits: Readonly<{
    timeoutMs: number;
    settlementMs: number;
    outputBytes: number;
  }>,
): Promise<FixedViteCommandResult> {
  return runBoundedFixedDockerCommand(command, launch, limits);
}

function runFixedDockerCommand(
  command: FixedDockerCommand,
  timeoutMs: number,
): Promise<FixedViteCommandResult> {
  return runBoundedFixedDockerCommand(
    command,
    (fixed) =>
      adaptChildProcess(
        spawn(fixed.executable, fixed.arguments, {
          env: { ...fixed.environment },
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        }),
      ),
    {
      timeoutMs,
      settlementMs: FIXED_VITE_EXECUTOR_LIMITS.dockerSettlementMs,
      outputBytes: DOCKER_OUTPUT_BYTES,
    },
  );
}

function requireSuccessfulCommand(result: FixedViteCommandResult): void {
  if (result.exitCode !== 0 || result.stderr !== "") {
    throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  }
}

function parseContainerId(result: FixedViteCommandResult): string {
  requireSuccessfulCommand(result);
  if (!/^[0-9a-f]{64}\n$/u.test(result.stdout)) {
    throw new Error("P2_EXECUTOR_CREATE_INVALID");
  }
  return result.stdout.slice(0, -1);
}

function parseInspect(result: FixedViteCommandResult): InspectResult {
  requireSuccessfulCommand(result);
  const fields = result.stdout.endsWith("\n")
    ? result.stdout.slice(0, -1).split("|")
    : [];
  if (
    fields.length !== 5 ||
    !/^[0-9a-f]{64}$/u.test(fields[0] ?? "") ||
    !/^sha256:[0-9a-f]{64}$/u.test(fields[1] ?? "") ||
    fields[2] === undefined ||
    fields[3] === undefined ||
    !/^-?[0-9]+$/u.test(fields[4] ?? "")
  ) {
    throw new Error("P2_EXECUTOR_INSPECT_INVALID");
  }
  return Object.freeze({
    containerId: fields[0]!,
    imageId: fields[1]!,
    configuredImage: fields[2],
    state: fields[3],
    exitCode: Number(fields[4]),
  });
}

function requireOwnedInspect(
  inspect: InspectResult,
  plan: FixedViteExecutionPlan,
  containerId: string,
): void {
  if (
    inspect.containerId !== containerId ||
    inspect.configuredImage !== FIXED_NODE_IMAGE ||
    inspect.imageId !== FIXED_NODE_IMAGE_ID ||
    !Number.isSafeInteger(inspect.exitCode) ||
    !plan.create.arguments.includes(FIXED_NODE_IMAGE)
  ) {
    throw new Error("P2_EXECUTOR_INSPECT_INVALID");
  }
}

function requireDetachedStart(
  result: FixedViteCommandResult,
  containerName: string,
): void {
  requireSuccessfulCommand(result);
  if (result.stdout !== `${containerName}\n`) {
    throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  }
}

function parseWait(result: FixedViteCommandResult): number {
  requireSuccessfulCommand(result);
  if (!/^(0|[1-9][0-9]*)\n$/u.test(result.stdout)) {
    throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  }
  const code = Number(result.stdout.slice(0, -1));
  if (!Number.isSafeInteger(code)) throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  return code;
}

function commandFailureCode(error: unknown): VitePrimaryFailureCode {
  if (error instanceof FixedViteCommandError) return error.failureCode;
  if (error instanceof Error) {
    switch (error.message) {
      case "P2_EXECUTOR_DOCKER_FAILED":
      case "P2_EXECUTOR_CREATE_INVALID":
      case "P2_EXECUTOR_INSPECT_INVALID":
        return error.message;
    }
  }
  return "P2_EXECUTOR_FAILED";
}

function commandSettlement(error: unknown): "known" | "unknown" {
  return error instanceof FixedViteCommandError &&
    error.settlement === "unknown"
    ? "unknown"
    : "known";
}

async function executeLifecycle(
  plan: FixedViteExecutionPlan,
  runCommand: (
    command: FixedDockerCommand,
    timeoutMs: number,
  ) => Promise<FixedViteCommandResult>,
  readProgress: (containerExitCode: number | null) => Promise<TransferResult>,
): Promise<LifecycleAttempt> {
  let containerId: string | null = null;
  let ownershipEstablished = false;
  let imageId: string | null = null;
  let inspectedExit: number | null = null;
  let waitExit: number | null = null;
  let dockerSettlement: "known" | "unknown" = "known";
  let containerSettlement: LifecycleAttempt["containerSettlement"] =
    "not-established";
  let runnerProcessSettlement: LifecycleAttempt["runnerProcessSettlement"] =
    "not-established";
  let cleanupDisposition: LifecycleAttempt["cleanupDisposition"] =
    "not-required";
  let primaryStage: VitePrimaryLifecycleStage | null = null;
  let primaryCode: VitePrimaryFailureCode | null = null;
  let cleanupFailed = false;
  let finalInspectEstablishedExit = false;
  const retainFailure = (stage: VitePrimaryLifecycleStage, error: unknown) => {
    if (primaryStage === null) {
      primaryStage = stage;
      primaryCode = commandFailureCode(error);
    }
    if (commandSettlement(error) === "unknown") dockerSettlement = "unknown";
  };
  const runStage = async (
    stage: VitePrimaryLifecycleStage,
    command: FixedDockerCommand,
    timeoutMs: number = FIXED_VITE_EXECUTOR_LIMITS.dockerCommandMs,
  ): Promise<FixedViteCommandResult | null> => {
    try {
      return await runCommand(command, timeoutMs);
    } catch (error) {
      retainFailure(stage, error);
      return null;
    }
  };

  const created = await runStage("create", plan.create);
  if (created !== null) {
    try {
      containerId = parseContainerId(created);
    } catch (error) {
      retainFailure("create", error);
    }
  }
  if (primaryStage === null && containerId !== null) {
    const inspected = await runStage("created-inspect", plan.inspect);
    if (inspected !== null) {
      try {
        const parsed = parseInspect(inspected);
        requireOwnedInspect(parsed, plan, containerId);
        if (parsed.state !== "created")
          throw new Error("P2_EXECUTOR_INSPECT_INVALID");
        ownershipEstablished = true;
        imageId = parsed.imageId;
      } catch (error) {
        retainFailure("created-inspect", error);
      }
    }
  }

  let startSucceeded = false;
  let startLaunchTime = 0;
  if (primaryStage === null && ownershipEstablished) {
    startLaunchTime = performance.now();
    const started = await runStage("detached-start", plan.start);
    if (started !== null) {
      try {
        requireDetachedStart(started, plan.containerName);
        startSucceeded = true;
      } catch (error) {
        retainFailure("detached-start", error);
      }
    }
  }

  if (startSucceeded && dockerSettlement === "known") {
    const remaining = Math.max(
      1,
      Math.floor(
        FIXED_VITE_EXECUTOR_LIMITS.containerDeadlineMs -
          (performance.now() - startLaunchTime),
      ),
    );
    const waited = await runStage("container-wait", plan.wait, remaining);
    if (waited !== null) {
      try {
        waitExit = parseWait(waited);
      } catch (error) {
        retainFailure("container-wait", error);
      }
    }
  }

  const shouldInspect =
    ownershipEstablished &&
    dockerSettlement === "known" &&
    (startSucceeded || primaryStage === "detached-start");
  if (shouldInspect) {
    const inspected = await runStage("final-inspect", plan.inspect);
    if (inspected !== null) {
      try {
        const parsed = parseInspect(inspected);
        requireOwnedInspect(parsed, plan, containerId!);
        imageId = parsed.imageId;
        if (parsed.state === "exited") {
          finalInspectEstablishedExit = true;
          inspectedExit = parsed.exitCode;
          containerSettlement = "natural-exited";
          if (waitExit !== null && waitExit !== parsed.exitCode) {
            retainFailure(
              "final-inspect",
              new Error("P2_EXECUTOR_INSPECT_INVALID"),
            );
          }
        } else if (primaryStage === null) {
          retainFailure(
            "final-inspect",
            new Error("P2_EXECUTOR_INSPECT_INVALID"),
          );
        }
      } catch (error) {
        retainFailure("final-inspect", error);
      }
    }
  }

  const shouldRemove =
    ownershipEstablished && dockerSettlement === "known" && shouldInspect;
  let removeSucceeded = false;
  if (shouldRemove) {
    cleanupDisposition = "completed";
    const removed = await runStage("cleanup", plan.remove);
    if (removed !== null) {
      try {
        requireSuccessfulCommand(removed);
        removeSucceeded = true;
      } catch (error) {
        cleanupDisposition = "failed";
        cleanupFailed = true;
        retainFailure("cleanup", error);
      }
    } else {
      cleanupDisposition = "failed";
      cleanupFailed = true;
    }
    if (removeSucceeded && !finalInspectEstablishedExit) {
      containerSettlement = "force-removed";
      runnerProcessSettlement = "force-stopped";
    }
  } else if ((dockerSettlement as string) === "unknown") {
    cleanupDisposition = "suppressed-docker-settlement-unknown";
  }

  let progress: TransferResult = Object.freeze({
    projection: NOT_READ_PROGRESS,
    failureCode: null,
  });
  const writerStopped = finalInspectEstablishedExit || removeSucceeded;
  if (dockerSettlement === "known" && writerStopped) {
    progress = await readProgress(inspectedExit);
    if (progress.failureCode !== null) {
      if (primaryStage === null) {
        primaryStage = "progress-transfer";
        primaryCode =
          inspectedExit === 70
            ? "P2_TRANSFER_WRITE_FAILED"
            : progress.failureCode;
      }
    }
  }

  if (finalInspectEstablishedExit) {
    if (
      inspectedExit === 70 ||
      progress.projection.validity === "valid-terminal"
    ) {
      runnerProcessSettlement = "exited";
    }
    const terminal = progress.projection.terminal;
    if (terminal?.status === "failure" && primaryStage === null) {
      primaryStage = "runner-disposition";
      primaryCode = terminal.failureCode;
    }
    if (inspectedExit === 70 && primaryStage === null) {
      primaryStage = "progress-transfer";
      primaryCode = "P2_TRANSFER_WRITE_FAILED";
    }
  }
  return Object.freeze({
    inspectedImageId: imageId,
    inspectedContainerExitCode: inspectedExit,
    waitExitCode: waitExit,
    dockerSettlement,
    containerSettlement,
    runnerProcessSettlement,
    cleanupDisposition,
    primaryFailureStage: primaryStage,
    primaryFailureCode: primaryCode,
    cleanupFailed,
    progress,
  });
}

function runnerFromProgress(
  progress: ViteRunnerProgressProjection,
): ViteRunnerDisposition | null {
  if (progress.validity !== "valid-terminal" || progress.terminal === null)
    return null;
  return Object.freeze({
    status: progress.terminal.status,
    failureCode: progress.terminal.failureCode,
    settlement: progress.terminal.settlement,
    settlementCode: progress.terminal.settlementCode,
  });
}

const ISSUE_ORDER: readonly AttemptIssue[] = Object.freeze([
  "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED",
  "P2_ATTEMPT_CONTAINER_SETTLEMENT_NOT_ESTABLISHED",
  "P2_ATTEMPT_RUNNER_FAILED",
  "P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN",
  "P2_ATTEMPT_TRANSFER_FAILED",
  "P2_ATTEMPT_CLEANUP_FAILED",
  "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
]);

function buildAttemptRecord(
  plan: FixedViteExecutionPlan,
  lifecycle: LifecycleAttempt,
): ViteExecutionAttemptRecord {
  const runner = runnerFromProgress(lifecycle.progress.projection);
  const terminal = lifecycle.progress.projection.terminal;
  const completedTerminal = terminal?.status === "completed" ? terminal : null;
  const receiptPending =
    lifecycle.primaryFailureStage === null &&
    lifecycle.dockerSettlement === "known" &&
    lifecycle.containerSettlement === "natural-exited" &&
    lifecycle.runnerProcessSettlement === "exited" &&
    lifecycle.inspectedContainerExitCode === 0 &&
    lifecycle.waitExitCode === 0 &&
    lifecycle.cleanupDisposition === "completed" &&
    lifecycle.progress.failureCode === null &&
    lifecycle.progress.projection.validity === "valid-terminal" &&
    completedTerminal !== null &&
    completedTerminal.sourceBeforeHash === completedTerminal.sourceAfterHash;
  const issueSet = new Set<AttemptIssue>();
  if (
    lifecycle.primaryFailureStage !== null &&
    !["progress-transfer", "runner-disposition"].includes(
      lifecycle.primaryFailureStage,
    )
  ) {
    issueSet.add("P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED");
  }
  if (lifecycle.containerSettlement === "not-established") {
    issueSet.add("P2_ATTEMPT_CONTAINER_SETTLEMENT_NOT_ESTABLISHED");
  }
  if (runner?.status === "failure") issueSet.add("P2_ATTEMPT_RUNNER_FAILED");
  if (
    runner?.settlement === "unknown" ||
    (runner === null && lifecycle.runnerProcessSettlement !== "not-established")
  ) {
    issueSet.add("P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN");
  }
  if (
    lifecycle.progress.failureCode !== null ||
    (lifecycle.inspectedContainerExitCode === 70 &&
      lifecycle.containerSettlement === "natural-exited" &&
      lifecycle.runnerProcessSettlement === "exited")
  ) {
    issueSet.add("P2_ATTEMPT_TRANSFER_FAILED");
  }
  if (lifecycle.cleanupFailed) issueSet.add("P2_ATTEMPT_CLEANUP_FAILED");
  if (!receiptPending) issueSet.add("P2_ATTEMPT_OUTPUT_NOT_INSPECTED");
  const issues = ISSUE_ORDER.filter((issue) => issueSet.has(issue));
  return Object.freeze({
    schemaVersion: "p2-vite-attempt/v4",
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    expectedRevision: plan.selected.expectedRevision,
    attemptStatus: receiptPending ? "receipt-pending" : "inconclusive",
    primaryFailureStage: lifecycle.primaryFailureStage,
    primaryFailureCode: lifecycle.primaryFailureCode,
    inspectedImageId: lifecycle.inspectedImageId,
    inspectedContainerExitCode: lifecycle.inspectedContainerExitCode,
    dockerSettlement: lifecycle.dockerSettlement,
    containerSettlement: lifecycle.containerSettlement,
    runnerProcessSettlement: lifecycle.runnerProcessSettlement,
    cleanupDisposition: lifecycle.cleanupDisposition,
    runner,
    runnerProgress: lifecycle.progress.projection,
    progressTrust: PROGRESS_TRUST,
    outputAvailability: receiptPending
      ? "fixed-paths-exported"
      : "not-inspected",
    issues: Object.freeze(issues),
  });
}

function buildReceipt(
  plan: FixedViteExecutionPlan,
  attempt: ViteExecutionAttemptRecord,
  evidence: FixedViteEvidence,
): ViteExecutionReceipt {
  const terminal = attempt.runnerProgress.terminal;
  if (
    attempt.attemptStatus !== "receipt-pending" ||
    terminal?.status !== "completed" ||
    attempt.runner === null ||
    attempt.inspectedImageId !== FIXED_NODE_IMAGE_ID ||
    attempt.inspectedContainerExitCode !== 0
  ) {
    throw new Error("P2_EXECUTOR_RUNNER_INVALID");
  }
  const projected = projectViteProfileSegment({
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    rawSegment: evidence.eventFile.rawSegment ?? "",
  });
  const directMatches =
    plan.selected.profileId === "permissive"
      ? evidence.directFile.present &&
        evidence.directFile.bytes > 0 &&
        evidence.directFile.bytes <= OUTPUT_FILE_BYTES
      : !evidence.directFile.present;
  const matches =
    terminal.sourceBeforeHash === terminal.sourceAfterHash &&
    evidence.eventFile.present &&
    evidence.eventFile.rawSegment !== null &&
    evidence.entryFile.present &&
    evidence.entryFile.bytes === terminal.entryOutputBytes &&
    evidence.entryFile.bytes <= OUTPUT_FILE_BYTES &&
    directMatches;
  const projection: ViteProfileProjection = matches
    ? projected
    : Object.freeze({
        ...projected,
        validity: "inconclusive",
        issues: Object.freeze([
          ...projected.issues,
          "RUNTIME_SUMMARY_MISMATCH" as const,
        ]),
      });
  return Object.freeze({
    schemaVersion: "p2-vite-execution/v4",
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    expectedRevision: plan.selected.expectedRevision,
    imageId: FIXED_NODE_IMAGE_ID,
    nodeVersion: NODE_VERSION,
    viteVersion: VITE_VERSION,
    rollupVersion: ROLLUP_VERSION,
    esbuildVersion: ESBUILD_VERSION,
    containerExitCode: 0,
    completion: matches ? "complete" : "inconclusive",
    cleanup: "completed",
    runner: attempt.runner,
    sourceBeforeHash: terminal.sourceBeforeHash,
    sourceAfterHash: terminal.sourceAfterHash,
    progressTrust: PROGRESS_TRUST,
    output: Object.freeze({
      eventSegmentPresent: evidence.eventFile.present,
      eventSegmentBytes: evidence.eventFile.bytes,
      entryOutputPresent: evidence.entryFile.present,
      entryOutputBytes: evidence.entryFile.bytes,
      directWritePresent: evidence.directFile.present,
      directWriteBytes: evidence.directFile.bytes,
    }),
    projection,
  });
}

async function finalizeExecution(
  plan: FixedViteExecutionPlan,
  lifecycle: LifecycleAttempt,
  backend: FinalizationBackend,
): Promise<ViteExecutionOutcome> {
  if (lifecycle.dockerSettlement === "unknown") {
    return Object.freeze({
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      runId: plan.selected.runId,
      completion: "failure",
      attemptRecord: "not-written",
      evidence: "not-inspected",
      receipt: null,
      attempt: null,
      issues: Object.freeze(["P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN" as const]),
    });
  }
  const attempt = buildAttemptRecord(plan, lifecycle);
  try {
    await backend.writeAttempt(attempt);
  } catch {
    return Object.freeze({
      scenarioId: attempt.scenarioId,
      profileId: attempt.profileId,
      runId: attempt.runId,
      completion: "failure",
      attemptRecord: "not-written",
      evidence: "not-inspected",
      receipt: null,
      attempt: null,
      issues: Object.freeze(["P2_ATTEMPT_RECORD_WRITE_FAILED" as const]),
    });
  }
  if (attempt.attemptStatus !== "receipt-pending") {
    return Object.freeze({
      scenarioId: attempt.scenarioId,
      profileId: attempt.profileId,
      runId: attempt.runId,
      completion: "inconclusive",
      attemptRecord: "written",
      evidence: "not-inspected",
      receipt: null,
      attempt,
      issues: attempt.issues,
    });
  }
  let receipt: ViteExecutionReceipt;
  try {
    receipt = buildReceipt(plan, attempt, await backend.readEvidence());
  } catch (error) {
    return Object.freeze({
      scenarioId: attempt.scenarioId,
      profileId: attempt.profileId,
      runId: attempt.runId,
      completion: "inconclusive",
      attemptRecord: "written",
      evidence:
        error instanceof FixedViteEvidenceAccessError
          ? error.evidence
          : "not-inspected",
      receipt: null,
      attempt,
      issues: Object.freeze([
        ...attempt.issues,
        "P2_RECEIPT_ASSEMBLY_FAILED" as const,
      ]),
    });
  }
  try {
    await backend.writeReceipt(receipt);
  } catch {
    return Object.freeze({
      scenarioId: attempt.scenarioId,
      profileId: attempt.profileId,
      runId: attempt.runId,
      completion: "inconclusive",
      attemptRecord: "written",
      evidence: "inspected",
      receipt: null,
      attempt,
      issues: Object.freeze([
        ...attempt.issues,
        "P2_RECEIPT_WRITE_FAILED" as const,
      ]),
    });
  }
  return Object.freeze({
    scenarioId: attempt.scenarioId,
    profileId: attempt.profileId,
    runId: attempt.runId,
    completion: receipt.completion,
    attemptRecord: "written",
    evidence: "inspected",
    receipt,
    attempt,
    issues: attempt.issues,
  });
}

async function requireAbsent(filePath: string): Promise<void> {
  try {
    await lstat(filePath);
  } catch (error) {
    if (missingPath(error)) return;
    throw new Error("P2_EXECUTOR_FILESYSTEM_FAILED");
  }
  throw new Error("P2_EXECUTOR_RESULT_EXISTS");
}

async function listStagedFiles(
  stagingRoot: string,
  relativeRoot = "",
): Promise<readonly string[]> {
  const entries = await readdir(path.join(stagingRoot, relativeRoot), {
    withFileTypes: true,
  });
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeRoot, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listStagedFiles(stagingRoot, relativePath)));
    } else if (entry.isFile() && !entry.isSymbolicLink()) {
      files.push(relativePath);
    } else {
      throw new Error("P2_EXECUTOR_STAGING_INVALID");
    }
  }
  return files;
}

async function verifyFixedStaging(
  stagingRoot = createFixedViteStagingPlan().stagingRoot,
): Promise<void> {
  const staging = createFixedViteStagingPlan();
  const expected = staging.entries
    .map((entry) => entry.targetPath)
    .sort((left, right) => left.localeCompare(right));
  const actual = [...(await listStagedFiles(stagingRoot))].sort((left, right) =>
    left.localeCompare(right),
  );
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    throw new Error("P2_EXECUTOR_STAGING_INVALID");
  }
  for (const entry of staging.entries) {
    const targetPath = path.join(stagingRoot, entry.targetPath);
    const [source, target, targetStat] = await Promise.all([
      readFile(entry.sourcePath),
      readFile(targetPath),
      lstat(targetPath),
    ]);
    if (
      !targetStat.isFile() ||
      targetStat.isSymbolicLink() ||
      (targetStat.mode & 0o777) !== entry.mode ||
      !source.equals(target)
    ) {
      throw new Error("P2_EXECUTOR_STAGING_INVALID");
    }
  }
}

export function verifyFixedViteStagingForTest(stagingRoot: string) {
  return verifyFixedStaging(stagingRoot);
}

async function prepareFixedRunRoot(plan: ViteSelectedPlan): Promise<void> {
  await requireAbsent(plan.resultRoot);
  const dockerConfigRoot = path.join(plan.resultRoot, "docker-config");
  await mkdir(dockerConfigRoot, { recursive: true, mode: 0o700 });
  await chmod(plan.resultRoot, 0o700);
  await chmod(dockerConfigRoot, 0o700);
  await writeFile(path.join(dockerConfigRoot, "config.json"), "{}\n", {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  for (const [name, mode] of [
    ["result", 0o777],
    ["tool", 0o777],
    ["direct-write", 0o777],
    ["progress", 0o1777],
  ] as const) {
    const root = path.join(plan.resultRoot, name);
    await mkdir(root, { mode });
    await chmod(root, mode);
  }
}

function productionBackend(plan: FixedViteExecutionPlan): FinalizationBackend {
  return Object.freeze({
    async writeAttempt(record: ViteExecutionAttemptRecord) {
      await writeFile(
        path.join(plan.selected.resultRoot, ATTEMPT_FILE),
        `${JSON.stringify(record)}\n`,
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    },
    readEvidence() {
      return readFixedViteEvidenceFromRoot(plan.selected.resultRoot);
    },
    async writeReceipt(receipt: ViteExecutionReceipt) {
      await writeFile(
        path.join(plan.selected.resultRoot, SUMMARY_FILE),
        `${JSON.stringify(receipt)}\n`,
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    },
  });
}

export async function executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
  plan: FixedViteExecutionPlan,
  runCommand: (
    command: FixedDockerCommand,
    timeoutMs: number,
  ) => Promise<FixedViteCommandResult>,
  readProgress: (containerExitCode: number | null) => Promise<TransferResult>,
  backend: FinalizationBackend,
): Promise<ViteExecutionOutcome> {
  return finalizeExecution(
    plan,
    await executeLifecycle(plan, runCommand, readProgress),
    backend,
  );
}

async function executeOne(
  plan: FixedViteExecutionPlan,
): Promise<ViteExecutionOutcome> {
  await prepareFixedRunRoot(plan.selected);
  const lifecycle = await executeLifecycle(
    plan,
    (command, timeoutMs) => runFixedDockerCommand(command, timeoutMs),
    (containerExitCode) =>
      readFixedViteProgress(
        path.join(plan.selected.resultRoot, "progress"),
        plan.selected,
        containerExitCode,
      ),
  );
  return finalizeExecution(plan, lifecycle, productionBackend(plan));
}

export function projectFixedViteExecutionPair(
  receipts: readonly Pick<
    ViteExecutionReceipt,
    | "completion"
    | "expectedRevision"
    | "imageId"
    | "profileId"
    | "progressTrust"
    | "runId"
    | "scenarioId"
  >[],
): ViteExecutionPairProjection {
  const plans = createFixedViteExecutionPlans();
  const identityMatches =
    receipts.length === plans.length &&
    receipts.every((receipt, index) => {
      const selected = plans[index]?.selected;
      return (
        selected !== undefined &&
        receipt.scenarioId === selected.scenarioId &&
        receipt.profileId === selected.profileId &&
        receipt.runId === selected.runId &&
        receipt.expectedRevision === selected.expectedRevision
      );
    });
  const trustMatches =
    identityMatches &&
    receipts.every((receipt) => receipt.progressTrust === PROGRESS_TRUST);
  const imageMatches =
    identityMatches &&
    receipts[0]?.imageId === FIXED_NODE_IMAGE_ID &&
    receipts[0].imageId === receipts[1]?.imageId;
  const complete =
    identityMatches &&
    receipts.every((receipt) => receipt.completion === "complete");
  const issues: ViteExecutionPairProjection["issues"][number][] = [];
  if (!identityMatches) issues.push("PAIR_IDENTITY_MISMATCH");
  else {
    if (!imageMatches) issues.push("IMAGE_ID_MISMATCH");
    if (!complete) issues.push("PAIR_EXECUTION_INCOMPLETE");
    if (!trustMatches) issues.push("PAIR_PROGRESS_TRUST_MISMATCH");
  }
  return Object.freeze({
    schemaVersion: "p2-vite-pair/v4",
    expectedRevision: FIXED_VITE_EXPECTED_REVISION,
    validity:
      imageMatches && complete && trustMatches ? "same-image" : "inconclusive",
    imageId: imageMatches ? (receipts[0]?.imageId ?? null) : null,
    progressTrust: PROGRESS_TRUST,
    issues: Object.freeze(issues),
  });
}

async function executeSequence(
  executePlan: (plan: FixedViteExecutionPlan) => Promise<ViteExecutionOutcome>,
): Promise<ViteExecutionPair> {
  const receipts: ViteExecutionReceipt[] = [];
  const outcomes: ViteExecutionOutcome[] = [];
  for (const plan of createFixedViteExecutionPlans()) {
    const outcome = await executePlan(plan);
    outcomes.push(outcome);
    if (outcome.receipt !== null) receipts.push(outcome.receipt);
    if (outcome.completion !== "complete") break;
  }
  return Object.freeze({
    projection: projectFixedViteExecutionPair(receipts),
    receipts: Object.freeze(receipts),
    outcomes: Object.freeze(outcomes),
  });
}

export function executeFixedVitePlanSequenceWithBackendForTest(
  executePlan: (plan: FixedViteExecutionPlan) => Promise<ViteExecutionOutcome>,
) {
  return executeSequence(executePlan);
}

export async function executeFixedViteProfiles(): Promise<ViteExecutionPair> {
  await verifyFixedStaging();
  return executeSequence(executeOne);
}

export function projectFixedViteEntryResult(pair: ViteExecutionPair) {
  const hasFailure = pair.outcomes.some(
    (outcome) => outcome.attemptRecord === "not-written",
  );
  return Object.freeze({
    status: hasFailure
      ? ("failure" as const)
      : pair.projection.validity === "same-image"
        ? ("completed" as const)
        : ("inconclusive" as const),
    pair: pair.projection,
    scenarios: Object.freeze(
      pair.outcomes.map((outcome) =>
        Object.freeze({
          scenarioId: outcome.scenarioId,
          profileId: outcome.profileId,
          completion: outcome.completion,
          attemptRecord: outcome.attemptRecord,
          evidence: outcome.evidence,
          receipt: outcome.receipt === null ? "not-written" : "written",
          validity:
            outcome.receipt?.projection.validity ?? ("not-inspected" as const),
          issues: outcome.issues,
        }),
      ),
    ),
  });
}
