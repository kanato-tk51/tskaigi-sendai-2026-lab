import { describe, expect, it } from "vitest";

import {
  createOfflineBuildProcessState,
  observeOfflineBuildProcessFailure,
  observeOfflineBuildProcessOutput,
} from "../src/offline-build-process.js";

const OUTPUT_LIMIT = 65_536;

describe("offline-build process first-failure state", () => {
  it("preserves timeout before late output overflow", () => {
    let state = createOfflineBuildProcessState();
    state = observeOfflineBuildProcessFailure(state, "timeout");
    state = observeOfflineBuildProcessOutput(
      state,
      "stdout",
      OUTPUT_LIMIT + 1,
      OUTPUT_LIMIT,
    );
    expect(state).toEqual({
      firstFailure: "timeout",
      stdoutBytes: OUTPUT_LIMIT + 1,
      stderrBytes: 0,
    });
  });

  it("preserves output overflow before a later timeout", () => {
    let state = createOfflineBuildProcessState();
    state = observeOfflineBuildProcessOutput(
      state,
      "stderr",
      OUTPUT_LIMIT + 1,
      OUTPUT_LIMIT,
    );
    state = observeOfflineBuildProcessFailure(state, "timeout");
    expect(state.firstFailure).toBe("output-limit");
  });

  it("preserves process error before late output and bounds the count", () => {
    let state = createOfflineBuildProcessState();
    state = observeOfflineBuildProcessFailure(state, "process-error");
    state = observeOfflineBuildProcessOutput(
      state,
      "stdout",
      OUTPUT_LIMIT * 4,
      OUTPUT_LIMIT,
    );
    expect(state).toEqual({
      firstFailure: "process-error",
      stdoutBytes: OUTPUT_LIMIT + 1,
      stderrBytes: 0,
    });
  });
});
