import { describe, expect, it } from "vitest";

import {
  ATTEMPT_IDS,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_ROUTE_COUNT,
  PHASES,
  ROUTE_IDS,
  SETUP_LOGICAL_ID,
} from "../src/constants.js";
import {
  createFixedProvidedContext,
  validateFixedProvidedContext,
} from "../src/context.js";
import {
  createFixedManifest,
  validateVitestManifestContract,
} from "../src/manifest.js";

describe("M2-C fixed contract", () => {
  it("fixes two checkpoints in one awaited setup-module import", () => {
    const manifest = createFixedManifest(
      "m2c-vitest-00000000000000000000000000000000",
    );
    validateVitestManifestContract(manifest);
    expect(manifest.route).toBe("vitest-setup");
    expect(manifest.routeInvocations).toEqual([
      expect.objectContaining({
        routeInvocationId: ROUTE_IDS.lateModuleCheckpoint,
        phase: PHASES.lateModuleCheckpoint,
        triggerType: "configured",
        invocationKind: "module-evaluation",
        logicalUnitId: SETUP_LOGICAL_ID,
      }),
      expect.objectContaining({
        routeInvocationId: ROUTE_IDS.setupBodyCheckpoint,
        phase: PHASES.setupBodyCheckpoint,
        triggerType: "automatic",
        invocationKind: "setup-execution",
        logicalUnitId: SETUP_LOGICAL_ID,
      }),
    ]);
    expect(manifest.routeInvocations).toHaveLength(EXPECTED_ROUTE_COUNT);
    expect(manifest.attempts.map((attempt) => attempt.attemptId)).toEqual(
      Object.values(ATTEMPT_IDS),
    );
    expect(manifest.attempts).toHaveLength(EXPECTED_CAPABILITY_COUNT);
    expect(manifest.toolApiTargets).toEqual([]);
    expect(manifest.toolApiChanges).toEqual([]);
    expect(manifest.workerId).toBeNull();
  });

  it("rejects arbitrary context and manifest extensions", () => {
    const context = createFixedProvidedContext(
      "m2c-vitest-11111111111111111111111111111111",
      "/tmp/tskaigi-vitest-m2c-contract",
      1,
    );
    expect(() =>
      validateFixedProvidedContext({ ...context, arbitrary: true }),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONTEXT_INVALID" }));
    expect(() =>
      validateFixedProvidedContext({
        ...context,
        manifest: { ...context.manifest, arbitrary: true },
      }),
    ).toThrow();
  });

  it("rejects a missing route or tool API fabrication", () => {
    const manifest = createFixedManifest(
      "m2c-vitest-22222222222222222222222222222222",
    );
    expect(() =>
      validateVitestManifestContract({
        ...manifest,
        routeInvocations: manifest.routeInvocations.slice(1),
      }),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONTEXT_INVALID" }));
    expect(() =>
      validateVitestManifestContract({
        ...manifest,
        toolApiTargets: [{ targetId: "fake-source", classification: "source" }],
      }),
    ).toThrowError(expect.objectContaining({ code: "M2C_CONTEXT_INVALID" }));
  });
});
