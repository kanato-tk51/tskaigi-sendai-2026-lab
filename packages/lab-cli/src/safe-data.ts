import { types } from "node:util";

import type { LabErrorCode } from "./constants.js";
import { LabError } from "./errors.js";

export type PlainRecord = Readonly<Record<string, unknown>>;

const typedArrayPrototype = Object.getPrototypeOf(
  Uint8Array.prototype,
) as object;
const typedArrayBufferGetter = Object.getOwnPropertyDescriptor(
  typedArrayPrototype,
  "buffer",
)?.get;
const typedArrayByteOffsetGetter = Object.getOwnPropertyDescriptor(
  typedArrayPrototype,
  "byteOffset",
)?.get;
const typedArrayByteLengthGetter = Object.getOwnPropertyDescriptor(
  typedArrayPrototype,
  "byteLength",
)?.get;

function fail(code: LabErrorCode): never {
  throw new LabError(code);
}

export function readPlainRecord(
  input: unknown,
  code: LabErrorCode,
): PlainRecord {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      Array.isArray(input) ||
      types.isProxy(input)
    ) {
      return fail(code);
    }
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return fail(code);
    }
    if (Object.getOwnPropertySymbols(input).length !== 0) {
      return fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const output: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(descriptors)) {
      const descriptor = descriptors[key];
      if (descriptor === undefined || !("value" in descriptor)) {
        return fail(code);
      }
      output[key] = descriptor.value;
    }
    return Object.freeze(output);
  } catch (error) {
    if (error instanceof LabError) throw error;
    return fail(code);
  }
}

export function readPlainArray(
  input: unknown,
  code: LabErrorCode,
): readonly unknown[] {
  try {
    if (
      !Array.isArray(input) ||
      types.isProxy(input) ||
      Object.getPrototypeOf(input) !== Array.prototype ||
      Object.getOwnPropertySymbols(input).length !== 0
    ) {
      return fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const lengthDescriptor = descriptors["length"] as
      PropertyDescriptor | undefined;
    if (
      lengthDescriptor === undefined ||
      !("value" in lengthDescriptor) ||
      typeof lengthDescriptor.value !== "number" ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0
    ) {
      return fail(code);
    }
    const length = lengthDescriptor.value;
    if (Object.keys(descriptors).length !== length + 1) return fail(code);
    const output: unknown[] = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = descriptors[String(index)] as
        PropertyDescriptor | undefined;
      if (descriptor === undefined || !("value" in descriptor)) {
        return fail(code);
      }
      output.push(descriptor.value);
    }
    return Object.freeze(output);
  } catch (error) {
    if (error instanceof LabError) throw error;
    return fail(code);
  }
}

export function assertExactKeys(
  value: PlainRecord,
  expectedKeys: readonly string[],
  code: LabErrorCode,
): void {
  const actualKeys = Object.keys(value);
  const expected = new Set(expectedKeys);
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key) => !expected.has(key))
  ) {
    fail(code);
  }
}

export function assertId(value: unknown, code: LabErrorCode): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 64 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)
  ) {
    return fail(code);
  }
  return value;
}

export function assertCount(value: unknown, code: LabErrorCode): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    return fail(code);
  }
  return value;
}

export function assertBoolean(value: unknown, code: LabErrorCode): boolean {
  if (typeof value !== "boolean") return fail(code);
  return value;
}

export function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function copyPlainBytes(input: unknown, code: LabErrorCode): Uint8Array {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      types.isProxy(input) ||
      !types.isUint8Array(input) ||
      typedArrayBufferGetter === undefined ||
      typedArrayByteOffsetGetter === undefined ||
      typedArrayByteLengthGetter === undefined
    ) {
      return fail(code);
    }
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Uint8Array.prototype && prototype !== Buffer.prototype) {
      return fail(code);
    }
    if (Object.getOwnPropertySymbols(input).length !== 0) return fail(code);
    const buffer = typedArrayBufferGetter.call(input) as ArrayBufferLike;
    if (types.isSharedArrayBuffer(buffer)) return fail(code);
    const byteOffset = typedArrayByteOffsetGetter.call(input) as number;
    const byteLength = typedArrayByteLengthGetter.call(input) as number;
    if (
      !Number.isSafeInteger(byteOffset) ||
      !Number.isSafeInteger(byteLength) ||
      byteOffset < 0 ||
      byteLength < 0
    ) {
      return fail(code);
    }
    const ownNames = Object.getOwnPropertyNames(input);
    if (
      ownNames.length !== byteLength ||
      ownNames.some((name, index) => name !== String(index))
    ) {
      return fail(code);
    }
    const output = new Uint8Array(byteLength);
    output.set(new Uint8Array(buffer, byteOffset, byteLength));
    return output;
  } catch (error) {
    if (error instanceof LabError) throw error;
    return fail(code);
  }
}
