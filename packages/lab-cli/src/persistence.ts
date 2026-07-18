import { MAX_SEGMENT_BYTES } from "@tskaigi-lab/probe-core";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { collectRun } from "./collector.js";
import {
  EVIDENCE_LOCATIONS,
  MAX_COMPLETION_BYTES,
  MAX_SNAPSHOT_BYTES,
} from "./constants.js";
import { validateRunCompletion } from "./completion.js";
import { LabError } from "./errors.js";
import { serializeJson } from "./renderer.js";
import { validateScenarioSnapshot } from "./scenario.js";
import type {
  CollectionResult,
  PersistedRunInput,
  RunCompletion,
  ScenarioSnapshot,
} from "./types.js";

type WritableBytes = string | Uint8Array;

async function writeExclusive(
  filePath: string,
  bytes: WritableBytes,
): Promise<void> {
  try {
    await writeFile(filePath, bytes, {
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { readonly code?: unknown }).code
        : null;
    throw new LabError(
      code === "EEXIST" ? "OUTPUT_ALREADY_EXISTS" : "OUTPUT_WRITE_FAILURE",
    );
  }
}

async function canonicalOwnedRoot(outputRoot: string): Promise<string> {
  const resolvedRoot = path.resolve(outputRoot);
  let canonicalRoot: string;
  try {
    canonicalRoot = await realpath(resolvedRoot);
  } catch {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  if (canonicalRoot !== resolvedRoot) {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  return canonicalRoot;
}

async function createOwnedRunRoot(
  outputRoot: string,
  runId: string,
): Promise<string> {
  const canonicalRoot = await canonicalOwnedRoot(outputRoot);
  const runRoot = path.join(canonicalRoot, runId);
  if (path.dirname(runRoot) !== canonicalRoot) {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  try {
    await mkdir(runRoot, { mode: 0o700 });
    await mkdir(path.join(runRoot, EVIDENCE_LOCATIONS.segments), {
      mode: 0o700,
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { readonly code?: unknown }).code
        : null;
    throw new LabError(
      code === "EEXIST" ? "OUTPUT_ALREADY_EXISTS" : "OUTPUT_WRITE_FAILURE",
    );
  }
  return runRoot;
}

async function openOwnedRunRoot(
  outputRoot: string,
  runId: string,
): Promise<string> {
  const canonicalRoot = await canonicalOwnedRoot(outputRoot);
  const runRoot = path.join(canonicalRoot, runId);
  if (path.dirname(runRoot) !== canonicalRoot) {
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  try {
    if ((await realpath(runRoot)) !== runRoot) {
      throw new LabError("OUTPUT_BOUNDARY_INVALID");
    }
    const runStatus = await lstat(runRoot);
    if (!runStatus.isDirectory() || runStatus.isSymbolicLink()) {
      throw new LabError("OUTPUT_BOUNDARY_INVALID");
    }
    const segmentRoot = path.join(runRoot, EVIDENCE_LOCATIONS.segments);
    if ((await realpath(segmentRoot)) !== segmentRoot) {
      throw new LabError("OUTPUT_BOUNDARY_INVALID");
    }
    const segmentStatus = await lstat(segmentRoot);
    if (!segmentStatus.isDirectory() || segmentStatus.isSymbolicLink()) {
      throw new LabError("OUTPUT_BOUNDARY_INVALID");
    }
  } catch (error) {
    if (error instanceof LabError) throw error;
    throw new LabError("OUTPUT_BOUNDARY_INVALID");
  }
  return runRoot;
}

async function readRegularBytes(
  filePath: string,
  maxBytes: number,
): Promise<Uint8Array> {
  try {
    const before = await lstat(filePath);
    if (!before.isFile() || before.isSymbolicLink() || before.size > maxBytes) {
      throw new LabError(
        before.size > maxBytes ? "INPUT_FILE_TOO_LARGE" : "INPUT_FILE_INVALID",
      );
    }
    const bytes = await readFile(filePath);
    const after = await lstat(filePath);
    if (
      !after.isFile() ||
      after.isSymbolicLink() ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      bytes.byteLength !== after.size
    ) {
      throw new LabError("INPUT_FILE_INVALID");
    }
    return new Uint8Array(bytes);
  } catch (error) {
    if (error instanceof LabError) throw error;
    throw new LabError("INPUT_FILE_INVALID");
  }
}

function parseJsonBytes(bytes: Uint8Array): unknown {
  let source: string;
  try {
    source = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true,
    }).decode(bytes);
    return JSON.parse(source) as unknown;
  } catch {
    throw new LabError("INPUT_FILE_INVALID");
  }
}

function assertCanonicalJson(bytes: Uint8Array, value: unknown): void {
  if (!Buffer.from(serializeJson(value), "utf8").equals(Buffer.from(bytes))) {
    throw new LabError("INPUT_FILE_INVALID");
  }
}

const DERIVED_FILENAMES = Object.freeze([
  EVIDENCE_LOCATIONS.metadata,
  EVIDENCE_LOCATIONS.summary,
  EVIDENCE_LOCATIONS.events,
  EVIDENCE_LOCATIONS.hashes,
  EVIDENCE_LOCATIONS.comparison,
]);

async function assertRunInventory(runRoot: string): Promise<readonly string[]> {
  const names = (await readdir(runRoot)).sort();
  const allowed = new Set<string>([
    EVIDENCE_LOCATIONS.manifest,
    EVIDENCE_LOCATIONS.completion,
    EVIDENCE_LOCATIONS.segments,
    ...DERIVED_FILENAMES,
  ]);
  if (
    !names.includes(EVIDENCE_LOCATIONS.manifest) ||
    !names.includes(EVIDENCE_LOCATIONS.completion) ||
    !names.includes(EVIDENCE_LOCATIONS.segments) ||
    names.some((name) => !allowed.has(name))
  ) {
    throw new LabError("INPUT_INVENTORY_INVALID");
  }
  return Object.freeze(names);
}

async function loadPersistedRunInput(
  outputRoot: string,
  runId: string,
): Promise<{ readonly runRoot: string; readonly input: PersistedRunInput }> {
  const runRoot = await openOwnedRunRoot(outputRoot, runId);
  await assertRunInventory(runRoot);

  const snapshotBytes = await readRegularBytes(
    path.join(runRoot, EVIDENCE_LOCATIONS.manifest),
    MAX_SNAPSHOT_BYTES,
  );
  const snapshot = validateScenarioSnapshot(parseJsonBytes(snapshotBytes));
  assertCanonicalJson(snapshotBytes, snapshot);
  if (snapshot.runId !== runId) throw new LabError("INPUT_FILE_INVALID");

  const completionBytes = await readRegularBytes(
    path.join(runRoot, EVIDENCE_LOCATIONS.completion),
    MAX_COMPLETION_BYTES,
  );
  const completion = validateRunCompletion(parseJsonBytes(completionBytes));
  assertCanonicalJson(completionBytes, completion);

  const expectedSegmentNames = snapshot.segments
    .map((segment) => `${segment.producerId}.jsonl`)
    .sort();
  const segmentRoot = path.join(runRoot, EVIDENCE_LOCATIONS.segments);
  const actualSegmentNames = (await readdir(segmentRoot)).sort();
  if (
    actualSegmentNames.length !== expectedSegmentNames.length ||
    actualSegmentNames.some(
      (name, index) => name !== expectedSegmentNames[index],
    )
  ) {
    throw new LabError("INPUT_INVENTORY_INVALID");
  }
  const segments: Record<string, Uint8Array> = Object.create(null);
  for (const definition of snapshot.segments) {
    segments[definition.segmentId] = await readRegularBytes(
      path.join(segmentRoot, `${definition.producerId}.jsonl`),
      MAX_SEGMENT_BYTES,
    );
  }
  return Object.freeze({
    runRoot,
    input: Object.freeze({
      snapshot,
      completion,
      segments: Object.freeze(segments),
    }),
  });
}

async function writeDerivedOutputs(
  runRoot: string,
  result: CollectionResult,
): Promise<void> {
  await writeExclusive(
    path.join(runRoot, EVIDENCE_LOCATIONS.metadata),
    result.metadataJson,
  );
  await writeExclusive(
    path.join(runRoot, EVIDENCE_LOCATIONS.summary),
    result.summaryJson,
  );
  if (result.validity === "complete") {
    await writeExclusive(
      path.join(runRoot, EVIDENCE_LOCATIONS.events),
      result.eventsJsonl,
    );
    await writeExclusive(
      path.join(runRoot, EVIDENCE_LOCATIONS.hashes),
      result.hashesJson,
    );
    await writeExclusive(
      path.join(runRoot, EVIDENCE_LOCATIONS.comparison),
      result.comparisonMarkdown,
    );
  }
}

export async function persistFixtureRun(
  outputRoot: string,
  snapshot: ScenarioSnapshot,
  completion: RunCompletion,
  segments: Readonly<Record<string, Uint8Array>>,
  result: CollectionResult,
): Promise<void> {
  const runRoot = await createOwnedRunRoot(outputRoot, snapshot.runId);
  await writeExclusive(
    path.join(runRoot, EVIDENCE_LOCATIONS.manifest),
    serializeJson(snapshot),
  );
  await writeExclusive(
    path.join(runRoot, EVIDENCE_LOCATIONS.completion),
    serializeJson(completion),
  );
  for (const definition of snapshot.segments) {
    const rawSegment = segments[definition.segmentId];
    if (rawSegment === undefined) throw new LabError("SEGMENT_MISSING");
    await writeExclusive(
      path.join(
        runRoot,
        EVIDENCE_LOCATIONS.segments,
        `${definition.producerId}.jsonl`,
      ),
      rawSegment,
    );
  }
  await writeDerivedOutputs(runRoot, result);
}

export async function regenerateFixtureRunInOwnedRoot(
  outputRoot: string,
  runId: string,
): Promise<CollectionResult> {
  const loaded = await loadPersistedRunInput(outputRoot, runId);
  const rootNames = await assertRunInventory(loaded.runRoot);
  if (DERIVED_FILENAMES.some((name) => rootNames.includes(name))) {
    throw new LabError("OUTPUT_ALREADY_EXISTS");
  }
  const result = collectRun(loaded.input);
  await writeDerivedOutputs(loaded.runRoot, result);
  return result;
}
