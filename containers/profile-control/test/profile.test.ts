import { describe, expect, it } from "vitest";

import {
  createControlManifest,
  createExecutionProfile,
  createProfileControlPair,
} from "../src/definitions.js";
import { ProfileControlError } from "../src/errors.js";
import {
  crossValidateProfileManifest,
  validateControlManifest,
  validateExecutionProfile,
  validateProfileControlPair,
} from "../src/validation.js";
import {
  SYNTHETIC_CONSTRAINED_RUN_ID,
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  syntheticAcceptedSnapshot,
} from "./helpers.js";

function expectCode(operation: () => unknown, code: string): void {
  try {
    operation();
    throw new Error("expected failure");
  } catch (error) {
    expect(error).toBeInstanceOf(ProfileControlError);
    expect((error as ProfileControlError).code).toBe(code);
  }
}

describe("M4 profile and control manifest", () => {
  it("fixes the only reviewed profile differences", () => {
    const permissive = validateExecutionProfile(
      createExecutionProfile("permissive", SYNTHETIC_IMAGE_DIGEST),
    );
    const constrained = validateExecutionProfile(
      createExecutionProfile("constrained", SYNTHETIC_IMAGE_DIGEST),
    );
    expect(permissive.containerImageDigest).toBe(
      constrained.containerImageDigest,
    );
    expect(permissive.outerBoundary).toEqual(constrained.outerBoundary);
    expect(permissive.limits).toEqual(constrained.limits);
    expect(permissive.evidence).toEqual(constrained.evidence);
    expect(permissive.capabilities).not.toEqual(constrained.capabilities);
    expect(permissive.capabilities.sourceWrite).toBe("read-only");
    expect(constrained.capabilities.sourceWrite).toBe("read-only");
    expect(constrained.capabilities.deniedBy.childProcess).toBe("node-runtime");
    expect(constrained.capabilities.deniedBy.loopbackService).toBe(
      "target-absent",
    );
  });

  it("creates an exact ordered manifest and cross-validates identity", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = validateControlManifest(
      createControlManifest(profile, SYNTHETIC_RUN_ID),
    );
    expect(manifest.controlOrder).toHaveLength(7);
    expect(manifest.expected.map(({ sequence }) => sequence)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(() => crossValidateProfileManifest(profile, manifest)).not.toThrow();
  });

  it("rejects unknown keys, proxies, accessors, prototypes, and fake digests", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    expectCode(
      () => validateExecutionProfile({ ...profile, unexpected: true }),
      "INVALID_PROFILE",
    );
    expectCode(
      () => validateExecutionProfile(new Proxy(profile, {})),
      "INVALID_PROFILE",
    );
    const accessor = { ...profile } as Record<string, unknown>;
    Object.defineProperty(accessor, "profileId", { get: () => "permissive" });
    expectCode(() => validateExecutionProfile(accessor), "INVALID_PROFILE");
    expectCode(
      () =>
        validateExecutionProfile(
          Object.assign(Object.create({ inherited: true }), profile),
        ),
      "INVALID_PROFILE",
    );
    expectCode(
      () =>
        validateExecutionProfile({
          ...profile,
          containerImageDigest: `sha256:${"0".repeat(64)}`,
        }),
      "INVALID_PROFILE",
    );
  });

  it("rejects profile/manifest disagreement instead of applying a stricter value", () => {
    const permissive = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const constrained = createExecutionProfile(
      "constrained",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(permissive, SYNTHETIC_RUN_ID);
    expectCode(
      () => crossValidateProfileManifest(constrained, manifest),
      "PROFILE_MANIFEST_MISMATCH",
    );
  });

  it("requires one image with distinct run identities for the profile pair", () => {
    const acceptedSnapshot = syntheticAcceptedSnapshot();
    const pair = createProfileControlPair({
      acceptedSnapshot,
      containerImageDigest: SYNTHETIC_IMAGE_DIGEST,
      permissiveRunId: SYNTHETIC_RUN_ID,
      constrainedRunId: SYNTHETIC_CONSTRAINED_RUN_ID,
    });
    expect(validateProfileControlPair(pair).containerImageDigest).toBe(
      SYNTHETIC_IMAGE_DIGEST,
    );
    expectCode(
      () =>
        createProfileControlPair({
          acceptedSnapshot,
          containerImageDigest: SYNTHETIC_IMAGE_DIGEST,
          permissiveRunId: SYNTHETIC_RUN_ID,
          constrainedRunId: SYNTHETIC_RUN_ID,
        }),
      "INVALID_PROFILE_PAIR",
    );
    expectCode(
      () =>
        validateProfileControlPair({
          ...pair,
          containerImageDigest: `sha256:${"5".repeat(64)}`,
        }),
      "INVALID_PROFILE_PAIR",
    );
  });
});
