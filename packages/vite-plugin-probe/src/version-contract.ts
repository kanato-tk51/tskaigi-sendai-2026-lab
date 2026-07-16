import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { version as viteVersion } from "vite";

import {
  ESBUILD_VERSION,
  NODE_VERSION,
  ROLLUP_VERSION,
  VITE_VERSION,
} from "./constants.js";
import { AdapterError } from "./errors.js";

export interface VersionContract {
  readonly nodeVersion: typeof NODE_VERSION;
  readonly viteVersion: typeof VITE_VERSION;
  readonly rollupVersion: typeof ROLLUP_VERSION;
  readonly esbuildVersion: typeof ESBUILD_VERSION;
  readonly viteCliPath: string;
}

const require = createRequire(import.meta.url);

export function assertFixedVersionValues(
  nodeVersion: string,
  actualViteVersion: string,
  rollupVersion: string,
  esbuildVersion: string,
): void {
  if (
    nodeVersion !== NODE_VERSION ||
    actualViteVersion !== VITE_VERSION ||
    rollupVersion !== ROLLUP_VERSION ||
    esbuildVersion !== ESBUILD_VERSION
  ) {
    throw new AdapterError("M2D_VERSION_MISMATCH");
  }
}

async function packageVersion(packageName: "rollup" | "esbuild") {
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      await readFile(require.resolve(`${packageName}/package.json`), "utf8"),
    );
  } catch {
    throw new AdapterError("M2D_VERSION_MISMATCH");
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    typeof (parsed as { version?: unknown }).version !== "string"
  ) {
    throw new AdapterError("M2D_VERSION_MISMATCH");
  }
  return (parsed as { version: string }).version;
}

export async function validateFixedVersions(): Promise<VersionContract> {
  const rollupVersion = await packageVersion("rollup");
  const esbuildVersion = await packageVersion("esbuild");
  let viteCliPath: string;
  try {
    viteCliPath = path.join(
      path.dirname(require.resolve("vite/package.json")),
      "bin/vite.js",
    );
  } catch {
    throw new AdapterError("M2D_VERSION_MISMATCH");
  }
  const packageRoot = path.resolve(
    fileURLToPath(new URL("../", import.meta.url)),
  );
  assertFixedVersionValues(
    process.version,
    viteVersion,
    rollupVersion,
    esbuildVersion,
  );
  if (
    !path.isAbsolute(viteCliPath) ||
    !packageRoot.endsWith(`${path.sep}vite-plugin-probe`)
  ) {
    throw new AdapterError("M2D_VERSION_MISMATCH");
  }
  return Object.freeze({
    nodeVersion: NODE_VERSION,
    viteVersion: VITE_VERSION,
    rollupVersion: ROLLUP_VERSION,
    esbuildVersion: ESBUILD_VERSION,
    viteCliPath,
  });
}
