import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ProbeError,
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
  validateProbeManifest,
} from "../src/index.js";
import type { ProbeTarget, RuntimeBinding } from "../src/index.js";
import {
  baseManifest,
  baseRuntimeBindings,
  createTestConfiguration,
  createValidatedTestConfiguration,
  type TestCapabilityAttempt,
} from "./helpers.js";

async function runFileAttempt(
  target: ProbeTarget,
  attempt: TestCapabilityAttempt,
  binding: RuntimeBinding,
) {
  const fixture = await createTestConfiguration([target], [attempt], [binding]);
  const session = await createProbeSession(fixture.configuration);
  const event = await session.runAttempt(attempt.attemptId);
  await session.close();
  return { event, fixture };
}

async function expectFilePreflightFailure(
  target: ProbeTarget,
  attempt: TestCapabilityAttempt,
  binding: RuntimeBinding,
  expectedCode: string,
): Promise<void> {
  const fixture = await createValidatedTestConfiguration(
    [target],
    [attempt],
    [binding],
  );
  try {
    await expect(
      prepareProbeConfiguration(fixture.configuration),
    ).rejects.toMatchObject({ code: expectedCode });
  } finally {
    await fixture.cleanup();
  }
}

describe("allowlisted file read attempt", () => {
  it("records reachability and size without content or a content hash", async () => {
    const root = await mkdtemp("/tmp/probe-core-read-");
    const rawCanary = "disposable-file-canary";
    await writeFile(path.join(root, "canary.txt"), rawCanary, "utf8");
    const { event, fixture } = await runFileAttempt(
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
      {
        attemptId: "read-attempt",
        type: "canary-file-read",
        targetId: "read-target",
        enabled: true,
      },
      {
        targetId: "read-target",
        kind: "path",
        rootPath: root,
        relativePath: "canary.txt",
      },
    );
    try {
      expect(event.outcome).toBe("success");
      expect(event.beforeHash).toBeNull();
      expect(event.afterHash).toBeNull();
      expect(event.details).toEqual({
        kind: "file-read",
        present: true,
        regularFile: true,
        readSucceeded: true,
        sizeBytes: Buffer.byteLength(rawCanary),
      });
      const serialized = JSON.stringify(event);
      const canaryHash = createHash("sha256").update(rawCanary).digest("hex");
      expect(serialized).not.toContain(rawCanary);
      expect(serialized).not.toContain(canaryHash);
      const jsonl = await readFile(fixture.eventPath, "utf8");
      expect(jsonl).not.toContain(rawCanary);
      expect(jsonl).not.toContain(canaryHash);
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects a missing file during preflight", async () => {
    const root = await mkdtemp("/tmp/probe-core-read-");
    await expectFilePreflightFailure(
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
      {
        attemptId: "read-attempt",
        type: "canary-file-read",
        targetId: "read-target",
        enabled: true,
      },
      {
        targetId: "read-target",
        kind: "path",
        rootPath: root,
        relativePath: "missing.txt",
      },
      "FILE_NOT_FOUND",
    );
    await rm(root, { recursive: true, force: true });
  });

  it("rejects absolute outside-root and traversal bindings", () => {
    const manifest = baseManifest([
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
    ]);
    for (const [relativePath, expectedCode] of [
      ["/tmp/outside.txt", "PATH_OUTSIDE_ALLOWED_ROOT"],
      ["../outside.txt", "PATH_TRAVERSAL"],
    ] as const) {
      expect(() =>
        validateProbeConfiguration(
          manifest,
          baseRuntimeBindings("/tmp/probe-core-events-validation", [
            {
              targetId: "read-target",
              kind: "path",
              rootPath: "/tmp/probe-core-root",
              relativePath,
            },
          ]),
        ),
      ).toThrowError(expect.objectContaining({ code: expectedCode }));
    }
  });

  it("rejects a symlink escape", async () => {
    const root = await mkdtemp("/tmp/probe-core-read-");
    const outside = await mkdtemp("/tmp/probe-core-outside-");
    await writeFile(path.join(outside, "canary.txt"), "outside", "utf8");
    await symlink(
      path.join(outside, "canary.txt"),
      path.join(root, "link.txt"),
    );
    await expectFilePreflightFailure(
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
      {
        attemptId: "read-attempt",
        type: "canary-file-read",
        targetId: "read-target",
        enabled: true,
      },
      {
        targetId: "read-target",
        kind: "path",
        rootPath: root,
        relativePath: "link.txt",
      },
      "SYMLINK_ESCAPE",
    );
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });

  it("allows a symlinked root and an in-root final symlink", async () => {
    const owner = await mkdtemp("/tmp/probe-core-read-owner-");
    const root = path.join(owner, "actual-root");
    const rootLink = path.join(owner, "root-link");
    await mkdir(root);
    await writeFile(path.join(root, "canary.txt"), "inside", "utf8");
    await symlink(root, rootLink);
    await symlink("canary.txt", path.join(root, "canary-link.txt"));

    const { event, fixture } = await runFileAttempt(
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
      {
        attemptId: "read-attempt",
        type: "canary-file-read",
        targetId: "read-target",
        enabled: true,
      },
      {
        targetId: "read-target",
        kind: "path",
        rootPath: rootLink,
        relativePath: "canary-link.txt",
      },
    );
    try {
      expect(event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
      });
    } finally {
      await fixture.cleanup();
      await rm(owner, { recursive: true, force: true });
    }
  });

  it("rejects a dangling final symlink as missing during preflight", async () => {
    const root = await mkdtemp("/tmp/probe-core-read-");
    await symlink("missing.txt", path.join(root, "dangling.txt"));
    await expectFilePreflightFailure(
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 1024,
      },
      {
        attemptId: "read-attempt",
        type: "canary-file-read",
        targetId: "read-target",
        enabled: true,
      },
      {
        targetId: "read-target",
        kind: "path",
        rootPath: root,
        relativePath: "dangling.txt",
      },
      "FILE_NOT_FOUND",
    );
    await rm(root, { recursive: true, force: true });
  });

  it("rejects directories and oversized files", async () => {
    const root = await mkdtemp("/tmp/probe-core-read-");
    await mkdir(path.join(root, "directory"));
    await writeFile(path.join(root, "large.txt"), "1234", "utf8");
    for (const [relativePath, expectedCode] of [
      ["directory", "FILE_NOT_REGULAR"],
      ["large.txt", "FILE_TOO_LARGE"],
    ] as const) {
      if (expectedCode === "FILE_NOT_REGULAR") {
        await expectFilePreflightFailure(
          {
            targetId: "read-target",
            kind: "file-read",
            classification: "canary",
            maxBytes: 3,
          },
          {
            attemptId: "read-attempt",
            type: "canary-file-read",
            targetId: "read-target",
            enabled: true,
          },
          {
            targetId: "read-target",
            kind: "path",
            rootPath: root,
            relativePath,
          },
          expectedCode,
        );
        continue;
      }
      const { event, fixture } = await runFileAttempt(
        {
          targetId: "read-target",
          kind: "file-read",
          classification: "canary",
          maxBytes: 3,
        },
        {
          attemptId: "read-attempt",
          type: "canary-file-read",
          targetId: "read-target",
          enabled: true,
        },
        {
          targetId: "read-target",
          kind: "path",
          rootPath: root,
          relativePath,
        },
      );
      expect(event.normalizedErrorCode).toBe(expectedCode);
      await fixture.cleanup();
    }
    await rm(root, { recursive: true, force: true });
  });
});

