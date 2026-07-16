import { describe, expect, it } from "vitest";

import { GENERATED_ARTIFACT_CONTENT, INPUT_CONTENT } from "../src/constants.js";
import { generateDocumentedArtifact } from "../src/generator.js";

describe("fixed documented generator API", () => {
  it("returns the fixed artifact for the fixed input", () => {
    const artifact = generateDocumentedArtifact(INPUT_CONTENT);
    expect(artifact.logicalId).toBe("codegen-generated-artifact");
    expect(Buffer.from(artifact.bytes).toString("utf8")).toBe(
      GENERATED_ARTIFACT_CONTENT,
    );
  });

  it("rejects non-contract input", () => {
    expect(() => generateDocumentedArtifact("arbitrary input\n")).toThrowError(
      "M2E_OUTPUT_INVALID",
    );
  });
});
