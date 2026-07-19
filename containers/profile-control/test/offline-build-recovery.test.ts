import { describe, expect, it } from "vitest";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_STAGING_DIGEST,
  LIMITS,
} from "../src/constants.js";
import { ProfileControlError } from "../src/errors.js";
import {
  assertFixedOfflineBuildRecoveryCommand,
  createFixedOfflineBuildRecoveryInput,
  executeFixedOfflineBuildRecovery,
  FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
  FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
  OFFLINE_BUILD_RECOVERY_STEP_IDS,
  parseCanonicalOfflineBuildRecoveryResultBytes,
  serializeCanonicalOfflineBuildRecoveryResult,
  validateOfflineBuildRecoveryResult,
  type FixedOfflineBuildRecoveryBackend,
  type FixedOfflineBuildRecoveryInput,
  type OfflineBuildRecoveryFailureCode,
} from "../src/offline-build-recovery.js";
import type { DockerCommand } from "../src/docker-plan.js";
import { SYNTHETIC_IMAGE_DIGEST } from "./helpers.js";

const BUILT_IMAGE_DIGEST = `sha256:${"9".repeat(64)}` as `sha256:${string}`;
const RECORDED_BUILD_FAILURE = Object.freeze({
  schemaVersion: "lab-profile-offline-build-result/v1",
  validity: "inconclusive",
  primaryFailure: "CLEANUP_FAILURE",
  completedSteps: Object.freeze([
    "stage-build-context",
    "doctor",
    "build",
    "inspect-image",
  ]),
  baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
  stagingDigest: FIXED_STAGING_DIGEST,
  dockerClientVersion: "29.6.1",
  dockerServerVersion: "29.6.1",
  builtImageDigest: null,
});

