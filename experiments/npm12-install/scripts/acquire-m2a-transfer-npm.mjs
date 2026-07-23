import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { runFixedNpmAcquisitionEntry } from "./m2a-transfer-inputs.mjs";

export async function main() {
  const entryPath = fileURLToPath(import.meta.url);
  const expectedRepositoryRoot = path.resolve(
    path.dirname(entryPath),
    "../../..",
  );
  const environmentDescriptors = Object.getOwnPropertyDescriptors(process.env);
  if (
    process.execPath !== "/usr/bin/node" ||
    process.argv0 !== "/usr/bin/node" ||
    process.argv.length !== 2 ||
    process.argv[0] !== "/usr/bin/node" ||
    process.argv[1] !== entryPath ||
    process.cwd() !== expectedRepositoryRoot ||
    Reflect.ownKeys(environmentDescriptors).length !== 0
  ) {
    throw new Error("M2A_INPUT_AUTHORITY_REJECTED");
  }
  await runFixedNpmAcquisitionEntry();
  process.stdout.write("M2A_INPUT_ACQUISITION_COMPLETE\n");
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch(() => {
    process.stderr.write("M2A_INPUT_ACQUISITION_FAILED\n");
    process.exitCode = 1;
  });
}
