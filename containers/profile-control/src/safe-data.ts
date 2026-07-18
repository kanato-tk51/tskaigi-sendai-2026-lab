import { types } from "node:util";

import type { ProfileErrorCode } from "./constants.js";
import { failProfile, ProfileControlError } from "./errors.js";

export type PlainRecord = Readonly<Record<string, unknown>>;

export function readPlainRecord(
  input: unknown,
  code: ProfileErrorCode,
): PlainRecord {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      Array.isArray(input) ||
      types.isProxy(input)
    ) {
      return failProfile(code);
    }
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return failProfile(code);
    }
    if (Object.getOwnPropertySymbols(input).length !== 0) {
      return failProfile(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const output: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(descriptors)) {
      const descriptor = descriptors[key];
      if (descriptor === undefined || !("value" in descriptor)) {
        return failProfile(code);
      }
      output[key] = descriptor.value;
    }
    return Object.freeze(output);
  } catch (error) {
    if (error instanceof ProfileControlError) throw error;
    return failProfile(code);
  }
}

export function readPlainArray(
  input: unknown,
  code: ProfileErrorCode,
): readonly unknown[] {
  try {
    if (
      !Array.isArray(input) ||
      types.isProxy(input) ||
      Object.getPrototypeOf(input) !== Array.prototype ||
      Object.getOwnPropertySymbols(input).length !== 0
    ) {
      return failProfile(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const lengthDescriptor = descriptors["length"] as
      PropertyDescriptor | undefined;
    if (
      lengthDescriptor === undefined ||
      !("value" in lengthDescriptor) ||
      typeof lengthDescriptor.value !== "number" ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0 ||
      Object.keys(descriptors).length !== lengthDescriptor.value + 1
    ) {
      return failProfile(code);
    }
    const output: unknown[] = [];
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const descriptor = descriptors[String(index)] as
        PropertyDescriptor | undefined;
      if (descriptor === undefined || !("value" in descriptor)) {
        return failProfile(code);
      }
      output.push(descriptor.value);
    }
    return Object.freeze(output);
  } catch (error) {
    if (error instanceof ProfileControlError) throw error;
    return failProfile(code);
  }
}

export function assertExactKeys(
  value: PlainRecord,
  keys: readonly string[],
  code: ProfileErrorCode,
): void {
  const expected = new Set(keys);
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    actual.some((key) => !expected.has(key))
  ) {
    failProfile(code);
  }
}

export function assertString(
  value: unknown,
  expected: string | readonly string[],
  code: ProfileErrorCode,
): string {
  const allowed = typeof expected === "string" ? [expected] : expected;
  if (typeof value !== "string" || !allowed.includes(value)) {
    return failProfile(code);
  }
  return value;
}

export function assertBoolean(value: unknown, code: ProfileErrorCode): boolean {
  if (typeof value !== "boolean") return failProfile(code);
  return value;
}

export function assertPositiveInteger(
  value: unknown,
  maximum: number,
  code: ProfileErrorCode,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > maximum
  ) {
    return failProfile(code);
  }
  return value;
}

export function assertSha256(
  value: unknown,
  code: ProfileErrorCode,
): `sha256:${string}` {
  if (
    typeof value !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value) ||
    /^sha256:0{64}$/u.test(value)
  ) {
    return failProfile(code);
  }
  return value as `sha256:${string}`;
}

export function assertRunId(value: unknown, code: ProfileErrorCode): string {
  if (
    typeof value !== "string" ||
    !/^m4-[a-z0-9][a-z0-9-]{7,47}$/u.test(value)
  ) {
    return failProfile(code);
  }
  return value;
}
