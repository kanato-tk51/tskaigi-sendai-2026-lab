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
import type { Readable } from "node:stream";
import { clearTimeout, setTimeout } from "node:timers";

import { createFixedViteStagingPlan } from "../runner/vite-staging.js";
import {
  projectViteProfileSegment,
  type ViteProfileProjection,
  type ViteScenarioId,
} from "./vite-projection.js";
import {
  createFixedSelectedScenarioPlans,
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
  type FixedDockerCommand,
  type SelectedScenarioPlan,
} from "./plan.js";

const DOCKER_COMMAND_TIMEOUT_MS = 20_000;
const DOCKER_START_TIMEOUT_MS = 40_000;
const DOCKER_SETTLEMENT_MS = 1_000;
const DOCKER_OUTPUT_BYTES = 16_384;
const EVENT_SEGMENT_BYTES = 65_536;
const OUTPUT_FILE_BYTES = 65_536;
const EVENT_SEGMENT = "vite-coordinator.jsonl";
const DIRECT_WRITE_MARKER = "direct-write-marker.json";
const ENTRY_OUTPUT = "entry.js";
const ATTEMPT_FILE = "attempt.json";
const SUMMARY_FILE = "summary.json";
const NODE_VERSION = "v20.18.2";
const VITE_VERSION = "6.4.3";
const ROLLUP_VERSION = "4.62.2";
const ESBUILD_VERSION = "0.25.12";
const INSPECT_FORMAT =
  "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|{{.State.ExitCode}}";

type ViteSelectedPlan = SelectedScenarioPlan & {
  readonly scenarioId: ViteScenarioId;
  readonly adapterId: "vite";
};

type ViteRunnerFailureCode =
  | "P2_CHILD_FAILED"
  | "P2_CHILD_TIMEOUT"
  | "P2_OUTPUT_LIMIT"
  | "P2_RESULT_INVALID"
  | "P2_RUNNER_FAILED"
  | "P2_SERVER_CLOSE_FAILED";

type ViteRunnerSettlementCode =
  "P2_CHILD_SETTLEMENT_UNKNOWN" | "P2_SERVER_SETTLEMENT_UNKNOWN";

interface ViteRunnerSummary {
  readonly sourceBeforeHash: string;
  readonly sourceAfterHash: string;
  readonly entryOutputBytes: number;
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
  readonly remove: FixedDockerCommand;
}

export interface FixedViteCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface FixedViteLifecycleResult {
  readonly imageId: string;
  readonly containerExitCode: number;
  readonly runner: ViteRunnerDisposition;
  readonly runnerSummary: ViteRunnerSummary | null;
  readonly cleanup: "completed" | "suppressed-runner-settlement-unknown";
}

type ViteAttemptCleanupDisposition =
  | FixedViteLifecycleResult["cleanup"]
  | "failed"
  | "not-required"
  | "suppressed-docker-settlement-unknown";

type ViteAttemptIssueCode =
  | "P2_ATTEMPT_CLEANUP_FAILED"
  | "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED"
  | "P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN"
  | "P2_ATTEMPT_OUTPUT_NOT_INSPECTED"
  | "P2_ATTEMPT_RUNNER_DISPOSITION_INVALID"
  | "P2_ATTEMPT_RUNNER_FAILED"
  | "P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN";

export interface ViteExecutionAttemptRecord {
  readonly schemaVersion: "p2-vite-attempt/v1";
  readonly scenarioId: ViteScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly attemptStatus: "inconclusive" | "receipt-pending";
  readonly inspectedImageId: string | null;
  readonly inspectedContainerExitCode: number | null;
  readonly dockerSettlement: "known" | "unknown";
  readonly runnerSettlement: "known" | "not-established" | "unknown";
  readonly cleanupDisposition: ViteAttemptCleanupDisposition;
  readonly runner: ViteRunnerDisposition | null;
  readonly outputAvailability: "fixed-paths-exported" | "not-inspected";
  readonly issues: readonly ViteAttemptIssueCode[];
}

export interface ViteExecutionReceipt {
  readonly schemaVersion: "p2-vite-execution/v1";
  readonly scenarioId: ViteScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly imageId: string;
  readonly nodeVersion: typeof NODE_VERSION;
  readonly viteVersion: typeof VITE_VERSION;
  readonly rollupVersion: typeof ROLLUP_VERSION;
  readonly esbuildVersion: typeof ESBUILD_VERSION;
  readonly containerExitCode: number;
  readonly completion: "complete" | "inconclusive";
  readonly cleanup: FixedViteLifecycleResult["cleanup"];
  readonly runner: ViteRunnerDisposition;
  readonly sourceBeforeHash: string | null;
  readonly sourceAfterHash: string | null;
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
  readonly schemaVersion: "p2-vite-pair/v1";
  readonly validity: "same-image" | "inconclusive";
  readonly imageId: string | null;
  readonly issues: readonly (
    "IMAGE_ID_MISMATCH" | "PAIR_EXECUTION_INCOMPLETE" | "PAIR_IDENTITY_MISMATCH"
  )[];
}

export interface ViteExecutionPair {
  readonly projection: ViteExecutionPairProjection;
  readonly receipts: readonly ViteExecutionReceipt[];
  readonly outcomes: readonly ViteExecutionOutcome[];
}

type ViteExecutionOutcomeIssueCode =
  | ViteAttemptIssueCode
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
  readonly issues: readonly ViteExecutionOutcomeIssueCode[];
}

