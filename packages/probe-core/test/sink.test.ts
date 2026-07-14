import { describe, expect, it, vi } from "vitest";

import { serializeProbeEvent } from "../src/index.js";
import { createProbeEventFactory } from "../src/event.js";
import {
  createJsonlEventSinkForTest,
  type EventSegmentFileHandle,
  type EventSegmentPolicy,
} from "../src/sink.js";
import type { ProbeEvent } from "../src/types.js";
import { createTestConfiguration } from "./helpers.js";

class ScriptedHandle implements EventSegmentFileHandle {
  readonly writeCalls: Array<{
    readonly length: number;
    readonly position: number;
  }> = [];
  readonly written: Buffer[] = [];
  readonly close = vi.fn(async () => undefined);

  constructor(private readonly script: Array<number | Error> = []) {}

  async write(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<{ readonly bytesWritten: number }> {
    this.writeCalls.push({ length, position });
    const step = this.script.shift();
    if (step instanceof Error) {
      throw step;
    }
    const bytesWritten = step ?? length;
    if (bytesWritten > 0) {
      this.written.push(
        Buffer.from(buffer.subarray(offset, offset + bytesWritten)),
      );
    }
    return { bytesWritten };
  }
}

async function configuredSink(
  handle: EventSegmentFileHandle,
  policy?: EventSegmentPolicy,
) {
  const fixture = await createTestConfiguration(
    [
      {
        targetId: "env-target",
        kind: "environment",
        variableName: "PROBE_CANARY_SINK_TEST",
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
  const factory = createProbeEventFactory(fixture.configuration.manifest);
  const event = (): ProbeEvent =>
    factory.create({
      attemptId: "env-attempt",
      attemptType: "environment-canary-read",
      targetId: "env-target",
      outcome: "skipped",
      normalizedErrorCode: "MANIFEST_DISALLOWED",
      beforeHash: null,
      afterHash: null,
      details: { kind: "skipped" },
      durationMs: 0,
    });
  return {
    fixture,
    event,
    sink: createJsonlEventSinkForTest(fixture.configuration, handle, policy),
  };
}

const roomyPolicy: EventSegmentPolicy = {
  maxEventCount: 10,
  maxEventBytes: 32_768,
  maxSegmentBytes: 65_536,
};

describe("JSONL sink terminal failure and resource policy", () => {
  it("enters terminal failure on the first write error and performs no later writes", async () => {
    const handle = new ScriptedHandle([new Error("disk full")]);
    const test = await configuredSink(handle, roomyPolicy);
    try {
      let firstFailure: unknown;
      try {
        await test.sink.write(test.event());
      } catch (error) {
        firstFailure = error;
      }
      expect(firstFailure).toMatchObject({ code: "EVIDENCE_WRITE_FAILURE" });
      expect(test.sink.state).toBe("failed");
      await expect(test.sink.write(test.event())).rejects.toBe(firstFailure);
      expect(handle.writeCalls).toHaveLength(1);
      await expect(test.sink.close()).rejects.toBe(firstFailure);
      await expect(test.sink.close()).rejects.toBe(firstFailure);
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("marks a partial line when a later short-write continuation fails", async () => {
    const handle = new ScriptedHandle([5, new Error("partial failure")]);
    const test = await configuredSink(handle, roomyPolicy);
    try {
      await expect(test.sink.write(test.event())).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(test.sink.partialLine).toBe(true);
      expect(Buffer.concat(handle.written).byteLength).toBe(5);
      expect(Buffer.concat(handle.written).toString("utf8")).not.toContain(
        "\n",
      );
      await expect(test.sink.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("treats a zero-byte write as terminal failure", async () => {
    const handle = new ScriptedHandle([0]);
    const test = await configuredSink(handle, roomyPolicy);
    try {
      await expect(test.sink.write(test.event())).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(test.sink.partialLine).toBe(false);
      expect(handle.writeCalls).toHaveLength(1);
      await expect(test.sink.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("preserves close failure and rejects all subsequent operations", async () => {
    const handle = new ScriptedHandle();
    handle.close.mockRejectedValueOnce(new Error("close failed"));
    const test = await configuredSink(handle, roomyPolicy);
    try {
      await expect(test.sink.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(test.sink.state).toBe("failed");
      await expect(test.sink.write(test.event())).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(handle.writeCalls).toHaveLength(0);
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("waits for queued writes during close and rejects a close/write race", async () => {
    let release!: (result: { readonly bytesWritten: number }) => void;
    const handle: EventSegmentFileHandle = {
      write: vi.fn(async (_buffer, _offset, length) =>
        new Promise<{ readonly bytesWritten: number }>((resolve) => {
          release = resolve;
        }).then(() => ({ bytesWritten: length })),
      ),
      close: vi.fn(async () => undefined),
    };
    const test = await configuredSink(handle, roomyPolicy);
    try {
      const writing = test.sink.write(test.event());
      const closing = test.sink.close();
      expect(test.sink.state).toBe("closing");
      await expect(test.sink.write(test.event())).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      let closed = false;
      void closing.then(() => {
        closed = true;
      });
      await Promise.resolve();
      expect(closed).toBe(false);
      release({ bytesWritten: 1 });
      await writing;
      await closing;
      expect(test.sink.state).toBe("closed");
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("enforces the event-count limit before a later write starts", async () => {
    const handle = new ScriptedHandle();
    const test = await configuredSink(handle, {
      ...roomyPolicy,
      maxEventCount: 1,
    });
    try {
      await test.sink.write(test.event());
      await expect(test.sink.write(test.event())).rejects.toMatchObject({
        code: "SEGMENT_LIMIT_EXCEEDED",
      });
      expect(handle.writeCalls).toHaveLength(1);
      await expect(test.sink.close()).rejects.toMatchObject({
        code: "SEGMENT_LIMIT_EXCEEDED",
      });
    } finally {
      await test.fixture.cleanup();
    }
  });

  it("enforces per-event and total-byte limits before writing", async () => {
    for (const policy of [
      { ...roomyPolicy, maxEventBytes: 1 },
      { ...roomyPolicy, maxSegmentBytes: 1 },
    ]) {
      const handle = new ScriptedHandle();
      const test = await configuredSink(handle, policy);
      try {
        await expect(test.sink.write(test.event())).rejects.toMatchObject({
          code: "SEGMENT_LIMIT_EXCEEDED",
        });
        expect(handle.writeCalls).toHaveLength(0);
        await expect(test.sink.close()).rejects.toMatchObject({
          code: "SEGMENT_LIMIT_EXCEEDED",
        });
      } finally {
        await test.fixture.cleanup();
      }
    }
  });

  it("accepts an event exactly at the byte limits and writes a final LF", async () => {
    const handle = new ScriptedHandle();
    const preliminary = await configuredSink(handle, roomyPolicy);
    const event = preliminary.event();
    const lineBytes = Buffer.byteLength(
      `${serializeProbeEvent(event, preliminary.fixture.configuration.manifest)}\n`,
    );
    const sink = createJsonlEventSinkForTest(
      preliminary.fixture.configuration,
      handle,
      {
        maxEventCount: 1,
        maxEventBytes: lineBytes,
        maxSegmentBytes: lineBytes,
      },
    );
    try {
      await sink.write(event);
      await sink.close();
      const written = Buffer.concat(handle.written);
      expect(written.byteLength).toBe(lineBytes);
      expect(written.at(-1)).toBe(0x0a);
    } finally {
      await preliminary.fixture.cleanup();
    }
  });

  it("snapshots and serializes an event before it enters the write queue", async () => {
    const handle = new ScriptedHandle();
    const test = await configuredSink(handle, roomyPolicy);
    const canonical = test.event();
    const mutableDetails = { kind: "skipped" };
    const candidate = { ...canonical, details: mutableDetails } as ProbeEvent;
    try {
      const writing = test.sink.write(candidate);
      Object.assign(mutableDetails, { raw: "raw disposable canary" });
      await writing;
      await test.sink.close();
      expect(Buffer.concat(handle.written).toString("utf8")).not.toContain(
        "raw disposable canary",
      );
    } finally {
      await test.fixture.cleanup();
    }
  });
});
