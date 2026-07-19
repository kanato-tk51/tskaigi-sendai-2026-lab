import { constants as fsConstants, type Stats } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  open,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

import {
  ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH,
  ARTIFACT_DEMO_ARTIFACT_SCHEMA_VERSION,
  ARTIFACT_DEMO_BUILD_ID,
  ARTIFACT_DEMO_BUILDER_VERSION,
  ARTIFACT_DEMO_COMMAND_ID,
  ARTIFACT_DEMO_LIMITATION,
  ARTIFACT_DEMO_LOCKFILE_LOGICAL_PATH,
  ARTIFACT_DEMO_NETWORK_LIMITATION,
  ARTIFACT_DEMO_RESULT_SCHEMA_VERSION,
  ARTIFACT_DEMO_SCHEMA_VERSION,
  ARTIFACT_DEMO_SOURCE_LOGICAL_PATH,
  ARTIFACT_DEMO_SOURCE_TREE_SCHEMA_VERSION,
  ARTIFACT_DEMO_UNSIGNED_LIMITATION,
  ArtifactDemoError,
  canonicalJson,
  parseArtifactDemoReceipt,
  serializeArtifactDemoReceipt,
  serializeArtifactDemoResult,
  sha256,
} from "./artifact-demo-contract.js";
import type {
  ArtifactDemoReceipt,
  ArtifactDemoResult,
} from "./artifact-demo-contract.js";

const SOURCE_MAX_BYTES = 4 * 1024;
const LOCKFILE_MAX_BYTES = 2 * 1024 * 1024;
const ARTIFACT_MAX_BYTES = 16 * 1024;
const RECEIPT_MAX_BYTES = 16 * 1024;

const BUILD_DIRECTORY = "build";
const HANDOFF_DIRECTORY = "handoff";
const VERIFICATION_DIRECTORY = "verification";
const DEPLOYMENT_DIRECTORY = "deployment";
const TAMPER_DIRECTORY = "tamper";
const TAMPER_DEPLOYMENT_DIRECTORY = "tamper-deployment";
const INVOCATION_MARKER = "invocation-1.json";
const ARTIFACT_FILE = "presentation.json";
const RECEIPT_FILE = "receipt.json";
const RESULT_FILE = "result.json";

export interface ArtifactDemoPaths {
  readonly repositoryRoot: string;
  readonly sourcePath: string;
  readonly lockfilePath: string;
  readonly runRoot: string;
}

export interface ArtifactBuildContext {
  readonly nodeVersion: string;
  readonly forwardedEnvironmentVariableCount: number;
}

export type ArtifactBuildInvoker = (paths: ArtifactDemoPaths) => Promise<void>;

function fail(code: ConstructorParameters<typeof ArtifactDemoError>[0]): never {
  throw new ArtifactDemoError(code);
}

function isWithin(root: string, target: string): boolean {
  const pathFromRoot = relative(resolve(root), resolve(target));
  return (
    pathFromRoot === "" ||
    (pathFromRoot !== ".." &&
      !pathFromRoot.startsWith("../") &&
      !pathFromRoot.startsWith("..\\") &&
      !isAbsolute(pathFromRoot))
  );
}

function assertWithin(root: string, target: string): void {
  const pathFromRoot = relative(resolve(root), resolve(target));
  if (
    pathFromRoot === "" ||
    pathFromRoot === ".." ||
    pathFromRoot.startsWith("../") ||
    pathFromRoot.startsWith("..\\") ||
    resolve(root, pathFromRoot) !== resolve(target)
  ) {
    fail("P3_INPUT_INVALID");
  }
}

function sameIdentity(before: Stats, after: Stats): boolean {
  return (
    before.dev === after.dev &&
    before.ino === after.ino &&
    before.size === after.size &&
    before.mode === after.mode
  );
}

