import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  createFixedCodegenExecutionPlans,
  validateFixedCodegenLifecycle,
} from "../src/codegen-executor.js";
import { FIXED_DOCKER_EXECUTABLE, FIXED_NODE_IMAGE } from "../src/plan.js";

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
    expect(runner).toContain("await chmod(FIXED_EVENT_SEGMENT, 0o444)");
    expect(runner).toContain("sourceBeforeHash");
    expect(runner).toContain("sourceAfterHash");
  });
});
