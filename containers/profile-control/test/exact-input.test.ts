import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  FIXED_BASE_ENVIRONMENT_KEYS,
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_STAGING_DIGEST,
  FIXED_STAGING_FILES,
} from "../src/constants.js";
import { ProfileControlError } from "../src/errors.js";
import { validateVersionedImageInput } from "../src/image-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "../src/staging.js";

const controlRoot = fileURLToPath(new URL("../", import.meta.url));
const EXPECTED_STAGING_INVENTORY = Object.freeze([
  Object.freeze({
    logicalPath: "Containerfile",
    byteLength: 347,
    sha256:
      "sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc",
  }),
  Object.freeze({
    logicalPath: "fixture/canary.txt",
    byteLength: 29,
    sha256:
      "sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4",
  }),
  Object.freeze({
    logicalPath: "fixture/control-runner.mjs",
    byteLength: 9_159,
    sha256:
      "sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e",
  }),
  Object.freeze({
    logicalPath: "fixture/fixed-child.mjs",
    byteLength: 152,
    sha256:
      "sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191",
  }),
]);

async function loadVersionedInput(): Promise<Record<string, unknown>> {
  return JSON.parse(
    await readFile(`${controlRoot}/image-input.json`, "utf8"),
  ) as Record<string, unknown>;
}

describe("versioned M4 exact input proposal", () => {
  it("binds the accepted doctor candidate to the exact repository staging bytes", async () => {
    const rawInput = await loadVersionedInput();
    const imageInput = validateVersionedImageInput(rawInput);
    const preparedStaging = prepareStagingInput(
      await Promise.all(
        FIXED_STAGING_FILES.map(async (logicalPath) => ({
          logicalPath,
          bytes: await readFile(`${controlRoot}/${logicalPath}`),
        })),
      ),
    );
    const acceptedSnapshot = createAcceptedImageStagingSnapshot({
      imageInput,
      preparedStaging,
    });

    expect(imageInput.baseImageDigest).toBe(FIXED_BASE_IMAGE_DIGEST);
    expect(imageInput.baseEnvironmentKeys).toEqual(FIXED_BASE_ENVIRONMENT_KEYS);
    expect(acceptedSnapshot.stagingInventory).toEqual(
      EXPECTED_STAGING_INVENTORY,
    );
    expect(acceptedSnapshot.stagingDigest).toBe(FIXED_STAGING_DIGEST);
    expect(JSON.stringify(acceptedSnapshot)).not.toContain("m4-canary-");
  });

  it("rejects exact-key, base identity, environment inventory, and staging substitutions", async () => {
    const valid = await loadVersionedInput();
    for (const invalid of [
      { ...valid, extra: true },
      { ...valid, baseImageDigest: `sha256:${"3".repeat(64)}` },
      { ...valid, baseEnvironmentKeys: ["PATH", "NODE_VERSION"] },
      {
        ...valid,
        baseEnvironmentKeys: ["NODE_VERSION", "PATH", "YARN_VERSION"],
      },
      { ...valid, stagingDigest: `sha256:${"4".repeat(64)}` },
      { ...valid, stagingFiles: [...FIXED_STAGING_FILES].reverse() },
    ]) {
      expect(() => validateVersionedImageInput(invalid)).toThrow(
        ProfileControlError,
      );
    }
  });
});
