import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

interface RootPackage {
  private?: unknown;
  scripts?: Record<string, string>;
  workspaces?: unknown;
}

interface ProbeCorePackage {
  name?: unknown;
  private?: unknown;
  type?: unknown;
  exports?: unknown;
}

const lifecycleScriptNames = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
] as const;

describe("repository scaffold", () => {
  it("keeps the private root workspace isolated from experiments", async () => {
    const contents = await readFile(
      new URL("../package.json", import.meta.url),
      "utf8",
    );
    const packageJson = JSON.parse(contents) as RootPackage;

    expect(packageJson.private).toBe(true);
    expect(packageJson.workspaces).toEqual(["packages/*"]);

    for (const scriptName of lifecycleScriptNames) {
      expect(packageJson.scripts?.[scriptName]).toBeUndefined();
    }
  });
});

describe("M1 probe-core workspace integration", () => {
  it("declares a private ESM package with build output exports", async () => {
    const contents = await readFile(
      new URL("../packages/probe-core/package.json", import.meta.url),
      "utf8",
    );
    const packageJson = JSON.parse(contents) as ProbeCorePackage;

    expect(packageJson).toMatchObject({
      name: "@tskaigi-lab/probe-core",
      private: true,
      type: "module",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
        },
      },
    });
  });
});
