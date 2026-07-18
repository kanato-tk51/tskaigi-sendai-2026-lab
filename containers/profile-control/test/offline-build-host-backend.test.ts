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
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
  type DockerCommand,
} from "../src/docker-plan.js";
import { createFixedOfflineBuildHostBackend } from "../src/offline-build-host-backend.js";
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
] as const;

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
    await expect(createFixedOfflineBuildHostBackend(test)).rejects.toThrow(
      "M4_OFFLINE_BUILD_PATH",
    );
  });
});
