import {
  FIXED_BASE_ENVIRONMENT_KEYS,
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_BASE_IMAGE_NAME,
  FIXED_NODE_VERSION,
  FIXED_STAGING_FILES,
  FIXED_STAGING_DIGEST,
  IMAGE_INPUT_SCHEMA_VERSION,
} from "./constants.js";
import { failProfile } from "./errors.js";
import {
  assertExactKeys,
  assertSha256,
  assertString,
  readPlainArray,
  readPlainRecord,
} from "./safe-data.js";
import type { ApprovedImageInput } from "./types.js";

const IMAGE_INPUT_KEYS = Object.freeze([
  "schemaVersion",
  "baseImageName",
  "baseImageDigest",
  "nodeVersion",
  "baseEnvironmentKeys",
  "stagingFiles",
  "stagingDigest",
]);

function validateStagingFiles(input: unknown): typeof FIXED_STAGING_FILES {
  const values = readPlainArray(input, "INVALID_IMAGE_INPUT");
  if (
    values.length !== FIXED_STAGING_FILES.length ||
    values.some((value, index) => value !== FIXED_STAGING_FILES[index])
  ) {
    failProfile("INVALID_IMAGE_INPUT");
  }
  return FIXED_STAGING_FILES;
}

export function validateBaseEnvironmentKeys(input: unknown): readonly string[] {
  const values = readPlainArray(input, "INVALID_IMAGE_INPUT");
  if (values.length > 16) failProfile("INVALID_IMAGE_INPUT");
  const keys: string[] = [];
  for (const value of values) {
    if (
      typeof value !== "string" ||
      !/^[A-Z][A-Z0-9_]{0,63}$/u.test(value) ||
      value.startsWith("PROBE_CANARY_") ||
      keys.includes(value)
    ) {
      failProfile("INVALID_IMAGE_INPUT");
    }
    keys.push(value);
  }
  return Object.freeze(keys);
}

export function validateApprovedImageInput(input: unknown): ApprovedImageInput {
  const value = readPlainRecord(input, "INVALID_IMAGE_INPUT");
  assertExactKeys(value, IMAGE_INPUT_KEYS, "INVALID_IMAGE_INPUT");
  assertString(
    value.schemaVersion,
    IMAGE_INPUT_SCHEMA_VERSION,
    "INVALID_IMAGE_INPUT",
  );
  assertString(
    value.baseImageName,
    FIXED_BASE_IMAGE_NAME,
    "INVALID_IMAGE_INPUT",
  );
  const baseImageDigest = assertSha256(
    value.baseImageDigest,
    "INVALID_IMAGE_INPUT",
  );
  assertString(value.nodeVersion, FIXED_NODE_VERSION, "INVALID_IMAGE_INPUT");
  const baseEnvironmentKeys = validateBaseEnvironmentKeys(
    value.baseEnvironmentKeys,
  );
  const stagingFiles = validateStagingFiles(value.stagingFiles);
  const stagingDigest = assertSha256(
    value.stagingDigest,
    "INVALID_IMAGE_INPUT",
  );
  return Object.freeze({
    schemaVersion: IMAGE_INPUT_SCHEMA_VERSION,
    baseImageName: FIXED_BASE_IMAGE_NAME,
    baseImageDigest,
    nodeVersion: FIXED_NODE_VERSION,
    baseEnvironmentKeys,
    stagingFiles,
    stagingDigest,
  });
}

export function validateVersionedImageInput(
  input: unknown,
): ApprovedImageInput {
  const value = validateApprovedImageInput(input);
  if (
    value.baseImageDigest !== FIXED_BASE_IMAGE_DIGEST ||
    value.stagingDigest !== FIXED_STAGING_DIGEST ||
    value.baseEnvironmentKeys.length !== FIXED_BASE_ENVIRONMENT_KEYS.length ||
    value.baseEnvironmentKeys.some(
      (key, index) => key !== FIXED_BASE_ENVIRONMENT_KEYS[index],
    )
  ) {
    failProfile("INVALID_IMAGE_INPUT");
  }
  return value;
}
