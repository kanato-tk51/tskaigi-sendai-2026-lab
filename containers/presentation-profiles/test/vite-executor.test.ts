import { constants } from "node:fs";
import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { EXPECTED_EVENT_ORDER } from "../../../packages/vite-plugin-probe/src/constants.js";

import {
  createFixedViteExecutionPlans,
  executeAndFinalizeFixedViteLifecycleWithBackendsForTest,
  executeFixedViteLifecycleWithBackendForTest,
  finalizeFixedViteLifecycleWithBackendForTest,
  FIXED_VITE_EXECUTOR_LIMITS,
  FixedViteCommandError,
  FixedViteEvidenceAccessError,
  projectFixedViteExecutionPair,
  projectFixedViteEntryResult,
  readBoundedViteEventHandleForTest,
  readFixedViteEvidenceFromRootForTest,
  runFixedViteDockerCommandWithProcessForTest,
  type FixedViteLifecycleResult,
  type ViteExecutionOutcome,
  validateFixedViteLifecycle,
  verifyFixedViteStagingForTest,
} from "../src/vite-executor.js";
import {
  FIXED_VITE_RUNNER_LIMITS,
  verifyFixedViteOutputForTest,
} from "../runner/vite-runner.js";
import { createFixedViteStagingPlan } from "../runner/vite-staging.js";
import {
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
  FIXED_NODE_IMAGE_ID,
  FIXED_VITE_EXPECTED_REVISION,
  type FixedDockerCommand,
} from "../src/plan.js";

type CommandResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

const filesystemFixtureRoots: string[] = [];
const FIXED_FILESYSTEM_FIXTURE_ROOT = fileURLToPath(
  new URL(".vite-output-fixture/", import.meta.url),
);
const FIXED_STAGING_FIXTURE_ROOT = fileURLToPath(
  new URL(".vite-staging-fixture/", import.meta.url),
);

