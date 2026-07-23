import { Buffer as ConstructorBuffer } from "node:buffer";
import { spawn as constructorSpawn } from "node:child_process";
import { createHash as constructorCreateHash } from "node:crypto";
import { constants as constructorFsConstants } from "node:fs";
import { open as constructorOpen } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as constructorSetTimeout } from "node:timers";
import { pathToFileURL } from "node:url";
import { promisify as constructorPromisify } from "node:util";
import { gunzip as constructorGunzip } from "node:zlib";

import { runFixedToolchainCaptureEntry } from "./m2a-transfer-inputs.mjs";

// These fixed imports intentionally mirror the reviewed constructor's built-in
// closure before process.report is captured. Referencing them prevents a
// bundler or source transform from treating the imports as accidental.
const CONSTRUCTOR_BUILT_INS = Object.freeze([
  ConstructorBuffer,
  constructorSpawn,
  constructorCreateHash,
  constructorFsConstants,
  constructorOpen,
  path,
  constructorSetTimeout,
  pathToFileURL,
  constructorPromisify,
  constructorGunzip,
]);

export async function main() {
  const environmentDescriptors = Object.getOwnPropertyDescriptors(process.env);
  if (
    process.argv.length !== 2 ||
    Reflect.ownKeys(environmentDescriptors).length !== 0 ||
    CONSTRUCTOR_BUILT_INS.length !== 10
  ) {
    throw new Error("M2A_TOOLCHAIN_AUTHORITY_REJECTED");
  }
  await runFixedToolchainCaptureEntry();
  process.stdout.write("M2A_TOOLCHAIN_CAPTURE_COMPLETE\n");
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch(() => {
    process.stderr.write("M2A_TOOLCHAIN_CAPTURE_FAILED\n");
    process.exitCode = 1;
  });
}