async function readRegularFile(
  filePath: string,
  maximumBytes: number,
  errorCode: "P3_INPUT_INVALID" | "P3_PIPELINE_INVALID" | "P3_RECEIPT_INVALID",
): Promise<Uint8Array> {
  let handle;
  try {
    const before = await lstat(filePath);
    if (!before.isFile() || before.isSymbolicLink()) fail(errorCode);
    handle = await open(
      filePath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
    const opened = await handle.stat();
    if (
      !opened.isFile() ||
      !sameIdentity(before, opened) ||
      opened.size < 1 ||
      opened.size > maximumBytes
    ) {
      fail(errorCode);
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (!sameIdentity(opened, after) || bytes.byteLength !== after.size) {
      fail(errorCode);
    }
    return bytes;
  } catch (error) {
    if (error instanceof ArtifactDemoError) throw error;
    return fail(errorCode);
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

async function writeExclusive(
  filePath: string,
  bytes: Uint8Array,
  errorCode: "P3_BUILD_ALREADY_INVOKED" | "P3_OUTPUT_EXISTS",
): Promise<void> {
  try {
    await writeFile(filePath, bytes, { flag: "wx", mode: 0o600 });
  } catch {
    fail(errorCode);
  }
}

async function makeExclusiveDirectory(
  directory: string,
  errorCode: "P3_BUILD_ALREADY_INVOKED" | "P3_OUTPUT_EXISTS",
): Promise<void> {
  try {
    await mkdir(directory, { mode: 0o700 });
  } catch {
    fail(errorCode);
  }
}

async function copyExclusive(source: string, target: string): Promise<void> {
  try {
    await copyFile(source, target, fsConstants.COPYFILE_EXCL);
  } catch {
    fail("P3_OUTPUT_EXISTS");
  }
}

function decodeSource(bytes: Uint8Array): string {
  let source: string;
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return fail("P3_INPUT_INVALID");
  }
  const hasDisallowedControl = [...source].some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint !== undefined &&
      ((codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a) ||
        codePoint === 0x7f)
    );
  });
  if (!source.endsWith("\n") || source.length < 2 || hasDisallowedControl) {
    return fail("P3_INPUT_INVALID");
  }
  return source.slice(0, -1);
}

function createArtifactBytes(sourceBytes: Uint8Array): Uint8Array {
  return canonicalJson({
    schemaVersion: ARTIFACT_DEMO_ARTIFACT_SCHEMA_VERSION,
    sourceSha256: sha256(sourceBytes),
    message: decodeSource(sourceBytes),
  });
}

function createSourceTreeDigest(sourceBytes: Uint8Array): string {
  return sha256(
    canonicalJson({
      schemaVersion: ARTIFACT_DEMO_SOURCE_TREE_SCHEMA_VERSION,
      files: [
        {
          logicalPath: ARTIFACT_DEMO_SOURCE_LOGICAL_PATH,
          sha256: sha256(sourceBytes),
          byteSize: sourceBytes.byteLength,
        },
      ],
    }),
  );
}

function createReceipt(
  sourceBytes: Uint8Array,
  lockfileBytes: Uint8Array,
  artifactBytes: Uint8Array,
  context: ArtifactBuildContext,
): ArtifactDemoReceipt {
  if (
    context.forwardedEnvironmentVariableCount !== 0 ||
    !/^v\d+\.\d+\.\d+$/u.test(context.nodeVersion)
  ) {
    fail("P3_ENVIRONMENT_NOT_EMPTY");
  }
  return Object.freeze({
    schemaVersion: ARTIFACT_DEMO_SCHEMA_VERSION,
    buildId: ARTIFACT_DEMO_BUILD_ID,
    commandId: ARTIFACT_DEMO_COMMAND_ID,
    invocationCount: 1,
    source: Object.freeze({
      kind: "dirty-tree-digest",
      digest: createSourceTreeDigest(sourceBytes),
      input: Object.freeze({
        logicalPath: ARTIFACT_DEMO_SOURCE_LOGICAL_PATH,
        sha256: sha256(sourceBytes),
        byteSize: sourceBytes.byteLength,
      }),
    }),
    lockfile: Object.freeze({
      logicalPath: ARTIFACT_DEMO_LOCKFILE_LOGICAL_PATH,
      sha256: sha256(lockfileBytes),
    }),
    tools: Object.freeze({
      node: context.nodeVersion,
      builder: ARTIFACT_DEMO_BUILDER_VERSION,
    }),
    buildEnvironment: Object.freeze({
      forwardedEnvironmentVariableCount: 0,
      externalNetworkPolicy: "prohibited",
    }),
    artifact: Object.freeze({
      logicalPath: ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH,
      sha256: sha256(artifactBytes),
      byteSize: artifactBytes.byteLength,
    }),
    limitations: Object.freeze([
      ARTIFACT_DEMO_LIMITATION,
      ARTIFACT_DEMO_UNSIGNED_LIMITATION,
      ARTIFACT_DEMO_NETWORK_LIMITATION,
    ] as const),
  });
}