async function assembleViteStagingFixtureForTest(): Promise<string> {
  await rm(FIXED_STAGING_FIXTURE_ROOT, { recursive: true, force: true });
  filesystemFixtureRoots.push(FIXED_STAGING_FIXTURE_ROOT);
  for (const entry of createFixedViteStagingPlan().entries) {
    const targetPath = path.join(FIXED_STAGING_FIXTURE_ROOT, entry.targetPath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(entry.sourcePath, targetPath, constants.COPYFILE_EXCL);
    await chmod(targetPath, entry.mode);
  }
  return FIXED_STAGING_FIXTURE_ROOT;
}

afterEach(async () => {
  await Promise.all(
    filesystemFixtureRoots.splice(0).map(async (root) => {
      await chmod(path.join(root, "tool", "out"), 0o700).catch(() => undefined);
      await rm(root, { recursive: true, force: true });
    }),
  );
});

class FakeProcess {
  private stdoutListener: ((chunk: Buffer) => void) | undefined;
  private stderrListener: ((chunk: Buffer) => void) | undefined;
  private errorListener: (() => void) | undefined;
  private closeListener:
    | ((exitCode: number | null, signalCode: NodeJS.Signals | null) => void)
    | undefined;
  readonly signals: string[] = [];

  constructor(private readonly acceptsSignal = true) {}

  onStdout(listener: (chunk: Buffer) => void): void {
    this.stdoutListener = listener;
  }

  onStderr(listener: (chunk: Buffer) => void): void {
    this.stderrListener = listener;
  }

  onceError(listener: () => void): void {
    this.errorListener = listener;
  }

  onceClose(
    listener: (
      exitCode: number | null,
      signalCode: NodeJS.Signals | null,
    ) => void,
  ): void {
    this.closeListener = listener;
  }

  kill(): boolean {
    this.signals.push("SIGKILL");
    return this.acceptsSignal;
  }

  stdout(chunk: Buffer): void {
    this.stdoutListener?.(chunk);
  }

  stderr(chunk: Buffer): void {
    this.stderrListener?.(chunk);
  }

  error(): void {
    this.errorListener?.();
  }

  close(
    exitCode: number | null,
    signalCode: NodeJS.Signals | null = null,
  ): void {
    this.closeListener?.(exitCode, signalCode);
  }
}

function commandLabel(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
  command: FixedDockerCommand,
): "create" | "inspect" | "remove" | "start" {
  if (command === plan.create) return "create";
  if (command === plan.start) return "start";
  if (command === plan.remove) return "remove";
  return "inspect";
}

function runnerCompletion(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
): CommandResult {
  return {
    exitCode: 0,
    stdout: `${JSON.stringify({
      status: "completed",
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      sourceBeforeHash: `sha256:${"c".repeat(64)}`,
      sourceAfterHash: `sha256:${"c".repeat(64)}`,
      outputFiles: [{ logicalId: "vite-entry-output", bytes: 123 }],
    })}\n`,
    stderr: "",
  };
}

function runnerFailure(settlement: "known" | "unknown"): CommandResult {
  return {
    exitCode: 1,
    stdout: "",
    stderr: `${JSON.stringify({
      status: "failure",
      code: "P2_RUNNER_FAILED",
      failureCode: "P2_CHILD_FAILED",
      settlement,
      settlementCode:
        settlement === "unknown" ? "P2_CHILD_SETTLEMENT_UNKNOWN" : null,
    })}\n`,
  };
}

function successfulLifecycleResults(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
): readonly CommandResult[] {
  const containerId = "a".repeat(64);
  const imageId = FIXED_NODE_IMAGE_ID;
  return [
    { exitCode: 0, stdout: `${containerId}\n`, stderr: "" },
    {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|created|0\n`,
      stderr: "",
    },
    runnerCompletion(plan),
    {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|exited|0\n`,
      stderr: "",
    },
    { exitCode: 0, stdout: "", stderr: "" },
  ];
}

function completedLifecycle(): FixedViteLifecycleResult {
  return Object.freeze({
    imageId: FIXED_NODE_IMAGE_ID,
    containerExitCode: 0,
    runner: Object.freeze({
      status: "completed",
      failureCode: null,
      settlement: "known",
      settlementCode: null,
    }),
    runnerSummary: Object.freeze({
      sourceBeforeHash: `sha256:${"c".repeat(64)}`,
      sourceAfterHash: `sha256:${"c".repeat(64)}`,
      entryOutputBytes: 123,
    }),
    cleanup: "completed",
  });
}

function failedLifecycle(
  settlement: "known" | "unknown",
): FixedViteLifecycleResult {
  return Object.freeze({
    imageId: FIXED_NODE_IMAGE_ID,
    containerExitCode: 1,
    runner: Object.freeze({
      status: "failure",
      failureCode: "P2_CHILD_FAILED",
      settlement,
      settlementCode:
        settlement === "unknown" ? "P2_CHILD_SETTLEMENT_UNKNOWN" : null,
    }),
    runnerSummary: null,
    cleanup:
      settlement === "unknown"
        ? "suppressed-runner-settlement-unknown"
        : "completed",
  });
}

function permissiveRawSegment(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
): string {
  return `${EXPECTED_EVENT_ORDER.map((orderValue, producerSequence) => {
    const [eventKind, id] = orderValue.split(":");
    const toolChange = eventKind === "tool-api-change";
    return JSON.stringify({
      eventKind,
      runId: plan.selected.runId,
      scenarioId: plan.selected.scenarioId,
      producerSequence,
      outcome: toolChange ? "skipped" : "success",
      normalizedErrorCode: toolChange ? "NOT_APPLICABLE" : null,
      ...(eventKind === "route-invocation"
        ? { routeInvocationId: id }
        : eventKind === "capability-attempt"
          ? { attemptId: id }
          : { toolApiChangeId: id }),
    });
  }).join("\n")}\n`;
}

async function createFilesystemEvidenceFixture(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
): Promise<
  Readonly<{
    root: string;
    eventPath: string;
    outputRoot: string;
    entryPath: string;
  }>
> {
  const root = FIXED_FILESYSTEM_FIXTURE_ROOT;
  await mkdir(root);
  filesystemFixtureRoots.push(root);
  const sourcePath = path.join(root, "input", "designated.ts");
  const eventPath = path.join(root, "result", "vite-coordinator.jsonl");
  const directPath = path.join(
    root,
    "direct-write",
    "direct-write-marker.json",
  );
  const outputRoot = path.join(root, "tool", "out");
  const entryPath = path.join(outputRoot, "entry.js");
  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(eventPath), { recursive: true }),
    mkdir(path.dirname(directPath), { recursive: true }),
    mkdir(outputRoot, { recursive: true, mode: 0o700 }),
  ]);
  await Promise.all([
    writeFile(
      sourcePath,
      'export const designatedValue = "M2D_DESIGNATED_ORIGINAL";\n',
      { mode: 0o444 },
    ),
    writeFile(eventPath, permissiveRawSegment(plan), { mode: 0o600 }),
    writeFile(directPath, Buffer.alloc(144), { mode: 0o600 }),
    writeFile(entryPath, Buffer.alloc(123), { mode: 0o600 }),
  ]);
  await verifyFixedViteOutputForTest();
  return Object.freeze({ root, eventPath, outputRoot, entryPath });
}

function successfulEvidence(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
) {
  const rawSegment = permissiveRawSegment(plan);
  return Object.freeze({
    eventFile: Object.freeze({
      present: true,
      bytes: Buffer.byteLength(rawSegment),
      rawSegment,
    }),
    directFile: Object.freeze({ present: true, bytes: 144 }),
    entryFile: Object.freeze({ present: true, bytes: 123 }),
  });
}

function finalizationBackend(input: {
  readonly trace: string[];
  readonly evidence?: ReturnType<typeof successfulEvidence>;
  readonly failAttempt?: boolean;
  readonly failEvidence?: boolean;
  readonly failReceipt?: boolean;
}) {
  return {
    async writeAttempt() {
      input.trace.push("attempt");
      if (input.failAttempt === true)
        throw new Error("synthetic attempt failure");
    },
    async readEvidence() {
      input.trace.push("evidence");
      if (input.failEvidence === true || input.evidence === undefined) {
        throw new Error("synthetic inaccessible output");
      }
      return input.evidence;
    },
    async writeReceipt() {
      input.trace.push("receipt");
      if (input.failReceipt === true)
        throw new Error("synthetic receipt failure");
    },
  };
}

