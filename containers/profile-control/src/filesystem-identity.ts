import { createHash } from "node:crypto";
import { constants, type BigIntStats } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  rmdir,
  unlink,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";

const MODE_MASK = 0o7777n;
const MAX_SAFE_ALLOCATION = BigInt(Number.MAX_SAFE_INTEGER);

export type FilesystemObjectKind = "directory" | "regular-file";

export interface PrivateOwner {
  readonly uid: bigint;
  readonly gid: bigint;
}

interface PrivateIdentitySnapshot {
  readonly device: bigint;
  readonly inode: bigint;
  readonly kind: FilesystemObjectKind;
  readonly uid: bigint;
  readonly gid: bigint;
  readonly mode: bigint;
  readonly nlink: bigint;
  readonly size: bigint;
  readonly mtimeNs: bigint;
  readonly ctimeNs: bigint;
}

export interface PrivateIdentityInputForTest {
  readonly device: unknown;
  readonly inode: unknown;
  readonly uid: unknown;
  readonly gid: unknown;
  readonly mode: unknown;
  readonly nlink: unknown;
  readonly size: unknown;
  readonly mtimeNs: unknown;
  readonly ctimeNs: unknown;
}

export interface FileIdentityExpectations {
  readonly mode: number | "captured";
  readonly owner?: PrivateOwner;
  readonly maximumBytes?: number;
  readonly exactSize?: bigint;
  readonly content: "metadata-only" | "read";
  readonly expectedBytes?: Uint8Array;
}

export interface DirectoryIdentityExpectations {
  readonly mode: number | "captured";
  readonly owner?: PrivateOwner;
  readonly children: readonly string[];
}

export class FilesystemIdentityError extends Error {
  constructor() {
    super("M4_IDENTITY_UNSUPPORTED");
    this.name = "FilesystemIdentityError";
  }
}

function failIdentity(): never {
  throw new FilesystemIdentityError();
}

export function errnoCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

function assertNonNegativeBigInt(input: unknown): bigint {
  if (typeof input !== "bigint" || input < 0n) return failIdentity();
  return input;
}

export function assertPrivateIdentityForTest(
  input: PrivateIdentityInputForTest,
): void {
  assertNonNegativeBigInt(input.device);
  assertNonNegativeBigInt(input.inode);
  assertNonNegativeBigInt(input.uid);
  assertNonNegativeBigInt(input.gid);
  assertNonNegativeBigInt(input.mode);
  assertNonNegativeBigInt(input.nlink);
  assertNonNegativeBigInt(input.size);
  assertNonNegativeBigInt(input.mtimeNs);
  assertNonNegativeBigInt(input.ctimeNs);
}

function objectKind(stat: BigIntStats): FilesystemObjectKind {
  if (stat.isDirectory() && !stat.isSymbolicLink()) return "directory";
  if (stat.isFile() && !stat.isSymbolicLink()) return "regular-file";
  return failIdentity();
}

function snapshot(stat: BigIntStats): PrivateIdentitySnapshot {
  const input = {
    device: stat.dev,
    inode: stat.ino,
    uid: stat.uid,
    gid: stat.gid,
    mode: stat.mode,
    nlink: stat.nlink,
    size: stat.size,
    mtimeNs: stat.mtimeNs,
    ctimeNs: stat.ctimeNs,
  };
  assertPrivateIdentityForTest(input);
  return Object.freeze({
    ...input,
    kind: objectKind(stat),
  });
}

function sameOwner(
  left: Readonly<{ uid: bigint; gid: bigint }>,
  right: Readonly<{ uid: bigint; gid: bigint }>,
): boolean {
  return left.uid === right.uid && left.gid === right.gid;
}

function sameObject(
  left: PrivateIdentitySnapshot,
  right: PrivateIdentitySnapshot,
): boolean {
  return (
    left.device === right.device &&
    left.inode === right.inode &&
    left.kind === right.kind
  );
}

