import { constants } from "node:fs";
import {
  chmod,
  copyFile,
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
  executeFixedVitePlanSequenceWithBackendForTest,
  FIXED_VITE_EXECUTOR_LIMITS,
  FixedViteCommandError,
  parseFixedViteInspectForTest,
  projectFixedViteExecutionPair,
  readFixedViteProgressFromRootForTest,
  requireFixedViteCreateArgumentsForTest,
  runFixedViteDockerCommandWithProcessForTest,
  validateFixedViteProgressSnapshotForTest,
  verifyFixedViteStagingForTest,
  type FixedViteCommandResult,
  type ViteProgressRecord,
  type ViteRunnerCompletedTerminal,
  type ViteRunnerFailureCode,
} from "../src/vite-executor.js";
import { createFixedViteStagingPlan } from "../runner/vite-staging.js";
import {
  FIXED_NODE_IMAGE,
  FIXED_NODE_IMAGE_ID,
  FIXED_VITE_EXPECTED_REVISION,
  type FixedDockerCommand,
} from "../src/plan.js";

const fixtureRoots: string[] = [];
const TEST_ROOT = fileURLToPath(
  new URL(".vite-detached-executor-fixture/", import.meta.url),
);

afterEach(async () => {
  await Promise.all([
    chmod(path.join(TEST_ROOT, "progress"), 0o700).catch(() => undefined),
    chmod(path.join(TEST_ROOT, "progress-extra"), 0o700).catch(() => undefined),
  ]);
  await Promise.all(
    fixtureRoots.splice(0).map((root) =>
      chmod(root, 0o700)
        .catch(() => undefined)
        .then(() => rm(root, { recursive: true, force: true })),
    ),
  );
});

function rec(
  sequence: number,
  stage: ViteProgressRecord["stage"],
  value: string,
): ViteProgressRecord {
  return { sequence, stage, value };
}

function completedRecords(service = "closed"): readonly ViteProgressRecord[] {
  return [
    rec(0, "runner-entered", "accepted"),
    rec(1, "inputs-prepared", "accepted"),
    rec(
      2,
      "service-ready",
      service === "closed" ? "listening" : "not-required",
    ),
    rec(3, "child-launched", "positive-process-group"),
    rec(4, "child-watch-armed", "close-error-output-deadline"),
    rec(5, "child-close-observed", "exit-0"),
    rec(6, "child-group-absent", "confirmed"),
    rec(7, "child-settled", "success"),
    rec(8, "service-settled", service),
    rec(9, "output-exported", "validated-and-sealed"),
  ];
}

function completedTerminal(): ViteRunnerCompletedTerminal {
  return {
    status: "completed",
    failureCode: null,
    settlement: "known",
    settlementCode: null,
    sourceBeforeHash: `sha256:${"c".repeat(64)}`,
    sourceAfterHash: `sha256:${"c".repeat(64)}`,
    entryOutputBytes: 123,
  };
}

function progressLine(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
  records: readonly ViteProgressRecord[],
  terminal: object | null,
): string {
  return `${JSON.stringify({
    schemaVersion: "p2-vite-progress/v2",
    expectedRevision: plan.selected.expectedRevision,
    scenarioId: plan.selected.scenarioId,
    profileId: plan.selected.profileId,
    runId: plan.selected.runId,
    records,
    terminal,
  })}\n`;
}

