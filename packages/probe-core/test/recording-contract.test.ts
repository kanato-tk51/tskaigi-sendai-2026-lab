import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { createProbeSession, validateProbeManifest } from "../src/index.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

const beforeHash = `sha256:${"a".repeat(64)}` as const;
const afterHash = `sha256:${"b".repeat(64)}` as const;

describe("multiple-phase event recording contract", () => {
  it("records different phases in one producer segment without resetting sequence", async () => {
    const phases = [
      "module-evaluation",
      "tool-initialization",
      "file-hook",
      "official-api-change",
    ];
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_MULTIPLE_PHASE",
        },
      ],
      [
        {
          attemptId: "file-hook-attempt",
          type: "environment-canary-read",
          targetId: "env-target",
          phase: "file-hook",
          triggerType: "automatic",
          enabled: false,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
      {
        phases,
        triggerTypes: ["automatic", "configured"],
        routeInvocations: [
          {
            routeInvocationId: "module-evaluation-route",
            phase: "module-evaluation",
            triggerType: "configured",
            invocationKind: "module-evaluation",
            logicalUnitId: "adapter-entry",
            enabled: true,
          },
          {
            routeInvocationId: "tool-initialization-route",
            phase: "tool-initialization",
            triggerType: "configured",
            invocationKind: "tool-initialization",
            logicalUnitId: "plugin-instance",
            enabled: true,
          },
        ],
        toolApiTargets: [
          { targetId: "source-target", classification: "source" },
        ],
        toolApiChanges: [
          {
            toolApiChangeId: "official-change",
            phase: "official-api-change",
            triggerType: "automatic",
            changeKind: "source-fix",
            targetId: "source-target",
            enabled: true,
          },
        ],
      },
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = [
        await session.recordRouteInvocation("module-evaluation-route", {
          outcome: "success",
        }),
        await session.recordRouteInvocation("tool-initialization-route", {
          outcome: "success",
        }),
        await session.runAttempt("file-hook-attempt"),
        await session.recordToolApiChange("official-change", {
          outcome: "success",
          changed: true,
          beforeHash,
          afterHash,
          byteSizeBefore: 10,
          byteSizeAfter: 11,
        }),
      ];
      await session.close();

      expect(events.map((event) => event.phase)).toEqual(phases);
      expect(events.map((event) => event.producerId)).toEqual(
        Array(4).fill("producer-1"),
      );
      expect(events.map((event) => event.producerSequence)).toEqual([
        0, 1, 2, 3,
      ]);
      expect(Reflect.set(events[0]!, "phase", "mutated-phase")).toBe(false);
      const written = (await readFile(fixture.eventPath, "utf8"))
        .trimEnd()
        .split("\n")
        .map(
          (line) =>
            JSON.parse(line) as {
              phase: string;
              producerSequence: number;
            },
        );
      expect(written.map((event) => event.phase)).toEqual(phases);
      expect(written.map((event) => event.producerSequence)).toEqual([
        0, 1, 2, 3,
      ]);
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects a declaration that references a phase outside the manifest allowlist", () => {
    expect(() =>
      validateProbeManifest(
        baseManifest([], [], {
          phases: ["allowed-phase"],
          triggerTypes: ["automatic"],
          routeInvocations: [
            {
              routeInvocationId: "route",
              phase: "unapproved-phase",
              triggerType: "automatic",
              invocationKind: "module-evaluation",
              logicalUnitId: "entry",
              enabled: true,
            },
          ],
        }),
      ),
    ).toThrowError(expect.objectContaining({ code: "INVALID_MANIFEST" }));
  });
});

describe("producer sequence sharing", () => {
  it("shares one monotonic sequence across every event kind", async () => {
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_SHARED_SEQUENCE",
        },
      ],
      [
        {
          attemptId: "attempt-one",
          type: "environment-canary-read",
          targetId: "env-target",
          phase: "capability-phase",
          triggerType: "automatic",
          enabled: false,
        },
        {
          attemptId: "attempt-two",
          type: "environment-canary-read",
          targetId: "env-target",
          phase: "capability-phase",
          triggerType: "automatic",
          enabled: false,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
      {
        phases: ["route-phase", "capability-phase", "change-phase"],
        triggerTypes: ["automatic"],
        routeInvocations: [
          {
            routeInvocationId: "route-one",
            phase: "route-phase",
            triggerType: "automatic",
            invocationKind: "file-hook",
            logicalUnitId: "file-one",
            enabled: true,
          },
          {
            routeInvocationId: "route-two",
            phase: "route-phase",
            triggerType: "automatic",
            invocationKind: "file-hook",
            logicalUnitId: "file-two",
            enabled: true,
          },
        ],
        toolApiTargets: [
          { targetId: "source-target", classification: "source" },
        ],
        toolApiChanges: [
          {
            toolApiChangeId: "change",
            phase: "change-phase",
            triggerType: "automatic",
            changeKind: "module-transform",
            targetId: "source-target",
            enabled: true,
          },
        ],
      },
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const events = [
        await session.recordRouteInvocation("route-one", {
          outcome: "success",
        }),
        await session.runAttempt("attempt-one"),
        await session.recordToolApiChange("change", {
          outcome: "success",
          changed: false,
          beforeHash,
          afterHash: beforeHash,
          byteSizeBefore: 10,
          byteSizeAfter: 10,
        }),
        await session.runAttempt("attempt-two"),
        await session.recordRouteInvocation("route-two", {
          outcome: "success",
        }),
      ];
      await session.close();
      expect(events.map((event) => event.eventKind)).toEqual([
        "route-invocation",
        "capability-attempt",
        "tool-api-change",
        "capability-attempt",
        "route-invocation",
      ]);
      expect(events.map((event) => event.producerSequence)).toEqual([
        0, 1, 2, 3, 4,
      ]);
    } finally {
      await fixture.cleanup();
    }
  });
});
