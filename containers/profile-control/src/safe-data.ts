import { Buffer } from "node:buffer";
import { types } from "node:util";

import type { ProfileErrorCode } from "./constants.js";
import { failProfile, ProfileControlError } from "./errors.js";

export type PlainRecord = Readonly<Record<string, unknown>>;

const intrinsicObjectPrototype = Object.prototype;
const intrinsicArrayPrototype = Array.prototype;
const intrinsicUint8ArrayPrototype = Uint8Array.prototype;
const intrinsicBufferPrototype = Buffer.prototype;
const intrinsicArrayBufferPrototype = ArrayBuffer.prototype;
const intrinsicTypedArrayPrototype = Object.getPrototypeOf(
  intrinsicUint8ArrayPrototype,
) as object;
const getPrototypeOf = Object.getPrototypeOf;
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
const getOwnPropertySymbols = Object.getOwnPropertySymbols;
const objectKeys = Object.keys;
const arrayIsArray = Array.isArray;
const isProxy = types.isProxy;
const isUint8Array = types.isUint8Array;
const isArrayBuffer = types.isArrayBuffer;
const isSharedArrayBuffer = types.isSharedArrayBuffer;
const reflectApply = Reflect.apply;
const typedArraySet = Uint8Array.prototype.set;

function requireIntrinsicGetter(
  target: object,
  name: string,
): (this: unknown) => unknown {
  const getter = Object.getOwnPropertyDescriptor(target, name)?.get;
  if (getter === undefined) {
    throw new Error("M4_TYPED_ARRAY_INTRINSICS_UNAVAILABLE");
  }
  return getter;
}

const typedArrayBufferGetter = requireIntrinsicGetter(
  intrinsicTypedArrayPrototype,
  "buffer",
);
const typedArrayByteOffsetGetter = requireIntrinsicGetter(
  intrinsicTypedArrayPrototype,
  "byteOffset",
);
const typedArrayByteLengthGetter = requireIntrinsicGetter(
  intrinsicTypedArrayPrototype,
  "byteLength",
);
const arrayBufferByteLengthGetter = requireIntrinsicGetter(
  intrinsicArrayBufferPrototype,
  "byteLength",
);
const arrayBufferResizableGetter = Object.getOwnPropertyDescriptor(
  intrinsicArrayBufferPrototype,
  "resizable",
)?.get;

function dataDescriptor(
  descriptor: PropertyDescriptor | undefined,
  enumerable: boolean,
): descriptor is PropertyDescriptor & { value: unknown } {
  return (
    descriptor !== undefined &&
    "value" in descriptor &&
    descriptor.enumerable === enumerable
  );
}

