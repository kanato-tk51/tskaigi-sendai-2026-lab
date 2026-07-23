import { spawn, type ChildProcessByStdio } from "node:child_process";
import { mkdir, readdir, realpath } from "node:fs/promises";
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
import {
  captureDirectoryIdentity,
  captureFileIdentity,
  createExclusiveFileIdentity,
  type FileIdentityExpectations,
  FilesystemIdentityLease,
  type DirectoryIdentityExpectations,
  type HeldFilesystemObject,
  type PrivateOwner,
  requireAbsent,
} from "./filesystem-identity.js";
import { FIXED_RETAINED_STATE_INVENTORY } from "./offline-build-recovery-host-backend.js";
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
type DockerConfigurationCheckpoint = "config-only" | "doctor" | "build";

const RUNTIME_CONFIGURATION_SPECIFICATIONS = Object.freeze(
  FIXED_RETAINED_STATE_INVENTORY.filter(
    (entry) =>
      entry.relativePath !== "" && entry.relativePath !== "docker-config",
  ),
);
const RUNTIME_CONFIGURATION_CLEANUP_ORDER = Object.freeze([
  "docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva",
  "docker-config/buildx/refs/default/default",
  "docker-config/buildx/refs/default",
  "docker-config/buildx/refs",
  "docker-config/buildx/instances",
  "docker-config/buildx/defaults",
  "docker-config/buildx/activity/default",
  "docker-config/buildx/activity",
  "docker-config/buildx/.lock",
  "docker-config/buildx/.buildNodeID",
  "docker-config/buildx",
  "docker-config/.token_seed.lock",
  "docker-config/.token_seed",
] as const);

type PathIdentity = HeldFilesystemObject;

async function directoryIdentity(
  target: string,
  expected?: PathIdentity,
  requirePrivate: boolean = false,
): Promise<PathIdentity> {
  const expectations = Object.freeze({
    mode: requirePrivate ? 0o700 : ("captured" as const),
    ...(expected === undefined ? {} : { owner: expected.owner() }),
    children: Object.freeze(await readdir(target)),
  });
  if (expected !== undefined) {
    await expected.validateStable(expectations);
    return expected;
  }
  return await captureDirectoryIdentity(target, target, expectations);
}

async function regularFileIdentity(
  target: string,
  expected?: PathIdentity,
  requirePrivate: boolean = false,
): Promise<PathIdentity> {
  const expectations: FileIdentityExpectations = Object.freeze({
    mode: requirePrivate ? 0o600 : "captured",
    ...(expected === undefined ? {} : { owner: expected.owner() }),
    maximumBytes: 1_048_576,
    content: "read",
  });
  if (expected !== undefined) {
    await expected.validateStable(expectations);
    return expected;
  }
  return await captureFileIdentity(target, target, expectations);
}

