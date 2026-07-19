import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FIXED_CONSTRAINED_RUN_ID,
  FIXED_CONTROL_IMAGE_DIGEST,
  FIXED_PERMISSIVE_RUN_ID,
  FIXED_STAGING_FILES,
} from "./constants.js";
import { createFixedControlHostBackend } from "./control-host-backend.js";
import { createProfileControlPair } from "./definitions.js";
import {
  createFixedRuntimeLayout,
  createProfilePairDockerPlans,
} from "./docker-plan.js";
import {
  executeFixedExistingImageProfilePair,
  type FixedExistingImageExecutionInput,
} from "./execution.js";
import { validateVersionedImageInput } from "./image-input.js";
import {
  parseCanonicalExecutionProfileBytes,
  serializeCanonicalExecutionProfile,
} from "./profile-input.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "./staging.js";
import type { PairExecutionResult } from "./types.js";

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.byteLength === right.byteLength &&
    left.every((value, index) => value === right[index])
  );
}

function fixedCanary(runId: string): string {
  return `m4-canary-${createHash("sha256")
    .update(`tskaigi-m4-control:${runId}`, "utf8")
    .digest("hex")
    .slice(0, 32)}`;
}

export async function createFixedProductionControlDefinition(): Promise<
  Omit<FixedExistingImageExecutionInput, "backend">
> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_CONTROL_PATH");
  }
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
  const acceptedSnapshot = createAcceptedImageStagingSnapshot({
    imageInput,
    preparedStaging,
  });
  const profileBytes = Object.freeze({
    permissive: Uint8Array.from(
      await readFile(
        path.join(repositoryRoot, "profiles", "permissive", "profile.json"),
      ),
    ),
    constrained: Uint8Array.from(
      await readFile(
        path.join(repositoryRoot, "profiles", "constrained", "profile.json"),
      ),
    ),
  });
  const profiles = Object.freeze({
    permissive: parseCanonicalExecutionProfileBytes({
      bytes: profileBytes.permissive,
      profileId: "permissive",
    }),
    constrained: parseCanonicalExecutionProfileBytes({
      bytes: profileBytes.constrained,
      profileId: "constrained",
    }),
  });
  const pair = createProfileControlPair({
    acceptedSnapshot,
    containerImageDigest: FIXED_CONTROL_IMAGE_DIGEST,
    permissiveRunId: FIXED_PERMISSIVE_RUN_ID,
    constrainedRunId: FIXED_CONSTRAINED_RUN_ID,
  });
  if (
    !equalBytes(
      profileBytes.permissive,
      serializeCanonicalExecutionProfile(pair.permissive.profile),
    ) ||
    !equalBytes(
      profileBytes.constrained,
      serializeCanonicalExecutionProfile(pair.constrained.profile),
    ) ||
    profiles.permissive.containerImageDigest !== pair.containerImageDigest ||
    profiles.constrained.containerImageDigest !== pair.containerImageDigest
  ) {
    throw new Error("M4_CONTROL_PROFILE_BINDING");
  }
  const permissiveLayout = createFixedRuntimeLayout(
    repositoryRoot,
    FIXED_PERMISSIVE_RUN_ID,
    "permissive",
  );
  const constrainedLayout = createFixedRuntimeLayout(
    repositoryRoot,
    FIXED_CONSTRAINED_RUN_ID,
    "constrained",
  );
  const profilePlans = createProfilePairDockerPlans({
    acceptedSnapshot,
    pair,
    permissiveLayout,
    constrainedLayout,
    permissiveCanary: fixedCanary(FIXED_PERMISSIVE_RUN_ID),
    constrainedCanary: fixedCanary(FIXED_CONSTRAINED_RUN_ID),
  });
  return Object.freeze({
    acceptedSnapshot,
    pair,
    profilePlans,
    permissiveLayout,
    constrainedLayout,
  });
}

export async function runFixedProductionControls(): Promise<PairExecutionResult> {
  const definition = await createFixedProductionControlDefinition();
  const backend = await createFixedControlHostBackend({
    acceptedSnapshot: definition.acceptedSnapshot,
    pair: definition.pair,
    plans: definition.profilePlans,
    permissiveLayout: definition.permissiveLayout,
    constrainedLayout: definition.constrainedLayout,
  });
  return await executeFixedExistingImageProfilePair({
    ...definition,
    backend,
  });
}

export function serializeCanonicalPairExecutionResult(
  result: PairExecutionResult,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(result)}\n`);
}
