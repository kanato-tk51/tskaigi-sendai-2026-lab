import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createProbeSession, serializeProbeEvent } from "../src/index.js";
import { createProbeEventFactory } from "../src/event.js";
import { createOfficialJsonlEventSink } from "../src/sink.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

describe("producer-local events and JSONL segment", () => {
  it("assigns a monotonically increasing producer sequence", async () => {
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_M1_SEQUENCE",
        },
      ],
      [
        {
          attemptId: "env-attempt",
          type: "environment-canary-read",
          targetId: "env-target",
          enabled: false,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = [];
      for (let index = 0; index < 3; index += 1) {
        events.push(await session.runAttempt("env-attempt"));
      }
      await session.close();
      expect(events.map((event) => event.producerSequence)).toEqual([0, 1, 2]);
      expect(events.every((event) => event.outcome === "skipped")).toBe(true);
    } finally {
      await fixture.cleanup();
    }
  });

  it("writes one UTF-8 LF-terminated event per line", async () => {
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_M1_LINES",
        },
      ],
      [
        {
          attemptId: "env-attempt",
          type: "environment-canary-read",
          targetId: "env-target",
          enabled: false,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      await session.runAttempt("env-attempt");
      await session.runAttempt("env-attempt");
      await session.close();
      const contents = await readFile(fixture.eventPath, "utf8");
      expect(contents.endsWith("\n")).toBe(true);
      expect(contents).not.toContain("\r");
      const lines = contents.trimEnd().split("\n");
      expect(lines).toHaveLength(2);
      expect(lines.map((line) => JSON.parse(line))).toHaveLength(2);
    } finally {
      await fixture.cleanup();
    }
  });

  it("serializes concurrent attempts without corrupting lines", async () => {
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_M1_CONCURRENT",
        },
      ],
      [
        {
          attemptId: "env-attempt",
          type: "environment-canary-read",
          targetId: "env-target",
          enabled: false,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      await Promise.all(
        Array.from({ length: 20 }, () => session.runAttempt("env-attempt")),
      );
      await session.close();
      const events = (await readFile(fixture.eventPath, "utf8"))
        .trimEnd()
        .split("\n")
        .map((line) => JSON.parse(line) as { producerSequence: number });
      expect(events).toHaveLength(20);
      expect(events.map((event) => event.producerSequence)).toEqual(
        Array.from({ length: 20 }, (_value, index) => index),
      );
    } finally {
      await fixture.cleanup();
    }
  });

  it("uses deterministic top-level and details key ordering", () => {
    const manifest = baseManifest(
      [
        {
          targetId: "target-1",
          kind: "environment",
          variableName: "PROBE_CANARY_M1_ORDER",
        },
      ],
      [
        {
          attemptId: "attempt-1",
          type: "environment-canary-read",
          targetId: "target-1",
          enabled: true,
        },
      ],
    );
    const factory = createProbeEventFactory(manifest);
    const event = factory.create({
      attemptId: "attempt-1",
      attemptType: "environment-canary-read",
      targetId: "target-1",
      outcome: "success",
      normalizedErrorCode: null,
      beforeHash: null,
      afterHash: null,
      durationMs: 0,
      details: { byteLength: 3, present: true, kind: "environment" },
    });
    const reversed = Object.fromEntries(Object.entries(event).reverse());
    expect(serializeProbeEvent(reversed, manifest)).toBe(
      serializeProbeEvent(event, manifest),
    );
    expect(serializeProbeEvent(event, manifest)).toContain(
      '"details":{"kind":"environment","present":true,"byteLength":3}',
    );
  });

  it("does not store host paths, raw errors, or a global sequence", async () => {
    const fileRoot = await mkdtemp("/tmp/probe-core-event-path-");
    await writeFile(path.join(fileRoot, "canary.txt"), "disposable", "utf8");
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "read-target",
          kind: "file-read",
          classification: "canary",
          maxBytes: 1024,
        },
      ],
      [
        {
          attemptId: "read-attempt",
          type: "canary-file-read",
          targetId: "read-target",
          enabled: true,
        },
      ],
      [
        {
          targetId: "read-target",
          kind: "path",
          rootPath: fileRoot,
          relativePath: "canary.txt",
        },
      ],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      await session.runAttempt("read-attempt");
      await session.close();
      const line = (await readFile(fixture.eventPath, "utf8")).trimEnd();
      const event = JSON.parse(line) as Record<string, unknown>;
      expect(line).not.toContain(fileRoot);
      expect(line).not.toContain("canary.txt");
      expect(line).not.toContain("no such file");
      expect(event).not.toHaveProperty("sequence");
      expect(event).toHaveProperty("producerSequence", 0);
    } finally {
      await fixture.cleanup();
      await rm(fileRoot, { recursive: true, force: true });
    }
  });

  it("rejects invalid events before writing any bytes", async () => {
    const fixture = await createTestConfiguration([], [], []);
    try {
      const sink = await createOfficialJsonlEventSink(fixture.configuration);
      const factory = createProbeEventFactory(
        baseManifest(
          [
            {
              targetId: "target-1",
              kind: "environment",
              variableName: "PROBE_CANARY_M1_INVALID_EVENT",
            },
          ],
          [
            {
              attemptId: "attempt-1",
              type: "environment-canary-read",
              targetId: "target-1",
              enabled: true,
            },
          ],
        ),
      );
      const validEvent = factory.create({
        attemptId: "attempt-1",
        attemptType: "environment-canary-read",
        targetId: "target-1",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        durationMs: 0,
        details: { kind: "environment", present: true, byteLength: 3 },
      });
      const invalidEvent = {
        ...validEvent,
        details: {
          kind: "environment",
          present: true,
          byteLength: 3,
          rawMessage: "/tmp/raw-path",
        },
      };
      await expect(sink.write(invalidEvent as never)).rejects.toMatchObject({
        code: "SERIALIZATION_FAILURE",
      });
      await sink.close();
      expect(await readFile(fixture.eventPath, "utf8")).toBe("");
    } finally {
      await fixture.cleanup();
    }
  });

  it("does not allow two writers to claim one producer segment", async () => {
    const fixture = await createTestConfiguration([], [], []);
    try {
      const firstSink = await createOfficialJsonlEventSink(
        fixture.configuration,
      );
      await expect(
        createOfficialJsonlEventSink(fixture.configuration),
      ).rejects.toMatchObject({ code: "EVIDENCE_WRITE_FAILURE" });
      await firstSink.close();
    } finally {
      await fixture.cleanup();
    }
  });
});
