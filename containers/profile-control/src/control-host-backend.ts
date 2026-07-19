import { spawn, type ChildProcessByStdio } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  chmod,
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

import { serializeCanonicalControlManifest } from "./canonical.js";
import {
  FIXED_CONSTRAINED_RUN_ID,
  FIXED_CONTROL_IMAGE_DIGEST,
  FIXED_PERMISSIVE_RUN_ID,
  LIMITS,
} from "./constants.js";
import { assertAcceptedProfileControlPair } from "./definitions.js";
import {
  assertFixedProfilePairDockerPlans,
  FIXED_DOCKER_EXECUTABLE,
  type DockerCommand,
  type FixedRuntimeLayout,
  type ProfileDockerPlan,
  type ProfilePairDockerPlans,
} from "./docker-plan.js";
import type { FixedExistingImageExecutionBackend } from "./execution.js";
import {
  createOfflineBuildProcessState,
  observeOfflineBuildProcessFailure,
  observeOfflineBuildProcessOutput,
} from "./offline-build-process.js";
import { assertAcceptedImageStagingSnapshot } from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ProfileControlPair,
  ProfileId,
} from "./types.js";
import { validateProfileControlPair } from "./validation.js";

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const DOCKER_CONFIG_JSON = '{"auths":{}}\n';
const CLOSE_GRACE_MS = 250;
const encoder = new TextEncoder();
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });

interface PathIdentity {
  readonly device: number;
  readonly inode: number;
}

interface ProfileOwnedState {
  readonly layout: FixedRuntimeLayout;
  readonly plan: ProfileDockerPlan;
  readonly runIdentity: PathIdentity;
  readonly inputIdentity: PathIdentity;
  readonly hostIdentity: PathIdentity;
  readonly resultIdentity: PathIdentity;
  readonly scratchIdentity: PathIdentity;
  readonly dockerConfigIdentity: PathIdentity;
  readonly transferRoot: string;
  readonly transferIdentity: PathIdentity;
  readonly configIdentity: PathIdentity;
  readonly manifestIdentity: PathIdentity;
  phase:
    | "ready"
    | "created"
    | "inspected"
    | "started"
    | "transferred"
    | "failed"
    | "removed";
}

function errnoCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

function sameIdentity(
  expected: PathIdentity,
  actual: Readonly<{ dev: number; ino: number }>,
): boolean {
  return expected.device === actual.dev && expected.inode === actual.ino;
}

async function requireAbsent(target: string): Promise<void> {
  try {
    await lstat(target);
  } catch (error) {
    if (errnoCode(error) === "ENOENT") return;
    throw error;
  }
  throw new Error("M4_CONTROL_PATH");
}

async function directoryIdentity(
  target: string,
  expected?: PathIdentity,
  expectedMode: number = 0o700,
): Promise<PathIdentity> {
  const entry = await lstat(target);
  if (
    !entry.isDirectory() ||
    entry.isSymbolicLink() ||
    (entry.mode & 0o7777) !== expectedMode ||
    (expected !== undefined && !sameIdentity(expected, entry)) ||
    (await realpath(target)) !== target
  ) {
    throw new Error("M4_CONTROL_PATH");
  }
  return Object.freeze({ device: entry.dev, inode: entry.ino });
}

async function repositoryDirectory(target: string): Promise<void> {
  const entry = await lstat(target);
  if (
    !entry.isDirectory() ||
    entry.isSymbolicLink() ||
    (await realpath(target)) !== target
  ) {
    throw new Error("M4_CONTROL_PATH");
  }
}

async function regularFileIdentity(
  target: string,
  expected?: PathIdentity,
  expectedMode: number = 0o600,
): Promise<PathIdentity> {
  const entry = await lstat(target);
  if (
    !entry.isFile() ||
    entry.isSymbolicLink() ||
    entry.nlink !== 1 ||
    (entry.mode & 0o7777) !== expectedMode ||
    (expected !== undefined && !sameIdentity(expected, entry))
  ) {
    throw new Error("M4_CONTROL_PATH");
  }
  return Object.freeze({ device: entry.dev, inode: entry.ino });
}

