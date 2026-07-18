export type OfflineBuildProcessFailure =
  "output-limit" | "process-error" | "timeout";

export interface OfflineBuildProcessState {
  readonly firstFailure: OfflineBuildProcessFailure | null;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
}

function boundedCount(current: number, added: number, limit: number): number {
  if (
    !Number.isSafeInteger(current) ||
    current < 0 ||
    !Number.isSafeInteger(added) ||
    added < 0 ||
    !Number.isSafeInteger(limit) ||
    limit < 0
  ) {
    throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
  }
  return Math.min(current + added, limit + 1);
}

export function createOfflineBuildProcessState(): OfflineBuildProcessState {
  return Object.freeze({
    firstFailure: null,
    stdoutBytes: 0,
    stderrBytes: 0,
  });
}

export function observeOfflineBuildProcessFailure(
  state: OfflineBuildProcessState,
  failure: OfflineBuildProcessFailure,
): OfflineBuildProcessState {
  return Object.freeze({
    firstFailure: state.firstFailure ?? failure,
    stdoutBytes: state.stdoutBytes,
    stderrBytes: state.stderrBytes,
  });
}

export function observeOfflineBuildProcessOutput(
  state: OfflineBuildProcessState,
  stream: "stderr" | "stdout",
  byteLength: number,
  outputLimitBytes: number,
): OfflineBuildProcessState {
  const stdoutBytes =
    stream === "stdout"
      ? boundedCount(state.stdoutBytes, byteLength, outputLimitBytes)
      : state.stdoutBytes;
  const stderrBytes =
    stream === "stderr"
      ? boundedCount(state.stderrBytes, byteLength, outputLimitBytes)
      : state.stderrBytes;
  return Object.freeze({
    firstFailure:
      state.firstFailure ??
      (stdoutBytes + stderrBytes > outputLimitBytes ? "output-limit" : null),
    stdoutBytes,
    stderrBytes,
  });
}
