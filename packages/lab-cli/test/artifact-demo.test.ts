import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH,
  ARTIFACT_DEMO_BUILD_ID,
  ARTIFACT_DEMO_COMMAND_ID,
  ARTIFACT_DEMO_LIMITATION,
  ARTIFACT_DEMO_NETWORK_LIMITATION,
  ARTIFACT_DEMO_UNSIGNED_LIMITATION,
  parseArtifactDemoReceipt,
  sha256,
} from "../src/artifact-demo-contract.js";
import {
  buildPreparedArtifact,
  completePreparedArtifactDemo,
  prepareArtifactDemoRun,
  runArtifactDemo,
} from "../src/artifact-demo.js";
import type { ArtifactDemoPaths } from "../src/artifact-demo.js";
import {
  ARTIFACT_DEMO_REPOSITORY_ROOT,
  FIXED_ARTIFACT_DEMO_PATHS,
  getFixedArtifactBuildProcessSpec,
} from "../src/artifact-demo-process.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const temporaryParent = join(ARTIFACT_DEMO_REPOSITORY_ROOT, ".tmp");
const temporaryRoots: string[] = [];

async function createFixtureRepository(): Promise<ArtifactDemoPaths> {
  await mkdir(temporaryParent, { recursive: true });
  const repositoryRoot = await mkdtemp(join(temporaryParent, "p3-unit-"));
  temporaryRoots.push(repositoryRoot);
  const sourcePath = join(
    repositoryRoot,
    "packages/lab-cli/fixture/artifact-demo/source.txt",
  );
  const lockfilePath = join(repositoryRoot, "package-lock.json");
  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(
    sourcePath,
    "TSKaigi Sendai 2026 build-once artifact\n",
    "utf8",
  );
  await writeFile(
    lockfilePath,
    '{"lockfileVersion":3,"name":"p3-test"}\n',
    "utf8",
  );
  return {
    repositoryRoot,
    sourcePath,
    lockfilePath,
    runRoot: join(
      repositoryRoot,
      "results/runs/p3-artifact-demo",
      ARTIFACT_DEMO_BUILD_ID,
    ),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map(async (root) => {
      await rm(root, { recursive: true, force: true });
    }),
  );
});