export function readPlainRecord(
  input: unknown,
  code: ProfileErrorCode,
): PlainRecord {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      isProxy(input) ||
      arrayIsArray(input)
    ) {
      return failProfile(code);
    }
    const prototype = getPrototypeOf(input);
    if (prototype !== intrinsicObjectPrototype && prototype !== null) {
      return failProfile(code);
    }
    if (getOwnPropertySymbols(input).length !== 0) {
      return failProfile(code);
    }
    const descriptors = getOwnPropertyDescriptors(input);
    const output: Record<string, unknown> = Object.create(null);
    for (const key of objectKeys(descriptors)) {
      const descriptor = descriptors[key];
      if (!dataDescriptor(descriptor, true)) {
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
      typeof input !== "object" ||
      input === null ||
      isProxy(input) ||
      !arrayIsArray(input) ||
      getPrototypeOf(input) !== intrinsicArrayPrototype ||
      getOwnPropertySymbols(input).length !== 0
    ) {
      return failProfile(code);
    }
    const descriptors = getOwnPropertyDescriptors(input);
    const lengthDescriptor = descriptors["length"] as
      PropertyDescriptor | undefined;
    if (
      !dataDescriptor(lengthDescriptor, false) ||
      typeof lengthDescriptor.value !== "number" ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0 ||
      objectKeys(descriptors).length !== lengthDescriptor.value + 1
    ) {
      return failProfile(code);
    }
    const output: unknown[] = [];
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const descriptor = descriptors[String(index)] as
        PropertyDescriptor | undefined;
      if (!dataDescriptor(descriptor, true)) {
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

export interface ByteSnapshotOptions {
  readonly code: ProfileErrorCode;
  readonly maximum: number;
  readonly allowEmpty?: boolean;
  readonly emptyCode?: ProfileErrorCode;
  readonly limitCode?: ProfileErrorCode;
}

export function snapshotBytes(
  input: unknown,
  options: ByteSnapshotOptions,
): Uint8Array {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      isProxy(input) ||
      !isUint8Array(input)
    ) {
      return failProfile(options.code);
    }
    const prototype = getPrototypeOf(input);
    if (
      prototype !== intrinsicUint8ArrayPrototype &&
      prototype !== intrinsicBufferPrototype
    ) {
      return failProfile(options.code);
    }
    if (getOwnPropertySymbols(input).length !== 0) {
      return failProfile(options.code);
    }
    const backing = reflectApply(typedArrayBufferGetter, input, []) as unknown;
    const byteOffset = reflectApply(
      typedArrayByteOffsetGetter,
      input,
      [],
    ) as unknown;
    const byteLength = reflectApply(
      typedArrayByteLengthGetter,
      input,
      [],
    ) as unknown;
    const backingByteLength = reflectApply(
      arrayBufferByteLengthGetter,
      backing,
      [],
    ) as unknown;
    if (
      !isArrayBuffer(backing) ||
      isSharedArrayBuffer(backing) ||
      getPrototypeOf(backing) !== intrinsicArrayBufferPrototype ||
      typeof byteOffset !== "number" ||
      typeof byteLength !== "number" ||
      typeof backingByteLength !== "number" ||
      !Number.isSafeInteger(byteOffset) ||
      !Number.isSafeInteger(byteLength) ||
      byteOffset < 0 ||
      byteLength < 0 ||
      byteOffset + byteLength > backingByteLength ||
      (arrayBufferResizableGetter !== undefined &&
        reflectApply(arrayBufferResizableGetter, backing, []) === true)
    ) {
      return failProfile(options.code);
    }
    if (byteLength > options.maximum) {
      return failProfile(options.limitCode ?? options.code);
    }
    if (options.allowEmpty === false && byteLength === 0) {
      return failProfile(options.emptyCode ?? options.code);
    }
    const descriptors = getOwnPropertyDescriptors(input);
    const keys = objectKeys(descriptors);
    if (keys.length !== byteLength) return failProfile(options.code);
    for (let index = 0; index < byteLength; index += 1) {
      const descriptor = descriptors[String(index)] as
        PropertyDescriptor | undefined;
      if (!dataDescriptor(descriptor, true)) return failProfile(options.code);
    }
    const output = new Uint8Array(byteLength);
    reflectApply(typedArraySet, output, [input]);
    return output;
  } catch (error) {
    if (error instanceof ProfileControlError) throw error;
    return failProfile(options.code);
  }
}

export function copyBytes(input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.byteLength);
  reflectApply(typedArraySet, output, [input]);
  return output;
}

type MethodName<T extends object> = Extract<keyof T, string>;

export function captureAuthority<T extends object>(
  input: unknown,
  methodNames: readonly MethodName<T>[],
  code: ProfileErrorCode,
): T {
  try {
    if (
      (typeof input !== "object" && typeof input !== "function") ||
      input === null ||
      isProxy(input)
    ) {
      return failProfile(code);
    }
    const layers: Readonly<Record<string, PropertyDescriptor>>[] = [];
    let current: object | null = input;
    let customPrototypeCount = 0;
    while (current !== intrinsicObjectPrototype) {
      if (current === null || isProxy(current)) return failProfile(code);
      if (current !== input) {
        customPrototypeCount += 1;
        if (customPrototypeCount > 4) return failProfile(code);
      }
      layers.push(getOwnPropertyDescriptors(current));
      current = getPrototypeOf(current);
    }
    const authority: Record<string, (...args: readonly unknown[]) => unknown> =
      Object.create(null);
    for (const methodName of methodNames) {
      let callable: ((...args: readonly unknown[]) => unknown) | undefined;
      for (const descriptors of layers) {
        const descriptor = descriptors[methodName];
        if (descriptor === undefined) continue;
        if (
          !("value" in descriptor) ||
          typeof descriptor.value !== "function" ||
          isProxy(descriptor.value)
        ) {
          return failProfile(code);
        }
        callable = descriptor.value as (...args: readonly unknown[]) => unknown;
        break;
      }
      if (callable === undefined) return failProfile(code);
      const captured = callable;
      authority[methodName] = Object.freeze((...args: readonly unknown[]) =>
        reflectApply(captured, input, args),
      );
    }
    return Object.freeze(authority) as T;
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
