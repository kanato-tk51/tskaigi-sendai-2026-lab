import { describe, expect, it } from "vitest";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  LIMITS,
} from "../src/constants.js";
import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
  type DockerCommand,
  type ImageBuildPlan,
} from "../src/docker-plan.js";
import { ProfileControlError } from "../src/errors.js";
import {
  createFixedOfflineBuildInput,
  executeFixedOfflineBuild,
  OFFLINE_BUILD_STEP_IDS,
  parseCanonicalOfflineBuildResultBytes,
  serializeCanonicalOfflineBuildResult,
  validateOfflineBuildResult,
  type FixedOfflineBuildBackend,
  type FixedOfflineBuildInput,
  type OfflineBuildCommandStepId,
  type OfflineBuildFailureCode,
} from "../src/offline-build.js";
import {
  acceptedRepositorySnapshot,
  SYNTHETIC_IMAGE_DIGEST,
} from "./helpers.js";

const BUILT_IMAGE_DIGEST = `sha256:${"9".repeat(64)}` as `sha256:${string}`;

type Failure =
  "cleanup" | "nonzero" | "output" | "throw" | "timeout" | "unclosed";
type StagingDrift = "bytes" | "extra" | "missing" | "reordered";

function runtimeBytes(
  client: string = FIXED_DOCKER_CLI_VERSION,
  server: string = FIXED_DOCKER_SERVER_VERSION,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify({ client, server })}\n`);
}

function imageIdBytes(
  digest: `sha256:${string}` = BUILT_IMAGE_DIGEST,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(digest)}\n`);
}

class FakeOfflineBuildBackend implements FixedOfflineBuildBackend {
  readonly calls: string[] = [];
  private staged: unknown = null;

  constructor(
    private readonly failures: Readonly<
      Partial<Record<OfflineBuildCommandStepId | "cleanup", Failure>>
    > = {},
    private readonly stagingDrift: StagingDrift | null = null,
    private readonly doctorOutput: unknown = runtimeBytes(),
    private readonly imageOutput: unknown = imageIdBytes(),
    private readonly commandResults: Readonly<
      Partial<Record<OfflineBuildCommandStepId, unknown>>
    > = {},
  ) {}

  async stageBuildContext(
    files: readonly Readonly<{
      logicalPath: string;
      bytes: Uint8Array;
    }>[],
  ): Promise<void> {
    this.calls.push("stage-build-context");
    const staged = files.map(({ logicalPath, bytes }) => ({
      logicalPath,
      bytes: Uint8Array.from(bytes),
    }));
    if (this.stagingDrift === "bytes") staged[0]!.bytes[0] = 0x58;
    if (this.stagingDrift === "extra") {
      staged.push({
        logicalPath: "extra.txt",
        bytes: new TextEncoder().encode("extra\n"),
      });
    }
    if (this.stagingDrift === "missing") staged.pop();
    if (this.stagingDrift === "reordered") staged.reverse();
    this.staged = staged;
  }

  async readBuildContext(): Promise<unknown> {
    this.calls.push("read-build-context");
    return this.staged;
  }

