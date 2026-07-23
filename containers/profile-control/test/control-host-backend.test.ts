import { EventEmitter } from "node:events";
import { chmodSync, mkdirSync, renameSync } from "node:fs";
import {
  chmod,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
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

import { serializeCanonicalControlEvidence } from "../src/canonical.js";
import { createFixedControlHostBackendForTest } from "../src/control-host-backend.js";
import { createProfileControlPair } from "../src/definitions.js";
import {
  createFixedRuntimeLayout,
  createProfilePairDockerPlans,
  type DockerCommand,
} from "../src/docker-plan.js";
import { executeFixedExistingImageProfilePair } from "../src/execution.js";
import { HeldFilesystemObject } from "../src/filesystem-identity.js";
import type { ProfileControlPair, ProfileId } from "../src/types.js";
import {
  SYNTHETIC_IMAGE_DIGEST,
  syntheticAcceptedSnapshot,
  syntheticEvidence,
  syntheticInspectProjection,
} from "./helpers.js";

const repositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const permissiveRunId = "m4-control-host-test-p-01";
const constrainedRunId = "m4-control-host-test-c-01";
let transferMode = 0o600;
let containerMarkerMode = 0o600;
let replaceCopySourceParent = false;

function runRoot(runId: string): string {
  return path.join(repositoryRoot, "results/runs/m4-profile-controls", runId);
}

async function cleanTestRoots(): Promise<void> {
  for (const runId of [permissiveRunId, constrainedRunId]) {
    try {
      await chmod(path.join(runRoot(runId), "input"), 0o700);
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "ENOENT"
      ) {
        throw error;
      }
    }
  }
  await rm(runRoot(permissiveRunId), { recursive: true, force: true });
  await rm(runRoot(constrainedRunId), { recursive: true, force: true });
}

beforeEach(async () => {
  spawnMock.mockReset();
  transferMode = 0o600;
  containerMarkerMode = 0o600;
  replaceCopySourceParent = false;
  await cleanTestRoots();
});

afterEach(async () => {
  await cleanTestRoots();
});

function fixture() {
  const acceptedSnapshot = syntheticAcceptedSnapshot([
    "PATH",
    "NODE_VERSION",
    "YARN_VERSION",
  ]);
  const pair = createProfileControlPair({
    acceptedSnapshot,
    containerImageDigest: SYNTHETIC_IMAGE_DIGEST,
    permissiveRunId,
    constrainedRunId,
  });
  const permissiveLayout = createFixedRuntimeLayout(
    repositoryRoot,
    permissiveRunId,
    "permissive",
  );
  const constrainedLayout = createFixedRuntimeLayout(
    repositoryRoot,
    constrainedRunId,
    "constrained",
  );
  const plans = createProfilePairDockerPlans({
    acceptedSnapshot,
    pair,
    permissiveLayout,
    constrainedLayout,
    permissiveCanary: `m4-canary-${"a".repeat(32)}`,
    constrainedCanary: `m4-canary-${"b".repeat(32)}`,
  });
  return {
    acceptedSnapshot,
    pair,
    plans,
    permissiveLayout,
    constrainedLayout,
  };
}

async function writeControlResult(
  profileId: ProfileId,
  pair: ProfileControlPair,
): Promise<void> {
  const root = runRoot(
    profileId === "permissive" ? permissiveRunId : constrainedRunId,
  );
  await writeFile(
    path.join(root, "container-result/control-evidence.json"),
    serializeCanonicalControlEvidence(
      syntheticEvidence(pair[profileId].manifest),
    ),
    { flag: "wx", mode: 0o600 },
  );
  await writeFile(
    path.join(root, "container-result/result-marker.txt"),
    "m4-result-channel-v1\n",
    { flag: "wx", mode: containerMarkerMode },
  );
  await chmod(
    path.join(root, "container-result/result-marker.txt"),
    containerMarkerMode,
  );
  if (profileId === "permissive") {
    await writeFile(
      path.join(root, "scratch/scratch-marker.txt"),
      "m4-fixed-marker-v1\n",
      { flag: "wx", mode: 0o600 },
    );
  }
}

