import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import {
  chmod,
  link,
  mkdir,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_STAGING_DIGEST,
  LIMITS,
} from "../src/constants.js";

const spawnMock = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawn: spawnMock }));

class FakeChildProcess extends EventEmitter {
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  readonly kill = vi.fn(() => {
    this.killed = true;
    return true;
  });
  killed = false;
}

import {
  consumeOfflineBuildRecoveryInspectAttempt,
  createDisposableOfflineBuildRecoveryHostBackendForTest,
  createDisposableRetainedStateValidatorForTest,
  FIXED_RETAINED_STATE_INVENTORY,
} from "../src/offline-build-recovery-host-backend.js";
import { createFixedOfflineBuildRecoveryInput } from "../src/offline-build-recovery.js";
import { FilesystemIdentityLease } from "../src/filesystem-identity.js";

const repositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const testRoot = path.join(
  repositoryRoot,
  "results",
  "runs",
  "m4-profile-controls",
  "m4-recovery-state-test-primary",
);
const replacementBackup = path.join(
  path.dirname(testRoot),
  ".m4-recovery-state-test-replaced-file",
);
const RECORDED_BUILD_FAILURE = Object.freeze({
  schemaVersion: "lab-profile-offline-build-result/v1",
  validity: "inconclusive",
  primaryFailure: "CLEANUP_FAILURE",
  completedSteps: Object.freeze([
    "stage-build-context",
    "doctor",
    "build",
    "inspect-image",
  ]),
  baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
  stagingDigest: FIXED_STAGING_DIGEST,
  dockerClientVersion: "29.6.1",
  dockerServerVersion: "29.6.1",
  builtImageDigest: null,
});

beforeEach(() => {
  spawnMock.mockReset();
});

async function cleanTestRoot(): Promise<void> {
  await rm(testRoot, { recursive: true, force: true });
  await rm(replacementBackup, { force: true });
}

async function createExactTestTree(): Promise<void> {
  await cleanTestRoot();
  for (const entry of FIXED_RETAINED_STATE_INVENTORY) {
    if (entry.type !== "directory") continue;
    const target =
      entry.relativePath.length === 0
        ? testRoot
        : path.join(testRoot, entry.relativePath);
    await mkdir(target, { recursive: true, mode: entry.mode });
    await chmod(target, entry.mode);
  }
  for (const entry of FIXED_RETAINED_STATE_INVENTORY) {
    if (entry.type !== "file") continue;
    const target = path.join(testRoot, entry.relativePath);
    await writeFile(target, Buffer.alloc(entry.byteLength ?? 0), {
      flag: "wx",
      mode: entry.mode,
    });
    await chmod(target, entry.mode);
  }
}

afterEach(async () => {
  await cleanTestRoot();
});

