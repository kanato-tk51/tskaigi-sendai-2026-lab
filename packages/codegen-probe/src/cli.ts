import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ATTEMPT_IDS,
  GENERATED_ARTIFACT_CONTENT,
  INPUT_CONTENT,
  ROUTE_IDS,
  TOOL_API_CHANGE_ID,
  VARIANTS,
} from "./constants.js";
import { errorCode, AdapterError } from "./errors.js";
import { generateDocumentedArtifact } from "./generator.js";
import { hashBytes } from "./hash.js";
import type { ScenarioVariant } from "./constants.js";
import { createCliRuntime, type CliRuntime } from "./cli-runtime.js";

function parseFixedArguments(): ScenarioVariant {
  if (process.argv.length !== 3) {
    throw new AdapterError("M2E_ARGUMENTS_INVALID");
  }
  const variant = process.argv[2];
  if (!VARIANTS.includes(variant as ScenarioVariant)) {
    throw new AdapterError("M2E_ARGUMENTS_INVALID");
  }
  return variant as ScenarioVariant;
}

async function runCli(runtime: CliRuntime): Promise<void> {
  const variant = parseFixedArguments();
  if (variant !== runtime.inputs.variant) {
    throw new AdapterError("M2E_ARGUMENTS_INVALID");
  }
  await runtime.session.recordRouteInvocation(ROUTE_IDS.argumentParse, {
    outcome: "success",
  });
  await runtime.session.recordRouteInvocation(ROUTE_IDS.generationStart, {
    outcome: "success",
  });

  for (const attemptId of [
    ATTEMPT_IDS.environment,
    ATTEMPT_IDS.fileRead,
    ATTEMPT_IDS.fileHash,
    ATTEMPT_IDS.fileWrite,
    ATTEMPT_IDS.loopback,
    ATTEMPT_IDS.child,
  ]) {
    await runtime.session.runAttempt(attemptId);
  }

  if (variant === "api") {
    const input = await readFile(runtime.inputPath, "utf8");
    if (input !== INPUT_CONTENT) {
      throw new AdapterError("M2E_OUTPUT_INVALID");
    }
    const artifact = generateDocumentedArtifact(input);
    await runtime.session.recordToolApiChange(TOOL_API_CHANGE_ID, {
      outcome: "success",
      changed: true,
      beforeHash: null,
      afterHash: hashBytes(artifact.bytes),
      byteSizeBefore: null,
      byteSizeAfter: artifact.bytes.byteLength,
    });
    await mkdir(path.dirname(runtime.outputPath), { recursive: true });
    await writeFile(runtime.outputPath, artifact.bytes, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } else {
    await runtime.session.recordToolApiChange(TOOL_API_CHANGE_ID, {
      outcome: "skipped",
      changed: false,
      beforeHash: null,
      afterHash: null,
      byteSizeBefore: null,
      byteSizeAfter: null,
    });
  }

  await runtime.session.recordRouteInvocation(ROUTE_IDS.fileWrite, {
    outcome: variant === "dry-run" ? "skipped" : "success",
  });
  await runtime.session.recordRouteInvocation(ROUTE_IDS.completion, {
    outcome: "success",
  });
  await runtime.session.close();
  if (variant === "api" && GENERATED_ARTIFACT_CONTENT.length === 0) {
    throw new AdapterError("M2E_OUTPUT_INVALID");
  }
}

export async function executeFixedCli(): Promise<void> {
  let runtime: CliRuntime | undefined;
  try {
    runtime = await createCliRuntime();
    await runtime.session.recordRouteInvocation(ROUTE_IDS.startup, {
      outcome: "success",
    });
    await runCli(runtime);
  } catch (error) {
    await runtime?.session.close().catch(() => undefined);
    throw error;
  }
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(invokedPath)).href
) {
  try {
    await executeFixedCli();
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ status: "failure", code: errorCode(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
