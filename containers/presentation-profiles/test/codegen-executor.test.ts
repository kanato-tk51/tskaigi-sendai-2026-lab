import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  createFixedCodegenExecutionPlans,
  executeFixedCodegenLifecycleWithBackendForTest,
  FixedCodegenCommandError,
  projectFixedCodegenExecutionPair,
  readBoundedEventHandleForTest,
  runFixedDockerCommandWithProcessForTest,
  validateFixedCodegenLifecycle,
} from "../src/codegen-executor.js";
import {
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
  type FixedDockerCommand,
} from "../src/plan.js";

type CommandResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

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
  plan: ReturnType<typeof createFixedCodegenExecutionPlans>[number],
  command: FixedDockerCommand,
): string {
  if (command === plan.create) return "create";
  if (command === plan.start) return "start";
  if (command === plan.remove) return "remove";
  return "inspect";
}

function successfulLifecycleResults(
  plan: ReturnType<typeof createFixedCodegenExecutionPlans>[number],
): readonly CommandResult[] {
  const containerId = "a".repeat(64);
  const imageId = `sha256:${"b".repeat(64)}`;
  return [
    { exitCode: 0, stdout: `${containerId}\n`, stderr: "" },
    {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|created|0\n`,
      stderr: "",
    },
    {
      exitCode: 0,
      stdout: `${JSON.stringify({
        status: "completed",
        scenarioId: plan.selected.scenarioId,
        profileId: plan.selected.profileId,
        sourceBeforeHash: "c".repeat(64),
        sourceAfterHash: "c".repeat(64),
      })}\n`,
      stderr: "",
    },
    {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|exited|0\n`,
      stderr: "",
    },
    { exitCode: 0, stdout: "", stderr: "" },
  ];
}

