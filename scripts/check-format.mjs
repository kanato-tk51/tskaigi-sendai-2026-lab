import { spawnSync } from "node:child_process";
import { lstatSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const prettierCli = require.resolve("prettier/bin/prettier.cjs");

/**
 * @param {{ cwd?: string }} [options]
 * @returns {string[]}
 */
export function listFormatInputs({ cwd = repositoryRoot } = {}) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    },
  );

  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `git ls-files failed with exit ${String(result.status)}: ${result.stderr.trim()}`,
    );
  }

  return result.stdout
    .split("\0")
    .filter((path) => path.length > 0)
    .filter((path) => {
      try {
        return lstatSync(resolve(cwd, path)).isFile();
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return false;
        }
        throw error;
      }
    });
}

/**
 * @param {{ cwd?: string, stdio?: "inherit" | "pipe" }} [options]
 * @returns {number}
 */
export function checkFormat({ cwd = repositoryRoot, stdio = "inherit" } = {}) {
  const inputs = listFormatInputs({ cwd });
  const result = spawnSync(
    process.execPath,
    [prettierCli, "--check", "--ignore-unknown", "--", ...inputs],
    {
      cwd,
      stdio,
    },
  );

  if (result.error !== undefined) {
    throw result.error;
  }
  return result.status ?? 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = checkFormat();
}
