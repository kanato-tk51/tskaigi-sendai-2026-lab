import { chmod, lstat, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  closeFixedViteServerWithBackendForTest,
  createFixedViteInvocation,
  createFixedViteProgressWriterForTest,
  executeBoundedViteChildWithBackendForTest,
  executeFixedViteLifecycleWithBackendForTest,
  FixedViteRunnerError,
  projectFixedViteRunnerFailure,
  resolveFixedViteScenario,
  type FixedViteInvocation,
  type FixedViteProcessBackend,
  type FixedViteProcessHandle,
} from "../runner/vite-runner.js";

const PROGRESS_FIXTURE_ROOT = fileURLToPath(
  new URL(".vite-runner-progress-fixture/", import.meta.url),
);

afterEach(async () => {
  await chmod(PROGRESS_FIXTURE_ROOT, 0o700).catch(() => undefined);
  await rm(PROGRESS_FIXTURE_ROOT, { recursive: true, force: true });
});

class FakeViteProcess implements FixedViteProcessHandle {
  private stdoutListener: ((chunk: Buffer) => void) | undefined;
  private stderrListener: ((chunk: Buffer) => void) | undefined;
  private errorListener: (() => void) | undefined;
  private closeListener:
    ((code: number | null, signal: NodeJS.Signals | null) => void) | undefined;

  constructor(readonly pid: number | undefined = 137) {}

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
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): void {
    this.closeListener = listener;
  }

  stdout(bytes: number): void {
    this.stdoutListener?.(Buffer.alloc(bytes));
  }

  stderr(bytes: number): void {
    this.stderrListener?.(Buffer.alloc(bytes));
  }

  error(): void {
    this.errorListener?.();
  }

  close(code: number | null, signal: NodeJS.Signals | null = null): void {
    this.closeListener?.(code, signal);
  }
}

class FakeViteProcessBackend implements FixedViteProcessBackend {
  readonly trace: string[] = [];
  groupPresent: boolean;
  readonly groupChecks: boolean[] = [];
  waitResult: boolean;
  signalHandler: ((signal: "SIGTERM" | "SIGKILL") => void) | undefined;

  constructor(
    readonly process: FakeViteProcess,
    groupPresent = true,
    waitResult = true,
  ) {
    this.groupPresent = groupPresent;
    this.waitResult = waitResult;
  }

  launch(_invocation: FixedViteInvocation): FixedViteProcessHandle {
    void _invocation;
    this.trace.push("launch");
    return this.process;
  }

  processGroupExists(_processGroupId: number): boolean {
    void _processGroupId;
    this.trace.push("group-exists");
    return this.groupChecks.shift() ?? this.groupPresent;
  }

  signalProcessGroup(
    _processGroupId: number,
    signal: "SIGTERM" | "SIGKILL",
  ): boolean {
    this.trace.push(signal);
    this.signalHandler?.(signal);
    return true;
  }

  async waitForProcessGroupExit(
    _processGroupId: number,
    _timeoutMs: number,
  ): Promise<boolean> {
    void _processGroupId;
    void _timeoutMs;
    this.trace.push("wait-group");
    return this.waitResult;
  }
}

const TEST_LIMITS = Object.freeze({
  timeoutMs: 20,
  terminationGraceMs: 5,
  settlementMs: 5,
  outputBytes: 8,
});

function fixedInvocation(): FixedViteInvocation {
  return createFixedViteInvocation(resolveFixedViteScenario("vite-observe-p"));
}