function artifactPath(directory: string): string {
  return join(directory, ARTIFACT_FILE);
}

function receiptPath(directory: string): string {
  return join(directory, RECEIPT_FILE);
}

async function assertRunRoot(paths: ArtifactDemoPaths): Promise<void> {
  assertWithin(paths.repositoryRoot, paths.runRoot);
  try {
    const canonicalRepositoryRoot = await realpath(paths.repositoryRoot);
    const canonicalRunRoot = await realpath(paths.runRoot);
    if (
      canonicalRepositoryRoot !== resolve(paths.repositoryRoot) ||
      canonicalRunRoot !== resolve(paths.runRoot) ||
      !isWithin(canonicalRepositoryRoot, canonicalRunRoot)
    ) {
      fail("P3_PIPELINE_INVALID");
    }
    const state = await lstat(paths.runRoot);
    if (!state.isDirectory() || state.isSymbolicLink()) {
      fail("P3_PIPELINE_INVALID");
    }
  } catch (error) {
    if (error instanceof ArtifactDemoError) throw error;
    fail("P3_PIPELINE_INVALID");
  }
}

async function ensureOwnedDirectoryChain(
  repositoryRoot: string,
  targetDirectory: string,
): Promise<void> {
  assertWithin(repositoryRoot, targetDirectory);
  const canonicalRepositoryRoot = await realpath(repositoryRoot);
  if (canonicalRepositoryRoot !== resolve(repositoryRoot)) {
    fail("P3_INPUT_INVALID");
  }
  const components = relative(repositoryRoot, targetDirectory)
    .split(/[\\/]/u)
    .filter((component) => component.length > 0);
  let current = repositoryRoot;
  for (const component of components) {
    current = join(current, component);
    await mkdir(current, { mode: 0o700 }).catch(() => undefined);
    const state = await lstat(current);
    if (!state.isDirectory() || state.isSymbolicLink()) {
      fail("P3_INPUT_INVALID");
    }
    const canonicalCurrent = await realpath(current);
    if (
      canonicalCurrent !== resolve(current) ||
      !isWithin(canonicalRepositoryRoot, canonicalCurrent)
    ) {
      fail("P3_INPUT_INVALID");
    }
  }
}

async function assertCanonicalOwnedInput(
  repositoryRoot: string,
  inputPath: string,
): Promise<void> {
  const canonicalRepositoryRoot = await realpath(repositoryRoot);
  const canonicalInput = await realpath(inputPath);
  if (
    canonicalRepositoryRoot !== resolve(repositoryRoot) ||
    canonicalInput !== resolve(inputPath) ||
    !isWithin(canonicalRepositoryRoot, canonicalInput)
  ) {
    fail("P3_INPUT_INVALID");
  }
}

export async function prepareArtifactDemoRun(
  paths: ArtifactDemoPaths,
): Promise<void> {
  assertWithin(paths.repositoryRoot, paths.sourcePath);
  assertWithin(paths.repositoryRoot, paths.lockfilePath);
  assertWithin(paths.repositoryRoot, paths.runRoot);
  try {
    await realpath(paths.repositoryRoot);
    await ensureOwnedDirectoryChain(
      paths.repositoryRoot,
      dirname(paths.runRoot),
    );
    await mkdir(paths.runRoot, { mode: 0o700 });
  } catch (error) {
    if (error instanceof ArtifactDemoError) throw error;
    fail("P3_RUN_ROOT_EXISTS");
  }
}

