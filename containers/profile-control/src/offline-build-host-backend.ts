import { spawn, type ChildProcessByStdio } from "node:child_process";
import { constants } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import {
  FIXED_BASE_ENVIRONMENT_KEYS,
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_NODE_VERSION,
  FIXED_STAGING_DIGEST,
  FIXED_STAGING_FILES,
  LIMITS,
} from "./constants.js";
import {
  assertFixedImageBuildPlan,
  FIXED_DOCKER_EXECUTABLE,
  type DockerCommand,
  type FixedRuntimeLayout,
  type ImageBuildPlan,
} from "./docker-plan.js";
import type {
  FixedOfflineBuildBackend,
  OfflineBuildCommandStepId,
} from "./offline-build.js";
import {
  createOfflineBuildProcessState,
  observeOfflineBuildProcessFailure,
  observeOfflineBuildProcessOutput,
} from "./offline-build-process.js";
import {
  assertAcceptedImageStagingSnapshot,
  verifyAcceptedStagingFiles,
} from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  StagingFileCopy,
  StagingFilePath,
} from "./types.js";

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const DOCKER_CONFIG_JSON = '{"auths":{}}\n';
const CLOSE_GRACE_MS = 250;
const COMMAND_STEPS = Object.freeze([
  "doctor",
  "build",
  "inspect-image",
] as const);
const FIXTURE_FILES = Object.freeze([
  "canary.txt",
  "control-runner.mjs",
  "fixed-child.mjs",
] as const);

interface PathIdentity {
  readonly device: number;
  readonly inode: number;
}

function errnoCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

function sameIdentity(
  left: PathIdentity,
  right: Readonly<{ dev: number; ino: number }>,
): boolean {
  return left.device === right.dev && left.inode === right.ino;
}