export interface ViteExecutionEntryProjection {
  readonly status: "completed" | "failure" | "inconclusive";
  readonly pair: ViteExecutionPairProjection;
  readonly scenarios: readonly Readonly<{
    scenarioId: ViteScenarioId;
    profileId: "permissive" | "constrained";
    completion: ViteExecutionOutcome["completion"];
    attemptRecord: ViteExecutionOutcome["attemptRecord"];
    evidence: ViteExecutionOutcome["evidence"];
    receipt: "not-written" | "written";
    validity: ViteProfileProjection["validity"] | "not-inspected";
    issues: readonly ViteExecutionOutcomeIssueCode[];
  }>[];
}

type FixedCommandFailureCode =
  | "P2_EXECUTOR_DOCKER_FAILED"
  | "P2_EXECUTOR_DOCKER_OUTPUT"
  | "P2_EXECUTOR_DOCKER_TIMEOUT";

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

export class FixedViteRunnerBoundaryError extends Error {
  readonly settlement = "unknown" as const;

  constructor() {
    super("P2_EXECUTOR_RUNNER_INVALID");
    this.name = "FixedViteRunnerBoundaryError";
  }
}

export class FixedViteExecutionError extends Error {
  constructor(
    readonly primary: Error,
    readonly secondaryCodes: readonly "P2_EXECUTOR_CLEANUP_FAILED"[],
  ) {
    super(primary.message, { cause: primary });
    this.name = "FixedViteExecutionError";
  }
}

export class FixedViteEvidenceAccessError extends Error {
  constructor(readonly evidence: "not-inspected" | "partially-inspected") {
    super("P2_EXECUTOR_OUTPUT_INVALID");
    this.name = "FixedViteEvidenceAccessError";
  }
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

interface BoundedRegularFileHandle {
  stat(): Promise<Readonly<{ size: number; isFile(): boolean }>>;
  read(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<Readonly<{ bytesRead: number }>>;
}

interface BoundedEventRead {
  readonly bytes: number;
  readonly rawSegment: string | null;
}

interface InspectResult {
  readonly containerId: string;
  readonly imageId: string;
  readonly configuredImage: string;
  readonly state: string;
  readonly exitCode: number;
}

interface FixedViteLifecycleAttempt {
  readonly lifecycle: FixedViteLifecycleResult | null;
  readonly inspectedImageId: string | null;
  readonly inspectedContainerExitCode: number | null;
  readonly failure: Error | null;
  readonly dockerSettlement: "known" | "unknown";
  readonly cleanupDisposition: ViteAttemptCleanupDisposition;
  readonly cleanupFailed: boolean;
}

interface FixedViteEvidence {
  readonly eventFile: Readonly<{
    present: boolean;
    bytes: number;
    rawSegment: string | null;
  }>;
  readonly directFile: Readonly<{ present: boolean; bytes: number }>;
  readonly entryFile: Readonly<{ present: boolean; bytes: number }>;
}

interface FixedViteEvidenceAvailability {
  readonly eventFile: Readonly<{ present: boolean; bytes: number }>;
  readonly directFile: Readonly<{ present: boolean; bytes: number }>;
  readonly entryFile: Readonly<{ present: boolean; bytes: number }>;
}

interface FixedViteFinalizationBackend {
  writeAttempt(record: ViteExecutionAttemptRecord): Promise<void>;
  readEvidence(): Promise<FixedViteEvidence>;
  writeReceipt(receipt: ViteExecutionReceipt): Promise<void>;
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
  return plan.adapterId === "vite";
}

const FIXED_VITE_CONTAINER_NAMES = Object.freeze({
  "vite-observe-p": "tskaigi-p2-vite-observe-p-20260719-02",
  "vite-observe-c": "tskaigi-p2-vite-observe-c-20260719-02",
} as const);

function fixedViteContainerName(selected: ViteSelectedPlan): string {
  const nameIndex = selected.create.arguments.indexOf("--name");
  const createName = selected.create.arguments[nameIndex + 1];
  const expectedName = FIXED_VITE_CONTAINER_NAMES[selected.scenarioId];
  if (nameIndex < 0 || createName !== expectedName) {
    throw new Error("P2_EXECUTOR_PLAN_INVALID");
  }
  return createName;
}

export function createFixedViteExecutionPlans(): readonly FixedViteExecutionPlan[] {
  return Object.freeze(
    createFixedSelectedScenarioPlans()
      .filter(isVitePlan)
      .map((selected) => {
        const containerName = fixedViteContainerName(selected);
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
          start: fixedDockerCommand(environment, [
            "start",
            "--attach",
            containerName,
          ]),
          remove: fixedDockerCommand(environment, [
            "rm",
            "--force",
            containerName,
          ]),
        });
      }),
  );
}

async function requireAbsent(filePath: string): Promise<void> {
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
    throw new Error("P2_EXECUTOR_FILESYSTEM_FAILED");
  }
  throw new Error("P2_EXECUTOR_RESULT_EXISTS");
}

