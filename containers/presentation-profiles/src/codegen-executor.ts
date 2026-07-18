import { spawn, type ChildProcessByStdio } from "node:child_process";
import { chmod, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
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
const DOCKER_OUTPUT_BYTES = 16_384;
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

export interface FixedCodegenCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
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

function runFixedDockerCommand(
  command: FixedDockerCommand,
): Promise<FixedCodegenCommandResult> {
  return new Promise((resolve, reject) => {
    let child: ChildProcessByStdio<null, Readable, Readable>;
    try {
      child = spawn(command.executable, command.arguments, {
        env: { ...command.environment },
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
    } catch {
      reject(new Error("P2_EXECUTOR_DOCKER_FAILED"));
      return;
    }
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let outputBytes = 0;
    let failure: "output" | "timeout" | null = null;
    let settled = false;
    const count = (target: Buffer[], chunk: Buffer): void => {
      outputBytes += chunk.byteLength;
      if (outputBytes > DOCKER_OUTPUT_BYTES && failure === null) {
        failure = "output";
        child.kill("SIGKILL");
        return;
      }
      target.push(Buffer.from(chunk));
    };
    child.stdout.on("data", (chunk: Buffer) => count(stdout, chunk));
    child.stderr.on("data", (chunk: Buffer) => count(stderr, chunk));
    child.once("error", () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      reject(new Error("P2_EXECUTOR_DOCKER_FAILED"));
    });
    child.once("close", (exitCode) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (failure !== null || exitCode === null) {
        reject(
          new Error(
            failure === "timeout"
              ? "P2_EXECUTOR_DOCKER_TIMEOUT"
              : failure === "output"
                ? "P2_EXECUTOR_DOCKER_OUTPUT"
                : "P2_EXECUTOR_DOCKER_FAILED",
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
    const timer = setTimeout(() => {
      if (failure === null) {
        failure = "timeout";
        child.kill("SIGKILL");
      }
    }, DOCKER_TIMEOUT_MS);
  });
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
    optionalRegularFile(eventPath),
    optionalRegularFile(directPath),
  ]);
  const rawSegment = eventFile.present ? await readFile(eventPath, "utf8") : "";
  const projected = projectCodegenProfileSegment({
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    rawSegment,
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

async function executeOne(
  plan: FixedCodegenExecutionPlan,
): Promise<CodegenExecutionReceipt> {
  await prepareFixedRunRoot(plan.selected);
  let created = false;
  let receipt: CodegenExecutionReceipt | undefined;
  let primaryFailure: Error | undefined;
  try {
    const create = await runFixedDockerCommand(plan.create);
    created = create.exitCode === 0;
    const beforeInspect = await runFixedDockerCommand(plan.inspect);
    const start = await runFixedDockerCommand(plan.start);
    const afterInspect = await runFixedDockerCommand(plan.inspect);
    const lifecycle = validateFixedCodegenLifecycle({
      plan,
      create,
      beforeInspect,
      start,
      afterInspect,
    });
    receipt = await buildReceipt(plan, lifecycle);
  } catch (error) {
    primaryFailure =
      error instanceof Error ? error : new Error("P2_EXECUTOR_FAILED");
  }
  if (created) {
    try {
      requireSuccessfulCommand(await runFixedDockerCommand(plan.remove));
    } catch {
      primaryFailure ??= new Error("P2_EXECUTOR_CLEANUP_FAILED");
    }
  }
  if (primaryFailure !== undefined || receipt === undefined) {
    throw primaryFailure ?? new Error("P2_EXECUTOR_FAILED");
  }
  return receipt;
}

export async function executeFixedCodegenProfiles(): Promise<
  readonly CodegenExecutionReceipt[]
> {
  await verifyFixedStaging();
  const receipts: CodegenExecutionReceipt[] = [];
  for (const plan of createFixedCodegenExecutionPlans()) {
    receipts.push(await executeOne(plan));
  }
  return Object.freeze(receipts);
}
