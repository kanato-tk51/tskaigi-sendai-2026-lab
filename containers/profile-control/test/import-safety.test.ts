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
      const controlHostBackend = await import("../src/control-host-backend.js");
      const runControls = await import("../src/run-controls.js");
      const filesystemIdentity = await import("../src/filesystem-identity.js");
      const frozenResearchExecutor =
        await import("../src/frozen-research-profile-control-executor.js");
      const compiledRoot = await import("../dist/index.js");
      const compiledHostBackend =
        await import("../dist/control-host-backend.js");
      const compiledRunControls = await import("../dist/run-controls.js");
      const compiledFilesystemIdentity =
        await import("../dist/filesystem-identity.js");
      const compiledFrozenResearchExecutor =
        await import("../dist/frozen-research-profile-control-executor.js");
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
      expect(controlHostBackend.createFixedControlHostBackend).toBeTypeOf(
        "function",
      );
      expect(runControls.runFixedProductionControls).toBeTypeOf("function");
      expect(filesystemIdentity.captureFileIdentity).toBeTypeOf("function");
      expect(filesystemIdentity.createExclusiveFileIdentity).toBeTypeOf(
        "function",
      );
      expect(filesystemIdentity.assertFilesystemCapabilitiesForTest).toBeTypeOf(
        "function",
      );
      expect(
        frozenResearchExecutor.executeFrozenResearchBoundaryForTest,
      ).toBeTypeOf("function");
      expect(compiledRoot.createExecutionProfile).toBeTypeOf("function");
      expect(compiledHostBackend.createFixedControlHostBackend).toBeTypeOf(
        "function",
      );
      expect(compiledRunControls.runFixedProductionControls).toBeTypeOf(
        "function",
      );
      expect(compiledFilesystemIdentity.captureFileIdentity).toBeTypeOf(
        "function",
      );
      expect(
        compiledFrozenResearchExecutor.executeFrozenResearchBoundaryForTest,
      ).toBeTypeOf("function");
      expect("executeFixedOfflineBuild" in module).toBe(false);
      expect("createFixedOfflineBuildHostBackend" in module).toBe(false);
      expect("executeFixedOfflineBuildRecovery" in module).toBe(false);
      expect("createFixedOfflineBuildRecoveryHostBackend" in module).toBe(
        false,
      );
      expect("createFixedControlHostBackend" in module).toBe(false);
      expect("runFixedProductionControls" in module).toBe(false);
      expect("runFixedProductionControls" in compiledRoot).toBe(false);
      expect("frozenResearchProfileControlEntry" in module).toBe(false);
      expect("frozenResearchProfileControlEntry" in compiledRoot).toBe(false);
      expect("executeFrozenResearchBoundaryForTest" in module).toBe(false);
      expect("executeFrozenResearchBoundaryForTest" in compiledRoot).toBe(
        false,
      );
      expect(await readdir(root)).toEqual(before);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
