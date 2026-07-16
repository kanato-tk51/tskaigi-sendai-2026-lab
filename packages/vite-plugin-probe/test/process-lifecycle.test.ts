import { describe, expect, it } from "vitest";

import { AdapterError } from "../src/errors.js";
import {
  ProcessLifecycleError,
  runFixedLifecycleFixtureForTest,
} from "../src/process-lifecycle.js";
import type { ProcessLifecycleStage } from "../src/process-lifecycle.js";
import {
  cleanupIsSafeAfter,
  combineScenarioFailures,
} from "../src/scenario.js";

async function lifecycleFailure(
  mode: Parameters<typeof runFixedLifecycleFixtureForTest>[0],
  fault?: Parameters<typeof runFixedLifecycleFixtureForTest>[1],
): Promise<{
  readonly error: ProcessLifecycleError;
  readonly trace: ProcessLifecycleStage[];
}> {
  const trace: ProcessLifecycleStage[] = [];
  try {
    await runFixedLifecycleFixtureForTest(mode, fault, trace);
  } catch (error) {
    expect(error).toBeInstanceOf(ProcessLifecycleError);
    return { error: error as ProcessLifecycleError, trace };
  }
  throw new Error("expected fixed lifecycle failure");
}

describe("fixed Linux process lifecycle", () => {
  it("accepts only success close code 0 and proves group absence", async () => {
    await expect(
      runFixedLifecycleFixtureForTest("exit"),
    ).resolves.toMatchObject({
      closeCode: 0,
      closeSignal: null,
      processGroupAbsent: true,
      esbuildResidueAbsent: true,
    });
  });

  it("distinguishes a normal nonzero close from termination", async () => {
    const { error } = await lifecycleFailure("nonzero");
    expect(error.code).toBe("M2D_TOOL_COMMAND_FAILED");
    expect(error.processSettled).toBe(true);
    expect(error.secondaryCodes).toEqual([]);
  });

  it("handles timeout with graceful TERM disposition", async () => {
    const { error, trace } = await lifecycleFailure("graceful");
    expect(error.code).toBe("M2D_TOOL_TIMEOUT");
    expect(error.processSettled).toBe(true);
    expect(trace).toEqual(
      expect.arrayContaining([
        "termination-requested",
        "coordinator-close",
        "close-disposition-validated",
        "process-group-gone",
      ]),
    );
    expect(trace).not.toContain("force-termination-requested");
  });

  it("uses bounded grace then force KILL for an ignoring process", async () => {
    const { error, trace } = await lifecycleFailure("hang");
    expect(error.code).toBe("M2D_TOOL_TIMEOUT");
    expect(error.processSettled).toBe(true);
    expect(trace).toContain("force-termination-requested");
    expect(trace).toContain("close-disposition-validated");
  });

  it("makes output limit primary while draining and settling", async () => {
    const { error, trace } = await lifecycleFailure("output");
    expect(error.code).toBe("M2D_TOOL_OUTPUT_LIMIT");
    expect(error.processSettled).toBe(true);
    expect(trace).toContain("process-group-gone");
  });

  it.each([
    ["graceful", "graceful-signal-failure"],
    ["hang", "force-signal-failure"],
  ] as const)("retains primary failure on %s / %s", async (mode, fault) => {
    const { error } = await lifecycleFailure(mode, fault);
    expect(error.code).toBe("M2D_TOOL_TIMEOUT");
    expect(error.secondaryCodes).toContain("M2D_SIGNAL_FAILED");
  });

  it("rejects unexpected close disposition", async () => {
    const { error } = await lifecycleFailure(
      "hang",
      "unexpected-close-disposition",
    );
    expect(error.secondaryCodes).toContain("M2D_CLOSE_DISPOSITION_MISMATCH");
    expect(error.secondaryCodes).toContain("M2D_SETTLEMENT_UNKNOWN");
    expect(cleanupIsSafeAfter(error)).toBe(false);
  });

  it("rejects close deadline and suppresses unsafe cleanup", async () => {
    const { error, trace } = await lifecycleFailure("hang", "close-deadline");
    expect(error.secondaryCodes).toContain("M2D_CLOSE_DEADLINE");
    expect(error.secondaryCodes).toContain("M2D_SETTLEMENT_UNKNOWN");
    expect(error.processSettled).toBe(false);
    expect(cleanupIsSafeAfter(error)).toBe(false);
    expect(trace).toContain("settlement-unknown");
  });

  it("rejects process/esbuild residue after coordinator close", async () => {
    const { error } = await lifecycleFailure("exit", "process-residue");
    expect(error.code).toBe("M2D_ESBUILD_RESIDUE");
    expect(error.processSettled).toBe(true);
  });

  it("keeps timeout primary over cleanup and makes cleanup-only failure primary", () => {
    const timeout = new AdapterError("M2D_TOOL_TIMEOUT");
    const cleanup = new AdapterError("M2D_CLEANUP_FAILED");
    expect(combineScenarioFailures(timeout, cleanup)).toMatchObject({
      code: "M2D_TOOL_TIMEOUT",
      secondaryCodes: ["M2D_CLEANUP_FAILED"],
    });
    expect(combineScenarioFailures(undefined, cleanup)).toMatchObject({
      code: "M2D_CLEANUP_FAILED",
      secondaryCodes: [],
    });
  });
});
