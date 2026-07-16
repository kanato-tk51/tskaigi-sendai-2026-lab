import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FIXED_ADAPTER_ROOT, FIXED_REPOSITORY_ROOT } from "../src/paths.js";

function resultRunEntries(): Promise<string[]> {
  return readdir(path.join(FIXED_REPOSITORY_ROOT, "results/runs"));
}

describe("package root import safety", () => {
  it("imports in a fresh process without probe, write, network, child, or Vite build side effects", async () => {
    const before = await resultRunEntries();
    const script = path.join(FIXED_ADAPTER_ROOT, "fixture/import-root.mjs");
    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, [script], {
        cwd: FIXED_ADAPTER_ROOT,
        env: {},
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      child.stdout.setEncoding("utf8").on("data", (value: string) => {
        stdout += value;
      });
      child.stderr.setEncoding("utf8").on("data", (value: string) => {
        stderr += value;
      });
      child.once("error", reject);
      child.once("close", (code, signal) => {
        if (code !== 0 || signal !== null || stderr !== "") {
          reject(new Error("fixed import fixture failed"));
          return;
        }
        resolve(stdout);
      });
    });
    expect(JSON.parse(output)).toEqual({
      exportedRunnerCount: 2,
      listenerDelta: 0,
    });
    expect(await resultRunEntries()).toEqual(before);
  });
});
