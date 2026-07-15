import { validateProbeConfiguration } from "@tskaigi-lab/probe-core";

import {
  EXPECTED_SETUP_FILE_COUNT,
  EXPECTED_TEST_CASE_COUNT,
  EXPECTED_TEST_FILE_COUNT,
  PROVIDED_CONTEXT_SCHEMA_VERSION,
  SETUP_LOGICAL_ID,
  TEST_FILE_LOGICAL_ID,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import {
  createFixedManifest,
  createFixedRuntimeBindings,
  validateVitestManifestContract,
} from "./manifest.js";
import type { FixedProvidedContext } from "./types.js";

const CONTEXT_KEYS = Object.freeze([
  "schemaVersion",
  "manifest",
  "runtimeBindings",
  "fixtureContract",
] as const);

function isPlainDataObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  try {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return false;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return Object.values(descriptors).every(
      (descriptor) =>
        "value" in descriptor &&
        descriptor.get === undefined &&
        descriptor.set === undefined,
    );
  } catch {
    return false;
  }
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actual = Object.keys(value);
  return (
    actual.length === keys.length &&
    actual.every((key, index) => key === keys[index])
  );
}

function fixedFixtureContract(): FixedProvidedContext["fixtureContract"] {
  return Object.freeze({
    setupFileCount: EXPECTED_SETUP_FILE_COUNT,
    testFileCount: EXPECTED_TEST_FILE_COUNT,
    testCaseCount: EXPECTED_TEST_CASE_COUNT,
    setupLogicalId: SETUP_LOGICAL_ID,
    testFileLogicalId: TEST_FILE_LOGICAL_ID,
  });
}

export function createFixedProvidedContext(
  runId: string,
  runRoot: string,
  loopbackPort: number,
): FixedProvidedContext {
  const validated = validateProbeConfiguration(
    createFixedManifest(runId),
    createFixedRuntimeBindings(runRoot, loopbackPort),
  );
  validateVitestManifestContract(validated.manifest);
  return Object.freeze({
    schemaVersion: PROVIDED_CONTEXT_SCHEMA_VERSION,
    manifest: validated.manifest,
    runtimeBindings: validated.runtimeBindings,
    fixtureContract: fixedFixtureContract(),
  });
}

export function validateFixedProvidedContext(
  value: unknown,
): FixedProvidedContext {
  if (value === undefined) {
    throw new AdapterError("M2C_CONTEXT_MISSING");
  }
  if (!isPlainDataObject(value) || !hasExactKeys(value, CONTEXT_KEYS)) {
    throw new AdapterError("M2C_CONTEXT_INVALID");
  }
  const fixture = value.fixtureContract;
  if (
    value.schemaVersion !== PROVIDED_CONTEXT_SCHEMA_VERSION ||
    !isPlainDataObject(fixture) ||
    !hasExactKeys(fixture, [
      "setupFileCount",
      "testFileCount",
      "testCaseCount",
      "setupLogicalId",
      "testFileLogicalId",
    ]) ||
    fixture.setupFileCount !== EXPECTED_SETUP_FILE_COUNT ||
    fixture.testFileCount !== EXPECTED_TEST_FILE_COUNT ||
    fixture.testCaseCount !== EXPECTED_TEST_CASE_COUNT ||
    fixture.setupLogicalId !== SETUP_LOGICAL_ID ||
    fixture.testFileLogicalId !== TEST_FILE_LOGICAL_ID
  ) {
    throw new AdapterError("M2C_CONTEXT_INVALID");
  }
  try {
    const validated = validateProbeConfiguration(
      value.manifest,
      value.runtimeBindings,
    );
    validateVitestManifestContract(validated.manifest);
    return Object.freeze({
      schemaVersion: PROVIDED_CONTEXT_SCHEMA_VERSION,
      manifest: validated.manifest,
      runtimeBindings: validated.runtimeBindings,
      fixtureContract: fixedFixtureContract(),
    });
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2C_BINDING_INVALID");
  }
}
