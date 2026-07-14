import { types } from "node:util";

import { ProbeError } from "./errors.js";
import type { NormalizedErrorCode } from "./types.js";

type BoundaryErrorCode = Extract<
  NormalizedErrorCode,
  "INVALID_MANIFEST" | "INVALID_TARGET" | "SERIALIZATION_FAILURE"
>;

function reject(code: BoundaryErrorCode): never {
  throw new ProbeError(code);
}

function dataDescriptorValue(
  descriptor: PropertyDescriptor | undefined,
  code: BoundaryErrorCode,
): unknown {
  if (descriptor === undefined || !("value" in descriptor)) {
    return reject(code);
  }
  return descriptor.value;
}

/**
 * Copies an untrusted object without evaluating accessors. Proxies, custom
 * prototypes, symbol properties, and accessors are rejected before any
 * property value is used.
 */
export function snapshotPlainRecord(
  input: unknown,
  code: BoundaryErrorCode,
): Readonly<Record<string, unknown>> {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      Array.isArray(input) ||
      types.isProxy(input)
    ) {
      return reject(code);
    }

    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return reject(code);
    }
    if (Object.getOwnPropertySymbols(input).length !== 0) {
      return reject(code);
    }

    const descriptors = Object.getOwnPropertyDescriptors(input);
    const propertyNames = Object.keys(descriptors);
    const snapshot = Object.create(null) as Record<string, unknown>;
    for (const key of propertyNames) {
      snapshot[key] = dataDescriptorValue(descriptors[key], code);
    }
    return Object.freeze(snapshot);
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    return reject(code);
  }
}

export function readPlainRecord(
  input: unknown,
  expectedKeys: readonly string[],
  code: BoundaryErrorCode,
): Readonly<Record<string, unknown>> {
  const snapshot = snapshotPlainRecord(input, code);
  const propertyNames = Object.keys(snapshot);
  const expected = new Set(expectedKeys);
  if (
    propertyNames.length !== expectedKeys.length ||
    propertyNames.some((propertyName) => !expected.has(propertyName))
  ) {
    return reject(code);
  }
  return snapshot;
}

/** Copies a dense, ordinary array without invoking indexed accessors. */
export function readPlainArray(
  input: unknown,
  code: BoundaryErrorCode,
): readonly unknown[] {
  try {
    if (!Array.isArray(input) || types.isProxy(input)) {
      return reject(code);
    }
    if (
      Object.getPrototypeOf(input) !== Array.prototype ||
      Object.getOwnPropertySymbols(input).length !== 0
    ) {
      return reject(code);
    }

    const descriptors = Object.getOwnPropertyDescriptors(input);
    const length = dataDescriptorValue(
      descriptors["length"] as PropertyDescriptor | undefined,
      code,
    );
    if (
      typeof length !== "number" ||
      !Number.isSafeInteger(length) ||
      length < 0
    ) {
      return reject(code);
    }

    const propertyNames = Object.keys(descriptors);
    if (propertyNames.length !== length + 1) {
      return reject(code);
    }

    const snapshot: unknown[] = [];
    for (let index = 0; index < length; index += 1) {
      const key = String(index);
      snapshot.push(dataDescriptorValue(descriptors[key], code));
    }
    if (propertyNames.some((key) => key !== "length" && !(key in snapshot))) {
      return reject(code);
    }
    return Object.freeze(snapshot);
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    return reject(code);
  }
}

export function frozenNullRecord<T extends object>(values: T): Readonly<T> {
  return Object.freeze(
    Object.assign(Object.create(null) as object, values) as T,
  );
}