function imageIdBytes(
  digest: `sha256:${string}` = BUILT_IMAGE_DIGEST,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(digest)}\n`);
}

class FakeRecoveryBackend implements FixedOfflineBuildRecoveryBackend {
  readonly calls: string[] = [];
  private validationIndex = 0;
  private attempted = false;

  constructor(
    private readonly output: unknown = imageIdBytes(),
    private readonly commandResult: unknown | null = null,
    private readonly validationFailure: "post" | "pre" | null = null,
  ) {}

  async validateRetainedState(): Promise<void> {
    const phase = this.validationIndex === 0 ? "validate-pre" : "validate-post";
    this.calls.push(phase);
    this.validationIndex += 1;
    if (
      (this.validationFailure === "pre" && phase === "validate-pre") ||
      (this.validationFailure === "post" && phase === "validate-post")
    ) {
      throw new Error("synthetic state drift");
    }
  }

  async run(
    command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    if (this.attempted) throw new Error("synthetic second attempt");
    this.attempted = true;
    this.calls.push("inspect-image");
    expect(assertFixedOfflineBuildRecoveryCommand(command)).toBe(command);
    expect(limits).toEqual({
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
    if (this.commandResult !== null) return this.commandResult;
    const stdoutBytes =
      this.output instanceof Uint8Array ? this.output.byteLength : 0;
    return {
      exitCode: 0,
      timedOut: false,
      outputLimitExceeded: false,
      closeObserved: true,
      stdoutBytes,
      stderrBytes: 0,
      stdout: this.output,
    };
  }
}

function fixture(input?: {
  output?: unknown;
  commandResult?: unknown;
  validationFailure?: "post" | "pre";
  buildResult?: unknown;
}) {
  const backend = new FakeRecoveryBackend(
    input?.output,
    input?.commandResult ?? null,
    input?.validationFailure ?? null,
  );
  const fixedInput = createFixedOfflineBuildRecoveryInput({
    failedBuildResult: input?.buildResult ?? RECORDED_BUILD_FAILURE,
    backend,
  });
  return { backend, fixedInput };
}

function completeResult() {
  return {
    schemaVersion: "lab-profile-offline-build-recovery-result/v1",
    validity: "complete",
    primaryFailure: null,
    completedSteps: [...OFFLINE_BUILD_RECOVERY_STEP_IDS],
    runId: FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID,
    stagedImageTag: FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG,
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    builtImageDigest: BUILT_IMAGE_DIGEST,
    ownedStateDisposition: "retained",
  } as const;
}

describe("fixed offline-build cleanup-failure recovery", () => {
  it("returns one canonical retained-state recovery result", async () => {
    const test = fixture();
    const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
    expect(result).toEqual(completeResult());
    expect(test.backend.calls).toEqual([
      "validate-pre",
      "inspect-image",
      "validate-post",
    ]);
    expect(
      parseCanonicalOfflineBuildRecoveryResultBytes(
        serializeCanonicalOfflineBuildRecoveryResult(result),
      ),
    ).toEqual(result);
  });

  it.each([
    ["failure", { primaryFailure: "COMMAND_FAILURE" }],
    ["prefix", { completedSteps: ["stage-build-context"] }],
    ["client", { dockerClientVersion: "29.6.0" }],
    ["server", { dockerServerVersion: "29.6.0" }],
    ["digest", { builtImageDigest: BUILT_IMAGE_DIGEST }],
    ["validity", { validity: "complete", primaryFailure: null }],
  ] as const)(
    "rejects substituted recorded build %s",
    (_label, replacement) => {
      expect(() =>
        fixture({
          buildResult: { ...RECORDED_BUILD_FAILURE, ...replacement },
        }),
      ).toThrow(ProfileControlError);
    },
  );

  it("rejects unbound recovery input before state access", async () => {
    const test = fixture();
    const substituted = {
      ...test.fixedInput,
    } as FixedOfflineBuildRecoveryInput;
    const result = await executeFixedOfflineBuildRecovery(substituted);
    expect(result.primaryFailure).toBe("STATE_VALIDATION_FAILURE");
    expect(result.completedSteps).toEqual([]);
    expect(test.backend.calls).toEqual([]);
  });

  it("rejects a cloned command identity", () => {
    const test = fixture();
    expect(() =>
      assertFixedOfflineBuildRecoveryCommand({
        ...test.fixedInput.command,
        arguments: [...test.fixedInput.command.arguments],
      }),
    ).toThrow(ProfileControlError);
  });

  it("does not inspect when retained-state pre-validation fails", async () => {
    const test = fixture({ validationFailure: "pre" });
    const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
    expect(result.primaryFailure).toBe("STATE_VALIDATION_FAILURE");
    expect(result.completedSteps).toEqual([]);
    expect(test.backend.calls).toEqual(["validate-pre"]);
  });

  it("discards a parsed digest when retained state changes after inspect", async () => {
    const test = fixture({ validationFailure: "post" });
    const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
    expect(result.primaryFailure).toBe("OWNED_STATE_FAILURE");
    expect(result.completedSteps).toEqual([
      "validate-retained-state",
      "inspect-image",
    ]);
    expect(result.builtImageDigest).toBeNull();
  });

  it("preserves abnormal-close command failure when post-validation is blocked", async () => {
    const test = fixture({
      commandResult: {
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        closeObserved: false,
        stdoutBytes: 0,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      validationFailure: "post",
    });
    const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
    expect(result.completedSteps).toEqual(["validate-retained-state"]);
    expect(result.builtImageDigest).toBeNull();
    expect(test.backend.calls).toEqual([
      "validate-pre",
      "inspect-image",
      "validate-post",
    ]);
  });

  it.each([
    ["noncanonical", new TextEncoder().encode(`${BUILT_IMAGE_DIGEST}\n`)],
    ["uppercase", imageIdBytes(`sha256:${"A".repeat(64)}`)],
    ["zero", imageIdBytes(`sha256:${"0".repeat(64)}`)],
    ["base", imageIdBytes(FIXED_BASE_IMAGE_DIGEST)],
    ["known synthetic", imageIdBytes(SYNTHETIC_IMAGE_DIGEST)],
    [
      "M0 Node 24",
      imageIdBytes(
        "sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5",
      ),
    ],
    ["invalid UTF-8", new Uint8Array([0xff])],
  ] as const)(
    "rejects %s image identity and still validates state",
    async (_label, output) => {
      const test = fixture({ output });
      const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
      expect(result.primaryFailure).toBe("INSPECTION_FAILURE");
      expect(result.completedSteps).toEqual(["validate-retained-state"]);
      expect(result.builtImageDigest).toBeNull();
      expect(test.backend.calls.at(-1)).toBe("validate-post");
    },
  );

  it.each([
    [
      "timeout",
      {
        exitCode: null,
        timedOut: true,
        outputLimitExceeded: false,
        closeObserved: true,
        stdoutBytes: 0,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "COMMAND_TIMEOUT",
    ],
    [
      "output overflow",
      {
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: true,
        closeObserved: true,
        stdoutBytes: LIMITS.outputBytes + 1,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "OUTPUT_LIMIT",
    ],
    [
      "abnormal close",
      {
        exitCode: null,
        timedOut: false,
        outputLimitExceeded: false,
        closeObserved: false,
        stdoutBytes: 0,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "COMMAND_FAILURE",
    ],
    [
      "contradictory flags",
      {
        exitCode: null,
        timedOut: true,
        outputLimitExceeded: true,
        closeObserved: false,
        stdoutBytes: LIMITS.outputBytes + 1,
        stderrBytes: 0,
        stdout: new Uint8Array(),
      },
      "COMMAND_FAILURE",
    ],
  ] as const)(
    "maps %s and always performs post-validation",
    async (_label, commandResult, failure) => {
      const test = fixture({ commandResult });
      const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
      expect(result.primaryFailure).toBe(failure);
      expect(result.completedSteps).toEqual(["validate-retained-state"]);
      expect(test.backend.calls.at(-1)).toBe("validate-post");
    },
  );

  it("preserves the earlier inspection failure over secondary state drift", async () => {
    const test = fixture({
      output: new Uint8Array([0xff]),
      validationFailure: "post",
    });
    const result = await executeFixedOfflineBuildRecovery(test.fixedInput);
    expect(result.primaryFailure).toBe("INSPECTION_FAILURE");
    expect(result.completedSteps).toEqual(["validate-retained-state"]);
  });
});

describe("offline-build recovery canonical result boundary", () => {
  function inconclusive(
    failure: OfflineBuildRecoveryFailureCode,
    completedLength: number,
  ) {
    return {
      ...completeResult(),
      validity: "inconclusive",
      primaryFailure: failure,
      completedSteps: OFFLINE_BUILD_RECOVERY_STEP_IDS.slice(0, completedLength),
      builtImageDigest: null,
    };
  }

  function expectInvalid(input: unknown): void {
    expect(() => validateOfflineBuildRecoveryResult(input)).toThrow(
      ProfileControlError,
    );
    expect(() =>
      parseCanonicalOfflineBuildRecoveryResultBytes(
        new TextEncoder().encode(`${JSON.stringify(input)}\n`),
      ),
    ).toThrow(ProfileControlError);
  }

  it("accepts only the exact failure and completed-step matrix", () => {
    const validLength = new Map<OfflineBuildRecoveryFailureCode, number>([
      ["STATE_VALIDATION_FAILURE", 0],
      ["COMMAND_FAILURE", 1],
      ["COMMAND_TIMEOUT", 1],
      ["OUTPUT_LIMIT", 1],
      ["INSPECTION_FAILURE", 1],
      ["OWNED_STATE_FAILURE", 2],
    ]);
    for (const [failure, expectedLength] of validLength) {
      for (const length of [0, 1, 2, 3]) {
        const result = inconclusive(failure, length);
        if (length === expectedLength) {
          expect(validateOfflineBuildRecoveryResult(result)).toEqual(result);
        } else {
          expectInvalid(result);
        }
      }
    }
  });

  it("rejects substituted semantics, keys, prototypes, and canonical bytes", () => {
    const complete = completeResult();
    for (const invalid of [
      { ...complete, runId: "m4-substituted-run" },
      { ...complete, stagedImageTag: "substituted:latest" },
      { ...complete, ownedStateDisposition: "deleted" },
      { ...complete, builtImageDigest: FIXED_BASE_IMAGE_DIGEST },
      { ...complete, builtImageDigest: SYNTHETIC_IMAGE_DIGEST },
      { ...complete, primaryFailure: "COMMAND_FAILURE" },
      { ...complete, extra: true },
    ]) {
      expectInvalid(invalid);
    }
    for (const invalid of [Object.create(complete), new Proxy(complete, {})]) {
      expect(() => validateOfflineBuildRecoveryResult(invalid)).toThrow(
        ProfileControlError,
      );
    }
    const canonical = serializeCanonicalOfflineBuildRecoveryResult(complete);
    expect(() =>
      parseCanonicalOfflineBuildRecoveryResultBytes(
        new TextEncoder().encode(` ${new TextDecoder().decode(canonical)}`),
      ),
    ).toThrow(ProfileControlError);
  });
});