async function readIdentityFile(
  _target: string,
  identity: PathIdentity,
): Promise<Uint8Array> {
  return await identity.readBytes(1_048_576);
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

async function readRepositoryStagingFiles(repositoryRoot: string): Promise<
  Readonly<{
    files: readonly StagingFileCopy[];
    lease: FilesystemIdentityLease;
  }>
> {
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  const held: Array<{
    object: HeldFilesystemObject;
    expectations: FileIdentityExpectations | DirectoryIdentityExpectations;
  }> = [];
  for (const [logicalRole, target] of [
    ["repository-root", repositoryRoot],
    ["repository-containers-root", path.join(repositoryRoot, "containers")],
    ["profile-control-source-root", controlRoot],
    ["profile-control-fixture-root", path.join(controlRoot, "fixture")],
  ] as const) {
    const expectations = Object.freeze({
      mode: "captured" as const,
      children: Object.freeze(await readdir(target)),
    });
    held.push({
      object: await captureDirectoryIdentity(logicalRole, target, expectations),
      expectations,
    });
  }
  const files: StagingFileCopy[] = [];
  for (const logicalPath of FIXED_STAGING_FILES) {
    const target = path.join(controlRoot, logicalPath);
    const expectations: FileIdentityExpectations = Object.freeze({
      mode: "captured",
      maximumBytes: 1_048_576,
      content: "read",
    });
    const identity = await captureFileIdentity(
      `staging-source:${logicalPath}`,
      target,
      expectations,
    );
    held.push({ object: identity, expectations });
    files.push(
      Object.freeze({
        logicalPath,
        bytes: await readIdentityFile(target, identity),
      }),
    );
  }
  const lease = new FilesystemIdentityLease(held);
  await lease.validate();
  return Object.freeze({ files: Object.freeze(files), lease });
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
  private configurationCheckpoint: DockerConfigurationCheckpoint =
    "config-only";
  private configurationValid = true;
  private invalidStateCode = "M4_OFFLINE_BUILD_CONFIG";
  private readonly runtimeConfigurationIdentities = new Map<
    string,
    HeldFilesystemObject
  >();
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
    private readonly repositoryLease: FilesystemIdentityLease,
    private readonly runAncestorLease: FilesystemIdentityLease,
    private readonly m4RootIdentity: HeldFilesystemObject,
    private readonly initialM4Children: readonly string[],
    private readonly relaxSharedTestAncestor: boolean,
  ) {
    const runOwner = this.runIdentity.owner();
    for (const object of [
      this.stagingIdentity,
      this.dockerConfigIdentity,
      this.configIdentity,
    ]) {
      const owner = object.owner();
      if (owner.uid !== runOwner.uid || owner.gid !== runOwner.gid) {
        throw new Error("M4_OFFLINE_BUILD_PATH");
      }
    }
  }

  private runOwner(): PrivateOwner {
    return this.runIdentity.owner();
  }

  private async validateConfigurationCheckpoint(
    expected: DockerConfigurationCheckpoint,
    allowSettledMutation: boolean,
  ): Promise<void> {
    if (!this.configurationValid) {
      throw new Error("M4_OFFLINE_BUILD_CONFIG");
    }
    const runOwner = this.runOwner();
    const expectedDockerChildren =
      expected === "config-only"
        ? ["config.json"]
        : expected === "doctor"
          ? [".token_seed", ".token_seed.lock", "config.json"]
          : [".token_seed", ".token_seed.lock", "buildx", "config.json"];
    const dockerExpectations = Object.freeze({
      mode: 0o700,
      owner: runOwner,
      children: Object.freeze(expectedDockerChildren),
    });
    if (allowSettledMutation) {
      await this.dockerConfigIdentity.refreshDirectoryCheckpoint(
        dockerExpectations,
      );
    } else {
      await this.dockerConfigIdentity.validateStable(dockerExpectations);
    }
    await this.configIdentity.validateStable({
      mode: 0o600,
      owner: runOwner,
      maximumBytes: 13,
      exactSize: 13n,
      content: "read",
      expectedBytes: new TextEncoder().encode(DOCKER_CONFIG_JSON),
    });
    const expectedRuntimePaths = new Set(
      expected === "config-only"
        ? []
        : expected === "doctor"
          ? ["docker-config/.token_seed", "docker-config/.token_seed.lock"]
          : RUNTIME_CONFIGURATION_SPECIFICATIONS.map(
              (entry) => entry.relativePath,
            ),
    );
    for (const specification of RUNTIME_CONFIGURATION_SPECIFICATIONS) {
      if (!expectedRuntimePaths.has(specification.relativePath)) continue;
      const target = path.join(this.layout.runRoot, specification.relativePath);
      let identity = this.runtimeConfigurationIdentities.get(
        specification.relativePath,
      );
      if (identity === undefined) {
        if (!allowSettledMutation) {
          throw new Error("M4_OFFLINE_BUILD_CONFIG");
        }
        identity =
          specification.type === "directory"
            ? await captureDirectoryIdentity(
                `fresh-config:${specification.relativePath}`,
                target,
                {
                  mode: specification.mode,
                  owner: runOwner,
                  children: specification.children ?? [],
                },
              )
            : await captureFileIdentity(
                `fresh-config:${specification.relativePath}`,
                target,
                {
                  mode: specification.mode,
                  owner: runOwner,
                  exactSize: BigInt(specification.byteLength ?? -1),
                  content: "metadata-only",
                },
              );
        this.runtimeConfigurationIdentities.set(
          specification.relativePath,
          identity,
        );
      } else if (specification.type === "directory") {
        await identity.validateStable({
          mode: specification.mode,
          owner: runOwner,
          children: specification.children ?? [],
        });
      } else {
        await identity.validateStable({
          mode: specification.mode,
          owner: runOwner,
          exactSize: BigInt(specification.byteLength ?? -1),
          content: "metadata-only",
        });
      }
    }
    if (
      [...this.runtimeConfigurationIdentities.keys()].some(
        (relativePath) => !expectedRuntimePaths.has(relativePath),
      )
    ) {
      throw new Error("M4_OFFLINE_BUILD_CONFIG");
    }
    this.configurationCheckpoint = expected;
  }

  private async closeWithoutMutation(): Promise<void> {
    const objects = new Set<HeldFilesystemObject>([
      ...this.runtimeConfigurationIdentities.values(),
      ...this.fileIdentities.values(),
      ...(this.fixtureIdentity === null ? [] : [this.fixtureIdentity]),
      this.configIdentity,
      this.dockerConfigIdentity,
      this.stagingIdentity,
      this.runIdentity,
      this.m4RootIdentity,
    ]);
    for (const object of [...objects].reverse()) {
      await object.close().catch(() => undefined);
    }
    await this.runAncestorLease.close().catch(() => undefined);
    await this.repositoryLease.close().catch(() => undefined);
  }

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
    await this.repositoryLease.validate();
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await directoryIdentity(
      this.layout.stagingRoot,
      this.stagingIdentity,
      true,
    );
    exactNames(await readdir(this.layout.stagingRoot), []);
    const fixturePath = path.join(this.layout.stagingRoot, "fixture");
    await requireAbsent(fixturePath);
    await mkdir(fixturePath, { mode: 0o700 });
    const fixtureIdentity = await captureDirectoryIdentity(
      "staging:fixture",
      fixturePath,
      {
        mode: 0o700,
        owner: this.runOwner(),
        children: [],
      },
    );
    this.fixtureIdentity = fixtureIdentity;
    const stagingChildren = ["fixture"];
    const fixtureChildren: string[] = [];
    await this.stagingIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: this.runOwner(),
      children: stagingChildren,
    });
    for (const file of files) {
      const logicalPath = file.logicalPath as StagingFilePath;
      const parent = logicalPath.startsWith("fixture/")
        ? fixturePath
        : this.layout.stagingRoot;
      const baseName = path.basename(logicalPath);
      const parentIdentity = logicalPath.startsWith("fixture/")
        ? fixtureIdentity
        : this.stagingIdentity;
      const parentChildren = logicalPath.startsWith("fixture/")
        ? fixtureChildren
        : stagingChildren;
      await parentIdentity.validateStable({
        mode: 0o700,
        owner: this.runOwner(),
        children: parentChildren,
      });
      const target = path.join(parent, baseName);
      const nextParentChildren = [...parentChildren, baseName];
      const identity = await createExclusiveFileIdentity({
        logicalRole: `staging:${logicalPath}`,
        parent: parentIdentity,
        name: baseName,
        mode: 0o600,
        bytes: file.bytes,
        expectedParentChildren: nextParentChildren,
      });
      this.repositoryLease.assertDistinctFrom(identity);
      if (
        [...this.fileIdentities.values()].some((existing) =>
          existing.sameObjectAs(identity),
        )
      ) {
        throw new Error("M4_OFFLINE_BUILD_PATH");
      }
      const readBack = await readIdentityFile(target, identity);
      if (!equalBytes(readBack, file.bytes)) {
        throw new Error("M4_OFFLINE_BUILD_BYTES");
      }
      this.fileIdentities.set(logicalPath, identity);
      parentChildren.push(baseName);
    }
    await fixtureIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: this.runOwner(),
      children: FIXTURE_FILES,
    });
    await this.stagingIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: this.runOwner(),
      children: ["Containerfile", "fixture"],
    });
    verifyAcceptedStagingFiles(this.snapshot, await this.readBuildContext());
    this.staged = true;
  }

  async readBuildContext(): Promise<unknown> {
    try {
      return await this.readBuildContextBound();
    } catch {
      this.configurationValid = false;
      this.invalidStateCode = "M4_OFFLINE_BUILD_INVENTORY";
      throw new Error("M4_OFFLINE_BUILD_INVENTORY");
    }
  }

  private async readBuildContextBound(): Promise<unknown> {
    if (this.closed) throw new Error("M4_OFFLINE_BUILD_STATE");
    await this.repositoryLease.validate();
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
    await this.repositoryLease.validate();
    await this.readBuildContext();
    await directoryIdentity(this.layout.runRoot, this.runIdentity, true);
    await this.validateConfigurationCheckpoint(
      this.configurationCheckpoint,
      false,
    );
    const result = await this.spawnFixedCommand(stepId, command, limits);
    if (
      typeof result !== "object" ||
      result === null ||
      !("closeObserved" in result) ||
      result.closeObserved !== true
    ) {
      this.configurationValid = false;
      return result;
    }
    try {
      await this.validateConfigurationCheckpoint(
        stepId === "doctor" ? "doctor" : "build",
        stepId !== "inspect-image",
      );
      await this.repositoryLease.validate();
      await this.readBuildContext();
    } catch (error) {
      this.configurationValid = false;
      throw error;
    }
    return result;
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
    if (!this.configurationValid) {
      await this.closeWithoutMutation();
      throw new Error(this.invalidStateCode);
    }
    await this.repositoryLease.validate();
    await this.runAncestorLease.validate();
    await this.validateConfigurationCheckpoint(
      this.configurationCheckpoint,
      false,
    );
    const runOwner = this.runOwner();
    const specificationByPath = new Map<
      string,
      (typeof RUNTIME_CONFIGURATION_SPECIFICATIONS)[number]
    >(
      RUNTIME_CONFIGURATION_SPECIFICATIONS.map((entry) => [
        entry.relativePath,
        entry,
      ]),
    );
    const remainingChildren = new Map<string, string[]>(
      RUNTIME_CONFIGURATION_SPECIFICATIONS.filter(
        (entry) => entry.type === "directory",
      ).map((entry) => [entry.relativePath, [...(entry.children ?? [])]]),
    );
    remainingChildren.set(
      "docker-config",
      this.configurationCheckpoint === "config-only"
        ? ["config.json"]
        : this.configurationCheckpoint === "doctor"
          ? [".token_seed", ".token_seed.lock", "config.json"]
          : [".token_seed", ".token_seed.lock", "buildx", "config.json"],
    );
    const activeRuntimePaths = new Set(
      this.configurationCheckpoint === "config-only"
        ? []
        : this.configurationCheckpoint === "doctor"
          ? ["docker-config/.token_seed", "docker-config/.token_seed.lock"]
          : RUNTIME_CONFIGURATION_SPECIFICATIONS.map(
              (entry) => entry.relativePath,
            ),
    );
    for (const relativePath of RUNTIME_CONFIGURATION_CLEANUP_ORDER) {
      if (!activeRuntimePaths.has(relativePath)) continue;
      const identity = this.runtimeConfigurationIdentities.get(relativePath);
      const specification = specificationByPath.get(relativePath);
      if (identity === undefined || specification === undefined) {
        throw new Error("M4_OFFLINE_BUILD_CONFIG");
      }
      if (specification.type === "directory") {
        await identity.removeExpectedDirectory({
          mode: specification.mode,
          owner: runOwner,
          children: [],
        });
      } else {
        await identity.unlinkExpected({
          mode: specification.mode,
          owner: runOwner,
          exactSize: BigInt(specification.byteLength ?? -1),
          content: "metadata-only",
        });
      }
      const parentRelativePath = path.posix.dirname(relativePath);
      const parentIdentity =
        parentRelativePath === "docker-config"
          ? this.dockerConfigIdentity
          : this.runtimeConfigurationIdentities.get(parentRelativePath);
      const parentSpecification = specificationByPath.get(parentRelativePath);
      const parentChildren = remainingChildren.get(parentRelativePath);
      if (parentIdentity === undefined || parentChildren === undefined) {
        throw new Error("M4_OFFLINE_BUILD_CONFIG");
      }
      const childIndex = parentChildren.indexOf(
        path.posix.basename(relativePath),
      );
      if (childIndex < 0) throw new Error("M4_OFFLINE_BUILD_CONFIG");
      parentChildren.splice(childIndex, 1);
      await parentIdentity.refreshDirectoryCheckpoint({
        mode: parentSpecification?.mode ?? 0o700,
        owner: runOwner,
        children: parentChildren,
      });
    }
    await this.configIdentity.unlinkExpected({
      mode: 0o600,
      owner: runOwner,
      maximumBytes: 13,
      exactSize: 13n,
      content: "read",
      expectedBytes: new TextEncoder().encode(DOCKER_CONFIG_JSON),
    });
    await this.dockerConfigIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: runOwner,
      children: [],
    });
    await this.dockerConfigIdentity.removeExpectedDirectory({
      mode: 0o700,
      owner: runOwner,
      children: [],
    });
    await this.runIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: runOwner,
      children: ["staging"],
    });
    await this.stagingIdentity.validateStable({
      mode: 0o700,
      owner: runOwner,
      children:
        this.fixtureIdentity === null ? [] : ["Containerfile", "fixture"],
    });
    if (this.fixtureIdentity !== null) {
      const stagingChildren = ["Containerfile", "fixture"];
      const fixtureChildren: string[] = [...FIXTURE_FILES];
      for (const logicalPath of [...FIXED_STAGING_FILES].reverse()) {
        const identity = this.fileIdentities.get(logicalPath);
        if (identity === undefined) continue;
        await identity.unlinkExpected({
          mode: 0o600,
          owner: runOwner,
          maximumBytes: 1_048_576,
          content: "read",
        });
        const baseName = path.basename(logicalPath);
        if (logicalPath.startsWith("fixture/")) {
          fixtureChildren.splice(fixtureChildren.indexOf(baseName), 1);
          await this.fixtureIdentity.refreshDirectoryCheckpoint({
            mode: 0o700,
            owner: runOwner,
            children: fixtureChildren,
          });
        } else {
          stagingChildren.splice(stagingChildren.indexOf(baseName), 1);
          await this.stagingIdentity.refreshDirectoryCheckpoint({
            mode: 0o700,
            owner: runOwner,
            children: stagingChildren,
          });
        }
      }
      await this.fixtureIdentity.removeExpectedDirectory({
        mode: 0o700,
        owner: runOwner,
        children: [],
      });
      stagingChildren.splice(stagingChildren.indexOf("fixture"), 1);
      await this.stagingIdentity.refreshDirectoryCheckpoint({
        mode: 0o700,
        owner: runOwner,
        children: stagingChildren,
      });
    }
    await this.stagingIdentity.removeExpectedDirectory({
      mode: 0o700,
      owner: runOwner,
      children: [],
    });
    await this.runIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: runOwner,
      children: [],
    });
    await this.runIdentity.removeExpectedDirectory({
      mode: 0o700,
      owner: runOwner,
      children: [],
    });
    if (!this.relaxSharedTestAncestor) {
      await this.m4RootIdentity.refreshDirectoryCheckpoint({
        mode: "captured",
        owner: this.m4RootIdentity.owner(),
        children: this.initialM4Children,
      });
    }
    await this.m4RootIdentity.close();
    await this.runAncestorLease.close();
    await this.repositoryLease.close();
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
  verifyAcceptedStagingFiles(snapshot, repositoryFiles.files);
  const resultsRoot = path.join(repositoryRoot, "results");
  const runsRoot = path.join(resultsRoot, "runs");
  const resultsExpectation = Object.freeze({
    mode: "captured" as const,
    children: Object.freeze(await readdir(resultsRoot)),
  });
  const resultsIdentity = await captureDirectoryIdentity(
    "results-root",
    resultsRoot,
    resultsExpectation,
  );
  const runsExpectation = Object.freeze({
    mode: "captured" as const,
    children: Object.freeze(await readdir(runsRoot)),
  });
  const runsIdentity = await captureDirectoryIdentity(
    "runs-root",
    runsRoot,
    runsExpectation,
  );
  const runAncestorLease = new FilesystemIdentityLease([
    { object: resultsIdentity, expectations: resultsExpectation },
    { object: runsIdentity, expectations: runsExpectation },
  ]);
  const m4Root = path.join(runsRoot, "m4-profile-controls");
  const relaxSharedTestAncestor = /^m4-offline-host-[a-z0-9-]+$/u.test(
    input.layout.runId,
  );
  const initialM4Children = Object.freeze(await readdir(m4Root));
  let m4RootIdentity: HeldFilesystemObject;
  if (relaxSharedTestAncestor) {
    m4RootIdentity = runsIdentity;
  } else {
    try {
      m4RootIdentity = await captureDirectoryIdentity("m4-run-root", m4Root, {
        mode: "captured",
        children: initialM4Children,
      });
    } catch {
      await runAncestorLease.close().catch(() => undefined);
      await repositoryFiles.lease.close().catch(() => undefined);
      throw new Error("M4_OFFLINE_BUILD_PATH");
    }
  }
  try {
    await requireAbsent(input.layout.runRoot);
  } catch {
    await m4RootIdentity.close().catch(() => undefined);
    await runAncestorLease.close().catch(() => undefined);
    await repositoryFiles.lease.close().catch(() => undefined);
    throw new Error("M4_OFFLINE_BUILD_PATH");
  }
  await mkdir(input.layout.runRoot, { mode: 0o700 });
  const runIdentity = await captureDirectoryIdentity(
    "offline-build:run-root",
    input.layout.runRoot,
    { mode: 0o700, children: [] },
  );
  if (!relaxSharedTestAncestor) {
    await m4RootIdentity.refreshDirectoryCheckpoint({
      mode: "captured",
      owner: m4RootIdentity.owner(),
      children: [...initialM4Children, input.layout.runId],
    });
  }
  let stagingIdentity: PathIdentity | undefined;
  let dockerConfigIdentity: PathIdentity | undefined;
  let configIdentity: PathIdentity | undefined;
  try {
    await mkdir(input.layout.stagingRoot, { mode: 0o700 });
    stagingIdentity = await captureDirectoryIdentity(
      "offline-build:staging-root",
      input.layout.stagingRoot,
      { mode: 0o700, owner: runIdentity.owner(), children: [] },
    );
    await runIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: runIdentity.owner(),
      children: ["staging"],
    });
    await mkdir(input.layout.dockerConfigRoot, { mode: 0o700 });
    dockerConfigIdentity = await captureDirectoryIdentity(
      "offline-build:docker-config-root",
      input.layout.dockerConfigRoot,
      { mode: 0o700, owner: runIdentity.owner(), children: [] },
    );
    await runIdentity.refreshDirectoryCheckpoint({
      mode: 0o700,
      owner: runIdentity.owner(),
      children: ["docker-config", "staging"],
    });
    configIdentity = await createExclusiveFileIdentity({
      logicalRole: "offline-build:docker-config-json",
      parent: dockerConfigIdentity,
      name: "config.json",
      mode: 0o600,
      bytes: new TextEncoder().encode(DOCKER_CONFIG_JSON),
      expectedParentChildren: ["config.json"],
    });
    await repositoryFiles.lease.validate();
    await runAncestorLease.validate();
    return new FixedOfflineBuildHostBackend(
      repositoryRoot,
      snapshot,
      plan,
      input.layout,
      runIdentity,
      stagingIdentity,
      dockerConfigIdentity,
      configIdentity,
      repositoryFiles.lease,
      runAncestorLease,
      m4RootIdentity,
      initialM4Children,
      relaxSharedTestAncestor,
    );
  } catch (error) {
    try {
      if (configIdentity !== undefined) {
        await configIdentity.unlinkExpected({
          mode: 0o600,
          owner: runIdentity.owner(),
          maximumBytes: 13,
          exactSize: 13n,
          content: "read",
          expectedBytes: new TextEncoder().encode(DOCKER_CONFIG_JSON),
        });
      }
      if (dockerConfigIdentity !== undefined) {
        await dockerConfigIdentity.refreshDirectoryCheckpoint({
          mode: 0o700,
          owner: runIdentity.owner(),
          children: [],
        });
        await dockerConfigIdentity.removeExpectedDirectory({
          mode: 0o700,
          owner: runIdentity.owner(),
          children: [],
        });
      }
      if (stagingIdentity !== undefined) {
        await stagingIdentity.removeExpectedDirectory({
          mode: 0o700,
          owner: runIdentity.owner(),
          children: [],
        });
      }
      await runIdentity.refreshDirectoryCheckpoint({
        mode: 0o700,
        owner: runIdentity.owner(),
        children: [],
      });
      await runIdentity.removeExpectedDirectory({
        mode: 0o700,
        owner: runIdentity.owner(),
        children: [],
      });
      if (!relaxSharedTestAncestor) {
        await m4RootIdentity.refreshDirectoryCheckpoint({
          mode: "captured",
          owner: m4RootIdentity.owner(),
          children: initialM4Children,
        });
      }
      await m4RootIdentity.close();
      await runAncestorLease.close();
      await repositoryFiles.lease.close();
    } catch {
      // Unsafe or replaced initialization state is retained fail closed.
    }
    throw error;
  }
}
