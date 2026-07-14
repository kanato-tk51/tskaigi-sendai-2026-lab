import { mkdtemp, rm } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  MAX_ATTEMPT_TIMEOUT_MS,
  ProbeError,
  PROBE_MANIFEST_SCHEMA_VERSION,
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
  validateProbeManifest,
} from "../src/index.js";
import type { ProbeTarget, RuntimeBinding } from "../src/index.js";
import {
  baseManifest,
  baseRuntimeBindings,
  type TestCapabilityAttempt,
} from "./helpers.js";

function errorCode(operation: () => unknown): string | null {
  try {
    operation();
    return null;
  } catch (error) {
    return error instanceof ProbeError ? error.code : "unexpected";
  }
}

describe("manifest and runtime binding validation", () => {
  it("accepts a complete valid manifest and bindings", () => {
    const manifest = baseManifest(
      [
        {
          targetId: "env-target",
          kind: "environment",
          variableName: "PROBE_CANARY_VALID",
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
    const configuration = validateProbeConfiguration(
      manifest,
      baseRuntimeBindings("/tmp/probe-core-validation", [
        { targetId: "env-target", kind: "environment" },
      ]),
    );
    expect(configuration.manifest.schemaVersion).toBe(
      PROBE_MANIFEST_SCHEMA_VERSION,
    );
  });

  it("rejects an unknown schema version", () => {
    expect(
      errorCode(() =>
        validateProbeManifest({ ...baseManifest(), schemaVersion: "unknown" }),
      ),
    ).toBe("INVALID_MANIFEST");
  });

  it("rejects IDs containing separators or control characters", () => {
    for (const runId of ["../escape", "bad/id", "bad\nline", ""]) {
      expect(
        errorCode(() => validateProbeManifest({ ...baseManifest(), runId })),
      ).toBe("INVALID_MANIFEST");
    }
  });

  it("rejects duplicate attempt and target IDs", () => {
    const target = {
      targetId: "env-target",
      kind: "environment",
      variableName: "PROBE_CANARY_DUPLICATE",
    } as const;
    const attempt = {
      attemptId: "env-attempt",
      type: "environment-canary-read",
      targetId: target.targetId,
      enabled: true,
    } as const;
    expect(
      errorCode(() => validateProbeManifest(baseManifest([target, target]))),
    ).toBe("INVALID_MANIFEST");
    expect(
      errorCode(() =>
        validateProbeManifest(baseManifest([target], [attempt, attempt])),
      ),
    ).toBe("INVALID_MANIFEST");
  });

  it("validates phase IDs and duplicate phase/trigger allowlist entries", () => {
    for (const phases of [
      [],
      ["phase", "phase"],
      ["bad/phase"],
      ["../phase"],
      ["x".repeat(65)],
    ]) {
      expect(() =>
        validateProbeManifest({ ...baseManifest(), phases }),
      ).toThrowError(expect.objectContaining({ code: "INVALID_MANIFEST" }));
    }
    expect(() =>
      validateProbeManifest({
        ...baseManifest(),
        triggerTypes: ["automatic", "automatic"],
      }),
    ).toThrowError(expect.objectContaining({ code: "INVALID_MANIFEST" }));
  });

  it("rejects an unknown capability type", () => {
    const manifest = baseManifest(
      [],
      [
        {
          attemptId: "unknown-attempt",
          type: "arbitrary-command",
          targetId: "event-segment",
          enabled: true,
        } as never,
      ],
    );
    expect(errorCode(() => validateProbeManifest(manifest))).toBe(
      "INVALID_MANIFEST",
    );
  });

  it("rejects a missing runtime binding", () => {
    const manifest = baseManifest([
      {
        targetId: "read-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 100,
      },
    ]);
    expect(
      errorCode(() =>
        validateProbeConfiguration(
          manifest,
          baseRuntimeBindings("/tmp/probe-core-validation"),
        ),
      ),
    ).toBe("INVALID_TARGET");
  });

  it("rejects an excessive timeout", () => {
    const manifest = baseManifest([
      {
        targetId: "network-target",
        kind: "loopback-http",
        timeoutMs: MAX_ATTEMPT_TIMEOUT_MS + 1,
      },
    ]);
    expect(errorCode(() => validateProbeManifest(manifest))).toBe(
      "INVALID_MANIFEST",
    );
  });

  it("rejects unknown fields at every input boundary", () => {
    expect(
      errorCode(() =>
        validateProbeManifest({ ...baseManifest(), unexpected: true }),
      ),
    ).toBe("INVALID_MANIFEST");

    const manifest = baseManifest([
      {
        targetId: "env-target",
        kind: "environment",
        variableName: "PROBE_CANARY_UNKNOWN_FIELD",
        unexpected: true,
      } as never,
    ]);
    expect(errorCode(() => validateProbeManifest(manifest))).toBe(
      "INVALID_MANIFEST",
    );
  });

  it("builds a deeply immutable canonical snapshot independent of caller mutation", () => {
    const targets: ProbeTarget[] = [
      {
        targetId: "env-target",
        kind: "environment",
        variableName: "PROBE_CANARY_SNAPSHOT_ORIGINAL",
      },
      {
        targetId: "file-target",
        kind: "file-read",
        classification: "canary",
        maxBytes: 100,
      },
      {
        targetId: "network-target",
        kind: "loopback-http",
        timeoutMs: 100,
      },
      {
        targetId: "child-target",
        kind: "fixed-child",
        timeoutMs: 100,
        maxOutputBytes: 100,
      },
    ];
    const attempts: TestCapabilityAttempt[] = [
      {
        attemptId: "env-attempt",
        type: "environment-canary-read",
        targetId: "env-target",
        enabled: false,
      },
      {
        attemptId: "file-attempt",
        type: "canary-file-read",
        targetId: "file-target",
        enabled: false,
      },
      {
        attemptId: "network-attempt",
        type: "loopback-connect",
        targetId: "network-target",
        enabled: false,
      },
      {
        attemptId: "child-attempt",
        type: "child-node-process",
        targetId: "child-target",
        enabled: false,
      },
    ];
    const bindings: RuntimeBinding[] = [
      { targetId: "env-target", kind: "environment" },
      {
        targetId: "file-target",
        kind: "path",
        rootPath: "/tmp/probe-core-original-root",
        relativePath: "original.txt",
      },
      {
        targetId: "network-target",
        kind: "loopback-http",
        address: "127.0.0.1",
        port: 32123,
      },
      { targetId: "child-target", kind: "fixed-child" },
    ];
    const manifest = baseManifest(targets, attempts);
    const runtimeBindings = baseRuntimeBindings(
      "/tmp/probe-core-validation",
      bindings,
    );
    const configuration = validateProbeConfiguration(manifest, runtimeBindings);

    Object.assign(targets[0] as object, {
      targetId: "mutated-env-target",
      variableName: "PROBE_CANARY_SNAPSHOT_MUTATED",
    });
    Object.assign(targets[2] as object, { timeoutMs: 9_999 });
    Object.assign(attempts[0] as object, {
      type: "child-node-process",
      targetId: "child-target",
      enabled: true,
    });
    Object.assign(bindings[1] as object, {
      rootPath: "/tmp/probe-core-mutated-root",
      relativePath: "mutated.txt",
    });
    Object.assign(bindings[2] as object, {
      address: "::1",
      port: 32124,
    });
    Object.assign(bindings[3] as object, { kind: "environment" });

    expect(configuration.manifest.targets[0]).toEqual({
      targetId: "env-target",
      kind: "environment",
      variableName: "PROBE_CANARY_SNAPSHOT_ORIGINAL",
    });
    expect(configuration.manifest.targets[2]).toMatchObject({ timeoutMs: 100 });
    expect(configuration.manifest.attempts[0]).toEqual({
      attemptId: "env-attempt",
      type: "environment-canary-read",
      targetId: "env-target",
      phase: "tool-initialization",
      triggerType: "configured",
      enabled: false,
    });
    expect(configuration.runtimeBindings.bindings[1]).toMatchObject({
      rootPath: "/tmp/probe-core-original-root",
      relativePath: "original.txt",
    });
    expect(configuration.runtimeBindings.bindings[2]).toMatchObject({
      address: "127.0.0.1",
      port: 32123,
    });
    expect(configuration.runtimeBindings.bindings[3]).toMatchObject({
      kind: "fixed-child",
    });

    expect(
      Reflect.set(
        configuration.manifest.targets[0] as object,
        "variableName",
        "PROBE_CANARY_OTHER",
      ),
    ).toBe(false);
    expect(
      Reflect.set(configuration.manifest.targets[2] as object, "timeoutMs", 1),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.manifest.attempts[0] as object,
        "enabled",
        true,
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.manifest.attempts[0] as object,
        "type",
        "child-node-process",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.manifest.attempts[0] as object,
        "targetId",
        "child-target",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.runtimeBindings.bindings[1] as object,
        "rootPath",
        "/tmp/other",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.runtimeBindings.bindings[1] as object,
        "relativePath",
        "other.txt",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.runtimeBindings.bindings[2] as object,
        "address",
        "::1",
      ),
    ).toBe(false);
    expect(
      Reflect.set(
        configuration.runtimeBindings.bindings[2] as object,
        "port",
        1,
      ),
    ).toBe(false);
    expect(() =>
      (configuration.manifest.targets as ProbeTarget[]).push(targets[0]!),
    ).toThrow();
  });

  it("rejects accessors, proxies, and accessor array elements without evaluating them", () => {
    let getterCalls = 0;
    const getterManifest = baseManifest();
    Object.defineProperty(getterManifest, "runId", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return getterCalls === 1 ? "run-first" : "run-second";
      },
    });
    expect(errorCode(() => validateProbeManifest(getterManifest))).toBe(
      "INVALID_MANIFEST",
    );
    expect(getterCalls).toBe(0);

    const targetGetterManifest = baseManifest();
    const targets = targetGetterManifest.targets as ProbeTarget[];
    Object.defineProperty(targets, "0", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return { targetId: "raw-path", kind: "event-segment" };
      },
    });
    expect(errorCode(() => validateProbeManifest(targetGetterManifest))).toBe(
      "INVALID_MANIFEST",
    );
    expect(getterCalls).toBe(0);

    const proxied = new Proxy(baseManifest(), {
      get() {
        throw new Error("raw disposable canary");
      },
    });
    expect(errorCode(() => validateProbeManifest(proxied))).toBe(
      "INVALID_MANIFEST",
    );
  });

  it("executes only the private snapshot after input and returned-object mutation attempts", async () => {
    const originalName = "PROBE_CANARY_MUTATION_ORIGINAL";
    const mutatedName = "PROBE_CANARY_MUTATION_CHANGED";
    process.env[originalName] = "disposable";
    delete process.env[mutatedName];
    const eventRoot = await mkdtemp("/tmp/probe-core-validation-");
    const target = {
      targetId: "env-target",
      kind: "environment",
      variableName: originalName,
    } as const;
    const attempt = {
      attemptId: "env-attempt",
      type: "environment-canary-read",
      targetId: "env-target",
      enabled: true,
    } as const;
    const configuration = validateProbeConfiguration(
      baseManifest([target], [attempt]),
      baseRuntimeBindings(eventRoot, [
        { targetId: "env-target", kind: "environment" },
      ]),
    );
    Object.assign(target as object, {
      targetId: "mutated-target",
      variableName: mutatedName,
    });
    Object.assign(attempt as object, {
      enabled: false,
      type: "child-node-process",
      targetId: "mutated-target",
    });
    Reflect.set(
      configuration.manifest.targets[0] as object,
      "variableName",
      mutatedName,
    );
    Reflect.set(configuration.manifest.attempts[0] as object, "enabled", false);

    const prepared = await prepareProbeConfiguration(configuration);
    const session = await createProbeSession(prepared);
    try {
      const event = await session.runAttempt("env-attempt");
      expect(event).toMatchObject({
        targetId: "env-target",
        outcome: "success",
        details: { kind: "environment", present: true },
      });
    } finally {
      await session.close();
      delete process.env[originalName];
      delete process.env[mutatedName];
      await rm(eventRoot, { recursive: true, force: true });
    }
  });
});
