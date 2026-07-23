import path from "node:path";

import {
  FIXED_CONTAINER_USER,
  FIXED_CONTAINER_RUNTIME,
  FIXED_ENVIRONMENT_KEY,
  FIXED_IMAGE_NAME,
  FIXED_INPUT_DESTINATION,
  FIXED_RESULT_DESTINATION,
  FIXED_SCRATCH_DESTINATION,
  LIMITS,
} from "./constants.js";
import { assertAcceptedProfileControlPair } from "./definitions.js";
import {
  FIXED_IMAGE_ID_FORMAT,
  FIXED_INSPECT_FORMAT,
  FIXED_RUNTIME_VERSION_FORMAT,
} from "./docker-formats.js";
import { failProfile } from "./errors.js";
import { assertExactKeys, assertRunId, readPlainRecord } from "./safe-data.js";
import { assertAcceptedImageStagingSnapshot } from "./staging.js";
import type {
  AcceptedImageStagingSnapshot,
  ExecutionProfile,
  ProfileControlPair,
  ProfileId,
} from "./types.js";
import {
  validateExecutionProfile,
  validateProfileControlPair,
} from "./validation.js";

export const FIXED_DOCKER_EXECUTABLE = "/usr/bin/docker" as const;
export const FIXED_NODE_EXECUTABLE = "/usr/local/bin/node" as const;
export const FIXED_CONTROL_SCRIPT =
  "/opt/m4-control/control-runner.mjs" as const;
export const FIXED_MANIFEST_PATH = "/input/control-manifest.json" as const;

export { FIXED_INSPECT_FORMAT } from "./docker-formats.js";

export interface FixedRuntimeLayout {
  readonly profileId: ProfileId;
  readonly runId: string;
  readonly repositoryRoot: string;
  readonly runRoot: string;
  readonly inputRoot: string;
  readonly hostRoot: string;
  readonly resultRoot: string;
  readonly scratchRoot: string;
  readonly dockerConfigRoot: string;
  readonly stagingRoot: string;
}

export interface DockerCommand {
  readonly executable: typeof FIXED_DOCKER_EXECUTABLE;
  readonly arguments: readonly string[];
  readonly environment: Readonly<{ DOCKER_CONFIG: string }>;
  readonly shell: false;
}

export interface ProfileDockerPlan {
  readonly profileId: ProfileId;
  readonly containerName: string;
  readonly commandId: "permissive-node" | "constrained-node-permission-model";
  readonly create: DockerCommand;
  readonly inspect: DockerCommand;
  readonly start: DockerCommand;
  readonly remove: DockerCommand;
}

export interface ImageBuildPlan {
  readonly doctor: DockerCommand;
  readonly build: DockerCommand;
  readonly inspectImage: DockerCommand;
  readonly stagedImageName: string;
  readonly stagingDigest: `sha256:${string}`;
}

export interface ProfilePairDockerPlans {
  readonly containerImageDigest: `sha256:${string}`;
  readonly permissiveRunId: string;
  readonly constrainedRunId: string;
  readonly permissive: ProfileDockerPlan;
  readonly constrained: ProfileDockerPlan;
}

const runtimeLayoutBrands = new WeakSet<FixedRuntimeLayout>();
const imageBuildPlanBindings = new WeakMap<
  ImageBuildPlan,
  Readonly<{
    acceptedSnapshot: AcceptedImageStagingSnapshot;
    layout: FixedRuntimeLayout;
  }>
>();
const profilePairPlanBindings = new WeakMap<
  ProfilePairDockerPlans,
  Readonly<{
    acceptedSnapshot: AcceptedImageStagingSnapshot;
    permissiveLayout: FixedRuntimeLayout;
    constrainedLayout: FixedRuntimeLayout;
  }>
>();

export function assertFixedImageBuildPlan(
  input: ImageBuildPlan,
  acceptedSnapshot: AcceptedImageStagingSnapshot,
  layout: FixedRuntimeLayout,
): ImageBuildPlan {
  const binding = imageBuildPlanBindings.get(input);
  if (
    binding?.acceptedSnapshot !== acceptedSnapshot ||
    binding.layout !== layout
  ) {
    return failProfile("INVALID_DOCKER_PLAN");
  }
  return input;
}

