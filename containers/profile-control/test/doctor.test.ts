import { describe, expect, it } from "vitest";

import {
  DOCTOR_INVENTORY_SCHEMA_VERSION,
  DOCTOR_LIMITS,
  FIXED_BASE_IMAGE_TAG,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
} from "../src/constants.js";
import {
  assertFixedDoctorCommand,
  createFixedDoctorPlan,
  executeFixedDoctor,
  FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
  FIXED_BASE_IMAGE_INSPECT_FORMAT,
  FIXED_RUNTIME_VERSION_FORMAT,
  type FixedDoctorBackend,
  type FixedDoctorCommand,
} from "../src/doctor.js";
import { ProfileControlError } from "../src/errors.js";

const BASE_DIGEST = `sha256:${"2".repeat(64)}` as const;
const LOCAL_IMAGE_ID = `sha256:${"3".repeat(64)}` as const;
const OTHER_BASE_DIGEST = `sha256:${"4".repeat(64)}` as const;
const OTHER_LOCAL_IMAGE_ID = `sha256:${"5".repeat(64)}` as const;

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function canonicalBytes(value: unknown): Uint8Array {
  return bytes(`${JSON.stringify(value)}\n`);
}

function bomPrefixedCanonicalBytes(value: unknown): Uint8Array {
  return Uint8Array.from([0xef, 0xbb, 0xbf, ...canonicalBytes(value)]);
}

function baseIdentity(
  overrides: {
    readonly architecture?: string;
    readonly baseDigest?: string;
    readonly id?: string;
    readonly os?: string;
  } = {},
): Readonly<{
  architecture: string;
  id: string;
  os: string;
  repoDigests: readonly string[];
}> {
  return Object.freeze({
    architecture: overrides.architecture ?? "amd64",
    id: overrides.id ?? LOCAL_IMAGE_ID,
    os: overrides.os ?? "linux",
    repoDigests: Object.freeze([`node@${overrides.baseDigest ?? BASE_DIGEST}`]),
  });
}

function environmentSnapshot(
  environmentKeys: readonly string[] = ["PATH", "NODE_VERSION", "YARN_VERSION"],
  identityOverrides: Parameters<typeof baseIdentity>[0] = {},
): Readonly<{
  architecture: string;
  environmentKeys: readonly string[];
  id: string;
  os: string;
  repoDigests: readonly string[];
}> {
  const identity = baseIdentity(identityOverrides);
  return Object.freeze({
    architecture: identity.architecture,
    environmentKeys: Object.freeze([...environmentKeys]),
    id: identity.id,
    os: identity.os,
    repoDigests: identity.repoDigests,
  });
}

function successfulOutput(command: FixedDoctorCommand): Uint8Array {
  if (command.stepId === "runtime-version") {
    return canonicalBytes({
      client: FIXED_DOCKER_CLI_VERSION,
      server: FIXED_DOCKER_SERVER_VERSION,
    });
  }
  if (command.stepId === "base-image-identity") {
    return canonicalBytes(baseIdentity());
  }
  return canonicalBytes(environmentSnapshot());
}

type FailureMode =
  "cleanup" | "exit" | "malformed" | "output" | "throw" | "timeout";

class FakeDoctorBackend implements FixedDoctorBackend {
  readonly calls: string[] = [];

  constructor(
    private readonly overrides: Readonly<
      Partial<Record<FixedDoctorCommand["stepId"], Uint8Array>>
    > = {},
    private readonly failureStep: FixedDoctorCommand["stepId"] | null = null,
    private readonly failureMode: FailureMode | null = null,
  ) {}

