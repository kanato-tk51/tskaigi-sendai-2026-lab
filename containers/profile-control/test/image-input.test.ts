import { describe, expect, it } from "vitest";

import {
  FIXED_STAGING_FILES,
  IMAGE_INPUT_SCHEMA_VERSION,
} from "../src/constants.js";
import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
} from "../src/docker-plan.js";
import { ProfileControlError } from "../src/errors.js";
import { validateApprovedImageInput } from "../src/image-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "../src/staging.js";
import { SYNTHETIC_RUN_ID } from "./helpers.js";

function staging() {
  return prepareStagingInput(
    FIXED_STAGING_FILES.map((logicalPath, index) => ({
      logicalPath,
      bytes: new TextEncoder().encode(`synthetic-${index}\n`),
    })),
  );
}

function imageInput(stagingDigest: `sha256:${string}`) {
  return {
    schemaVersion: IMAGE_INPUT_SCHEMA_VERSION,
    baseImageName: "node",
    baseImageDigest: `sha256:${"2".repeat(64)}`,
    nodeVersion: "v20.18.2",
    baseEnvironmentKeys: ["PATH", "NODE_VERSION"],
    stagingFiles: FIXED_STAGING_FILES,
    stagingDigest,
  };
}

describe("approved offline image input", () => {
  it("binds exact staged bytes to a digest-pinned, network-disabled plan", () => {
    const preparedStaging = staging();
    const rawImageInput = imageInput(preparedStaging.stagingDigest);
    const approvedImageInput = validateApprovedImageInput(rawImageInput);
    const acceptedSnapshot = createAcceptedImageStagingSnapshot({
      imageInput: approvedImageInput,
      preparedStaging,
    });
    const plan = createImageBuildPlan({
      acceptedSnapshot,
      layout: createFixedRuntimeLayout(
        "/workspace",
        SYNTHETIC_RUN_ID,
        "permissive",
      ),
    });
    expect(plan.build.arguments).toContain("none");
    expect(plan.build.arguments).toContain("--pull=false");
    expect(plan.build.arguments).toContain(
      `BASE_IMAGE=node@${rawImageInput.baseImageDigest}`,
    );
    expect(plan.stagingDigest).toBe(preparedStaging.stagingDigest);
    expect(plan.doctor.environment).toEqual({
      DOCKER_CONFIG:
        "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/docker-config",
    });
  });

  it("rejects unpinned, external-name, canary-key, inventory, digest, and unknown input", () => {
    const preparedStaging = staging();
    const valid = imageInput(preparedStaging.stagingDigest);
    for (const invalid of [
      { ...valid, baseImageDigest: "node:20" },
      { ...valid, baseImageName: "registry.example/node" },
      { ...valid, baseEnvironmentKeys: ["PROBE_CANARY_BAD"] },
      { ...valid, baseEnvironmentKeys: ["PATH", "PATH"] },
      { ...valid, stagingFiles: FIXED_STAGING_FILES.slice(1) },
      { ...valid, extra: true },
    ]) {
      expect(() => validateApprovedImageInput(invalid)).toThrow(
        ProfileControlError,
      );
    }
    const approved = validateApprovedImageInput({
      ...valid,
      stagingDigest: `sha256:${"4".repeat(64)}`,
    });
    expect(() =>
      createAcceptedImageStagingSnapshot({
        imageInput: approved,
        preparedStaging,
      }),
    ).toThrow(ProfileControlError);
  });
});
