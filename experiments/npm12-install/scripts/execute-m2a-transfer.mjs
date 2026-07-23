import process from "node:process";
import { pathToFileURL } from "node:url";

import { runFixedM2aExecutionEntry } from "./m2a-transfer-production.mjs";

function assertFixedInvocation() {
  const environmentDescriptors = Object.getOwnPropertyDescriptors(process.env);
  if (
    process.argv.length !== 2 ||
    Reflect.ownKeys(environmentDescriptors).length !== 0
  ) {
    throw new Error("M2A_RUNTIME_INVOCATION_INVALID");
  }
}

async function main() {
  assertFixedInvocation();
  await runFixedM2aExecutionEntry();
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
        : "M2A_RUNTIME_EXECUTION_FAILED";
    process.stderr.write(`${code}\n`);
    process.exitCode = 1;
  }
}