  async run(
    command: FixedDoctorCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    this.calls.push(command.stepId);
    expect(limits).toEqual({
      timeoutMs: DOCTOR_LIMITS.timeoutMs,
      outputBytes: DOCTOR_LIMITS.outputBytes,
    });
    const failure =
      command.stepId === this.failureStep ? this.failureMode : null;
    if (failure === "throw") throw new Error("synthetic doctor failure");
    if (failure === "malformed") return { unexpected: true };
    const stdout = this.overrides[command.stepId] ?? successfulOutput(command);
    return {
      exitCode: failure === "exit" ? 1 : 0,
      timedOut: failure === "timeout",
      outputLimitExceeded: failure === "output",
      stdoutBytes:
        failure === "output"
          ? DOCTOR_LIMITS.outputBytes + 1
          : stdout.byteLength,
      stderrBytes: 0,
      stdout,
    };
  }

  async cleanup(): Promise<void> {
    this.calls.push("cleanup");
    if (this.failureMode === "cleanup") {
      throw new Error("synthetic cleanup failure");
    }
  }
}

describe("fixed read-only doctor boundary", () => {
  it("constructs only three branded local-inspection commands", () => {
    const plan = createFixedDoctorPlan();
    expect(plan.commands.map(({ stepId }) => stepId)).toEqual([
      "runtime-version",
      "base-image-identity",
      "base-environment-keys",
    ]);
    for (const command of plan.commands) {
      expect(command.executable).toBe("/usr/bin/docker");
      expect(command.shell).toBe(false);
      expect(command.arguments).not.toContain("pull");
      expect(command.arguments).not.toContain("build");
      expect(command.arguments).not.toContain("create");
      expect(command.arguments).not.toContain("run");
      expect(command.arguments).not.toContain("start");
      expect(assertFixedDoctorCommand(command)).toBe(command);
    }
    expect(plan.commands[0].arguments).toEqual([
      "version",
      "--format",
      FIXED_RUNTIME_VERSION_FORMAT,
    ]);
    expect(plan.commands[1].arguments).toEqual([
      "image",
      "inspect",
      "--format",
      FIXED_BASE_IMAGE_INSPECT_FORMAT,
      FIXED_BASE_IMAGE_TAG,
    ]);
    expect(plan.commands[2].arguments).toEqual([
      "image",
      "inspect",
      "--format",
      FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
      FIXED_BASE_IMAGE_TAG,
    ]);
    expect(FIXED_BASE_ENVIRONMENT_KEYS_FORMAT).toContain(
      "M4_INVALID_ENV_ENTRY",
    );
    expect(FIXED_BASE_ENVIRONMENT_KEYS_FORMAT).toContain(
      '{{json (index (split $entry "=") 0)}}',
    );
    expect(FIXED_BASE_ENVIRONMENT_KEYS_FORMAT).not.toContain(
      "{{json .Config.Env}}",
    );
    expect(FIXED_BASE_ENVIRONMENT_KEYS_FORMAT).not.toContain("{{json $entry}}");
  });

  it("uses fixed JSON templates without Docker-unsupported dict helpers", () => {
    for (const format of [
      FIXED_RUNTIME_VERSION_FORMAT,
      FIXED_BASE_IMAGE_INSPECT_FORMAT,
      FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
    ]) {
      expect(format).not.toContain("{{json (dict");
    }
  });

  it("rejects caller-constructed command objects", () => {
    expect(() =>
      assertFixedDoctorCommand({
        stepId: "runtime-version",
        executable: "/usr/bin/docker",
        arguments: ["system", "info"],
        shell: false,
      }),
    ).toThrow(ProfileControlError);
  });

  it("accepts a sanitized exact local inventory", async () => {
    const backend = new FakeDoctorBackend();
    const result = await executeFixedDoctor(backend);
    expect(result).toEqual({
      validity: "accepted",
      primaryFailure: null,
      rejection: null,
      completedSteps: [
        "runtime-version",
        "base-image-identity",
        "base-environment-keys",
      ],
      inventory: {
        schemaVersion: DOCTOR_INVENTORY_SCHEMA_VERSION,
        dockerClientVersion: FIXED_DOCKER_CLI_VERSION,
        dockerServerVersion: FIXED_DOCKER_SERVER_VERSION,
        baseImageTag: FIXED_BASE_IMAGE_TAG,
        baseImageName: "node",
        baseImageDigest: BASE_DIGEST,
        localImageId: LOCAL_IMAGE_ID,
        nodeVersion: "v20.18.2",
        os: "linux",
        architecture: "amd64",
        baseEnvironmentKeys: ["PATH", "NODE_VERSION", "YARN_VERSION"],
      },
    });
    expect(backend.calls).toEqual([
      "runtime-version",
      "base-image-identity",
      "base-environment-keys",
      "cleanup",
    ]);
  });

  it.each([
    [
      "runtime version",
      "runtime-version",
      canonicalBytes({ client: "29.6.1", server: "29.6.2" }),
      "RUNTIME_VERSION_MISMATCH",
    ],
    [
      "base identity",
      "base-image-identity",
      canonicalBytes({
        architecture: "amd64",
        id: LOCAL_IMAGE_ID,
        os: "linux",
        repoDigests: [`other@${BASE_DIGEST}`],
      }),
      "BASE_IMAGE_IDENTITY_MISMATCH",
    ],
    [
      "base platform",
      "base-image-identity",
      canonicalBytes(baseIdentity({ architecture: "arm64" })),
      "BASE_IMAGE_PLATFORM_MISMATCH",
    ],
  ] as const)(
    "rejects a mismatched %s",
    async (_label, stepId, output, code) => {
      const result = await executeFixedDoctor(
        new FakeDoctorBackend({ [stepId]: output }),
      );
      expect(result.validity).toBe("rejected");
      expect(result.rejection).toBe(code);
      expect(result.inventory).toBeNull();
    },
  );

  it.each([
    [
      "runtime version",
      "runtime-version",
      bomPrefixedCanonicalBytes({
        client: FIXED_DOCKER_CLI_VERSION,
        server: FIXED_DOCKER_SERVER_VERSION,
      }),
    ],
    [
      "image identity",
      "base-image-identity",
      bomPrefixedCanonicalBytes(baseIdentity()),
    ],
    [
      "environment snapshot",
      "base-environment-keys",
      bomPrefixedCanonicalBytes(environmentSnapshot()),
    ],
  ] as const)(
    "rejects a leading UTF-8 BOM in %s raw bytes",
    async (_label, stepId, output) => {
      const result = await executeFixedDoctor(
        new FakeDoctorBackend({ [stepId]: output }),
      );
      expect(result).toMatchObject({
        validity: "inconclusive",
        primaryFailure: "INVALID_OUTPUT",
        inventory: null,
      });
    },
  );

  it.each([
    [
      "local image ID",
      environmentSnapshot(undefined, { id: OTHER_LOCAL_IMAGE_ID }),
      "BASE_IMAGE_IDENTITY_MISMATCH",
    ],
    [
      "repository digest",
      environmentSnapshot(undefined, { baseDigest: OTHER_BASE_DIGEST }),
      "BASE_IMAGE_IDENTITY_MISMATCH",
    ],
    [
      "OS",
      environmentSnapshot(undefined, { os: "other" }),
      "BASE_IMAGE_PLATFORM_MISMATCH",
    ],
    [
      "architecture",
      environmentSnapshot(undefined, { architecture: "arm64" }),
      "BASE_IMAGE_PLATFORM_MISMATCH",
    ],
  ] as const)(
    "rejects environment inventory with drifted %s identity",
    async (_label, snapshot, code) => {
      const result = await executeFixedDoctor(
        new FakeDoctorBackend({
          "base-environment-keys": canonicalBytes(snapshot),
        }),
      );
      expect(result).toMatchObject({
        validity: "rejected",
        rejection: code,
        inventory: null,
      });
    },
  );

  it.each([
    [
      "runtime whitespace",
      "runtime-version",
      bytes(` ${JSON.stringify({ client: "29.6.1", server: "29.6.1" })}\n`),
    ],
    [
      "runtime key order",
      "runtime-version",
      bytes('{"server":"29.6.1","client":"29.6.1"}\n'),
    ],
    [
      "runtime duplicate member",
      "runtime-version",
      bytes('{"client":"29.6.1","client":"29.6.1","server":"29.6.1"}\n'),
    ],
    [
      "runtime trailing data",
      "runtime-version",
      bytes('{"client":"29.6.1","server":"29.6.1"} {}\n'),
    ],
    [
      "image key order",
      "base-image-identity",
      bytes(
        `{"id":"${LOCAL_IMAGE_ID}","architecture":"amd64","os":"linux","repoDigests":["node@${BASE_DIGEST}"]}\n`,
      ),
    ],
    [
      "environment whitespace",
      "base-environment-keys",
      bytes(` ${JSON.stringify(environmentSnapshot())}\n`),
    ],
  ] as const)(
    "rejects noncanonical %s output",
    async (_label, stepId, output) => {
      const result = await executeFixedDoctor(
        new FakeDoctorBackend({ [stepId]: output }),
      );
      expect(result).toMatchObject({
        validity: "inconclusive",
        primaryFailure: "INVALID_OUTPUT",
        inventory: null,
      });
    },
  );

  it.each([
    [
      "invalid environment marker",
      canonicalBytes(
        environmentSnapshot(["PATH", "NODE_VERSION", "M4_INVALID_ENV_ENTRY"]),
      ),
    ],
    ["missing required key", canonicalBytes(environmentSnapshot(["PATH"]))],
    [
      "canary key",
      canonicalBytes(
        environmentSnapshot(["PATH", "NODE_VERSION", "PROBE_CANARY_BAD"]),
      ),
    ],
    [
      "duplicate key",
      canonicalBytes(environmentSnapshot(["PATH", "NODE_VERSION", "PATH"])),
    ],
    [
      "embedded LF",
      canonicalBytes(environmentSnapshot(["PATH\nNODE_VERSION"])),
    ],
    [
      "embedded CR",
      canonicalBytes(environmentSnapshot(["PATH\rNODE_VERSION"])),
    ],
    [
      "embedded NUL",
      canonicalBytes(environmentSnapshot(["PATH\0NODE_VERSION"])),
    ],
    [
      "delimiter-bearing key",
      canonicalBytes(environmentSnapshot(["PATH=INVALID_KEY", "NODE_VERSION"])),
    ],
    [
      "empty key",
      canonicalBytes(environmentSnapshot(["", "PATH", "NODE_VERSION"])),
    ],
    [
      "non-LF output",
      bytes(JSON.stringify(environmentSnapshot(["PATH", "NODE_VERSION"]))),
    ],
    ["invalid UTF-8", new Uint8Array([0xff, 0x0a])],
  ] as const)("treats %s as invalid output", async (_label, output) => {
    const result = await executeFixedDoctor(
      new FakeDoctorBackend({ "base-environment-keys": output }),
    );
    expect(result).toMatchObject({
      validity: "inconclusive",
      primaryFailure: "INVALID_OUTPUT",
      inventory: null,
    });
  });

  it.each([
    ["exit", "COMMAND_FAILURE"],
    ["throw", "COMMAND_FAILURE"],
    ["timeout", "COMMAND_TIMEOUT"],
    ["output", "OUTPUT_LIMIT"],
    ["malformed", "INVALID_OUTPUT"],
  ] as const)("normalizes %s command failure", async (failureMode, code) => {
    const result = await executeFixedDoctor(
      new FakeDoctorBackend({}, "runtime-version", failureMode),
    );
    expect(result).toEqual({
      validity: "inconclusive",
      primaryFailure: code,
      rejection: null,
      completedSteps: [],
      inventory: null,
    });
  });

  it("does not accept inventory when disposable config cleanup fails", async () => {
    const result = await executeFixedDoctor(
      new FakeDoctorBackend({}, null, "cleanup"),
    );
    expect(result).toMatchObject({
      validity: "inconclusive",
      primaryFailure: "CLEANUP_FAILURE",
      inventory: null,
    });
  });
});
