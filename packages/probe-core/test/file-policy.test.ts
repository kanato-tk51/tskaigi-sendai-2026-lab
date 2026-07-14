import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
  validateProbeManifest,
} from "../src/index.js";
import { writeFixedMarkerToHandle } from "../src/attempts/file.js";
import {
  baseManifest,
  baseRuntimeBindings,
  createTestConfiguration,
  createValidatedTestConfiguration,
} from "./helpers.js";

function writeTarget(targetId: string) {
  return {
    targetId,
    kind: "file-write" as const,
    classification: "output" as const,
    maxBytes: 1024,
  };
}

function writeAttempt(attemptId: string, targetId: string) {
  return {
    attemptId,
    type: "direct-filesystem-write" as const,
    targetId,
    enabled: true,
  };
}

describe("exclusive file-write and concurrency policy", () => {
  it("exclusively creates a fixed marker with absent-before and descriptor-derived after hash", async () => {
    const root = await mkdtemp("/tmp/probe-core-exclusive-write-");
    const fixture = await createTestConfiguration(
      [writeTarget("write-target")],
      [writeAttempt("write-attempt", "write-target")],
      [
        {
          targetId: "write-target",
          kind: "path",
          rootPath: root,
          relativePath: "marker.json",
        },
      ],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const event = await session.runAttempt("write-attempt");
      await session.close();
      const marker = await readFile(path.join(root, "marker.json"));
      expect(event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
      });
      expect(event.afterHash).toBe(
        `sha256:${createHash("sha256").update(marker).digest("hex")}`,
      );
      expect(JSON.parse(marker.toString("utf8"))).toEqual({
        schemaVersion: "probe-marker/v1",
        attemptId: "write-attempt",
        runId: "run-1",
        scenarioId: "scenario-1",
      });
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("serializes parallel calls for one target so only one exclusive create succeeds", async () => {
    const root = await mkdtemp("/tmp/probe-core-parallel-write-");
    const fixture = await createTestConfiguration(
      [writeTarget("write-target")],
      [writeAttempt("write-attempt", "write-target")],
      [
        {
          targetId: "write-target",
          kind: "path",
          rootPath: root,
          relativePath: "marker.json",
        },
      ],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = await Promise.all([
        session.runAttempt("write-attempt"),
        session.runAttempt("write-attempt"),
      ]);
      await session.close();
      expect(events.map((event) => event.outcome).sort()).toEqual([
        "failure",
        "success",
      ]);
      expect(
        events.find((event) => event.outcome === "failure")
          ?.normalizedErrorCode,
      ).toBe("FILE_ALREADY_EXISTS");
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("allows parallel writes to different output targets", async () => {
    const root = await mkdtemp("/tmp/probe-core-distinct-write-");
    const fixture = await createTestConfiguration(
      [writeTarget("write-a"), writeTarget("write-b")],
      [
        writeAttempt("attempt-a", "write-a"),
        writeAttempt("attempt-b", "write-b"),
      ],
      [
        {
          targetId: "write-a",
          kind: "path",
          rootPath: root,
          relativePath: "a.json",
        },
        {
          targetId: "write-b",
          kind: "path",
          rootPath: root,
          relativePath: "b.json",
        },
      ],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = await Promise.all([
        session.runAttempt("attempt-a"),
        session.runAttempt("attempt-b"),
      ]);
      await session.close();
      expect(events.every((event) => event.outcome === "success")).toBe(true);
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an existing dangling symlink during preflight", async () => {
    const root = await mkdtemp("/tmp/probe-core-dangling-write-");
    await symlink("missing-target", path.join(root, "marker-link"));
    const fixture = await createValidatedTestConfiguration(
      [writeTarget("write-target")],
      [writeAttempt("write-attempt", "write-target")],
      [
        {
          targetId: "write-target",
          kind: "path",
          rootPath: root,
          relativePath: "marker-link",
        },
      ],
    );
    try {
      await expect(
        prepareProbeConfiguration(fixture.configuration),
      ).rejects.toMatchObject({ code: "SYMLINK_ESCAPE" });
    } finally {
      await fixture.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  });

  it("repeats short writes and rejects a partial marker write failure", async () => {
    let calls = 0;
    const handle = {
      write: vi.fn(async () => {
        calls += 1;
        if (calls === 1) {
          return { bytesWritten: 2 };
        }
        throw new Error("partial write failure");
      }),
      stat: vi.fn(async () => ({ size: 4, isFile: () => true })),
      sync: vi.fn(async () => undefined),
    };
    await expect(
      writeFixedMarkerToHandle(handle, Buffer.from("marker")),
    ).rejects.toThrow("partial write failure");
    expect(handle.write).toHaveBeenCalledTimes(2);
    expect(handle.sync).not.toHaveBeenCalled();
  });

  it("rejects multiple write definitions for one target", () => {
    const manifest = baseManifest(
      [writeTarget("write-target")],
      [
        writeAttempt("attempt-a", "write-target"),
        writeAttempt("attempt-b", "write-target"),
      ],
    );
    expect(() => validateProbeManifest(manifest)).toThrowError(
      expect.objectContaining({ code: "INVALID_MANIFEST" }),
    );
  });

  it("rejects read/hash/write targets that alias the same runtime path", () => {
    const targets = [
      {
        targetId: "read-target",
        kind: "file-read" as const,
        classification: "canary" as const,
        maxBytes: 100,
      },
      {
        targetId: "hash-target",
        kind: "file-hash" as const,
        classification: "source" as const,
        maxBytes: 100,
      },
      writeTarget("write-target"),
    ];
    const bindings = targets.map((target) => ({
      targetId: target.targetId,
      kind: "path" as const,
      rootPath: "/tmp/probe-core-alias-policy",
      relativePath: "same.txt",
    }));
    expect(() =>
      validateProbeConfiguration(
        baseManifest(targets),
        baseRuntimeBindings("/tmp/probe-core-events-validation", bindings),
      ),
    ).toThrowError(
      expect.objectContaining({ code: "FILE_TARGET_LEXICAL_ALIAS" }),
    );
  });

  it("rejects canary classification for file-hash before execution", () => {
    expect(() =>
      validateProbeManifest(
        baseManifest([
          {
            targetId: "hash-target",
            kind: "file-hash",
            classification: "canary",
            maxBytes: 100,
          } as never,
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "INVALID_MANIFEST" }));
  });
});
