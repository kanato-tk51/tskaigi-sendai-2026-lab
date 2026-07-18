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

import { afterEach, describe, expect, it } from "vitest";

import {
  consumeOfflineBuildRecoveryInspectAttempt,
  createDisposableRetainedStateValidatorForTest,
  FIXED_RETAINED_STATE_INVENTORY,
} from "../src/offline-build-recovery-host-backend.js";

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

  it("accepts the exact disposable metadata tree without reading contents", async () => {
    await createExactTestTree();
    const validator =
      await createDisposableRetainedStateValidatorForTest(testRoot);
    await expect(validator.validate()).resolves.toBeUndefined();
  });

  it.each(["extra", "missing", "mode", "size", "type"] as const)(
    "rejects %s retained-state drift",
    async (drift) => {
      await createExactTestTree();
      const tokenSeed = path.join(testRoot, "docker-config", ".token_seed");
      if (drift === "extra") {
        await writeFile(path.join(testRoot, "extra"), "x", { mode: 0o600 });
      } else if (drift === "missing") {
        await unlink(tokenSeed);
      } else if (drift === "mode") {
        await chmod(tokenSeed, 0o644);
      } else if (drift === "size") {
        await writeFile(tokenSeed, Buffer.alloc(75));
      } else {
        await unlink(tokenSeed);
        await mkdir(tokenSeed, { mode: 0o600 });
      }
      await expect(
        createDisposableRetainedStateValidatorForTest(testRoot),
      ).rejects.toThrow("M4_OFFLINE_BUILD_RECOVERY_STATE");
    },
  );

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
