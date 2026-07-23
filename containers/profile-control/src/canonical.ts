import { LIMITS } from "./constants.js";
import { failProfile } from "./errors.js";
import { validateControlEvidence } from "./evidence.js";
import { snapshotBytes } from "./safe-data.js";
import type { ControlEvidence } from "./types.js";
import { validateControlManifest } from "./validation.js";
import type { ControlManifest } from "./types.js";

function decodeCanonicalBytes(input: unknown): string {
  const bytes = snapshotBytes(input, {
    code: "NONCANONICAL_EVIDENCE",
    maximum: LIMITS.evidenceBytes,
    allowEmpty: false,
    emptyCode: "EVIDENCE_SIZE_LIMIT",
    limitCode: "EVIDENCE_SIZE_LIMIT",
  });
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!text.endsWith("\n") || text.slice(0, -1).includes("\n")) {
      return failProfile("NONCANONICAL_EVIDENCE");
    }
    return text;
  } catch {
    return failProfile("NONCANONICAL_EVIDENCE");
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text.slice(0, -1));
  } catch {
    return failProfile("NONCANONICAL_EVIDENCE");
  }
}

function serializeValidated(
  value: ControlManifest | ControlEvidence,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(value)}\n`);
}

export function serializeCanonicalControlManifest(input: unknown): Uint8Array {
  return serializeValidated(validateControlManifest(input));
}

export function serializeCanonicalControlEvidence(input: unknown): Uint8Array {
  return serializeValidated(validateControlEvidence(input));
}

export function parseCanonicalControlManifestBytes(
  input: unknown,
): ControlManifest {
  const text = decodeCanonicalBytes(input);
  const value = validateControlManifest(parseJson(text));
  if (`${JSON.stringify(value)}\n` !== text) {
    failProfile("NONCANONICAL_EVIDENCE");
  }
  return value;
}

export function parseCanonicalControlEvidenceBytes(
  input: unknown,
): ControlEvidence {
  const text = decodeCanonicalBytes(input);
  const value = validateControlEvidence(parseJson(text));
  if (`${JSON.stringify(value)}\n` !== text) {
    failProfile("NONCANONICAL_EVIDENCE");
  }
  return value;
}
