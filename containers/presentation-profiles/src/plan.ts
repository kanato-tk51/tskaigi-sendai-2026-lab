import path from "node:path";
import { fileURLToPath } from "node:url";

export const FIXED_DOCKER_EXECUTABLE = "/usr/bin/docker" as const;
export const FIXED_NODE_IMAGE =
  "node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0" as const;
export const FIXED_NODE_IMAGE_ID =
  "sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0" as const;
export const FIXED_VITE_EXPECTED_REVISION =
  "p2-vite-expected-20260720-02" as const;
export const FIXED_CONTAINER_USER = "65532:65532" as const;

export type SelectedScenarioId =
  | "vite-observe-p"
  | "vite-observe-c"
  | "codegen-observe-p"
  | "codegen-observe-c";

export type SelectedProfileId = "permissive" | "constrained";
export type SelectedAdapterId = "vite" | "codegen";

export interface FixedDockerCommand {
  readonly executable: typeof FIXED_DOCKER_EXECUTABLE;
  readonly arguments: readonly string[];
  readonly environment: Readonly<{ DOCKER_CONFIG: string }>;
  readonly shell: false;
}

export interface SelectedScenarioPlan {
  readonly scenarioId: SelectedScenarioId;
  readonly profileId: SelectedProfileId;
  readonly adapterId: SelectedAdapterId;
  readonly runId: string;
  readonly expectedRevision?: typeof FIXED_VITE_EXPECTED_REVISION;
  readonly image: typeof FIXED_NODE_IMAGE;
  readonly stagingRoot: string;
  readonly resultRoot: string;
  readonly semanticCommand: readonly string[];
  readonly expectedCounts: Readonly<{
    route: 6 | 5;
    capability: 6;
    toolApiChange: 3 | 1;
    total: 15 | 12;
  }>;
  readonly create: FixedDockerCommand;
}

interface ScenarioDefinition {
  readonly scenarioId: SelectedScenarioId;
  readonly profileId: SelectedProfileId;
  readonly adapterId: SelectedAdapterId;
  readonly runId: string;
  readonly containerName: string;
  readonly expectedRevision?: typeof FIXED_VITE_EXPECTED_REVISION;
}

const REPOSITORY_ROOT = path.resolve(
  fileURLToPath(new URL("../../..", import.meta.url)),
);
const STAGING_ROOT = path.join(
  REPOSITORY_ROOT,
  "containers",
  "presentation-profiles",
  "staging",
);
const RESULT_ROOT = path.join(
  REPOSITORY_ROOT,
  "results",
  "runs",
  "p2-selected-profiles",
);
const CONTAINER_INPUT_ROOT = "/opt/p2/input" as const;
const CONTAINER_RUNNER = "/opt/p2/input/presentation-runner.js" as const;

const DEFINITIONS: readonly ScenarioDefinition[] = Object.freeze([
  Object.freeze({
    scenarioId: "vite-observe-p",
    profileId: "permissive",
    adapterId: "vite",
    runId: "p2-vite-observe-p-20260720-02",
    containerName: "tskaigi-p2-vite-observe-p-20260720-02",
    expectedRevision: FIXED_VITE_EXPECTED_REVISION,
  }),
  Object.freeze({
    scenarioId: "vite-observe-c",
    profileId: "constrained",
    adapterId: "vite",
    runId: "p2-vite-observe-c-20260720-02",
    containerName: "tskaigi-p2-vite-observe-c-20260720-02",
    expectedRevision: FIXED_VITE_EXPECTED_REVISION,
  }),
  Object.freeze({
    scenarioId: "codegen-observe-p",
    profileId: "permissive",
    adapterId: "codegen",
    runId: "p2-codegen-observe-p-20260719-01",
    containerName: "tskaigi-p2-codegen-observe-p",
  }),
  Object.freeze({
    scenarioId: "codegen-observe-c",
    profileId: "constrained",
    adapterId: "codegen",
    runId: "p2-codegen-observe-c-20260719-01",
    containerName: "tskaigi-p2-codegen-observe-c",
  }),
]);

