import { constants as fsConstants } from "node:fs";
import { lstat, open, readdir, type FileHandle } from "node:fs/promises";
import path from "node:path";

const EVENT_SEGMENT_BYTES = 65_536;
const EVENT_SEGMENT = "vite-coordinator.jsonl";
const DIRECT_WRITE_MARKER = "direct-write-marker.json";
const ENTRY_OUTPUT = "entry.js";

export class FixedViteEvidenceAccessError extends Error {
  constructor(readonly evidence: "not-inspected" | "partially-inspected") {
    super("P2_EXECUTOR_OUTPUT_INVALID");
    this.name = "FixedViteEvidenceAccessError";
  }
}

export interface BoundedRegularFileHandle {
  stat(): Promise<Readonly<{ size: number; isFile(): boolean }>>;
  read(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<Readonly<{ bytesRead: number }>>;
}

export interface BoundedEventRead {
  readonly bytes: number;
  readonly rawSegment: string | null;
}

export interface FixedViteEvidence {
  readonly eventFile: Readonly<{
    present: boolean;
    bytes: number;
    rawSegment: string | null;
  }>;
  readonly directFile: Readonly<{ present: boolean; bytes: number }>;
  readonly entryFile: Readonly<{ present: boolean; bytes: number }>;
}

async function optionalRegularFile(
  filePath: string,
  expectedMode?: number,
): Promise<Readonly<{ present: boolean; bytes: number }>> {
  try {
    const file = await lstat(filePath);
    if (
      !file.isFile() ||
      file.isSymbolicLink() ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0 ||
      (expectedMode !== undefined && (file.mode & 0o7777) !== expectedMode)
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
    return Object.freeze({ present: true, bytes: file.size });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0 });
    }
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
}

async function inspectFixedOutputEntry(
  outputRoot: string,
): Promise<Readonly<{ present: boolean; bytes: number }>> {
  try {
    const outputDirectory = await lstat(outputRoot);
    if (
      !outputDirectory.isDirectory() ||
      outputDirectory.isSymbolicLink() ||
      (outputDirectory.mode & 0o7777) !== 0o555
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0 });
    }
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  let entries;
  try {
    entries = await readdir(outputRoot, { withFileTypes: true });
  } catch {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  if (
    entries.length !== 1 ||
    entries[0]?.name !== ENTRY_OUTPUT ||
    !entries[0].isFile() ||
    entries[0].isSymbolicLink()
  ) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  return optionalRegularFile(path.join(outputRoot, ENTRY_OUTPUT), 0o444);
}

async function readBoundedEventHandle(
  handle: BoundedRegularFileHandle,
): Promise<BoundedEventRead> {
  const before = await handle.stat();
  if (
    !before.isFile() ||
    !Number.isSafeInteger(before.size) ||
    before.size < 0
  ) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  if (before.size > EVENT_SEGMENT_BYTES) {
    return Object.freeze({ bytes: before.size, rawSegment: null });
  }
  const buffer = Buffer.alloc(EVENT_SEGMENT_BYTES + 1);
  let offset = 0;
  while (offset < buffer.byteLength) {
    const read = await handle.read(
      buffer,
      offset,
      buffer.byteLength - offset,
      offset,
    );
    if (
      !Number.isSafeInteger(read.bytesRead) ||
      read.bytesRead < 0 ||
      read.bytesRead > buffer.byteLength - offset
    ) {
      throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
    }
    if (read.bytesRead === 0) break;
    offset += read.bytesRead;
  }
  const after = await handle.stat();
  if (!after.isFile() || !Number.isSafeInteger(after.size) || after.size < 0) {
    throw new Error("P2_EXECUTOR_OUTPUT_INVALID");
  }
  const stableAndBounded =
    before.size === after.size &&
    offset === before.size &&
    offset <= EVENT_SEGMENT_BYTES;
  return Object.freeze({
    bytes: after.size,
    rawSegment: stableAndBounded
      ? buffer.subarray(0, offset).toString("utf8")
      : null,
  });
}

async function readBoundedEventFile(filePath: string): Promise<
  Readonly<{
    present: boolean;
    bytes: number;
    rawSegment: string | null;
  }>
> {
  let handle: FileHandle;
  try {
    handle = await open(
      filePath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze({ present: false, bytes: 0, rawSegment: null });
    }
    throw new FixedViteEvidenceAccessError("not-inspected");
  }
  try {
    const result = await readBoundedEventHandle(handle);
    try {
      await handle.close();
    } catch {
      throw new FixedViteEvidenceAccessError("partially-inspected");
    }
    return Object.freeze({ present: true, ...result });
  } catch {
    try {
      await handle.close();
    } catch {
      // The explicit partial-inspection state already bounds close failure.
    }
    throw new FixedViteEvidenceAccessError("partially-inspected");
  }
}

export function readBoundedViteEventHandleForTest(
  handle: BoundedRegularFileHandle,
): Promise<BoundedEventRead> {
  return readBoundedEventHandle(handle);
}

export async function readFixedViteEvidenceFromRoot(
  resultRoot: string,
): Promise<FixedViteEvidence> {
  const eventPath = path.join(resultRoot, "result", EVENT_SEGMENT);
  const directPath = path.join(resultRoot, "direct-write", DIRECT_WRITE_MARKER);
  const outputRoot = path.join(resultRoot, "tool", "out");
  let availability;
  try {
    availability = Object.freeze({
      eventFile: await optionalRegularFile(eventPath, 0o444),
      directFile: await optionalRegularFile(directPath),
      entryFile: await inspectFixedOutputEntry(outputRoot),
    });
  } catch {
    throw new FixedViteEvidenceAccessError("not-inspected");
  }
  const eventFile = availability.eventFile.present
    ? await readBoundedEventFile(eventPath)
    : Object.freeze({ present: false, bytes: 0, rawSegment: null });
  return Object.freeze({
    eventFile,
    directFile: availability.directFile,
    entryFile: availability.entryFile,
  });
}

export const readFixedViteEvidenceFromRootForTest =
  readFixedViteEvidenceFromRoot;
