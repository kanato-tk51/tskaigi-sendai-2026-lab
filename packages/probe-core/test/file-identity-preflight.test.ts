import { createHash } from "node:crypto";
import {
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";
import * as probeCore from "../src/index.js";
import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "../src/index.js";
import type {
  PreparedProbeConfiguration,
  ProbeTarget,
  RuntimeBinding,
} from "../src/index.js";
import {
  baseManifest,
  baseRuntimeBindings,
  createValidatedTestConfiguration,
  type TestCapabilityAttempt,
} from "./helpers.js";

function readTarget(targetId: string): ProbeTarget {
  return {
    targetId,
    kind: "file-read",
    classification: "canary",
    maxBytes: 1024,
  };
}

function hashTarget(
  targetId: string,
  classification: "source" | "artifact",
): ProbeTarget {
  return {
    targetId,
    kind: "file-hash",
    classification,
    maxBytes: 1024,
  };
}

function outputTarget(targetId: string): ProbeTarget {
  return {
    targetId,
    kind: "file-write",
    classification: "output",
    maxBytes: 1024,
  };
}

function binding(
  targetId: string,
  rootPath: string,
  relativePath: string,
): RuntimeBinding {
  return { targetId, kind: "path", rootPath, relativePath };
}

async function expectPreflightFailure(
  targets: readonly ProbeTarget[],
  bindings: readonly RuntimeBinding[],
  code: string,
  attempts: readonly TestCapabilityAttempt[] = [],
): Promise<void> {
  const fixture = await createValidatedTestConfiguration(
    targets,
    attempts,
    bindings,
  );
  try {
    await expect(
      prepareProbeConfiguration(fixture.configuration),
    ).rejects.toMatchObject({ code });
    expect(await readdir(fixture.eventRoot)).toEqual([]);
  } finally {
    await fixture.cleanup();
  }
}

async function createHardLinkOrSkip(
  sourcePath: string,
  destinationPath: string,
  skip: (reason?: string) => never,
): Promise<void> {
  try {
    await link(sourcePath, destinationPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EPERM" || code === "EOPNOTSUPP" || code === "ENOTSUP") {
      skip(`hard links are unavailable on this filesystem: ${code}`);
    }
    throw error;
  }
}

describe("canonical file target identity preflight", () => {
  it.each(["source", "artifact"] as const)(
    "rejects a canary direct path and %s final-symlink alias",
    async (classification) => {
      const root = await mkdtemp("/tmp/probe-core-canonical-alias-");
      await writeFile(path.join(root, "canary.txt"), "small-canary", "utf8");
      await symlink("canary.txt", path.join(root, "alias.txt"));
      try {
        await expectPreflightFailure(
          [readTarget("canary"), hashTarget("hash", classification)],
          [
            binding("canary", root, "canary.txt"),
            binding("hash", root, "alias.txt"),
          ],
          "FILE_TARGET_CANONICAL_ALIAS",
        );
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  );

  it("rejects different root strings that resolve to one canonical root/file", async () => {
    const owner = await mkdtemp("/tmp/probe-core-root-alias-");
    const root = path.join(owner, "root");
    const rootAlias = path.join(owner, "root-alias");
    await mkdir(root);
    await writeFile(path.join(root, "canary.txt"), "small-canary", "utf8");
    await symlink(root, rootAlias);
    try {
      await expectPreflightFailure(
        [readTarget("canary"), hashTarget("source", "source")],
        [
          binding("canary", rootAlias, "canary.txt"),
          binding("source", root, "canary.txt"),
        ],
        "FILE_TARGET_CANONICAL_ALIAS",
      );
    } finally {
      await rm(owner, { recursive: true, force: true });
    }
  });

  it("rejects a nested symlink chain that resolves to the same file", async () => {
    const root = await mkdtemp("/tmp/probe-core-nested-alias-");
    await mkdir(path.join(root, "real"));
    await writeFile(path.join(root, "real", "canary.txt"), "small", "utf8");
    await symlink("real", path.join(root, "alias-one"));
    await symlink("alias-one", path.join(root, "alias-two"));
    try {
      await expectPreflightFailure(
        [readTarget("canary"), hashTarget("source", "source")],
        [
          binding("canary", root, "real/canary.txt"),
          binding("source", root, "alias-two/canary.txt"),
        ],
        "FILE_TARGET_CANONICAL_ALIAS",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects canonical aliases even when classifications are the same", async () => {
    const root = await mkdtemp("/tmp/probe-core-same-class-alias-");
    await writeFile(path.join(root, "source.txt"), "source", "utf8");
    await symlink("source.txt", path.join(root, "source-alias.txt"));
    try {
      await expectPreflightFailure(
        [hashTarget("source-a", "source"), hashTarget("source-b", "source")],
        [
          binding("source-a", root, "source.txt"),
          binding("source-b", root, "source-alias.txt"),
        ],
        "FILE_TARGET_CANONICAL_ALIAS",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  for (const [leftClassification, rightClassification] of [
    ["canary", "source"],
    ["canary", "artifact"],
    ["source", "artifact"],
  ] as const) {
    it(`rejects a ${leftClassification}/${rightClassification} hard-link identity alias`, async (context) => {
      const root = await mkdtemp("/tmp/probe-core-hardlink-alias-");
      const originalPath = path.join(root, "original.txt");
      const aliasPath = path.join(root, "hard-link.txt");
      await writeFile(originalPath, "small-canary", "utf8");
      try {
        await createHardLinkOrSkip(originalPath, aliasPath, (reason) =>
          context.skip(reason),
        );
        const leftTarget =
          leftClassification === "canary"
            ? readTarget("left")
            : hashTarget("left", leftClassification);
        await expectPreflightFailure(
          [leftTarget, hashTarget("right", rightClassification)],
          [
            binding("left", root, "original.txt"),
            binding("right", root, "hard-link.txt"),
          ],
          "FILE_TARGET_IDENTITY_ALIAS",
          leftClassification === "canary"
            ? [
                {
                  attemptId: "read-attempt",
                  type: "canary-file-read",
                  targetId: "left",
                  enabled: true,
                },
                {
                  attemptId: "hash-attempt",
                  type: "file-hash",
                  targetId: "right",
                  enabled: true,
                  hashPosition: "before",
                },
              ]
            : [],
        );
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });
  }
});

describe("planned output identity preflight", () => {
  it.each(["canary", "source", "artifact"] as const)(
    "rejects an output planned path that aliases a %s target",
    async (classification) => {
      const owner = await mkdtemp("/tmp/probe-core-output-existing-alias-");
      const root = path.join(owner, "root");
      const rootAlias = path.join(owner, "root-alias");
      await mkdir(root);
      await writeFile(path.join(root, "target.txt"), "existing", "utf8");
      await symlink(root, rootAlias);
      const existingTarget =
        classification === "canary"
          ? readTarget("existing")
          : hashTarget("existing", classification);
      try {
        await expectPreflightFailure(
          [existingTarget, outputTarget("output")],
          [
            binding("existing", root, "target.txt"),
            binding("output", rootAlias, "target.txt"),
          ],
          "FILE_TARGET_OUTPUT_ALIAS",
        );
      } finally {
        await rm(owner, { recursive: true, force: true });
      }
    },
  );

  it("rejects two outputs with the same planned canonical path", async () => {
    const owner = await mkdtemp("/tmp/probe-core-output-alias-");
    const root = path.join(owner, "root");
    const rootAlias = path.join(owner, "root-alias");
    await mkdir(root);
    await symlink(root, rootAlias);
    try {
      await expectPreflightFailure(
        [outputTarget("output-a"), outputTarget("output-b")],
        [
          binding("output-a", root, "marker.json"),
          binding("output-b", rootAlias, "marker.json"),
        ],
        "FILE_TARGET_OUTPUT_ALIAS",
      );
    } finally {
      await rm(owner, { recursive: true, force: true });
    }
  });

  it("rejects two outputs that alias through a parent symlink", async () => {
    const root = await mkdtemp("/tmp/probe-core-output-parent-alias-");
    await mkdir(path.join(root, "real"));
    await symlink("real", path.join(root, "alias"));
    try {
      await expectPreflightFailure(
        [outputTarget("output-a"), outputTarget("output-b")],
        [
          binding("output-a", root, "real/marker.json"),
          binding("output-b", root, "alias/marker.json"),
        ],
        "FILE_TARGET_OUTPUT_ALIAS",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an existing output that is a hard-link identity alias", async (context) => {
    const root = await mkdtemp("/tmp/probe-core-output-hardlink-alias-");
    const sourcePath = path.join(root, "source.txt");
    await writeFile(sourcePath, "source", "utf8");
    try {
      await createHardLinkOrSkip(
        sourcePath,
        path.join(root, "output.txt"),
        (reason) => context.skip(reason),
      );
      await expectPreflightFailure(
        [hashTarget("source", "source"), outputTarget("output")],
        [
          binding("source", root, "source.txt"),
          binding("output", root, "output.txt"),
        ],
        "FILE_TARGET_IDENTITY_ALIAS",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("distinguishes existing output, final symlink, and dangling symlink", async () => {
    const root = await mkdtemp("/tmp/probe-core-output-rejections-");
    await writeFile(path.join(root, "existing.txt"), "existing", "utf8");
    await symlink("existing.txt", path.join(root, "final-link"));
    await symlink("missing.txt", path.join(root, "dangling-link"));
    try {
      await expectPreflightFailure(
        [outputTarget("output")],
        [binding("output", root, "existing.txt")],
        "FILE_ALREADY_EXISTS",
      );
      for (const relativePath of ["final-link", "dangling-link"]) {
        await expectPreflightFailure(
          [outputTarget("output")],
          [binding("output", root, relativePath)],
          "SYMLINK_ESCAPE",
        );
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("prepares distinct existing and output targets in same and different roots", async () => {
    const firstRoot = await mkdtemp("/tmp/probe-core-distinct-first-");
    const secondRoot = await mkdtemp("/tmp/probe-core-distinct-second-");
    await writeFile(path.join(firstRoot, "canary.txt"), "canary", "utf8");
    await writeFile(path.join(firstRoot, "source.txt"), "source", "utf8");
    await writeFile(path.join(secondRoot, "artifact.txt"), "artifact", "utf8");
    const fixture = await createValidatedTestConfiguration(
      [
        readTarget("canary"),
        hashTarget("source", "source"),
        hashTarget("artifact", "artifact"),
        outputTarget("output"),
      ],
      [],
      [
        binding("canary", firstRoot, "canary.txt"),
        binding("source", firstRoot, "source.txt"),
        binding("artifact", secondRoot, "artifact.txt"),
        binding("output", secondRoot, "marker.json"),
      ],
    );
    try {
      await expect(
        prepareProbeConfiguration(fixture.configuration),
      ).resolves.toBeDefined();
    } finally {
      await fixture.cleanup();
      await rm(firstRoot, { recursive: true, force: true });
      await rm(secondRoot, { recursive: true, force: true });
    }
  });

  it("allows an in-root symlink when it resolves to a distinct file", async () => {
    const root = await mkdtemp("/tmp/probe-core-distinct-symlink-");
    await writeFile(path.join(root, "canary.txt"), "canary", "utf8");
    await writeFile(path.join(root, "source.txt"), "source", "utf8");
    await symlink("source.txt", path.join(root, "source-link.txt"));
    const fixture = await createValidatedTestConfiguration(
      [readTarget("canary"), hashTarget("source", "source")],
      [],
      [
        binding("canary", root, "canary.txt"),
        binding("source", root, "source-link.txt"),
      ],
    );
    try {
      await expect(
        prepareProbeConfiguration(fixture.configuration),
      ).resolves.toBeDefined();
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("prepared configuration and digest non-disclosure", () => {
  it("uses one prepared snapshot for read, source hash, artifact hash, and write", async () => {
    const root = await mkdtemp("/tmp/probe-core-prepared-success-");
    const rawCanary = "low-entropy-canary";
    await writeFile(path.join(root, "canary.txt"), rawCanary, "utf8");
    await writeFile(path.join(root, "source.txt"), "source", "utf8");
    await writeFile(path.join(root, "artifact.txt"), "artifact", "utf8");
    const attempts: TestCapabilityAttempt[] = [
      {
        attemptId: "read",
        type: "canary-file-read",
        targetId: "canary",
        enabled: true,
      },
      {
        attemptId: "source-hash",
        type: "file-hash",
        targetId: "source",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: "artifact-hash",
        type: "file-hash",
        targetId: "artifact",
        enabled: true,
        hashPosition: "after",
      },
      {
        attemptId: "write",
        type: "direct-filesystem-write",
        targetId: "output",
        enabled: true,
      },
    ];
    const fixture = await createValidatedTestConfiguration(
      [
        readTarget("canary"),
        hashTarget("source", "source"),
        hashTarget("artifact", "artifact"),
        outputTarget("output"),
      ],
      attempts,
      [
        binding("canary", root, "canary.txt"),
        binding("source", root, "source.txt"),
        binding("artifact", root, "artifact.txt"),
        binding("output", root, "marker.json"),
      ],
    );
    try {
      const prepared = await prepareProbeConfiguration(fixture.configuration);
      const session = await createProbeSession(prepared);
      const events = [];
      for (const attempt of attempts) {
        events.push(await session.runAttempt(attempt.attemptId));
      }
      await session.close();
      expect(events.every((event) => event.outcome === "success")).toBe(true);
      expect(events[1]?.beforeHash).toMatch(/^sha256:/u);
      expect(events[2]?.afterHash).toMatch(/^sha256:/u);

      const canaryDigest = createHash("sha256").update(rawCanary).digest("hex");
      const serializedEvents = JSON.stringify(events);
      const jsonl = await readFile(fixture.eventPath, "utf8");
      for (const evidence of [serializedEvents, jsonl]) {
        expect(evidence).not.toContain(rawCanary);
        expect(evidence).not.toContain(canaryDigest);
        expect(evidence).not.toContain(root);
        expect(evidence).not.toContain("canonicalPath");
        expect(evidence).not.toContain("deviceId");
        expect(evidence).not.toContain("inodeId");
      }
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not export a raw binding or target hash helper", () => {
    expect("calculateBoundFileSha256" in probeCore).toBe(false);
    expect("calculatePreparedFileSha256" in probeCore).toBe(false);
  });

  it("rejects an alias before creating a segment or exposing a canary digest", async () => {
    const root = await mkdtemp("/tmp/probe-core-canary-digest-alias-");
    const rawCanary = "1234";
    const canaryPath = path.join(root, "canary.txt");
    await writeFile(canaryPath, rawCanary, "utf8");
    await symlink("canary.txt", path.join(root, "source.txt"));
    const fixture = await createValidatedTestConfiguration(
      [readTarget("canary"), hashTarget("source", "source")],
      [
        {
          attemptId: "read",
          type: "canary-file-read",
          targetId: "canary",
          enabled: true,
        },
        {
          attemptId: "hash",
          type: "file-hash",
          targetId: "source",
          enabled: true,
          hashPosition: "before",
        },
      ],
      [
        binding("canary", root, "canary.txt"),
        binding("source", root, "source.txt"),
      ],
    );
    try {
      const failure = await prepareProbeConfiguration(
        fixture.configuration,
      ).catch((error: unknown) => error);
      expect(failure).toMatchObject({ code: "FILE_TARGET_CANONICAL_ALIAS" });
      expect(JSON.stringify(failure)).not.toContain(
        createHash("sha256").update(rawCanary).digest("hex"),
      );
      expect(JSON.stringify(failure)).not.toContain(root);
      expect(await readdir(fixture.eventRoot)).toEqual([]);
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("uses private immutable prepared state after external mutation attempts", async () => {
    const root = await mkdtemp("/tmp/probe-core-prepared-mutation-");
    await writeFile(path.join(root, "canary.txt"), "canary", "utf8");
    const target = {
      targetId: "canary",
      kind: "file-read",
      classification: "canary",
      maxBytes: 1024,
    };
    const runtimeBinding = {
      targetId: "canary",
      kind: "path",
      rootPath: root,
      relativePath: "canary.txt",
    };
    const validated = validateProbeConfiguration(
      baseManifest(
        [target as ProbeTarget],
        [
          {
            attemptId: "read",
            type: "canary-file-read",
            targetId: "canary",
            enabled: true,
          },
        ],
      ),
      baseRuntimeBindings(root, [runtimeBinding as RuntimeBinding]),
    );
    const prepared = await prepareProbeConfiguration(validated);
    Object.assign(target, {
      kind: "file-hash",
      classification: "source",
    });
    Object.assign(runtimeBinding, { relativePath: "changed.txt" });
    expect(
      Reflect.set(
        prepared.runtimeBindings.bindings[0] as object,
        "relativePath",
        "changed.txt",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        prepared.manifest.targets[0] as object,
        "classification",
        "source",
      ),
    ).toBe(false);
    try {
      const session = await createProbeSession(prepared);
      const event = await session.runAttempt("read");
      await session.close();
      expect(event).toMatchObject({
        outcome: "success",
        details: { kind: "file-read", readSucceeded: true },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects forged and structurally validated but unprepared configurations", async () => {
    const eventRoot = await mkdtemp("/tmp/probe-core-unprepared-");
    const validated = validateProbeConfiguration(
      baseManifest(),
      baseRuntimeBindings(eventRoot),
    );
    const forged = Object.freeze({
      manifest: validated.manifest,
      runtimeBindings: validated.runtimeBindings,
    }) as PreparedProbeConfiguration;
    try {
      await expect(createProbeSession(forged)).rejects.toMatchObject({
        code: "INVALID_MANIFEST",
      });
      await expect(
        createProbeSession(validated as unknown as PreparedProbeConfiguration),
      ).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
      expect(await readdir(eventRoot)).toEqual([]);
    } finally {
      await rm(eventRoot, { recursive: true, force: true });
    }
  });
});