  async run(
    stepId: OfflineBuildCommandStepId,
    _command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    this.calls.push(stepId);
    expect(limits).toEqual({
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
    const failure = this.failures[stepId];
    if (failure === "throw") throw new Error("synthetic command failure");
    if (stepId in this.commandResults) return this.commandResults[stepId];
    const stdout =
      stepId === "doctor"
        ? this.doctorOutput
        : stepId === "inspect-image"
          ? this.imageOutput
          : new Uint8Array();
    const stdoutBytes = stdout instanceof Uint8Array ? stdout.byteLength : 0;
    return {
      exitCode:
        failure === "timeout" || failure === "output"
          ? null
          : failure === "nonzero"
            ? 1
            : 0,
      timedOut: failure === "timeout",
      outputLimitExceeded: failure === "output",
      closeObserved: failure !== "unclosed",
      stdoutBytes: failure === "output" ? LIMITS.outputBytes + 1 : stdoutBytes,
      stderrBytes: 0,
      stdout,
    };
  }

  async cleanup(): Promise<void> {
    this.calls.push("cleanup");
    if (this.failures.cleanup === "cleanup") {
      throw new Error("synthetic cleanup failure");
    }
  }
}

async function fixture(input?: {
  failures?: Readonly<
    Partial<Record<OfflineBuildCommandStepId | "cleanup", Failure>>
  >;
  stagingDrift?: StagingDrift;
  doctorOutput?: unknown;
  imageOutput?: unknown;
  commandResults?: Readonly<
    Partial<Record<OfflineBuildCommandStepId, unknown>>
  >;
  substituteSnapshot?: boolean;
  substituteLayout?: boolean;
  substitutePlan?: boolean;
}) {
  const acceptedSnapshot = await acceptedRepositorySnapshot();
  const layout = createFixedRuntimeLayout(
    "/workspace",
    "m4-offline-build-unit",
    "permissive",
  );
  const imageBuildPlan = createImageBuildPlan({
    acceptedSnapshot,
    layout,
  });
  const backend = new FakeOfflineBuildBackend(
    input?.failures,
    input?.stagingDrift ?? null,
    input?.doctorOutput,
    input?.imageOutput,
    input?.commandResults,
  );
  const fixedInput = createFixedOfflineBuildInput({
    acceptedSnapshot,
    imageBuildPlan,
    layout,
    backend,
  });
  const executionInput =
    input?.substituteSnapshot ||
    input?.substitutePlan ||
    input?.substituteLayout
      ? ({
          ...fixedInput,
          acceptedSnapshot: input?.substituteSnapshot
            ? await acceptedRepositorySnapshot()
            : fixedInput.acceptedSnapshot,
          imageBuildPlan: input?.substitutePlan
            ? ({ ...imageBuildPlan } as ImageBuildPlan)
            : fixedInput.imageBuildPlan,
          layout: input?.substituteLayout
            ? createFixedRuntimeLayout(
                "/workspace",
                "m4-offline-build-unit",
                "permissive",
              )
            : fixedInput.layout,
        } as FixedOfflineBuildInput)
      : fixedInput;
  return {
    backend,
    executionInput,
  };
}

describe("fixed offline build-only state machine", () => {
  it("returns one canonical sanitized complete build result", async () => {
    const test = await fixture();
    const result = await executeFixedOfflineBuild(test.executionInput);
    expect(result).toEqual({
      schemaVersion: "lab-profile-offline-build-result/v1",
      validity: "complete",
      primaryFailure: null,
      completedSteps: [
        "stage-build-context",
        "doctor",
        "build",
        "inspect-image",
      ],
      baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
      stagingDigest:
        "sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03",
      dockerClientVersion: "29.6.1",
      dockerServerVersion: "29.6.1",
      builtImageDigest: BUILT_IMAGE_DIGEST,
    });
    expect(test.backend.calls).toEqual([
      "stage-build-context",
      "read-build-context",
      "doctor",
      "build",
      "inspect-image",
      "cleanup",
    ]);
    const bytes = serializeCanonicalOfflineBuildResult(result);
    expect(parseCanonicalOfflineBuildResultBytes(bytes)).toEqual(result);
  });

  it.each(["bytes", "extra", "missing", "reordered"] as const)(
    "rejects %s staging drift before doctor/build",
    async (stagingDrift) => {
      const test = await fixture({ stagingDrift });
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.validity).toBe("inconclusive");
      expect(result.primaryFailure).toBe("STAGING_FAILURE");
      expect(result.completedSteps).toEqual([]);
      expect(test.backend.calls).not.toContain("doctor");
      expect(test.backend.calls).not.toContain("build");
    },
  );

  it.each([
    ["wrong client", runtimeBytes("29.6.0", "29.6.1")],
    ["wrong server", runtimeBytes("29.6.1", "29.6.0")],
    ["malformed", new Uint8Array([0xff])],
    [
      "noncanonical",
      new TextEncoder().encode('{"server":"29.6.1","client":"29.6.1"}\n'),
    ],
    ["parsed object", { client: "29.6.1", server: "29.6.1" }],
    ["missing", new TextEncoder().encode('{"client":"29.6.1"}\n')],
    [
      "extra",
      new TextEncoder().encode(
        '{"client":"29.6.1","server":"29.6.1","extra":true}\n',
      ),
    ],
    [
      "duplicate",
      new TextEncoder().encode(
        '{"client":"29.6.1","client":"29.6.1","server":"29.6.1"}\n',
      ),
    ],
    ["null", null],
  ] as const)(
    "rejects %s runtime bytes before build",
    async (_label, output) => {
      const test = await fixture({ doctorOutput: output });
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.primaryFailure).toBe("COMMAND_FAILURE");
      expect(result.completedSteps).toEqual(["stage-build-context"]);
      expect(test.backend.calls).not.toContain("build");
    },
  );

  it.each([
    [
      "noncanonical",
      new TextEncoder().encode(`${BUILT_IMAGE_DIGEST}\n`),
      "INSPECTION_FAILURE",
    ],
    [
      "uppercase",
      imageIdBytes(`sha256:${"A".repeat(64)}`),
      "INSPECTION_FAILURE",
    ],
    ["zero", imageIdBytes(`sha256:${"0".repeat(64)}`), "INSPECTION_FAILURE"],
    ["base", imageIdBytes(FIXED_BASE_IMAGE_DIGEST), "INSPECTION_FAILURE"],
    [
      "known synthetic profile",
      imageIdBytes(SYNTHETIC_IMAGE_DIGEST),
      "INSPECTION_FAILURE",
    ],
    [
      "M0 Node 24",
      imageIdBytes(
        "sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5",
      ),
      "INSPECTION_FAILURE",
    ],
    ["parsed string", BUILT_IMAGE_DIGEST, "COMMAND_FAILURE"],
    ["parsed object", { id: BUILT_IMAGE_DIGEST }, "COMMAND_FAILURE"],
  ] as const)(
    "rejects %s built-image substitution",
    async (_label, output, failure) => {
      const test = await fixture({ imageOutput: output });
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.primaryFailure).toBe(failure);
      expect(result.completedSteps).toEqual([
        "stage-build-context",
        "doctor",
        "build",
      ]);
      expect(result.builtImageDigest).toBeNull();
    },
  );

