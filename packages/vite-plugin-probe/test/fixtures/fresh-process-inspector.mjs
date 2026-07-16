import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { lstat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const adapterRoot = path.resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const runnerPath = path.join(
  adapterRoot,
  "test/fixtures/failure-projection-runner.mjs",
);
const fixedResultPath = path.join(
  adapterRoot,
  "results/runs/m2-d-vite/fresh-process-projection",
);
const poisonedEventId = "r01-fresh-process-poisoned-sentinel";

if (process.argv.length !== 2) {
  process.exitCode = 2;
} else {
  const child = spawn(process.execPath, [runnerPath], {
    cwd: adapterRoot,
    env: {},
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout = [];
  const stderr = [];
  child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
  child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
  const close = await new Promise((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
    child.once("error", () => resolve({ code: null, signal: null }));
  });
  const stdoutBytes = Buffer.concat(stdout);
  const stderrBytes = Buffer.concat(stderr);
  let projection = null;
  try {
    projection = JSON.parse(stderrBytes.toString("utf8"));
  } catch {
    projection = null;
  }
  let resultArtifactCreated = false;
  try {
    await lstat(fixedResultPath);
    resultArtifactCreated = true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      resultArtifactCreated = true;
    }
  }
  const sentinelFound =
    stdoutBytes.includes(poisonedEventId) ||
    stderrBytes.includes(poisonedEventId);
  const passed =
    close.code === 1 &&
    close.signal === null &&
    stdoutBytes.byteLength === 0 &&
    !sentinelFound &&
    !resultArtifactCreated &&
    projection?.status === "failure" &&
    projection?.code === "M2D_TOOL_COMMAND_FAILED" &&
    projection?.trustedEventCount === null &&
    projection?.lastEventId === null &&
    Array.isArray(projection?.secondaryCodes) &&
    projection.secondaryCodes.length === 1 &&
    projection.secondaryCodes[0] === "M2D_SEGMENT_INVALID";
  process.stdout.write(
    `${JSON.stringify({
      status: passed ? "success" : "failure",
      childExitCode: close.code,
      childSignal: close.signal,
      childStdoutBytes: stdoutBytes.byteLength,
      childStderrBytes: stderrBytes.byteLength,
      sentinelFound,
      resultArtifactCreated,
      projectedCode:
        projection?.code === "M2D_TOOL_COMMAND_FAILED"
          ? "M2D_TOOL_COMMAND_FAILED"
          : null,
      trustedEventCount: projection?.trustedEventCount ?? null,
      lastEventId: projection?.lastEventId ?? null,
    })}\n`,
  );
  process.exitCode = passed ? 0 : 1;
}
