import { describe, expect, it } from "vitest";

import { runFixedLifecycleScenarioForTest } from "../src/scenario.js";

const FORCED_TERMINATION_ORDER = [
  "primary-failure",
  "termination-requested",
  "force-termination-requested",
  "coordinator-close",
  "close-disposition-validated",
  "worker-pool-gone",
  "cleanup-allowed",
  "loopback-close",
  "environment-restore",
  "tool-temp-inventory",
  "tool-temp-cleanup",
  "run-root-cleanup",
  "final-reject",
] as const;

const UNSAFE_CLOSE_DEADLINE_ORDER = [
  "primary-failure",
  "termination-requested",
  "force-termination-requested",
  "worker-pool-gone",
  "settlement-unknown",
  "unsafe-cleanup-suppressed",
  "final-reject",
] as const;

describe("M2-C coordinator termination lifecycle", () => {
  it("validates forced SIGKILL close before allowing timeout cleanup", async () => {
    const diagnostic = await runFixedLifecycleScenarioForTest("timeout");
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(diagnostic.secondaryCodes).toEqual([]);
    expect(diagnostic.stages).toEqual(FORCED_TERMINATION_ORDER);
    expect(diagnostic.closeDispositionValidated).toBe(true);
    expect(diagnostic.processGroupGone).toBe(true);
    expect(diagnostic.cleanupComplete).toBe(true);
  });

  it("validates graceful SIGTERM close and force-clears the remaining worker group", async () => {
    const diagnostic = await runFixedLifecycleScenarioForTest("graceful-close");
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(diagnostic.secondaryCodes).toEqual([]);
    expect(diagnostic.stages).toEqual([
      "primary-failure",
      "termination-requested",
      "coordinator-close",
      "close-disposition-validated",
      "force-termination-requested",
      "worker-pool-gone",
      "cleanup-allowed",
      "loopback-close",
      "environment-restore",
      "tool-temp-inventory",
      "tool-temp-cleanup",
      "run-root-cleanup",
      "final-reject",
    ]);
  });

  it("keeps output-limit primary, discards raw output, and validates forced close", async () => {
    const diagnostic = await runFixedLifecycleScenarioForTest("output-limit");
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_OUTPUT_LIMIT");
    expect(diagnostic.secondaryCodes).toEqual([]);
    expect(diagnostic.stages).toEqual(FORCED_TERMINATION_ORDER);
    expect(diagnostic.closeDispositionValidated).toBe(true);
    expect(diagnostic.rawOutputPersisted).toBe(false);
  });

  it("preserves timeout and output-limit over cleanup failures", async () => {
    const timeout = await runFixedLifecycleScenarioForTest(
      "timeout-cleanup-failure",
    );
    expect(timeout.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(timeout.secondaryCodes).toEqual(["M2C_CLEANUP_FAILED"]);
    expect(timeout.stages).toEqual(FORCED_TERMINATION_ORDER);

    const output = await runFixedLifecycleScenarioForTest(
      "output-cleanup-failure",
    );
    expect(output.primaryCode).toBe("M2C_TOOL_OUTPUT_LIMIT");
    expect(output.secondaryCodes).toEqual(["M2C_CLEANUP_FAILED"]);
    expect(output.stages).toEqual(FORCED_TERMINATION_ORDER);
    expect(output.rawOutputPersisted).toBe(false);
  });

  it("keeps graceful and force signal failures secondary after settlement", async () => {
    const graceful = await runFixedLifecycleScenarioForTest(
      "graceful-signal-failure",
    );
    expect(graceful.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(graceful.secondaryCodes).toEqual([
      "M2C_GRACEFUL_TERMINATION_FAILED",
    ]);
    expect(graceful.closeDispositionValidated).toBe(true);
    expect(graceful.processGroupGone).toBe(true);
    expect(graceful.cleanupComplete).toBe(true);

    const force = await runFixedLifecycleScenarioForTest(
      "force-signal-failure",
    );
    expect(force.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(force.secondaryCodes).toEqual(["M2C_FORCE_TERMINATION_FAILED"]);
    expect(force.closeDispositionValidated).toBe(true);
    expect(force.processGroupGone).toBe(true);
    expect(force.cleanupComplete).toBe(true);
  });

  it("bounds a close deadline and suppresses unsafe cleanup", async () => {
    const diagnostic = await runFixedLifecycleScenarioForTest("close-deadline");
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(diagnostic.secondaryCodes).toEqual([
      "M2C_CLOSE_DEADLINE_EXCEEDED",
      "M2C_SETTLEMENT_UNKNOWN",
    ]);
    expect(diagnostic.stages).toEqual(UNSAFE_CLOSE_DEADLINE_ORDER);
    expect(diagnostic.closeDispositionValidated).toBe(false);
    expect(diagnostic.unsafeCleanupSuppressed).toBe(true);
    expect(diagnostic.runRootRetainedBeforeTestDisposal).toBe(true);
    expect(diagnostic.cleanupComplete).toBe(false);
  });

  it("rejects an unexpected close disposition even after the group is gone", async () => {
    const diagnostic = await runFixedLifecycleScenarioForTest(
      "unexpected-close-disposition",
    );
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(diagnostic.secondaryCodes).toEqual([
      "M2C_CLOSE_DISPOSITION_MISMATCH",
      "M2C_SETTLEMENT_UNKNOWN",
    ]);
    expect(diagnostic.stages).toEqual([
      "primary-failure",
      "termination-requested",
      "force-termination-requested",
      "coordinator-close",
      "worker-pool-gone",
      "settlement-unknown",
      "unsafe-cleanup-suppressed",
      "final-reject",
    ]);
    expect(diagnostic.processGroupGone).toBe(true);
    expect(diagnostic.cleanupComplete).toBe(false);
  });

  it("treats process residue as settlement unknown and suppresses cleanup", async () => {
    const diagnostic =
      await runFixedLifecycleScenarioForTest("process-residue");
    expect(diagnostic.primaryCode).toBe("M2C_TOOL_TIMEOUT");
    expect(diagnostic.secondaryCodes).toEqual([
      "M2C_PROCESS_RESIDUE",
      "M2C_SETTLEMENT_UNKNOWN",
    ]);
    expect(diagnostic.stages).toEqual([
      "primary-failure",
      "termination-requested",
      "force-termination-requested",
      "coordinator-close",
      "close-disposition-validated",
      "settlement-unknown",
      "unsafe-cleanup-suppressed",
      "final-reject",
    ]);
    expect(diagnostic.processGroupGone).toBe(false);
    expect(diagnostic.runRootRetainedBeforeTestDisposal).toBe(true);
    expect(diagnostic.cleanupComplete).toBe(false);
  });

  it("makes cleanup-only failure primary after a successful process lifecycle", async () => {
    const diagnostic =
      await runFixedLifecycleScenarioForTest("cleanup-failure");
    expect(diagnostic.primaryCode).toBe("M2C_CLEANUP_FAILED");
    expect(diagnostic.secondaryCodes).toEqual([]);
    expect(diagnostic.stages).toEqual([
      "coordinator-close",
      "close-disposition-validated",
      "worker-pool-gone",
      "cleanup-allowed",
      "loopback-close",
      "environment-restore",
      "tool-temp-inventory",
      "tool-temp-cleanup",
      "run-root-cleanup",
      "final-reject",
    ]);
  });
});