async function listStagedFiles(
  stagingRoot: string,
  relativeRoot = "",
): Promise<readonly string[]> {
  const directory = path.join(stagingRoot, relativeRoot);
  const entries = await readdir(directory, { withFileTypes: true });
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

async function verifyFixedStaging(): Promise<void> {
  const staging = createFixedViteStagingPlan();
  const expectedTargets = staging.entries
    .map((entry) => entry.targetPath)
    .sort((left, right) => left.localeCompare(right));
  const actualTargets = [...(await listStagedFiles(staging.stagingRoot))].sort(
    (left, right) => left.localeCompare(right),
  );
  if (
    actualTargets.length !== expectedTargets.length ||
    actualTargets.some((target, index) => target !== expectedTargets[index])
  ) {
    throw new Error("P2_EXECUTOR_STAGING_INVALID");
  }
  for (const entry of staging.entries) {
    const targetPath = path.join(staging.stagingRoot, entry.targetPath);
    const [source, target, sourceStat, targetStat] = await Promise.all([
      readFile(entry.sourcePath),
      readFile(targetPath),
      lstat(entry.sourcePath),
      lstat(targetPath),
    ]);
    if (
      !sourceStat.isFile() ||
      sourceStat.isSymbolicLink() ||
      !targetStat.isFile() ||
      targetStat.isSymbolicLink() ||
      (targetStat.mode & 0o777) !== entry.mode ||
      !source.equals(target)
    ) {
      throw new Error("P2_EXECUTOR_STAGING_INVALID");
    }
  }
}

export function verifyFixedViteStagingForTest(): Promise<void> {
  return verifyFixedStaging();
}

async function prepareFixedRunRoot(plan: ViteSelectedPlan): Promise<void> {
  await requireAbsent(plan.resultRoot);
  const dockerConfigRoot = path.join(plan.resultRoot, "docker-config");
  const writableRoots = [
    path.join(plan.resultRoot, "result"),
    path.join(plan.resultRoot, "tool"),
    path.join(plan.resultRoot, "direct-write"),
  ];
  await mkdir(dockerConfigRoot, { recursive: true, mode: 0o700 });
  await chmod(dockerConfigRoot, 0o700);
  await writeFile(path.join(dockerConfigRoot, "config.json"), "{}\n", {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  for (const writableRoot of writableRoots) {
    await mkdir(writableRoot, { mode: 0o777 });
    await chmod(writableRoot, 0o777);
  }
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
    let primaryFailure: FixedCommandFailureCode | null = null;
    let signalAccepted: boolean | null = null;
    let settled = false;
    let commandTimer: ReturnType<typeof setTimeout> | null = null;
    let settlementTimer: ReturnType<typeof setTimeout> | null = null;
    const clearTimers = (): void => {
      if (commandTimer !== null) clearTimeout(commandTimer);
      if (settlementTimer !== null) clearTimeout(settlementTimer);
    };
    const beginFailure = (failureCode: FixedCommandFailureCode): void => {
      if (settled || primaryFailure !== null) return;
      primaryFailure = failureCode;
      stdout.length = 0;
      stderr.length = 0;
      if (commandTimer !== null) clearTimeout(commandTimer);
      signalAccepted = child.kill();
      settlementTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        clearTimers();
        reject(
          new FixedViteCommandError(
            primaryFailure ?? failureCode,
            "unknown",
            signalAccepted,
          ),
        );
      }, limits.settlementMs);
    };
    const count = (target: Buffer[], chunk: Buffer): void => {
      if (settled || primaryFailure !== null) return;
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
      if (primaryFailure !== null) {
        const acceptedDisposition =
          signalAccepted === true &&
          exitCode === null &&
          signalCode === "SIGKILL";
        reject(
          new FixedViteCommandError(
            primaryFailure,
            acceptedDisposition ? "closed" : "unknown",
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

function runFixedDockerCommand(
  plan: FixedViteExecutionPlan,
  command: FixedDockerCommand,
): Promise<FixedViteCommandResult> {
  return runBoundedFixedDockerCommand(
    command,
    (fixedCommand) =>
      adaptChildProcess(
        spawn(fixedCommand.executable, fixedCommand.arguments, {
          env: { ...fixedCommand.environment },
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        }),
      ),
    {
      timeoutMs:
        command === plan.start
          ? DOCKER_START_TIMEOUT_MS
          : DOCKER_COMMAND_TIMEOUT_MS,
      settlementMs: DOCKER_SETTLEMENT_MS,
      outputBytes: DOCKER_OUTPUT_BYTES,
    },
  );
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

function requireSuccessfulCommand(result: FixedViteCommandResult): void {
  if (result.exitCode !== 0 || result.stderr !== "") {
    throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  }
}

function parseContainerId(result: FixedViteCommandResult): string {
  requireSuccessfulCommand(result);
  const containerId = result.stdout.trim();
  if (!/^[0-9a-f]{64}$/u.test(containerId)) {
    throw new Error("P2_EXECUTOR_CREATE_INVALID");
  }
  return containerId;
}

function parseInspect(result: FixedViteCommandResult): InspectResult {
  requireSuccessfulCommand(result);
  const fields = result.stdout.trim().split("|");
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

function requireInspect(
  inspect: InspectResult,
  plan: FixedViteExecutionPlan,
  containerId: string,
  expectedState: "created" | "exited",
): void {
  if (
    inspect.containerId !== containerId ||
    inspect.configuredImage !== FIXED_NODE_IMAGE ||
    inspect.state !== expectedState ||
    !Number.isSafeInteger(inspect.exitCode) ||
    !plan.create.arguments.includes(FIXED_NODE_IMAGE)
  ) {
    throw new Error("P2_EXECUTOR_INSPECT_INVALID");
  }
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const fixed = [...expected].sort();
  return (
    keys.length === fixed.length &&
    keys.every((key, index) => key === fixed[index])
  );
}

function parseRunnerOutput(
  result: FixedViteCommandResult,
  plan: ViteSelectedPlan,
): Readonly<{
  disposition: ViteRunnerDisposition;
  summary: ViteRunnerSummary | null;
}> {
  if (result.exitCode === 0 && result.stderr === "") {
    try {
      const value: unknown = JSON.parse(result.stdout);
      if (
        !plainRecord(value) ||
        !exactKeys(value, [
          "outputFiles",
          "profileId",
          "scenarioId",
          "sourceAfterHash",
          "sourceBeforeHash",
          "status",
        ]) ||
        value.status !== "completed" ||
        value.scenarioId !== plan.scenarioId ||
        value.profileId !== plan.profileId ||
        typeof value.sourceBeforeHash !== "string" ||
        typeof value.sourceAfterHash !== "string" ||
        !/^sha256:[0-9a-f]{64}$/u.test(value.sourceBeforeHash) ||
        !/^sha256:[0-9a-f]{64}$/u.test(value.sourceAfterHash) ||
        !Array.isArray(value.outputFiles) ||
        value.outputFiles.length !== 1 ||
        !plainRecord(value.outputFiles[0]) ||
        !exactKeys(value.outputFiles[0], ["bytes", "logicalId"]) ||
        value.outputFiles[0].logicalId !== "vite-entry-output" ||
        !Number.isSafeInteger(value.outputFiles[0].bytes) ||
        (value.outputFiles[0].bytes as number) <= 0 ||
        (value.outputFiles[0].bytes as number) > OUTPUT_FILE_BYTES
      ) {
        throw new FixedViteRunnerBoundaryError();
      }
      return Object.freeze({
        disposition: Object.freeze({
          status: "completed",
          failureCode: null,
          settlement: "known",
          settlementCode: null,
        }),
        summary: Object.freeze({
          sourceBeforeHash: value.sourceBeforeHash,
          sourceAfterHash: value.sourceAfterHash,
          entryOutputBytes: value.outputFiles[0].bytes as number,
        }),
      });
    } catch (error) {
      if (error instanceof FixedViteRunnerBoundaryError) throw error;
      throw new FixedViteRunnerBoundaryError();
    }
  }

  if (result.exitCode !== 0 && result.stdout === "") {
    try {
      const value: unknown = JSON.parse(result.stderr);
      const failureCodes = new Set<ViteRunnerFailureCode>([
        "P2_CHILD_FAILED",
        "P2_CHILD_TIMEOUT",
        "P2_OUTPUT_LIMIT",
        "P2_RESULT_INVALID",
        "P2_RUNNER_FAILED",
        "P2_SERVER_CLOSE_FAILED",
      ]);
      const settlements = new Set(["known", "unknown"]);
      const settlementCodes = new Set<ViteRunnerSettlementCode>([
        "P2_CHILD_SETTLEMENT_UNKNOWN",
        "P2_SERVER_SETTLEMENT_UNKNOWN",
      ]);
      const childSettlementFailureCodes = new Set<ViteRunnerFailureCode>([
        "P2_CHILD_FAILED",
        "P2_CHILD_TIMEOUT",
        "P2_OUTPUT_LIMIT",
      ]);
      const serverSettlementFailureCodes = new Set<ViteRunnerFailureCode>([
        "P2_CHILD_FAILED",
        "P2_CHILD_TIMEOUT",
        "P2_OUTPUT_LIMIT",
        "P2_RESULT_INVALID",
        "P2_SERVER_CLOSE_FAILED",
      ]);
      if (
        !plainRecord(value) ||
        !exactKeys(value, [
          "code",
          "failureCode",
          "settlement",
          "settlementCode",
          "status",
        ]) ||
        value.status !== "failure" ||
        value.code !== "P2_RUNNER_FAILED" ||
        !failureCodes.has(value.failureCode as ViteRunnerFailureCode) ||
        !settlements.has(value.settlement as string) ||
        !(
          (value.settlement === "known" && value.settlementCode === null) ||
          (value.settlement === "unknown" &&
            settlementCodes.has(
              value.settlementCode as ViteRunnerSettlementCode,
            ) &&
            ((value.settlementCode === "P2_CHILD_SETTLEMENT_UNKNOWN" &&
              childSettlementFailureCodes.has(
                value.failureCode as ViteRunnerFailureCode,
              )) ||
              (value.settlementCode === "P2_SERVER_SETTLEMENT_UNKNOWN" &&
                serverSettlementFailureCodes.has(
                  value.failureCode as ViteRunnerFailureCode,
                ))))
        )
      ) {
        throw new FixedViteRunnerBoundaryError();
      }
      return Object.freeze({
        disposition: Object.freeze({
          status: "failure",
          failureCode: value.failureCode as ViteRunnerFailureCode,
          settlement: value.settlement as "known" | "unknown",
          settlementCode:
            value.settlementCode as ViteRunnerSettlementCode | null,
        }),
        summary: null,
      });
    } catch (error) {
      if (error instanceof FixedViteRunnerBoundaryError) throw error;
      throw new FixedViteRunnerBoundaryError();
    }
  }
  throw new FixedViteRunnerBoundaryError();
}

export function validateFixedViteLifecycle(input: {
  readonly plan: FixedViteExecutionPlan;
  readonly create: FixedViteCommandResult;
  readonly beforeInspect: FixedViteCommandResult;
  readonly start: FixedViteCommandResult;
  readonly afterInspect: FixedViteCommandResult;
}): Omit<FixedViteLifecycleResult, "cleanup"> {
  const containerId = parseContainerId(input.create);
  const before = parseInspect(input.beforeInspect);
  requireInspect(before, input.plan, containerId, "created");
  const after = parseInspect(input.afterInspect);
  requireInspect(after, input.plan, containerId, "exited");
  if (
    after.imageId !== before.imageId ||
    input.start.exitCode !== after.exitCode
  ) {
    throw new Error("P2_EXECUTOR_INSPECT_INVALID");
  }
  const runner = parseRunnerOutput(input.start, input.plan.selected);
  return Object.freeze({
    imageId: after.imageId,
    containerExitCode: after.exitCode,
    runner: runner.disposition,
    runnerSummary: runner.summary,
  });
}

async function optionalRegularFile(
  filePath: string,
  expectedMode?: number,
): Promise<Readonly<{ present: boolean; bytes: number }>> {
  try {
    const file = await lstat(filePath);
    if (
      !file.isFile() ||
      file.isSymbolicLink() ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      (expectedMode !== undefined && (file.mode & 0o7777) !== expectedMode)
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
    return Object.freeze({ present: true, bytes: file.size });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0 });
    }
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
}

async function inspectFixedOutputEntry(
  outputRoot: string,
): Promise<Readonly<{ present: boolean; bytes: number }>> {
  try {
    const outputDirectory = await lstat(outputRoot);
    if (
      !outputDirectory.isDirectory() ||
      outputDirectory.isSymbolicLink() ||
      (outputDirectory.mode & 0o7777) !== 0o555
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0 });
    }
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  let entries;
  try {
    entries = await readdir(outputRoot, { withFileTypes: true });
  } catch {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  if (
    entries.length !== 1 ||
    entries[0]?.name !== ENTRY_OUTPUT ||
    !entries[0].isFile() ||
    entries[0].isSymbolicLink()
  ) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  return optionalRegularFile(path.join(outputRoot, ENTRY_OUTPUT), 0o444);
}

async function readBoundedEventHandle(
  handle: BoundedRegularFileHandle,
): Promise<BoundedEventRead> {
  const before = await handle.stat();
  if (
    !before.isFile() ||
    !Number.isSafeInteger(before.size) ||
    before.size < 0
  ) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  if (before.size > EVENT_SEGMENT_BYTES) {
    return Object.freeze({ bytes: before.size, rawSegment: null });
  }
  const buffer = Buffer.alloc(EVENT_SEGMENT_BYTES + 1);
  let offset = 0;
  while (offset < buffer.byteLength) {
    const read = await handle.read(
      buffer,
      offset,
      buffer.byteLength - offset,
      offset,
    );
    if (
      !Number.isSafeInteger(read.bytesRead) ||
      read.bytesRead < 0 ||
      read.bytesRead > buffer.byteLength - offset
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
    if (read.bytesRead === 0) break;
    offset += read.bytesRead;
  }
  const after = await handle.stat();
  if (!after.isFile() || !Number.isSafeInteger(after.size) || after.size < 0) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  const stableAndBounded =
    before.size === after.size &&
    offset === before.size &&
    offset <= EVENT_SEGMENT_BYTES;
  return Object.freeze({
    bytes: after.size,
    rawSegment: stableAndBounded
      ? buffer.subarray(0, offset).toString("utf8")
      : null,
  });
}

async function readBoundedEventFile(filePath: string): Promise<
  Readonly<{
    present: boolean;
    bytes: number;
    rawSegment: string | null;
  }>
> {
  let handle: FileHandle;
  try {
    handle = await open(
      filePath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0, rawSegment: null });
    }
    throw new FixedViteEvidenceAccessError("not-inspected");
  }
  try {
    const result = await readBoundedEventHandle(handle);
    try {
      await handle.close();
    } catch {
      throw new FixedViteEvidenceAccessError("partially-inspected");
    }
    return Object.freeze({ present: true, ...result });
  } catch {
    try {
      await handle.close();
    } catch {
      // The explicit partial-inspection state already bounds close failure.
    }
    throw new FixedViteEvidenceAccessError("partially-inspected");
  }
}

export function readBoundedViteEventHandleForTest(
  handle: BoundedRegularFileHandle,
): Promise<BoundedEventRead> {
  return readBoundedEventHandle(handle);
}

async function inspectFixedEvidenceAvailability(
  resultRoot: string,
): Promise<FixedViteEvidenceAvailability> {
  const eventPath = path.join(resultRoot, "result", EVENT_SEGMENT);
  const directPath = path.join(resultRoot, "direct-write", DIRECT_WRITE_MARKER);
  const outputRoot = path.join(resultRoot, "tool", "out");
  try {
    const eventFile = await optionalRegularFile(eventPath, 0o444);
    const directFile = await optionalRegularFile(directPath);
    const entryFile = await inspectFixedOutputEntry(outputRoot);
    return Object.freeze({ eventFile, directFile, entryFile });
  } catch {
    throw new FixedViteEvidenceAccessError("not-inspected");
  }
}

async function readFixedEvidenceFromRoot(
  resultRoot: string,
): Promise<FixedViteEvidence> {
  const availability = await inspectFixedEvidenceAvailability(resultRoot);
  const eventFile = availability.eventFile.present
    ? await readBoundedEventFile(path.join(resultRoot, "result", EVENT_SEGMENT))
    : Object.freeze({ present: false, bytes: 0, rawSegment: null });
  return Object.freeze({
    eventFile,
    directFile: availability.directFile,
    entryFile: availability.entryFile,
  });
}

async function readFixedEvidence(
  plan: FixedViteExecutionPlan,
): Promise<FixedViteEvidence> {
  return readFixedEvidenceFromRoot(plan.selected.resultRoot);
}

export function readFixedViteEvidenceFromRootForTest(
  resultRoot: string,
): Promise<FixedViteEvidence> {
  return readFixedEvidenceFromRoot(resultRoot);
}

function productionFinalizationBackend(
  plan: FixedViteExecutionPlan,
): FixedViteFinalizationBackend {
  return Object.freeze({
    async writeAttempt(record: ViteExecutionAttemptRecord) {
      await writeFile(
        path.join(plan.selected.resultRoot, ATTEMPT_FILE),
        `${JSON.stringify(record)}\n`,
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    },
    readEvidence() {
      return readFixedEvidence(plan);
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

function buildReceipt(
  plan: FixedViteExecutionPlan,
  lifecycle: FixedViteLifecycleResult,
  evidence: FixedViteEvidence,
): ViteExecutionReceipt {
  const { eventFile, directFile, entryFile } = evidence;
  const projected = projectViteProfileSegment({
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    rawSegment: eventFile.rawSegment ?? "",
  });
  const directWriteMatches =
    plan.selected.profileId === "permissive"
      ? directFile.present &&
        directFile.bytes > 0 &&
        directFile.bytes <= OUTPUT_FILE_BYTES
      : !directFile.present;
  const runtimeSummaryMatches =
    lifecycle.containerExitCode === 0 &&
    lifecycle.cleanup === "completed" &&
    lifecycle.runner.status === "completed" &&
    lifecycle.runnerSummary !== null &&
    lifecycle.runnerSummary.sourceBeforeHash ===
      lifecycle.runnerSummary.sourceAfterHash &&
    eventFile.present &&
    eventFile.rawSegment !== null &&
    entryFile.present &&
    entryFile.bytes === lifecycle.runnerSummary.entryOutputBytes &&
    entryFile.bytes <= OUTPUT_FILE_BYTES &&
    directWriteMatches;
  const projection: ViteProfileProjection = runtimeSummaryMatches
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
    schemaVersion: "p2-vite-execution/v1",
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    imageId: lifecycle.imageId,
    nodeVersion: NODE_VERSION,
    viteVersion: VITE_VERSION,
    rollupVersion: ROLLUP_VERSION,
    esbuildVersion: ESBUILD_VERSION,
    containerExitCode: lifecycle.containerExitCode,
    completion: runtimeSummaryMatches ? "complete" : "inconclusive",
    cleanup: lifecycle.cleanup,
    runner: lifecycle.runner,
    sourceBeforeHash: lifecycle.runnerSummary?.sourceBeforeHash ?? null,
    sourceAfterHash: lifecycle.runnerSummary?.sourceAfterHash ?? null,
    output: Object.freeze({
      eventSegmentPresent: eventFile.present,
      eventSegmentBytes: eventFile.bytes,
      entryOutputPresent: entryFile.present,
      entryOutputBytes: entryFile.bytes,
      directWritePresent: directFile.present,
      directWriteBytes: directFile.bytes,
    }),
    projection,
  });
}

function normalizedError(error: unknown): Error {
  return error instanceof Error ? error : new Error("P2_EXECUTOR_FAILED");
}

function settlementUnknown(error: Error): boolean {
  if (
    error instanceof FixedViteCommandError ||
    error instanceof FixedViteRunnerBoundaryError
  ) {
    return error.settlement === "unknown";
  }
  return (
    error instanceof FixedViteExecutionError && settlementUnknown(error.primary)
  );
}

function dockerSettlementUnknown(error: Error): boolean {
  if (error instanceof FixedViteCommandError) {
    return error.settlement === "unknown";
  }
  return (
    error instanceof FixedViteExecutionError &&
    dockerSettlementUnknown(error.primary)
  );
}

function runnerDispositionInvalid(error: Error): boolean {
  if (error instanceof FixedViteRunnerBoundaryError) return true;
  return (
    error instanceof FixedViteExecutionError &&
    runnerDispositionInvalid(error.primary)
  );
}

function withCleanupFailure(primary: Error): FixedViteExecutionError {
  if (primary instanceof FixedViteExecutionError) {
    return new FixedViteExecutionError(primary.primary, [
      ...primary.secondaryCodes,
      "P2_EXECUTOR_CLEANUP_FAILED",
    ]);
  }
  return new FixedViteExecutionError(primary, ["P2_EXECUTOR_CLEANUP_FAILED"]);
}

async function executeFixedViteLifecycleAttempt(
  plan: FixedViteExecutionPlan,
  runCommand: (command: FixedDockerCommand) => Promise<FixedViteCommandResult>,
): Promise<FixedViteLifecycleAttempt> {
  let ownedContainerId: string | null = null;
  let inspectedImageId: string | null = null;
  let inspectedContainerExitCode: number | null = null;
  let lifecycle: Omit<FixedViteLifecycleResult, "cleanup"> | undefined;
  let primaryFailure: Error | undefined;
  let cleanupFailure: Error | undefined;
  try {
    const create = await runCommand(plan.create);
    ownedContainerId = parseContainerId(create);
    const beforeInspect = await runCommand(plan.inspect);
    const before = parseInspect(beforeInspect);
    requireInspect(before, plan, ownedContainerId, "created");
    inspectedImageId = before.imageId;
    const start = await runCommand(plan.start);
    const afterInspect = await runCommand(plan.inspect);
    const after = parseInspect(afterInspect);
    requireInspect(after, plan, ownedContainerId, "exited");
    inspectedContainerExitCode = after.exitCode;
    if (
      after.imageId !== inspectedImageId ||
      start.exitCode !== after.exitCode
    ) {
      throw new Error("P2_EXECUTOR_INSPECT_INVALID");
    }
    const runner = parseRunnerOutput(start, plan.selected);
    lifecycle = Object.freeze({
      imageId: after.imageId,
      containerExitCode: after.exitCode,
      runner: runner.disposition,
      runnerSummary: runner.summary,
    });
  } catch (error) {
    primaryFailure = normalizedError(error);
  }

  const runnerSettlementUnknown = lifecycle?.runner.settlement === "unknown";
  const cleanupSuppressed =
    runnerSettlementUnknown ||
    (primaryFailure !== undefined && settlementUnknown(primaryFailure));
  let cleanupDisposition: ViteAttemptCleanupDisposition =
    ownedContainerId === null ? "not-required" : "completed";
  if (runnerSettlementUnknown) {
    cleanupDisposition = "suppressed-runner-settlement-unknown";
  } else if (
    primaryFailure !== undefined &&
    settlementUnknown(primaryFailure)
  ) {
    cleanupDisposition = dockerSettlementUnknown(primaryFailure)
      ? "suppressed-docker-settlement-unknown"
      : "suppressed-runner-settlement-unknown";
  }
  if (ownedContainerId !== null && !cleanupSuppressed) {
    try {
      requireSuccessfulCommand(await runCommand(plan.remove));
    } catch (error) {
      cleanupFailure = normalizedError(error);
      cleanupDisposition = "failed";
      primaryFailure =
        primaryFailure === undefined
          ? cleanupFailure
          : withCleanupFailure(primaryFailure);
    }
  }

  const failure =
    primaryFailure ??
    (lifecycle === undefined ? new Error("P2_EXECUTOR_FAILED") : null);
  const completedLifecycle =
    lifecycle === undefined
      ? null
      : Object.freeze({
          ...lifecycle,
          cleanup: runnerSettlementUnknown
            ? ("suppressed-runner-settlement-unknown" as const)
            : ("completed" as const),
        });
  return Object.freeze({
    lifecycle: completedLifecycle,
    inspectedImageId,
    inspectedContainerExitCode,
    failure,
    dockerSettlement:
      (failure !== null && dockerSettlementUnknown(failure)) ||
      (cleanupFailure !== undefined && dockerSettlementUnknown(cleanupFailure))
        ? "unknown"
        : "known",
    cleanupDisposition,
    cleanupFailed: cleanupFailure !== undefined,
  });
}

export function executeFixedViteLifecycleWithBackendForTest(
  plan: FixedViteExecutionPlan,
  runCommand: (command: FixedDockerCommand) => Promise<FixedViteCommandResult>,
): Promise<FixedViteLifecycleResult> {
  return executeFixedViteLifecycleAttempt(plan, runCommand).then((attempt) => {
    if (attempt.failure !== null || attempt.lifecycle === null) {
      throw attempt.failure ?? new Error("P2_EXECUTOR_FAILED");
    }
    return attempt.lifecycle;
  });
}

function buildAttemptRecord(
  plan: FixedViteExecutionPlan,
  lifecycleAttempt: FixedViteLifecycleAttempt,
): ViteExecutionAttemptRecord {
  const { lifecycle, failure } = lifecycleAttempt;
  const runner = lifecycle?.runner ?? null;
  const outputAvailability =
    runner?.status === "completed" && runner.settlement === "known"
      ? "fixed-paths-exported"
      : "not-inspected";
  const receiptPending =
    failure === null &&
    lifecycle !== null &&
    lifecycle.containerExitCode === 0 &&
    lifecycle.cleanup === "completed" &&
    runner?.status === "completed" &&
    runner.settlement === "known" &&
    lifecycle.runnerSummary !== null;
  const issues: ViteAttemptIssueCode[] = [];
  if (failure !== null) {
    issues.push(
      runnerDispositionInvalid(failure)
        ? "P2_ATTEMPT_RUNNER_DISPOSITION_INVALID"
        : "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED",
    );
  }
  if (lifecycleAttempt.dockerSettlement === "unknown") {
    issues.push("P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN");
  }
  if (runner?.status === "failure") {
    issues.push("P2_ATTEMPT_RUNNER_FAILED");
  }
  if (
    runner?.settlement === "unknown" ||
    (failure !== null && runnerDispositionInvalid(failure))
  ) {
    issues.push("P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN");
  }
  if (lifecycleAttempt.cleanupFailed) {
    issues.push("P2_ATTEMPT_CLEANUP_FAILED");
  }
  if (outputAvailability === "not-inspected") {
    issues.push("P2_ATTEMPT_OUTPUT_NOT_INSPECTED");
  }
  return Object.freeze({
    schemaVersion: "p2-vite-attempt/v1",
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    attemptStatus: receiptPending ? "receipt-pending" : "inconclusive",
    inspectedImageId: lifecycleAttempt.inspectedImageId,
    inspectedContainerExitCode: lifecycleAttempt.inspectedContainerExitCode,
    dockerSettlement: lifecycleAttempt.dockerSettlement,
    runnerSettlement:
      runner?.settlement ??
      (failure !== null && runnerDispositionInvalid(failure)
        ? "unknown"
        : "not-established"),
    cleanupDisposition: lifecycleAttempt.cleanupDisposition,
    runner,
    outputAvailability,
    issues: Object.freeze(issues),
  });
}

async function finalizeFixedViteExecution(
  plan: FixedViteExecutionPlan,
  lifecycleAttempt: FixedViteLifecycleAttempt,
  backend: FixedViteFinalizationBackend,
): Promise<ViteExecutionOutcome> {
  const attempt = buildAttemptRecord(plan, lifecycleAttempt);
  try {
    await backend.writeAttempt(attempt);
  } catch {
    return Object.freeze({
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      runId: plan.selected.runId,
      completion: "failure",
      attemptRecord: "not-written",
      evidence: "not-inspected",
      receipt: null,
      attempt: null,
      issues: Object.freeze(["P2_ATTEMPT_RECORD_WRITE_FAILED" as const]),
    });
  }

  if (
    attempt.attemptStatus !== "receipt-pending" ||
    lifecycleAttempt.lifecycle === null
  ) {
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
    const evidence = await backend.readEvidence();
    receipt = buildReceipt(plan, lifecycleAttempt.lifecycle, evidence);
  } catch (error) {
    const evidence =
      error instanceof FixedViteEvidenceAccessError
        ? error.evidence
        : "not-inspected";
    return Object.freeze({
      scenarioId: attempt.scenarioId,
      profileId: attempt.profileId,
      runId: attempt.runId,
      completion: "inconclusive",
      attemptRecord: "written",
      evidence,
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

export function finalizeFixedViteLifecycleWithBackendForTest(
  plan: FixedViteExecutionPlan,
  lifecycle: FixedViteLifecycleResult,
  backend: FixedViteFinalizationBackend,
): Promise<ViteExecutionOutcome> {
  return finalizeFixedViteExecution(
    plan,
    Object.freeze({
      lifecycle,
      inspectedImageId: lifecycle.imageId,
      inspectedContainerExitCode: lifecycle.containerExitCode,
      failure: null,
      dockerSettlement: "known",
      cleanupDisposition: lifecycle.cleanup,
      cleanupFailed: false,
    }),
    backend,
  );
}

export async function executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
  plan: FixedViteExecutionPlan,
  runCommand: (command: FixedDockerCommand) => Promise<FixedViteCommandResult>,
  backend: FixedViteFinalizationBackend,
): Promise<ViteExecutionOutcome> {
  const lifecycleAttempt = await executeFixedViteLifecycleAttempt(
    plan,
    runCommand,
  );
  return finalizeFixedViteExecution(plan, lifecycleAttempt, backend);
}

async function executeOne(
  plan: FixedViteExecutionPlan,
): Promise<ViteExecutionOutcome> {
  await prepareFixedRunRoot(plan.selected);
  const lifecycleAttempt = await executeFixedViteLifecycleAttempt(
    plan,
    (command) => runFixedDockerCommand(plan, command),
  );
  return finalizeFixedViteExecution(
    plan,
    lifecycleAttempt,
    productionFinalizationBackend(plan),
  );
}

export function projectFixedViteExecutionPair(
  receipts: readonly Pick<
    ViteExecutionReceipt,
    "completion" | "imageId" | "profileId" | "runId" | "scenarioId"
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
        receipt.runId === selected.runId
      );
    });
  const imageMatches =
    identityMatches &&
    receipts[0]?.imageId !== undefined &&
    receipts[0].imageId === receipts[1]?.imageId;
  const executionComplete =
    identityMatches &&
    receipts.every((receipt) => receipt.completion === "complete");
  const issues: ViteExecutionPairProjection["issues"][number][] = [];
  if (!identityMatches) {
    issues.push("PAIR_IDENTITY_MISMATCH");
  } else {
    if (!imageMatches) issues.push("IMAGE_ID_MISMATCH");
    if (!executionComplete) issues.push("PAIR_EXECUTION_INCOMPLETE");
  }
  return Object.freeze({
    schemaVersion: "p2-vite-pair/v1",
    validity: imageMatches && executionComplete ? "same-image" : "inconclusive",
    imageId: imageMatches ? (receipts[0]?.imageId ?? null) : null,
    issues: Object.freeze(issues),
  });
}

export async function executeFixedViteProfiles(): Promise<ViteExecutionPair> {
  await verifyFixedStaging();
  const receipts: ViteExecutionReceipt[] = [];
  const outcomes: ViteExecutionOutcome[] = [];
  for (const plan of createFixedViteExecutionPlans()) {
    const outcome = await executeOne(plan);
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

export function projectFixedViteEntryResult(
  pair: ViteExecutionPair,
): ViteExecutionEntryProjection {
  const hasRecordFailure = pair.outcomes.some(
    (outcome) => outcome.attemptRecord === "not-written",
  );
  return Object.freeze({
    status: hasRecordFailure
      ? "failure"
      : pair.projection.validity === "same-image"
        ? "completed"
        : "inconclusive",
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