export async function buildPreparedArtifact(
  paths: ArtifactDemoPaths,
  context: ArtifactBuildContext,
): Promise<void> {
  await assertRunRoot(paths);
  const buildRoot = join(paths.runRoot, BUILD_DIRECTORY);
  const handoffRoot = join(paths.runRoot, HANDOFF_DIRECTORY);
  await makeExclusiveDirectory(buildRoot, "P3_BUILD_ALREADY_INVOKED");
  await makeExclusiveDirectory(handoffRoot, "P3_OUTPUT_EXISTS");
  await writeExclusive(
    join(buildRoot, INVOCATION_MARKER),
    canonicalJson({
      buildId: ARTIFACT_DEMO_BUILD_ID,
      commandId: ARTIFACT_DEMO_COMMAND_ID,
      invocation: 1,
    }),
    "P3_BUILD_ALREADY_INVOKED",
  );

  await assertCanonicalOwnedInput(paths.repositoryRoot, paths.sourcePath);
  await assertCanonicalOwnedInput(paths.repositoryRoot, paths.lockfilePath);
  const sourceBytes = await readRegularFile(
    paths.sourcePath,
    SOURCE_MAX_BYTES,
    "P3_INPUT_INVALID",
  );
  const lockfileBytes = await readRegularFile(
    paths.lockfilePath,
    LOCKFILE_MAX_BYTES,
    "P3_INPUT_INVALID",
  );
  const artifactBytes = createArtifactBytes(sourceBytes);
  const receipt = createReceipt(
    sourceBytes,
    lockfileBytes,
    artifactBytes,
    context,
  );
  await writeExclusive(
    artifactPath(handoffRoot),
    artifactBytes,
    "P3_OUTPUT_EXISTS",
  );
  await writeExclusive(
    receiptPath(handoffRoot),
    serializeArtifactDemoReceipt(receipt),
    "P3_OUTPUT_EXISTS",
  );
}

async function verifyDirectory(
  directory: string,
): Promise<ArtifactDemoReceipt> {
  const receiptBytes = await readRegularFile(
    receiptPath(directory),
    RECEIPT_MAX_BYTES,
    "P3_RECEIPT_INVALID",
  );
  const receipt = parseArtifactDemoReceipt(receiptBytes);
  const artifactBytes = await readRegularFile(
    artifactPath(directory),
    ARTIFACT_MAX_BYTES,
    "P3_PIPELINE_INVALID",
  );
  if (
    artifactBytes.byteLength !== receipt.artifact.byteSize ||
    sha256(artifactBytes) !== receipt.artifact.sha256
  ) {
    fail("P3_ARTIFACT_DIGEST_MISMATCH");
  }
  return receipt;
}