export function assertFixedProfilePairDockerPlans(
  input: ProfilePairDockerPlans,
  acceptedSnapshot: AcceptedImageStagingSnapshot,
  permissiveLayout: FixedRuntimeLayout,
  constrainedLayout: FixedRuntimeLayout,
): ProfilePairDockerPlans {
  const binding = profilePairPlanBindings.get(input);
  if (
    binding?.acceptedSnapshot !== acceptedSnapshot ||
    binding.permissiveLayout !== permissiveLayout ||
    binding.constrainedLayout !== constrainedLayout
  ) {
    return failProfile("INVALID_DOCKER_PLAN");
  }
  return input;
}

function assertOwnedAbsolutePath(value: string): string {
  if (
    !path.isAbsolute(value) ||
    path.normalize(value) !== value ||
    value.includes("\n") ||
    value.includes("\0") ||
    value.includes(",")
  ) {
    return failProfile("INVALID_DOCKER_PLAN");
  }
  return value;
}

export function createFixedRuntimeLayout(
  repositoryRoot: string,
  runIdInput: string,
  profileId: ProfileId,
): FixedRuntimeLayout {
  const runId = assertRunId(runIdInput, "INVALID_RUN_ID");
  const root = assertOwnedAbsolutePath(repositoryRoot);
  if (profileId !== "permissive" && profileId !== "constrained") {
    return failProfile("INVALID_DOCKER_PLAN");
  }
  const runRoot = path.join(
    root,
    "results",
    "runs",
    "m4-profile-controls",
    runId,
  );
  const layout = Object.freeze({
    profileId,
    runId,
    repositoryRoot: root,
    runRoot,
    inputRoot: path.join(runRoot, "input"),
    hostRoot: path.join(runRoot, "host"),
    resultRoot: path.join(runRoot, "container-result"),
    scratchRoot: path.join(runRoot, "scratch"),
    dockerConfigRoot: path.join(runRoot, "docker-config"),
    stagingRoot: path.join(runRoot, "staging"),
  });
  runtimeLayoutBrands.add(layout);
  return layout;
}

export function createImageBuildPlan(input: {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly layout: FixedRuntimeLayout;
}): ImageBuildPlan {
  const wrapper = readPlainRecord(input, "INVALID_DOCKER_PLAN");
  assertExactKeys(
    wrapper,
    ["acceptedSnapshot", "layout"],
    "INVALID_DOCKER_PLAN",
  );
  const acceptedSnapshot = assertAcceptedImageStagingSnapshot(
    wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
  );
  const layout = wrapper.layout as FixedRuntimeLayout;
  if (!runtimeLayoutBrands.has(layout)) failProfile("INVALID_DOCKER_PLAN");
  const runId = assertRunId(layout.runId, "INVALID_RUN_ID");
  if (
    layout.profileId !== "permissive" ||
    !layout.runRoot.endsWith(`/results/runs/m4-profile-controls/${runId}`) ||
    layout.stagingRoot !== path.join(layout.runRoot, "staging")
  ) {
    failProfile("INVALID_DOCKER_PLAN");
  }
  assertOwnedAbsolutePath(layout.stagingRoot);
  assertOwnedAbsolutePath(layout.dockerConfigRoot);
  const stagedImageName = `${FIXED_IMAGE_NAME}:staged-${runId}`;
  const environment = layout.dockerConfigRoot;
  const plan = Object.freeze({
    doctor: dockerCommand(environment, [
      "version",
      "--format",
      FIXED_RUNTIME_VERSION_FORMAT,
    ]),
    build: dockerCommand(environment, [
      "build",
      "--network",
      "none",
      "--pull=false",
      "--build-arg",
      `BASE_IMAGE=${acceptedSnapshot.baseImageName}@${acceptedSnapshot.baseImageDigest}`,
      "--tag",
      stagedImageName,
      "--file",
      path.join(layout.stagingRoot, "Containerfile"),
      layout.stagingRoot,
    ]),
    inspectImage: dockerCommand(environment, [
      "image",
      "inspect",
      "--format",
      FIXED_IMAGE_ID_FORMAT,
      stagedImageName,
    ]),
    stagedImageName,
    stagingDigest: acceptedSnapshot.stagingDigest,
  });
  imageBuildPlanBindings.set(plan, Object.freeze({ acceptedSnapshot, layout }));
  return plan;
}