describe("retained offline-build state metadata validator", () => {
  it("rejects every second inspect attempt", () => {
    const attempted = consumeOfflineBuildRecoveryInspectAttempt(false);
    expect(() => consumeOfflineBuildRecoveryInspectAttempt(attempted)).toThrow(
      "M4_OFFLINE_BUILD_RECOVERY_SEQUENCE",
    );
  });

  it("retains the lease until an unknown-settlement child eventually closes", async () => {
    await createExactTestTree();
    const backend =
      await createDisposableOfflineBuildRecoveryHostBackendForTest(testRoot);
    await backend.validateRetainedState();
    const { command } = createFixedOfflineBuildRecoveryInput({
      failedBuildResult: RECORDED_BUILD_FAILURE,
      backend,
    });
    let child: FakeChildProcess | null = null;
    const closeSpy = vi.spyOn(FilesystemIdentityLease.prototype, "close");
    spawnMock.mockImplementationOnce(() => {
      child = new FakeChildProcess();
      queueMicrotask(() => {
        child!.emit(
          "error",
          Object.assign(new Error("synthetic process failure"), {
            code: "SIMULATED",
          }),
        );
      });
      return child;
    });
    const result = await backend.run(command, {
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
    expect(result).toMatchObject({
      exitCode: null,
      timedOut: false,
      outputLimitExceeded: false,
      closeObserved: false,
      stdoutBytes: 0,
      stderrBytes: 0,
      stdout: new Uint8Array(),
    });
    await expect(backend.validateRetainedState()).rejects.toThrow(
      "M4_OFFLINE_BUILD_RECOVERY_SEQUENCE",
    );
    expect(closeSpy).not.toHaveBeenCalled();
    child!.emit("close", null);
    await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledTimes(1));
    closeSpy.mockRestore();
  });

  it("closes retained handles after synchronous spawn failure is consumed", async () => {
    await createExactTestTree();
    const backend =
      await createDisposableOfflineBuildRecoveryHostBackendForTest(testRoot);
    await backend.validateRetainedState();
    const { command } = createFixedOfflineBuildRecoveryInput({
      failedBuildResult: RECORDED_BUILD_FAILURE,
      backend,
    });
    const closeSpy = vi.spyOn(FilesystemIdentityLease.prototype, "close");
    spawnMock.mockImplementationOnce(() => {
      throw new Error("synthetic synchronous spawn failure");
    });
    await expect(
      backend.run(command, {
        timeoutMs: LIMITS.controlTimeoutMs,
        outputBytes: LIMITS.outputBytes,
      }),
    ).rejects.toThrow("synthetic synchronous spawn failure");
    expect(closeSpy).not.toHaveBeenCalled();
    await expect(backend.validateRetainedState()).resolves.toBeUndefined();
    expect(closeSpy).toHaveBeenCalledTimes(1);
    closeSpy.mockRestore();
  });

  it("accepts the exact disposable metadata tree without reading contents", async () => {
    await createExactTestTree();
    const validator =
      await createDisposableRetainedStateValidatorForTest(testRoot);
    await expect(validator.validate()).resolves.toBeUndefined();
    await validator.close();
  });

  it.each([
    "extra",
    "missing",
    "mode",
    "mode-setuid-dir",
    "mode-setgid-file",
    "mode-sticky-dir",
    "size",
    "type",
  ] as const)("rejects %s retained-state drift", async (drift) => {
    await createExactTestTree();
    const tokenSeed = path.join(testRoot, "docker-config", ".token_seed");
    const buildxDir = path.join(testRoot, "docker-config", "buildx");
    if (drift === "extra") {
      await writeFile(path.join(testRoot, "extra"), "x", { mode: 0o600 });
    } else if (drift === "missing") {
      await unlink(tokenSeed);
    } else if (drift === "mode") {
      await chmod(tokenSeed, 0o644);
    } else if (drift === "mode-setuid-dir") {
      await chmod(path.join(testRoot, "docker-config"), 0o4700);
    } else if (drift === "mode-setgid-file") {
      await chmod(tokenSeed, 0o2600);
    } else if (drift === "mode-sticky-dir") {
      await chmod(buildxDir, 0o1700);
    } else if (drift === "size") {
      await writeFile(tokenSeed, Buffer.alloc(75));
    } else {
      await unlink(tokenSeed);
      await mkdir(tokenSeed, { mode: 0o600 });
    }
    await expect(
      createDisposableRetainedStateValidatorForTest(testRoot),
    ).rejects.toThrow("M4_OFFLINE_BUILD_RECOVERY_STATE");
  });

  it("rejects a symlink replacement and a hard-linked file", async () => {
    await createExactTestTree();
    const lock = path.join(testRoot, "docker-config", ".token_seed.lock");
    await unlink(lock);
    await symlink(".token_seed", lock);
    await expect(
      createDisposableRetainedStateValidatorForTest(testRoot),
    ).rejects.toThrow("M4_OFFLINE_BUILD_RECOVERY_STATE");

    await createExactTestTree();
    await link(
      path.join(testRoot, "docker-config", ".token_seed"),
      path.join(testRoot, "docker-config", ".token_seed.link"),
    );
    await expect(
      createDisposableRetainedStateValidatorForTest(testRoot),
    ).rejects.toThrow("M4_OFFLINE_BUILD_RECOVERY_STATE");
  });

  it("rejects same-shape identity replacement after capture", async () => {
    await createExactTestTree();
    const validator =
      await createDisposableRetainedStateValidatorForTest(testRoot);
    const target = path.join(testRoot, "docker-config", ".token_seed");
    await rename(target, replacementBackup);
    await writeFile(target, Buffer.alloc(74), { mode: 0o600 });
    await expect(validator.validate()).rejects.toThrow(
      "M4_OFFLINE_BUILD_RECOVERY_IDENTITY",
    );
  });

  it("rejects a path outside the repository-owned disposable test namespace", async () => {
    await createExactTestTree();
    await expect(
      createDisposableRetainedStateValidatorForTest(
        path.join(path.dirname(testRoot), "m4-offline-build-20260718-01"),
      ),
    ).rejects.toThrow("M4_OFFLINE_BUILD_RECOVERY_TEST_PATH");
  });
});
