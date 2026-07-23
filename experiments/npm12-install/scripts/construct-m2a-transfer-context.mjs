import process from "node:process";
import { pathToFileURL } from "node:url";

import { runFixedM2aConstructionEntry } from "./m2a-transfer-construction.mjs";

function assertFixedInvocation() {
  const environmentDescriptors = Object.getOwnPropertyDescriptors(process.env);
  if (
    process.argv.length !== 2 ||
    Reflect.ownKeys(environmentDescriptors).length !== 0
  ) {
    throw new Error("M2A_CONSTRUCTION_INVOCATION_INVALID");
  }
}

async function main() {
  assertFixedInvocation();
  await runFixedM2aConstructionEntry();
}

if (
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main();
  } catch (error) {
    const code =
      error instanceof Error && /^M2A_[A-Z0-9_]+$/u.test(error.message)
        ? error.message
        : "M2A_CONSTRUCTION_FAILED";
    process.stderr.write(`${code}\n`);
    process.exitCode = 1;
  }
}