  it.each([
    ["timeout", "doctor", "timeout", "COMMAND_TIMEOUT"],
    ["output overflow", "build", "output", "OUTPUT_LIMIT"],
    ["nonzero", "inspect-image", "nonzero", "COMMAND_FAILURE"],
    ["abnormal close", "doctor", "unclosed", "COMMAND_FAILURE"],
    ["backend throw", "build", "throw", "COMMAND_FAILURE"],
  ] as const)(
    "maps %s to an inconclusive first failure",
    async (_label, stepId, failure, expected) => {
      const test = await fixture({ failures: { [stepId]: failure } });
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.validity).toBe("inconclusive");
      expect(result.primaryFailure).toBe(expected);
      expect(result.builtImageDigest).toBeNull();
    },
  );

  it("preserves the command failure when cleanup also fails", async () => {
    const test = await fixture({
      failures: { doctor: "nonzero", cleanup: "cleanup" },
    });
    const result = await executeFixedOfflineBuild(test.executionInput);
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
  });

  it.each([
    [
      "timeout before late overflow",
      {
        exitCode: null,
        timedOut: true,
        outputLimitExceeded: false,
        closeObserved: false,
        stdoutBytes: LIMITS.outputBytes + 1,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "COMMAND_TIMEOUT",
    ],
    [
      "overflow before late timeout",
      {
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: true,
        closeObserved: false,
        stdoutBytes: LIMITS.outputBytes + 1,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "OUTPUT_LIMIT",
    ],
    [
      "process error before late overflow",
      {
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        closeObserved: false,
        stdoutBytes: LIMITS.outputBytes + 1,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "COMMAND_FAILURE",
    ],
  ] as const)(
    "preserves %s in an untrusted backend result",
    async (_label, commandResult, expected) => {
      const test = await fixture({
        commandResults: { doctor: commandResult },
      });
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.primaryFailure).toBe(expected);
      expect(result.completedSteps).toEqual(["stage-build-context"]);
    },
  );

  it("rejects contradictory timeout/output flags without guessing priority", async () => {
    const test = await fixture({
      commandResults: {
        doctor: {
          exitCode: null,
          timedOut: true,
          outputLimitExceeded: true,
          closeObserved: false,
          stdoutBytes: LIMITS.outputBytes + 1,
          stderrBytes: 0,
          stdout: new Uint8Array(),
        },
      },
    });
    const result = await executeFixedOfflineBuild(test.executionInput);
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
    expect(result.completedSteps).toEqual(["stage-build-context"]);
  });

  it("keeps an unclosed process primary when cleanup also fails", async () => {
    const test = await fixture({
      failures: { cleanup: "cleanup" },
      commandResults: {
        doctor: {
          exitCode: null,
          timedOut: false,
          outputLimitExceeded: false,
          closeObserved: false,
          stdoutBytes: 0,
          stderrBytes: 0,
          stdout: new Uint8Array(),
        },
      },
    });
    const result = await executeFixedOfflineBuild(test.executionInput);
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
  });

  it("returns cleanup failure after otherwise complete commands", async () => {
    const test = await fixture({ failures: { cleanup: "cleanup" } });
    const result = await executeFixedOfflineBuild(test.executionInput);
    expect(result.primaryFailure).toBe("CLEANUP_FAILURE");
    expect(result.builtImageDigest).toBeNull();
  });

  it.each([
    ["snapshot", { substituteSnapshot: true }],
    ["layout", { substituteLayout: true }],
    ["plan", { substitutePlan: true }],
  ] as const)(
    "rejects unbound %s substitution before staging",
    async (_label, options) => {
      const test = await fixture(options);
      const result = await executeFixedOfflineBuild(test.executionInput);
      expect(result.primaryFailure).toBe("COMMAND_FAILURE");
      expect(test.backend.calls).toEqual([]);
    },
  );
});

