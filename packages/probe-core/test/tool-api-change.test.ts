import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { createProbeSession, validateProbeManifest } from "../src/index.js";
import { createProbeSessionForTest } from "../src/session.js";
import {
  createJsonlEventSinkForTest,
  type EventSegmentFileHandle,
} from "../src/sink.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

const beforeHash = `sha256:${"a".repeat(64)}` as const;
const sameHash = beforeHash;
const afterHash = `sha256:${"b".repeat(64)}` as const;

const toolApiTargets = [
  { targetId: "source-fix-target", classification: "source" },
  { targetId: "source-generation-target", classification: "source" },
  { targetId: "module-transform-target", classification: "source" },
  { targetId: "emitted-asset-target", classification: "artifact" },
  { targetId: "emitted-chunk-target", classification: "artifact" },
  { targetId: "bundle-mutation-target", classification: "artifact" },
] as const;

const toolApiChanges = [
  {
    toolApiChangeId: "source-fix-change",
    phase: "source-fix-phase",
    triggerType: "automatic",
    changeKind: "source-fix",
    targetId: "source-fix-target",
    enabled: true,
  },
  {
    toolApiChangeId: "source-generation-change",
    phase: "source-generation-phase",
    triggerType: "explicit",
    changeKind: "source-generation",
    targetId: "source-generation-target",
    enabled: true,
  },
  {
    toolApiChangeId: "module-transform-change",
    phase: "module-transform-phase",
    triggerType: "configured",
    changeKind: "module-transform",
    targetId: "module-transform-target",
    enabled: true,
  },
  {
    toolApiChangeId: "emitted-asset-change",
    phase: "emitted-asset-phase",
    triggerType: "automatic",
    changeKind: "emitted-asset",
    targetId: "emitted-asset-target",
    enabled: true,
  },
  {
    toolApiChangeId: "emitted-chunk-change",
    phase: "emitted-chunk-phase",
    triggerType: "automatic",
    changeKind: "emitted-chunk",
    targetId: "emitted-chunk-target",
    enabled: true,
  },
  {
    toolApiChangeId: "bundle-mutation-change",
    phase: "bundle-mutation-phase",
    triggerType: "automatic",
    changeKind: "bundle-mutation",
    targetId: "bundle-mutation-target",
    enabled: true,
  },
] as const;

function toolOptions() {
  return {
    phases: toolApiChanges.map((change) => change.phase),
    triggerTypes: ["automatic", "configured", "explicit"] as const,
    toolApiTargets,
    toolApiChanges,
  };
}

async function toolFixture() {
  return createTestConfiguration([], [], [], toolOptions());
}

function changedResult(
  changeKind: (typeof toolApiChanges)[number]["changeKind"],
) {
  const generative =
    changeKind === "source-generation" ||
    changeKind === "emitted-asset" ||
    changeKind === "emitted-chunk";
  return generative
    ? {
        outcome: "success" as const,
        changed: true,
        beforeHash: null,
        afterHash,
        byteSizeBefore: null,
        byteSizeAfter: 12,
      }
    : {
        outcome: "success" as const,
        changed: true,
        beforeHash,
        afterHash,
        byteSizeBefore: 10,
        byteSizeAfter: 12,
      };
}