describe("P3 minimal artifact demo", () => {
  it("builds once, verifies and copies without rebuild, then rejects one changed byte", async () => {
    const paths = await createFixtureRepository();
    let buildInvocations = 0;
    const result = await runArtifactDemo(paths, async (fixedPaths) => {
      buildInvocations += 1;
      await buildPreparedArtifact(fixedPaths, {
        nodeVersion: process.version,
        forwardedEnvironmentVariableCount: 0,
      });
    });

    expect(buildInvocations).toBe(1);
    expect(result).toMatchObject({
      buildId: ARTIFACT_DEMO_BUILD_ID,
      commandId: ARTIFACT_DEMO_COMMAND_ID,
      buildInvocationCount: 1,
      verification: {
        outcome: "verified",
        operations: ["digest"],
      },
      deployment: {
        outcome: "copied",
        operations: ["copy", "post-copy-digest"],
        buildInvocations: 0,
      },
      tamper: {
        mutation: "one-byte",
        outcome: "rejected-before-copy",
        errorCode: "P3_ARTIFACT_DIGEST_MISMATCH",
        deployStarted: false,
      },
      limitations: [
        ARTIFACT_DEMO_LIMITATION,
        ARTIFACT_DEMO_UNSIGNED_LIMITATION,
        ARTIFACT_DEMO_NETWORK_LIMITATION,
      ],
    });

    const handoffArtifact = await readFile(
      join(paths.runRoot, "handoff/presentation.json"),
    );
    const deployedArtifact = await readFile(
      join(paths.runRoot, "deployment/presentation.json"),
    );
    const tamperedArtifact = await readFile(
      join(paths.runRoot, "tamper/presentation.json"),
    );
    expect(deployedArtifact).toEqual(handoffArtifact);
    expect(sha256(deployedArtifact)).toBe(result.artifactSha256);
    expect(
      [...tamperedArtifact].filter(
        (byte, index) => byte !== handoffArtifact[index],
      ),
    ).toHaveLength(1);
    await expect(
      access(join(paths.runRoot, "tamper-deployment")),
    ).rejects.toBeDefined();

    const receiptBytes = await readFile(
      join(paths.runRoot, "handoff/receipt.json"),
    );
    const receipt = parseArtifactDemoReceipt(receiptBytes);
    expect(receipt).toMatchObject({
      buildId: ARTIFACT_DEMO_BUILD_ID,
      commandId: ARTIFACT_DEMO_COMMAND_ID,
      invocationCount: 1,
      source: { kind: "dirty-tree-digest" },
      lockfile: { logicalPath: "package-lock.json" },
      tools: {
        node: process.version,
        builder: "artifact-mvp-builder/v1",
      },
      buildEnvironment: {
        forwardedEnvironmentVariableCount: 0,
        externalNetworkPolicy: "prohibited",
      },
      artifact: {
        logicalPath: ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH,
      },
    });

    await expect(
      buildPreparedArtifact(paths, {
        nodeVersion: process.version,
        forwardedEnvironmentVariableCount: 0,
      }),
    ).rejects.toMatchObject({ code: "P3_BUILD_ALREADY_INVOKED" });
  });

  it("does not retry when the exact run root already exists", async () => {
    const paths = await createFixtureRepository();
    await runArtifactDemo(paths, async (fixedPaths) => {
      await buildPreparedArtifact(fixedPaths, {
        nodeVersion: process.version,
        forwardedEnvironmentVariableCount: 0,
      });
    });

    let laterBuildInvocations = 0;
    await expect(
      runArtifactDemo(paths, async () => {
        laterBuildInvocations += 1;
      }),
    ).rejects.toMatchObject({ code: "P3_RUN_ROOT_EXISTS" });
    expect(laterBuildInvocations).toBe(0);
  });

  it("rejects a symlinked fixed source after consuming the one build marker", async () => {
    const paths = await createFixtureRepository();
    const realSourcePath = join(paths.repositoryRoot, "real-source.txt");
    await writeFile(realSourcePath, "repository-owned source\n", "utf8");
    await rm(paths.sourcePath);
    await symlink(realSourcePath, paths.sourcePath);
    await prepareArtifactDemoRun(paths);

    await expect(
      buildPreparedArtifact(paths, {
        nodeVersion: process.version,
        forwardedEnvironmentVariableCount: 0,
      }),
    ).rejects.toMatchObject({ code: "P3_INPUT_INVALID" });
    await expect(
      access(join(paths.runRoot, "build/invocation-1.json")),
    ).resolves.toBeUndefined();
  });

  it("rejects a symlinked result ancestor before creating the run root", async () => {
    const paths = await createFixtureRepository();
    const redirectedRoot = join(paths.repositoryRoot, "redirected-results");
    await mkdir(join(paths.repositoryRoot, "results"));
    await mkdir(redirectedRoot);
    await symlink(redirectedRoot, join(paths.repositoryRoot, "results/runs"));

    await expect(prepareArtifactDemoRun(paths)).rejects.toMatchObject({
      code: "P3_INPUT_INVALID",
    });
    await expect(
      access(join(redirectedRoot, "p3-artifact-demo")),
    ).rejects.toBeDefined();
  });

  it("rejects a noncanonical or mismatched receipt before deployment", async () => {
    const paths = await createFixtureRepository();
    await prepareArtifactDemoRun(paths);
    await buildPreparedArtifact(paths, {
      nodeVersion: process.version,
      forwardedEnvironmentVariableCount: 0,
    });
    const receiptPath = join(paths.runRoot, "handoff/receipt.json");
    const receipt = JSON.parse(await readFile(receiptPath, "utf8")) as Record<
      string,
      unknown
    >;
    receipt["unexpected"] = true;
    await writeFile(receiptPath, `${JSON.stringify(receipt)}\n`, "utf8");

    await expect(completePreparedArtifactDemo(paths)).rejects.toMatchObject({
      code: "P3_RECEIPT_INVALID",
    });
    await expect(
      access(join(paths.runRoot, "deployment")),
    ).rejects.toBeDefined();
  });
});

describe("P3 fixed production boundary", () => {
  it("binds one no-argument child with an empty environment and fixed repository paths", () => {
    const spec = getFixedArtifactBuildProcessSpec();
    expect(spec).toMatchObject({
      executable: process.execPath,
      arguments: [expect.stringMatching(/artifact-demo-build-entry\.js$/u)],
      cwd: ARTIFACT_DEMO_REPOSITORY_ROOT,
      environment: {},
      timeoutMs: 10_000,
      maxOutputBytes: 4 * 1024,
    });
    expect(Object.keys(spec.environment)).toHaveLength(0);
    expect(FIXED_ARTIFACT_DEMO_PATHS).toEqual({
      repositoryRoot: ARTIFACT_DEMO_REPOSITORY_ROOT,
      sourcePath: join(packageRoot, "fixture/artifact-demo/source.txt"),
      lockfilePath: join(ARTIFACT_DEMO_REPOSITORY_ROOT, "package-lock.json"),
      runRoot: join(
        ARTIFACT_DEMO_REPOSITORY_ROOT,
        "results/runs/p3-artifact-demo",
        ARTIFACT_DEMO_BUILD_ID,
      ),
    });
  });

  it("imports the implementation modules without starting a build or creating the fixed root", async () => {
    const beforeExists = await access(FIXED_ARTIFACT_DEMO_PATHS.runRoot)
      .then(() => true)
      .catch(() => false);
    await import("../src/artifact-demo.js");
    await import("../src/artifact-demo-contract.js");
    await import("../src/artifact-demo-process.js");
    const afterExists = await access(FIXED_ARTIFACT_DEMO_PATHS.runRoot)
      .then(() => true)
      .catch(() => false);
    expect(afterExists).toBe(beforeExists);
  });
});