describe("fixed marker file write attempt", () => {
  it("rejects outside-root and traversal write bindings before writing", () => {
    const manifest = baseManifest([
      {
        targetId: "write-target",
        kind: "file-write",
        classification: "output",
        maxBytes: 1024,
      },
    ]);
    for (const [relativePath, expectedCode] of [
      ["/tmp/outside-marker.json", "PATH_OUTSIDE_ALLOWED_ROOT"],
      ["../outside-marker.json", "PATH_TRAVERSAL"],
    ] as const) {
      expect(() =>
        validateProbeConfiguration(
          manifest,
          baseRuntimeBindings("/tmp/probe-core-events-validation", [
            {
              targetId: "write-target",
              kind: "path",
              rootPath: "/tmp/probe-core-write-root",
              relativePath,
            },
          ]),
        ),
      ).toThrowError(expect.objectContaining({ code: expectedCode }));
    }
  });

  it("does not destroy an existing regular file", async () => {
    const root = await mkdtemp("/tmp/probe-core-write-");
    const targetPath = path.join(root, "marker.json");
    await writeFile(targetPath, "old-marker\n", "utf8");
    await expectFilePreflightFailure(
      {
        targetId: "write-target",
        kind: "file-write",
        classification: "output",
        maxBytes: 1024,
      },
      {
        attemptId: "write-attempt",
        type: "direct-filesystem-write",
        targetId: "write-target",
        enabled: true,
      },
      {
        targetId: "write-target",
        kind: "path",
        rootPath: root,
        relativePath: "marker.json",
      },
      "FILE_ALREADY_EXISTS",
    );
    expect(await readFile(targetPath, "utf8")).toBe("old-marker\n");
    await rm(root, { recursive: true, force: true });
  });

  it("rejects a parent symlink escape and an existing target symlink", async () => {
    const root = await mkdtemp("/tmp/probe-core-write-");
    const outside = await mkdtemp("/tmp/probe-core-write-outside-");
    await symlink(outside, path.join(root, "parent-link"));
    await writeFile(path.join(outside, "outside.txt"), "outside", "utf8");
    await symlink(
      path.join(outside, "outside.txt"),
      path.join(root, "target-link"),
    );
    await writeFile(path.join(root, "inside.txt"), "inside", "utf8");
    await symlink("inside.txt", path.join(root, "inside-target-link"));

    for (const relativePath of [
      "parent-link/marker.json",
      "target-link",
      "inside-target-link",
    ]) {
      await expectFilePreflightFailure(
        {
          targetId: "write-target",
          kind: "file-write",
          classification: "output",
          maxBytes: 1024,
        },
        {
          attemptId: "write-attempt",
          type: "direct-filesystem-write",
          targetId: "write-target",
          enabled: true,
        },
        {
          targetId: "write-target",
          kind: "path",
          rootPath: root,
          relativePath,
        },
        "SYMLINK_ESCAPE",
      );
    }
    expect(await readFile(path.join(outside, "outside.txt"), "utf8")).toBe(
      "outside",
    );
    expect(await readFile(path.join(root, "inside.txt"), "utf8")).toBe(
      "inside",
    );
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });

  it("allows an in-root parent symlink and rejects a dangling parent", async () => {
    const root = await mkdtemp("/tmp/probe-core-write-");
    await mkdir(path.join(root, "inside"));
    await symlink("inside", path.join(root, "inside-parent-link"));
    await symlink("missing", path.join(root, "dangling-parent-link"));

    const successful = await runFileAttempt(
      {
        targetId: "write-target",
        kind: "file-write",
        classification: "output",
        maxBytes: 1024,
      },
      {
        attemptId: "write-attempt",
        type: "direct-filesystem-write",
        targetId: "write-target",
        enabled: true,
      },
      {
        targetId: "write-target",
        kind: "path",
        rootPath: root,
        relativePath: "inside-parent-link/marker.json",
      },
    );
    try {
      expect(successful.event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
      });
    } finally {
      await successful.fixture.cleanup();
    }

    await expectFilePreflightFailure(
      {
        targetId: "write-target",
        kind: "file-write",
        classification: "output",
        maxBytes: 1024,
      },
      {
        attemptId: "write-attempt",
        type: "direct-filesystem-write",
        targetId: "write-target",
        enabled: true,
      },
      {
        targetId: "write-target",
        kind: "path",
        rootPath: root,
        relativePath: "dangling-parent-link/marker.json",
      },
      "FILE_NOT_FOUND",
    );
    await rm(root, { recursive: true, force: true });
  });

  it("does not accept caller-provided marker content", () => {
    const manifest = baseManifest(
      [
        {
          targetId: "write-target",
          kind: "file-write",
          classification: "output",
          maxBytes: 1024,
        },
      ],
      [
        {
          attemptId: "write-attempt",
          type: "direct-filesystem-write",
          targetId: "write-target",
          enabled: true,
          contents: "caller-controlled",
        } as never,
      ],
    );
    expect(() => validateProbeManifest(manifest)).toThrowError(
      expect.objectContaining<Partial<ProbeError>>({
        code: "INVALID_MANIFEST",
      }),
    );
  });
});

