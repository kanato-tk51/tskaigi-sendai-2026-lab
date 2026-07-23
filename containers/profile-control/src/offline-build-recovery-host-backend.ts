import { spawn, type ChildProcessByStdio } from "node:child_process";
import { readdir, realpath } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import { LIMITS } from "./constants.js";
import { FIXED_DOCKER_EXECUTABLE, type DockerCommand } from "./docker-plan.js";
import {
  captureDirectoryIdentity,
  captureFileIdentity,
  FilesystemIdentityLease,
  type DirectoryIdentityExpectations,
  type FileIdentityExpectations,
  type HeldFilesystemObject,
  type PrivateOwner,
} from "./filesystem-identity.js";
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

interface CapturedRetainedState {
  readonly lease: FilesystemIdentityLease;
  readonly runOwner: PrivateOwner;
}

async function captureExactRetainedState(
  runRoot: string,
  includeAncestors: boolean,
): Promise<CapturedRetainedState> {
  const held: Array<{
    object: HeldFilesystemObject;
    expectations: FileIdentityExpectations | DirectoryIdentityExpectations;
  }> = [];
  let runOwner: PrivateOwner | null = null;
  try {
    if (includeAncestors) {
      const m4Root = path.dirname(runRoot);
      const runsRoot = path.dirname(m4Root);
      const resultsRoot = path.dirname(runsRoot);
      for (const [logicalRole, target] of [
        ["retained:results-root", resultsRoot],
        ["retained:runs-root", runsRoot],
        ["retained:m4-root", m4Root],
      ] as const) {
        const expectations: DirectoryIdentityExpectations = Object.freeze({
          mode: "captured",
          children: Object.freeze(await readdir(target)),
        });
        held.push({
          object: await captureDirectoryIdentity(
            logicalRole,
            target,
            expectations,
          ),
          expectations,
        });
      }
    }
    for (const specification of FIXED_RETAINED_STATE_INVENTORY) {
      const target =
        specification.relativePath.length === 0
          ? runRoot
          : path.join(runRoot, specification.relativePath);
      let object: HeldFilesystemObject;
      let expectations:
        FileIdentityExpectations | DirectoryIdentityExpectations;
      if (specification.type === "directory") {
        expectations = Object.freeze({
          mode: specification.mode,
          ...(runOwner === null ? {} : { owner: runOwner }),
          children: specification.children ?? [],
        });
        object = await captureDirectoryIdentity(
          `retained:${specification.relativePath || "run-root"}`,
          target,
          expectations,
        );
      } else {
        if (runOwner === null) {
          throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
        }
        const fileExpectations: FileIdentityExpectations = Object.freeze({
          mode: specification.mode,
          owner: runOwner,
          exactSize: BigInt(specification.byteLength ?? -1),
          content: "metadata-only" as const,
        });
        expectations = fileExpectations;
        object = await captureFileIdentity(
          `retained:${specification.relativePath}`,
          target,
          fileExpectations,
        );
      }
      runOwner ??= object.owner();
      if (
        object.owner().uid !== runOwner.uid ||
        object.owner().gid !== runOwner.gid
      ) {
        throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
      }
      held.push({ object, expectations });
    }
    if (runOwner === null) throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
    const lease = new FilesystemIdentityLease(held);
    await lease.validate();
    return Object.freeze({ lease, runOwner });
  } catch {
    for (const entry of [...held].reverse()) {
      await entry.object.close().catch(() => undefined);
    }
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_STATE");
  }
}

async function validateCapturedRetainedState(
  expected: CapturedRetainedState,
): Promise<void> {
  try {
    await expected.lease.validate();
  } catch {
    await expected.lease.close().catch(() => undefined);
    throw new Error("M4_OFFLINE_BUILD_RECOVERY_IDENTITY");
  }
}

class FixedOfflineBuildRecoveryHostBackend implements FixedOfflineBuildRecoveryBackend {
  private validationCount = 0;
  private inspectAttempted = false;
  private activeChild = false;
  private unknownSettlement = false;
  private terminalLeaseSettlement: Promise<void> | null = null;

  constructor(
    private readonly repositoryRoot: string,
    private readonly dockerConfigRoot: string,
    private readonly retainedState: CapturedRetainedState,
  ) {}

  async validateRetainedState(): Promise<void> {
    if (
      (this.validationCount === 0 && this.inspectAttempted) ||
      (this.validationCount === 1 && !this.inspectAttempted) ||
      this.validationCount > 1 ||
      this.activeChild ||
      this.unknownSettlement ||
      this.terminalLeaseSettlement !== null
    ) {
      throw new Error("M4_OFFLINE_BUILD_RECOVERY_SEQUENCE");
    }
    await validateCapturedRetainedState(this.retainedState);
    this.validationCount += 1;
    if (this.validationCount === 2) await this.retainedState.lease.close();
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
        if (closeObserved) {
          this.activeChild = false;
        } else {
          this.unknownSettlement = true;
        }
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
      child.once("close", (exitCode) => {
        if (settled) {
          if (!this.unknownSettlement || !this.activeChild) return;
          this.activeChild = false;
          this.terminalLeaseSettlement = (async () => {
            try {
              await this.retainedState.lease.validate();
            } finally {
              await this.retainedState.lease.close();
            }
          })().catch(() => undefined);
          return;
        }
        settle(exitCode, true);
      });
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
  const retainedState = await captureExactRetainedState(runRoot, true);
  return new FixedOfflineBuildRecoveryHostBackend(
    repositoryRoot,
    path.join(runRoot, "docker-config"),
    retainedState,
  );
}

export async function createDisposableRetainedStateValidatorForTest(
  runRoot: string,
): Promise<Readonly<{ validate(): Promise<void>; close(): Promise<void> }>> {
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
  const retainedState = await captureExactRetainedState(runRoot, false);
  return Object.freeze({
    validate: async () => await validateCapturedRetainedState(retainedState),
    close: async () => await retainedState.lease.close(),
  });
}

export async function createDisposableOfflineBuildRecoveryHostBackendForTest(
  runRoot: string,
): Promise<FixedOfflineBuildRecoveryBackend> {
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
  const retainedState = await captureExactRetainedState(runRoot, false);
  const fixedDockerConfigRoot = path.join(
    repositoryRoot,
    "results",
    "runs",
    "m4-profile-controls",
    FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
    "docker-config",
  );
  return new FixedOfflineBuildRecoveryHostBackend(
    repositoryRoot,
    fixedDockerConfigRoot,
    retainedState,
  );
}
