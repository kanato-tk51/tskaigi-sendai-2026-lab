import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const packageRoot = fileURLToPath(new URL("../", import.meta.url));

describe("M3 static safety", () => {
  it("passes the fixed package/dependency/data-boundary verifier", async () => {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [path.join(packageRoot, "scripts/verify-static.mjs")],
      {
        cwd: packageRoot,
        encoding: "utf8",
        env: {},
        shell: false,
        timeout: 10_000,
        maxBuffer: 64 * 1024,
      },
    );
    expect(stderr).toBe("");
    expect(stdout).toContain("M3 static contract verified");
  });
});
