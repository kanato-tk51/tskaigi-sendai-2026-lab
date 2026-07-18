import { describe, expect, it } from "vitest";

import {
  serializeCanonicalControlEvidence,
  serializeCanonicalControlManifest,
} from "../src/canonical.js";
import {
  createControlCompletion,
  crossValidateCompleteBundle,
  validateControlCompletion,
} from "../src/completion.js";
import {
  createControlManifest,
  createExecutionProfile,
} from "../src/definitions.js";
import { ProfileControlError } from "../src/errors.js";
import type { ProfileId } from "../src/types.js";
import {
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  canonicalHostInspection,
  syntheticEvidence,
} from "./helpers.js";

function completeBundle(profileId: ProfileId) {
  const profile = createExecutionProfile(profileId, SYNTHETIC_IMAGE_DIGEST);
  const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
  const inspection = canonicalHostInspection(profile, manifest);
  const evidence = syntheticEvidence(manifest);
  const manifestBytes = serializeCanonicalControlManifest(manifest);
  const hostInspectionBytes = new TextEncoder().encode(
    `${JSON.stringify(inspection)}\n`,
  );
  const controlEvidenceBytes = serializeCanonicalControlEvidence(evidence);
  const completion = createControlCompletion({
    manifest,
    inspection,
    evidence,
    manifestBytes,
    hostInspectionBytes,
    controlEvidenceBytes,
  });
  return {
    manifest,
    inspection,
    evidence,
    completion,
    manifestBytes,
    hostInspectionBytes,
    controlEvidenceBytes,
  };
}

describe("M4 completion and transfer gate", () => {
  it("binds canonical input, host inspection, and container evidence bytes", () => {
    const bundle = completeBundle("permissive");
    expect(() => crossValidateCompleteBundle(bundle)).not.toThrow();
    expect(bundle.completion.inventory).toEqual([
      "input/control-manifest.json",
      "host/host-inspection.json",
      "container-result/control-evidence.json",
      "container-result/result-marker.txt",
      "scratch/scratch-marker.txt",
      "host/completion.json",
      "host/comparison.json",
    ]);
  });

  it("rejects missing transfer, inventory drift, identity drift, and byte drift", () => {
    const bundle = completeBundle("permissive");
    for (const invalid of [
      { ...bundle.completion, evidenceTransferred: false },
      { ...bundle.completion, inventory: ["control-evidence.json"] },
    ]) {
      expect(() => validateControlCompletion(invalid)).toThrow(
        ProfileControlError,
      );
    }
    expect(() =>
      crossValidateCompleteBundle({
        ...bundle,
        completion: validateControlCompletion({
          ...bundle.completion,
          runId: "m4-other-run-0002",
        }),
      }),
    ).toThrow(ProfileControlError);
    const mutatedManifestBytes = Uint8Array.from(bundle.manifestBytes);
    mutatedManifestBytes[0] = 0x20;
    expect(() =>
      crossValidateCompleteBundle({
        ...bundle,
        manifestBytes: mutatedManifestBytes,
      }),
    ).toThrow(ProfileControlError);
  });
});
