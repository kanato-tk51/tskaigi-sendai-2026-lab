import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

const execFileAsync = promisify(execFile);

it("passes the TypeScript AST/module graph static verifier", async () => {
  const packageRoot = fileURLToPath(new URL("../", import.meta.url));
  const scriptPath = fileURLToPath(
    new URL("../scripts/verify-static.mjs", import.meta.url),
  );
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [scriptPath],
    {
      cwd: packageRoot,
      timeout: 10_000,
      maxBuffer: 64 * 1024,
      env: {},
      shell: false,
    },
  );
  expect(stderr).toBe("");
  expect(stdout).toContain("M2-C Vitest static verification passed");
});