function dockerCommand(
  dockerConfigRoot: string,
  args: readonly string[],
): DockerCommand {
  return Object.freeze({
    executable: FIXED_DOCKER_EXECUTABLE,
    arguments: Object.freeze([...args]),
    environment: Object.freeze({ DOCKER_CONFIG: dockerConfigRoot }),
    shell: false,
  });
}

export function fixedContainerArguments(
  profileId: ProfileId,
): readonly string[] {
  if (profileId !== "permissive" && profileId !== "constrained") {
    failProfile("INVALID_DOCKER_PLAN");
  }
  if (profileId === "permissive") {
    return Object.freeze([FIXED_CONTROL_SCRIPT, FIXED_MANIFEST_PATH]);
  }
  return Object.freeze([
    "--experimental-permission",
    "--allow-fs-read=/opt/m4-control,/input,/result,/scratch",
    "--allow-fs-write=/opt/m4-control,/result,/scratch",
    FIXED_CONTROL_SCRIPT,
    FIXED_MANIFEST_PATH,
  ]);
}

export function createProfileDockerPlan(input: {
  readonly profile: ExecutionProfile;
  readonly runId: string;
  readonly layout: FixedRuntimeLayout;
  readonly disposableCanary: string;
}): ProfileDockerPlan {
  const wrapper = readPlainRecord(input, "INVALID_DOCKER_PLAN");
  assertExactKeys(
    wrapper,
    ["profile", "runId", "layout", "disposableCanary"],
    "INVALID_DOCKER_PLAN",
  );
  const profile = validateExecutionProfile(wrapper.profile);
  const runId = assertRunId(wrapper.runId, "INVALID_RUN_ID");
  const layout = wrapper.layout as FixedRuntimeLayout;
  if (
    !runtimeLayoutBrands.has(layout) ||
    layout.profileId !== profile.profileId ||
    layout.inputRoot !== path.join(layout.runRoot, "input") ||
    layout.hostRoot !== path.join(layout.runRoot, "host") ||
    layout.resultRoot !== path.join(layout.runRoot, "container-result") ||
    layout.scratchRoot !== path.join(layout.runRoot, "scratch") ||
    layout.dockerConfigRoot !== path.join(layout.runRoot, "docker-config") ||
    !layout.runRoot.endsWith(`/results/runs/m4-profile-controls/${runId}`) ||
    typeof wrapper.disposableCanary !== "string" ||
    !/^m4-canary-[a-f0-9]{32}$/u.test(wrapper.disposableCanary)
  ) {
    failProfile("INVALID_DOCKER_PLAN");
  }
  assertOwnedAbsolutePath(layout.inputRoot);
  assertOwnedAbsolutePath(layout.hostRoot);
  assertOwnedAbsolutePath(layout.resultRoot);
  assertOwnedAbsolutePath(layout.scratchRoot);
  assertOwnedAbsolutePath(layout.dockerConfigRoot);

  const profileId = profile.profileId;
  const suffix = profileId === "permissive" ? "p" : "c";
  const containerName = `tskaigi-m4-${suffix}-${runId}`;
  const nodeArguments = fixedContainerArguments(profileId);
  const createArguments = [
    "create",
    "--name",
    containerName,
    "--pull",
    "never",
    "--network",
    "none",
    "--read-only",
    "--workdir",
    "/opt/m4-control",
    "--user",
    FIXED_CONTAINER_USER,
    "--ipc",
    "private",
    "--cgroupns",
    "private",
    "--restart",
    "no",
    "--log-driver",
    "none",
    "--runtime",
    FIXED_CONTAINER_RUNTIME,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--memory",
    String(LIMITS.memoryBytes),
    "--cpus",
    "1",
    "--pids-limit",
    String(LIMITS.pids),
    "--mount",
    `type=bind,src=${layout.inputRoot},dst=${FIXED_INPUT_DESTINATION},ro`,
    "--mount",
    `type=bind,src=${layout.resultRoot},dst=${FIXED_RESULT_DESTINATION},rw`,
    "--mount",
    `type=bind,src=${layout.scratchRoot},dst=${FIXED_SCRATCH_DESTINATION},${profileId === "permissive" ? "rw" : "ro"}`,
    "--entrypoint",
    FIXED_NODE_EXECUTABLE,
  ];
  if (profileId === "permissive") {
    createArguments.push(
      "--env",
      `${FIXED_ENVIRONMENT_KEY}=${wrapper.disposableCanary}`,
    );
  }
  createArguments.push(profile.containerImageDigest, ...nodeArguments);
  const environment = layout.dockerConfigRoot;
  const plan = Object.freeze({
    profileId,
    containerName,
    commandId:
      profileId === "permissive"
        ? "permissive-node"
        : "constrained-node-permission-model",
    create: dockerCommand(environment, createArguments),
    inspect: dockerCommand(environment, [
      "inspect",
      "--format",
      FIXED_INSPECT_FORMAT,
      containerName,
    ]),
    start: dockerCommand(environment, ["start", "--attach", containerName]),
    remove: dockerCommand(environment, ["rm", containerName]),
  });
  return plan;
}

