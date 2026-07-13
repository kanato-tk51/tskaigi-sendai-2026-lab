import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  projectInspectionPolicy,
  readJsonIfPresent,
  resolveResultPath,
  sanitizeText,
  sanitizeValue,
  SCENARIO_IDS,
  writeJson,
} from "./lib.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return false;
    throw error;
  }
}

async function copySanitizedText(source, destination, options) {
  if (!(await exists(source))) return false;
  const raw = await readFile(source, "utf8");
  const limited = raw.slice(0, 8192);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, sanitizeText(limited, options), "utf8");
  return true;
}

export async function sanitizeRun(repositoryRoot, runId) {
  const rawRoot = resolveResultPath(repositoryRoot, runId);
  const exampleRoot = path.join(repositoryRoot, "results/examples/m0-npm12");
  const options = { repositoryRoot, runId };
  const summary = await readJsonIfPresent(path.join(rawRoot, "summary.json"));
  const commands = await readJsonIfPresent(path.join(rawRoot, "commands.json"));
  const metadata = await readJsonIfPresent(path.join(rawRoot, "metadata.json"));
  if (!summary || !commands || !metadata) {
    throw new Error("M0 raw run is missing summary, commands, or metadata");
  }

  await rm(exampleRoot, { recursive: true, force: true });
  await mkdir(exampleRoot, { recursive: true });
  const sanitizedSummary = sanitizeValue(summary, options);
  await writeJson(path.join(exampleRoot, "summary.json"), sanitizedSummary);
  await writeJson(
    path.join(exampleRoot, "commands.json"),
    sanitizeValue(commands, options),
  );
  await writeJson(
    path.join(exampleRoot, "toolchain.json"),
    sanitizeValue(
      {
        runId,
        toolchain: summary.toolchain,
        imageDigest: summary.toolchain?.imageDigest ?? "unavailable",
        preparationNetwork: metadata.preparationNetwork,
        scenarioRuntimeNetwork: metadata.scenarioRuntimeNetwork,
      },
      options,
    ),
  );

  const officialResult = await readJsonIfPresent(
    path.join(rawRoot, "official/result.json"),
  );
  if (officialResult) {
    await writeJson(
      path.join(exampleRoot, "official/result.json"),
      sanitizeValue(officialResult, options),
    );
    for (const filename of [
      "approve-scripts-help.stdout.log",
      "approve-scripts-help.stderr.log",
      "help-approve-scripts.stdout.log",
      "help-approve-scripts.stderr.log",
    ]) {
      await copySanitizedText(
        path.join(rawRoot, "official", filename),
        path.join(exampleRoot, "official", filename),
        options,
      );
    }
  }

  for (const scenarioId of SCENARIO_IDS) {
    const rawScenario = path.join(rawRoot, "scenarios", scenarioId);
    const exampleScenario = path.join(exampleRoot, "scenarios", scenarioId);
    const result = await readJsonIfPresent(
      path.join(rawScenario, "result.json"),
    );
    if (!result) continue;
    await writeJson(
      path.join(exampleScenario, "result.json"),
      sanitizeValue(result, options),
    );
    await writeJson(
      path.join(exampleScenario, "allow-scripts.json"),
      sanitizeValue(
        {
          before: result.approvalEntryBefore ?? null,
          after: result.approvalEntryAfter ?? null,
          changed: result.approvalChanged ?? false,
        },
        options,
      ),
    );
    await copySanitizedText(
      path.join(rawScenario, "stdout.log"),
      path.join(exampleScenario, "stdout.log"),
      options,
    );
    await copySanitizedText(
      path.join(rawScenario, "stderr.log"),
      path.join(exampleScenario, "stderr.log"),
      options,
    );
    const inspection = await readJsonIfPresent(
      path.join(rawScenario, "container-inspect.json"),
    );
    if (inspection) {
      await writeJson(
        path.join(exampleScenario, "container-policy.json"),
        projectInspectionPolicy(inspection),
      );
    }
  }

  await writeJson(path.join(exampleRoot, "sanitization.json"), {
    schemaVersion: 1,
    sourceRunId: "<run-id>",
    transformations: [
      "repository absolute path replaced",
      "host home and temporary paths normalized",
      "container IDs removed",
      "ANSI sequences removed",
      "npm cache path normalized",
      "logs truncated to the first 8192 characters",
      "raw package and lockfile snapshots omitted",
    ],
  });

  const generatedFiles = [
    path.join(exampleRoot, "summary.json"),
    path.join(exampleRoot, "commands.json"),
    path.join(exampleRoot, "toolchain.json"),
  ];
  for (const generatedFile of generatedFiles) {
    const contents = await readFile(generatedFile, "utf8");
    if (
      contents.includes(repositoryRoot) ||
      /\/(?:home|Users)\/[^/\s"']+/u.test(contents) ||
      contents.includes(String.fromCharCode(27))
    ) {
      throw new Error(
        `Sanitized output still contains a host value: ${generatedFile}`,
      );
    }
  }
  return exampleRoot;
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  if (process.argv.length !== 3) {
    throw new Error("Usage: node sanitize.mjs <fixed-format-run-id>");
  }
  const repositoryRoot = path.resolve(path.dirname(scriptPath), "../../..");
  const destination = await sanitizeRun(repositoryRoot, process.argv[2]);
  process.stdout.write(`${destination}\n`);
}
