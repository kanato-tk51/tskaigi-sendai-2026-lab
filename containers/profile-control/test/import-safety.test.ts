import { mkdtemp, readdir, rm } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("M4 profile-control module root", () => {
  it("imports without filesystem, process, network, timer, or Docker work", async () => {
    const root = await mkdtemp("/tmp/tskaigi-m4-import-");
    try {
      const before = await readdir(root);
      const module = await import("../src/index.js");
      const hostBackend = await import("../src/doctor-host-backend.js");
      const offlineBuild = await import("../src/offline-build.js");
      const offlineHostBackend =
        await import("../src/offline-build-host-backend.js");
      const recovery = await import("../src/offline-build-recovery.js");
      const recoveryHostBackend =
        await import("../src/offline-build-recovery-host-backend.js");
      expect(module.createExecutionProfile).toBeTypeOf("function");
      expect(module.validateControlEvidence).toBeTypeOf("function");
      expect(hostBackend.createFixedDoctorHostBackend).toBeTypeOf("function");
      expect(offlineBuild.executeFixedOfflineBuild).toBeTypeOf("function");
      expect(offlineHostBackend.createFixedOfflineBuildHostBackend).toBeTypeOf(
        "function",
      );
      expect(recovery.executeFixedOfflineBuildRecovery).toBeTypeOf("function");
      expect(
        recoveryHostBackend.createFixedOfflineBuildRecoveryHostBackend,
      ).toBeTypeOf("function");
      expect("executeFixedOfflineBuild" in module).toBe(false);
      expect("createFixedOfflineBuildHostBackend" in module).toBe(false);
      expect("executeFixedOfflineBuildRecovery" in module).toBe(false);
      expect("createFixedOfflineBuildRecoveryHostBackend" in module).toBe(
        false,
      );
      expect(await readdir(root)).toEqual(before);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
