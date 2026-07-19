import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  FIXED_CONSTRAINED_RUN_ID,
  FIXED_CONTROL_IMAGE_DIGEST,
  FIXED_PERMISSIVE_RUN_ID,
} from "../src/constants.js";
import {
  parseCanonicalExecutionProfileBytes,
  serializeCanonicalExecutionProfile,
} from "../src/profile-input.js";
import { createFixedProductionControlDefinition } from "../src/run-controls.js";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("fixed existing-image production control binding", () => {
  it.each(["permissive", "constrained"] as const)(
    "accepts only the canonical %s profile bytes",
    async (profileId) => {
      const bytes = Uint8Array.from(
        await readFile(
          path.join(repositoryRoot, "profiles", profileId, "profile.json"),
        ),
      );
      const profile = parseCanonicalExecutionProfileBytes({
        bytes,
        profileId,
      });
      expect(profile.containerImageDigest).toBe(FIXED_CONTROL_IMAGE_DIGEST);
      expect(serializeCanonicalExecutionProfile(profile)).toEqual(bytes);
      const substituted = Uint8Array.from(bytes);
      substituted[substituted.indexOf(0x32)] = 0x33;
      expect(() =>
        parseCanonicalExecutionProfileBytes({
          bytes: substituted,
          profileId,
        }),
      ).toThrow();
    },
  );

  it("binds the recovered digest to the exact pair, run roots, names, and no-build plans", async () => {
    const definition = await createFixedProductionControlDefinition();
    expect(definition.pair.containerImageDigest).toBe(
      FIXED_CONTROL_IMAGE_DIGEST,
    );
    expect(definition.pair.permissive.manifest.runId).toBe(
      FIXED_PERMISSIVE_RUN_ID,
    );
    expect(definition.pair.constrained.manifest.runId).toBe(
      FIXED_CONSTRAINED_RUN_ID,
    );
    expect(definition.permissiveLayout.runRoot).toBe(
      path.join(
        repositoryRoot,
        "results/runs/m4-profile-controls",
        FIXED_PERMISSIVE_RUN_ID,
      ),
    );
    expect(definition.constrainedLayout.runRoot).toBe(
      path.join(
        repositoryRoot,
        "results/runs/m4-profile-controls",
        FIXED_CONSTRAINED_RUN_ID,
      ),
    );
    expect(definition.profilePlans.permissive.containerName).toBe(
      `tskaigi-m4-p-${FIXED_PERMISSIVE_RUN_ID}`,
    );
    expect(definition.profilePlans.constrained.containerName).toBe(
      `tskaigi-m4-c-${FIXED_CONSTRAINED_RUN_ID}`,
    );
    const argumentsText = JSON.stringify(definition.profilePlans);
    expect(argumentsText).toContain(FIXED_CONTROL_IMAGE_DIGEST);
    expect(argumentsText).not.toContain('"build"');
    expect(argumentsText).not.toContain("stage-build-context");
    expect(argumentsText).not.toContain("inspect-image");
  });
});
