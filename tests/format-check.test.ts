import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { checkFormat, listFormatInputs } from "../scripts/check-format.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function runGit(cwd: string, args: string[]): void {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error !== undefined) {
    throw result.error;
  }
  expect(result.status, result.stderr).toBe(0);
}

describe("format input discovery", () => {
  it("does not traverse an ignored unreadable directory", async () => {
    const temporaryParent = join(repositoryRoot, ".tmp");
    await mkdir(temporaryParent, { recursive: true });
    const fixtureRoot = await mkdtemp(join(temporaryParent, "format-check-"));
    const ignoredDirectory = join(fixtureRoot, "ignored-run", "tool", "canary");

    try {
      await mkdir(ignoredDirectory, { recursive: true });
      await writeFile(
        join(fixtureRoot, ".gitignore"),
        "ignored-run/\n",
        "utf8",
      );
      await writeFile(
        join(fixtureRoot, "tracked.ts"),
        "const tracked = true;\n",
        "utf8",
      );
      await writeFile(
        join(fixtureRoot, "untracked.md"),
        "# Untracked\n",
        "utf8",
      );
      await writeFile(
        join(ignoredDirectory, "secret.txt"),
        "not an input\n",
        "utf8",
      );

      runGit(fixtureRoot, ["init", "--quiet"]);
      runGit(fixtureRoot, ["add", ".gitignore", "tracked.ts"]);
      await chmod(ignoredDirectory, 0o000);

      expect(listFormatInputs({ cwd: fixtureRoot }).sort()).toEqual([
        ".gitignore",
        "tracked.ts",
        "untracked.md",
      ]);
      expect(checkFormat({ cwd: fixtureRoot, stdio: "pipe" })).toBe(0);
    } finally {
      await chmod(ignoredDirectory, 0o700).catch(() => undefined);
      await rm(fixtureRoot, { force: true, recursive: true });
    }
  });
});
