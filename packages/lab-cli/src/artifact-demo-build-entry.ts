import {
  ArtifactDemoError,
  canonicalJson,
  normalizeArtifactDemoError,
} from "./artifact-demo-contract.js";
import { buildPreparedArtifact } from "./artifact-demo.js";
import { FIXED_ARTIFACT_DEMO_PATHS } from "./artifact-demo-process.js";

async function main(): Promise<void> {
  if (process.argv.length !== 2) {
    throw new ArtifactDemoError("P3_ARGUMENTS_REJECTED");
  }
  const forwardedEnvironmentVariableCount = Object.keys(process.env).length;
  if (forwardedEnvironmentVariableCount !== 0) {
    throw new ArtifactDemoError("P3_ENVIRONMENT_NOT_EMPTY");
  }
  await buildPreparedArtifact(FIXED_ARTIFACT_DEMO_PATHS, {
    nodeVersion: process.version,
    forwardedEnvironmentVariableCount,
  });
}

void main().catch((error: unknown) => {
  process.stderr.write(
    Buffer.from(
      canonicalJson({
        code: normalizeArtifactDemoError(error),
        status: "failure",
      }),
    ).toString("utf8"),
  );
  process.exitCode = 1;
});
