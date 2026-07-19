import { spawn, type ChildProcessByStdio } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  type FileHandle,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { clearTimeout, setTimeout } from "node:timers";

import { createFixedCodegenStagingPlan } from "../runner/codegen-staging.js";
import {
  projectCodegenProfileSegment,
  type CodegenProfileProjection,
  type CodegenScenarioId,
} from "./codegen-projection.js";
import {
  createFixedSelectedScenarioPlans,
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
  type FixedDockerCommand,
  type SelectedScenarioPlan,
} from "./plan.js";

const DOCKER_TIMEOUT_MS = 20_000;
const DOCKER_SETTLEMENT_MS = 1_000;
const DOCKER_OUTPUT_BYTES = 16_384;
const EVENT_SEGMENT_BYTES = 65_536;
const EVENT_SEGMENT = "codegen-cli-producer.jsonl";
const DIRECT_WRITE_MARKER = "direct-write-marker.json";
const SUMMARY_FILE = "summary.json";
const NODE_VERSION = "v20.18.2";
const CODEGEN_VERSION = "0.0.0";
const INSPECT_FORMAT =
  "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|{{.State.ExitCode}}";

type CodegenSelectedPlan = SelectedScenarioPlan & {
  readonly scenarioId: CodegenScenarioId;
  readonly adapterId: "codegen";
};

export interface FixedCodegenExecutionPlan {
  readonly selected: CodegenSelectedPlan;
  readonly containerName: string;
  readonly create: FixedDockerCommand;
  readonly inspect: FixedDockerCommand;
  readonly start: FixedDockerCommand;
  readonly remove: FixedDockerCommand;
}

export interface CodegenExecutionReceipt {
  readonly schemaVersion: "p2-codegen-execution/v1";
  readonly scenarioId: CodegenScenarioId;
  readonly profileId: "permissive" | "constrained";
  readonly runId: string;
  readonly imageId: string;
  readonly nodeVersion: typeof NODE_VERSION;
  readonly codegenVersion: typeof CODEGEN_VERSION;
  readonly containerExitCode: number;
  readonly sourceBeforeHash: string | null;
  readonly sourceAfterHash: string | null;
  readonly output: Readonly<{
    eventSegmentPresent: boolean;
    eventSegmentBytes: number;
    directWritePresent: boolean;
    directWriteBytes: number;
  }>;
  readonly projection: CodegenProfileProjection;
}

export interface CodegenExecutionPairProjection {
  readonly schemaVersion: "p2-codegen-pair/v1";
  readonly validity: "same-image" | "inconclusive";
  readonly imageId: string | null;
  readonly issues: readonly ("PAIR_IDENTITY_MISMATCH" | "IMAGE_ID_MISMATCH")[];
}

export interface CodegenExecutionPair {
  readonly projection: CodegenExecutionPairProjection;
  readonly receipts: readonly CodegenExecutionReceipt[];
}

export interface FixedCodegenCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

type FixedCommandFailureCode =
  | "P2_EXECUTOR_DOCKER_FAILED"
  | "P2_EXECUTOR_DOCKER_OUTPUT"
  | "P2_EXECUTOR_DOCKER_TIMEOUT";

export class FixedCodegenCommandError extends Error {
  constructor(
    readonly failureCode: FixedCommandFailureCode,
    readonly settlement: "closed" | "unknown",
    readonly signalAccepted: boolean | null,
  ) {
    super(failureCode);
    this.name = "FixedCodegenCommandError";
  }
}

