import {
  chmod,
  link,
  mkdir,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { EventEmitter } from "node:events";
import path from "node:path";
import { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  createFixedRuntimeLayout,
  createImageBuildPlan,
  type DockerCommand,
} from "../src/docker-plan.js";
import { createFixedOfflineBuildHostBackend } from "../src/offline-build-host-backend.js";
import { FIXED_RETAINED_STATE_INVENTORY } from "../src/offline-build-recovery-host-backend.js";
import { acceptedRepositorySnapshot } from "./helpers.js";

const repositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const runIds = [
  "m4-offline-host-positive",
  "m4-offline-host-extra",
  "m4-offline-host-hardlink",
  "m4-offline-host-symlink",
  "m4-offline-host-permission",
  "m4-offline-host-preexisting",
  "m4-offline-host-checkpoints",
  "m4-offline-host-partial-checkpoint",
  "m4-offline-host-ref-mode",
  "m4-offline-host-size-drift",
  "m4-offline-host-extra-config",
  "m4-offline-host-premature-config",
] as const;

let runtimeDrift:
  "extra" | "partial" | "premature" | "ref-mode" | "size" | null = null;

async function materializeRuntimeConfiguration(
  dockerConfigRoot: string,
  throughBuild: boolean,
): Promise<void> {
  const runtimeEntries = FIXED_RETAINED_STATE_INVENTORY.filter((entry) =>
    throughBuild
      ? entry.relativePath.startsWith("docker-config/buildx")
      : [
          "docker-config/.token_seed",
          "docker-config/.token_seed.lock",
        ].includes(entry.relativePath),
  );
  for (const entry of runtimeEntries) {
    if (
      runtimeDrift === "partial" &&
      entry.relativePath === "docker-config/.token_seed.lock"
    ) {
      continue;
    }
    const target = path.join(
      path.dirname(dockerConfigRoot),
      entry.relativePath,
    );
    if (entry.type === "directory") {
      await mkdir(target, { recursive: true, mode: entry.mode });
      await chmod(target, entry.mode);
      continue;
    }
    const mode =
      runtimeDrift === "ref-mode" && entry.mode === 0o644 ? 0o600 : entry.mode;
    const byteLength =
      runtimeDrift === "size" &&
      entry.relativePath === "docker-config/.token_seed"
        ? 75
        : (entry.byteLength ?? 0);
    await writeFile(target, Buffer.alloc(byteLength), {
      flag: "wx",
      mode,
    });
    await chmod(target, mode);
  }
  if (!throughBuild && runtimeDrift === "extra") {
    await writeFile(path.join(dockerConfigRoot, ".unexpected"), "x", {
      flag: "wx",
      mode: 0o600,
    });
  }
  if (!throughBuild && runtimeDrift === "premature") {
    await mkdir(path.join(dockerConfigRoot, "buildx"), { mode: 0o700 });
  }
}

function installRuntimeSpawn(): void {
  spawnMock.mockImplementation(
    (_executable: string, args: readonly string[], options: unknown) => {
      const child = new FakeChildProcess();
      queueMicrotask(() => {
        void (async () => {
          const dockerConfigRoot = (
            options as { env: { DOCKER_CONFIG: string } }
          ).env.DOCKER_CONFIG;
          if (args[0] === "version") {
            await materializeRuntimeConfiguration(dockerConfigRoot, false);
            child.stdout.write('{"client":"29.6.1","server":"29.6.1"}\n');
          } else if (args[0] === "build") {
            await materializeRuntimeConfiguration(dockerConfigRoot, true);
          } else {
            child.stdout.write(
              `${JSON.stringify(`sha256:${"3".repeat(64)}`)}\n`,
            );
          }
          child.stdout.end();
          child.stderr.end();
          child.emit("close", 0);
        })();
      });
      return child;
    },
  );
}

beforeEach(() => {
  spawnMock.mockReset();
  runtimeDrift = null;
});

function runRoot(runId: string): string {
  return path.join(
    repositoryRoot,
    "results",
    "runs",
    "m4-profile-controls",
    runId,
  );
}

async function cleanTestRoots(): Promise<void> {
  for (const runId of runIds) {
    await rm(runRoot(runId), { recursive: true, force: true });
  }
}

afterEach(async () => {
  await cleanTestRoots();
});

async function fixture(runId: (typeof runIds)[number]) {
  const acceptedSnapshot = await acceptedRepositorySnapshot();
  const layout = createFixedRuntimeLayout(repositoryRoot, runId, "permissive");
  const imageBuildPlan = createImageBuildPlan({ acceptedSnapshot, layout });
  return {
    acceptedSnapshot,
    layout,
    imageBuildPlan,
  };
}

describe("fixed production offline-build host backend", () => {
  it("creates private exact staging/config state and rejects command substitution before spawn", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-positive");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const files = await import("../src/staging.js").then(
      ({ copyAcceptedStagingFiles }) =>
        copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    await backend.stageBuildContext(files);
    expect(await backend.readBuildContext()).toHaveLength(4);
    expect(
      await readFile(
        path.join(test.layout.dockerConfigRoot, "config.json"),
        "utf8",
      ),
    ).toBe('{"auths":{}}\n');
    const substituted = {
      ...test.imageBuildPlan.doctor,
      arguments: [...test.imageBuildPlan.doctor.arguments],
    } as DockerCommand;
    await expect(
      backend.run("doctor", substituted, {
        timeoutMs: 5_000,
        outputBytes: 65_536,
      }),
    ).rejects.toThrow("M4_OFFLINE_BUILD_COMMAND");
    await backend.cleanup();
    await expect(
      import("node:fs/promises").then(({ lstat }) =>
        lstat(test.layout.runRoot),
      ),
    ).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("rejects an extra staged file and fails cleanup closed", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-extra");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const { copyAcceptedStagingFiles } = await import("../src/staging.js");
    await backend.stageBuildContext(
      copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    await writeFile(
      path.join(test.layout.stagingRoot, "extra.txt"),
      "extra\n",
      {
        flag: "wx",
        mode: 0o600,
      },
    );
    await expect(backend.readBuildContext()).rejects.toThrow(
      "M4_OFFLINE_BUILD_INVENTORY",
    );
    await expect(backend.cleanup()).rejects.toThrow(
      "M4_OFFLINE_BUILD_INVENTORY",
    );
  });

  it("rejects hard-linked staged identity drift", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-hardlink");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const { copyAcceptedStagingFiles } = await import("../src/staging.js");
    await backend.stageBuildContext(
      copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    await link(
      path.join(test.layout.stagingRoot, "Containerfile"),
      path.join(test.layout.stagingRoot, "hardlink.txt"),
    );
    await expect(backend.readBuildContext()).rejects.toThrow();
    await expect(backend.cleanup()).rejects.toThrow();
  });

  it("rejects a symlink replacement of a staged file", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-symlink");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const { copyAcceptedStagingFiles } = await import("../src/staging.js");
    await backend.stageBuildContext(
      copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    const canaryPath = path.join(
      test.layout.stagingRoot,
      "fixture",
      "canary.txt",
    );
    await unlink(canaryPath);
    await symlink("../Containerfile", canaryPath);
    await expect(backend.readBuildContext()).rejects.toThrow();
    await expect(backend.cleanup()).rejects.toThrow();
  });

  it("rejects staged file permission drift", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-permission");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const { copyAcceptedStagingFiles } = await import("../src/staging.js");
    await backend.stageBuildContext(
      copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    await chmod(path.join(test.layout.stagingRoot, "Containerfile"), 0o644);
    await expect(backend.readBuildContext()).rejects.toThrow();
    await expect(backend.cleanup()).rejects.toThrow();
  });

  it("rejects a pre-existing exact run directory", async () => {
    await cleanTestRoots();
    const test = await fixture("m4-offline-host-preexisting");
    await mkdir(test.layout.runRoot, { recursive: true, mode: 0o700 });
    await expect(createFixedOfflineBuildHostBackend(test)).rejects.toThrow();
  });

  it("accepts only the exact post-close doctor/build/inspect configuration checkpoints and cleans deepest-first", async () => {
    await cleanTestRoots();
    installRuntimeSpawn();
    const test = await fixture("m4-offline-host-checkpoints");
    const backend = await createFixedOfflineBuildHostBackend(test);
    const { copyAcceptedStagingFiles } = await import("../src/staging.js");
    await backend.stageBuildContext(
      copyAcceptedStagingFiles(test.acceptedSnapshot),
    );
    for (const [stepId, command] of [
      ["doctor", test.imageBuildPlan.doctor],
      ["build", test.imageBuildPlan.build],
      ["inspect-image", test.imageBuildPlan.inspectImage],
    ] as const) {
      await expect(
        backend.run(stepId, command, {
          timeoutMs: 5_000,
          outputBytes: 65_536,
        }),
      ).resolves.toMatchObject({ closeObserved: true, exitCode: 0 });
    }
    await backend.cleanup();
    await expect(
      import("node:fs/promises").then(({ lstat }) =>
        lstat(test.layout.runRoot),
      ),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it.each([
    ["partial", "doctor"],
    ["ref-mode", "build"],
    ["size", "doctor"],
    ["extra", "doctor"],
    ["premature", "doctor"],
  ] as const)(
    "retains state for a %s runtime configuration checkpoint",
    async (drift, failingStep) => {
      await cleanTestRoots();
      runtimeDrift = drift;
      installRuntimeSpawn();
      const runId =
        drift === "partial"
          ? "m4-offline-host-partial-checkpoint"
          : drift === "ref-mode"
            ? "m4-offline-host-ref-mode"
            : drift === "size"
              ? "m4-offline-host-size-drift"
              : drift === "extra"
                ? "m4-offline-host-extra-config"
                : "m4-offline-host-premature-config";
      const test = await fixture(runId);
      const backend = await createFixedOfflineBuildHostBackend(test);
      const { copyAcceptedStagingFiles } = await import("../src/staging.js");
      await backend.stageBuildContext(
        copyAcceptedStagingFiles(test.acceptedSnapshot),
      );
      if (failingStep === "build") {
        await backend.run("doctor", test.imageBuildPlan.doctor, {
          timeoutMs: 5_000,
          outputBytes: 65_536,
        });
      }
      await expect(
        backend.run(
          failingStep,
          test.imageBuildPlan[failingStep === "doctor" ? "doctor" : "build"],
          {
            timeoutMs: 5_000,
            outputBytes: 65_536,
          },
        ),
      ).rejects.toThrow();
      await expect(backend.cleanup()).rejects.toThrow();
      await expect(
        import("node:fs/promises").then(({ lstat }) =>
          lstat(test.layout.runRoot),
        ),
      ).resolves.toBeDefined();
    },
  );
});