function bindMount(
  source: string,
  destination: string,
  readOnly: boolean,
): string {
  return [
    "type=bind",
    `src=${source}`,
    `dst=${destination}`,
    ...(readOnly ? ["readonly"] : []),
  ].join(",");
}

function semanticCommand(adapterId: SelectedAdapterId): readonly string[] {
  return adapterId === "vite"
    ? Object.freeze([
        "vite",
        "build",
        "--config",
        "vite.scenario.config.ts",
        "--configLoader",
        "runner",
        "--mode",
        "production",
      ])
    : Object.freeze(["node", "dist/cli.js", "observe"]);
}

function expectedCounts(adapterId: SelectedAdapterId) {
  return adapterId === "vite"
    ? Object.freeze({
        route: 6 as const,
        capability: 6 as const,
        toolApiChange: 3 as const,
        total: 15 as const,
      })
    : Object.freeze({
        route: 5 as const,
        capability: 6 as const,
        toolApiChange: 1 as const,
        total: 12 as const,
      });
}

function createCommand(
  definition: ScenarioDefinition,
  stagingRoot: string,
  resultRoot: string,
): FixedDockerCommand {
  const dockerConfigRoot = path.join(resultRoot, "docker-config");
  const toolRoot = path.join(resultRoot, "tool");
  const eventRoot = path.join(resultRoot, "result");
  const directWriteRoot = path.join(resultRoot, "direct-write");
  const progressRoot = path.join(resultRoot, "progress");
  return Object.freeze({
    executable: FIXED_DOCKER_EXECUTABLE,
    arguments: Object.freeze([
      "create",
      "--name",
      definition.containerName,
      "--pull",
      "never",
      "--network",
      "none",
      "--user",
      FIXED_CONTAINER_USER,
      "--read-only",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
      "--pids-limit",
      "64",
      "--memory",
      "512m",
      "--cpus",
      "1",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,nodev,size=64m,uid=65532,gid=65532,mode=0700",
      ...(definition.adapterId === "vite"
        ? ["--mount", bindMount(progressRoot, "/tmp/p2-progress", false)]
        : []),
      "--mount",
      bindMount(stagingRoot, CONTAINER_INPUT_ROOT, true),
      "--mount",
      bindMount(eventRoot, "/tmp/p2-result", false),
      "--mount",
      bindMount(toolRoot, "/tmp/p2-tool", false),
      "--mount",
      bindMount(
        directWriteRoot,
        "/tmp/p2-direct-write",
        definition.profileId === "constrained",
      ),
      "--workdir",
      CONTAINER_INPUT_ROOT,
      FIXED_NODE_IMAGE,
      "/usr/local/bin/node",
      CONTAINER_RUNNER,
      definition.scenarioId,
    ]),
    environment: Object.freeze({ DOCKER_CONFIG: dockerConfigRoot }),
    shell: false,
  });
}

function createScenarioPlan(
  definition: ScenarioDefinition,
): SelectedScenarioPlan {
  const stagingRoot = path.join(STAGING_ROOT, definition.adapterId);
  const resultRoot = path.join(RESULT_ROOT, definition.runId);
  return Object.freeze({
    scenarioId: definition.scenarioId,
    profileId: definition.profileId,
    adapterId: definition.adapterId,
    runId: definition.runId,
    ...(definition.expectedRevision === undefined
      ? {}
      : { expectedRevision: definition.expectedRevision }),
    image: FIXED_NODE_IMAGE,
    stagingRoot,
    resultRoot,
    semanticCommand: semanticCommand(definition.adapterId),
    expectedCounts: expectedCounts(definition.adapterId),
    create: createCommand(definition, stagingRoot, resultRoot),
  });
}

export function createFixedSelectedScenarioPlans(): readonly SelectedScenarioPlan[] {
  return Object.freeze(DEFINITIONS.map(createScenarioPlan));
}
