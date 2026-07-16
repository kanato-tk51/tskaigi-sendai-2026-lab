import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";
import { describe, expect, it } from "vitest";

import {
  CANARY_RELATIVE_PATH,
  EVENT_TARGET_ID,
  LOOPBACK_TARGET_ID,
  CHILD_TARGET_ID,
  CANARY_FILE_TARGET_ID,
  DIRECT_OUTPUT_TARGET_ID,
  ENVIRONMENT_TARGET_ID,
  SOURCE_HASH_TARGET_ID,
  SOURCE_SNAPSHOT_RELATIVE_PATH,
  OUTPUT_RELATIVE_PATH,
} from "../src/constants.js";
import {
  createLifecycleManifest,
  createLifecycleRuntimeBindings,
} from "../src/manifest.js";

describe("M2-A probe-core integration", () => {
  it("accepts the fixed lifecycle manifest and prepares its bindings", async () => {
    const runId = "m2a-npm-lifecycle-0123456789abcdef0123456789abcdef";
    const runRoot = await mkdtemp("/tmp/tskaigi-npm-lifecycle-m2a-");
    try {
      await mkdir(path.join(runRoot, "canary"), { recursive: true });
      await mkdir(path.join(runRoot, "probe-output"), { recursive: true });
      await writeFile(path.join(runRoot, CANARY_RELATIVE_PATH), "canary\n");
      await writeFile(
        path.join(runRoot, SOURCE_SNAPSHOT_RELATIVE_PATH),
        "source snapshot\n",
      );
      const manifest = createLifecycleManifest(runId);
      const validated = validateProbeConfiguration(
        manifest,
        createLifecycleRuntimeBindings(runRoot, 37_001),
      );
      const prepared = await prepareProbeConfiguration(validated);
      const session = await createProbeSession(prepared);
      await session.close();
      expect(session.state).toBe("closed");
      expect(manifest.targets.map((target) => target.targetId)).toEqual([
        EVENT_TARGET_ID,
        ENVIRONMENT_TARGET_ID,
        CANARY_FILE_TARGET_ID,
        SOURCE_HASH_TARGET_ID,
        DIRECT_OUTPUT_TARGET_ID,
        LOOPBACK_TARGET_ID,
        CHILD_TARGET_ID,
      ]);
      expect(path.join(runRoot, OUTPUT_RELATIVE_PATH)).toContain(runRoot);
    } finally {
      await rm(runRoot, { recursive: true, force: true });
    }
  });
});