describe("P2 fixed codegen executor", () => {
  it("exposes exactly two closed codegen lifecycle plans", () => {
    const plans = createFixedCodegenExecutionPlans();
    expect(createFixedCodegenExecutionPlans.length).toBe(0);
    expect(Object.isFrozen(plans)).toBe(true);
    expect(plans.map((plan) => plan.selected.scenarioId)).toEqual([
      "codegen-observe-p",
      "codegen-observe-c",
    ]);
    expect(plans.every(Object.isFrozen)).toBe(true);
  });

  it("uses only fixed create, inspect, attach-start, and force-remove commands", () => {
    for (const plan of createFixedCodegenExecutionPlans()) {
      expect(plan.containerName).toBe(`tskaigi-p2-${plan.selected.scenarioId}`);
      expect(plan.create.executable).toBe(FIXED_DOCKER_EXECUTABLE);
      expect(plan.create.arguments).toContain(FIXED_NODE_IMAGE);
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

  it("validates only the fixed created-to-exited identity transition", () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const containerId = "a".repeat(64);
    const imageId = `sha256:${"b".repeat(64)}`;
    const create = { exitCode: 0, stdout: `${containerId}\n`, stderr: "" };
    const beforeInspect = {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|created|0\n`,
      stderr: "",
    };
    const start = {
      exitCode: 0,
      stdout: `${JSON.stringify({
        status: "completed",
        scenarioId: plan.selected.scenarioId,
        profileId: plan.selected.profileId,
        sourceBeforeHash: "c".repeat(64),
        sourceAfterHash: "c".repeat(64),
      })}\n`,
      stderr: "",
    };
    const afterInspect = {
      exitCode: 0,
      stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|exited|0\n`,
      stderr: "",
    };
    expect(
      validateFixedCodegenLifecycle({
        plan,
        create,
        beforeInspect,
        start,
        afterInspect,
      }),
    ).toEqual({
      imageId,
      containerExitCode: 0,
      runnerSummary: {
        sourceBeforeHash: "c".repeat(64),
        sourceAfterHash: "c".repeat(64),
      },
    });
    expect(() =>
      validateFixedCodegenLifecycle({
        plan,
        create,
        beforeInspect,
        start,
        afterInspect: {
          ...afterInspect,
          stdout: `${containerId}|${imageId}|node:latest|exited|0\n`,
        },
      }),
    ).toThrow("P2_EXECUTOR_INSPECT_INVALID");
  });

  it("retains a nonzero container exit without retaining raw runner stderr", () => {
    const plan = createFixedCodegenExecutionPlans()[1]!;
    const containerId = "d".repeat(64);
    const imageId = `sha256:${"e".repeat(64)}`;
    const result = validateFixedCodegenLifecycle({
      plan,
      create: { exitCode: 0, stdout: `${containerId}\n`, stderr: "" },
      beforeInspect: {
        exitCode: 0,
        stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|created|0\n`,
        stderr: "",
      },
      start: {
        exitCode: 1,
        stdout: "",
        stderr: "raw runner failure must be discarded",
      },
      afterInspect: {
        exitCode: 0,
        stdout: `${containerId}|${imageId}|${FIXED_NODE_IMAGE}|exited|1\n`,
        stderr: "",
      },
    });
    expect(result).toEqual({
      imageId,
      containerExitCode: 1,
      runnerSummary: null,
    });
    expect(JSON.stringify(result)).not.toContain("raw runner failure");
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
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const trace: string[] = [];
    await expect(
      executeFixedCodegenLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return create;
      }),
    ).rejects.toThrow();
    expect(trace).toEqual(["create"]);
  });

  it.each([
    {
      label: "failed first inspect",
      inspect: { exitCode: 1, stdout: "", stderr: "inspect failure" },
    },
    {
      label: "malformed first inspect",
      inspect: { exitCode: 0, stdout: "malformed\n", stderr: "" },
    },
    {
      label: "first-inspect identity mismatch",
      inspect: {
        exitCode: 0,
        stdout: `${"d".repeat(64)}|sha256:${"b".repeat(64)}|${FIXED_NODE_IMAGE}|created|0\n`,
        stderr: "",
      },
    },
  ])(
    "cleans up the owned container after $label without starting",
    async ({ inspect }) => {
      const plan = createFixedCodegenExecutionPlans()[0]!;
      const trace: string[] = [];
      const results: CommandResult[] = [
        {
          exitCode: 0,
          stdout: `${"a".repeat(64)}\n`,
          stderr: "",
        },
        inspect,
        { exitCode: 0, stdout: "", stderr: "" },
      ];
      await expect(
        executeFixedCodegenLifecycleWithBackendForTest(
          plan,
          async (command) => {
            trace.push(commandLabel(plan, command));
            return results.shift()!;
          },
        ),
      ).rejects.toThrow();
      expect(trace).toEqual(["create", "inspect", "remove"]);
    },
  );

  it("cleans up only after a settled start failure", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    await expect(
      executeFixedCodegenLifecycleWithBackendForTest(plan, async (command) => {
        const label = commandLabel(plan, command);
        trace.push(label);
        if (label === "start") {
          throw new FixedCodegenCommandError(
            "P2_EXECUTOR_DOCKER_TIMEOUT",
            "closed",
            true,
          );
        }
        return results.shift()!;
      }),
    ).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      settlement: "closed",
    });
    expect(trace).toEqual(["create", "inspect", "start", "remove"]);
  });

  it("suppresses cleanup while a failed command has unknown settlement", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    await expect(
      executeFixedCodegenLifecycleWithBackendForTest(plan, async (command) => {
        const label = commandLabel(plan, command);
        trace.push(label);
        if (label === "start") {
          throw new FixedCodegenCommandError(
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

  it("performs cleanup only after the validated exited transition", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const trace: string[] = [];
    const results = [...successfulLifecycleResults(plan)];
    await expect(
      executeFixedCodegenLifecycleWithBackendForTest(plan, async (command) => {
        trace.push(commandLabel(plan, command));
        return results.shift()!;
      }),
    ).resolves.toMatchObject({ imageId: `sha256:${"b".repeat(64)}` });
    expect(trace).toEqual(["create", "inspect", "start", "inspect", "remove"]);
  });

  it("bounds timeout settlement and keeps timeout as the primary failure", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedDockerCommandWithProcessForTest(
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

  it("keeps output overflow primary until close and discards later output", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedDockerCommandWithProcessForTest(
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

  it("keeps process error primary until close", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedDockerCommandWithProcessForTest(
      plan.create,
      () => process,
      { timeoutMs: 100, settlementMs: 100, outputBytes: 8 },
    );
    const rejection = expect(result).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_FAILED",
      settlement: "closed",
      signalAccepted: true,
    });
    process.error();
    process.close(null, "SIGKILL");
    await rejection;
  });

  it("rejects an unexpected post-signal close disposition", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const process = new FakeProcess();
    const result = runFixedDockerCommandWithProcessForTest(
      plan.create,
      () => process,
      { timeoutMs: 100, settlementMs: 100, outputBytes: 8 },
    );
    const rejection = expect(result).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_OUTPUT",
      settlement: "unknown",
      signalAccepted: true,
    });
    process.stdout(Buffer.alloc(9));
    process.close(0, null);
    await rejection;
  });

  it("returns bounded unknown settlement when close never arrives", async () => {
    const plan = createFixedCodegenExecutionPlans()[0]!;
    const process = new FakeProcess(false);
    const result = runFixedDockerCommandWithProcessForTest(
      plan.create,
      () => process,
      { timeoutMs: 10, settlementMs: 5, outputBytes: 8 },
    );
    await expect(result).rejects.toMatchObject({
      failureCode: "P2_EXECUTOR_DOCKER_TIMEOUT",
      settlement: "unknown",
      signalAccepted: false,
    });
  });

  it.each([
    { label: "exact limit", before: 65_536, after: 65_536, expected: 65_536 },
    { label: "limit plus one", before: 65_537, after: 65_537, expected: null },
    { label: "post-stat growth", before: 4, after: 5, expected: null },
  ])("bounds event reads for $label", async ({ before, after, expected }) => {
    const data = Buffer.alloc(after, 0x61);
    let statCount = 0;
    let readCount = 0;
    const result = await readBoundedEventHandleForTest({
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
    if (before > 65_536) {
      expect(readCount).toBe(0);
    }
  });

  it("cross-binds the fixed pair to one inspected image ID", () => {
    const plans = createFixedCodegenExecutionPlans();
    const imageId = `sha256:${"f".repeat(64)}`;
    const identities = plans.map(({ selected }) => ({
      scenarioId: selected.scenarioId,
      profileId: selected.profileId,
      runId: selected.runId,
      imageId,
    }));
    expect(projectFixedCodegenExecutionPair(identities)).toEqual({
      schemaVersion: "p2-codegen-pair/v1",
      validity: "same-image",
      imageId,
      issues: [],
    });
    expect(
      projectFixedCodegenExecutionPair([
        identities[0]!,
        { ...identities[1]!, imageId: `sha256:${"e".repeat(64)}` },
      ]),
    ).toEqual({
      schemaVersion: "p2-codegen-pair/v1",
      validity: "inconclusive",
      imageId: null,
      issues: ["IMAGE_ID_MISMATCH"],
    });
  });

  it("keeps the host executor and entry import-safe and argument-free", async () => {
    const [executor, entry, runner] = await Promise.all([
      readFile(new URL("../src/codegen-executor.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../runner/codegen-executor-entry.js", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../runner/codegen-runner.js", import.meta.url), "utf8"),
    ]);
    expect(executor).not.toContain("process.env");
    expect(executor).not.toContain("docker.sock");
    expect(executor).not.toContain("/home/");
    expect(executor).not.toContain("https:");
    expect(executor).toContain(
      'writeFile(path.join(dockerConfigRoot, "config.json"), "{}\\n"',
    );
    expect(entry).toContain("process.argv.length !== 2");
    expect(entry).toContain("import.meta.url ===");
    expect(entry).toContain('pair.projection.validity === "same-image"');
    expect(runner).toContain("await chmod(FIXED_EVENT_SEGMENT, 0o444)");
    expect(runner).toContain("sourceBeforeHash");
    expect(runner).toContain("sourceAfterHash");
  });
});
