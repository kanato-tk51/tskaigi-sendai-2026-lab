import { describe, expect, it } from "vitest";

import {
  FIXED_STAGING_FILES,
  IMAGE_INPUT_SCHEMA_VERSION,
} from "../src/constants.js";
import { ProfileControlError } from "../src/errors.js";
import { validateApprovedImageInput } from "../src/image-input.js";
import {
  copyAcceptedStagingFiles,
  copyPreparedStagingFile,
  createAcceptedImageStagingSnapshot,
  crossValidateApprovedStaging,
  prepareStagingInput,
  verifyAcceptedStagingFiles,
} from "../src/staging.js";

function stagingEntries() {
  return FIXED_STAGING_FILES.map((logicalPath, index) => ({
    logicalPath,
    bytes: new TextEncoder().encode(`owned-${index}\n`),
  }));
}

describe("exact image staging input", () => {
  it("copies exact ordered bytes and binds every file into the digest", () => {
    const entries = stagingEntries();
    const prepared = prepareStagingInput(entries);
    const original = copyPreparedStagingFile(prepared, "Containerfile");
    entries[0]?.bytes.fill(0);
    expect(copyPreparedStagingFile(prepared, "Containerfile")).toEqual(
      original,
    );
    const changed = stagingEntries();
    changed[3]!.bytes[0] = 0x58;
    expect(prepareStagingInput(changed).stagingDigest).not.toBe(
      prepared.stagingDigest,
    );
    const approved = validateApprovedImageInput({
      schemaVersion: IMAGE_INPUT_SCHEMA_VERSION,
      baseImageName: "node",
      baseImageDigest: `sha256:${"2".repeat(64)}`,
      nodeVersion: "v20.18.2",
      baseEnvironmentKeys: ["PATH"],
      stagingFiles: FIXED_STAGING_FILES,
      stagingDigest: prepared.stagingDigest,
    });
    expect(() =>
      crossValidateApprovedStaging(approved, prepared),
    ).not.toThrow();
    expect(() =>
      crossValidateApprovedStaging(approved, { ...prepared }),
    ).toThrow(ProfileControlError);
    const accepted = createAcceptedImageStagingSnapshot({
      imageInput: approved,
      preparedStaging: prepared,
    });
    const stagedFiles = copyAcceptedStagingFiles(accepted);
    expect(() =>
      verifyAcceptedStagingFiles(accepted, stagedFiles),
    ).not.toThrow();
    expect(accepted.stagingInventory).toEqual(prepared.files);
    expect(JSON.stringify(accepted)).not.toContain("owned-");
    stagedFiles[0]!.bytes.fill(0);
    expect(copyAcceptedStagingFiles(accepted)[0]!.bytes).toEqual(original);
  });

  it("rejects reordered, incomplete, empty, and shared-buffer files", () => {
    const reordered = stagingEntries();
    reordered.reverse();
    const empty = stagingEntries();
    empty[0] = { ...empty[0]!, bytes: new Uint8Array() };
    const shared = stagingEntries() as Array<{
      logicalPath: string;
      bytes: unknown;
    }>;
    shared[0] = {
      ...shared[0]!,
      bytes: new Uint8Array(new SharedArrayBuffer(8)),
    };
    for (const invalid of [
      reordered,
      stagingEntries().slice(1),
      empty,
      shared,
    ]) {
      expect(() => prepareStagingInput(invalid)).toThrow(ProfileControlError);
    }
  });
});