function sameSnapshot(
  left: PrivateIdentitySnapshot,
  right: PrivateIdentitySnapshot,
): boolean {
  return (
    sameObject(left, right) &&
    sameOwner(left, right) &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

function exactMode(
  identity: PrivateIdentitySnapshot,
  expected: number | "captured",
): void {
  if (expected === "captured") return;
  if ((identity.mode & MODE_MASK) !== BigInt(expected)) failIdentity();
}

function exactNames(
  actual: readonly string[],
  expected: readonly string[],
): void {
  const left = [...actual].sort();
  const right = [...expected].sort();
  if (
    left.length !== right.length ||
    left.some((entry, index) => entry !== right[index])
  ) {
    failIdentity();
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeAllocationLength(size: bigint, maximumBytes: number): number {
  if (
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 0 ||
    size > BigInt(maximumBytes) ||
    size > MAX_SAFE_ALLOCATION
  ) {
    return failIdentity();
  }
  return Number(size);
}

function assertOwner(
  identity: PrivateIdentitySnapshot,
  expected?: PrivateOwner,
): void {
  if (expected !== undefined && !sameOwner(identity, expected)) {
    failIdentity();
  }
}

function assertFileExpectations(
  identity: PrivateIdentitySnapshot,
  expectations: FileIdentityExpectations,
): void {
  if (identity.kind !== "regular-file" || identity.nlink !== 1n) {
    failIdentity();
  }
  exactMode(identity, expectations.mode);
  assertOwner(identity, expectations.owner);
  if (
    expectations.exactSize !== undefined &&
    identity.size !== expectations.exactSize
  ) {
    failIdentity();
  }
  if (expectations.content === "metadata-only") {
    if (
      expectations.maximumBytes !== undefined ||
      expectations.expectedBytes !== undefined
    ) {
      failIdentity();
    }
    return;
  }
  if (expectations.maximumBytes === undefined) failIdentity();
  safeAllocationLength(identity.size, expectations.maximumBytes);
}

function assertDirectoryExpectations(
  identity: PrivateIdentitySnapshot,
  expectations: DirectoryIdentityExpectations,
): void {
  if (identity.kind !== "directory") failIdentity();
  exactMode(identity, expectations.mode);
  assertOwner(identity, expectations.owner);
}

async function pathSnapshot(target: string): Promise<PrivateIdentitySnapshot> {
  return snapshot(await lstat(target, { bigint: true }));
}

async function descriptorSnapshot(
  handle: FileHandle,
): Promise<PrivateIdentitySnapshot> {
  return snapshot(await handle.stat({ bigint: true }));
}

async function openNoFollow(
  target: string,
  kind: FilesystemObjectKind,
): Promise<FileHandle> {
  assertFilesystemCapabilitiesForTest({
    noFollow: constants.O_NOFOLLOW,
    directory: constants.O_DIRECTORY,
    kind,
  });
  const flags =
    constants.O_RDONLY |
    constants.O_NOFOLLOW |
    (kind === "directory" ? constants.O_DIRECTORY : 0);
  try {
    return await open(target, flags);
  } catch {
    return failIdentity();
  }
}

export function assertFilesystemCapabilitiesForTest(input: {
  readonly noFollow: unknown;
  readonly directory: unknown;
  readonly kind: FilesystemObjectKind;
}): void {
  if (
    typeof input.noFollow !== "number" ||
    input.noFollow === 0 ||
    (input.kind === "directory" &&
      (typeof input.directory !== "number" || input.directory === 0))
  ) {
    failIdentity();
  }
}

export async function requireAbsent(target: string): Promise<void> {
  try {
    await lstat(target, { bigint: true });
  } catch (error) {
    if (errnoCode(error) === "ENOENT") return;
    throw error;
  }
  failIdentity();
}

export function assertFixedDescendant(root: string, target: string): void {
  if (!path.isAbsolute(root) || !path.isAbsolute(target)) failIdentity();
  if (path.normalize(root) !== root || path.normalize(target) !== target) {
    failIdentity();
  }
  const relative = path.relative(root, target);
  if (
    relative === "" ||
    relative.startsWith(`..${path.sep}`) ||
    relative === ".." ||
    path.isAbsolute(relative)
  ) {
    failIdentity();
  }
  for (const component of relative.split(path.sep)) {
    if (
      component.length === 0 ||
      component === "." ||
      component === ".." ||
      component.includes("\0") ||
      component.includes("/") ||
      component.includes("\\")
    ) {
      failIdentity();
    }
  }
}

export class HeldFilesystemObject {
  private closed = false;
  private checkpoint: PrivateIdentitySnapshot;
  private contentHash: string | null = null;
  private contentBytes: Uint8Array | null = null;

  private constructor(
    readonly logicalRole: string,
    readonly absolutePath: string,
    private readonly handle: FileHandle,
    initial: PrivateIdentitySnapshot,
    readonly kind: FilesystemObjectKind,
    private readonly readPermitted: boolean,
    private readonly creatingDescriptor: boolean,
  ) {
    this.checkpoint = initial;
  }

  static async captureFile(
    logicalRole: string,
    target: string,
    expectations: FileIdentityExpectations,
  ): Promise<HeldFilesystemObject> {
    const pathBefore = await pathSnapshot(target);
    if ((await realpath(target)) !== target) failIdentity();
    assertFileExpectations(pathBefore, expectations);
    const handle = await openNoFollow(target, "regular-file");
    try {
      const descriptorBefore = await descriptorSnapshot(handle);
      if (!sameSnapshot(pathBefore, descriptorBefore)) failIdentity();
      const held = new HeldFilesystemObject(
        logicalRole,
        target,
        handle,
        descriptorBefore,
        "regular-file",
        expectations.content === "read",
        false,
      );
      if (expectations.content === "read") {
        const bytes = await held.readCurrentBytes(
          expectations.maximumBytes ?? 0,
        );
        if (
          expectations.expectedBytes !== undefined &&
          !equalBytes(bytes, expectations.expectedBytes)
        ) {
          failIdentity();
        }
        held.contentBytes = Uint8Array.from(bytes);
        held.contentHash = sha256(bytes);
      }
      await held.validateStable(expectations);
      return held;
    } catch (error) {
      await handle.close().catch(() => undefined);
      throw error;
    }
  }

  static async adoptCreatedFile(
    logicalRole: string,
    target: string,
    handle: FileHandle,
    expectations: FileIdentityExpectations,
  ): Promise<HeldFilesystemObject> {
    const pathBefore = await pathSnapshot(target);
    if ((await realpath(target)) !== target) failIdentity();
    assertFileExpectations(pathBefore, expectations);
    const descriptorBefore = await descriptorSnapshot(handle);
    if (!sameSnapshot(pathBefore, descriptorBefore)) failIdentity();
    const held = new HeldFilesystemObject(
      logicalRole,
      target,
      handle,
      descriptorBefore,
      "regular-file",
      expectations.content === "read",
      true,
    );
    if (expectations.content === "read") {
      const bytes = await held.readCurrentBytes(expectations.maximumBytes ?? 0);
      if (
        expectations.expectedBytes !== undefined &&
        !equalBytes(bytes, expectations.expectedBytes)
      ) {
        failIdentity();
      }
      held.contentBytes = Uint8Array.from(bytes);
      held.contentHash = sha256(bytes);
    }
    await held.validateStable(expectations);
    return held;
  }

  static async captureDirectory(
    logicalRole: string,
    target: string,
    expectations: DirectoryIdentityExpectations,
  ): Promise<HeldFilesystemObject> {
    const pathBefore = await pathSnapshot(target);
    if ((await realpath(target)) !== target) failIdentity();
    assertDirectoryExpectations(pathBefore, expectations);
    exactNames(await readdir(target), expectations.children);
    const handle = await openNoFollow(target, "directory");
    try {
      const descriptorBefore = await descriptorSnapshot(handle);
      if (!sameSnapshot(pathBefore, descriptorBefore)) failIdentity();
      exactNames(await readdir(target), expectations.children);
      const pathAfter = await pathSnapshot(target);
      const descriptorAfter = await descriptorSnapshot(handle);
      if (
        !sameSnapshot(descriptorBefore, descriptorAfter) ||
        !sameSnapshot(pathAfter, descriptorAfter)
      ) {
        failIdentity();
      }
      return new HeldFilesystemObject(
        logicalRole,
        target,
        handle,
        descriptorAfter,
        "directory",
        false,
        false,
      );
    } catch (error) {
      await handle.close().catch(() => undefined);
      throw error;
    }
  }

  owner(): PrivateOwner {
    return Object.freeze({
      uid: this.checkpoint.uid,
      gid: this.checkpoint.gid,
    });
  }

  sameObjectAs(other: HeldFilesystemObject): boolean {
    return sameObject(this.checkpoint, other.checkpoint);
  }

  async assertCreatingDescriptorContinuityForTest(): Promise<void> {
    if (!this.creatingDescriptor) failIdentity();
    this.assertOpen();
    const [descriptor] = await this.currentPair();
    if (!sameSnapshot(this.checkpoint, descriptor)) failIdentity();
  }

  private assertOpen(): void {
    if (this.closed) failIdentity();
  }

  private async currentPair(): Promise<
    readonly [PrivateIdentitySnapshot, PrivateIdentitySnapshot]
  > {
    this.assertOpen();
    const descriptor = await descriptorSnapshot(this.handle);
    const byPath = await pathSnapshot(this.absolutePath);
    if (!sameSnapshot(descriptor, byPath)) failIdentity();
    return [descriptor, byPath] as const;
  }

  private async readCurrentBytes(maximumBytes: number): Promise<Uint8Array> {
    this.assertOpen();
    const before = await descriptorSnapshot(this.handle);
    if (before.kind !== "regular-file" || before.nlink !== 1n) failIdentity();
    const length = safeAllocationLength(before.size, maximumBytes);
    const bytes = new Uint8Array(length);
    let offset = 0;
    while (offset < length) {
      const result = await this.handle.read(
        bytes,
        offset,
        length - offset,
        offset,
      );
      if (result.bytesRead === 0) failIdentity();
      offset += result.bytesRead;
    }
    const after = await descriptorSnapshot(this.handle);
    if (!sameSnapshot(before, after)) failIdentity();
    return bytes;
  }

  async readBytes(maximumBytes: number): Promise<Uint8Array> {
    if (this.kind !== "regular-file" || !this.readPermitted) failIdentity();
    const bytes = await this.readCurrentBytes(maximumBytes);
    if (
      this.contentHash !== null &&
      (this.contentBytes === null ||
        this.contentHash !== sha256(bytes) ||
        !equalBytes(this.contentBytes, bytes))
    ) {
      failIdentity();
    }
    return Uint8Array.from(bytes);
  }

  async validateStable(
    expectations: FileIdentityExpectations | DirectoryIdentityExpectations,
  ): Promise<void> {
    const [descriptor] = await this.currentPair();
    if (!sameSnapshot(this.checkpoint, descriptor)) failIdentity();
    if (this.kind === "regular-file" && "content" in expectations) {
      assertFileExpectations(descriptor, expectations);
      if (expectations.content === "read") {
        const bytes = await this.readCurrentBytes(
          expectations.maximumBytes ?? 0,
        );
        if (
          (expectations.expectedBytes !== undefined &&
            !equalBytes(bytes, expectations.expectedBytes)) ||
          (this.contentHash !== null && this.contentHash !== sha256(bytes))
        ) {
          failIdentity();
        }
      }
      return;
    }
    if (this.kind !== "directory" || !("children" in expectations)) {
      failIdentity();
    }
    assertDirectoryExpectations(descriptor, expectations);
    exactNames(await readdir(this.absolutePath), expectations.children);
    const [after] = await this.currentPair();
    if (!sameSnapshot(descriptor, after)) failIdentity();
  }

  async refreshDirectoryCheckpoint(
    expectations: DirectoryIdentityExpectations,
  ): Promise<void> {
    if (this.kind !== "directory") failIdentity();
    this.assertOpen();
    const firstDescriptor = await descriptorSnapshot(this.handle);
    const firstPath = await pathSnapshot(this.absolutePath);
    if (
      !sameObject(this.checkpoint, firstDescriptor) ||
      !sameSnapshot(firstDescriptor, firstPath) ||
      !sameOwner(this.checkpoint, firstDescriptor) ||
      this.checkpoint.mode !== firstDescriptor.mode
    ) {
      failIdentity();
    }
    assertDirectoryExpectations(firstDescriptor, expectations);
    exactNames(await readdir(this.absolutePath), expectations.children);
    const secondDescriptor = await descriptorSnapshot(this.handle);
    const secondPath = await pathSnapshot(this.absolutePath);
    exactNames(await readdir(this.absolutePath), expectations.children);
    if (
      !sameSnapshot(firstDescriptor, secondDescriptor) ||
      !sameSnapshot(secondDescriptor, secondPath)
    ) {
      failIdentity();
    }
    this.checkpoint = secondDescriptor;
  }

  async syncDirectoryCheckpoint(
    expectations: DirectoryIdentityExpectations,
  ): Promise<void> {
    if (this.kind !== "directory") failIdentity();
    this.assertOpen();
    const beforeDescriptor = await descriptorSnapshot(this.handle);
    const beforePath = await pathSnapshot(this.absolutePath);
    if (
      !sameObject(this.checkpoint, beforeDescriptor) ||
      !sameSnapshot(beforeDescriptor, beforePath) ||
      !sameOwner(this.checkpoint, beforeDescriptor) ||
      this.checkpoint.mode !== beforeDescriptor.mode
    ) {
      failIdentity();
    }
    assertDirectoryExpectations(beforeDescriptor, expectations);
    exactNames(await readdir(this.absolutePath), expectations.children);
    await this.handle.sync();
    const afterDescriptor = await descriptorSnapshot(this.handle);
    const afterPath = await pathSnapshot(this.absolutePath);
    exactNames(await readdir(this.absolutePath), expectations.children);
    if (
      !sameSnapshot(beforeDescriptor, afterDescriptor) ||
      !sameSnapshot(afterDescriptor, afterPath)
    ) {
      failIdentity();
    }
    this.checkpoint = afterDescriptor;
  }

  async transitionDirectoryMode(
    expectedCurrentMode: number,
    nextMode: number,
    expectedChildren: readonly string[],
  ): Promise<void> {
    if (this.kind !== "directory") failIdentity();
    await this.validateStable({
      mode: expectedCurrentMode,
      owner: this.owner(),
      children: expectedChildren,
    });
    await this.handle.chmod(nextMode);
    const firstDescriptor = await descriptorSnapshot(this.handle);
    const firstPath = await pathSnapshot(this.absolutePath);
    if (
      !sameObject(this.checkpoint, firstDescriptor) ||
      !sameSnapshot(firstDescriptor, firstPath) ||
      !sameOwner(this.checkpoint, firstDescriptor)
    ) {
      failIdentity();
    }
    exactMode(firstDescriptor, nextMode);
    exactNames(await readdir(this.absolutePath), expectedChildren);
    const secondDescriptor = await descriptorSnapshot(this.handle);
    const secondPath = await pathSnapshot(this.absolutePath);
    if (
      !sameSnapshot(firstDescriptor, secondDescriptor) ||
      !sameSnapshot(secondDescriptor, secondPath)
    ) {
      failIdentity();
    }
    this.checkpoint = secondDescriptor;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    try {
      await this.handle.close();
    } catch {
      failIdentity();
    }
  }

  async unlinkExpected(expectations: FileIdentityExpectations): Promise<void> {
    await this.validateStable(expectations);
    await unlink(this.absolutePath);
    await this.close();
    await requireAbsent(this.absolutePath);
  }

  async removeExpectedDirectory(
    expectations: DirectoryIdentityExpectations,
  ): Promise<void> {
    await this.validateStable(expectations);
    await rmdir(this.absolutePath);
    await this.close();
    await requireAbsent(this.absolutePath);
  }
}

export async function captureFileIdentity(
  logicalRole: string,
  target: string,
  expectations: FileIdentityExpectations,
): Promise<HeldFilesystemObject> {
  return await HeldFilesystemObject.captureFile(
    logicalRole,
    target,
    expectations,
  );
}

export async function captureDirectoryIdentity(
  logicalRole: string,
  target: string,
  expectations: DirectoryIdentityExpectations,
): Promise<HeldFilesystemObject> {
  return await HeldFilesystemObject.captureDirectory(
    logicalRole,
    target,
    expectations,
  );
}

export async function createExclusiveDirectoryIdentity(input: {
  readonly logicalRole: string;
  readonly parent: HeldFilesystemObject;
  readonly name: string;
  readonly mode: number;
  readonly expectedParentChildren: readonly string[];
}): Promise<HeldFilesystemObject> {
  if (input.parent.kind !== "directory") failIdentity();
  if (
    input.name.length === 0 ||
    input.name === "." ||
    input.name === ".." ||
    input.name.includes("/") ||
    input.name.includes("\\") ||
    input.name.includes("\0")
  ) {
    failIdentity();
  }
  const target = path.join(input.parent.absolutePath, input.name);
  await requireAbsent(target);
  await mkdir(target, { mode: input.mode });
  await chmod(target, input.mode);
  const held = await captureDirectoryIdentity(input.logicalRole, target, {
    mode: input.mode,
    owner: input.parent.owner(),
    children: [],
  });
  await input.parent.refreshDirectoryCheckpoint({
    mode: "captured",
    owner: input.parent.owner(),
    children: input.expectedParentChildren,
  });
  return held;
}

export async function createExclusiveFileIdentity(input: {
  readonly logicalRole: string;
  readonly parent: HeldFilesystemObject;
  readonly name: string;
  readonly mode: number;
  readonly bytes: Uint8Array;
  readonly expectedParentChildren: readonly string[];
}): Promise<HeldFilesystemObject> {
  if (input.parent.kind !== "directory") failIdentity();
  if (
    input.name.length === 0 ||
    input.name === "." ||
    input.name === ".." ||
    input.name.includes("/") ||
    input.name.includes("\\") ||
    input.name.includes("\0")
  ) {
    failIdentity();
  }
  const target = path.join(input.parent.absolutePath, input.name);
  const priorParentChildren = input.expectedParentChildren.filter(
    (entry) => entry !== input.name,
  );
  if (
    priorParentChildren.length + 1 !== input.expectedParentChildren.length ||
    input.expectedParentChildren.filter((entry) => entry === input.name)
      .length !== 1
  ) {
    failIdentity();
  }
  await input.parent.validateStable({
    mode: "captured",
    owner: input.parent.owner(),
    children: priorParentChildren,
  });
  await requireAbsent(target);
  let handle: FileHandle | null = null;
  try {
    assertFilesystemCapabilitiesForTest({
      noFollow: constants.O_NOFOLLOW,
      directory: constants.O_DIRECTORY,
      kind: "regular-file",
    });
    handle = await open(
      target,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_RDWR |
        constants.O_NOFOLLOW,
      input.mode,
    );
    await handle.writeFile(input.bytes);
    await handle.sync();
    const held = await HeldFilesystemObject.adoptCreatedFile(
      input.logicalRole,
      target,
      handle,
      {
        mode: input.mode,
        owner: input.parent.owner(),
        maximumBytes: input.bytes.byteLength,
        exactSize: BigInt(input.bytes.byteLength),
        content: "read",
        expectedBytes: input.bytes,
      },
    );
    await input.parent.syncDirectoryCheckpoint({
      mode: "captured",
      owner: input.parent.owner(),
      children: input.expectedParentChildren,
    });
    handle = null;
    return held;
  } catch (error) {
    if (handle !== null) await handle.close().catch(() => undefined);
    throw error;
  }
}

export class FilesystemIdentityLease {
  private closed = false;

  constructor(
    private readonly objects: readonly Readonly<{
      object: HeldFilesystemObject;
      expectations: FileIdentityExpectations | DirectoryIdentityExpectations;
    }>[],
  ) {
    for (let left = 0; left < objects.length; left += 1) {
      for (let right = left + 1; right < objects.length; right += 1) {
        if (objects[left]!.object.sameObjectAs(objects[right]!.object)) {
          failIdentity();
        }
      }
    }
  }

  async validate(): Promise<void> {
    if (this.closed) failIdentity();
    for (const entry of this.objects) {
      await entry.object.validateStable(entry.expectations);
    }
  }

  assertDistinctFrom(object: HeldFilesystemObject): void {
    if (this.closed) failIdentity();
    if (this.objects.some((entry) => entry.object.sameObjectAs(object))) {
      failIdentity();
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    let failed = false;
    for (const entry of [...this.objects].reverse()) {
      try {
        await entry.object.close();
      } catch {
        failed = true;
      }
    }
    if (failed) failIdentity();
  }
}

export async function canonicalExistingDirectory(
  target: string,
): Promise<string> {
  const canonical = await realpath(target);
  if (canonical !== target) failIdentity();
  return canonical;
}
