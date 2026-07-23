import { assertExactKeys, readPlainRecord } from "./safe-data.js";

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

function snapshotState(input: unknown): OfflineBuildProcessState {
  try {
    const value = readPlainRecord(input, "INVALID_OFFLINE_BUILD_RESULT");
    assertExactKeys(
      value,
      ["firstFailure", "stdoutBytes", "stderrBytes"],
      "INVALID_OFFLINE_BUILD_RESULT",
    );
    if (
      (value.firstFailure !== null &&
        value.firstFailure !== "output-limit" &&
        value.firstFailure !== "process-error" &&
        value.firstFailure !== "timeout") ||
      typeof value.stdoutBytes !== "number" ||
      !Number.isSafeInteger(value.stdoutBytes) ||
      value.stdoutBytes < 0 ||
      typeof value.stderrBytes !== "number" ||
      !Number.isSafeInteger(value.stderrBytes) ||
      value.stderrBytes < 0
    ) {
      throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
    }
    return Object.freeze({
      firstFailure: value.firstFailure,
      stdoutBytes: value.stdoutBytes,
      stderrBytes: value.stderrBytes,
    }) as OfflineBuildProcessState;
  } catch {
    throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
  }
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
  const snapshot = snapshotState(state);
  if (
    failure !== "output-limit" &&
    failure !== "process-error" &&
    failure !== "timeout"
  ) {
    throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
  }
  return Object.freeze({
    firstFailure: snapshot.firstFailure ?? failure,
    stdoutBytes: snapshot.stdoutBytes,
    stderrBytes: snapshot.stderrBytes,
  });
}

export function observeOfflineBuildProcessOutput(
  state: OfflineBuildProcessState,
  stream: "stderr" | "stdout",
  byteLength: number,
  outputLimitBytes: number,
): OfflineBuildProcessState {
  const snapshot = snapshotState(state);
  if (stream !== "stdout" && stream !== "stderr") {
    throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
  }
  const stdoutBytes =
    stream === "stdout"
      ? boundedCount(snapshot.stdoutBytes, byteLength, outputLimitBytes)
      : snapshot.stdoutBytes;
  const stderrBytes =
    stream === "stderr"
      ? boundedCount(snapshot.stderrBytes, byteLength, outputLimitBytes)
      : snapshot.stderrBytes;
  return Object.freeze({
    firstFailure:
      snapshot.firstFailure ??
      (stdoutBytes + stderrBytes > outputLimitBytes ? "output-limit" : null),
    stdoutBytes,
    stderrBytes,
  });
}