async function mutateExactlyOneByte(filePath: string): Promise<void> {
  let handle;
  try {
    handle = await open(filePath, fsConstants.O_RDWR | fsConstants.O_NOFOLLOW);
    const before = await handle.stat();
    if (
      !before.isFile() ||
      before.size < 1 ||
      before.size > ARTIFACT_MAX_BYTES
    ) {
      fail("P3_PIPELINE_INVALID");
    }
    const byte = Buffer.alloc(1);
    const readResult = await handle.read(byte, 0, 1, 0);
    if (readResult.bytesRead !== 1) fail("P3_PIPELINE_INVALID");
    byte[0] = (byte[0] ?? 0) ^ 1;
    const writeResult = await handle.write(byte, 0, 1, 0);
    if (writeResult.bytesWritten !== 1) fail("P3_PIPELINE_INVALID");
    await handle.sync();
    const after = await handle.stat();
    if (!sameIdentity(before, after)) fail("P3_PIPELINE_INVALID");
  } catch (error) {
    if (error instanceof ArtifactDemoError) throw error;
    fail("P3_PIPELINE_INVALID");
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

export async function completePreparedArtifactDemo(
  paths: ArtifactDemoPaths,
): Promise<ArtifactDemoResult> {
  await assertRunRoot(paths);
  const handoffRoot = join(paths.runRoot, HANDOFF_DIRECTORY);
  const verificationRoot = join(paths.runRoot, VERIFICATION_DIRECTORY);
  await makeExclusiveDirectory(verificationRoot, "P3_OUTPUT_EXISTS");
  await copyExclusive(
    artifactPath(handoffRoot),
    artifactPath(verificationRoot),
  );
  await copyExclusive(receiptPath(handoffRoot), receiptPath(verificationRoot));
  const receipt = await verifyDirectory(verificationRoot);

  const deploymentRoot = join(paths.runRoot, DEPLOYMENT_DIRECTORY);
  await makeExclusiveDirectory(deploymentRoot, "P3_OUTPUT_EXISTS");
  await copyExclusive(
    artifactPath(verificationRoot),
    artifactPath(deploymentRoot),
  );
  const deployedBytes = await readRegularFile(
    artifactPath(deploymentRoot),
    ARTIFACT_MAX_BYTES,
    "P3_PIPELINE_INVALID",
  );
  if (sha256(deployedBytes) !== receipt.artifact.sha256) {
    fail("P3_ARTIFACT_DIGEST_MISMATCH");
  }

  const tamperRoot = join(paths.runRoot, TAMPER_DIRECTORY);
  await makeExclusiveDirectory(tamperRoot, "P3_OUTPUT_EXISTS");
  await copyExclusive(artifactPath(verificationRoot), artifactPath(tamperRoot));
  await copyExclusive(receiptPath(verificationRoot), receiptPath(tamperRoot));
  await mutateExactlyOneByte(artifactPath(tamperRoot));
  try {
    await verifyDirectory(tamperRoot);
    fail("P3_TAMPER_NOT_REJECTED");
  } catch (error) {
    if (
      !(error instanceof ArtifactDemoError) ||
      error.code !== "P3_ARTIFACT_DIGEST_MISMATCH"
    ) {
      throw error;
    }
  }

  try {
    await lstat(join(paths.runRoot, TAMPER_DEPLOYMENT_DIRECTORY));
    fail("P3_TAMPER_NOT_REJECTED");
  } catch (error) {
    if (error instanceof ArtifactDemoError) throw error;
  }

  const receiptBytes = await readRegularFile(
    receiptPath(verificationRoot),
    RECEIPT_MAX_BYTES,
    "P3_RECEIPT_INVALID",
  );
  const result: ArtifactDemoResult = Object.freeze({
    schemaVersion: ARTIFACT_DEMO_RESULT_SCHEMA_VERSION,
    buildId: ARTIFACT_DEMO_BUILD_ID,
    commandId: ARTIFACT_DEMO_COMMAND_ID,
    buildInvocationCount: 1,
    artifactSha256: receipt.artifact.sha256,
    receiptSha256: sha256(receiptBytes),
    verification: Object.freeze({
      outcome: "verified",
      operations: Object.freeze(["digest"] as const),
    }),
    deployment: Object.freeze({
      outcome: "copied",
      operations: Object.freeze(["copy", "post-copy-digest"] as const),
      buildInvocations: 0,
    }),
    tamper: Object.freeze({
      mutation: "one-byte",
      outcome: "rejected-before-copy",
      errorCode: "P3_ARTIFACT_DIGEST_MISMATCH",
      deployStarted: false,
    }),
    limitations: receipt.limitations,
  });
  await writeExclusive(
    join(paths.runRoot, RESULT_FILE),
    serializeArtifactDemoResult(result),
    "P3_OUTPUT_EXISTS",
  );
  return result;
}

export async function runArtifactDemo(
  paths: ArtifactDemoPaths,
  invokeBuild: ArtifactBuildInvoker,
): Promise<ArtifactDemoResult> {
  await prepareArtifactDemoRun(paths);
  await invokeBuild(paths);
  return completePreparedArtifactDemo(paths);
}
