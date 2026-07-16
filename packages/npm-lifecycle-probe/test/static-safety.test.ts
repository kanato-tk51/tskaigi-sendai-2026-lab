import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("M2-A static verifier", () => {
  it("passes the fixed container-only contract verifier", async () => {
    const script = fileURLToPath(
      new URL("../scripts/verify-static.mjs", import.meta.url),
    );
    const result = await execFileAsync(process.execPath, [script], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: {},
      shell: false,
      encoding: "utf8",
    });
    expect(result.stdout).toBe(
      "M2-A static contract verified (container execution and evidence transfer not run)\n",
    );
    expect(result.stderr).toBe("");
  });
});