async function directoryIdentity(
  target: string,
  expected?: PathIdentity,
  requirePrivate: boolean = false,
): Promise<PathIdentity> {
  const entry = await lstat(target);
  if (
    !entry.isDirectory() ||
    entry.isSymbolicLink() ||
    (requirePrivate && (entry.mode & 0o077) !== 0)
  ) {
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  if ((await realpath(target)) !== target) {
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  if (expected !== undefined && !sameIdentity(expected, entry)) {
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  return Object.freeze({ device: entry.dev, inode: entry.ino });
}

async function regularFileIdentity(
  target: string,
  expected?: PathIdentity,
  requirePrivate: boolean = false,
): Promise<PathIdentity> {
  const entry = await lstat(target);
  if (
    !entry.isFile() ||
    entry.isSymbolicLink() ||
    entry.nlink !== 1 ||
    (requirePrivate && (entry.mode & 0o077) !== 0) ||
    (expected !== undefined && !sameIdentity(expected, entry))
  ) {
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  return Object.freeze({ device: entry.dev, inode: entry.ino });
}

async function requireAbsent(target: string): Promise<void> {
  try {
    await lstat(target);
  } catch (error) {
    if (errnoCode(error) === "ENOENT") return;
    throw error;
  }
  throw new Error("M4_OFFLINE_BUILD_PATH");
}

async function createExclusiveDirectory(
  parent: string,
  name: string,
): Promise<Readonly<{ path: string; identity: PathIdentity }>> {
  await directoryIdentity(parent);
  const target = path.join(parent, name);
  await requireAbsent(target);
  await mkdir(target, { mode: 0o700 });
  return Object.freeze({
    path: target,
    identity: await directoryIdentity(target, undefined, true),
  });
}

async function ensureFixedDirectory(
  parent: string,
  name: string,
): Promise<Readonly<{ path: string; identity: PathIdentity }>> {
  await directoryIdentity(parent);
  const target = path.join(parent, name);
  try {
    return Object.freeze({
      path: target,
      identity: await directoryIdentity(target),
    });
  } catch (error) {
    if (errnoCode(error) !== "ENOENT") throw error;
    await mkdir(target, { mode: 0o700 });
    return Object.freeze({
      path: target,
      identity: await directoryIdentity(target),
    });
  }
}

async function readIdentityFile(
  target: string,
  identity: PathIdentity,
): Promise<Uint8Array> {
  const handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (
      !before.isFile() ||
      before.nlink !== 1 ||
      !sameIdentity(identity, before)
    ) {
      throw new Error("M4_OFFLINE_BUILD_PATH");
    }
    const bytes = Uint8Array.from(await handle.readFile());
    const after = await handle.stat();
    if (!sameIdentity(identity, after) || after.nlink !== 1) {
      throw new Error("M4_OFFLINE_BUILD_PATH");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

async function readRepositoryStagingFiles(
  repositoryRoot: string,
): Promise<readonly StagingFileCopy[]> {
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  await directoryIdentity(controlRoot);
  const files: StagingFileCopy[] = [];
  for (const logicalPath of FIXED_STAGING_FILES) {
    const target = path.join(controlRoot, logicalPath);
    const identity = await regularFileIdentity(target);
    files.push(
      Object.freeze({
        logicalPath,
        bytes: await readIdentityFile(target, identity),
      }),
    );
  }
  return Object.freeze(files);
}

function assertProductionSnapshot(
  input: AcceptedImageStagingSnapshot,
): AcceptedImageStagingSnapshot {
  const snapshot = assertAcceptedImageStagingSnapshot(input);
  if (
    snapshot.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    snapshot.nodeVersion !== FIXED_NODE_VERSION ||
    snapshot.stagingDigest !== FIXED_STAGING_DIGEST ||
    snapshot.baseEnvironmentKeys.length !==
      FIXED_BASE_ENVIRONMENT_KEYS.length ||
    snapshot.baseEnvironmentKeys.some(
      (key, index) => key !== FIXED_BASE_ENVIRONMENT_KEYS[index],
    )
  ) {
    throw new Error("M4_OFFLINE_BUILD_SNAPSHOT");
  }
  return snapshot;
}

function assertFixedLayout(
  layout: FixedRuntimeLayout,
  repositoryRoot: string,
): void {
  const runRoot = path.join(
    repositoryRoot,
    "results",
    "runs",
    "m4-profile-controls",
    layout.runId,
  );
  if (
    layout.profileId !== "permissive" ||
    layout.repositoryRoot !== repositoryRoot ||
    layout.runRoot !== runRoot ||
    layout.inputRoot !== path.join(runRoot, "input") ||
    layout.hostRoot !== path.join(runRoot, "host") ||
    layout.resultRoot !== path.join(runRoot, "container-result") ||
    layout.scratchRoot !== path.join(runRoot, "scratch") ||
    layout.dockerConfigRoot !== path.join(runRoot, "docker-config") ||
    layout.stagingRoot !== path.join(runRoot, "staging")
  ) {
    throw new Error("M4_OFFLINE_BUILD_LAYOUT");
  }
}

function exactNames(
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (
    actual.length !== expected.length ||
    [...actual]
      .sort()
      .some((entry, index) => entry !== [...expected].sort()[index])
  ) {
    throw new Error("M4_OFFLINE_BUILD_INVENTORY");
  }
}

class FixedOfflineBuildHostBackend implements FixedOfflineBuildBackend {
  private readonly fileIdentities = new Map<StagingFilePath, PathIdentity>();
  private fixtureIdentity: PathIdentity | null = null;
  private activeChildren = new Set<
    ChildProcessByStdio<null, Readable, Readable>
  >();
  private nextCommandIndex = 0;
  private staged = false;
  private closed = false;

  constructor(
    private readonly repositoryRoot: string,
    private readonly snapshot: AcceptedImageStagingSnapshot,
    private readonly plan: ImageBuildPlan,
    private readonly layout: FixedRuntimeLayout,
    private readonly runIdentity: PathIdentity,
    private readonly stagingIdentity: PathIdentity,
    private readonly dockerConfigIdentity: PathIdentity,
    private readonly configIdentity: PathIdentity,
  ) {}

  async stageBuildContext(
    files: readonly Readonly<{
      logicalPath: string;
      bytes: Uint8Array;
    }>[],
  ): Promise<void> {
    if (this.closed || this.staged || this.nextCommandIndex !== 0) {
      throw new Error("M4_OFFLINE_BUILD_STATE");
    }
    verifyAcceptedStagingFiles(this.snapshot, files);
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await directoryIdentity(
      this.layout.stagingRoot,
      this.stagingIdentity,
      true,
    );
    exactNames(await readdir(this.layout.stagingRoot), []);
    const fixture = await createExclusiveDirectory(
      this.layout.stagingRoot,
      "fixture",
    );
    this.fixtureIdentity = fixture.identity;
    for (const file of files) {
      const logicalPath = file.logicalPath as StagingFilePath;
      const parent = logicalPath.startsWith("fixture/")
        ? fixture.path
        : this.layout.stagingRoot;
      const baseName = path.basename(logicalPath);
      await directoryIdentity(
        parent,
        logicalPath.startsWith("fixture/")
          ? fixture.identity
          : this.stagingIdentity,
        true,
      );
      const target = path.join(parent, baseName);
      await requireAbsent(target);
      await writeFile(target, file.bytes, {
        flag: "wx",
        mode: 0o600,
      });
      const identity = await regularFileIdentity(target, undefined, true);
      const readBack = await readIdentityFile(target, identity);
      if (!equalBytes(readBack, file.bytes)) {
        throw new Error("M4_OFFLINE_BUILD_BYTES");
      }
      this.fileIdentities.set(logicalPath, identity);
    }
    verifyAcceptedStagingFiles(this.snapshot, await this.readBuildContext());
    this.staged = true;
  }

  async readBuildContext(): Promise<unknown> {
    if (this.closed) throw new Error("M4_OFFLINE_BUILD_STATE");
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await directoryIdentity(
      this.layout.stagingRoot,
      this.stagingIdentity,
      true,
    );
    if (this.fixtureIdentity === null) {
      throw new Error("M4_OFFLINE_BUILD_STATE");
    }
    await directoryIdentity(
      path.join(this.layout.stagingRoot, "fixture"),
      this.fixtureIdentity,
      true,
    );
    exactNames(await readdir(this.layout.stagingRoot), [
      "Containerfile",
      "fixture",
    ]);
    exactNames(
      await readdir(path.join(this.layout.stagingRoot, "fixture")),
      FIXTURE_FILES,
    );
    const files = [];
    for (const logicalPath of FIXED_STAGING_FILES) {
      const identity = this.fileIdentities.get(logicalPath);
      if (identity === undefined) {
        throw new Error("M4_OFFLINE_BUILD_INVENTORY");
      }
      const target = path.join(this.layout.stagingRoot, logicalPath);
      await regularFileIdentity(target, identity, true);
      files.push(
        Object.freeze({
          logicalPath,
          bytes: await readIdentityFile(target, identity),
        }),
      );
    }
    return Object.freeze(files);
  }

  async run(
    stepId: OfflineBuildCommandStepId,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    const expectedStep = COMMAND_STEPS[this.nextCommandIndex];
    const expectedCommand =
      expectedStep === "doctor"
        ? this.plan.doctor
        : expectedStep === "build"
          ? this.plan.build
          : expectedStep === "inspect-image"
            ? this.plan.inspectImage
            : null;
    if (
      this.closed ||
      !this.staged ||
      stepId !== expectedStep ||
      command !== expectedCommand ||
      command.executable !== FIXED_DOCKER_EXECUTABLE ||
      command.environment.DOCKER_CONFIG !== this.layout.dockerConfigRoot ||
      command.shell !== false ||
      limits.timeoutMs !== LIMITS.controlTimeoutMs ||
      limits.outputBytes !== LIMITS.outputBytes
    ) {
      throw new Error("M4_OFFLINE_BUILD_COMMAND");
    }
    this.nextCommandIndex += 1;
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await directoryIdentity(
      this.layout.dockerConfigRoot,
      this.dockerConfigIdentity,
      true,
    );
    const configPath = path.join(this.layout.dockerConfigRoot, "config.json");
    await regularFileIdentity(configPath, this.configIdentity, true);
    const configBytes = await readIdentityFile(configPath, this.configIdentity);
    if (
      !equalBytes(configBytes, new TextEncoder().encode(DOCKER_CONFIG_JSON))
    ) {
      throw new Error("M4_OFFLINE_BUILD_CONFIG");
    }
    return await this.spawnFixedCommand(stepId, command, limits);
  }

  private async spawnFixedCommand(
    stepId: OfflineBuildCommandStepId,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    return await new Promise((resolve, reject) => {
      let child: ChildProcessByStdio<null, Readable, Readable>;
      try {
        child = spawn(command.executable, command.arguments, {
          cwd: this.repositoryRoot,
          env: Object.freeze({ DOCKER_CONFIG: this.layout.dockerConfigRoot }),
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });
      } catch (error) {
        reject(error);
        return;
      }
      this.activeChildren.add(child);
      const stdoutChunks: Uint8Array[] = [];
      let processState = createOfflineBuildProcessState();
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      let closeGrace: ReturnType<typeof setTimeout> | null = null;
      const settle = (
        exitCode: number | null,
        closeObserved: boolean,
      ): void => {
        if (settled) return;
        settled = true;
        if (timeout !== null) clearTimeout(timeout);
        if (closeGrace !== null) clearTimeout(closeGrace);
        if (closeObserved) this.activeChildren.delete(child);
        resolve({
          exitCode: processState.firstFailure === null ? exitCode : null,
          timedOut: processState.firstFailure === "timeout",
          outputLimitExceeded: processState.firstFailure === "output-limit",
          closeObserved,
          stdoutBytes: processState.stdoutBytes,
          stderrBytes: processState.stderrBytes,
          stdout:
            stepId === "build" || processState.firstFailure !== null
              ? new Uint8Array()
              : Uint8Array.from(
                  Buffer.concat(
                    stdoutChunks.map((chunk) => Buffer.from(chunk)),
                    processState.stdoutBytes,
                  ),
                ),
        });
      };
      const stop = (): void => {
        if (!child.killed) child.kill("SIGKILL");
        closeGrace ??= setTimeout(() => settle(null, false), CLOSE_GRACE_MS);
      };
      const count = (chunk: Buffer, stdout: boolean): void => {
        const previousFailure = processState.firstFailure;
        processState = observeOfflineBuildProcessOutput(
          processState,
          stdout ? "stdout" : "stderr",
          chunk.byteLength,
          limits.outputBytes,
        );
        if (
          stdout &&
          stepId !== "build" &&
          processState.firstFailure === null
        ) {
          stdoutChunks.push(Uint8Array.from(chunk));
        }
        if (previousFailure === null && processState.firstFailure !== null) {
          stdoutChunks.length = 0;
          stop();
        }
      };
      child.stdout.on("data", (chunk: Buffer) => count(chunk, true));
      child.stderr.on("data", (chunk: Buffer) => count(chunk, false));
      child.once("error", () => {
        const previousFailure = processState.firstFailure;
        processState = observeOfflineBuildProcessFailure(
          processState,
          "process-error",
        );
        if (previousFailure === null) {
          stdoutChunks.length = 0;
          stop();
        }
      });
      child.once("close", (exitCode) => settle(exitCode, true));
      timeout = setTimeout(() => {
        const previousFailure = processState.firstFailure;
        processState = observeOfflineBuildProcessFailure(
          processState,
          "timeout",
        );
        if (previousFailure === null) {
          stdoutChunks.length = 0;
          stop();
        }
      }, limits.timeoutMs);
    });
  }

  async cleanup(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (this.activeChildren.size !== 0) {
      throw new Error("M4_OFFLINE_BUILD_PROCESS_STATE");
    }
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await directoryIdentity(
      this.layout.stagingRoot,
      this.stagingIdentity,
      true,
    );
    if (this.fixtureIdentity !== null) {
      await directoryIdentity(
        path.join(this.layout.stagingRoot, "fixture"),
        this.fixtureIdentity,
        true,
      );
      for (const logicalPath of [...FIXED_STAGING_FILES].reverse()) {
        const identity = this.fileIdentities.get(logicalPath);
        if (identity === undefined) continue;
        const target = path.join(this.layout.stagingRoot, logicalPath);
        await regularFileIdentity(target, identity, true);
        await unlink(target);
      }
      exactNames(
        await readdir(path.join(this.layout.stagingRoot, "fixture")),
        [],
      );
      await rmdir(path.join(this.layout.stagingRoot, "fixture"));
    }
    exactNames(await readdir(this.layout.stagingRoot), []);
    await rmdir(this.layout.stagingRoot);
    await directoryIdentity(
      this.layout.dockerConfigRoot,
      this.dockerConfigIdentity,
      true,
    );
    const configPath = path.join(this.layout.dockerConfigRoot, "config.json");
    await regularFileIdentity(configPath, this.configIdentity, true);
    await unlink(configPath);
    exactNames(await readdir(this.layout.dockerConfigRoot), []);
    await rmdir(this.layout.dockerConfigRoot);
    exactNames(await readdir(this.layout.runRoot), []);
    await rmdir(this.layout.runRoot);
  }
}

export async function createFixedOfflineBuildHostBackend(input: {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly imageBuildPlan: ImageBuildPlan;
  readonly layout: FixedRuntimeLayout;
}): Promise<FixedOfflineBuildBackend> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  const snapshot = assertProductionSnapshot(input.acceptedSnapshot);
  assertFixedLayout(input.layout, repositoryRoot);
  const plan = assertFixedImageBuildPlan(
    input.imageBuildPlan,
    snapshot,
    input.layout,
  );
  const repositoryFiles = await readRepositoryStagingFiles(repositoryRoot);
  verifyAcceptedStagingFiles(snapshot, repositoryFiles);
  const resultsRoot = path.join(repositoryRoot, "results");
  const runsRoot = path.join(resultsRoot, "runs");
  await directoryIdentity(resultsRoot);
  await directoryIdentity(runsRoot);
  const m4Root = (await ensureFixedDirectory(runsRoot, "m4-profile-controls"))
    .path;
  const run = await createExclusiveDirectory(m4Root, input.layout.runId);
  let staging: Readonly<{ path: string; identity: PathIdentity }> | undefined;
  let dockerConfig:
    Readonly<{ path: string; identity: PathIdentity }> | undefined;
  try {
    staging = await createExclusiveDirectory(run.path, "staging");
    dockerConfig = await createExclusiveDirectory(run.path, "docker-config");
    const configPath = path.join(dockerConfig.path, "config.json");
    await writeFile(configPath, DOCKER_CONFIG_JSON, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    const configIdentity = await regularFileIdentity(
      configPath,
      undefined,
      true,
    );
    if (
      !equalBytes(
        await readIdentityFile(configPath, configIdentity),
        new TextEncoder().encode(DOCKER_CONFIG_JSON),
      )
    ) {
      throw new Error("M4_OFFLINE_BUILD_CONFIG");
    }
    return new FixedOfflineBuildHostBackend(
      repositoryRoot,
      snapshot,
      plan,
      input.layout,
      run.identity,
      staging.identity,
      dockerConfig.identity,
      configIdentity,
    );
  } catch (error) {
    try {
      if (dockerConfig !== undefined) {
        await directoryIdentity(dockerConfig.path, dockerConfig.identity, true);
        const entries = await readdir(dockerConfig.path);
        if (entries.length === 1 && entries[0] === "config.json") {
          const configPath = path.join(dockerConfig.path, "config.json");
          const identity = await regularFileIdentity(
            configPath,
            undefined,
            true,
          );
          const bytes = await readIdentityFile(configPath, identity);
          if (equalBytes(bytes, new TextEncoder().encode(DOCKER_CONFIG_JSON))) {
            await unlink(configPath);
          }
        }
        exactNames(await readdir(dockerConfig.path), []);
        await rmdir(dockerConfig.path);
      }
      if (staging !== undefined) {
        await directoryIdentity(staging.path, staging.identity, true);
        exactNames(await readdir(staging.path), []);
        await rmdir(staging.path);
      }
      await directoryIdentity(run.path, run.identity, true);
      exactNames(await readdir(run.path), []);
      await rmdir(run.path);
    } catch {
      // Unsafe or replaced initialization state is retained fail closed.
    }
    throw error;
  }
}
