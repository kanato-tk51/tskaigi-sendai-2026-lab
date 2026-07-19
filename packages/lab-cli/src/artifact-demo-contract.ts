import { createHash } from "node:crypto";

export const ARTIFACT_DEMO_SCHEMA_VERSION = "artifact-mvp-receipt/v1" as const;
export const ARTIFACT_DEMO_RESULT_SCHEMA_VERSION =
  "artifact-mvp-result/v1" as const;
export const ARTIFACT_DEMO_SOURCE_TREE_SCHEMA_VERSION =
  "artifact-mvp-source-tree/v1" as const;
export const ARTIFACT_DEMO_ARTIFACT_SCHEMA_VERSION =
  "artifact-mvp-artifact/v1" as const;
export const ARTIFACT_DEMO_BUILD_ID =
  "artifact-mvp-build-once-20260719-01" as const;
export const ARTIFACT_DEMO_COMMAND_ID = "artifact-mvp-build-once" as const;
export const ARTIFACT_DEMO_BUILDER_VERSION = "artifact-mvp-builder/v1" as const;
export const ARTIFACT_DEMO_SOURCE_LOGICAL_PATH =
  "packages/lab-cli/fixture/artifact-demo/source.txt" as const;
export const ARTIFACT_DEMO_LOCKFILE_LOGICAL_PATH = "package-lock.json" as const;
export const ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH =
  "artifact/presentation.json" as const;
export const ARTIFACT_DEMO_LIMITATION =
  "Digest and local provenance establish byte identity and recorded inputs; they do not prove semantic harmlessness." as const;
export const ARTIFACT_DEMO_UNSIGNED_LIMITATION =
  "This local receipt is unsigned and does not establish authenticity if the artifact and receipt are replaced together." as const;
export const ARTIFACT_DEMO_NETWORK_LIMITATION =
  "The fixed builder contains no network operation, but this receipt is not evidence of OS-level egress enforcement." as const;

export type ArtifactDemoErrorCode =
  | "P3_ARGUMENTS_REJECTED"
  | "P3_ARTIFACT_DIGEST_MISMATCH"
  | "P3_BUILD_ALREADY_INVOKED"
  | "P3_BUILD_PROCESS_FAILED"
  | "P3_ENVIRONMENT_NOT_EMPTY"
  | "P3_INPUT_INVALID"
  | "P3_OUTPUT_EXISTS"
  | "P3_PIPELINE_INVALID"
  | "P3_RECEIPT_INVALID"
  | "P3_RUN_ROOT_EXISTS"
  | "P3_TAMPER_NOT_REJECTED"
  | "P3_UNEXPECTED";

export class ArtifactDemoError extends Error {
  readonly code: ArtifactDemoErrorCode;

  constructor(code: ArtifactDemoErrorCode) {
    super(code);
    this.name = "ArtifactDemoError";
    this.code = code;
  }
}

export function normalizeArtifactDemoError(
  error: unknown,
): ArtifactDemoErrorCode {
  return error instanceof ArtifactDemoError ? error.code : "P3_UNEXPECTED";
}

export interface ArtifactDemoReceipt {
  readonly schemaVersion: typeof ARTIFACT_DEMO_SCHEMA_VERSION;
  readonly buildId: typeof ARTIFACT_DEMO_BUILD_ID;
  readonly commandId: typeof ARTIFACT_DEMO_COMMAND_ID;
  readonly invocationCount: 1;
  readonly source: {
    readonly kind: "dirty-tree-digest";
    readonly digest: string;
    readonly input: {
      readonly logicalPath: typeof ARTIFACT_DEMO_SOURCE_LOGICAL_PATH;
      readonly sha256: string;
      readonly byteSize: number;
    };
  };
  readonly lockfile: {
    readonly logicalPath: typeof ARTIFACT_DEMO_LOCKFILE_LOGICAL_PATH;
    readonly sha256: string;
  };
  readonly tools: {
    readonly node: string;
    readonly builder: typeof ARTIFACT_DEMO_BUILDER_VERSION;
  };
  readonly buildEnvironment: {
    readonly forwardedEnvironmentVariableCount: 0;
    readonly externalNetworkPolicy: "prohibited";
  };
  readonly artifact: {
    readonly logicalPath: typeof ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH;
    readonly sha256: string;
    readonly byteSize: number;
  };
  readonly limitations: readonly [
    typeof ARTIFACT_DEMO_LIMITATION,
    typeof ARTIFACT_DEMO_UNSIGNED_LIMITATION,
    typeof ARTIFACT_DEMO_NETWORK_LIMITATION,
  ];
}

