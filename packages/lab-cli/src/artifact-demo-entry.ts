import {
  ArtifactDemoError,
  canonicalJson,
  normalizeArtifactDemoError,
  serializeArtifactDemoResult,
} from "./artifact-demo-contract.js";
import { runArtifactDemo } from "./artifact-demo.js";
import {
  FIXED_ARTIFACT_DEMO_PATHS,
  invokeFixedArtifactBuild,
} from "./artifact-demo-process.js";

async function main(): Promise<void> {
  if (process.argv.length !== 2) {
    throw new ArtifactDemoError("P3_ARGUMENTS_REJECTED");
  }
  const result = await runArtifactDemo(
    FIXED_ARTIFACT_DEMO_PATHS,
    invokeFixedArtifactBuild,
  );
  process.stdout.write(
    Buffer.from(serializeArtifactDemoResult(result)).toString("utf8"),
  );
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