async function readIdentityFile(
  target: string,
  identity: PathIdentity,
  maximumBytes: number,
): Promise<Uint8Array> {
  const handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (
      !before.isFile() ||
      before.nlink !== 1 ||
      before.size <= 0 ||
      before.size > maximumBytes ||
      !sameIdentity(identity, before)
    ) {
      throw new Error("M4_CONTROL_FILE");
    }
    const bytes = Uint8Array.from(await handle.readFile());
    const after = await handle.stat();
    if (
      bytes.byteLength !== before.size ||
      after.size !== before.size ||
      after.nlink !== 1 ||
      !sameIdentity(identity, after)
    ) {
      throw new Error("M4_CONTROL_FILE");
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
    throw new Error("M4_CONTROL_INVENTORY");
  }
}

async function createExclusiveDirectory(
  target: string,
  mode: number = 0o700,
): Promise<PathIdentity> {
  await requireAbsent(target);
  await mkdir(target, { mode });
  await chmod(target, mode);
  return await directoryIdentity(target, undefined, mode);
}

function fileIdentityId(identity: PathIdentity): string {
  return `m4-file-${createHash("sha256")
    .update(`${identity.device}:${identity.inode}`, "utf8")
    .digest("hex")
    .slice(0, 32)}`;
}

function canonicalJsonBytes(input: unknown): Uint8Array {
  return encoder.encode(`${JSON.stringify(input)}\n`);
}

function parseCanonicalInspect(bytes: Uint8Array): unknown {
  let raw: unknown;
  try {
    const text = fatalDecoder.decode(bytes);
    if (
      !text.endsWith("\n") ||
      text.slice(0, -1).includes("\n") ||
      text.includes("\r") ||
      text.includes("\0")
    ) {
      throw new Error("M4_CONTROL_INSPECT");
    }
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    throw new Error("M4_CONTROL_INSPECT");
  }
  if (!equalBytes(bytes, canonicalJsonBytes(raw))) {
    throw new Error("M4_CONTROL_INSPECT");
  }
  return raw;
}

class FixedControlHostBackend implements FixedExistingImageExecutionBackend {
  private readonly activeChildren = new Set<
    ChildProcessByStdio<null, Readable, Readable>
  >();
  private currentProfile: ProfileId = "permissive";
  private closed = false;

  constructor(
    private readonly repositoryRoot: string,
    private readonly states: Readonly<Record<ProfileId, ProfileOwnedState>>,
  ) {}

  async run(
    stepId: string,
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    if (
      this.closed ||
      this.activeChildren.size !== 0 ||
      limits.timeoutMs !== LIMITS.controlTimeoutMs ||
      limits.outputBytes !== LIMITS.outputBytes
    ) {
      throw new Error("M4_CONTROL_COMMAND");
    }
    const separator = stepId.indexOf(":");
    const profileId = stepId.slice(0, separator) as ProfileId;
    const operation = stepId.slice(separator + 1);
    if (
      separator <= 0 ||
      profileId !== this.currentProfile ||
      (profileId !== "permissive" && profileId !== "constrained")
    ) {
      throw new Error("M4_CONTROL_COMMAND");
    }
    const state = this.states[profileId];
    const expectedCommand =
      operation === "create"
        ? state.plan.create
        : operation === "inspect"
          ? state.plan.inspect
          : operation === "start"
            ? state.plan.start
            : operation === "remove"
              ? state.plan.remove
              : null;
    const phaseAccepted =
      (operation === "create" && state.phase === "ready") ||
      (operation === "inspect" && state.phase === "created") ||
      (operation === "start" && state.phase === "inspected") ||
      (operation === "remove" &&
        ["created", "inspected", "started", "transferred", "failed"].includes(
          state.phase,
        ));
    if (
      !phaseAccepted ||
      command !== expectedCommand ||
      command.executable !== FIXED_DOCKER_EXECUTABLE ||
      command.environment.DOCKER_CONFIG !== state.layout.dockerConfigRoot ||
      command.shell !== false
    ) {
      throw new Error("M4_CONTROL_COMMAND");
    }
    await this.validateConfig(state);
    let result: Readonly<{
      exitCode: number | null;
      timedOut: boolean;
      outputLimitExceeded: boolean;
      stdoutBytes: number;
      stderrBytes: number;
      payload: unknown;
    }>;
    try {
      result = await this.spawnFixedCommand(
        operation === "inspect" ? "inspect" : "discard",
        command,
        limits,
      );
    } catch (error) {
      state.phase = operation === "remove" ? "removed" : "failed";
      if (operation === "remove") this.advanceProfile(profileId);
      throw error;
    }
    const successful =
      result.exitCode === 0 && !result.timedOut && !result.outputLimitExceeded;
    if (operation === "remove") {
      state.phase = "removed";
      this.advanceProfile(profileId);
    } else if (!successful) {
      state.phase = "failed";
    } else {
      state.phase =
        operation === "create"
          ? "created"
          : operation === "inspect"
            ? "inspected"
            : "started";
    }
    return result;
  }

