import { describe, expect, it } from "vitest";

import {
  createControlManifest,
  createExecutionProfile,
} from "../src/definitions.js";
import {
  compareControlEvidence,
  validateControlEvidence,
} from "../src/evidence.js";
import { ProfileControlError } from "../src/errors.js";
import {
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  canonicalHostInspection,
  syntheticEvidence,
} from "./helpers.js";

describe("canonical profile-control evidence", () => {
  it("requires host inspection and preserves a complete match", () => {
    const profile = createExecutionProfile(
      "constrained",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const evidence = validateControlEvidence(syntheticEvidence(manifest));
    const comparison = compareControlEvidence({
      manifest,
      hostInspection: canonicalHostInspection(profile, manifest),
      evidence,
    });
    expect(comparison).toEqual({
      runId: SYNTHETIC_RUN_ID,
      profileId: "constrained",
      complete: true,
      mismatchCount: 0,
      mismatches: [],
    });
  });

  it("retains Expected mismatch instead of rewriting evidence", () => {
    const profile = createExecutionProfile(
      "constrained",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const raw = syntheticEvidence(manifest);
    const observations = raw.observations.map((observation) => ({
      ...observation,
    }));
    observations[5] = {
      sequence: 5,
      control: "fixed-child",
      outcome: "success",
      reason: "CHILD_PROTOCOL_VERIFIED",
    };
    const evidence = validateControlEvidence({ ...raw, observations });
    const comparison = compareControlEvidence({
      manifest,
      hostInspection: canonicalHostInspection(profile, manifest),
      evidence,
    });
    expect(comparison.mismatchCount).toBe(1);
    expect(comparison.mismatches).toEqual(["fixed-child"]);
    expect(evidence.observations[5]?.outcome).toBe("success");
  });

  it("rejects missing, extra, malformed, and incomplete evidence", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const raw = syntheticEvidence(manifest);
    const invalidSemantics = raw.observations.map((observation) => ({
      ...observation,
    }));
    invalidSemantics[0] = {
      sequence: 0,
      control: "environment-canary",
      outcome: "failure",
      reason: "WRITE_DENIED",
    };
    for (const invalid of [
      { ...raw, observations: raw.observations.slice(0, -1) },
      { ...raw, observations: invalidSemantics },
      { ...raw, unexpected: true },
      { ...raw, complete: false },
      new Proxy(raw, {}),
    ]) {
      expect(() => validateControlEvidence(invalid)).toThrow(
        ProfileControlError,
      );
    }
  });
});