export class FixedCodegenExecutionError extends Error {
  constructor(
    readonly primary: Error,
    readonly secondaryCodes: readonly "P2_EXECUTOR_CLEANUP_FAILED"[],
  ) {
    super(primary.message, { cause: primary });
    this.name = "FixedCodegenExecutionError";
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

interface RunnerSummary {
  readonly sourceBeforeHash: string;
  readonly sourceAfterHash: string;
}

export interface FixedCodegenLifecycleResult {
  readonly imageId: string;
  readonly containerExitCode: number;
  readonly runnerSummary: RunnerSummary | null;
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

function isCodegenPlan(
  plan: SelectedScenarioPlan,
): plan is CodegenSelectedPlan {
  return plan.adapterId === "codegen";
}

export function createFixedCodegenExecutionPlans(): readonly FixedCodegenExecutionPlan[] {
  return Object.freeze(
    createFixedSelectedScenarioPlans()
      .filter(isCodegenPlan)
      .map((selected) => {
        const containerName = `tskaigi-p2-${selected.scenarioId}`;
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

async function verifyFixedStaging(): Promise<void> {
  const staging = createFixedCodegenStagingPlan();
  for (const entry of staging.entries) {
    const targetPath = path.join(staging.stagingRoot, entry.targetPath);
    const [source, target, targetStat] = await Promise.all([
      readFile(entry.sourcePath),
      readFile(targetPath),
      lstat(targetPath),
    ]);
    if (
      !targetStat.isFile() ||
      targetStat.isSymbolicLink() ||
      !source.equals(target)
    ) {
      throw new Error("P2_EXECUTOR_STAGING_INVALID");
    }
  }
}

async function prepareFixedRunRoot(plan: CodegenSelectedPlan): Promise<void> {
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
): Promise<FixedCodegenCommandResult> {
  return new Promise((resolve, reject) => {
    let child: FixedProcessHandle;
    try {
      child = launch(command);
    } catch {
      reject(
        new FixedCodegenCommandError(
          "P2_EXECUTOR_DOCKER_FAILED",
          "closed",
          null,
        ),
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
      if (commandTimer !== null) {
        clearTimeout(commandTimer);
      }
      if (settlementTimer !== null) {
        clearTimeout(settlementTimer);
      }
    };
    const beginFailure = (failureCode: FixedCommandFailureCode): void => {
      if (settled || primaryFailure !== null) {
        return;
      }
      primaryFailure = failureCode;
      stdout.length = 0;
      stderr.length = 0;
      if (commandTimer !== null) {
        clearTimeout(commandTimer);
      }
      signalAccepted = child.kill();
      settlementTimer = setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimers();
        reject(
          new FixedCodegenCommandError(
            primaryFailure ?? failureCode,
            "unknown",
            signalAccepted,
          ),
        );
      }, limits.settlementMs);
    };
    const count = (target: Buffer[], chunk: Buffer): void => {
      if (settled || primaryFailure !== null) {
        return;
      }
      outputBytes += chunk.byteLength;
      if (outputBytes > limits.outputBytes) {
        beginFailure("P2_EXECUTOR_DOCKER_OUTPUT");
        return;
      }
      target.push(Buffer.from(chunk));
    };
    child.onStdout((chunk) => count(stdout, chunk));
    child.onStderr((chunk) => count(stderr, chunk));
    child.onceError(() => {
      if (settled) {
        return;
      }
      beginFailure("P2_EXECUTOR_DOCKER_FAILED");
    });
    child.onceClose((exitCode, signalCode) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimers();
      if (primaryFailure !== null) {
        const acceptedDisposition =
          signalAccepted === true &&
          exitCode === null &&
          signalCode === "SIGKILL";
        reject(
          new FixedCodegenCommandError(
            primaryFailure,
            acceptedDisposition ? "closed" : "unknown",
            signalAccepted,
          ),
        );
        return;
      }
      if (exitCode === null || signalCode !== null) {
        reject(
          new FixedCodegenCommandError(
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
  command: FixedDockerCommand,
): Promise<FixedCodegenCommandResult> {
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
      timeoutMs: DOCKER_TIMEOUT_MS,
      settlementMs: DOCKER_SETTLEMENT_MS,
      outputBytes: DOCKER_OUTPUT_BYTES,
    },
  );
}

export function runFixedDockerCommandWithProcessForTest(
  command: FixedDockerCommand,
  launch: (command: FixedDockerCommand) => FixedProcessHandle,
  limits: Readonly<{
    timeoutMs: number;
    settlementMs: number;
    outputBytes: number;
  }>,
): Promise<FixedCodegenCommandResult> {
  return runBoundedFixedDockerCommand(command, launch, limits);
}

function requireSuccessfulCommand(result: FixedCodegenCommandResult): void {
  if (result.exitCode !== 0 || result.stderr !== "") {
    throw new Error("P2_EXECUTOR_DOCKER_FAILED");
  }
}

function parseContainerId(result: FixedCodegenCommandResult): string {
  requireSuccessfulCommand(result);
  const containerId = result.stdout.trim();
  if (!/^[0-9a-f]{64}$/u.test(containerId)) {
    throw new Error("P2_EXECUTOR_CREATE_INVALID");
  }
  return containerId;
}

function parseInspect(result: FixedCodegenCommandResult): InspectResult {
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
  plan: FixedCodegenExecutionPlan,
  containerId: string,
  expectedState: "created" | "exited",
): void {
  if (
    inspect.containerId !== containerId ||
    inspect.configuredImage !== FIXED_NODE_IMAGE ||
    inspect.state !== expectedState ||
    !Number.isSafeInteger(inspect.exitCode)
  ) {
    throw new Error("P2_EXECUTOR_INSPECT_INVALID");
  }
  if (!plan.create.arguments.includes(FIXED_NODE_IMAGE)) {
    throw new Error("P2_EXECUTOR_PLAN_INVALID");
  }
}

function parseRunnerSummary(
  result: FixedCodegenCommandResult,
  plan: CodegenSelectedPlan,
): RunnerSummary | null {
  if (result.exitCode !== 0 || result.stderr !== "") {
    return null;
  }
  try {
    const value: unknown = JSON.parse(result.stdout);
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      (value as Record<string, unknown>).status !== "completed" ||
      (value as Record<string, unknown>).scenarioId !== plan.scenarioId ||
      (value as Record<string, unknown>).profileId !== plan.profileId
    ) {
      return null;
    }
    const before = (value as Record<string, unknown>).sourceBeforeHash;
    const after = (value as Record<string, unknown>).sourceAfterHash;
    if (
      typeof before !== "string" ||
      typeof after !== "string" ||
      !/^[0-9a-f]{64}$/u.test(before) ||
      !/^[0-9a-f]{64}$/u.test(after)
    ) {
      return null;
    }
    return Object.freeze({ sourceBeforeHash: before, sourceAfterHash: after });
  } catch {
    return null;
  }
}

export function validateFixedCodegenLifecycle(input: {
  readonly plan: FixedCodegenExecutionPlan;
  readonly create: FixedCodegenCommandResult;
  readonly beforeInspect: FixedCodegenCommandResult;
  readonly start: FixedCodegenCommandResult;
  readonly afterInspect: FixedCodegenCommandResult;
}): FixedCodegenLifecycleResult {
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
  return Object.freeze({
    imageId: after.imageId,
    containerExitCode: after.exitCode,
    runnerSummary: parseRunnerSummary(input.start, input.plan.selected),
  });
}

async function optionalRegularFile(
  filePath: string,
): Promise<Readonly<{ present: boolean; bytes: number }>> {
  try {
    const file = await lstat(filePath);
    if (!file.isFile() || file.isSymbolicLink()) {
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
    if (read.bytesRead === 0) {
      break;
    }
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
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  try {
    const result = await readBoundedEventHandle(handle);
    return Object.freeze({ present: true, ...result });
  } catch {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  } finally {
    await handle.close();
  }
}

export function readBoundedEventHandleForTest(
  handle: BoundedRegularFileHandle,
): Promise<BoundedEventRead> {
  return readBoundedEventHandle(handle);
}

async function buildReceipt(
  plan: FixedCodegenExecutionPlan,
  lifecycle: FixedCodegenLifecycleResult,
): Promise<CodegenExecutionReceipt> {
  const eventPath = path.join(
    plan.selected.resultRoot,
    "result",
    EVENT_SEGMENT,
  );
  const directPath = path.join(
    plan.selected.resultRoot,
    "direct-write",
    DIRECT_WRITE_MARKER,
  );
  const [eventFile, directFile] = await Promise.all([
    readBoundedEventFile(eventPath),
    optionalRegularFile(directPath),
  ]);
  const projected = projectCodegenProfileSegment({
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    rawSegment: eventFile.rawSegment ?? "",
  });
  const runtimeSummaryMatches =
    lifecycle.runnerSummary !== null &&
    lifecycle.runnerSummary.sourceBeforeHash ===
      lifecycle.runnerSummary.sourceAfterHash;
  const projection: CodegenProfileProjection = runtimeSummaryMatches
    ? projected
    : Object.freeze({
        ...projected,
        validity: "inconclusive",
        issues: Object.freeze([
          ...projected.issues,
          "RUNTIME_SUMMARY_MISMATCH" as const,
        ]),
      });
  const receipt: CodegenExecutionReceipt = Object.freeze({
    schemaVersion: "p2-codegen-execution/v1",
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    imageId: lifecycle.imageId,
    nodeVersion: NODE_VERSION,
    codegenVersion: CODEGEN_VERSION,
    containerExitCode: lifecycle.containerExitCode,
    sourceBeforeHash: lifecycle.runnerSummary?.sourceBeforeHash ?? null,
    sourceAfterHash: lifecycle.runnerSummary?.sourceAfterHash ?? null,
    output: Object.freeze({
      eventSegmentPresent: eventFile.present,
      eventSegmentBytes: eventFile.bytes,
      directWritePresent: directFile.present,
      directWriteBytes: directFile.bytes,
    }),
    projection,
  });
  await writeFile(
    path.join(plan.selected.resultRoot, SUMMARY_FILE),
    `${JSON.stringify(receipt)}\n`,
    { encoding: "utf8", flag: "wx", mode: 0o600 },
  );
  return receipt;
}

function normalizedError(error: unknown): Error {
  return error instanceof Error ? error : new Error("P2_EXECUTOR_FAILED");
}

function settlementUnknown(error: Error): boolean {
  if (error instanceof FixedCodegenCommandError) {
    return error.settlement === "unknown";
  }
  return (
    error instanceof FixedCodegenExecutionError &&
    settlementUnknown(error.primary)
  );
}

function withCleanupFailure(primary: Error): FixedCodegenExecutionError {
  if (primary instanceof FixedCodegenExecutionError) {
    return new FixedCodegenExecutionError(primary.primary, [
      ...primary.secondaryCodes,
      "P2_EXECUTOR_CLEANUP_FAILED",
    ]);
  }
  return new FixedCodegenExecutionError(primary, [
    "P2_EXECUTOR_CLEANUP_FAILED",
  ]);
}

async function executeFixedCodegenLifecycle(
  plan: FixedCodegenExecutionPlan,
  runCommand: (
    command: FixedDockerCommand,
  ) => Promise<FixedCodegenCommandResult>,
): Promise<FixedCodegenLifecycleResult> {
  let ownedContainerId: string | null = null;
  let lifecycle: FixedCodegenLifecycleResult | undefined;
  let primaryFailure: Error | undefined;
  try {
    const create = await runCommand(plan.create);
    ownedContainerId = parseContainerId(create);

    const beforeInspect = await runCommand(plan.inspect);
    const before = parseInspect(beforeInspect);
    requireInspect(before, plan, ownedContainerId, "created");

    const start = await runCommand(plan.start);
    const afterInspect = await runCommand(plan.inspect);
    lifecycle = validateFixedCodegenLifecycle({
      plan,
      create,
      beforeInspect,
      start,
      afterInspect,
    });
  } catch (error) {
    primaryFailure = normalizedError(error);
  }

  if (
    ownedContainerId !== null &&
    (primaryFailure === undefined || !settlementUnknown(primaryFailure))
  ) {
    try {
      requireSuccessfulCommand(await runCommand(plan.remove));
    } catch (error) {
      const cleanupFailure = normalizedError(error);
      primaryFailure =
        primaryFailure === undefined
          ? cleanupFailure
          : withCleanupFailure(primaryFailure);
    }
  }

  if (primaryFailure !== undefined || lifecycle === undefined) {
    throw primaryFailure ?? new Error("P2_EXECUTOR_FAILED");
  }
  return lifecycle;
}

export function executeFixedCodegenLifecycleWithBackendForTest(
  plan: FixedCodegenExecutionPlan,
  runCommand: (
    command: FixedDockerCommand,
  ) => Promise<FixedCodegenCommandResult>,
): Promise<FixedCodegenLifecycleResult> {
  return executeFixedCodegenLifecycle(plan, runCommand);
}

async function executeOne(
  plan: FixedCodegenExecutionPlan,
): Promise<CodegenExecutionReceipt> {
  await prepareFixedRunRoot(plan.selected);
  const lifecycle = await executeFixedCodegenLifecycle(
    plan,
    runFixedDockerCommand,
  );
  return await buildReceipt(plan, lifecycle);
}

export function projectFixedCodegenExecutionPair(
  receipts: readonly Pick<
    CodegenExecutionReceipt,
    "scenarioId" | "profileId" | "runId" | "imageId"
  >[],
): CodegenExecutionPairProjection {
  const plans = createFixedCodegenExecutionPlans();
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
  const issues: CodegenExecutionPairProjection["issues"][number][] = [];
  if (!identityMatches) {
    issues.push("PAIR_IDENTITY_MISMATCH");
  } else if (!imageMatches) {
    issues.push("IMAGE_ID_MISMATCH");
  }
  return Object.freeze({
    schemaVersion: "p2-codegen-pair/v1",
    validity: imageMatches ? "same-image" : "inconclusive",
    imageId: imageMatches ? (receipts[0]?.imageId ?? null) : null,
    issues: Object.freeze(issues),
  });
}

export async function executeFixedCodegenProfiles(): Promise<CodegenExecutionPair> {
  await verifyFixedStaging();
  const receipts: CodegenExecutionReceipt[] = [];
  for (const plan of createFixedCodegenExecutionPlans()) {
    receipts.push(await executeOne(plan));
  }
  return Object.freeze({
    projection: projectFixedCodegenExecutionPair(receipts),
    receipts: Object.freeze(receipts),
  });
}
