import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import {
  ProbeError,
  serializeProbeEvent,
  validateProbeEvent,
} from "../src/index.js";
import { createProbeEventFactory } from "../src/event.js";
import { createOfficialJsonlEventSink } from "../src/sink.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

function validEnvironmentEvent() {
  const manifest = baseManifest(
    [
      {
        targetId: "env-target",
        kind: "environment",
        variableName: "PROBE_CANARY_EVENT_INJECTION",
      },
    ],
    [
      {
        attemptId: "env-attempt",
        type: "environment-canary-read",
        targetId: "env-target",
        enabled: true,
      },
    ],
  );
  const event = createProbeEventFactory(manifest).create({
    attemptId: "env-attempt",
    attemptType: "environment-canary-read",
    targetId: "env-target",
    outcome: "success",
    normalizedErrorCode: null,
    beforeHash: null,
    afterHash: null,
    durationMs: 0,
    details: { kind: "environment", present: true, byteLength: 10 },
  });
  return { manifest, event };
}

function captureError(operation: () => unknown): unknown {
  try {
    operation();
    return null;
  } catch (error) {
    return error;
  }
}

describe("event object injection prevention", () => {
  it("requires primitive string hashes without invoking toString or toJSON", () => {
    const { manifest, event } = validEnvironmentEvent();
    const toString = vi.fn(() => `sha256:${"a".repeat(64)}`);
    const toJSON = vi.fn(() => "raw disposable canary");
    const candidate = {
      ...event,
      afterHash: { toString, toJSON },
    };
    expect(() => validateProbeEvent(candidate, manifest)).toThrowError(
      expect.objectContaining({ code: "SERIALIZATION_FAILURE" }),
    );
    expect(toString).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  it("rejects top-level and details accessors without evaluating them", () => {
    const { manifest, event } = validEnvironmentEvent();
    let topLevelReads = 0;
    const topLevel = { ...event };
    Object.defineProperty(topLevel, "runId", {
      enumerable: true,
      get() {
        topLevelReads += 1;
        return topLevelReads === 1 ? "run-1" : "raw-temporary-path";
      },
    });
    expect(() => validateProbeEvent(topLevel, manifest)).toThrowError(
      expect.objectContaining({ code: "SERIALIZATION_FAILURE" }),
    );
    expect(topLevelReads).toBe(0);

    let detailReads = 0;
    const details = { kind: "environment", byteLength: 10 } as Record<
      string,
      unknown
    >;
    Object.defineProperty(details, "present", {
      enumerable: true,
      get() {
        detailReads += 1;
        if (detailReads > 1) {
          return "raw disposable canary";
        }
        return true;
      },
    });
    expect(() =>
      validateProbeEvent({ ...event, details }, manifest),
    ).toThrowError(expect.objectContaining({ code: "SERIALIZATION_FAILURE" }));
    expect(detailReads).toBe(0);
  });

  it("normalizes throwing getters and proxies without leaking raw exceptions", () => {
    const { manifest, event } = validEnvironmentEvent();
    const rawMessage = "raw disposable canary and raw temporary path";
    const throwing = { ...event };
    Object.defineProperty(throwing, "targetId", {
      enumerable: true,
      get() {
        throw new Error(rawMessage);
      },
    });
    const getterError = captureError(() =>
      serializeProbeEvent(throwing, manifest),
    );
    expect(getterError).toBeInstanceOf(ProbeError);
    expect(String(getterError)).not.toContain(rawMessage);
    expect((getterError as Error).stack).not.toContain(rawMessage);

    const proxy = new Proxy(
      { ...event },
      {
        ownKeys() {
          throw new Error(rawMessage);
        },
      },
    );
    const proxyError = captureError(() => validateProbeEvent(proxy, manifest));
    expect(proxyError).toBeInstanceOf(ProbeError);
    expect(String(proxyError)).not.toContain(rawMessage);
  });

  it("rejects cycles, nested objects, unknown details keys, and toJSON", () => {
    const { manifest, event } = validEnvironmentEvent();
    const cyclic = { ...event } as Record<string, unknown>;
    cyclic.details = cyclic;
    expect(() => validateProbeEvent(cyclic, manifest)).toThrowError(
      expect.objectContaining({ code: "SERIALIZATION_FAILURE" }),
    );

    expect(() =>
      validateProbeEvent(
        {
          ...event,
          details: {
            kind: "environment",
            present: true,
            byteLength: { nested: 10 },
          },
        },
        manifest,
      ),
    ).toThrowError(expect.objectContaining({ code: "SERIALIZATION_FAILURE" }));

    expect(() =>
      validateProbeEvent(
        {
          ...event,
          details: {
            kind: "environment",
            present: true,
            byteLength: 10,
            rawValue: "raw disposable canary",
          },
        },
        manifest,
      ),
    ).toThrowError(expect.objectContaining({ code: "SERIALIZATION_FAILURE" }));

    const toJSON = vi.fn(() => ({ raw: "raw disposable canary" }));
    expect(() =>
      validateProbeEvent(
        {
          ...event,
          details: {
            kind: "environment",
            present: true,
            byteLength: 10,
            toJSON,
          },
        },
        manifest,
      ),
    ).toThrowError(expect.objectContaining({ code: "SERIALIZATION_FAILURE" }));
    expect(toJSON).not.toHaveBeenCalled();
  });

  it("rejects injected data before writing any JSONL bytes", async () => {
    const rawCanary = "raw disposable serialization canary";
    const rawPath = "/tmp/raw-disposable-path";
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_EVENT_JSONL",
        },
      ],
      [
        {
          attemptId: "env-attempt",
          type: "environment-canary-read",
          targetId: "env-target",
          enabled: true,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    const valid = createProbeEventFactory(
      fixture.configuration.manifest,
    ).create({
      attemptId: "env-attempt",
      attemptType: "environment-canary-read",
      targetId: "env-target",
      outcome: "success",
      normalizedErrorCode: null,
      beforeHash: null,
      afterHash: null,
      durationMs: 0,
      details: { kind: "environment", present: true, byteLength: 1 },
    });
    const toJSON = vi.fn(() => rawCanary);
    const details = {
      kind: "environment",
      present: true,
      byteLength: 1,
      toJSON,
    };
    Object.defineProperty(details, "rawPath", {
      enumerable: true,
      get() {
        return rawPath;
      },
    });

    try {
      const sink = await createOfficialJsonlEventSink(fixture.configuration);
      await expect(
        sink.write({ ...valid, details } as never),
      ).rejects.toMatchObject({ code: "SERIALIZATION_FAILURE" });
      await sink.close();
      const contents = await readFile(fixture.eventPath, "utf8");
      expect(contents).toBe("");
      expect(contents).not.toContain(rawCanary);
      expect(contents).not.toContain(rawPath);
      expect(toJSON).not.toHaveBeenCalled();
    } finally {
      await fixture.cleanup();
    }
  });
});
