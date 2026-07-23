import { describe, expect, it } from "vitest";

import {
  serializeCanonicalControlEvidence,
  serializeCanonicalControlManifest,
} from "../src/canonical.js";
import {
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_STAGING_FILES,
  IMAGE_INPUT_SCHEMA_VERSION,
  LIMITS,
} from "../src/constants.js";
import { createProfileControlPair } from "../src/definitions.js";
import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
  createProfilePairDockerPlans,
  type DockerCommand,
} from "../src/docker-plan.js";
import {
  executeFixedExistingImageProfilePair,
  executeFixedProfilePair,
  type FixedExecutionBackend,
} from "../src/execution.js";
import { validateApprovedImageInput } from "../src/image-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "../src/staging.js";
import type {
  ControlEvidence,
  ProfileControlPair,
  ProfileId,
} from "../src/types.js";
import {
  SYNTHETIC_CONSTRAINED_RUN_ID,
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  syntheticEvidence,
  syntheticInspectProjection,
} from "./helpers.js";

type FailureKind = "exit" | "output" | "throw" | "timeout" | "unsettled";
type StagingDrift = "bytes" | "extra" | "missing" | "reordered";

function runtimeVersionBytes(
  client: string = FIXED_DOCKER_CLI_VERSION,
  server: string = FIXED_DOCKER_SERVER_VERSION,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify({ client, server })}\n`);
}

class FakeBackend implements FixedExecutionBackend {
  readonly calls: string[] = [];
  private stagedBuildContext: unknown = null;

  constructor(
    private readonly pair: ProfileControlPair,
    private readonly mounts: Readonly<
      Record<
        ProfileId,
        Readonly<{ input: string; result: string; scratch: string }>
      >
    >,
    private readonly failures: Readonly<Record<string, FailureKind>> = {},
    private readonly transferDrift:
      | "immutable-input"
      | "invalid-evidence"
      | "inventory"
      | "missing"
      | "old-keys"
      | "stable-false"
      | null = null,
    private readonly stagingDrift: StagingDrift | null = null,
    private readonly runtimePayload: unknown = runtimeVersionBytes(),
  ) {}

  async stageBuildContext(
    stagingRoot: string,
    files: readonly Readonly<{
      logicalPath: string;
      bytes: Uint8Array;
    }>[],
  ): Promise<void> {
    this.calls.push("stage-build-context-backend");
    expect(stagingRoot).toBe(
      "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/staging",
    );
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
    this.stagedBuildContext = staged;
  }

  async readBuildContext(stagingRoot: string): Promise<unknown> {
    this.calls.push("read-build-context-backend");
    expect(stagingRoot).toBe(
      "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/staging",
    );
    return this.stagedBuildContext;
  }

  async run(
    stepId: string,
    _command: DockerCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    this.calls.push(stepId);
    expect(limits).toEqual({
      timeoutMs: LIMITS.controlTimeoutMs,
      outputBytes: LIMITS.outputBytes,
    });
    const failure = this.failures[stepId];
    if (failure === "throw") throw new Error("synthetic backend failure");
    const payload =
      stepId === "doctor"
        ? this.runtimePayload
        : stepId === "inspect-image"
          ? this.pair.containerImageDigest
          : stepId === "permissive:inspect"
            ? syntheticInspectProjection({
                profile: this.pair.permissive.profile,
                mountSources: this.mounts.permissive,
              })
            : stepId === "constrained:inspect"
              ? syntheticInspectProjection({
                  profile: this.pair.constrained.profile,
                  mountSources: this.mounts.constrained,
                })
              : null;
    return {
      exitCode: failure === "exit" ? 1 : 0,
      timedOut: failure === "timeout",
      outputLimitExceeded: failure === "output",
      closeObserved: failure !== "unsettled",
      stdoutBytes:
        failure === "output"
          ? LIMITS.outputBytes + 1
          : stepId === "doctor" && payload instanceof Uint8Array
            ? payload.byteLength
            : 0,
      stderrBytes: 0,
      payload,
    };
  }

  async transfer(profileId: ProfileId): Promise<unknown> {
    this.calls.push(`${profileId}:transfer-backend`);
    if (this.transferDrift === "missing" && profileId === "permissive") {
      throw new Error("synthetic missing transfer");
    }
    const definition = this.pair[profileId];
    let evidence: ControlEvidence = syntheticEvidence(definition.manifest);
    if (profileId === "constrained") {
      const observations = evidence.observations.map((entry) => ({ ...entry }));
      observations[5] = {
        sequence: 5,
        control: "fixed-child",
        outcome: "success",
        reason: "CHILD_PROTOCOL_VERIFIED",
      };
      evidence = { ...evidence, observations };
    }
    const canonicalManifest = serializeCanonicalControlManifest(
      definition.manifest,
    );
    const manifestBefore = Uint8Array.from(canonicalManifest);
    const manifestAfter = Uint8Array.from(canonicalManifest);
    if (
      this.transferDrift === "immutable-input" &&
      profileId === "permissive"
    ) {
      manifestAfter[0] = 0x20;
    }
    const transfer: Record<string, unknown> = {
      manifestBefore,
      manifestAfter,
      manifestIdentityStable:
        this.transferDrift !== "stable-false" || profileId !== "permissive",
      controlEvidence:
        this.transferDrift === "invalid-evidence" && profileId === "permissive"
          ? new Uint8Array([0xff])
          : serializeCanonicalControlEvidence(evidence),
      resultFiles:
        this.transferDrift === "inventory" && profileId === "permissive"
          ? ["control-evidence.json", "result-marker.txt", "extra.txt"]
          : ["control-evidence.json", "result-marker.txt"],
      scratchFiles: profileId === "permissive" ? ["scratch-marker.txt"] : [],
    };
    if (this.transferDrift === "old-keys" && profileId === "permissive") {
      transfer.manifestIdentityBefore = "forbidden-public-identity";
    }
    return transfer;
  }

  async recordProfileResult(profileId: ProfileId): Promise<void> {
    this.calls.push(`${profileId}:record-profile-result`);
  }

  async cleanup(): Promise<void> {
    this.calls.push("cleanup-control-backend");
  }
}

function fixture(input?: {
  readonly failures?: Readonly<Record<string, FailureKind>>;
  readonly transferDrift?:
    | "immutable-input"
    | "invalid-evidence"
    | "inventory"
    | "missing"
    | "old-keys"
    | "stable-false";
  readonly stagingDrift?: StagingDrift;
  readonly substituteBaseEnvironmentKeys?: boolean;
  readonly substituteBuildLayout?: boolean;
  readonly runtimePayload?: unknown;
}) {
  const preparedStaging = prepareStagingInput(
    FIXED_STAGING_FILES.map((logicalPath, index) => ({
      logicalPath,
      bytes: new TextEncoder().encode(`execution-${index}\n`),
    })),
  );
  const imageInput = validateApprovedImageInput({
    schemaVersion: IMAGE_INPUT_SCHEMA_VERSION,
    baseImageName: "node",
    baseImageDigest: `sha256:${"2".repeat(64)}`,
    nodeVersion: "v20.18.2",
    baseEnvironmentKeys: ["PATH"],
    stagingFiles: FIXED_STAGING_FILES,
    stagingDigest: preparedStaging.stagingDigest,
  });
  const acceptedSnapshot = createAcceptedImageStagingSnapshot({
    imageInput,
    preparedStaging,
  });
  const pair = createProfileControlPair({
    acceptedSnapshot,
    containerImageDigest: SYNTHETIC_IMAGE_DIGEST,
    permissiveRunId: SYNTHETIC_RUN_ID,
    constrainedRunId: SYNTHETIC_CONSTRAINED_RUN_ID,
  });
  const permissiveLayout = createFixedRuntimeLayout(
    "/workspace",
    SYNTHETIC_RUN_ID,
    "permissive",
  );
  const constrainedLayout = createFixedRuntimeLayout(
    "/workspace",
    SYNTHETIC_CONSTRAINED_RUN_ID,
    "constrained",
  );
  const imageBuildPlan = createImageBuildPlan({
    acceptedSnapshot,
    layout: permissiveLayout,
  });
  const profilePlans = createProfilePairDockerPlans({
    acceptedSnapshot,
    pair,
    permissiveLayout,
    constrainedLayout,
    permissiveCanary: `m4-canary-${"a".repeat(32)}`,
    constrainedCanary: `m4-canary-${"b".repeat(32)}`,
  });
  const backend = new FakeBackend(
    pair,
    {
      permissive: {
        input: permissiveLayout.inputRoot,
        result: permissiveLayout.resultRoot,
        scratch: permissiveLayout.scratchRoot,
      },
      constrained: {
        input: constrainedLayout.inputRoot,
        result: constrainedLayout.resultRoot,
        scratch: constrainedLayout.scratchRoot,
      },
    },
    input?.failures,
    input?.transferDrift ?? null,
    input?.stagingDrift ?? null,
    input?.runtimePayload,
  );
  const executionSnapshot = input?.substituteBaseEnvironmentKeys
    ? createAcceptedImageStagingSnapshot({
        imageInput: validateApprovedImageInput({
          ...imageInput,
          baseEnvironmentKeys: ["NODE_VERSION"],
        }),
        preparedStaging,
      })
    : acceptedSnapshot;
  return {
    backend,
    input: {
      acceptedSnapshot: executionSnapshot,
      pair,
      imageBuildPlan,
      profilePlans,
      permissiveLayout: input?.substituteBuildLayout
        ? createFixedRuntimeLayout("/workspace", SYNTHETIC_RUN_ID, "permissive")
        : permissiveLayout,
      constrainedLayout,
      backend,
    },
  };
}

describe("bounded profile-pair execution state machine", () => {
  it("runs an existing-image pair without staging, doctor, build, or image inspect", async () => {
    const test = fixture();
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.input.acceptedSnapshot,
      pair: test.input.pair,
      profilePlans: test.input.profilePlans,
      permissiveLayout: test.input.permissiveLayout,
      constrainedLayout: test.input.constrainedLayout,
      backend: test.backend,
    });
    expect(result.validity).toBe("complete");
    expect(test.backend.calls).not.toContain("stage-build-context-backend");
    expect(test.backend.calls).not.toContain("read-build-context-backend");
    expect(test.backend.calls).not.toContain("doctor");
    expect(test.backend.calls).not.toContain("build");
    expect(test.backend.calls).not.toContain("inspect-image");
    expect(test.backend.calls).toContain("permissive:record-profile-result");
    expect(test.backend.calls).toContain("constrained:record-profile-result");
    expect(test.backend.calls.at(-1)).toBe("cleanup-control-backend");
  });

  it("rejects the removed duplicate lease field before invoking backend authority", async () => {
    const test = fixture();
    let traps = 0;
    const duplicateLease = new Proxy(
      {},
      {
        get() {
          traps += 1;
          throw new Error("duplicate lease proxy");
        },
        getOwnPropertyDescriptor() {
          traps += 1;
          throw new Error("duplicate lease proxy");
        },
        getPrototypeOf() {
          traps += 1;
          throw new Error("duplicate lease proxy");
        },
      },
    );
    const result = await executeFixedExistingImageProfilePair({
      acceptedSnapshot: test.input.acceptedSnapshot,
      pair: test.input.pair,
      profilePlans: test.input.profilePlans,
      permissiveLayout: test.input.permissiveLayout,
      constrainedLayout: test.input.constrainedLayout,
      backend: test.backend,
      immutableInputLease: duplicateLease,
    } as never);
    expect(result).toEqual({
      validity: "inconclusive",
      primaryFailure: "COMMAND_FAILURE",
      completedSteps: [],
      permissive: null,
      constrained: null,
    });
    expect(test.backend.calls).toEqual([]);
    expect(traps).toBe(0);
  });

  it("completes both runs while preserving an Expected mismatch", async () => {
    const test = fixture();
    const result = await executeFixedProfilePair(test.input);
    expect(result.validity).toBe("complete");
    expect(result.primaryFailure).toBeNull();
    expect(result.permissive?.completion?.complete).toBe(true);
    expect(result.constrained?.comparison?.mismatches).toEqual(["fixed-child"]);
    expect(
      test.backend.calls.indexOf("stage-build-context-backend"),
    ).toBeLessThan(test.backend.calls.indexOf("build"));
    expect(
      test.backend.calls.indexOf("read-build-context-backend"),
    ).toBeLessThan(test.backend.calls.indexOf("build"));
    expect(test.backend.calls.indexOf("doctor")).toBeLessThan(
      test.backend.calls.indexOf("build"),
    );
    expect(result.completedSteps).toContain("doctor");
    expect(test.backend.calls).toContain("permissive:remove");
    expect(test.backend.calls).toContain("constrained:remove");
  });

  it.each([
    ["timeout", "doctor", "COMMAND_TIMEOUT"],
    ["output", "permissive:start", "OUTPUT_LIMIT"],
    ["unsettled", "permissive:start", "COMMAND_FAILURE"],
    ["cleanup", "permissive:remove", "CLEANUP_FAILURE"],
  ] as const)(
    "returns inconclusive for bounded %s failure",
    async (_label, stepId, expectedFailure) => {
      const failureKind: FailureKind =
        stepId === "doctor"
          ? "timeout"
          : stepId.endsWith(":start")
            ? _label === "unsettled"
              ? "unsettled"
              : "output"
            : "exit";
      const test = fixture({ failures: { [stepId]: failureKind } });
      const result = await executeFixedProfilePair(test.input);
      expect(result.validity).toBe("inconclusive");
      expect(result.primaryFailure).toBe(expectedFailure);
      if (
        result.permissive !== null &&
        result.permissive.validity === "inconclusive"
      ) {
        expect(result.permissive.completion).toBeNull();
        expect(result.permissive.comparison).toBeNull();
      }
    },
  );

  it.each([
    ["immutable-input", "IMMUTABLE_INPUT_CHANGED"],
    ["stable-false", "IMMUTABLE_INPUT_CHANGED"],
    ["old-keys", "TRANSFER_FAILURE"],
    ["inventory", "TRANSFER_FAILURE"],
    ["missing", "TRANSFER_FAILURE"],
    ["invalid-evidence", "EVIDENCE_INVALID"],
  ] as const)("rejects %s transfer drift", async (transferDrift, expected) => {
    const test = fixture({ transferDrift });
    const result = await executeFixedProfilePair(test.input);
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe(expected);
    expect(result.permissive?.completion).toBeNull();
    expect(test.backend.calls).toContain("permissive:remove");
    expect(test.backend.calls).toContain("constrained:create");
  });

  it("preserves the first failure when cleanup also fails", async () => {
    const test = fixture({
      failures: {
        "permissive:start": "throw",
        "permissive:remove": "exit",
      },
    });
    const result = await executeFixedProfilePair(test.input);
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
    expect(result.permissive?.primaryFailure).toBe("COMMAND_FAILURE");
    expect(result.constrained?.validity).toBe("complete");
  });

  it.each(["bytes", "extra", "missing", "reordered"] as const)(
    "rejects %s build-context staging drift before build",
    async (stagingDrift) => {
      const test = fixture({ stagingDrift });
      const result = await executeFixedProfilePair(test.input);
      expect(result.validity).toBe("inconclusive");
      expect(result.primaryFailure).toBe("STAGING_FAILURE");
      expect(test.backend.calls).not.toContain("build");
    },
  );

  it.each([
    ["wrong client", runtimeVersionBytes("29.6.0", "29.6.1")],
    ["wrong server", runtimeVersionBytes("29.6.1", "29.6.0")],
    ["malformed UTF-8", new Uint8Array([0xff])],
    [
      "noncanonical key order",
      new TextEncoder().encode('{"server":"29.6.1","client":"29.6.1"}\n'),
    ],
    ["null", null],
    [
      "extra key",
      new TextEncoder().encode(
        '{"client":"29.6.1","server":"29.6.1","extra":true}\n',
      ),
    ],
    ["missing key", new TextEncoder().encode('{"client":"29.6.1"}\n')],
    [
      "duplicate key",
      new TextEncoder().encode(
        '{"client":"29.6.1","client":"29.6.1","server":"29.6.1"}\n',
      ),
    ],
    [
      "parsed-object substitution",
      { client: FIXED_DOCKER_CLI_VERSION, server: FIXED_DOCKER_SERVER_VERSION },
    ],
  ] as const)(
    "rejects %s runtime payload before build",
    async (_label, runtimePayload) => {
      const test = fixture({ runtimePayload });
      const result = await executeFixedProfilePair(test.input);
      expect(result.validity).toBe("inconclusive");
      expect(result.primaryFailure).toBe("COMMAND_FAILURE");
      expect(result.completedSteps).toEqual(["stage-build-context"]);
      expect(test.backend.calls).not.toContain("build");
    },
  );

  it("rejects base-environment substitution across accepted snapshots", async () => {
    const test = fixture({ substituteBaseEnvironmentKeys: true });
    const result = await executeFixedProfilePair(test.input);
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
    expect(test.backend.calls).toEqual([]);
  });

  it("rejects a parallel build-layout substitution", async () => {
    const test = fixture({ substituteBuildLayout: true });
    const result = await executeFixedProfilePair(test.input);
    expect(result.validity).toBe("inconclusive");
    expect(result.primaryFailure).toBe("COMMAND_FAILURE");
    expect(test.backend.calls).toEqual([]);
  });
});