function installSuccessfulSpawn(pair: ProfileControlPair): void {
  spawnMock.mockImplementation(
    (_executable: string, args: readonly string[]) => {
      const child = new FakeChildProcess();
      queueMicrotask(() => {
        void (async () => {
          const operation = args[0];
          let sourceParentToReplaceAfterClose: string | null = null;
          if (operation === "inspect") {
            const profileId = args.at(-1)?.includes("-p-")
              ? "permissive"
              : "constrained";
            const layoutRoot = runRoot(
              profileId === "permissive" ? permissiveRunId : constrainedRunId,
            );
            const projection = syntheticInspectProjection({
              profile: pair[profileId].profile,
              mountSources: {
                input: path.join(layoutRoot, "input"),
                result: path.join(layoutRoot, "container-result"),
                scratch: path.join(layoutRoot, "scratch"),
              },
            }) as Record<string, unknown>;
            projection.env = [
              "PATH=/usr/local/bin",
              "NODE_VERSION=20.18.2",
              "YARN_VERSION=1.22.22",
              ...(profileId === "permissive"
                ? [`PROBE_CANARY_M4_CONTROL=m4-canary-${"a".repeat(32)}`]
                : []),
            ];
            child.stdout.write(`${JSON.stringify(projection)}\n`);
          }
          if (operation === "start") {
            const profileId = args.at(-1)?.includes("-p-")
              ? "permissive"
              : "constrained";
            await writeControlResult(profileId, pair);
          }
          if (operation === "cp") {
            const containerSource = args[1] ?? "";
            const destination = args[2] ?? "";
            const separator = containerSource.indexOf(":");
            const containerName = containerSource.slice(0, separator);
            const logicalSource = containerSource.slice(separator + 1);
            const profileId = containerName.includes("-p-")
              ? "permissive"
              : "constrained";
            const sourceRoot = runRoot(
              profileId === "permissive" ? permissiveRunId : constrainedRunId,
            );
            await writeFile(
              destination,
              await readFile(
                path.join(
                  sourceRoot,
                  logicalSource === "/scratch/scratch-marker.txt"
                    ? "scratch/scratch-marker.txt"
                    : `container-result/${path.basename(logicalSource)}`,
                ),
              ),
              { flag: "wx", mode: transferMode },
            );
            await chmod(destination, transferMode);
            if (
              replaceCopySourceParent &&
              logicalSource === "/result/control-evidence.json"
            ) {
              sourceParentToReplaceAfterClose = path.join(
                sourceRoot,
                "container-result",
              );
            }
          }
          child.stdout.end();
          child.stderr.end();
          child.emit("close", 0);
          if (sourceParentToReplaceAfterClose !== null) {
            renameSync(
              sourceParentToReplaceAfterClose,
              `${sourceParentToReplaceAfterClose}-replaced`,
            );
            mkdirSync(sourceParentToReplaceAfterClose, { mode: 0o733 });
            chmodSync(sourceParentToReplaceAfterClose, 0o733);
          }
        })();
      });
      return child;
    },
  );
}