function completedTransfer(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
) {
  return validateFixedViteProgressSnapshotForTest(
    progressLine(plan, completedRecords(), completedTerminal()),
    plan.selected,
    0,
  );
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

function dockerResults(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
): FixedViteCommandResult[] {
  const id = "a".repeat(64);
  return [
    { exitCode: 0, stdout: `${id}\n`, stderr: "" },
    {
      exitCode: 0,
      stdout: `${id}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|created|0\n`,
      stderr: "",
    },
    { exitCode: 0, stdout: `${plan.containerName}\n`, stderr: "" },
    { exitCode: 0, stdout: "0\n", stderr: "" },
    {
      exitCode: 0,
      stdout: `${id}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|exited|0\n`,
      stderr: "",
    },
    { exitCode: 0, stdout: `${plan.containerName}\n`, stderr: "" },
  ];
}

function commandLabel(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
  command: FixedDockerCommand,
): string {
  if (command === plan.create) return "create";
  if (command === plan.start) return "start";
  if (command === plan.wait) return "wait";
  if (command === plan.remove) return "remove";
  return "inspect";
}

function finalizationBackend(
  plan: ReturnType<typeof createFixedViteExecutionPlans>[number],
  trace: string[],
) {
  return {
    async writeAttempt() {
      trace.push("attempt");
    },
    async readEvidence() {
      trace.push("evidence");
      return successfulEvidence(plan);
    },
    async writeReceipt() {
      trace.push("receipt");
    },
  };
}

class FakeProcess {
  private stdoutListener?: (chunk: Buffer) => void;
  private stderrListener?: (chunk: Buffer) => void;
  private errorListener?: () => void;
  private closeListener?: (
    code: number | null,
    signal: NodeJS.Signals | null,
  ) => void;
  readonly signals: string[] = [];

  constructor(private readonly signalAccepted = true) {}
  onStdout(listener: (chunk: Buffer) => void) {
    this.stdoutListener = listener;
  }
  onStderr(listener: (chunk: Buffer) => void) {
    this.stderrListener = listener;
  }
  onceError(listener: () => void) {
    this.errorListener = listener;
  }
  onceClose(
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ) {
    this.closeListener = listener;
  }
  kill() {
    this.signals.push("SIGKILL");
    return this.signalAccepted;
  }
  stdout(chunk: Buffer) {
    this.stdoutListener?.(chunk);
  }
  error() {
    this.errorListener?.();
  }
  close(code: number | null, signal: NodeJS.Signals | null = null) {
    this.closeListener?.(code, signal);
  }
}

describe("P2 detached Vite executor", () => {
  it("binds only the fresh identities and fixed detached command graph", () => {
    const plans = createFixedViteExecutionPlans();
    expect(plans.map((plan) => plan.selected.runId)).toEqual([
      "p2-vite-observe-p-20260723-01",
      "p2-vite-observe-c-20260723-01",
    ]);
    for (const plan of plans) {
      expect(plan.create.arguments.slice(0, 6)).toEqual([
        "create",
        "--init",
        "--name",
        plan.containerName,
        "--pull",
        "never",
      ]);
      expect(plan.inspect.arguments).toEqual([
        "inspect",
        "--type",
        "container",
        "--format",
        "{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.HostConfig.Init}}|{{.State.Status}}|{{.State.ExitCode}}",
        plan.containerName,
      ]);
      expect(plan.start.arguments).toEqual(["start", plan.containerName]);
      expect(plan.wait.arguments).toEqual(["wait", plan.containerName]);
      expect(plan.remove.arguments).toEqual([
        "rm",
        "--force",
        plan.containerName,
      ]);
      expect(plan.start.arguments).not.toContain("--attach");
      expect(plan.create.arguments.join(" ")).not.toContain("docker.sock");
      expect(Object.keys(plan.create.environment)).toEqual(["DOCKER_CONFIG"]);
    }
  });

  it("rejects a missing, duplicate, or repositioned Vite init option", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    expect(() =>
      requireFixedViteCreateArgumentsForTest(
        plan.create.arguments,
        plan.containerName,
      ),
    ).not.toThrow();

    const missing = plan.create.arguments.filter(
      (argument) => argument !== "--init",
    );
    const duplicate = [...plan.create.arguments];
    duplicate.splice(2, 0, "--init");
    const repositioned = [...missing];
    repositioned.splice(4, 0, "--init");
    for (const arguments_ of [missing, duplicate, repositioned]) {
      expect(() =>
        requireFixedViteCreateArgumentsForTest(arguments_, plan.containerName),
      ).toThrow("P2_EXECUTOR_PLAN_INVALID");
    }
  });

  it("accepts only a six-field inspect with literal true init state", () => {
    const id = "a".repeat(64);
    const exact = `${id}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|created|0\n`;
    expect(
      parseFixedViteInspectForTest({
        exitCode: 0,
        stdout: exact,
        stderr: "",
      }),
    ).toEqual(expect.objectContaining({ initConfigured: true }));

    for (const stdout of [
      `${id}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|created|0\n`,
      exact.replace("|true|", "|false|"),
      exact.replace("|true|", "|TRUE|"),
      exact.replace("|true|", "||"),
      exact.replace("|created|0\n", "|created|0|extra\n"),
      exact.replace("|true|created|", "|true|false|created|"),
    ]) {
      expect(() =>
        parseFixedViteInspectForTest({ exitCode: 0, stdout, stderr: "" }),
      ).toThrow("P2_EXECUTOR_INSPECT_INVALID");
    }
  });

  it("revalidates the exact 128-file staging closure", async () => {
    const root = path.join(TEST_ROOT, "staging");
    fixtureRoots.push(TEST_ROOT);
    for (const entry of createFixedViteStagingPlan().entries) {
      const target = path.join(root, entry.targetPath);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(entry.sourcePath, target, constants.COPYFILE_EXCL);
      await chmod(target, entry.mode);
    }
    expect(createFixedViteStagingPlan().entries).toHaveLength(128);
    await expect(verifyFixedViteStagingForTest(root)).resolves.toBeUndefined();
  });

  it("accepts the exact completed terminal and rejects old identity/schema", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    expect(completedTransfer(plan)).toMatchObject({
      failureCode: null,
      projection: {
        validity: "valid-terminal",
        terminal: { status: "completed" },
      },
    });
    for (const oldGeneration of [
      "20260719-01",
      "20260719-02",
      "20260719-03",
      "20260719-11",
      "20260720-01",
      "20260720-02",
    ]) {
      expect(
        validateFixedViteProgressSnapshotForTest(
          progressLine(
            plan,
            completedRecords(),
            completedTerminal(),
          ).replaceAll("20260723-01", oldGeneration),
          plan.selected,
          0,
        ),
      ).toMatchObject({ failureCode: "P2_TRANSFER_IDENTITY_MISMATCH" });
    }
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(plan, completedRecords(), completedTerminal()).replace(
          "p2-vite-progress/v2",
          "p2-vite-progress/v1",
        ),
        plan.selected,
        0,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SCHEMA_INVALID" });
  });

  it.each(["sent", "group-already-absent"])(
    "accepts the post-close residue known-failure %s suffix",
    (force) => {
      const plan = createFixedViteExecutionPlans()[0]!;
      const records = [
        ...completedRecords().slice(0, 5),
        rec(5, "child-close-observed", "exit-0"),
        rec(6, "child-residue-detected", "post-close-group-present"),
        rec(7, "child-force-sent", force),
        rec(8, "child-group-absent", "confirmed"),
        rec(9, "child-settled", "known-failure"),
        rec(10, "service-settled", "closed"),
      ];
      const terminal = {
        status: "failure",
        failureCode: "P2_CHILD_FAILED",
        settlement: "known",
        settlementCode: null,
      };
      expect(
        validateFixedViteProgressSnapshotForTest(
          progressLine(plan, records, terminal),
          plan.selected,
          1,
        ),
      ).toMatchObject({
        failureCode: null,
        projection: { validity: "valid-terminal" },
      });
    },
  );

  it.each(["sent", "group-already-absent"])(
    "accepts the post-SIGTERM force-settlement %s suffix",
    (force) => {
      const plan = createFixedViteExecutionPlans()[0]!;
      const records = [
        ...completedRecords().slice(0, 5),
        rec(5, "child-failure-detected", "deadline"),
        rec(6, "child-terminate-sent", "sent"),
        rec(7, "child-close-observed", "sigterm"),
        rec(8, "child-force-sent", force),
        rec(9, "child-group-absent", "confirmed"),
        rec(10, "child-settled", "known-failure"),
        rec(11, "service-settled", "closed"),
      ];
      expect(
        validateFixedViteProgressSnapshotForTest(
          progressLine(plan, records, {
            status: "failure",
            failureCode: "P2_CHILD_TIMEOUT",
            settlement: "known",
            settlementCode: null,
          }),
          plan.selected,
          1,
        ),
      ).toMatchObject({
        failureCode: null,
        projection: { validity: "valid-terminal" },
      });
    },
  );

  it("rejects residue success and terminal/container exit contradictions", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const residueSuccess = [
      ...completedRecords().slice(0, 5),
      rec(5, "child-close-observed", "exit-0"),
      rec(6, "child-residue-detected", "post-close-group-present"),
      rec(7, "child-force-sent", "sent"),
      rec(8, "child-group-absent", "confirmed"),
      rec(9, "child-settled", "success"),
      rec(10, "service-settled", "closed"),
      rec(11, "output-exported", "validated-and-sealed"),
    ];
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(plan, residueSuccess, completedTerminal()),
        plan.selected,
        0,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(plan, completedRecords(), completedTerminal()),
        plan.selected,
        1,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
  });

  it("retains a contradictory failure close only as unknown settlement", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const records = [
      ...completedRecords().slice(0, 5),
      rec(5, "child-failure-detected", "output-limit"),
      rec(6, "child-terminate-sent", "sent"),
      rec(7, "child-close-observed", "exit-0"),
    ];
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(plan, records, {
          status: "failure",
          failureCode: "P2_OUTPUT_LIMIT",
          settlement: "unknown",
          settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
        }),
        plan.selected,
        1,
      ),
    ).toMatchObject({
      failureCode: null,
      projection: {
        validity: "valid-terminal",
        terminal: { settlement: "unknown" },
      },
    });
  });

  it("binds unknown child and server terminals to their durable failure paths", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const cases = [
      {
        records: completedRecords().slice(0, 2),
        settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_SERVER_CLOSE_FAILED",
      },
      {
        records: completedRecords().slice(0, 3),
        settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_RUNNER_FAILED",
      },
      {
        records: completedRecords().slice(0, 5),
        settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_RUNNER_FAILED",
      },
      {
        records: [
          ...completedRecords().slice(0, 3),
          rec(3, "child-failure-detected", "invalid-process-group"),
        ],
        settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_CHILD_FAILED",
      },
      {
        records: [
          ...completedRecords().slice(0, 5),
          rec(5, "child-failure-detected", "deadline"),
        ],
        settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_CHILD_TIMEOUT",
      },
      {
        records: [
          ...completedRecords().slice(0, 3),
          rec(3, "child-failure-detected", "spawn-error"),
        ],
        settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_CHILD_FAILED",
      },
      {
        records: [
          ...completedRecords().slice(0, 5),
          rec(5, "child-close-observed", "exit-nonzero"),
          rec(6, "child-group-absent", "confirmed"),
          rec(7, "child-settled", "known-failure"),
        ],
        settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_CHILD_FAILED",
      },
      {
        records: [
          ...completedRecords().slice(0, 5),
          rec(5, "child-close-observed", "exit-0"),
          rec(6, "child-group-absent", "confirmed"),
          rec(7, "child-settled", "success"),
        ],
        settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        expectedFailureCode: "P2_SERVER_CLOSE_FAILED",
      },
    ] as const;

    for (const testCase of cases) {
      const terminal = (failureCode: ViteRunnerFailureCode) =>
        ({
          status: "failure",
          failureCode,
          settlement: "unknown",
          settlementCode: testCase.settlementCode,
        }) as const;
      expect(
        validateFixedViteProgressSnapshotForTest(
          progressLine(plan, testCase.records, terminal("P2_RESULT_INVALID")),
          plan.selected,
          1,
        ),
      ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
      expect(
        validateFixedViteProgressSnapshotForTest(
          progressLine(
            plan,
            testCase.records,
            terminal(testCase.expectedFailureCode),
          ),
          plan.selected,
          1,
        ),
      ).toMatchObject({
        failureCode: null,
        projection: { validity: "valid-terminal" },
      });
    }

    const constrained = createFixedViteExecutionPlans()[1]!;
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(constrained, completedRecords("not-started").slice(0, 2), {
          status: "failure",
          failureCode: "P2_SERVER_CLOSE_FAILED",
          settlement: "unknown",
          settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
        }),
        constrained.selected,
        1,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(
          plan,
          [
            ...completedRecords().slice(0, 3),
            rec(3, "child-failure-detected", "spawn-error"),
          ],
          {
            status: "failure",
            failureCode: "P2_CHILD_FAILED",
            settlement: "unknown",
            settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
          },
        ),
        plan.selected,
        1,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(
          plan,
          [
            ...completedRecords().slice(0, 5),
            rec(5, "child-close-observed", "exit-nonzero"),
          ],
          {
            status: "failure",
            failureCode: "P2_RUNNER_FAILED",
            settlement: "unknown",
            settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
          },
        ),
        plan.selected,
        1,
      ),
    ).toMatchObject({ failureCode: "P2_TRANSFER_SEQUENCE_INVALID" });
  });

  it("rejects natural exit zero when only a valid prefix was published", () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    expect(
      validateFixedViteProgressSnapshotForTest(
        progressLine(plan, completedRecords().slice(0, 5), null),
        plan.selected,
        0,
      ),
    ).toMatchObject({
      failureCode: "P2_TRANSFER_MISSING",
      projection: { validity: "invalid" },
    });
  });

  it("seals and stably reads only the exact canonical progress file", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const root = path.join(TEST_ROOT, "progress");
    fixtureRoots.push(TEST_ROOT);
    await mkdir(root, { recursive: true, mode: 0o1777 });
    await chmod(root, 0o1777);
    await writeFile(
      path.join(root, "runner-progress.json"),
      progressLine(plan, completedRecords(), completedTerminal()),
      { mode: 0o444 },
    );
    await chmod(path.join(root, "runner-progress.json"), 0o444);
    await expect(
      readFixedViteProgressFromRootForTest(root, plan.selected, 0),
    ).resolves.toMatchObject({
      failureCode: null,
      projection: { validity: "valid-terminal" },
    });
  });

  it("rejects a stale temporary progress entry before reading", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const root = path.join(TEST_ROOT, "progress-extra");
    fixtureRoots.push(TEST_ROOT);
    await mkdir(root, { recursive: true, mode: 0o1777 });
    await Promise.all([
      writeFile(
        path.join(root, "runner-progress.json"),
        progressLine(plan, completedRecords(), completedTerminal()),
        { mode: 0o444 },
      ),
      writeFile(path.join(root, "runner-progress.next"), "partial", {
        mode: 0o644,
      }),
    ]);
    await expect(
      readFixedViteProgressFromRootForTest(root, plan.selected, 0),
    ).resolves.toMatchObject({
      failureCode: "P2_TRANSFER_FILESYSTEM_INVALID",
      projection: { validity: "invalid", records: [] },
    });
  });

  it("runs create/inspect/detached-start/wait/inspect/remove before transfer", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    const commands: string[] = [];
    const finalization: string[] = [];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          commands.push(commandLabel(plan, command));
          return results.shift()!;
        },
        async (exit) => {
          commands.push(`progress:${exit}`);
          return completedTransfer(plan);
        },
        finalizationBackend(plan, finalization),
      );
    expect(commands).toEqual([
      "create",
      "inspect",
      "start",
      "wait",
      "inspect",
      "remove",
      "progress:0",
    ]);
    expect(finalization).toEqual(["attempt", "evidence", "receipt"]);
    expect(outcome).toMatchObject({
      completion: "complete",
      attempt: {
        schemaVersion: "p2-vite-attempt/v4",
        attemptStatus: "receipt-pending",
        containerSettlement: "natural-exited",
        runnerProcessSettlement: "exited",
        progressTrust: "repository-cooperative-fixture",
      },
      receipt: {
        schemaVersion: "p2-vite-execution/v4",
        progressTrust: "repository-cooperative-fixture",
      },
    });
  });

  it("rejects a changed final init field before evidence or receipt access", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    results[4] = {
      ...results[4]!,
      stdout: results[4]!.stdout.replace("|true|", "|false|"),
    };
    const commands: string[] = [];
    const finalization: string[] = [];
    let transferredExit: number | null | undefined;
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          commands.push(commandLabel(plan, command));
          return results.shift()!;
        },
        async (exit) => {
          transferredExit = exit;
          commands.push(`progress:${exit}`);
          return completedTransfer(plan);
        },
        finalizationBackend(plan, finalization),
      );
    expect(commands).toEqual([
      "create",
      "inspect",
      "start",
      "wait",
      "inspect",
      "remove",
      "progress:null",
    ]);
    expect(transferredExit).toBeNull();
    expect(finalization).toEqual(["attempt"]);
    expect(outcome).toMatchObject({
      completion: "inconclusive",
      receipt: null,
      evidence: "not-inspected",
      attempt: {
        primaryFailureStage: "final-inspect",
        primaryFailureCode: "P2_EXECUTOR_INSPECT_INVALID",
        inspectedContainerExitCode: null,
      },
    });
  });

  it("suppresses every later command and attempt after unknown start settlement", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    const trace: string[] = [];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
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
        },
        async () => {
          throw new Error("progress must not be read");
        },
        finalizationBackend(plan, trace),
      );
    expect(trace).toEqual(["create", "inspect", "start"]);
    expect(outcome).toEqual({
      scenarioId: plan.selected.scenarioId,
      profileId: plan.selected.profileId,
      runId: plan.selected.runId,
      completion: "failure",
      attemptRecord: "not-written",
      evidence: "not-inspected",
      receipt: null,
      attempt: null,
      issues: ["P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN"],
    });
  });

  it("suppresses inspect, cleanup, transfer, and attempt after unknown wait settlement", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    const trace: string[] = [];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          const label = commandLabel(plan, command);
          trace.push(label);
          if (label === "wait") {
            throw new FixedViteCommandError(
              "P2_EXECUTOR_DOCKER_TIMEOUT",
              "unknown",
              true,
            );
          }
          return results.shift()!;
        },
        async () => {
          throw new Error("progress must not be read");
        },
        finalizationBackend(plan, trace),
      );
    expect(trace).toEqual(["create", "inspect", "start", "wait"]);
    expect(outcome).toMatchObject({
      completion: "failure",
      attemptRecord: "not-written",
      issues: ["P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN"],
    });
  });

  it("inspects, removes, and transfers after a known-settled start failure", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const id = "a".repeat(64);
    const results = dockerResults(plan);
    const trace: string[] = [];
    let inspectCount = 0;
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async (command) => {
          const label = commandLabel(plan, command);
          trace.push(label);
          if (label === "start") {
            throw new FixedViteCommandError(
              "P2_EXECUTOR_DOCKER_FAILED",
              "closed",
              null,
            );
          }
          if (label === "create") return results[0]!;
          if (label === "inspect") {
            inspectCount += 1;
            return inspectCount === 1
              ? results[1]!
              : {
                  exitCode: 0,
                  stdout: `${id}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|running|0\n`,
                  stderr: "",
                };
          }
          return results[5]!;
        },
        async () => {
          trace.push("progress");
          return {
            projection: {
              schemaVersion: "p2-vite-progress/v2",
              validity: "valid-prefix",
              records: completedRecords().slice(0, 5),
              terminal: null,
            },
            failureCode: null,
          };
        },
        finalizationBackend(plan, trace),
      );
    expect(trace).toEqual([
      "create",
      "inspect",
      "start",
      "inspect",
      "remove",
      "progress",
      "attempt",
    ]);
    expect(outcome.attempt).toMatchObject({
      primaryFailureStage: "detached-start",
      containerSettlement: "force-removed",
      runnerProcessSettlement: "force-stopped",
      outputAvailability: "not-inspected",
    });
  });

  it("does not read regular evidence when transfer validation fails", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    const trace: string[] = [];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async () => results.shift()!,
        async () => ({
          projection: {
            schemaVersion: "p2-vite-progress/v2",
            validity: "invalid",
            records: [],
            terminal: null,
          },
          failureCode: "P2_TRANSFER_SCHEMA_INVALID" as const,
        }),
        finalizationBackend(plan, trace),
      );
    expect(trace).toEqual(["attempt"]);
    expect(outcome.attempt).toMatchObject({
      primaryFailureStage: "progress-transfer",
      primaryFailureCode: "P2_TRANSFER_SCHEMA_INVALID",
      issues: expect.arrayContaining([
        "P2_ATTEMPT_TRANSFER_FAILED",
        "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
      ]),
    });
  });

  it("projects natural exit 70 with a valid prefix as a transfer issue", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    results[3] = { exitCode: 0, stdout: "70\n", stderr: "" };
    results[4] = {
      ...results[4]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|exited|70\n`,
    };
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async () => results.shift()!,
        async () =>
          validateFixedViteProgressSnapshotForTest(
            progressLine(plan, completedRecords().slice(0, 5), null),
            plan.selected,
            70,
          ),
        finalizationBackend(plan, []),
      );
    expect(outcome.attempt).toMatchObject({
      primaryFailureStage: "progress-transfer",
      primaryFailureCode: "P2_TRANSFER_WRITE_FAILED",
      runnerProcessSettlement: "exited",
      issues: expect.arrayContaining([
        "P2_ATTEMPT_TRANSFER_FAILED",
        "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
      ]),
    });
  });

  it("retains a valid runner failure terminal as the primary disposition", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const results = dockerResults(plan);
    results[3] = { exitCode: 0, stdout: "1\n", stderr: "" };
    results[4] = {
      ...results[4]!,
      stdout: `${"a".repeat(64)}|${FIXED_NODE_IMAGE_ID}|${FIXED_NODE_IMAGE}|true|exited|1\n`,
    };
    const failureRecords = [
      ...completedRecords().slice(0, 5),
      rec(5, "child-close-observed", "exit-nonzero"),
      rec(6, "child-group-absent", "confirmed"),
      rec(7, "child-settled", "known-failure"),
      rec(8, "service-settled", "closed"),
    ];
    const transfer = validateFixedViteProgressSnapshotForTest(
      progressLine(plan, failureRecords, {
        status: "failure",
        failureCode: "P2_CHILD_FAILED",
        settlement: "known",
        settlementCode: null,
      }),
      plan.selected,
      1,
    );
    const trace: string[] = [];
    const outcome =
      await executeAndFinalizeFixedViteLifecycleWithBackendsForTest(
        plan,
        async () => results.shift()!,
        async () => transfer,
        finalizationBackend(plan, trace),
      );
    expect(trace).toEqual(["attempt"]);
    expect(outcome.attempt).toMatchObject({
      primaryFailureStage: "runner-disposition",
      primaryFailureCode: "P2_CHILD_FAILED",
      runnerProcessSettlement: "exited",
      runner: { status: "failure", settlement: "known" },
      issues: expect.arrayContaining([
        "P2_ATTEMPT_RUNNER_FAILED",
        "P2_ATTEMPT_OUTPUT_NOT_INSPECTED",
      ]),
    });
  });

  it("bounds Docker command output and post-signal settlement", async () => {
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
    });
    expect(FIXED_VITE_EXECUTOR_LIMITS).toEqual({
      dockerCommandMs: 20_000,
      containerDeadlineMs: 60_000,
      dockerSettlementMs: 1_000,
    });
  });

  it("requires exact pair identity, image, completion, and trust marker", () => {
    const receipts = createFixedViteExecutionPlans().map(({ selected }) => ({
      scenarioId: selected.scenarioId,
      profileId: selected.profileId,
      runId: selected.runId,
      expectedRevision: selected.expectedRevision,
      imageId: FIXED_NODE_IMAGE_ID,
      completion: "complete" as const,
      progressTrust: "repository-cooperative-fixture" as const,
    }));
    expect(projectFixedViteExecutionPair(receipts)).toEqual({
      schemaVersion: "p2-vite-pair/v4",
      expectedRevision: FIXED_VITE_EXPECTED_REVISION,
      validity: "same-image",
      imageId: FIXED_NODE_IMAGE_ID,
      progressTrust: "repository-cooperative-fixture",
      issues: [],
    });
    expect(
      projectFixedViteExecutionPair([
        receipts[0]!,
        { ...receipts[1]!, progressTrust: "rejected" as never },
      ]),
    ).toMatchObject({
      validity: "inconclusive",
      issues: ["PAIR_PROGRESS_TRUST_MISMATCH"],
    });
  });

  it("stops before constrained after a permissive inconclusive outcome", async () => {
    const plan = createFixedViteExecutionPlans()[0]!;
    const calls: string[] = [];
    const pair = await executeFixedVitePlanSequenceWithBackendForTest(
      async (candidate) => {
        calls.push(candidate.selected.scenarioId);
        return {
          scenarioId: plan.selected.scenarioId,
          profileId: plan.selected.profileId,
          runId: plan.selected.runId,
          completion: "inconclusive",
          attemptRecord: "written",
          evidence: "not-inspected",
          receipt: null,
          attempt: null,
          issues: [],
        };
      },
    );
    expect(calls).toEqual(["vite-observe-p"]);
    expect(pair.projection.validity).toBe("inconclusive");
  });

  it("keeps the cooperative writer limitation explicit and singular in staging", async () => {
    const staging = createFixedViteStagingPlan();
    const tokens = [
      "/tmp/p2-progress",
      "runner-progress.json",
      "runner-progress.next",
      "p2-vite-progress/v2",
    ];
    const matching = new Set<string>();
    for (const entry of staging.entries) {
      const source = await readFile(entry.sourcePath, "utf8").catch(() => "");
      if (tokens.some((token) => source.includes(token))) {
        matching.add(entry.sourcePath);
      }
    }
    expect([...matching]).toEqual([
      expect.stringMatching(/runner\/vite-runner\.js$/u),
    ]);
    const [runner, executor] = await Promise.all([
      readFile(new URL("../runner/vite-runner.js", import.meta.url), "utf8"),
      readFile(new URL("../src/vite-executor.ts", import.meta.url), "utf8"),
    ]);
    expect(runner).toContain("createFixedViteProgressWriter");
    expect(executor).toContain("repository-cooperative-fixture");
    expect(executor).not.toContain('"start", "--attach"');
    expect(executor).not.toContain("process.env");
    expect(executor).not.toContain("docker.sock");
  });
});
