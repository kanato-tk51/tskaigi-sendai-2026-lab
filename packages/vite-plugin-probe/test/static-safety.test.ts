import { spawn } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FIXED_ADAPTER_ROOT } from "../src/paths.js";

describe("M2-D static verifier", () => {
  it("passes the fixed package/config/route/data/scope contract", async () => {
    const script = path.join(FIXED_ADAPTER_ROOT, "scripts/verify-static.mjs");
    const result = await new Promise<{
      readonly code: number | null;
      readonly signal: NodeJS.Signals | null;
      readonly stdout: string;
      readonly stderr: string;
    }>((resolve, reject) => {
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
      child.once("close", (code, signal) =>
        resolve({ code, signal, stdout, stderr }),
      );
    });
    expect(result).toEqual({
      code: 0,
      signal: null,
      stdout:
        "M2-D static contract verified (scoped inspection; not runtime sandbox proof)\n",
      stderr: "",
    });
  });
});