describe("official tool API change recording", () => {
  it("records every fixed change kind and keeps source/artifact classification", async () => {
    const fixture = await toolFixture();
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = [];
      for (const definition of toolApiChanges) {
        events.push(
          await session.recordToolApiChange(
            definition.toolApiChangeId,
            changedResult(definition.changeKind),
          ),
        );
      }
      await session.close();
      expect(events.map((event) => event.changeKind)).toEqual([
        "source-fix",
        "source-generation",
        "module-transform",
        "emitted-asset",
        "emitted-chunk",
        "bundle-mutation",
      ]);
      expect(events.map((event) => event.targetClassification)).toEqual([
        "source",
        "source",
        "source",
        "artifact",
        "artifact",
        "artifact",
      ]);
      expect(
        events.every((event) => event.eventKind === "tool-api-change"),
      ).toBe(true);
      expect(events.every((event) => !("attemptType" in event))).toBe(true);
      expect(events.every((event) => !("details" in event))).toBe(true);
    } finally {
      await fixture.cleanup();
    }
  });

  it("represents changed false with equal hashes and byte sizes", async () => {
    const fixture = await toolFixture();
    try {
      const session = await createProbeSession(fixture.configuration);
      const event = await session.recordToolApiChange("source-fix-change", {
        outcome: "success",
        changed: false,
        beforeHash: sameHash,
        afterHash: sameHash,
        byteSizeBefore: 10,
        byteSizeAfter: 10,
      });
      await session.close();
      expect(event).toMatchObject({
        changed: false,
        beforeHash: sameHash,
        afterHash: sameHash,
        byteSizeBefore: 10,
        byteSizeAfter: 10,
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("records normalized failure and skipped outcomes without change evidence", async () => {
    const options = toolOptions();
    const fixture = await createTestConfiguration([], [], [], {
      ...options,
      toolApiChanges: [
        options.toolApiChanges[0],
        { ...options.toolApiChanges[1], enabled: false },
      ],
    });
    try {
      const session = await createProbeSession(fixture.configuration);
      const failure = await session.recordToolApiChange("source-fix-change", {
        outcome: "failure",
        changed: false,
        beforeHash: null,
        afterHash: null,
        byteSizeBefore: null,
        byteSizeAfter: null,
      });
      const skipped = await session.recordToolApiChange(
        "source-generation-change",
        {
          outcome: "skipped",
          changed: false,
          beforeHash: null,
          afterHash: null,
          byteSizeBefore: null,
          byteSizeAfter: null,
        },
      );
      await session.close();
      expect(failure.normalizedErrorCode).toBe("TOOL_API_CHANGE_FAILED");
      expect(skipped.normalizedErrorCode).toBe("MANIFEST_DISALLOWED");
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects inconsistent hash and byte-size semantics before writing", async () => {
    const fixture = await toolFixture();
    const session = await createProbeSession(fixture.configuration);
    const invalidResults = [
      {
        outcome: "success",
        changed: false,
        beforeHash,
        afterHash,
        byteSizeBefore: 10,
        byteSizeAfter: 10,
      },
      {
        outcome: "success",
        changed: true,
        beforeHash,
        afterHash: beforeHash,
        byteSizeBefore: 10,
        byteSizeAfter: 11,
      },
      {
        outcome: "failure",
        changed: true,
        beforeHash,
        afterHash,
        byteSizeBefore: 10,
        byteSizeAfter: 11,
      },
      {
        outcome: "success",
        changed: true,
        beforeHash,
        afterHash,
        byteSizeBefore: -1,
        byteSizeAfter: 11,
      },
    ];
    try {
      for (const result of invalidResults) {
        await expect(
          session.recordToolApiChange("source-fix-change", result as never),
        ).rejects.toMatchObject({ code: "SERIALIZATION_FAILURE" });
      }
      await expect(
        session.recordToolApiChange("source-generation-change", {
          outcome: "success",
          changed: true,
          beforeHash,
          afterHash,
          byteSizeBefore: 10,
          byteSizeAfter: 11,
        }),
      ).rejects.toMatchObject({ code: "SERIALIZATION_FAILURE" });
      await session.close();
      expect(await readFile(fixture.eventPath, "utf8")).toBe("");
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects arbitrary change kinds and canary/output or unknown targets", () => {
    const baseChange = toolApiChanges[0];
    const invalidOptions = [
      {
        toolApiTargets: [
          { targetId: "source-fix-target", classification: "canary" },
        ],
        toolApiChanges: [baseChange],
      },
      {
        toolApiTargets: [
          { targetId: "source-fix-target", classification: "output" },
        ],
        toolApiChanges: [baseChange],
      },
      {
        toolApiTargets: [],
        toolApiChanges: [baseChange],
      },
      {
        toolApiTargets: [
          { targetId: "source-fix-target", classification: "source" },
        ],
        toolApiChanges: [{ ...baseChange, changeKind: "arbitrary-change" }],
      },
      {
        toolApiTargets: [
          { targetId: "source-fix-target", classification: "source" },
        ],
        toolApiChanges: [{ ...baseChange, changeKind: "emitted-asset" }],
      },
    ];
    for (const invalid of invalidOptions) {
      expect(() =>
        validateProbeManifest(
          baseManifest([], [], {
            phases: ["source-fix-phase"],
            triggerTypes: ["automatic"],
            toolApiTargets: invalid.toolApiTargets as never,
            toolApiChanges: invalid.toolApiChanges as never,
          }),
        ),
      ).toThrowError(
        expect.objectContaining({
          code: expect.stringMatching(/^INVALID_(?:MANIFEST|TARGET)$/u),
        }),
      );
    }
  });

  it("rejects raw content, diff, arbitrary details, getters, Proxy, and toJSON", async () => {
    const fixture = await toolFixture();
    const session = await createProbeSession(fixture.configuration);
    let getterCalls = 0;
    const getter = {
      outcome: "success",
      changed: true,
      beforeHash,
      afterHash,
      byteSizeBefore: 10,
      byteSizeAfter: 11,
    } as Record<string, unknown>;
    Object.defineProperty(getter, "changed", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return true;
      },
    });
    const toJSON = vi.fn(() => "/tmp/raw-source.ts");
    const valid = changedResult("source-fix");
    const candidates = [
      { ...valid, rawContent: "raw source" },
      { ...valid, diff: "raw diff" },
      { ...valid, details: { raw: true } },
      { ...valid, toJSON },
      getter,
      new Proxy(valid, {
        ownKeys() {
          throw new Error("raw disposable canary");
        },
      }),
    ];
    try {
      await expect(
        session.recordToolApiChange("unknown-change", valid),
      ).rejects.toMatchObject({ code: "INVALID_TARGET" });
      for (const candidate of candidates) {
        await expect(
          session.recordToolApiChange("source-fix-change", candidate as never),
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

  it("propagates sink failure and close waits for an in-flight change event", async () => {
    const failedFixture = await toolFixture();
    const failedHandle: EventSegmentFileHandle = {
      async write() {
        throw new Error("raw sink failure");
      },
      async close() {},
    };
    const failedSession = createProbeSessionForTest(
      failedFixture.configuration,
      createJsonlEventSinkForTest(failedFixture.configuration, failedHandle),
    );
    try {
      await expect(
        failedSession.recordToolApiChange(
          "source-fix-change",
          changedResult("source-fix"),
        ),
      ).rejects.toMatchObject({ code: "EVIDENCE_WRITE_FAILURE" });
      await expect(failedSession.close()).rejects.toMatchObject({
        code: "EVIDENCE_WRITE_FAILURE",
      });
    } finally {
      await failedFixture.cleanup();
    }

    const raceFixture = await toolFixture();
    let release!: () => void;
    let started!: () => void;
    const writeStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    const raceHandle: EventSegmentFileHandle = {
      async write(_buffer, _offset, length) {
        started();
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return { bytesWritten: length };
      },
      async close() {},
    };
    const raceSession = createProbeSessionForTest(
      raceFixture.configuration,
      createJsonlEventSinkForTest(raceFixture.configuration, raceHandle),
    );
    try {
      const recording = raceSession.recordToolApiChange(
        "source-fix-change",
        changedResult("source-fix"),
      );
      const closing = raceSession.close();
      await writeStarted;
      await expect(
        raceSession.recordToolApiChange(
          "source-fix-change",
          changedResult("source-fix"),
        ),
      ).rejects.toMatchObject({ code: "SESSION_NOT_OPEN" });
      release();
      await recording;
      await closing;
      expect(raceSession.state).toBe("closed");
    } finally {
      await raceFixture.cleanup();
    }
  });
});
