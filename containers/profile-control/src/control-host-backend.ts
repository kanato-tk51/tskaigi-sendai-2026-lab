import { spawn, type ChildProcessByStdio } from "node:child_process";
import { mkdir, readdir, realpath } from "node:fs/promises";
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
  captureDirectoryIdentity,
  captureFileIdentity,
  createExclusiveDirectoryIdentity,
  createExclusiveFileIdentity,
  FilesystemIdentityLease,
  type FileIdentityExpectations,
  type HeldFilesystemObject,
  type PrivateOwner,
  requireAbsent,
} from "./filesystem-identity.js";
import {
  createOfflineBuildProcessState,
  observeOfflineBuildProcessFailure,
  observeOfflineBuildProcessOutput,
} from "./offline-build-process.js";
import { assertAcceptedImageStagingSnapshot } from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ControlTransferProjection,
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

interface ProfileOwnedState {
  readonly layout: FixedRuntimeLayout;
  readonly plan: ProfileDockerPlan;
  readonly runIdentity: HeldFilesystemObject;
  readonly inputIdentity: HeldFilesystemObject;
  readonly hostIdentity: HeldFilesystemObject;
  readonly resultIdentity: HeldFilesystemObject;
  readonly scratchIdentity: HeldFilesystemObject;
  readonly dockerConfigIdentity: HeldFilesystemObject;
  readonly transferRoot: string;
  readonly transferIdentity: HeldFilesystemObject;
  readonly configIdentity: HeldFilesystemObject;
  readonly manifestIdentity: HeldFilesystemObject;
  containerOwner: PrivateOwner | null;
  readonly containerFiles: HeldFilesystemObject[];
  readonly transferFiles: HeldFilesystemObject[];
  readonly hostFiles: HeldFilesystemObject[];
  transferRemoved: boolean;
  phase:
    | "ready"
    | "created"
    | "inspected"
    | "started"
    | "transferred"
    | "failed"
    | "removed";
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function directoryExpectations(
  mode: number | "captured",
  owner: PrivateOwner,
  children: readonly string[],
) {
  return Object.freeze({ mode, owner, children: Object.freeze([...children]) });
}

function readableFileExpectations(input: {
  readonly mode: number;
  readonly owner: PrivateOwner;
  readonly maximumBytes: number;
  readonly expectedBytes?: Uint8Array;
}): FileIdentityExpectations {
  const base = {
    mode: input.mode,
    owner: input.owner,
    maximumBytes: input.maximumBytes,
    content: "read" as const,
  };
  return input.expectedBytes === undefined
    ? Object.freeze(base)
    : Object.freeze({ ...base, expectedBytes: input.expectedBytes });
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
    private readonly immutableInputLease: FilesystemIdentityLease | null,
    private readonly runAncestorLease: FilesystemIdentityLease,
    private readonly m4RootIdentity: HeldFilesystemObject,
    private readonly m4RootChildren: readonly string[],
    private readonly relaxSharedTestAncestor: boolean,
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
    await this.immutableInputLease?.validate();
    await this.runAncestorLease.validate();
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
      closeObserved: boolean;
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
    if (result.closeObserved) {
      await this.immutableInputLease?.validate();
      await this.validateConfig(state);
    }
    const successful =
      result.closeObserved &&
      result.exitCode === 0 &&
      !result.timedOut &&
      !result.outputLimitExceeded;
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
    await state.runIdentity.validateStable(
      directoryExpectations(0o700, state.runIdentity.owner(), [
        "container-result",
        "docker-config",
        "host",
        "input",
        "scratch",
        ...(state.transferRemoved ? [] : ["transfer"]),
      ]),
    );
    await state.dockerConfigIdentity.validateStable(
      directoryExpectations(0o700, state.runIdentity.owner(), ["config.json"]),
    );
    await state.configIdentity.validateStable(
      readableFileExpectations({
        mode: 0o600,
        owner: state.runIdentity.owner(),
        maximumBytes: 13,
        expectedBytes: encoder.encode(DOCKER_CONFIG_JSON),
      }),
    );
    if (
      !equalBytes(
        await state.configIdentity.readBytes(13),
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
      closeObserved: boolean;
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
          closeObserved,
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

  async transfer(profileId: ProfileId): Promise<ControlTransferProjection> {
    const state = this.states[profileId];
    if (
      this.closed ||
      profileId !== this.currentProfile ||
      state.phase !== "started"
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    const runOwner = state.runIdentity.owner();
    await state.inputIdentity.validateStable(
      directoryExpectations(0o555, runOwner, ["control-manifest.json"]),
    );
    await state.resultIdentity.refreshDirectoryCheckpoint(
      directoryExpectations(0o733, runOwner, [
        "control-evidence.json",
        "result-marker.txt",
      ]),
    );
    await state.scratchIdentity.refreshDirectoryCheckpoint(
      directoryExpectations(
        0o733,
        runOwner,
        profileId === "permissive" ? ["scratch-marker.txt"] : [],
      ),
    );
    await state.transferIdentity.validateStable(
      directoryExpectations(0o700, runOwner, []),
    );
    await this.validateConfig(state);
    await state.manifestIdentity.validateStable(
      readableFileExpectations({
        mode: 0o444,
        owner: runOwner,
        maximumBytes: LIMITS.evidenceBytes,
      }),
    );
    const manifestBefore = await state.manifestIdentity.readBytes(
      LIMITS.evidenceBytes,
    );
    const evidencePath = path.join(
      state.layout.resultRoot,
      "control-evidence.json",
    );
    const markerPath = path.join(state.layout.resultRoot, "result-marker.txt");
    const evidenceSource = await captureFileIdentity(
      `${profileId}:container-control-evidence`,
      evidencePath,
      {
        mode: 0o600,
        maximumBytes: LIMITS.evidenceBytes,
        content: "read",
      },
    );
    state.containerOwner = evidenceSource.owner();
    state.containerFiles.push(evidenceSource);
    const containerOwner = state.containerOwner;
    const resultMarkerBytes = encoder.encode("m4-result-channel-v1\n");
    const markerSource = await captureFileIdentity(
      `${profileId}:container-result-marker`,
      markerPath,
      readableFileExpectations({
        mode: 0o600,
        owner: containerOwner,
        maximumBytes: resultMarkerBytes.byteLength,
        expectedBytes: resultMarkerBytes,
      }),
    );
    if (evidenceSource.sameObjectAs(markerSource)) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    state.containerFiles.push(markerSource);
    let scratchSource: HeldFilesystemObject | null = null;
    if (profileId === "permissive") {
      const scratchBytes = encoder.encode("m4-fixed-marker-v1\n");
      scratchSource = await captureFileIdentity(
        `${profileId}:container-scratch-marker`,
        path.join(state.layout.scratchRoot, "scratch-marker.txt"),
        readableFileExpectations({
          mode: 0o600,
          owner: containerOwner,
          maximumBytes: scratchBytes.byteLength,
          expectedBytes: scratchBytes,
        }),
      );
      state.containerFiles.push(scratchSource);
      if (
        evidenceSource.sameObjectAs(scratchSource) ||
        markerSource.sameObjectAs(scratchSource)
      ) {
        throw new Error("M4_CONTROL_TRANSFER");
      }
    }
    const transferEvidencePath = path.join(
      state.transferRoot,
      "control-evidence.json",
    );
    const transferMarkerPath = path.join(
      state.transferRoot,
      "result-marker.txt",
    );
    const controlEvidence = await evidenceSource.readBytes(
      LIMITS.evidenceBytes,
    );
    const evidenceCopy = await this.copyFixedContainerFile(
      state,
      "/result/control-evidence.json",
      transferEvidencePath,
      evidenceSource,
      state.resultIdentity,
      ["control-evidence.json", "result-marker.txt"],
      containerOwner,
      controlEvidence,
      [],
    );
    if (
      evidenceCopy.sameObjectAs(evidenceSource) ||
      evidenceCopy.sameObjectAs(markerSource)
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    const markerCopy = await this.copyFixedContainerFile(
      state,
      "/result/result-marker.txt",
      transferMarkerPath,
      markerSource,
      state.resultIdentity,
      ["control-evidence.json", "result-marker.txt"],
      containerOwner,
      resultMarkerBytes,
      ["control-evidence.json"],
    );
    if (
      markerCopy.sameObjectAs(markerSource) ||
      markerCopy.sameObjectAs(evidenceSource) ||
      markerCopy.sameObjectAs(evidenceCopy)
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    let scratchCopy: HeldFilesystemObject | null = null;
    if (profileId === "permissive") {
      const transferScratchPath = path.join(
        state.transferRoot,
        "scratch-marker.txt",
      );
      const scratchBytes = encoder.encode("m4-fixed-marker-v1\n");
      scratchCopy = await this.copyFixedContainerFile(
        state,
        "/scratch/scratch-marker.txt",
        transferScratchPath,
        scratchSource!,
        state.scratchIdentity,
        ["scratch-marker.txt"],
        containerOwner,
        scratchBytes,
        ["control-evidence.json", "result-marker.txt"],
      );
      if (
        scratchSource === null ||
        scratchCopy.sameObjectAs(scratchSource) ||
        scratchCopy.sameObjectAs(evidenceSource) ||
        scratchCopy.sameObjectAs(markerSource) ||
        scratchCopy.sameObjectAs(evidenceCopy) ||
        scratchCopy.sameObjectAs(markerCopy)
      ) {
        throw new Error("M4_CONTROL_TRANSFER");
      }
    }
    await this.immutableInputLease?.validate();
    for (const file of state.containerFiles) {
      const expectedBytes = await file.readBytes(LIMITS.evidenceBytes);
      await file.validateStable(
        readableFileExpectations({
          mode: 0o600,
          owner: containerOwner,
          maximumBytes: LIMITS.evidenceBytes,
          expectedBytes,
        }),
      );
    }
    await state.manifestIdentity.validateStable(
      readableFileExpectations({
        mode: 0o444,
        owner: runOwner,
        maximumBytes: LIMITS.evidenceBytes,
      }),
    );
    const manifestAfter = await state.manifestIdentity.readBytes(
      LIMITS.evidenceBytes,
    );
    for (const [copy, expectedBytes, remaining] of [
      [
        scratchCopy,
        encoder.encode("m4-fixed-marker-v1\n"),
        ["control-evidence.json", "result-marker.txt"],
      ],
      [markerCopy, resultMarkerBytes, ["control-evidence.json"]],
      [evidenceCopy, controlEvidence, []],
    ] as const) {
      if (copy === null) continue;
      await copy.unlinkExpected(
        readableFileExpectations({
          mode: 0o600,
          owner: runOwner,
          maximumBytes: expectedBytes.byteLength,
          expectedBytes,
        }),
      );
      await state.transferIdentity.refreshDirectoryCheckpoint(
        directoryExpectations(0o700, runOwner, remaining),
      );
    }
    await state.transferIdentity.removeExpectedDirectory(
      directoryExpectations(0o700, runOwner, []),
    );
    state.transferRemoved = true;
    await state.runIdentity.refreshDirectoryCheckpoint(
      directoryExpectations(0o700, runOwner, [
        "container-result",
        "docker-config",
        "host",
        "input",
        "scratch",
      ]),
    );
    state.phase = "transferred";
    const scratchFiles: ControlTransferProjection["scratchFiles"] =
      profileId === "permissive"
        ? Object.freeze(["scratch-marker.txt"] as const)
        : Object.freeze([] as const);
    return Object.freeze({
      manifestBefore,
      manifestAfter,
      manifestIdentityStable: true,
      controlEvidence,
      resultFiles: Object.freeze([
        "control-evidence.json",
        "result-marker.txt",
      ] as const),
      scratchFiles,
    });
  }

  private async copyFixedContainerFile(
    state: ProfileOwnedState,
    source: string,
    destination: string,
    sourceIdentity: HeldFilesystemObject,
    sourceParent: HeldFilesystemObject,
    sourceParentChildren: readonly string[],
    containerOwner: PrivateOwner,
    expectedBytes: Uint8Array,
    transferChildrenBefore: readonly string[],
  ): Promise<HeldFilesystemObject> {
    const sourceBaseName = path.posix.basename(source);
    const expectedSourceParent = source.startsWith("/result/")
      ? state.layout.resultRoot
      : source.startsWith("/scratch/")
        ? state.layout.scratchRoot
        : null;
    if (
      expectedSourceParent === null ||
      sourceIdentity.absolutePath !==
        path.join(expectedSourceParent, sourceBaseName) ||
      sourceParent.absolutePath !== expectedSourceParent ||
      path.dirname(destination) !== state.transferRoot ||
      path.basename(destination) !== sourceBaseName
    ) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    const validateSourceBoundary = async (): Promise<void> => {
      const runOwner = state.runIdentity.owner();
      await this.immutableInputLease?.validate();
      await this.runAncestorLease.validate();
      if (!this.relaxSharedTestAncestor) {
        await this.m4RootIdentity.validateStable(
          directoryExpectations(
            "captured",
            this.m4RootIdentity.owner(),
            this.m4RootChildren,
          ),
        );
      }
      await state.runIdentity.validateStable(
        directoryExpectations(0o700, runOwner, [
          "container-result",
          "docker-config",
          "host",
          "input",
          "scratch",
          "transfer",
        ]),
      );
      await state.inputIdentity.validateStable(
        directoryExpectations(0o555, runOwner, ["control-manifest.json"]),
      );
      await state.manifestIdentity.validateStable(
        readableFileExpectations({
          mode: 0o444,
          owner: runOwner,
          maximumBytes: LIMITS.evidenceBytes,
        }),
      );
      await this.validateConfig(state);
      await sourceParent.validateStable(
        directoryExpectations(0o733, runOwner, sourceParentChildren),
      );
      await sourceIdentity.validateStable(
        readableFileExpectations({
          mode: 0o600,
          owner: containerOwner,
          maximumBytes: expectedBytes.byteLength,
          expectedBytes,
        }),
      );
    };
    await validateSourceBoundary();
    await state.transferIdentity.validateStable(
      directoryExpectations(
        0o700,
        state.runIdentity.owner(),
        transferChildrenBefore,
      ),
    );
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
    if (!result.closeObserved) {
      throw new Error("M4_CONTROL_TRANSFER");
    }
    await validateSourceBoundary();
    const successful =
      result.exitCode === 0 &&
      !result.timedOut &&
      !result.outputLimitExceeded &&
      result.stdoutBytes === 0;
    const destinationExpectations = readableFileExpectations({
      mode: 0o600,
      owner: state.runIdentity.owner(),
      maximumBytes: expectedBytes.byteLength,
      expectedBytes,
    });
    if (!successful) {
      try {
        await requireAbsent(destination);
        await state.transferIdentity.validateStable(
          directoryExpectations(
            0o700,
            state.runIdentity.owner(),
            transferChildrenBefore,
          ),
        );
      } catch {
        const retainedDestination = await captureFileIdentity(
          `failed-official-tool-transfer:${path.basename(destination)}`,
          destination,
          destinationExpectations,
        );
        state.transferFiles.push(retainedDestination);
        await state.transferIdentity.refreshDirectoryCheckpoint(
          directoryExpectations(0o700, state.runIdentity.owner(), [
            ...transferChildrenBefore,
            path.basename(destination),
          ]),
        );
      }
      throw new Error("M4_CONTROL_TRANSFER");
    }
    const transferred = await captureFileIdentity(
      `official-tool-transfer:${path.basename(destination)}`,
      destination,
      destinationExpectations,
    );
    state.transferFiles.push(transferred);
    await state.transferIdentity.refreshDirectoryCheckpoint(
      directoryExpectations(0o700, state.runIdentity.owner(), [
        ...transferChildrenBefore,
        path.basename(destination),
      ]),
    );
    return transferred;
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
    const runOwner = state.runIdentity.owner();
    await state.hostIdentity.validateStable(
      directoryExpectations(0o700, runOwner, []),
    );
    const createdNames: string[] = [];
    for (const [fileName, value] of [
      ["host-inspection.json", result.inspection],
      ["completion.json", result.completion],
      ["comparison.json", result.comparison],
    ] as const) {
      createdNames.push(fileName);
      const bytes = canonicalJsonBytes(value);
      if (bytes.byteLength > LIMITS.evidenceBytes) {
        throw new Error("M4_CONTROL_RECORD");
      }
      const record = await createExclusiveFileIdentity({
        logicalRole: `${profileId}:host-record:${fileName}`,
        parent: state.hostIdentity,
        name: fileName,
        mode: 0o600,
        bytes,
        expectedParentChildren: createdNames,
      });
      state.hostFiles.push(record);
    }
  }

  async cleanup(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (this.activeChildren.size !== 0) {
      throw new Error("M4_CONTROL_PROCESS_STATE");
    }
    try {
      await this.cleanupOwnedState();
    } catch (error) {
      await this.closeWithoutMutation();
      throw error;
    }
  }

  private async cleanupOwnedState(): Promise<void> {
    for (const profileId of ["permissive", "constrained"] as const) {
      const state = this.states[profileId];
      const runOwner = state.runIdentity.owner();
      for (const file of [...state.containerFiles, ...state.hostFiles]) {
        const bytes = await file.readBytes(LIMITS.evidenceBytes);
        await file.validateStable(
          readableFileExpectations({
            mode: 0o600,
            owner:
              state.containerFiles.includes(file) && state.containerOwner
                ? state.containerOwner
                : runOwner,
            maximumBytes: LIMITS.evidenceBytes,
            expectedBytes: bytes,
          }),
        );
      }
      await state.manifestIdentity.validateStable(
        readableFileExpectations({
          mode: 0o444,
          owner: runOwner,
          maximumBytes: LIMITS.evidenceBytes,
        }),
      );
      await state.configIdentity.unlinkExpected(
        readableFileExpectations({
          mode: 0o600,
          owner: runOwner,
          maximumBytes: 13,
          expectedBytes: encoder.encode(DOCKER_CONFIG_JSON),
        }),
      );
      await state.dockerConfigIdentity.refreshDirectoryCheckpoint(
        directoryExpectations(0o700, runOwner, []),
      );
      await state.dockerConfigIdentity.removeExpectedDirectory(
        directoryExpectations(0o700, runOwner, []),
      );
      if (!state.transferRemoved) {
        await state.transferIdentity.removeExpectedDirectory(
          directoryExpectations(0o700, runOwner, []),
        );
        state.transferRemoved = true;
      }
      await state.runIdentity.refreshDirectoryCheckpoint(
        directoryExpectations(0o700, runOwner, [
          "container-result",
          "host",
          "input",
          "scratch",
        ]),
      );
      for (const file of [
        ...state.hostFiles,
        ...state.containerFiles,
        state.manifestIdentity,
      ]) {
        await file.close();
      }
      for (const directory of [
        state.inputIdentity,
        state.hostIdentity,
        state.resultIdentity,
        state.scratchIdentity,
        state.runIdentity,
      ]) {
        await directory.close();
      }
    }
    if (!this.relaxSharedTestAncestor) {
      await this.m4RootIdentity.validateStable({
        mode: "captured",
        owner: this.m4RootIdentity.owner(),
        children: Object.freeze(
          await readdir(this.m4RootIdentity.absolutePath),
        ),
      });
    }
    await this.m4RootIdentity.close();
    await this.runAncestorLease.close();
    await this.immutableInputLease?.close();
  }

  private async closeWithoutMutation(): Promise<void> {
    const objects = new Set<HeldFilesystemObject>([this.m4RootIdentity]);
    for (const state of Object.values(this.states)) {
      for (const object of [
        ...state.hostFiles,
        ...state.transferFiles,
        ...state.containerFiles,
        state.manifestIdentity,
        state.configIdentity,
        state.transferIdentity,
        state.dockerConfigIdentity,
        state.scratchIdentity,
        state.resultIdentity,
        state.hostIdentity,
        state.inputIdentity,
        state.runIdentity,
      ]) {
        objects.add(object);
      }
    }
    for (const object of [...objects].reverse()) {
      await object.close().catch(() => undefined);
    }
    await this.runAncestorLease.close().catch(() => undefined);
    await this.immutableInputLease?.close().catch(() => undefined);
  }
}

async function initializeProfileState(input: {
  readonly layout: FixedRuntimeLayout;
  readonly plan: ProfileDockerPlan;
  readonly manifestBytes: Uint8Array;
  readonly m4RootIdentity: HeldFilesystemObject;
  readonly m4RootChildren: readonly string[];
  readonly relaxSharedTestAncestor: boolean;
}): Promise<ProfileOwnedState> {
  let runIdentity: HeldFilesystemObject;
  if (input.relaxSharedTestAncestor) {
    await requireAbsent(input.layout.runRoot);
    await mkdir(input.layout.runRoot, { mode: 0o700 });
    runIdentity = await captureDirectoryIdentity(
      `${input.layout.profileId}:run-root`,
      input.layout.runRoot,
      { mode: 0o700, children: [] },
    );
  } else {
    runIdentity = await createExclusiveDirectoryIdentity({
      logicalRole: `${input.layout.profileId}:run-root`,
      parent: input.m4RootIdentity,
      name: input.layout.runId,
      mode: 0o700,
      expectedParentChildren: input.m4RootChildren,
    });
  }
  const runChildren: string[] = [];
  const createRunDirectory = async (
    logicalRole: string,
    name: string,
    mode: number,
  ) => {
    runChildren.push(name);
    return await createExclusiveDirectoryIdentity({
      logicalRole,
      parent: runIdentity,
      name,
      mode,
      expectedParentChildren: runChildren,
    });
  };
  const inputIdentity = await createRunDirectory(
    `${input.layout.profileId}:input-root`,
    "input",
    0o700,
  );
  const hostIdentity = await createRunDirectory(
    `${input.layout.profileId}:host-root`,
    "host",
    0o700,
  );
  const resultIdentity = await createRunDirectory(
    `${input.layout.profileId}:container-result-root`,
    "container-result",
    0o733,
  );
  const scratchIdentity = await createRunDirectory(
    `${input.layout.profileId}:scratch-root`,
    "scratch",
    0o733,
  );
  const dockerConfigIdentity = await createRunDirectory(
    `${input.layout.profileId}:docker-config-root`,
    "docker-config",
    0o700,
  );
  const transferRoot = path.join(input.layout.runRoot, "transfer");
  const transferIdentity = await createRunDirectory(
    `${input.layout.profileId}:transfer-root`,
    "transfer",
    0o700,
  );
  const manifestIdentity = await createExclusiveFileIdentity({
    logicalRole: `${input.layout.profileId}:control-manifest`,
    parent: inputIdentity,
    name: "control-manifest.json",
    mode: 0o444,
    bytes: input.manifestBytes,
    expectedParentChildren: ["control-manifest.json"],
  });
  await inputIdentity.transitionDirectoryMode(0o700, 0o555, [
    "control-manifest.json",
  ]);
  const configIdentity = await createExclusiveFileIdentity({
    logicalRole: `${input.layout.profileId}:docker-config-json`,
    parent: dockerConfigIdentity,
    name: "config.json",
    mode: 0o600,
    bytes: encoder.encode(DOCKER_CONFIG_JSON),
    expectedParentChildren: ["config.json"],
  });
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
    containerOwner: null,
    containerFiles: [],
    transferFiles: [],
    hostFiles: [],
    transferRemoved: false,
    phase: "ready",
  };
}

interface ControlHostBackendInput {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly pair: ProfileControlPair;
  readonly plans: ProfilePairDockerPlans;
  readonly permissiveLayout: FixedRuntimeLayout;
  readonly constrainedLayout: FixedRuntimeLayout;
  readonly immutableInputLease?: FilesystemIdentityLease;
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
    (production && input.immutableInputLease === undefined) ||
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
  const initialM4Children = Object.freeze(await readdir(m4Root));
  let m4RootIdentity: HeldFilesystemObject;
  try {
    m4RootIdentity = await captureDirectoryIdentity("m4-run-root", m4Root, {
      mode: "captured",
      children: initialM4Children,
    });
  } catch {
    await runsIdentity.close().catch(() => undefined);
    await resultsIdentity.close().catch(() => undefined);
    await input.immutableInputLease?.close().catch(() => undefined);
    throw new Error("M4_CONTROL_PATH");
  }
  const runAncestorLease = new FilesystemIdentityLease([
    { object: resultsIdentity, expectations: resultsExpectation },
    { object: runsIdentity, expectations: runsExpectation },
  ]);
  await input.immutableInputLease?.validate();
  await runAncestorLease.validate();
  try {
    await requireAbsent(input.permissiveLayout.runRoot);
    await requireAbsent(input.constrainedLayout.runRoot);
  } catch {
    await m4RootIdentity.close().catch(() => undefined);
    await runAncestorLease.close().catch(() => undefined);
    await input.immutableInputLease?.close().catch(() => undefined);
    throw new Error("M4_CONTROL_PATH");
  }
  const permissiveM4Children = Object.freeze([
    ...initialM4Children,
    input.permissiveLayout.runId,
  ]);
  const permissive = await initializeProfileState({
    layout: input.permissiveLayout,
    plan: input.plans.permissive,
    manifestBytes: serializeCanonicalControlManifest(pair.permissive.manifest),
    m4RootIdentity,
    m4RootChildren: permissiveM4Children,
    relaxSharedTestAncestor: !production,
  });
  const constrainedM4Children = Object.freeze([
    ...permissiveM4Children,
    input.constrainedLayout.runId,
  ]);
  const constrained = await initializeProfileState({
    layout: input.constrainedLayout,
    plan: input.plans.constrained,
    manifestBytes: serializeCanonicalControlManifest(pair.constrained.manifest),
    m4RootIdentity,
    m4RootChildren: constrainedM4Children,
    relaxSharedTestAncestor: !production,
  });
  return new FixedControlHostBackend(
    repositoryRoot,
    Object.freeze({ permissive, constrained }),
    input.immutableInputLease ?? null,
    runAncestorLease,
    m4RootIdentity,
    constrainedM4Children,
    !production,
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