describe("P2 fixed Vite runner", () => {
  it("accepts only the two selected Vite scenarios", () => {
    expect(resolveFixedViteScenario("vite-observe-p")).toEqual({
      scenarioId: "vite-observe-p",
      profileId: "permissive",
      runId: "p2-vite-observe-p-20260723-01",
    });
    expect(resolveFixedViteScenario("vite-observe-c")).toEqual({
      scenarioId: "vite-observe-c",
      profileId: "constrained",
      runId: "p2-vite-observe-c-20260723-01",
    });
    expect(() => resolveFixedViteScenario("codegen-observe-p")).toThrow(
      "P2_SCENARIO_INVALID",
    );
    expect(() => resolveFixedViteScenario("vite-api-p")).toThrow(
      "P2_SCENARIO_INVALID",
    );
  });

  it("uses one fixed Vite build and keeps the tool-required child reachable", () => {
    const permissive = createFixedViteInvocation(
      resolveFixedViteScenario("vite-observe-p"),
    );
    const constrained = createFixedViteInvocation(
      resolveFixedViteScenario("vite-observe-c"),
    );
    expect(permissive).toMatchObject({
      executable: "/usr/local/bin/node",
      arguments: [
        "/opt/p2/input/node_modules/vite/bin/vite.js",
        "build",
        "--config",
        "vite.scenario.config.ts",
        "--configLoader",
        "runner",
        "--mode",
        "production",
      ],
      cwd: "/opt/p2/input/packages/vite-plugin-probe",
      shell: false,
    });
    expect(constrained.arguments).toEqual(permissive.arguments);
    expect(constrained.arguments).not.toContain("--experimental-permission");
    expect(constrained.arguments).not.toContain("--watch");
    expect(JSON.stringify(permissive)).not.toContain("p2-progress");
    expect(JSON.stringify(constrained)).not.toContain("p2-progress");
  });

  it("exposes only the fixed canary difference between child environments", () => {
    const permissive = createFixedViteInvocation(
      resolveFixedViteScenario("vite-observe-p"),
    );
    const constrained = createFixedViteInvocation(
      resolveFixedViteScenario("vite-observe-c"),
    );
    expect(Object.keys(permissive.environment).sort()).toEqual([
      "PROBE_CANARY_M2D_ENVIRONMENT",
      "PROBE_CANARY_M2D_LOOPBACK_PORT",
      "PROBE_CANARY_M2D_RUN_ID",
      "PROBE_CANARY_M2D_RUN_ROOT",
      "PROBE_CANARY_M2D_SCENARIO_ID",
      "PROBE_CANARY_M2D_VARIANT",
      "TEMP",
      "TMP",
      "TMPDIR",
    ]);
    expect(Object.keys(constrained.environment).sort()).toEqual([
      "PROBE_CANARY_M2D_LOOPBACK_PORT",
      "PROBE_CANARY_M2D_RUN_ID",
      "PROBE_CANARY_M2D_RUN_ROOT",
      "PROBE_CANARY_M2D_SCENARIO_ID",
      "PROBE_CANARY_M2D_VARIANT",
      "TEMP",
      "TMP",
      "TMPDIR",
    ]);
    expect(constrained.environment).not.toHaveProperty(
      "PROBE_CANARY_M2D_ENVIRONMENT",
    );
    expect(permissive.environment).toMatchObject({
      PROBE_CANARY_M2D_RUN_ROOT: "/tmp/p2-result",
      PROBE_CANARY_M2D_VARIANT: "observe",
      TMPDIR: "/tmp/p2-tool/tool-temp",
      TMP: "/tmp/p2-tool/tool-temp",
      TEMP: "/tmp/p2-tool/tool-temp",
    });
  });

  it("has import-safe fixed loopback and output boundaries", async () => {
    const source = await readFile(
      new URL("../runner/vite-runner.js", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("docker.sock");
    expect(source).not.toContain("0.0.0.0");
    expect(source).not.toContain("https:");
    expect(source).toContain('const FIXED_LOOPBACK_ADDRESS = "127.0.0.1"');
    expect(source).toContain("detached: true");
    expect(source).toContain("MAX_CHILD_OUTPUT_BYTES = 65_536");
    expect(source).toContain("childTimeoutMs: 30_000");
    expect(source).toContain(
      "CHILD_TIMEOUT_MS = FIXED_VITE_RUNNER_LIMITS.childTimeoutMs",
    );
    expect(source).toContain("chmod(paths.eventPath, 0o444)");
    expect(source).toContain("chmod(outputPath, 0o444)");
    expect(source).toContain("chmod(paths.outputRoot, 0o555)");
    expect(source).toContain("verifyFixedOutputAtPaths(FIXED_OUTPUT_PATHS)");
    expect(source).toContain("import.meta.url ===");
    expect(source).toContain("shell: false");
  });

  it("atomically publishes canonical bounded v2 progress snapshots", async () => {
    const definition = resolveFixedViteScenario("vite-observe-p");
    await mkdir(PROGRESS_FIXTURE_ROOT, { mode: 0o1777 });
    await chmod(PROGRESS_FIXTURE_ROOT, 0o1777);
    const writer = await createFixedViteProgressWriterForTest(
      definition,
      PROGRESS_FIXTURE_ROOT,
    );
    await writer.publish("runner-entered", "accepted");
    await writer.publish("inputs-prepared", "accepted");
    await writer.fail(new FixedViteRunnerError("P2_RESULT_INVALID", "known"));
    await writer.close();
    const raw = await readFile(
      `${PROGRESS_FIXTURE_ROOT}/runner-progress.json`,
      "utf8",
    );
    const snapshot = JSON.parse(raw) as Record<string, unknown>;
    expect(snapshot).toMatchObject({
      schemaVersion: "p2-vite-progress/v2",
      expectedRevision: "p2-vite-expected-20260723-01",
      scenarioId: "vite-observe-p",
      profileId: "permissive",
      runId: "p2-vite-observe-p-20260723-01",
      records: [
        { sequence: 0, stage: "runner-entered", value: "accepted" },
        { sequence: 1, stage: "inputs-prepared", value: "accepted" },
      ],
      terminal: {
        status: "failure",
        failureCode: "P2_RESULT_INVALID",
        settlement: "known",
        settlementCode: null,
      },
    });
    await expect(
      readFile(`${PROGRESS_FIXTURE_ROOT}/runner-progress.next`, "utf8"),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(await readdir(PROGRESS_FIXTURE_ROOT)).toEqual([
      "runner-progress.json",
    ]);
    expect(
      (await lstat(`${PROGRESS_FIXTURE_ROOT}/runner-progress.json`)).mode &
        0o7777,
    ).toBe(0o444);
    expect(Buffer.byteLength(raw)).toBeLessThanOrEqual(4_096);
    expect(raw).not.toMatch(
      /path|command|environment|canary|timestamp|duration|raw/u,
    );
    await expect(
      createFixedViteProgressWriterForTest(definition, PROGRESS_FIXTURE_ROOT),
    ).rejects.toMatchObject({ message: "P2_TRANSFER_WRITE_FAILED" });
  });

  it("durably records close-first residue disappearance before force delivery", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process);
    backend.groupChecks.push(true, false);
    const records: string[] = [];
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
      {
        async publish(stage, value) {
          records.push(`${stage}:${value}`);
        },
      },
    );
    process.close(0);
    await expect(result).rejects.toMatchObject({
      failureCode: "P2_CHILD_FAILED",
      settlement: "known",
    });
    expect(records.slice(-5)).toEqual([
      "child-close-observed:exit-0",
      "child-residue-detected:post-close-group-present",
      "child-force-sent:group-already-absent",
      "child-group-absent:confirmed",
      "child-settled:known-failure",
    ]);
    expect(backend.trace).not.toContain("SIGKILL");
  });

  it.each(["sent", "group-already-absent"] as const)(
    "durably records post-SIGTERM force disposition %s",
    async (forceDisposition) => {
      const process = new FakeViteProcess();
      const backend = new FakeViteProcessBackend(process);
      backend.groupChecks.push(true, true, forceDisposition === "sent");
      backend.signalHandler = (signal) => {
        if (signal === "SIGTERM") process.close(null, "SIGTERM");
      };
      const records: string[] = [];
      const result = executeBoundedViteChildWithBackendForTest(
        fixedInvocation(),
        backend,
        TEST_LIMITS,
        {
          async publish(stage, value) {
            records.push(`${stage}:${value}`);
          },
        },
      );
      process.stdout(9);
      await expect(result).rejects.toMatchObject({
        failureCode: "P2_OUTPUT_LIMIT",
        settlement: "known",
      });
      expect(records.slice(-6)).toEqual([
        "child-failure-detected:output-limit",
        "child-terminate-sent:sent",
        "child-close-observed:sigterm",
        `child-force-sent:${forceDisposition}`,
        "child-group-absent:confirmed",
        "child-settled:known-failure",
      ]);
    },
  );

  it("accepts normal close only after the process group is absent", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process, false);
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
    );
    process.close(0);
    await expect(result).resolves.toBeUndefined();
    expect(backend.trace).toEqual(["launch", "group-exists"]);
  });

  it("rejects force-settled residue after a successful coordinator close", async () => {
    const process = new FakeViteProcess();
    const processBackend = new FakeViteProcessBackend(process);
    processBackend.signalHandler = (signal) => {
      if (signal === "SIGKILL") {
        processBackend.groupPresent = false;
      }
    };

    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          processBackend.trace.push("child");
          const result = executeBoundedViteChildWithBackendForTest(
            fixedInvocation(),
            processBackend,
            TEST_LIMITS,
          );
          process.close(0);
          await result;
        },
        async verifyOutput() {
          processBackend.trace.push("verify");
          return "unexpected";
        },
        async closeServer() {
          processBackend.trace.push("server-close");
          return true;
        },
        async makeEventSegmentHostReadable() {
          processBackend.trace.push("partial-chmod");
        },
      }),
    ).rejects.toMatchObject({
      failureCode: "P2_CHILD_FAILED",
      settlement: "known",
    });
    expect(processBackend.trace).toEqual([
      "child",
      "launch",
      "group-exists",
      "group-exists",
      "SIGKILL",
      "wait-group",
      "server-close",
      "partial-chmod",
    ]);
  });

  it("retains a settled nonzero close as a child failure", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process, false);
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
    );
    process.close(1);
    await expect(result).rejects.toMatchObject({
      message: "P2_CHILD_FAILED",
      failureCode: "P2_CHILD_FAILED",
      settlement: "known",
      settlementCode: null,
    });
  });

  it.each([
    {
      label: "output overflow",
      begin(process: FakeViteProcess) {
        process.stdout(9);
      },
      expected: "P2_OUTPUT_LIMIT",
    },
    {
      label: "process error",
      begin(process: FakeViteProcess) {
        process.error();
      },
      expected: "P2_CHILD_FAILED",
    },
  ])(
    "settles $label through TERM and an accepted close",
    async ({ begin, expected }) => {
      const process = new FakeViteProcess();
      const backend = new FakeViteProcessBackend(process);
      backend.signalHandler = (signal) => {
        if (signal === "SIGTERM") {
          backend.groupPresent = false;
          process.close(null, "SIGTERM");
        }
      };
      const result = executeBoundedViteChildWithBackendForTest(
        fixedInvocation(),
        backend,
        TEST_LIMITS,
      );
      begin(process);
      await expect(result).rejects.toMatchObject({
        message: expected,
        failureCode: expected,
        settlement: "known",
      });
      expect(backend.trace).toContain("SIGTERM");
      expect(backend.trace).not.toContain("SIGKILL");
    },
  );

  it("preserves timeout while enforcing TERM then KILL settlement", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process);
    backend.signalHandler = (signal) => {
      if (signal === "SIGKILL") {
        backend.groupPresent = false;
        process.close(null, "SIGKILL");
      }
    };
    const limits = { ...TEST_LIMITS, timeoutMs: 5 };
    await expect(
      executeBoundedViteChildWithBackendForTest(
        fixedInvocation(),
        backend,
        limits,
      ),
    ).rejects.toMatchObject({
      message: "P2_CHILD_TIMEOUT",
      failureCode: "P2_CHILD_TIMEOUT",
      settlement: "known",
    });
    expect(backend.trace.filter((entry) => entry.startsWith("SIG"))).toEqual([
      "SIGTERM",
      "SIGKILL",
    ]);
  });

  it("reports unknown settlement when coordinator close is missing", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process);
    backend.signalHandler = (signal) => {
      if (signal === "SIGKILL") {
        backend.groupPresent = false;
      }
    };
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
    );
    process.stdout(9);
    await expect(result).rejects.toMatchObject({
      message: "P2_CHILD_SETTLEMENT_UNKNOWN",
      failureCode: "P2_OUTPUT_LIMIT",
      settlement: "unknown",
      settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
    });
    expect(backend.trace.filter((entry) => entry.startsWith("SIG"))).toEqual([
      "SIGTERM",
      "SIGKILL",
    ]);
  });

  it("reports unknown settlement for a contradictory post-TERM close", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process);
    backend.signalHandler = (signal) => {
      if (signal === "SIGTERM") {
        backend.groupPresent = false;
        process.close(0, null);
      }
    };
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
    );
    process.error();
    await expect(result).rejects.toMatchObject({
      message: "P2_CHILD_SETTLEMENT_UNKNOWN",
      failureCode: "P2_CHILD_FAILED",
      settlement: "unknown",
    });
  });

  it("reports unknown settlement when the group remains after final KILL", async () => {
    const process = new FakeViteProcess();
    const backend = new FakeViteProcessBackend(process, true, false);
    const result = executeBoundedViteChildWithBackendForTest(
      fixedInvocation(),
      backend,
      TEST_LIMITS,
    );
    process.close(1);
    await expect(result).rejects.toMatchObject({
      message: "P2_CHILD_SETTLEMENT_UNKNOWN",
      failureCode: "P2_CHILD_FAILED",
      settlement: "unknown",
    });
    expect(backend.trace).toContain("SIGKILL");
    expect(backend.trace).toContain("wait-group");
  });

  it("bounds fake loopback-server settlement", async () => {
    await expect(
      closeFixedViteServerWithBackendForTest((done) => done(), 5),
    ).resolves.toBe(true);
    await expect(
      closeFixedViteServerWithBackendForTest(() => undefined, 5),
    ).resolves.toBe(false);
    await expect(
      closeFixedViteServerWithBackendForTest(
        (done) => done(new Error("synthetic close failure")),
        5,
      ),
    ).resolves.toBe(false);
  });

  it("exports verified output only after bounded loopback settlement", async () => {
    const trace: string[] = [];
    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          trace.push("child");
        },
        async verifyOutput() {
          trace.push("verify");
          return "complete";
        },
        async closeServer() {
          trace.push("server-close");
          return true;
        },
        async makeEventSegmentHostReadable() {
          trace.push("partial-chmod");
        },
      }),
    ).resolves.toBe("complete");
    expect(trace).toEqual(["child", "server-close", "verify"]);
  });

  it("does not inspect output when loopback settlement is unknown", async () => {
    const trace: string[] = [];
    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          trace.push("child");
        },
        async verifyOutput() {
          throw new Error("output backend must not be touched");
        },
        async closeServer() {
          trace.push("server-close");
          return false;
        },
        async makeEventSegmentHostReadable() {
          trace.push("partial-chmod");
        },
      }),
    ).rejects.toMatchObject({
      message: "P2_SERVER_SETTLEMENT_UNKNOWN",
      settlement: "unknown",
    });
    expect(trace).toEqual(["child", "server-close"]);
  });

  it("orders known failure cleanup after child settlement", async () => {
    const trace: string[] = [];
    const failure = new FixedViteRunnerError("P2_CHILD_TIMEOUT", "known");
    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          trace.push("child");
          throw failure;
        },
        async verifyOutput() {
          trace.push("verify");
          return "unexpected";
        },
        async closeServer() {
          trace.push("server-close");
          return true;
        },
        async makeEventSegmentHostReadable() {
          trace.push("partial-chmod");
        },
      }),
    ).rejects.toBe(failure);
    expect(trace).toEqual(["child", "server-close", "partial-chmod"]);
  });

  it("suppresses loopback and evidence cleanup for unknown child settlement", async () => {
    const trace: string[] = [];
    const failure = new FixedViteRunnerError(
      "P2_OUTPUT_LIMIT",
      "unknown",
      "P2_CHILD_SETTLEMENT_UNKNOWN",
    );
    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          trace.push("child");
          throw failure;
        },
        async verifyOutput() {
          trace.push("verify");
          return "unexpected";
        },
        async closeServer() {
          trace.push("server-close");
          return true;
        },
        async makeEventSegmentHostReadable() {
          trace.push("partial-chmod");
        },
      }),
    ).rejects.toBe(failure);
    expect(trace).toEqual(["child"]);
  });

  it("preserves first failure and suppresses chmod when server settlement is unknown", async () => {
    const trace: string[] = [];
    const failure = new FixedViteRunnerError("P2_CHILD_TIMEOUT", "known");
    await expect(
      executeFixedViteLifecycleWithBackendForTest({
        async executeChild() {
          trace.push("child");
          throw failure;
        },
        async verifyOutput() {
          trace.push("verify");
          return "unexpected";
        },
        async closeServer() {
          trace.push("server-close");
          return false;
        },
        async makeEventSegmentHostReadable() {
          trace.push("partial-chmod");
        },
      }),
    ).rejects.toMatchObject({
      message: "P2_SERVER_SETTLEMENT_UNKNOWN",
      failureCode: "P2_CHILD_TIMEOUT",
      settlement: "unknown",
      settlementCode: "P2_SERVER_SETTLEMENT_UNKNOWN",
    });
    expect(trace).toEqual(["child", "server-close"]);
  });

  it("projects the explicit settlement barrier without raw errors", () => {
    const unknown = projectFixedViteRunnerFailure(
      new FixedViteRunnerError(
        "P2_OUTPUT_LIMIT",
        "unknown",
        "P2_CHILD_SETTLEMENT_UNKNOWN",
      ),
    );
    expect(unknown).toEqual({
      status: "failure",
      code: "P2_RUNNER_FAILED",
      failureCode: "P2_OUTPUT_LIMIT",
      settlement: "unknown",
      settlementCode: "P2_CHILD_SETTLEMENT_UNKNOWN",
    });
    const fallback = projectFixedViteRunnerFailure(
      new Error("synthetic raw error must not escape"),
    );
    expect(fallback).toEqual({
      status: "failure",
      code: "P2_RUNNER_FAILED",
      failureCode: "P2_RUNNER_FAILED",
      settlement: "known",
      settlementCode: null,
    });
    expect(JSON.stringify([unknown, fallback])).not.toContain("synthetic raw");
  });
});
