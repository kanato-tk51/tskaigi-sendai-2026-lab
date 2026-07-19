import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * @typedef {Readonly<{
 *   projection: Readonly<{validity: "same-image" | "inconclusive"}>,
 *   receipts: readonly unknown[],
 *   outcomes: readonly unknown[],
 * }>} EntryPair
 * @typedef {Readonly<{
 *   status: "completed" | "failure" | "inconclusive",
 *   pair: Readonly<Record<string, unknown>>,
 *   scenarios: readonly Readonly<Record<string, unknown>>[],
 * }>} EntryProjection
 */

/** @returns {Promise<0 | 1>} */
export async function executeFixedViteEntry() {
  if (process.argv.length !== 2) {
    throw new Error("P2_EXECUTOR_ARGUMENTS_INVALID");
  }
  const executorModulePath = "../dist/vite-executor.js";
  const { executeFixedViteProfiles, projectFixedViteEntryResult } =
    /** @type {Readonly<{
    executeFixedViteProfiles(): Promise<EntryPair>,
    projectFixedViteEntryResult(pair: EntryPair): EntryProjection,
  }>} */ (await import(executorModulePath));
  const pair = await executeFixedViteProfiles();
  const result = projectFixedViteEntryResult(pair);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  return result.status === "completed" ? 0 : 1;
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    process.exitCode = await executeFixedViteEntry();
  } catch {
    process.stderr.write('{"status":"failure","code":"P2_EXECUTOR_FAILED"}\n');
    process.exitCode = 1;
  }
}