export interface ArtifactDemoResult {
  readonly schemaVersion: typeof ARTIFACT_DEMO_RESULT_SCHEMA_VERSION;
  readonly buildId: typeof ARTIFACT_DEMO_BUILD_ID;
  readonly commandId: typeof ARTIFACT_DEMO_COMMAND_ID;
  readonly buildInvocationCount: 1;
  readonly artifactSha256: string;
  readonly receiptSha256: string;
  readonly verification: {
    readonly outcome: "verified";
    readonly operations: readonly ["digest"];
  };
  readonly deployment: {
    readonly outcome: "copied";
    readonly operations: readonly ["copy", "post-copy-digest"];
    readonly buildInvocations: 0;
  };
  readonly tamper: {
    readonly mutation: "one-byte";
    readonly outcome: "rejected-before-copy";
    readonly errorCode: "P3_ARTIFACT_DIGEST_MISMATCH";
    readonly deployStarted: false;
  };
  readonly limitations: ArtifactDemoReceipt["limitations"];
}

type PlainRecord = Readonly<Record<string, unknown>>;

function fail(code: ArtifactDemoErrorCode): never {
  throw new ArtifactDemoError(code);
}

function readRecord(value: unknown): PlainRecord {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return fail("P3_RECEIPT_INVALID");
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.getOwnPropertySymbols(value).length !== 0) {
    return fail("P3_RECEIPT_INVALID");
  }
  const record: Record<string, unknown> = Object.create(null);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!("value" in descriptor)) return fail("P3_RECEIPT_INVALID");
    record[key] = descriptor.value;
  }
  return Object.freeze(record);
}

function assertKeys(record: PlainRecord, expected: readonly string[]): void {
  const actual = Object.keys(record);
  const allowed = new Set(expected);
  if (
    actual.length !== expected.length ||
    actual.some((key) => !allowed.has(key))
  ) {
    fail("P3_RECEIPT_INVALID");
  }
}

function readExactString<T extends string>(value: unknown, expected: T): T {
  if (value !== expected) return fail("P3_RECEIPT_INVALID");
  return expected;
}

function readDigest(value: unknown): string {
  if (typeof value !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(value)) {
    return fail("P3_RECEIPT_INVALID");
  }
  return value;
}

function readByteSize(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > 2 * 1024 * 1024
  ) {
    return fail("P3_RECEIPT_INVALID");
  }
  return value;
}

function readNodeVersion(value: unknown): string {
  if (typeof value !== "string" || !/^v\d+\.\d+\.\d+$/u.test(value)) {
    return fail("P3_RECEIPT_INVALID");
  }
  return value;
}

function readLimitations(value: unknown): ArtifactDemoReceipt["limitations"] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length !== 3 ||
    value[0] !== ARTIFACT_DEMO_LIMITATION ||
    value[1] !== ARTIFACT_DEMO_UNSIGNED_LIMITATION ||
    value[2] !== ARTIFACT_DEMO_NETWORK_LIMITATION
  ) {
    return fail("P3_RECEIPT_INVALID");
  }
  return [
    ARTIFACT_DEMO_LIMITATION,
    ARTIFACT_DEMO_UNSIGNED_LIMITATION,
    ARTIFACT_DEMO_NETWORK_LIMITATION,
  ];
}