describe("fixed production control host backend", () => {
  it("executes only the fixed existing-image lifecycle and records sanitized host files", async () => {
    const test = fixture();
    installSuccessfulSpawn(test.pair);
    const backend = await createFixedControlHostBackendForTest({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      plans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
    });
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      profilePlans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
      backend,
    });
    expect(result.primaryFailure).toBeNull();
    expect(result.validity).toBe("complete");
    expect(spawnMock).toHaveBeenCalledTimes(13);
    const allArguments = spawnMock.mock.calls.flatMap(
      (call) => call[1] as readonly string[],
    );
    expect(allArguments).not.toContain("build");
    expect(allArguments).not.toContain("image");
    expect(allArguments).not.toContain("version");
    for (const runId of [permissiveRunId, constrainedRunId]) {
      const hostRoot = path.join(runRoot(runId), "host");
      expect(
        JSON.parse(
          await readFile(path.join(hostRoot, "completion.json"), "utf8"),
        ),
      ).toMatchObject({ complete: true });
      expect(
        JSON.parse(
          await readFile(path.join(hostRoot, "host-inspection.json"), "utf8"),
        ),
      ).toMatchObject({ containerImageDigest: SYNTHETIC_IMAGE_DIGEST });
      await expect(
        readFile(path.join(runRoot(runId), "docker-config/config.json")),
      ).rejects.toMatchObject({ code: "ENOENT" });
    }
  });

  it("rejects a substituted command object before spawning", async () => {
    const test = fixture();
    const backend = await createFixedControlHostBackendForTest({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      plans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
    });
    const substituted = {
      ...test.plans.permissive.create,
      arguments: [...test.plans.permissive.create.arguments],
    } as DockerCommand;
    await expect(
      backend.run("permissive:create", substituted, {
        timeoutMs: 5_000,
        outputBytes: 65_536,
      }),
    ).rejects.toThrow("M4_CONTROL_COMMAND");
    expect(spawnMock).not.toHaveBeenCalled();
    await backend.cleanup();
  });

  it("requires both exact run roots to be absent before initialization", async () => {
    const test = fixture();
    await mkdir(test.constrainedLayout.runRoot, { mode: 0o700 });
    await expect(
      createFixedControlHostBackendForTest({
        acceptedSnapshot: test.acceptedSnapshot,
        pair: test.pair,
        plans: test.plans,
        permissiveLayout: test.permissiveLayout,
        constrainedLayout: test.constrainedLayout,
      }),
    ).rejects.toThrow("M4_CONTROL_PATH");
    await expect(
      readFile(
        path.join(test.permissiveLayout.runRoot, "input/control-manifest.json"),
      ),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it.each([
    ["official transfer mode", "transfer"],
    ["container result mode", "container"],
  ] as const)("fails closed for %s drift", async (_label, drift) => {
    const test = fixture();
    if (drift === "transfer") transferMode = 0o644;
    else containerMarkerMode = 0o644;
    installSuccessfulSpawn(test.pair);
    const backend = await createFixedControlHostBackendForTest({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      plans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
    });
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      profilePlans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
      backend,
    });
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe("TRANSFER_FAILURE");
    expect(result.permissive?.completion).toBeNull();
  });

  it("rejects source-parent replacement after a fixed copy child closes before projecting stability", async () => {
    const test = fixture();
    replaceCopySourceParent = true;
    installSuccessfulSpawn(test.pair);
    const backend = await createFixedControlHostBackendForTest({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      plans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
    });
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      profilePlans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
      backend,
    });
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe("TRANSFER_FAILURE");
    expect(result.permissive?.completion).toBeNull();
  });

  it("rejects divergent container ownership through the production transfer path", async () => {
    const test = fixture();
    installSuccessfulSpawn(test.pair);
    const originalOwner = HeldFilesystemObject.prototype.owner;
    const ownerSpy = vi
      .spyOn(HeldFilesystemObject.prototype, "owner")
      .mockImplementation(function (this: HeldFilesystemObject) {
        const owner = originalOwner.call(this);
        return this.logicalRole.endsWith(":container-control-evidence")
          ? { uid: owner.uid + 1n, gid: owner.gid }
          : owner;
      });
    const backend = await createFixedControlHostBackendForTest({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      plans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
    });
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.acceptedSnapshot,
      pair: test.pair,
      profilePlans: test.plans,
      permissiveLayout: test.permissiveLayout,
      constrainedLayout: test.constrainedLayout,
      backend,
    });
    ownerSpy.mockRestore();
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe("TRANSFER_FAILURE");
    expect(result.permissive?.completion).toBeNull();
  });
});
