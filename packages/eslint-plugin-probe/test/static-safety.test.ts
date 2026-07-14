import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("adapter static safety verifier", () => {
  it("passes the fixed repository-owned verifier", async () => {
    const script = fileURLToPath(
      new URL("../scripts/verify-static.mjs", import.meta.url),
    );
    const result = await execFileAsync(process.execPath, [script], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: {},
      shell: false,
      encoding: "utf8",
    });
    expect(JSON.parse(result.stdout)).toEqual({
      status: "success",
      verifier: "m2-b-eslint-static",
    });
    expect(result.stderr).toBe("");
  });
});
