import { Buffer } from "node:buffer";
import { constants } from "node:fs";
import { lstat, open, readdir, rename } from "node:fs/promises";
import process from "node:process";

const RUN_ID = "m2a-npm-lifecycle-20260721000000000000000000000001";
const RUN_ROOT = `/work/${RUN_ID}`;
const NEXT_PATH = `${RUN_ROOT}/.volume-ready.next`;
const READY_PATH = `${RUN_ROOT}/.volume-ready.json`;
const READY_BYTES = Buffer.from(
  `${JSON.stringify({
    schemaVersion: "m2a-volume-ready/v1",
    generation: "20260721-01",
    runId: RUN_ID,
    volumeId: "tskaigi-m2a-evidence-20260721-01",
  })}\n`,
  "utf8",
);

async function closeHandles(handles, keys) {
  let firstFailure;
  for (const key of keys) {
    const handle = handles[key];
    if (handle === undefined) continue;
    handles[key] = undefined;
    try {
      await handle.close();
    } catch (error) {
      firstFailure ??= error;
    }
  }
  if (firstFailure !== undefined) throw firstFailure;
}

async function initialize() {
  if (process.argv.length !== 2) throw new Error("M2A_INIT_ARGUMENT_INVALID");
  const lexicalRoot = await lstat(RUN_ROOT, { bigint: true });
  if (!lexicalRoot.isDirectory() || lexicalRoot.isSymbolicLink()) {
    throw new Error("M2A_INIT_ROOT_INVALID");
  }
  if ((await readdir(RUN_ROOT)).length !== 0) {
    throw new Error("M2A_INIT_ROOT_NOT_EMPTY");
  }
  const handles = {
    root: await open(
      RUN_ROOT,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    ),
    next: undefined,
  };
  try {
    const rootBefore = await handles.root.stat({ bigint: true });
    if (
      rootBefore.dev !== lexicalRoot.dev ||
      rootBefore.ino !== lexicalRoot.ino ||
      !rootBefore.isDirectory()
    ) {
      throw new Error("M2A_INIT_ROOT_REPLACED");
    }
    await handles.root.chmod(0o1777);
    handles.next = await open(
      NEXT_PATH,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_RDWR |
        constants.O_NOFOLLOW,
      0o600,
    );
    const written = await handles.next.write(
      READY_BYTES,
      0,
      READY_BYTES.length,
      0,
    );
    if (written.bytesWritten !== READY_BYTES.length) {
      throw new Error("M2A_INIT_WRITE_INVALID");
    }
    await handles.next.sync();
    const readBack = Buffer.alloc(READY_BYTES.length);
    const read = await handles.next.read(readBack, 0, readBack.length, 0);
    const stats = await handles.next.stat({ bigint: true });
    if (
      read.bytesRead !== READY_BYTES.length ||
      !readBack.equals(READY_BYTES) ||
      !stats.isFile() ||
      stats.nlink !== 1n ||
      stats.size !== BigInt(READY_BYTES.length)
    ) {
      throw new Error("M2A_INIT_READBACK_INVALID");
    }
    await handles.next.chmod(0o444);
    await closeHandles(handles, ["next"]);
    await rename(NEXT_PATH, READY_PATH);
    const rootAfter = await lstat(RUN_ROOT, { bigint: true });
    if (
      rootAfter.dev !== rootBefore.dev ||
      rootAfter.ino !== rootBefore.ino ||
      !rootAfter.isDirectory()
    ) {
      throw new Error("M2A_INIT_ROOT_REPLACED");
    }
    await handles.root.sync();
  } finally {
    await closeHandles(handles, ["next", "root"]);
  }
}

initialize().catch(() => {
  process.exitCode = 70;
});
