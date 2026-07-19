import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * @typedef {Readonly<{
 *   scenarioId: string,
 *   profileId: string,
 *   projection: Readonly<{validity: string}>,
 * }>} EntryReceipt
 * @typedef {Readonly<{
 *   projection: Readonly<{
 *     validity: "same-image" | "inconclusive",
 *     imageId: string | null,
 *     issues: readonly string[],
 *   }>,
 *   receipts: readonly EntryReceipt[],
 * }>} EntryPair
 */

export async function executeFixedCodegenEntry() {
  if (process.argv.length !== 2) {
    throw new Error("P2_EXECUTOR_ARGUMENTS_INVALID");
  }
  const executorModulePath = "../dist/codegen-executor.js";
  const { executeFixedCodegenProfiles } = /** @type {Readonly<{
    executeFixedCodegenProfiles(): Promise<EntryPair>
  }>} */ (await import(executorModulePath));
  const pair = await executeFixedCodegenProfiles();
  process.stdout.write(
    `${JSON.stringify({
      status:
        pair.projection.validity === "same-image"
          ? "completed"
          : "inconclusive",
      pair: pair.projection,
      scenarios: pair.receipts.map((receipt) => ({
        scenarioId: receipt.scenarioId,
        profileId: receipt.profileId,
        validity: receipt.projection.validity,
      })),
    })}\n`,
  );
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    await executeFixedCodegenEntry();
  } catch {
    process.stderr.write('{"status":"failure","code":"P2_EXECUTOR_FAILED"}\n');
    process.exitCode = 1;
  }
}
