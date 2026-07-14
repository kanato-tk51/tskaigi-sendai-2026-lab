import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { createProbeSession, validateProbeManifest } from "../src/index.js";
import { createProbeSessionForTest } from "../src/session.js";
import {
  createJsonlEventSinkForTest,
  type EventSegmentFileHandle,
} from "../src/sink.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

const routeInvocations = [
  {
    routeInvocationId: "automatic-route",
    phase: "module-evaluation",
    triggerType: "automatic",
    invocationKind: "module-evaluation",
    logicalUnitId: "adapter-entry",
    enabled: true,
  },
  {
    routeInvocationId: "configured-route",
    phase: "tool-initialization",
    triggerType: "configured",
    invocationKind: "tool-initialization",
    logicalUnitId: "plugin-instance",
    enabled: true,
  },
  {
    routeInvocationId: "explicit-route",
    phase: "cli-stage",
    triggerType: "explicit",
    invocationKind: "cli-stage",
    logicalUnitId: "generation-stage",
    enabled: true,
  },
] as const;

function routeOptions() {
  return {
    phases: ["module-evaluation", "tool-initialization", "cli-stage"],
    triggerTypes: ["automatic", "configured", "explicit"] as const,
    routeInvocations,
  };
}

async function routeFixture() {
  return createTestConfiguration([], [], [], routeOptions());
}

function successfulHandle(): EventSegmentFileHandle {
  return {
    async write(_buffer, _offset, length) {
      return { bytesWritten: length };
    },
    async close() {},
  };
}

describe("route invocation recording", () => {
  it("records automatic, configured, and explicit invocations with fixed logical units", async () => {
    const fixture = await routeFixture();
    try {
      const session = await createProbeSession(fixture.configuration);
      const automatic = await session.recordRouteInvocation("automatic-route", {
        outcome: "success",
      });
      const configured = await session.recordRouteInvocation(
        "configured-route",
        { outcome: "failure" },
      );
      const explicit = await session.recordRouteInvocation("explicit-route", {
        outcome: "skipped",
      });
      await session.close();

      expect(automatic).toMatchObject({
        eventKind: "route-invocation",
        phase: "module-evaluation",
        triggerType: "automatic",
        invocationKind: "module-evaluation",
        logicalUnitId: "adapter-entry",
        outcome: "success",
        normalizedErrorCode: null,
      });
      expect(configured).toMatchObject({
        triggerType: "configured",
        outcome: "failure",
        normalizedErrorCode: "ROUTE_INVOCATION_FAILED",
      });
      expect(explicit).toMatchObject({
        triggerType: "explicit",
        outcome: "skipped",
        normalizedErrorCode: "NOT_APPLICABLE",
      });
      expect(automatic).not.toHaveProperty("attemptType");
      expect(automatic).not.toHaveProperty("details");
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects invalid invocation kinds, unapproved phases, and path-shaped logical IDs", () => {
    for (const invalidDefinition of [
      { ...routeInvocations[0], invocationKind: "arbitrary-callback" },
      { ...routeInvocations[0], phase: "unapproved-phase" },
      { ...routeInvocations[0], logicalUnitId: "/tmp/raw-file.ts" },
      { ...routeInvocations[0], logicalUnitId: "../raw-file.ts" },
    ]) {
      expect(() =>
        validateProbeManifest(
          baseManifest([], [], {
            phases: ["module-evaluation"],
            triggerTypes: ["automatic"],
            routeInvocations: [invalidDefinition as never],
          }),
        ),
      ).toThrowError(expect.objectContaining({ code: "INVALID_MANIFEST" }));
    }
  });

  it("rejects unknown IDs and fixed-input injection without invoking getters or toJSON", async () => {
    const fixture = await routeFixture();
    const session = await createProbeSession(fixture.configuration);
    let getterCalls = 0;
    const getter = Object.defineProperty({}, "outcome", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "success";
      },
    });
    const toJSON = vi.fn(() => ({ raw: "/tmp/raw-file.ts" }));
    const candidates = [
      getter,
      new Proxy(
        { outcome: "success" },
        {
          ownKeys() {
            throw new Error("raw disposable canary");
          },
        },
      ),
      { outcome: "success", unexpected: true },
      { outcome: "success", details: { raw: true } },
      { outcome: "success", toJSON },
    ];
    try {
      await expect(
        session.recordRouteInvocation("unknown-route", {
          outcome: "success",
        }),
      ).rejects.toMatchObject({ code: "INVALID_TARGET" });
      for (const candidate of candidates) {
        await expect(
          session.recordRouteInvocation("automatic-route", candidate as never),
        ).rejects.toMatchObject({ code: "SERIALIZATION_FAILURE" });
      }
      expect(getterCalls).toBe(0);
      expect(toJSON).not.toHaveBeenCalled();
      await session.close();
      expect(await readFile(fixture.eventPath, "utf8")).toBe("");
    } finally {
      await fixture.cleanup();
    }
  });

  it("shares the segment event limit and propagates terminal sink failure", async () => {
    const fixture = await routeFixture();
    const sink = createJsonlEventSinkForTest(
      fixture.configuration,
      successfulHandle(),
      {
        maxEventCount: 1,
        maxEventBytes: 32_768,
        maxSegmentBytes: 65_536,
      },
    );
    const session = createProbeSessionForTest(fixture.configuration, sink);
    try {
      await session.recordRouteInvocation("automatic-route", {
        outcome: "success",
      });
      await expect(
        session.recordRouteInvocation("automatic-route", {
          outcome: "success",
        }),
      ).rejects.toMatchObject({ code: "SEGMENT_LIMIT_EXCEEDED" });
      expect(session.state).toBe("failed");
      await expect(session.close()).rejects.toMatchObject({
        code: "SEGMENT_LIMIT_EXCEEDED",
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("does not report route success when its evidence write fails", async () => {
    const fixture = await routeFixture();
    const handle: EventSegmentFileHandle = {
      async write() {
        throw new Error("raw sink failure");
      },
      async close() {},
    };
    const session = createProbeSessionForTest(
      fixture.configuration,
      createJsonlEventSinkForTest(fixture.configuration, handle),
    );
    try {
      await expect(
        session.recordRouteInvocation("automatic-route", {
          outcome: "success",
        }),
      ).rejects.toMatchObject({ code: "EVIDENCE_WRITE_FAILURE" });
      expect(session.state).toBe("failed");
      await expect(session.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("close waits for a route event already in flight", async () => {
    const fixture = await routeFixture();
    let release!: () => void;
    let started!: () => void;
    const writeStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    const handle: EventSegmentFileHandle = {
      async write(_buffer, _offset, length) {
        started();
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return { bytesWritten: length };
      },
      async close() {},
    };
    const session = createProbeSessionForTest(
      fixture.configuration,
      createJsonlEventSinkForTest(fixture.configuration, handle),
    );
    try {
      const recording = session.recordRouteInvocation("automatic-route", {
        outcome: "success",
      });
      const closing = session.close();
      await writeStarted;
      await expect(
        session.recordRouteInvocation("automatic-route", {
          outcome: "success",
        }),
      ).rejects.toMatchObject({ code: "SESSION_NOT_OPEN" });
      let settled = false;
      void closing.then(() => {
        settled = true;
      });
      await Promise.resolve();
      expect(settled).toBe(false);
      release();
      await recording;
      await closing;
      expect(session.state).toBe("closed");
    } finally {
      await fixture.cleanup();
    }
  });
});