  private advanceProfile(profileId: ProfileId): void {
    if (profileId === "permissive") {
      this.currentProfile = "constrained";
    }
  }

  private async validateConfig(state: ProfileOwnedState): Promise<void> {
    await directoryIdentity(state.layout.runRoot, state.runIdentity);
    await directoryIdentity(
      state.layout.dockerConfigRoot,
      state.dockerConfigIdentity,
    );
    const configPath = path.join(state.layout.dockerConfigRoot, "config.json");
    await regularFileIdentity(configPath, state.configIdentity);
    if (
      !equalBytes(
        await readIdentityFile(configPath, state.configIdentity, 64),
        encoder.encode(DOCKER_CONFIG_JSON),
      )
    ) {
      throw new Error("M4_CONTROL_CONFIG");
    }
  }

  private async spawnFixedCommand(
    outputKind: "discard" | "inspect",
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<
    Readonly<{
      exitCode: number | null;
      timedOut: boolean;
      outputLimitExceeded: boolean;
      stdoutBytes: number;
      stderrBytes: number;
      payload: unknown;
    }>
  > {
    return await new Promise((resolve, reject) => {
      let child: ChildProcessByStdio<null, Readable, Readable>;
      try {
        child = spawn(command.executable, command.arguments, {
          cwd: this.repositoryRoot,
          env: Object.freeze({
            DOCKER_CONFIG: command.environment.DOCKER_CONFIG,
          }),
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
        let payload: unknown = null;
        if (
          outputKind === "inspect" &&
          processState.firstFailure === null &&
          exitCode === 0
        ) {
          try {
            payload = parseCanonicalInspect(
              Uint8Array.from(
                Buffer.concat(
                  stdoutChunks.map((chunk) => Buffer.from(chunk)),
                  processState.stdoutBytes,
                ),
              ),
            );
          } catch {
            exitCode = null;
          }
        }
        resolve({
          exitCode: processState.firstFailure === null ? exitCode : null,
          timedOut: processState.firstFailure === "timeout",
          outputLimitExceeded: processState.firstFailure === "output-limit",
          stdoutBytes: processState.stdoutBytes,
          stderrBytes: processState.stderrBytes,
          payload,
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
          outputKind === "inspect" &&
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
        if (previousFailure === null) stop();
      });
      child.once("close", (exitCode) => settle(exitCode, true));
      timeout = setTimeout(() => {
        const previousFailure = processState.firstFailure;
        processState = observeOfflineBuildProcessFailure(
          processState,
          "timeout",
        );
        if (previousFailure === null) stop();
      }, limits.timeoutMs);
    });
  }

  async transfer(profileId: ProfileId): Promise<unknown> {
    const state = this.states[profileId];
    if (
      this.closed ||
      profileId !== this.currentProfile ||
      state.phase !== "started"
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    await directoryIdentity(state.layout.inputRoot, state.inputIdentity, 0o555);
    await directoryIdentity(
      state.layout.resultRoot,
      state.resultIdentity,
      0o733,
    );
    await directoryIdentity(
      state.layout.scratchRoot,
      state.scratchIdentity,
      0o733,
    );
    await directoryIdentity(state.transferRoot, state.transferIdentity);
    await this.validateConfig(state);
    exactNames(await readdir(state.layout.inputRoot), [
      "control-manifest.json",
    ]);
    exactNames(await readdir(state.layout.resultRoot), [
      "control-evidence.json",
      "result-marker.txt",
    ]);
    exactNames(
      await readdir(state.layout.scratchRoot),
      profileId === "permissive" ? ["scratch-marker.txt"] : [],
    );
    const manifestPath = path.join(
      state.layout.inputRoot,
      "control-manifest.json",
    );
    await regularFileIdentity(manifestPath, state.manifestIdentity, 0o444);
    const manifestBefore = await readIdentityFile(
      manifestPath,
      state.manifestIdentity,
      LIMITS.evidenceBytes,
    );
    const evidencePath = path.join(
      state.layout.resultRoot,
      "control-evidence.json",
    );
    await regularFileIdentity(evidencePath);
    const markerPath = path.join(state.layout.resultRoot, "result-marker.txt");
    await regularFileIdentity(markerPath);
    const transferEvidencePath = path.join(
      state.transferRoot,
      "control-evidence.json",
    );
    const transferMarkerPath = path.join(
      state.transferRoot,
      "result-marker.txt",
    );
    await this.copyFixedContainerFile(
      state,
      "/result/control-evidence.json",
      transferEvidencePath,
    );
    await this.copyFixedContainerFile(
      state,
      "/result/result-marker.txt",
      transferMarkerPath,
    );
    const evidenceIdentity = await regularFileIdentity(transferEvidencePath);
    const controlEvidence = await readIdentityFile(
      transferEvidencePath,
      evidenceIdentity,
      LIMITS.evidenceBytes,
    );
    const markerIdentity = await regularFileIdentity(transferMarkerPath);
    if (
      !equalBytes(
        await readIdentityFile(transferMarkerPath, markerIdentity, 64),
        encoder.encode("m4-result-channel-v1\n"),
      )
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    if (profileId === "permissive") {
      const scratchPath = path.join(
        state.layout.scratchRoot,
        "scratch-marker.txt",
      );
      await regularFileIdentity(scratchPath);
      const transferScratchPath = path.join(
        state.transferRoot,
        "scratch-marker.txt",
      );
      await this.copyFixedContainerFile(
        state,
        "/scratch/scratch-marker.txt",
        transferScratchPath,
      );
      const scratchIdentity = await regularFileIdentity(transferScratchPath);
      if (
        !equalBytes(
          await readIdentityFile(transferScratchPath, scratchIdentity, 64),
          encoder.encode("m4-fixed-marker-v1\n"),
        )
      ) {
        throw new Error("M4_CONTROL_TRANSFER");
      }
    }
    await regularFileIdentity(manifestPath, state.manifestIdentity, 0o444);
    const manifestAfter = await readIdentityFile(
      manifestPath,
      state.manifestIdentity,
      LIMITS.evidenceBytes,
    );
    state.phase = "transferred";
    for (const fileName of [
      "control-evidence.json",
      "result-marker.txt",
      ...(profileId === "permissive" ? ["scratch-marker.txt"] : []),
    ]) {
      await unlink(path.join(state.transferRoot, fileName));
    }
    exactNames(await readdir(state.transferRoot), []);
    await rmdir(state.transferRoot);
    const identity = fileIdentityId(state.manifestIdentity);
    return Object.freeze({
      manifestBefore,
      manifestAfter,
      manifestIdentityBefore: identity,
      manifestIdentityAfter: identity,
      manifestTypeBefore: "regular-file",
      manifestTypeAfter: "regular-file",
      manifestSymlinkBefore: false,
      manifestSymlinkAfter: false,
      controlEvidence,
      resultFiles: Object.freeze([
        "control-evidence.json",
        "result-marker.txt",
      ]),
      scratchFiles: Object.freeze(
        profileId === "permissive" ? ["scratch-marker.txt"] : [],
      ),
    });
  }

  private async copyFixedContainerFile(
    state: ProfileOwnedState,
    source: string,
    destination: string,
  ): Promise<void> {
    await requireAbsent(destination);
    const command: DockerCommand = Object.freeze({
      executable: FIXED_DOCKER_EXECUTABLE,
      arguments: Object.freeze([
        "cp",
        `${state.plan.containerName}:${source}`,
        destination,
      ]),
      environment: Object.freeze({
        DOCKER_CONFIG: state.layout.dockerConfigRoot,
      }),
      shell: false,
    });
    const result = await this.spawnFixedCommand("discard", command, {
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
    if (
      result.exitCode !== 0 ||
      result.timedOut ||
      result.outputLimitExceeded ||
      result.stdoutBytes !== 0
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
  }

  async recordProfileResult(
    profileId: ProfileId,
    result: Parameters<
      FixedExistingImageExecutionBackend["recordProfileResult"]
    >[1],
  ): Promise<void> {
    const state = this.states[profileId];
    if (
      this.closed ||
      state.phase !== "transferred" ||
      result.inspection.profileId !== profileId ||
      result.comparison.profileId !== profileId ||
      result.completion.profileId !== profileId
    ) {
      throw new Error("M4_CONTROL_RECORD");
    }
    await directoryIdentity(state.layout.hostRoot, state.hostIdentity);
    exactNames(await readdir(state.layout.hostRoot), []);
    for (const [fileName, value] of [
      ["host-inspection.json", result.inspection],
      ["completion.json", result.completion],
      ["comparison.json", result.comparison],
    ] as const) {
      await writeFile(
        path.join(state.layout.hostRoot, fileName),
        canonicalJsonBytes(value),
        { flag: "wx", mode: 0o600 },
      );
      await regularFileIdentity(path.join(state.layout.hostRoot, fileName));
    }
  }

  async cleanup(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (this.activeChildren.size !== 0) {
      throw new Error("M4_CONTROL_PROCESS_STATE");
    }
    for (const profileId of ["permissive", "constrained"] as const) {
      const state = this.states[profileId];
      await directoryIdentity(
        state.layout.dockerConfigRoot,
        state.dockerConfigIdentity,
      );
      const configPath = path.join(
        state.layout.dockerConfigRoot,
        "config.json",
      );
      await regularFileIdentity(configPath, state.configIdentity);
      await unlink(configPath);
      exactNames(await readdir(state.layout.dockerConfigRoot), []);
      await rmdir(state.layout.dockerConfigRoot);
      try {
        await directoryIdentity(state.transferRoot, state.transferIdentity);
      } catch (error) {
        if (errnoCode(error) === "ENOENT") continue;
        throw error;
      }
      exactNames(await readdir(state.transferRoot), []);
      await rmdir(state.transferRoot);
    }
  }
}

async function initializeProfileState(input: {
  readonly layout: FixedRuntimeLayout;
  readonly plan: ProfileDockerPlan;
  readonly manifestBytes: Uint8Array;
}): Promise<ProfileOwnedState> {
  const runIdentity = await createExclusiveDirectory(input.layout.runRoot);
  const inputIdentity = await createExclusiveDirectory(input.layout.inputRoot);
  const hostIdentity = await createExclusiveDirectory(input.layout.hostRoot);
  const resultIdentity = await createExclusiveDirectory(
    input.layout.resultRoot,
    0o733,
  );
  const scratchIdentity = await createExclusiveDirectory(
    input.layout.scratchRoot,
    0o733,
  );
  const dockerConfigIdentity = await createExclusiveDirectory(
    input.layout.dockerConfigRoot,
  );
  const transferRoot = path.join(input.layout.runRoot, "transfer");
  const transferIdentity = await createExclusiveDirectory(transferRoot);
  const manifestPath = path.join(
    input.layout.inputRoot,
    "control-manifest.json",
  );
  await writeFile(manifestPath, input.manifestBytes, {
    flag: "wx",
    mode: 0o444,
  });
  const manifestIdentity = await regularFileIdentity(
    manifestPath,
    undefined,
    0o444,
  );
  await chmod(input.layout.inputRoot, 0o555);
  await directoryIdentity(input.layout.inputRoot, inputIdentity, 0o555);
  const configPath = path.join(input.layout.dockerConfigRoot, "config.json");
  await writeFile(configPath, DOCKER_CONFIG_JSON, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  const configIdentity = await regularFileIdentity(configPath);
  return {
    layout: input.layout,
    plan: input.plan,
    runIdentity,
    inputIdentity,
    hostIdentity,
    resultIdentity,
    scratchIdentity,
    dockerConfigIdentity,
    transferRoot,
    transferIdentity,
    configIdentity,
    manifestIdentity,
    phase: "ready",
  };
}

interface ControlHostBackendInput {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly pair: ProfileControlPair;
  readonly plans: ProfilePairDockerPlans;
  readonly permissiveLayout: FixedRuntimeLayout;
  readonly constrainedLayout: FixedRuntimeLayout;
}

async function createControlHostBackend(
  input: ControlHostBackendInput,
  production: boolean,
): Promise<FixedExistingImageExecutionBackend> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_CONTROL_PATH");
  }
  const snapshot = assertAcceptedImageStagingSnapshot(input.acceptedSnapshot);
  assertAcceptedProfileControlPair(input.pair, snapshot);
  const pair = validateProfileControlPair(input.pair);
  assertFixedProfilePairDockerPlans(
    input.plans,
    snapshot,
    input.permissiveLayout,
    input.constrainedLayout,
  );
  const productionBinding =
    pair.containerImageDigest === FIXED_CONTROL_IMAGE_DIGEST &&
    pair.permissive.manifest.runId === FIXED_PERMISSIVE_RUN_ID &&
    pair.constrained.manifest.runId === FIXED_CONSTRAINED_RUN_ID &&
    input.permissiveLayout.runId === FIXED_PERMISSIVE_RUN_ID &&
    input.constrainedLayout.runId === FIXED_CONSTRAINED_RUN_ID;
  const testBinding =
    pair.permissive.manifest.runId === "m4-control-host-test-p-01" &&
    pair.constrained.manifest.runId === "m4-control-host-test-c-01" &&
    input.permissiveLayout.runId === pair.permissive.manifest.runId &&
    input.constrainedLayout.runId === pair.constrained.manifest.runId;
  if (
    (production ? !productionBinding : !testBinding) ||
    input.permissiveLayout.repositoryRoot !== repositoryRoot ||
    input.constrainedLayout.repositoryRoot !== repositoryRoot ||
    input.plans.permissive.containerName !==
      `tskaigi-m4-p-${pair.permissive.manifest.runId}` ||
    input.plans.constrained.containerName !==
      `tskaigi-m4-c-${pair.constrained.manifest.runId}`
  ) {
    throw new Error("M4_CONTROL_BINDING");
  }
  const resultsRoot = path.join(repositoryRoot, "results");
  const runsRoot = path.join(resultsRoot, "runs");
  const m4Root = path.join(runsRoot, "m4-profile-controls");
  await repositoryDirectory(resultsRoot);
  await repositoryDirectory(runsRoot);
  await repositoryDirectory(m4Root);
  await requireAbsent(input.permissiveLayout.runRoot);
  await requireAbsent(input.constrainedLayout.runRoot);
  const permissive = await initializeProfileState({
    layout: input.permissiveLayout,
    plan: input.plans.permissive,
    manifestBytes: serializeCanonicalControlManifest(pair.permissive.manifest),
  });
  const constrained = await initializeProfileState({
    layout: input.constrainedLayout,
    plan: input.plans.constrained,
    manifestBytes: serializeCanonicalControlManifest(pair.constrained.manifest),
  });
  return new FixedControlHostBackend(
    repositoryRoot,
    Object.freeze({ permissive, constrained }),
  );
}

export async function createFixedControlHostBackend(
  input: ControlHostBackendInput,
): Promise<FixedExistingImageExecutionBackend> {
  return await createControlHostBackend(input, true);
}

export async function createFixedControlHostBackendForTest(
  input: ControlHostBackendInput,
): Promise<FixedExistingImageExecutionBackend> {
  return await createControlHostBackend(input, false);
}
