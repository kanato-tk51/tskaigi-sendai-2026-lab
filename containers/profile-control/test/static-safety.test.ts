import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const controlRoot = fileURLToPath(new URL("../", import.meta.url));

describe("M4 static safety", () => {
  it("passes the fixed source/fixture/profile/orchestrator verifier", async () => {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [path.join(controlRoot, "scripts/verify-static.mjs")],
      {
        cwd: controlRoot,
        encoding: "utf8",
        env: {},
        shell: false,
        timeout: 10_000,
        maxBuffer: 64 * 1024,
      },
    );
    expect(stderr).toBe("");
    expect(stdout).toContain("M4 static contract verified");
    expect(stdout).toContain("activation wrapper constructed but not invoked");
  });
});
