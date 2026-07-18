import { describe, expect, it } from "vitest";

import {
  createExecutionProfile,
  createProfileControlPair,
} from "../src/definitions.js";
import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
  createProfileDockerPlan,
  createProfilePairDockerPlans,
  FIXED_INSPECT_FORMAT,
} from "../src/docker-plan.js";
import {
  FIXED_DOCKER_FORMATS,
  FIXED_RUNTIME_VERSION_FORMAT,
} from "../src/docker-formats.js";
import { ProfileControlError } from "../src/errors.js";
import {
  SYNTHETIC_CONSTRAINED_RUN_ID,
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_RUN_ID,
  syntheticAcceptedSnapshot,
} from "./helpers.js";

describe("fixed Docker command plan", () => {
  it("separates immutable input, result, and same-target scratch state", () => {
    const acceptedSnapshot = syntheticAcceptedSnapshot();
    const pair = createProfileControlPair({
      acceptedSnapshot,
      containerImageDigest: SYNTHETIC_IMAGE_DIGEST,
      permissiveRunId: SYNTHETIC_RUN_ID,
      constrainedRunId: SYNTHETIC_CONSTRAINED_RUN_ID,
    });
    const permissiveLayout = createFixedRuntimeLayout(
      "/workspace",
      SYNTHETIC_RUN_ID,
      "permissive",
    );
    const constrainedLayout = createFixedRuntimeLayout(
      "/workspace",
      SYNTHETIC_CONSTRAINED_RUN_ID,
      "constrained",
    );
    const imageBuildPlan = createImageBuildPlan({
      acceptedSnapshot,
      layout: permissiveLayout,
    });
    const plans = createProfilePairDockerPlans({
      acceptedSnapshot,
      pair,
      permissiveLayout,
      constrainedLayout,
      permissiveCanary: `m4-canary-${"a".repeat(32)}`,
      constrainedCanary: `m4-canary-${"b".repeat(32)}`,
    });
    const permissivePlan = plans.permissive;
    const constrainedPlan = plans.constrained;
    for (const plan of [permissivePlan, constrainedPlan]) {
      expect(plan.create.executable).toBe("/usr/bin/docker");
      expect(plan.create.shell).toBe(false);
      expect(plan.create.arguments).toContain("none");
      expect(plan.create.arguments).toContain("--read-only");
      expect(plan.create.arguments).toContain("ALL");
      expect(plan.create.arguments).toContain("no-new-privileges");
      const mounts = plan.create.arguments.filter((argument) =>
        argument.startsWith("type=bind,"),
      );
      expect(mounts).toHaveLength(3);
      expect(mounts.some((mount) => mount.includes("dst=/input,ro"))).toBe(
        true,
      );
      expect(mounts.some((mount) => mount.includes("dst=/result,rw"))).toBe(
        true,
      );
      expect(mounts.some((mount) => mount.includes("dst=/scratch,"))).toBe(
        true,
      );
      expect(plan.inspect.arguments).toContain(FIXED_INSPECT_FORMAT);
      expect(plan.create.arguments).not.toContain("--privileged");
      expect(plan.create.arguments).not.toContain("--pid=host");
    }
    expect(permissivePlan.create.arguments).toContain("--env");
    expect(constrainedPlan.create.arguments).not.toContain("--env");
    expect(constrainedPlan.create.arguments).toContain(
      "--experimental-permission",
    );
    expect(constrainedPlan.create.arguments).toContain(
      "--allow-fs-write=/opt/m4-control,/result,/scratch",
    );
    expect(permissivePlan.create.arguments).not.toContain(
      "--experimental-permission",
    );
    expect(permissiveLayout.scratchRoot).not.toBe(
      constrainedLayout.scratchRoot,
    );
    expect(plans.permissiveRunId).not.toBe(plans.constrainedRunId);
    expect(imageBuildPlan.doctor.arguments).toEqual([
      "version",
      "--format",
      FIXED_RUNTIME_VERSION_FORMAT,
    ]);
  });

  it("uses only Docker 29.6.1-compatible helpers for every fixed format", () => {
    const projection = [
      ["image", ".Image"],
      ["path", ".Path"],
      ["args", ".Args"],
      ["user", ".Config.User"],
      ["env", ".Config.Env"],
      ["workingDir", ".Config.WorkingDir"],
      ["readOnlyRoot", ".HostConfig.ReadonlyRootfs"],
      ["networkMode", ".HostConfig.NetworkMode"],
      ["privileged", ".HostConfig.Privileged"],
      ["pidMode", ".HostConfig.PidMode"],
      ["ipcMode", ".HostConfig.IpcMode"],
      ["utsMode", ".HostConfig.UTSMode"],
      ["cgroupnsMode", ".HostConfig.CgroupnsMode"],
      ["usernsMode", ".HostConfig.UsernsMode"],
      ["runtime", ".HostConfig.Runtime"],
      ["capAdd", ".HostConfig.CapAdd"],
      ["capDrop", ".HostConfig.CapDrop"],
      ["securityOptions", ".HostConfig.SecurityOpt"],
      ["groupAdd", ".HostConfig.GroupAdd"],
      ["binds", ".HostConfig.Binds"],
      ["devices", ".HostConfig.Devices"],
      ["deviceRequests", ".HostConfig.DeviceRequests"],
      ["deviceCgroupRules", ".HostConfig.DeviceCgroupRules"],
      ["portBindings", ".HostConfig.PortBindings"],
      ["publishAllPorts", ".HostConfig.PublishAllPorts"],
      ["logType", ".HostConfig.LogConfig.Type"],
      ["logConfig", ".HostConfig.LogConfig.Config"],
      ["memory", ".HostConfig.Memory"],
      ["nanoCpus", ".HostConfig.NanoCpus"],
      ["pids", ".HostConfig.PidsLimit"],
      ["oomKillDisable", ".HostConfig.OomKillDisable"],
      ["restartName", ".HostConfig.RestartPolicy.Name"],
      ["restartRetries", ".HostConfig.RestartPolicy.MaximumRetryCount"],
      ["mounts", ".Mounts"],
      ["running", ".State.Running"],
      ["status", ".State.Status"],
    ] as const;
    expect(FIXED_INSPECT_FORMAT).toBe(
      `{${projection
        .map(([key, value]) => `"${key}":{{json ${value}}}`)
        .join(",")}}`,
    );
    for (const format of FIXED_DOCKER_FORMATS) {
      expect(format).not.toMatch(/\{\{[^}]*\bdict\b/u);
    }
  });

  it("rejects non-owned layouts and arbitrary canary input", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    expect(() =>
      createFixedRuntimeLayout("relative", SYNTHETIC_RUN_ID, "permissive"),
    ).toThrow(ProfileControlError);
    expect(() =>
      createProfileDockerPlan({
        profile,
        runId: SYNTHETIC_RUN_ID,
        layout: createFixedRuntimeLayout(
          "/workspace",
          SYNTHETIC_RUN_ID,
          "permissive",
        ),
        disposableCanary: "user-input",
      }),
    ).toThrow(ProfileControlError);
  });
});
