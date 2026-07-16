import { GENERATED_ARTIFACT_CONTENT, INPUT_CONTENT } from "./constants.js";
import { AdapterError } from "./errors.js";

export interface GeneratedArtifact {
  readonly logicalId: "codegen-generated-artifact";
  readonly bytes: Uint8Array;
}

/** The fixed project-owned generator API used by the M2-E contract. */
export function generateDocumentedArtifact(input: string): GeneratedArtifact {
  if (input !== INPUT_CONTENT) {
    throw new AdapterError("M2E_OUTPUT_INVALID");
  }
  return Object.freeze({
    logicalId: "codegen-generated-artifact",
    bytes: Buffer.from(GENERATED_ARTIFACT_CONTENT, "utf8"),
  });
}