describe("P2 fixed Vite executor", () => {
  it("exposes exactly the two fixed Vite lifecycle plans", () => {
    const plans = createFixedViteExecutionPlans();
    expect(createFixedViteExecutionPlans.length).toBe(0);
    expect(Object.isFrozen(plans)).toBe(true);
    expect(plans.map((plan) => plan.selected.scenarioId)).toEqual([
      "vite-observe-p",
      "vite-observe-c",
    ]);
    expect(plans.map((plan) => plan.selected.resultRoot)).toEqual([
      expect.stringMatching(/p2-vite-observe-p-20260719-11$/u),
      expect.stringMatching(/p2-vite-observe-c-20260719-11$/u),
    ]);
    expect(plans.map((plan) => plan.containerName)).toEqual([
      "tskaigi-p2-vite-observe-p-20260719-11",
      "tskaigi-p2-vite-observe-c-20260719-11",
    ]);
  });

  it("uses only fixed create, inspect, attach-start, and force-remove commands", () => {
    for (const plan of createFixedViteExecutionPlans()) {
      expect(plan.create.executable).toBe(FIXED_DOCKER_EXECUTABLE);
      expect(plan.create.arguments).toContain(FIXED_NODE_IMAGE);
      expect(plan.create.arguments).toContain(plan.containerName);
      expect(plan.inspect.arguments).toEqual([
        "inspect",
        "--type",
        "container",
        "--format",
        "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Status}}|{{.State.ExitCode}}",
        plan.containerName,
      ]);
      expect(plan.start.arguments).toEqual([
        "start",
        "--attach",
        plan.containerName,
      ]);
      expect(plan.remove.arguments).toEqual([
        "rm",
        "--force",
        plan.containerName,
      ]);
      for (const command of [
        plan.create,
        plan.inspect,
        plan.start,
        plan.remove,
      ]) {
        expect(command.executable).toBe("/usr/bin/docker");
        expect(command.shell).toBe(false);
        expect(Object.keys(command.environment)).toEqual(["DOCKER_CONFIG"]);
        expect(command.environment).toEqual(plan.create.environment);
        expect(command.arguments.join(" ")).not.toContain("docker.sock");
        expect(command.arguments).not.toContain("login");
      }
    }
  });

  it("revalidates the exact reviewed 128-file staging tree", async () => {
    const stagingRoot = await assembleViteStagingFixtureForTest();
    await expect(
      verifyFixedViteStagingForTest(stagingRoot),
    ).resolves.toBeUndefined();
  });

  it("accepts only a fixed completed created-to-exited transition", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = successfulLifecycleResults(plan);
    expect(
      validateFixedViteLifecycle({
        plan,
        create: results[0]!,
        beforeInspect: results[1]!,
        start: results[2]!,
        afterInspect: results[3]!,
      }),
    ).toEqual({
      imageId: FIXED_NODE_IMAGE_ID,
      containerExitCode: 0,
      runner: {
        status: "completed",
        failureCode: null,
        settlement: "known",
        settlementCode: null,
      },
      runnerSummary: {
        sourceBeforeHash: `sha256:${"c".repeat(64)}`,
        sourceAfterHash: `sha256:${"c".repeat(64)}`,
        entryOutputBytes: 123,
      },
    });
  });

  it("retains the sanitized runner settlement barrier without raw stderr", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = [...successfulLifecycleResults(plan)];
    results[2] = runnerFailure("unknown");
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    const lifecycle = validateFixedViteLifecycle({
      plan,
      create: results[0]!,
      beforeInspect: results[1]!,
      start: results[2]!,
      afterInspect: results[3]!,
    });
    expect(lifecycle.runner).toEqual({
      status: "failure",
      failureCode: "P2_CHILD_FAILED",
      settlement: "unknown",
      settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
    });
    expect(JSON.stringify(lifecycle)).not.toContain("raw");
  });

  it.each([
    {
      label: "nonzero create",
      create: { exitCode: 1, stdout: "", stderr: "name collision" },
    },
    {
      label: "malformed create",
      create: { exitCode: 0, stdout: "not-an-owned-id\n", stderr: "" },
    },
  ])("stops after $label without cleanup", async ({ create }) => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return create;
      }),
    ).rejects.toThrow();
    expect(trace).toEqual(["create"]);
  });

  it("cleans the owned container after a failed first inspect without starting", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results: CommandResult[] = [
      { exitCode: 0, stdout: `${"a".repeat(64)}\n`, stderr: "" },
      { exitCode: 0, stdout: "malformed\n", stderr: "" },
      { exitCode: 0, stdout: "", stderr: "" },
    ];
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).rejects.toThrow();
    expect(trace).toEqual(["create", "inspect", "remove"]);
  });

  it("performs cleanup only after a validated completed transition", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).resolves.toMatchObject({ cleanup: "completed" });
    expect(trace).toEqual(["create", "inspect", "start", "inspect", "remove"]);
  });

  it("retains cleanup as the primary stage after an otherwise complete lifecycle", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[4] = { exitCode: 1, stdout: "", stderr: "bounded failure" };
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          commandTrace.push(commandLabel(plan, command));
          return results.shift()!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );
    expect(commandTrace).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "remove",
    ]);
    expect(finalizationTrace).toEqual(["attempt"]);
    expect(outcome.attempt).toMatchObject({
      cleanupDisposition: "failed",
      primaryFailureStage: "cleanup",
      primaryFailureCode: "P2_EXECUTOR_DOCKER_FAILED",
      issues: [
        "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED",
        "P2_ATTEMPT_CLEANUP_FAILED",
      ],
    });
  });

  it("keeps a known runner failure primary when cleanup later fails", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[2] = runnerFailure("known");
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    results[4] = { exitCode: 1, stdout: "", stderr: "bounded failure" };

    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          commandTrace.push(commandLabel(plan, command));
          return results.shift()!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );

    expect(commandTrace).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "remove",
    ]);
    expect(finalizationTrace).toEqual(["attempt"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      attemptRecord: "written",
      evidence: "not-inspected",
      receipt: null,
    });
    expect(outcome.attempt).toEqual({
      schemaVersion: "p2-vite-attempt/v2",
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      runId: plan.selected.runId,
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      attemptStatus: "inconclusive",
      primaryFailureStage: "runner-disposition",
      primaryFailureCode: "P2_CHILD_FAILED",
      inspectedImageId: FIXED_NODE_IMAGE_ID,
      inspectedContainerExitCode: 1,
      dockerSettlement: "known",
      runnerSettlement: "known",
      cleanupDisposition: "failed",
      runner: {
        status: "failure",
        failureCode: "P2_CHILD_FAILED",
        settlement: "known",
        settlementCode: null,
      },
      outputAvailability: "not-inspected",
      issues: [
        "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED",
        "P2_ATTEMPT_RUNNER_FAILED",
        "P2_ATTEMPT_CLEANUP_FAILED",
        "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
      ],
    });
  });

  it("cleans up after a known runner failure", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[2] = runnerFailure("known");
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).resolves.toMatchObject({
      cleanup: "completed",
      runner: { status: "failure", settlement: "known" },
    });
    expect(trace).toEqual(["create", "inspect", "start", "inspect", "remove"]);
  });

  it("suppresses executor cleanup when runner settlement is unknown", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[2] = runnerFailure("unknown");
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).resolves.toMatchObject({
      cleanup: "suppressed-runner-settlement-unknown",
      runner: { settlement: "unknown" },
    });
    expect(trace).toEqual(["create", "inspect", "start", "inspect"]);
  });

  it("retains the inspected image when Docker start settlement is unknown", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          const label = commandLabel(plan, command);
          commandTrace.push(label);
          if (label === "start") {
            throw new FixedViteCommandError(
              "P2_EXECUTOR_DOCKER_TIMEOUT",
              "unknown",
              false,
            );
          }
          return results.shift()!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );
    expect(commandTrace).toEqual(["create", "inspect", "start"]);
    expect(finalizationTrace).toEqual(["attempt"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      evidence: "not-inspected",
      attempt: {
        inspectedImageId: FIXED_NODE_IMAGE_ID,
        inspectedContainerExitCode: null,
        dockerSettlement: "unknown",
        runnerSettlement: "not-established",
        cleanupDisposition: "suppressed-docker-settlement-unknown",
        primaryFailureStage: "attached-start",
        primaryFailureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      },
    });
  });

  it("performs one final inspect after a known-settled attached-start failure", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = successfulLifecycleResults(plan);
    let inspectCount = 0;
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          const label = commandLabel(plan, command);
          commandTrace.push(label);
          if (label === "create") return results[0]!;
          if (label === "inspect") {
            inspectCount += 1;
            return inspectCount === 1 ? results[1]! : results[3]!;
          }
          if (label === "start") {
            throw new FixedViteCommandError(
              "P2_EXECUTOR_DOCKER_TIMEOUT",
              "closed",
              true,
            );
          }
          return results[4]!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );
    expect(commandTrace).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "remove",
    ]);
    expect(inspectCount).toBe(2);
    expect(finalizationTrace).toEqual(["attempt"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      receipt: null,
      attempt: {
        inspectedImageId: FIXED_NODE_IMAGE_ID,
        inspectedContainerExitCode: 0,
        dockerSettlement: "known",
        cleanupDisposition: "completed",
        primaryFailureStage: "attached-start",
        primaryFailureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      },
    });
  });

  it("keeps the attached-start failure primary when its final inspect is invalid", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = successfulLifecycleResults(plan);
    let inspectCount = 0;
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          const label = commandLabel(plan, command);
          commandTrace.push(label);
          if (label === "create") return results[0]!;
          if (label === "inspect") {
            inspectCount += 1;
            return inspectCount === 1
              ? results[1]!
              : { exitCode: 0, stdout: "invalid\n", stderr: "" };
          }
          if (label === "start") {
            throw new FixedViteCommandError(
              "P2_EXECUTOR_DOCKER_OUTPUT",
              "closed",
              true,
            );
          }
          return results[4]!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );
    expect(commandTrace).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "remove",
    ]);
    expect(inspectCount).toBe(2);
    expect(outcome.attempt).toMatchObject({
      inspectedImageId: FIXED_NODE_IMAGE_ID,
      inspectedContainerExitCode: null,
      primaryFailureStage: "attached-start",
      primaryFailureCode: "P2_EXECUTOR_DOCKER_OUTPUT",
    });
  });

  it("retains the inspected exit outcome before malformed runner framing", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const commandTrace: string[] = [];
    const finalizationTrace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[2] = { exitCode: 1, stdout: "", stderr: "raw failure" };
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          commandTrace.push(commandLabel(plan, command));
          return results.shift()!;
        },
        finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
      );
    expect(commandTrace).toEqual(["create", "inspect", "start", "inspect"]);
    expect(finalizationTrace).toEqual(["attempt"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      evidence: "not-inspected",
      attempt: {
        inspectedImageId: FIXED_NODE_IMAGE_ID,
        inspectedContainerExitCode: 1,
        dockerSettlement: "known",
        runnerSettlement: "unknown",
        cleanupDisposition: "suppressed-runner-settlement-unknown",
        primaryFailureStage: "runner-disposition",
        primaryFailureCode: "P2_EXECUTOR_RUNNER_INVALID",
        issues: [
          "P2_ATTEMPT_RUNNER_DISPOSITION_INVALID",
          "P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN",
          "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
        ],
      },
    });
  });

  it.each([
    {
      label: "start/final-inspect exit-code mismatch",
      finalImageId: FIXED_NODE_IMAGE_ID,
      finalExitCode: 1,
      retainedExitCode: 1,
    },
    {
      label: "created/final-inspect image mismatch",
      finalImageId: `sha256:${"e".repeat(64)}`,
      finalExitCode: 0,
      retainedExitCode: null,
    },
  ])(
    "retains validated lifecycle fields after a $label",
    async ({ finalImageId, finalExitCode, retainedExitCode }) => {
      const plan = createFixedViteExecutionPlans()[0]!;
      const commandTrace: string[] = [];
      const finalizationTrace: string[] = [];
      const results = [...successfulLifecycleResults(plan)];
      results[3] = {
        ...results[3]!,
        stdout: `${"a".repeat(64)}|${finalImageId}|${FIXED_NODE_IMAGE}|exited|${finalExitCode}\n`,
      };
      const outcome =
        await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
          plan,
          async (command) => {
            commandTrace.push(commandLabel(plan, command));
            return results.shift()!;
          },
          finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
        );
      expect(commandTrace).toEqual([
        "create",
        "inspect",
        "start",
        "inspect",
        "remove",
      ]);
      expect(finalizationTrace).toEqual(["attempt"]);
      expect(outcome).toMatchObject({
        completion: "inconclusive",
        evidence: "not-inspected",
        receipt: null,
        attempt: {
          inspectedImageId: FIXED_NODE_IMAGE_ID,
          inspectedContainerExitCode: retainedExitCode,
          dockerSettlement: "known",
          runnerSettlement: "not-established",
          cleanupDisposition: "completed",
          primaryFailureStage: "final-inspect",
          primaryFailureCode: "P2_EXECUTOR_INSPECT_INVALID",
          issues: [
            "P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED",
            "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
          ],
        },
      });
    },
  );

  it("serializes only the closed v2 diagnostic attempt fields", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    let written: unknown;
    await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      failedLifecycle("known"),
      {
        async writeAttempt(record) {
          written = record;
        },
        async readEvidence() {
          throw new Error("evidence must not be inspected");
        },
        async writeReceipt() {
          throw new Error("receipt must not be written");
        },
      },
    );
    expect(Object.keys(written as Record<string, unknown>).sort()).toEqual(
      [
        "attemptStatus",
        "cleanupDisposition",
        "dockerSettlement",
        "expectedRevision",
        "inspectedContainerExitCode",
        "inspectedImageId",
        "issues",
        "outputAvailability",
        "primaryFailureCode",
        "primaryFailureStage",
        "profileId",
        "runId",
        "runner",
        "runnerSettlement",
        "scenarioId",
        "schemaVersion",
      ].sort(),
    );
    const canonical = JSON.stringify(written);
    expect(canonical).not.toMatch(
      /stdout|stderr|raw|error|containerName|resultRoot|\/home\//u,
    );
  });

  it.each(["create", "first-inspect"] as const)(
    "keeps lifecycle fields null after an early %s failure",
    async (failurePoint) => {
      const plan = createFixedViteExecutionPlans()[0]!;
      const commandTrace: string[] = [];
      const finalizationTrace: string[] = [];
      const results: CommandResult[] = [
        { exitCode: 0, stdout: `${"a".repeat(64)}\n`, stderr: "" },
        { exitCode: 0, stdout: "malformed\n", stderr: "" },
        { exitCode: 0, stdout: "", stderr: "" },
      ];
      if (failurePoint === "create") {
        results[0] = { exitCode: 1, stdout: "", stderr: "create failed" };
      }
      const outcome =
        await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
          plan,
          async (command) => {
            commandTrace.push(commandLabel(plan, command));
            return results.shift()!;
          },
          finalizationBackend({ trace: finalizationTrace, failEvidence: true }),
        );
      expect(commandTrace).toEqual(
        failurePoint === "create"
          ? ["create"]
          : ["create", "inspect", "remove"],
      );
      expect(finalizationTrace).toEqual(["attempt"]);
      expect(outcome.attempt).toMatchObject({
        inspectedImageId: null,
        inspectedContainerExitCode: null,
        cleanupDisposition:
          failurePoint === "create" ? "not-required" : "completed",
        primaryFailureStage:
          failurePoint === "create" ? "create" : "created-inspect",
        primaryFailureCode:
          failurePoint === "create"
            ? "P2_EXECUTOR_DOCKER_FAILED"
            : "P2_EXECUTOR_INSPECT_INVALID",
      });
    },
  );

  it("writes an attempt before reading exported fixed success evidence", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      finalizationBackend({
        trace,
        evidence: successfulEvidence(plan),
      }),
    );
    expect(trace).toEqual(["attempt", "evidence", "receipt"]);
    expect(outcome).toMatchObject({
      completion: "complete",
      attemptRecord: "written",
      evidence: "inspected",
      attempt: {
        schemaVersion: "p2-vite-attempt/v2",
        expectedRevision: FIXED_VITE_EXPECTED_REVISION,
        attemptStatus: "receipt-pending",
        primaryFailureStage: null,
        primaryFailureCode: null,
        outputAvailability: "fixed-paths-exported",
        issues: [],
      },
      receipt: {
        schemaVersion: "p2-vite-execution/v2",
        expectedRevision: FIXED_VITE_EXPECTED_REVISION,
        completion: "complete",
        projection: { validity: "matches-expected" },
      },
    });
  });

  it("builds a receipt through the production fixed-path export and reader seams", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const fixture = await createFilesystemEvidenceFixture(plan);
    const [event, outputRoot, entry] = await Promise.all([
      lstat(fixture.eventPath),
      lstat(fixture.outputRoot),
      lstat(fixture.entryPath),
    ]);
    expect(event.mode & 0o7777).toBe(0o444);
    expect(outputRoot.mode & 0o7777).toBe(0o555);
    expect(entry.mode & 0o7777).toBe(0o444);

    const trace: string[] = [];
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      {
        async writeAttempt() {
          trace.push("attempt");
        },
        async readEvidence() {
          trace.push("fixed-path-evidence");
          return readFixedViteEvidenceFromRootForTest(fixture.root);
        },
        async writeReceipt() {
          trace.push("receipt");
        },
      },
    );
    expect(trace).toEqual(["attempt", "fixed-path-evidence", "receipt"]);
    expect(outcome).toMatchObject({
      completion: "complete",
      evidence: "inspected",
      receipt: {
        completion: "complete",
        output: {
          eventSegmentPresent: true,
          entryOutputPresent: true,
          entryOutputBytes: 123,
          directWritePresent: true,
          directWriteBytes: 144,
        },
        projection: { validity: "matches-expected" },
      },
    });
  });

  it("rejects an unexported fixed mode before opening event evidence", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const fixture = await createFilesystemEvidenceFixture(plan);
    await chmod(fixture.entryPath, 0o000);
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      {
        async writeAttempt() {},
        readEvidence: () => readFixedViteEvidenceFromRootForTest(fixture.root),
        async writeReceipt() {
          throw new Error("receipt must not be written");
        },
      },
    );
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      evidence: "not-inspected",
      receipt: null,
      issues: ["P2_RECEIPT_ASSEMBLY_FAILED"],
    });
  });

  it("records evidence access failure after reading begins as partial", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      {
        async writeAttempt() {},
        async readEvidence() {
          throw new FixedViteEvidenceAccessError("partially-inspected");
        },
        async writeReceipt() {
          throw new Error("receipt must not be written");
        },
      },
    );
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      evidence: "partially-inspected",
      receipt: null,
      issues: ["P2_RECEIPT_ASSEMBLY_FAILED"],
    });
  });

  it.each([
    ["known", "completed"],
    ["unknown", "suppressed-runner-settlement-unknown"],
  ] as const)(
    "records a %s runner failure without touching evidence",
    async (settlement, cleanupDisposition) => {
      const plan = createFixedViteExecutionPlans()[0]!;
      const trace: string[] = [];
      const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
        plan,
        failedLifecycle(settlement),
        finalizationBackend({ trace, failEvidence: true }),
      );
      expect(trace).toEqual(["attempt"]);
      expect(outcome).toMatchObject({
        completion: "inconclusive",
        attemptRecord: "written",
        evidence: "not-inspected",
        receipt: null,
        attempt: {
          attemptStatus: "inconclusive",
          runnerSettlement: settlement,
          cleanupDisposition,
          primaryFailureStage: "runner-disposition",
          primaryFailureCode: "P2_CHILD_FAILED",
          outputAvailability: "not-inspected",
        },
      });
      expect(outcome.issues).toContain("P2_ATTEMPT_RUNNER_FAILED");
      expect(outcome.issues).toContain("P2_ATTEMPT_OUTPUT_NOT_INSPECTED");
    },
  );

  it("retains the attempt when exported output metadata is inaccessible", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      finalizationBackend({ trace, failEvidence: true }),
    );
    expect(trace).toEqual(["attempt", "evidence"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      attemptRecord: "written",
      evidence: "not-inspected",
      receipt: null,
      issues: ["P2_RECEIPT_ASSEMBLY_FAILED"],
    });
  });

  it("stops before evidence when the canonical attempt cannot be written", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const outcome = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      finalizationBackend({ trace, failAttempt: true, failEvidence: true }),
    );
    expect(trace).toEqual(["attempt"]);
    expect(outcome).toEqual({
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      runId: plan.selected.runId,
      completion: "failure",
      attemptRecord: "not-written",
      evidence: "not-inspected",
      receipt: null,
      attempt: null,
      issues: ["P2_ATTEMPT_RECORD_WRITE_FAILED"],
    });
  });

  it("suppresses cleanup when runner failure framing is not exact", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    results[2] = { exitCode: 1, stdout: "", stderr: "raw failure" };
    results[3] = {
      ...results[3]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|exited|1\n`,
    };
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).rejects.toMatchObject({
      message: "P2_EXECUTOR_RUNNER_INVALID",
      settlement: "unknown",
    });
    expect(trace).toEqual(["create", "inspect", "start", "inspect"]);
  });

  it("suppresses cleanup while the Docker start command has unknown settlement", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    await expect(
      executeFixedViteLifecycleWithBackendForTest(plan, async (command) => {
        const label = commandLabel(plan, command);
        trace.push(label);
        if (label === "start") {
          throw new FixedViteCommandError(
            "P2_EXECUTOR_DOCKER_TIMEOUT",
            "unknown",
            false,
          );
        }
        return results.shift()!;
      }),
    ).rejects.toMatchObject({ settlement: "unknown" });
    expect(trace).toEqual(["create", "inspect", "start"]);
  });

  it("bounds Docker timeout settlement and keeps the first failure", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedViteDockerCommandWithProcessForTest(
      plan.create,
      () => process,
      { timeoutMs: 10, settlementMs: 20, outputBytes: 8 },
    );
    const failure = result.catch((error: unknown) => error);
    await new Promise((resolve) => setTimeout(resolve, 15));
    expect(process.signals).toEqual(["SIGKILL"]);
    process.close(null, "SIGKILL");
    await expect(failure).resolves.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      settlement: "closed",
      signalAccepted: true,
    });
  });

  it("keeps the fixed 60-second attached-start boundary outside unchanged runner limits", () => {
    const runnerControlledFailureMs =
      FIXED_VITE_RUNNER_LIMITS.childTimeoutMs +
      FIXED_VITE_RUNNER_LIMITS.terminationGraceMs +
      FIXED_VITE_RUNNER_LIMITS.forceSettlementMs +
      FIXED_VITE_RUNNER_LIMITS.serverSettlementMs;
    expect(FIXED_VITE_EXECUTOR_LIMITS).toEqual({
      dockerCommandMs: 20_000,
      attachedStartMs: 60_000,
      dockerSettlementMs: 1_000,
    });
    expect(FIXED_VITE_RUNNER_LIMITS).toEqual({
      childTimeoutMs: 30_000,
      terminationGraceMs: 500,
      forceSettlementMs: 1_000,
      serverSettlementMs: 1_000,
    });
    expect(FIXED_VITE_EXECUTOR_LIMITS.attachedStartMs).toBeGreaterThan(
      runnerControlledFailureMs,
    );
  });

  it("returns bounded unknown settlement when Docker close never arrives", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const process = new FakeProcess(false);
    await expect(
      runFixedViteDockerCommandWithProcessForTest(plan.create, () => process, {
        timeoutMs: 10,
        settlementMs: 5,
        outputBytes: 8,
      }),
    ).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      settlement: "unknown",
      signalAccepted: false,
    });
  });

  it("bounds Docker combined output before retaining it", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedViteDockerCommandWithProcessForTest(
      plan.create,
      () => process,
      { timeoutMs: 100, settlementMs: 100, outputBytes: 8 },
    );
    const rejection = expect(result).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_OUTPUT",
      settlement: "closed",
    });
    process.stdout(Buffer.alloc(9));
    process.stderr(Buffer.alloc(9));
    process.close(null, "SIGKILL");
    await rejection;
    expect(process.signals).toEqual(["SIGKILL"]);
  });

  it.each([
    { label: "exact limit", before: 65_536, after: 65_536, expected: 65_536 },
    { label: "limit plus one", before: 65_537, after: 65_537, expected: null },
    { label: "post-stat growth", before: 4, after: 5, expected: null },
  ])("bounds event reads for $label", async ({ before, after, expected }) => {
    const data = Buffer.alloc(after, 0x61);
    let statCount = 0;
    let readCount = 0;
    const result = await readBoundedViteEventHandleForTest({
      async stat() {
        const size = statCount++ === 0 ? before : after;
        return { size, isFile: () => true };
      },
      async read(buffer, offset, length, position) {
        readCount += 1;
        const available = Math.max(0, data.byteLength - position);
        const bytesRead = Math.min(length, available);
        data.copy(buffer, offset, position, position + bytesRead);
        return { bytesRead };
      },
    });
    expect(result.bytes).toBe(after);
    expect(result.rawSegment?.length ?? null).toBe(expected);
    if (before > 65_536) expect(readCount).toBe(0);
  });

  it("requires exact pair identity, completion, and one inspected image ID", () => {
    const plans = createFixedViteExecutionPlans();
    const imageId = FIXED_NODE_IMAGE_ID;
    const identities = plans.map(({ selected }) => ({
      scenarioId: selected.scenarioId,
      profileId: selected.profileId,
      runId: selected.runId,
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      imageId,
      completion: "complete" as const,
    }));
    expect(projectFixedViteExecutionPair(identities)).toEqual({
      schemaVersion: "p2-vite-pair/v2",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "same-image",
      imageId,
      issues: [],
    });
    expect(projectFixedViteExecutionPair(identities.slice(0, 1))).toEqual({
      schemaVersion: "p2-vite-pair/v2",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "inconclusive",
      imageId: null,
      issues: ["PAIR_IDENTITY_MISMATCH"],
    });
    expect(
      projectFixedViteExecutionPair([
        identities[0]!,
        {
          ...identities[1]!,
          expectedRevision:
            "p2-vite-expected-20260719-02" as typeof FIXED_VITE_EXPECTED_REVISION,
        },
      ]),
    ).toEqual({
      schemaVersion: "p2-vite-pair/v2",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "inconclusive",
      imageId: null,
      issues: ["PAIR_IDENTITY_MISMATCH"],
    });
    expect(
      projectFixedViteExecutionPair([
        identities[0]!,
        { ...identities[1]!, completion: "inconclusive" },
      ]),
    ).toEqual({
      schemaVersion: "p2-vite-pair/v2",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "inconclusive",
      imageId,
      issues: ["PAIR_EXECUTION_INCOMPLETE"],
    });
    expect(
      projectFixedViteExecutionPair([
        identities[0]!,
        { ...identities[1]!, imageId: `sha256:${"e".repeat(64)}` },
      ]),
    ).toEqual({
      schemaVersion: "p2-vite-pair/v2",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "inconclusive",
      imageId: null,
      issues: ["IMAGE_ID_MISMATCH"],
    });
  });

  it("distinguishes a recorded inconclusive attempt from record-write failure", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const recorded = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      failedLifecycle("known"),
      finalizationBackend({ trace: [], failEvidence: true }),
    );
    const recordFailure = await finalizeFixedViteLifecycleWithBackendForTest(
      plan,
      completedLifecycle(),
      finalizationBackend({ trace: [], failAttempt: true }),
    );
    const entryFor = (outcome: ViteExecutionOutcome) =>
      projectFixedViteEntryResult({
        projection: projectFixedViteExecutionPair([]),
        receipts: [],
        outcomes: [outcome],
      });
    expect(entryFor(recorded)).toMatchObject({
      status: "inconclusive",
      scenarios: [
        {
          attemptRecord: "written",
          evidence: "not-inspected",
          receipt: "not-written",
        },
      ],
    });
    expect(entryFor(recordFailure)).toMatchObject({
      status: "failure",
      scenarios: [
        {
          attemptRecord: "not-written",
          issues: ["P2_ATTEMPT_RECORD_WRITE_FAILED"],
        },
      ],
    });
  });

  it("keeps the Vite host executor and entry import-safe and argument-free", async () => {
    const [executor, entry] = await Promise.all([
      readFile(new URL("../src/vite-executor.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../runner/vite-executor-entry.js", import.meta.url),
        "utf8",
      ),
    ]);
    expect(executor).not.toContain("process.env");
    expect(executor).not.toContain("docker.sock");
    expect(executor).not.toContain("/home/");
    expect(executor).not.toContain("https:");
    expect(executor).toContain(
      'writeFile(path.join(dockerConfigRoot, "config.json"), "{}\\n"',
    );
    expect(executor).toContain("suppressed-runner-settlement-unknown");
    expect(entry).toContain("process.argv.length !== 2");
    expect(entry).toContain("import.meta.url ===");
    expect(entry).toContain("projectFixedViteEntryResult(pair)");
  });
});