describe("offline build result canonical boundary", () => {
  const complete = {
    schemaVersion: "lab-profile-offline-build-result/v1",
    validity: "complete",
    primaryFailure: null,
    completedSteps: [...OFFLINE_BUILD_STEP_IDS],
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest:
      "sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03",
    dockerClientVersion: "29.6.1",
    dockerServerVersion: "29.6.1",
    builtImageDigest: BUILT_IMAGE_DIGEST,
  } as const;

  function inconclusive(
    primaryFailure: OfflineBuildFailureCode,
    completedLength: number,
  ) {
    const versionObserved = completedLength >= 2;
    return {
      schemaVersion: "lab-profile-offline-build-result/v1",
      validity: "inconclusive",
      primaryFailure,
      completedSteps: OFFLINE_BUILD_STEP_IDS.slice(0, completedLength),
      baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
      stagingDigest:
        "sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03",
      dockerClientVersion: versionObserved ? "29.6.1" : null,
      dockerServerVersion: versionObserved ? "29.6.1" : null,
      builtImageDigest: null,
    };
  }

  function expectInvalidPlainAndCanonical(input: unknown): void {
    expect(() => validateOfflineBuildResult(input)).toThrow(
      ProfileControlError,
    );
    expect(() =>
      parseCanonicalOfflineBuildResultBytes(
        new TextEncoder().encode(`${JSON.stringify(input)}\n`),
      ),
    ).toThrow(ProfileControlError);
  }

  it("accepts only the exact failure/completed-step matrix", () => {
    const validLengths = new Map<OfflineBuildFailureCode, readonly number[]>([
      ["STAGING_FAILURE", [0]],
      ["INSPECTION_FAILURE", [3]],
      ["CLEANUP_FAILURE", [4]],
      ["COMMAND_FAILURE", [0, 1, 2, 3]],
      ["COMMAND_TIMEOUT", [0, 1, 2, 3]],
      ["OUTPUT_LIMIT", [0, 1, 2, 3]],
    ]);
    for (const [failure, lengths] of validLengths) {
      for (const length of [0, 1, 2, 3, 4]) {
        const result = inconclusive(failure, length);
        if (lengths.includes(length)) {
          const validated = validateOfflineBuildResult(result);
          expect(
            parseCanonicalOfflineBuildResultBytes(
              serializeCanonicalOfflineBuildResult(validated),
            ),
          ).toEqual(validated);
        } else {
          expectInvalidPlainAndCanonical(result);
        }
      }
    }
  });

  it("rejects impossible validity/version/digest combinations", () => {
    for (const invalid of [
      { ...complete, completedSteps: ["stage-build-context"] },
      { ...complete, primaryFailure: "COMMAND_FAILURE" },
      { ...complete, builtImageDigest: null },
      { ...complete, builtImageDigest: SYNTHETIC_IMAGE_DIGEST },
      { ...inconclusive("COMMAND_FAILURE", 0), validity: "complete" },
      { ...inconclusive("COMMAND_FAILURE", 0), primaryFailure: null },
      {
        ...inconclusive("COMMAND_FAILURE", 0),
        dockerClientVersion: "29.6.1",
        dockerServerVersion: "29.6.1",
      },
      {
        ...inconclusive("COMMAND_FAILURE", 2),
        dockerClientVersion: null,
        dockerServerVersion: null,
      },
      {
        ...inconclusive("COMMAND_FAILURE", 2),
        builtImageDigest: BUILT_IMAGE_DIGEST,
      },
    ]) {
      expectInvalidPlainAndCanonical(invalid);
    }
  });

  it("rejects unknown keys, accessors, proxies, and noncanonical bytes", () => {
    for (const invalid of [
      { ...complete, extra: true },
      Object.create({ ...complete }),
      new Proxy(complete, {}),
      Object.defineProperty({ ...complete }, "validity", {
        get: () => "complete",
      }),
      { ...complete, builtImageDigest: FIXED_BASE_IMAGE_DIGEST },
    ]) {
      expect(() => validateOfflineBuildResult(invalid)).toThrow(
        ProfileControlError,
      );
    }
    const canonical = serializeCanonicalOfflineBuildResult(complete);
    expect(() =>
      parseCanonicalOfflineBuildResultBytes(
        new TextEncoder().encode(` ${new TextDecoder().decode(canonical)}`),
      ),
    ).toThrow(ProfileControlError);
  });
});
