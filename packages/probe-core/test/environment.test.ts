import { readFile } from "node:fs/promises";

import { afterEach, describe, expect, it } from "vitest";

import {
  ProbeError,
  createProbeSession,
  validateProbeManifest,
} from "../src/index.js";
import { baseManifest, createTestConfiguration } from "./helpers.js";

const canaryName = "PROBE_CANARY_M1_ENVIRONMENT";

afterEach(() => {
  delete process.env[canaryName];
});

describe("environment canary attempt", () => {
  it("records presence and byte length without the raw value", async () => {
    const rawCanary = "disposable-secret-shaped-canary";
    process.env[canaryName] = rawCanary;
    const fixture = await createTestConfiguration(
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
          enabled: true,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const event = await session.runAttempt("env-attempt");
      await session.close();
      expect(event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
        details: {
          kind: "environment",
          present: true,
          byteLength: Buffer.byteLength(rawCanary),
        },
      });
      const jsonl = await readFile(fixture.eventPath, "utf8");
      expect(jsonl).not.toContain(rawCanary);
      expect(jsonl).not.toContain(canaryName);
    } finally {
      await fixture.cleanup();
    }
  });

  it("records an absent canary as a normalized failure", async () => {
    const fixture = await createTestConfiguration(
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
          enabled: true,
        },
      ],
      [{ targetId: "env-target", kind: "environment" }],
    );
    try {
      const session = await createProbeSession(fixture.configuration);
      const event = await session.runAttempt("env-attempt");
      await session.close();
      expect(event).toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "ENVIRONMENT_VARIABLE_ABSENT",
        details: { present: false, byteLength: null },
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects a non-canary variable name", () => {
    let error: unknown;
    try {
      validateProbeManifest(
        baseManifest([
          {
            targetId: "env-target",
            kind: "environment",
            variableName: "HOME",
          },
        ]),
      );
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ProbeError);
    expect((error as ProbeError).code).toBe("ENVIRONMENT_VARIABLE_NOT_ALLOWED");
  });
});
