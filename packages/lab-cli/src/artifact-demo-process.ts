import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import {
  ARTIFACT_DEMO_BUILD_ID,
  ArtifactDemoError,
} from "./artifact-demo-contract.js";
import type { ArtifactDemoPaths } from "./artifact-demo.js";

const BUILD_PROCESS_TIMEOUT_MS = 10_000;
const BUILD_PROCESS_MAX_OUTPUT_BYTES = 4 * 1024;

export const ARTIFACT_DEMO_REPOSITORY_ROOT = fileURLToPath(
  new URL("../../../", import.meta.url),
);

export const FIXED_ARTIFACT_DEMO_PATHS: ArtifactDemoPaths = Object.freeze({
  repositoryRoot: ARTIFACT_DEMO_REPOSITORY_ROOT,
  sourcePath: join(
    ARTIFACT_DEMO_REPOSITORY_ROOT,
    "packages/lab-cli/fixture/artifact-demo/source.txt",
  ),
  lockfilePath: join(ARTIFACT_DEMO_REPOSITORY_ROOT, "package-lock.json"),
  runRoot: join(
    ARTIFACT_DEMO_REPOSITORY_ROOT,
    "results/runs/p3-artifact-demo",
    ARTIFACT_DEMO_BUILD_ID,
  ),
});

export interface FixedArtifactBuildProcessSpec {
  readonly executable: string;
  readonly arguments: readonly [string];
  readonly cwd: string;
  readonly environment: Readonly<Record<string, never>>;
  readonly timeoutMs: number;
  readonly maxOutputBytes: number;
}

export function getFixedArtifactBuildProcessSpec(): FixedArtifactBuildProcessSpec {
  return Object.freeze({
    executable: process.execPath,
    arguments: Object.freeze([
      fileURLToPath(new URL("./artifact-demo-build-entry.js", import.meta.url)),
    ] as const),
    cwd: ARTIFACT_DEMO_REPOSITORY_ROOT,
    environment: Object.freeze({}),
    timeoutMs: BUILD_PROCESS_TIMEOUT_MS,
    maxOutputBytes: BUILD_PROCESS_MAX_OUTPUT_BYTES,
  });
}

export async function invokeFixedArtifactBuild(
  paths: ArtifactDemoPaths,
): Promise<void> {
  if (
    paths.repositoryRoot !== FIXED_ARTIFACT_DEMO_PATHS.repositoryRoot ||
    paths.sourcePath !== FIXED_ARTIFACT_DEMO_PATHS.sourcePath ||
    paths.lockfilePath !== FIXED_ARTIFACT_DEMO_PATHS.lockfilePath ||
    paths.runRoot !== FIXED_ARTIFACT_DEMO_PATHS.runRoot
  ) {
    throw new ArtifactDemoError("P3_PIPELINE_INVALID");
  }
  const spec = getFixedArtifactBuildProcessSpec();
  await new Promise<void>((resolve, reject) => {
    execFile(
      spec.executable,
      [...spec.arguments],
      {
        cwd: spec.cwd,
        env: spec.environment,
        encoding: "utf8",
        maxBuffer: spec.maxOutputBytes,
        timeout: spec.timeoutMs,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error !== null || stdout !== "" || stderr !== "") {
          reject(new ArtifactDemoError("P3_BUILD_PROCESS_FAILED"));
          return;
        }
        resolve();
      },
    );
  });
}
