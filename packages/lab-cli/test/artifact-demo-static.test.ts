import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe("P3 artifact demo static boundary", () => {
  it("keeps the production command argument-free and separate from verification", async () => {
    const packageJson = JSON.parse(
      await readFile(join(repositoryRoot, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(packageJson.scripts).toMatchObject({
      "p3:build": "npm run m3:build",
      "p3:typecheck": "tsc --project packages/lab-cli/tsconfig.json --noEmit",
      "p3:test":
        "npm run test --workspace packages/lab-cli -- test/artifact-demo.test.ts test/artifact-demo-static.test.ts",
      "p3:verify":
        "npm run p3:typecheck && npm run p3:build && npm run p3:test",
      "p3:execute":
        "npm run p3:build && node packages/lab-cli/dist/artifact-demo-entry.js",
    });
  });

  it("keeps network and arbitrary command APIs out of the build/verify implementation", async () => {
    const implementation = await readFile(
      join(repositoryRoot, "packages/lab-cli/src/artifact-demo.ts"),
      "utf8",
    );
    const processBoundary = await readFile(
      join(repositoryRoot, "packages/lab-cli/src/artifact-demo-process.ts"),
      "utf8",
    );
    const m3StaticVerifier = await readFile(
      join(repositoryRoot, "packages/lab-cli/scripts/verify-static.mjs"),
      "utf8",
    );
    for (const prohibitedImport of [
      "node:http",
      "node:https",
      "node:net",
      "node:tls",
      "node:dgram",
      "node:dns",
      "node:worker_threads",
    ]) {
      expect(implementation).not.toContain(prohibitedImport);
      expect(processBoundary).not.toContain(prohibitedImport);
    }
    expect(implementation).not.toContain("child_process");
    expect(processBoundary.match(/execFile\(/gu)).toHaveLength(1);
    expect(processBoundary).not.toContain("shell:");
    expect(m3StaticVerifier).toContain('!name.startsWith("artifact-demo")');
  });
});
