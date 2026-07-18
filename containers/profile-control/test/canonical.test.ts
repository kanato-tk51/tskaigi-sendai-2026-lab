import { describe, expect, it } from "vitest";

import {
  parseCanonicalControlEvidenceBytes,
  parseCanonicalControlManifestBytes,
  serializeCanonicalControlEvidence,
  serializeCanonicalControlManifest,
} from "../src/canonical.js";
import {
  createControlManifest,
  createExecutionProfile,
} from "../src/definitions.js";
import { ProfileControlError } from "../src/errors.js";
import {
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  syntheticEvidence,
} from "./helpers.js";

describe("canonical M4 transfer bytes", () => {
  it("round-trips exact manifest and evidence bytes", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    expect(
      parseCanonicalControlManifestBytes(
        serializeCanonicalControlManifest(manifest),
      ),
    ).toEqual(manifest);
    const evidence = syntheticEvidence(manifest);
    expect(
      parseCanonicalControlEvidenceBytes(
        serializeCanonicalControlEvidence(evidence),
      ),
    ).toEqual(evidence);
  });

  it("rejects whitespace, missing LF, invalid UTF-8, and oversized input", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const canonical = serializeCanonicalControlManifest(manifest);
    const shared = new Uint8Array(new SharedArrayBuffer(canonical.byteLength));
    shared.set(canonical);
    for (const invalid of [
      new TextEncoder().encode(` ${new TextDecoder().decode(canonical)}`),
      canonical.slice(0, -1),
      new Uint8Array([0xff, 0x0a]),
      new Uint8Array(65_537),
      shared,
    ]) {
      expect(() => parseCanonicalControlManifestBytes(invalid)).toThrow(
        ProfileControlError,
      );
    }
  });

  it("serializes only validated snapshots", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const accessor = { ...manifest } as Record<string, unknown>;
    Object.defineProperty(accessor, "runId", {
      enumerable: true,
      get: () => SYNTHETIC_RUN_ID,
    });
    expect(() => serializeCanonicalControlManifest(accessor)).toThrow(
      ProfileControlError,
    );
    expect(() =>
      serializeCanonicalControlManifest({
        ...manifest,
        toJSON: () => ({ hidden: true }),
      }),
    ).toThrow(ProfileControlError);
  });
});
