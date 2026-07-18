import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

import type { FixedChildTarget } from "../types.js";
import type { AttemptExecutionResult } from "./types.js";

const FIXED_CHILD_RESPONSE = '{"probeChild":"ok"}\n';

export function executeFixedChildAttempt(
  target: FixedChildTarget,
  trustedRuntime: {
    readonly nodeExecutable: string;
    readonly fixedChildScriptPath: string;
  },
): Promise<AttemptExecutionResult> {
  return new Promise((resolve) => {
    let child: ChildProcessByStdio<null, Readable, Readable>;
    try {
      child = spawn(
        trustedRuntime.nodeExecutable,
        [trustedRuntime.fixedChildScriptPath],
        {
          shell: false,
          env: {},
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        },
      );
    } catch {
      resolve({
        outcome: "failure",
        normalizedErrorCode: "CHILD_PROCESS_FAILURE",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: null,
          timedOut: false,
          responseVerified: false,
          stdoutBytes: 0,
          stderrBytes: 0,
        },
      });
      return;
    }
    const stdoutChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let timedOut = false;
    let completed = false;
    let failureCode: AttemptExecutionResult["normalizedErrorCode"] = null;

    const timer = setTimeout(() => {
      timedOut = true;
      failureCode = "CHILD_PROCESS_TIMEOUT";
      child.kill("SIGKILL");
    }, target.timeoutMs);

    const finish = (exitCode: number | null): void => {
      if (completed) {
        return;
      }
      completed = true;
      clearTimeout(timer);
      const responseVerified =
        failureCode === null &&
        exitCode === 0 &&
        stderrBytes === 0 &&
        Buffer.concat(stdoutChunks).toString("utf8") === FIXED_CHILD_RESPONSE;
      const normalizedErrorCode = responseVerified
        ? null
        : (failureCode ?? "CHILD_PROCESS_FAILURE");
      resolve({
        outcome: responseVerified ? "success" : "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode,
          timedOut,
          responseVerified,
          stdoutBytes,
          stderrBytes,
        },
      });
    };

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.byteLength;
      if (stdoutBytes + stderrBytes > target.maxOutputBytes) {
        failureCode = "CHILD_OUTPUT_TOO_LARGE";
        child.kill("SIGKILL");
        return;
      }
      stdoutChunks.push(Buffer.from(chunk));
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.byteLength;
      if (stdoutBytes + stderrBytes > target.maxOutputBytes) {
        failureCode = "CHILD_OUTPUT_TOO_LARGE";
        child.kill("SIGKILL");
      }
    });
    child.on("error", () => {
      failureCode = "CHILD_PROCESS_FAILURE";
      finish(null);
    });
    child.on("close", (exitCode) => {
      finish(exitCode);
    });
  });
}
