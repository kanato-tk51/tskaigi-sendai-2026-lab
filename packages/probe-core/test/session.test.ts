import { readFile } from "node:fs/promises";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createProbeSession } from "../src/index.js";
import { createProbeSessionForTest } from "../src/session.js";
import {
  createJsonlEventSinkForTest,
  type EventSegmentFileHandle,
} from "../src/sink.js";
import { createTestConfiguration } from "./helpers.js";

const canaryName = "PROBE_CANARY_SESSION_LIFECYCLE";

afterEach(() => {
  delete process.env[canaryName];
});

async function sessionFixture(enabled = true) {
  return createTestConfiguration(
    [
      {
        targetId: "env-target",
        kind: "environment",
        variableName: canaryName,
      },
    ],
    [
      {
        attemptId: "env-attempt",
        type: "environment-canary-read",
        targetId: "env-target",
        enabled,
      },
    ],
    [{ targetId: "env-target", kind: "environment" }],
  );
}

function successfulHandle(): EventSegmentFileHandle & {
  readonly writes: ReturnType<typeof vi.fn>;
  readonly close: ReturnType<typeof vi.fn>;
} {
  const writes = vi.fn(
    async (_buffer: Buffer, _offset: number, length: number) => ({
      bytesWritten: length,
    }),
  );
  return { write: writes, writes, close: vi.fn(async () => undefined) };
}

describe("session-owned evidence and lifecycle", () => {
  it("close waits for an in-flight attempt and its event write", async () => {
    process.env[canaryName] = "disposable";
    const fixture = await sessionFixture();
    let release!: () => void;
    let notifyWriteStarted!: () => void;
    const writeStarted = new Promise<void>((resolve) => {
      notifyWriteStarted = resolve;
    });
    const handle: EventSegmentFileHandle = {
      async write(_buffer, _offset, length) {
        notifyWriteStarted();
        await new Promise<void>((resume) => {
          release = resume;
        });
        return { bytesWritten: length };
      },
      close: vi.fn(async () => undefined),
    };
    const sink = createJsonlEventSinkForTest(fixture.configuration, handle);
    const session = createProbeSessionForTest(fixture.configuration, sink);
    try {
      const running = session.runAttempt("env-attempt");
      const closing = session.close();
      expect(session.state).toBe("closing");
      await writeStarted;
      let closeSettled = false;
      void closing.then(() => {
        closeSettled = true;
      });
      await Promise.resolve();
      expect(closeSettled).toBe(false);
      release();
      await expect(running).resolves.toMatchObject({ outcome: "success" });
      await expect(closing).resolves.toBeUndefined();
      expect(session.state).toBe("closed");
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects attempts started after close begins and makes close idempotent", async () => {
    const fixture = await sessionFixture(false);
    const handle = successfulHandle();
    const sink = createJsonlEventSinkForTest(fixture.configuration, handle);
    const session = createProbeSessionForTest(fixture.configuration, sink);
    try {
      const firstClose = session.close();
      const secondClose = session.close();
      expect(secondClose).toBe(firstClose);
      await expect(session.runAttempt("env-attempt")).rejects.toMatchObject({
        code: "SESSION_NOT_OPEN",
      });
      await firstClose;
      expect(session.state).toBe("closed");
      expect(session.close()).toBe(firstClose);
    } finally {
      await fixture.cleanup();
    }
  });

  it("enters failed state when capability success cannot be persisted", async () => {
    process.env[canaryName] = "disposable";
    const fixture = await sessionFixture();
    const handle: EventSegmentFileHandle = {
      write: vi.fn(async () => {
        throw new Error("disk full with raw path");
      }),
      close: vi.fn(async () => undefined),
    };
    const sink = createJsonlEventSinkForTest(fixture.configuration, handle);
    const session = createProbeSessionForTest(fixture.configuration, sink);
    try {
      await expect(session.runAttempt("env-attempt")).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(session.state).toBe("failed");
      await expect(session.runAttempt("env-attempt")).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      await expect(session.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
      expect(handle.write).toHaveBeenCalledTimes(1);
    } finally {
      await fixture.cleanup();
    }
  });

  it("persists a capability failure event and distinguishes double failure", async () => {
    const persistedFixture = await sessionFixture();
    const persistedHandle = successfulHandle();
    const persistedSink = createJsonlEventSinkForTest(
      persistedFixture.configuration,
      persistedHandle,
    );
    const persistedSession = createProbeSessionForTest(
      persistedFixture.configuration,
      persistedSink,
    );
    try {
      await expect(
        persistedSession.runAttempt("env-attempt"),
      ).resolves.toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "ENVIRONMENT_VARIABLE_ABSENT",
      });
      await persistedSession.close();
      expect(persistedHandle.writes).toHaveBeenCalledTimes(1);
    } finally {
      await persistedFixture.cleanup();
    }

    const failedFixture = await sessionFixture();
    const failedHandle: EventSegmentFileHandle = {
      write: vi.fn(async () => {
        throw new Error("evidence failure");
      }),
      close: vi.fn(async () => undefined),
    };
    const failedSession = createProbeSessionForTest(
      failedFixture.configuration,
      createJsonlEventSinkForTest(failedFixture.configuration, failedHandle),
    );
    try {
      await expect(
        failedSession.runAttempt("env-attempt"),
      ).rejects.toMatchObject({ code: "EVIDENCE_WRITE_FAILURE" });
      expect(failedSession.state).toBe("failed");
      await expect(failedSession.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
    } finally {
      await failedFixture.cleanup();
    }
  });

  it("waits for multiple attempts racing with close", async () => {
    const fixture = await sessionFixture(false);
    const handle = successfulHandle();
    handle.writes.mockImplementation(
      async (_buffer: Buffer, _offset: number, length: number) => {
        await new Promise((resolve) => setImmediate(resolve));
        return { bytesWritten: length };
      },
    );
    const session = createProbeSessionForTest(
      fixture.configuration,
      createJsonlEventSinkForTest(fixture.configuration, handle),
    );
    try {
      const attempts = Array.from({ length: 8 }, () =>
        session.runAttempt("env-attempt"),
      );
      const closing = session.close();
      await Promise.all(attempts);
      await closing;
      expect(handle.writes).toHaveBeenCalledTimes(8);
      expect(session.state).toBe("closed");
    } finally {
      await fixture.cleanup();
    }
  });

  it("cannot attach a sink from another validated configuration", async () => {
    const first = await sessionFixture(false);
    const second = await sessionFixture(false);
    const sink = createJsonlEventSinkForTest(
      first.configuration,
      successfulHandle(),
    );
    try {
      expect(() =>
        createProbeSessionForTest(second.configuration, sink),
      ).toThrowError(expect.objectContaining({ code: "INVALID_TARGET" }));
    } finally {
      await first.cleanup();
      await second.cleanup();
    }
  });

  it("public session creation owns the official sink and exposes no callback slot", async () => {
    const fixture = await sessionFixture(false);
    const callback = vi.fn();
    try {
      expect(createProbeSession.length).toBe(1);
      const session = await Reflect.apply(createProbeSession, undefined, [
        fixture.configuration,
        { write: callback, close: callback },
      ]);
      await session.runAttempt("env-attempt");
      await session.close();
      expect(callback).not.toHaveBeenCalled();
      const source = await readFile(
        new URL("../src/index.ts", import.meta.url),
        "utf8",
      );
      expect(source).not.toContain("createJsonlEventSink");
      expect(source).not.toContain("ProbeEventSink");
    } finally {
      await fixture.cleanup();
    }
  });
});
