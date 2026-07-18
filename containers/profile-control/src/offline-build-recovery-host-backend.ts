import { spawn, type ChildProcessByStdio } from "node:child_process";
import { lstat, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import { LIMITS } from "./constants.js";
import { FIXED_DOCKER_EXECUTABLE, type DockerCommand } from "./docker-plan.js";
import {
  assertFixedOfflineBuildRecoveryCommand,
  FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  type FixedOfflineBuildRecoveryBackend,
} from "./offline-build-recovery.js";
import {
  createOfflineBuildProcessState,
  observeOfflineBuildProcessFailure,
  observeOfflineBuildProcessOutput,
} from "./offline-build-process.js";

interface PathIdentity {
  readonly device: number;
  readonly inode: number;
}

interface RetainedEntrySpecification {
  readonly relativePath: string;
  readonly type: "directory" | "file";
  readonly mode: number;
  readonly byteLength: number | null;
  readonly children: readonly string[] | null;
}

export const FIXED_RETAINED_STATE_INVENTORY = Object.freeze([
  Object.freeze({
    relativePath: "",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze(["docker-config"]),
  }),
  Object.freeze({
    relativePath: "docker-config",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze([".token_seed", ".token_seed.lock", "buildx"]),
  }),
  Object.freeze({
    relativePath: "docker-config/.token_seed",
    type: "file",
    mode: 0o600,
    byteLength: 74,
    children: null,
  }),
  Object.freeze({
    relativePath: "docker-config/.token_seed.lock",
    type: "file",
    mode: 0o600,
    byteLength: 0,
    children: null,
  }),
  Object.freeze({
    relativePath: "docker-config/buildx",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze([
      ".buildNodeID",
      ".lock",
      "activity",
      "defaults",
      "instances",
      "refs",
    ]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/.buildNodeID",
    type: "file",
    mode: 0o600,
    byteLength: 16,
    children: null,
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/.lock",
    type: "file",
    mode: 0o600,
    byteLength: 0,
    children: null,
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/activity",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze(["default"]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/activity/default",
    type: "file",
    mode: 0o600,
    byteLength: 20,
    children: null,
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/defaults",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze([]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/instances",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze([]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/refs",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze(["default"]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/refs/default",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze(["default"]),
  }),
  Object.freeze({
    relativePath: "docker-config/buildx/refs/default/default",
    type: "directory",
    mode: 0o700,
    byteLength: null,
    children: Object.freeze(["tdjwufr4i7552r09bibchdkva"]),
  }),
  Object.freeze({
    relativePath:
      "docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva",
    type: "file",
    mode: 0o644,
    byteLength: 281,
    children: null,
  }),
] as const satisfies readonly RetainedEntrySpecification[]);

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const CLOSE_GRACE_MS = 250;
let productionFactoryConsumed = false;

export function consumeOfflineBuildRecoveryInspectAttempt(
  alreadyAttempted: boolean,
): true {
  if (alreadyAttempted) {
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_SEQUENCE");
  }
  return true;
}

function sameNames(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  const left = [...actual].sort();
  const right = [...expected].sort();
  return (
    left.length === right.length &&
    left.every((entry, index) => entry === right[index])
  );
}

function sameIdentity(left: PathIdentity, right: PathIdentity): boolean {
  return left.device === right.device && left.inode === right.inode;
}

async function captureExactRetainedState(
  runRoot: string,
): Promise<ReadonlyMap<string, PathIdentity>> {
  const identities = new Map<string, PathIdentity>();
  for (const specification of FIXED_RETAINED_STATE_INVENTORY) {
    const target =
      specification.relativePath.length === 0
        ? runRoot
        : path.join(runRoot, specification.relativePath);
    const entry = await lstat(target);
    if (
      entry.isSymbolicLink() ||
      (entry.mode & 0o777) !== specification.mode ||
      (await realpath(target)) !== target ||
      (specification.type === "directory" && !entry.isDirectory()) ||
      (specification.type === "file" &&
        (!entry.isFile() ||
          entry.nlink !== 1 ||
          entry.size !== specification.byteLength))
    ) {
      throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
    }
    if (specification.children !== null) {
      const children = await readdir(target);
      if (!sameNames(children, specification.children)) {
        throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
      }
    }
    identities.set(
      specification.relativePath,
      Object.freeze({ device: entry.dev, inode: entry.ino }),
    );
  }
  return identities;
}

async function validateCapturedRetainedState(
  runRoot: string,
  expected: ReadonlyMap<string, PathIdentity>,
): Promise<void> {
  const actual = await captureExactRetainedState(runRoot);
  if (
    actual.size !== expected.size ||
    [...expected].some(([relativePath, identity]) => {
      const current = actual.get(relativePath);
      return current === undefined || !sameIdentity(identity, current);
    })
  ) {
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_IDENTITY");
  }
}

class FixedOfflineBuildRecoveryHostBackend implements FixedOfflineBuildRecoveryBackend {
  private validationCount = 0;
  private inspectAttempted = false;
  private activeChild = false;

  constructor(
    private readonly repositoryRoot: string,
    private readonly runRoot: string,
    private readonly dockerConfigRoot: string,
    private readonly identities: ReadonlyMap<string, PathIdentity>,
  ) {}

  async validateRetainedState(): Promise<void> {
    if (
      (this.validationCount === 0 && this.inspectAttempted) ||
      (this.validationCount === 1 && !this.inspectAttempted) ||
      this.validationCount > 1
    ) {
      throw new Error("M4_OFFLINE_BUILD_RECOVERY_SEQUENCE");
    }
    await validateCapturedRetainedState(this.runRoot, this.identities);
    this.validationCount += 1;
  }

  async run(
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    if (
      this.validationCount !== 1 ||
      this.inspectAttempted ||
      this.activeChild
    ) {
      throw new Error("M4_OFFLINE_BUILD_RECOVERY_SEQUENCE");
    }
    this.inspectAttempted = consumeOfflineBuildRecoveryInspectAttempt(
      this.inspectAttempted,
    );
    assertFixedOfflineBuildRecoveryCommand(command);
    if (
      command.executable !== FIXED_DOCKER_EXECUTABLE ||
      command.environment.DOCKER_CONFIG !== this.dockerConfigRoot ||
      command.shell !== false ||
      limits.timeoutMs !== LIMITS.controlTimeoutMs ||
      limits.outputBytes !== LIMITS.outputBytes
    ) {
      throw new Error("M4_OFFLINE_BUILD_RECOVERY_COMMAND");
    }
    return await this.spawnFixedInspect(command, limits);
  }

  private async spawnFixedInspect(
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    return await new Promise((resolve, reject) => {
      let child: ChildProcessByStdio<null, Readable, Readable>;
      try {
        child = spawn(command.executable, command.arguments, {
          cwd: this.repositoryRoot,
          env: Object.freeze({ DOCKER_CONFIG: this.dockerConfigRoot }),
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });
      } catch (error) {
        reject(error);
        return;
      }
      this.activeChild = true;
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
        if (closeObserved) this.activeChild = false;
        resolve({
          exitCode: processState.firstFailure === null ? exitCode : null,
          timedOut: processState.firstFailure === "timeout",
          outputLimitExceeded: processState.firstFailure === "output-limit",
          closeObserved,
          stdoutBytes: processState.stdoutBytes,
          stderrBytes: processState.stderrBytes,
          stdout:
            processState.firstFailure === null
              ? Uint8Array.from(
                  Buffer.concat(
                    stdoutChunks.map((chunk) => Buffer.from(chunk)),
                    processState.stdoutBytes,
                  ),
                )
              : new Uint8Array(),
        });
      };
      const stop = (): void => {
        if (!child.killed) child.kill("SIGKILL");
        closeGrace ??= setTimeout(() => settle(null, false), CLOSE_GRACE_MS);
      };
      const count = (chunk: Buffer, stream: "stderr" | "stdout"): void => {
        const previousFailure = processState.firstFailure;
        processState = observeOfflineBuildProcessOutput(
          processState,
          stream,
          chunk.byteLength,
          limits.outputBytes,
        );
        if (stream === "stdout" && processState.firstFailure === null) {
          stdoutChunks.push(Uint8Array.from(chunk));
        }
        if (previousFailure === null && processState.firstFailure !== null) {
          stdoutChunks.length = 0;
          stop();
        }
      };
      child.stdout.on("data", (chunk: Buffer) => count(chunk, "stdout"));
      child.stderr.on("data", (chunk: Buffer) => count(chunk, "stderr"));
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
}

export async function createFixedOfflineBuildRecoveryHostBackend(): Promise<FixedOfflineBuildRecoveryBackend> {
  if (productionFactoryConsumed) {
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_ALREADY_CREATED");
  }
  productionFactoryConsumed = true;
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_PATH");
  }
  const runRoot = path.join(
    repositoryRoot,
    "results",
    "runs",
    "m4-profile-controls",
    FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  );
  const identities = await captureExactRetainedState(runRoot);
  return new FixedOfflineBuildRecoveryHostBackend(
    repositoryRoot,
    runRoot,
    path.join(runRoot, "docker-config"),
    identities,
  );
}

export async function createDisposableRetainedStateValidatorForTest(
  runRoot: string,
): Promise<Readonly<{ validate(): Promise<void> }>> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  const testParent = path.join(
    repositoryRoot,
    "results",
    "runs",
    "m4-profile-controls",
  );
  if (
    !path.isAbsolute(runRoot) ||
    path.normalize(runRoot) !== runRoot ||
    path.dirname(runRoot) !== testParent ||
    !/^m4-recovery-state-test-[a-z0-9-]+$/u.test(path.basename(runRoot))
  ) {
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_TEST_PATH");
  }
  const identities = await captureExactRetainedState(runRoot);
  return Object.freeze({
    validate: async () =>
      await validateCapturedRetainedState(runRoot, identities),
  });
}