export function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function canonicalJson(value: unknown): Uint8Array {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function serializeArtifactDemoReceipt(
  receipt: ArtifactDemoReceipt,
): Uint8Array {
  return canonicalJson(receipt);
}

export function serializeArtifactDemoResult(
  result: ArtifactDemoResult,
): Uint8Array {
  return canonicalJson(result);
}

export function parseArtifactDemoReceipt(
  bytes: Uint8Array,
): ArtifactDemoReceipt {
  if (bytes.byteLength < 1 || bytes.byteLength > 16 * 1024) {
    return fail("P3_RECEIPT_INVALID");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    return fail("P3_RECEIPT_INVALID");
  }

  const root = readRecord(parsed);
  assertKeys(root, [
    "schemaVersion",
    "buildId",
    "commandId",
    "invocationCount",
    "source",
    "lockfile",
    "tools",
    "buildEnvironment",
    "artifact",
    "limitations",
  ]);

  const source = readRecord(root["source"]);
  assertKeys(source, ["kind", "digest", "input"]);
  const sourceInput = readRecord(source["input"]);
  assertKeys(sourceInput, ["logicalPath", "sha256", "byteSize"]);

  const lockfile = readRecord(root["lockfile"]);
  assertKeys(lockfile, ["logicalPath", "sha256"]);
  const tools = readRecord(root["tools"]);
  assertKeys(tools, ["node", "builder"]);
  const buildEnvironment = readRecord(root["buildEnvironment"]);
  assertKeys(buildEnvironment, [
    "forwardedEnvironmentVariableCount",
    "externalNetworkPolicy",
  ]);
  const artifact = readRecord(root["artifact"]);
  assertKeys(artifact, ["logicalPath", "sha256", "byteSize"]);

  if (
    root["invocationCount"] !== 1 ||
    buildEnvironment["forwardedEnvironmentVariableCount"] !== 0
  ) {
    return fail("P3_RECEIPT_INVALID");
  }

  const receipt: ArtifactDemoReceipt = Object.freeze({
    schemaVersion: readExactString(
      root["schemaVersion"],
      ARTIFACT_DEMO_SCHEMA_VERSION,
    ),
    buildId: readExactString(root["buildId"], ARTIFACT_DEMO_BUILD_ID),
    commandId: readExactString(root["commandId"], ARTIFACT_DEMO_COMMAND_ID),
    invocationCount: 1,
    source: Object.freeze({
      kind: readExactString(source["kind"], "dirty-tree-digest"),
      digest: readDigest(source["digest"]),
      input: Object.freeze({
        logicalPath: readExactString(
          sourceInput["logicalPath"],
          ARTIFACT_DEMO_SOURCE_LOGICAL_PATH,
        ),
        sha256: readDigest(sourceInput["sha256"]),
        byteSize: readByteSize(sourceInput["byteSize"]),
      }),
    }),
    lockfile: Object.freeze({
      logicalPath: readExactString(
        lockfile["logicalPath"],
        ARTIFACT_DEMO_LOCKFILE_LOGICAL_PATH,
      ),
      sha256: readDigest(lockfile["sha256"]),
    }),
    tools: Object.freeze({
      node: readNodeVersion(tools["node"]),
      builder: readExactString(tools["builder"], ARTIFACT_DEMO_BUILDER_VERSION),
    }),
    buildEnvironment: Object.freeze({
      forwardedEnvironmentVariableCount: 0,
      externalNetworkPolicy: readExactString(
        buildEnvironment["externalNetworkPolicy"],
        "prohibited",
      ),
    }),
    artifact: Object.freeze({
      logicalPath: readExactString(
        artifact["logicalPath"],
        ARTIFACT_DEMO_ARTIFACT_LOGICAL_PATH,
      ),
      sha256: readDigest(artifact["sha256"]),
      byteSize: readByteSize(artifact["byteSize"]),
    }),
    limitations: readLimitations(root["limitations"]),
  });

  if (!Buffer.from(serializeArtifactDemoReceipt(receipt)).equals(bytes)) {
    return fail("P3_RECEIPT_INVALID");
  }
  return receipt;
}