export function createProfilePairDockerPlans(input: {
  readonly acceptedSnapshot: AcceptedImageStagingSnapshot;
  readonly pair: ProfileControlPair;
  readonly permissiveLayout: FixedRuntimeLayout;
  readonly constrainedLayout: FixedRuntimeLayout;
  readonly permissiveCanary: string;
  readonly constrainedCanary: string;
}): ProfilePairDockerPlans {
  const wrapper = readPlainRecord(input, "INVALID_PROFILE_PAIR");
  assertExactKeys(
    wrapper,
    [
      "acceptedSnapshot",
      "pair",
      "permissiveLayout",
      "constrainedLayout",
      "permissiveCanary",
      "constrainedCanary",
    ],
    "INVALID_PROFILE_PAIR",
  );
  const acceptedSnapshot = assertAcceptedImageStagingSnapshot(
    wrapper.acceptedSnapshot as AcceptedImageStagingSnapshot,
  );
  const pairInput = wrapper.pair as ProfileControlPair;
  const permissiveLayout = wrapper.permissiveLayout as FixedRuntimeLayout;
  const constrainedLayout = wrapper.constrainedLayout as FixedRuntimeLayout;
  assertAcceptedProfileControlPair(pairInput, acceptedSnapshot);
  const pair = validateProfileControlPair(pairInput);
  if (
    !runtimeLayoutBrands.has(permissiveLayout) ||
    !runtimeLayoutBrands.has(constrainedLayout)
  ) {
    failProfile("INVALID_PROFILE_PAIR");
  }
  const roots = [
    permissiveLayout.runRoot,
    permissiveLayout.inputRoot,
    permissiveLayout.hostRoot,
    permissiveLayout.resultRoot,
    permissiveLayout.scratchRoot,
    constrainedLayout.runRoot,
    constrainedLayout.inputRoot,
    constrainedLayout.hostRoot,
    constrainedLayout.resultRoot,
    constrainedLayout.scratchRoot,
  ];
  if (
    new Set(roots).size !== roots.length ||
    permissiveLayout.profileId !== "permissive" ||
    constrainedLayout.profileId !== "constrained"
  ) {
    failProfile("INVALID_PROFILE_PAIR");
  }
  const plans = Object.freeze({
    containerImageDigest: pair.containerImageDigest,
    permissiveRunId: pair.permissive.manifest.runId,
    constrainedRunId: pair.constrained.manifest.runId,
    permissive: createProfileDockerPlan({
      profile: pair.permissive.profile,
      runId: pair.permissive.manifest.runId,
      layout: permissiveLayout,
      disposableCanary: wrapper.permissiveCanary as string,
    }),
    constrained: createProfileDockerPlan({
      profile: pair.constrained.profile,
      runId: pair.constrained.manifest.runId,
      layout: constrainedLayout,
      disposableCanary: wrapper.constrainedCanary as string,
    }),
  });
  profilePairPlanBindings.set(
    plans,
    Object.freeze({
      acceptedSnapshot,
      permissiveLayout,
      constrainedLayout,
    }),
  );
  return plans;
}