describe("prepared file-hash attempt", () => {
  async function configuredHash(contents: string | null, maxBytes: number) {
    const root = await mkdtemp("/tmp/probe-core-hash-");
    if (contents !== null) {
      await writeFile(path.join(root, "target.txt"), contents, "utf8");
    }
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "hash-target",
          kind: "file-hash",
          classification: "source",
          maxBytes,
        },
      ],
      [
        {
          attemptId: "hash-attempt",
          type: "file-hash",
          targetId: "hash-target",
          enabled: true,
          hashPosition: "before",
        },
      ],
      [
        {
          targetId: "hash-target",
          kind: "path",
          rootPath: root,
          relativePath: "target.txt",
        },
      ],
    );
    return { root, fixture };
  }

  it("hashes known and empty contents with a stable prefix", async () => {
    for (const [contents, expected] of [
      [
        "abc",
        "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      ],
      [
        "",
        "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      ],
    ] as const) {
      const { root, fixture } = await configuredHash(contents, 1024);
      const session = await createProbeSession(fixture.configuration);
      const event = await session.runAttempt("hash-attempt");
      await session.close();
      expect(event).toMatchObject({
        outcome: "success",
        beforeHash: expected,
        details: { kind: "file-hash", state: "present" },
      });
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("represents missing separately and rejects oversized input", async () => {
    const missingRoot = await mkdtemp("/tmp/probe-core-hash-missing-");
    const missing = await createValidatedTestConfiguration(
      [
        {
          targetId: "hash-target",
          kind: "file-hash",
          classification: "source",
          maxBytes: 1024,
        },
      ],
      [],
      [
        {
          targetId: "hash-target",
          kind: "path",
          rootPath: missingRoot,
          relativePath: "target.txt",
        },
      ],
    );
    await expect(
      prepareProbeConfiguration(missing.configuration),
    ).rejects.toMatchObject({ code: "FILE_NOT_FOUND" });
    await missing.cleanup();
    await rm(missingRoot, { recursive: true, force: true });

    const oversized = await configuredHash("1234", 3);
    const session = await createProbeSession(oversized.fixture.configuration);
    const event = await session.runAttempt("hash-attempt");
    await session.close();
    expect(event).toMatchObject({
      outcome: "failure",
      normalizedErrorCode: "FILE_TOO_LARGE",
    });
    await oversized.fixture.cleanup();
    await rm(oversized.root, { recursive: true, force: true });
  });

  it("records explicit before and after hash positions", async () => {
    const root = await mkdtemp("/tmp/probe-core-hash-event-");
    await writeFile(path.join(root, "target.txt"), "snapshot", "utf8");
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "hash-target",
          kind: "file-hash",
          classification: "artifact",
          maxBytes: 1024,
        },
      ],
      [
        {
          attemptId: "hash-before",
          type: "file-hash",
          targetId: "hash-target",
          enabled: true,
          hashPosition: "before",
        },
        {
          attemptId: "hash-after",
          type: "file-hash",
          targetId: "hash-target",
          enabled: true,
          hashPosition: "after",
        },
      ],
      [
        {
          targetId: "hash-target",
          kind: "path",
          rootPath: root,
          relativePath: "target.txt",
        },
      ],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const before = await session.runAttempt("hash-before");
      const after = await session.runAttempt("hash-after");
      await session.close();
      expect(before.beforeHash).toMatch(/^sha256:/u);
      expect(before.afterHash).toBeNull();
      expect(after.beforeHash).toBeNull();
      expect(after.afterHash).toBe(before.beforeHash);
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });
});
