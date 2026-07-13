import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

interface RootPackage {
  private?: unknown;
  scripts?: Record<string, string>;
  workspaces?: unknown;
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
