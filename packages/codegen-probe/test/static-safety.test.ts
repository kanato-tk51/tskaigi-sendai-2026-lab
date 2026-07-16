import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("M2-E static verifier", () => {
  it("passes the repository-owned fixed contract verifier", async () => {
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
      "M2-E static contract verified (scoped inspection; not runtime sandbox proof)\n",
    );
    expect(result.stderr).toBe("");
  });
});
