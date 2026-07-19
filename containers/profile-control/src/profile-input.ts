import { types } from "node:util";

import { FIXED_CONTROL_IMAGE_DIGEST } from "./constants.js";
import { failProfile } from "./errors.js";
import type { ExecutionProfile, ProfileId } from "./types.js";
import { validateExecutionProfile } from "./validation.js";

const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
const canonicalEncoder = new TextEncoder();

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

export function serializeCanonicalExecutionProfile(
  input: ExecutionProfile,
): Uint8Array {
  const profile = validateExecutionProfile(input);
  return canonicalEncoder.encode(`${JSON.stringify(profile)}\n`);
}

export function parseCanonicalExecutionProfileBytes(input: {
  readonly bytes: Uint8Array;
  readonly profileId: ProfileId;
}): ExecutionProfile {
  if (
    !types.isUint8Array(input.bytes) ||
    input.bytes.buffer instanceof SharedArrayBuffer ||
    input.bytes.byteLength === 0 ||
    input.bytes.byteLength > 65_536
  ) {
    return failProfile("INVALID_PROFILE");
  }
  const bytes = Uint8Array.from(input.bytes);
  let raw: unknown;
  try {
    const text = fatalDecoder.decode(bytes);
    if (
      !text.endsWith("\n") ||
      text.slice(0, -1).includes("\n") ||
      text.includes("\r") ||
      text.includes("\0")
    ) {
      return failProfile("INVALID_PROFILE");
    }
    raw = JSON.parse(text.slice(0, -1));
  } catch {
    return failProfile("INVALID_PROFILE");
  }
  const profile = validateExecutionProfile(raw);
  if (
    profile.profileId !== input.profileId ||
    profile.containerImageDigest !== FIXED_CONTROL_IMAGE_DIGEST ||
    !equalBytes(bytes, serializeCanonicalExecutionProfile(profile))
  ) {
    return failProfile("INVALID_PROFILE");
  }
  return profile;
}
