import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONTROL_EVIDENCE_SCHEMA_VERSION,
  FIXED_STAGING_FILES,
  FIXED_ENVIRONMENT_KEY,
  HOST_INSPECTION_SCHEMA_VERSION,
  IMAGE_INPUT_SCHEMA_VERSION,
} from "../src/constants.js";
import { expectedControls } from "../src/definitions.js";
import { fixedContainerArguments } from "../src/docker-plan.js";
import {
  validateApprovedImageInput,
  validateVersionedImageInput,
} from "../src/image-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "../src/staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ControlEvidence,
  ControlManifest,
  ExecutionProfile,
  HostInspection,
} from "../src/types.js";

export const SYNTHETIC_IMAGE_DIGEST =
  `sha256:${"1".repeat(64)}` as `sha256:${string}`;
export const SYNTHETIC_RUN_ID = "m4-unit-run-0001";
export const SYNTHETIC_CONSTRAINED_RUN_ID = "m4-unit-run-0002";
export const SYNTHETIC_MOUNT_SOURCES = Object.freeze({
  input: "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/input",
  result:
    "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/container-result",
  scratch:
    "/workspace/results/runs/m4-profile-controls/m4-unit-run-0001/scratch",
});

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

export async function acceptedRepositorySnapshot(): Promise<AcceptedImageStagingSnapshot> {
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  const imageInput = validateVersionedImageInput(
    JSON.parse(
      await readFile(path.join(controlRoot, "image-input.json"), "utf8"),
    ),
  );
  const preparedStaging = prepareStagingInput(
    await Promise.all(
      FIXED_STAGING_FILES.map(async (logicalPath) => ({
        logicalPath,
        bytes: Uint8Array.from(
          await readFile(path.join(controlRoot, logicalPath)),
        ),
      })),
    ),
  );
  return createAcceptedImageStagingSnapshot({
    imageInput,
    preparedStaging,
  });
}

export function syntheticAcceptedSnapshot(
  baseEnvironmentKeys: readonly string[] = ["PATH"],
): AcceptedImageStagingSnapshot {
  const preparedStaging = prepareStagingInput(
    FIXED_STAGING_FILES.map((logicalPath, index) => ({
      logicalPath,
      bytes: new TextEncoder().encode(`accepted-${index}\n`),
    })),
  );
  const imageInput = validateApprovedImageInput({
    schemaVersion: IMAGE_INPUT_SCHEMA_VERSION,
    baseImageName: "node",
    baseImageDigest: `sha256:${"2".repeat(64)}`,
    nodeVersion: "v20.18.2",
    baseEnvironmentKeys,
    stagingFiles: FIXED_STAGING_FILES,
    stagingDigest: preparedStaging.stagingDigest,
  });
  return createAcceptedImageStagingSnapshot({
    imageInput,
    preparedStaging,
  });
}

export function syntheticEvidence(manifest: ControlManifest): ControlEvidence {
  return {
    schemaVersion: CONTROL_EVIDENCE_SCHEMA_VERSION,
    runId: manifest.runId,
    controlId: manifest.controlId,
    profileId: manifest.profileId,
    containerImageDigest: manifest.containerImageDigest,
    nodeVersion: manifest.nodeVersion,
    observations: expectedControls(manifest.profileId).map(
      ({ sequence, control, outcome, reason }) => ({
        sequence,
        control,
        outcome,
        reason,
      }),
    ),
    complete: true,
  };
}

export function syntheticInspectProjection(input: {
  readonly profile: ExecutionProfile;
  readonly mountSources: Readonly<{
    input: string;
    result: string;
    scratch: string;
  }>;
}): unknown {
  const environment = [
    "PATH=/usr/local/bin",
    ...(input.profile.profileId === "permissive"
      ? [`${FIXED_ENVIRONMENT_KEY}=m4-canary-${"a".repeat(32)}`]
      : []),
  ];
  return {
    image: input.profile.containerImageDigest,
    path: "/usr/local/bin/node",
    args: [...fixedContainerArguments(input.profile.profileId)],
    user: "10001:10001",
    env: environment,
    workingDir: "/opt/m4-control",
    readOnlyRoot: true,
    networkMode: "none",
    privileged: false,
    pidMode: "",
    ipcMode: "private",
    utsMode: "",
    cgroupnsMode: "private",
    usernsMode: "",
    runtime: "runc",
    capAdd: [],
    capDrop: ["ALL"],
    securityOptions: ["no-new-privileges"],
    groupAdd: [],
    binds: [],
    devices: [],
    deviceRequests: [],
    deviceCgroupRules: [],
    portBindings: {},
    publishAllPorts: false,
    logType: "none",
    logConfig: {},
    memory: 268_435_456,
    nanoCpus: 1_000_000_000,
    pids: 64,
    oomKillDisable: null,
    restartName: "no",
    restartRetries: 0,
    mounts: [
      {
        Type: "bind",
        Source: input.mountSources.input,
        Destination: "/input",
        RW: false,
      },
      {
        Type: "bind",
        Source: input.mountSources.result,
        Destination: "/result",
        RW: true,
      },
      {
        Type: "bind",
        Source: input.mountSources.scratch,
        Destination: "/scratch",
        RW: input.profile.profileId === "permissive",
      },
    ],
    running: false,
    status: "created",
  };
}

export function canonicalHostInspection(
  profile: ExecutionProfile,
  manifest: ControlManifest,
): HostInspection {
  return {
    schemaVersion: HOST_INSPECTION_SCHEMA_VERSION,
    runId: manifest.runId,
    controlId: manifest.controlId,
    profileId: profile.profileId,
    containerImageDigest: profile.containerImageDigest,
    commandId:
      profile.profileId === "permissive"
        ? "permissive-node"
        : "constrained-node-permission-model",
    user: "10001:10001",
    readOnlyRoot: true,
    networkMode: "none",
    privileged: false,
    capAdd: [] as const,
    capDrop: ["ALL"] as const,
    securityOptions: ["no-new-privileges"] as const,
    mountIds: ["input", "result", "scratch"] as const,
    scratchAccess:
      profile.profileId === "permissive" ? "writable" : "read-only",
    environmentKeys:
      profile.profileId === "permissive"
        ? ([FIXED_ENVIRONMENT_KEY] as const)
        : ([] as const),
    devices: [] as const,
    deviceRequests: [] as const,
    groupAdd: [] as const,
    runtime: "runc",
    usernsMode: "private",
    pidMode: "private",
    resourceLimits: {
      memoryBytes: 268_435_456,
      nanoCpus: 1_000_000_000,
      pids: 64,
    },
  } as const;
}
