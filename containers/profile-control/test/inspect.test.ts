import { describe, expect, it } from "vitest";

import {
  createControlManifest,
  createExecutionProfile,
} from "../src/definitions.js";
import { ProfileControlError } from "../src/errors.js";
import { validateDockerInspectProjection } from "../src/inspect.js";
import {
  SYNTHETIC_IMAGE_DIGEST,
  SYNTHETIC_MOUNT_SOURCES,
  SYNTHETIC_RUN_ID,
  syntheticInspectProjection,
} from "./helpers.js";

const SECURITY_DRIFT_CASES: readonly (readonly [string, unknown])[] = [
  ["image", `sha256:${"2".repeat(64)}`],
  ["path", "/bin/sh"],
  ["args", []],
  ["user", "0:0"],
  ["env", []],
  ["workingDir", "/"],
  ["readOnlyRoot", false],
  ["networkMode", "host"],
  ["privileged", true],
  ["pidMode", "host"],
  ["ipcMode", "host"],
  ["utsMode", "host"],
  ["cgroupnsMode", "host"],
  ["usernsMode", "host"],
  ["runtime", "unsafe-runtime"],
  ["capAdd", ["SYS_ADMIN"]],
  ["capDrop", []],
  ["securityOptions", []],
  ["groupAdd", ["docker"]],
  ["binds", ["/tmp:/tmp"]],
  ["devices", [{ PathOnHost: "/dev/null" }]],
  ["deviceRequests", [{ Driver: "nvidia" }]],
  ["deviceCgroupRules", ["c 1:3 rwm"]],
  ["portBindings", { "80/tcp": [] }],
  ["publishAllPorts", true],
  ["logType", "json-file"],
  ["logConfig", { "max-size": "1m" }],
  ["memory", 1],
  ["nanoCpus", 1],
  ["pids", 1],
  ["oomKillDisable", false],
  ["restartName", "always"],
  ["restartRetries", 1],
  ["mounts", []],
  ["running", true],
  ["status", "running"],
];

describe("pre-start Docker inspection", () => {
  it("projects only canonical logical security evidence", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const inspection = validateDockerInspectProjection({
      rawProjection: syntheticInspectProjection({
        profile,
        mountSources: SYNTHETIC_MOUNT_SOURCES,
      }),
      profile,
      manifest,
      expectedMountSources: SYNTHETIC_MOUNT_SOURCES,
      baseEnvironmentKeys: ["PATH"],
    });
    expect(inspection.mountIds).toEqual(["input", "result", "scratch"]);
    expect(JSON.stringify(inspection)).not.toContain(
      SYNTHETIC_MOUNT_SOURCES.result,
    );
    expect(JSON.stringify(inspection)).not.toContain("m4-canary-");
  });

  it.each(SECURITY_DRIFT_CASES)(
    "rejects projected %s drift",
    (key, unsafeValue) => {
      const profile = createExecutionProfile(
        "permissive",
        SYNTHETIC_IMAGE_DIGEST,
      );
      const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
      const raw = syntheticInspectProjection({
        profile,
        mountSources: SYNTHETIC_MOUNT_SOURCES,
      }) as Record<string, unknown>;
      raw[key] = unsafeValue;
      expect(() =>
        validateDockerInspectProjection({
          rawProjection: raw,
          profile,
          manifest,
          expectedMountSources: SYNTHETIC_MOUNT_SOURCES,
          baseEnvironmentKeys: ["PATH"],
        }),
      ).toThrow(ProfileControlError);
    },
  );

  it("rejects a second mount and unexpected environment key", () => {
    const profile = createExecutionProfile(
      "permissive",
      SYNTHETIC_IMAGE_DIGEST,
    );
    const manifest = createControlManifest(profile, SYNTHETIC_RUN_ID);
    const raw = syntheticInspectProjection({
      profile,
      mountSources: SYNTHETIC_MOUNT_SOURCES,
    }) as Record<string, unknown>;
    raw.mounts = [
      ...(raw.mounts as unknown[]),
      {
        Type: "bind",
        Source: "/unexpected",
        Destination: "/host",
        RW: true,
      },
    ];
    expect(() =>
      validateDockerInspectProjection({
        rawProjection: raw,
        profile,
        manifest,
        expectedMountSources: SYNTHETIC_MOUNT_SOURCES,
        baseEnvironmentKeys: ["PATH"],
      }),
    ).toThrow(ProfileControlError);
    const rawEnvironment = syntheticInspectProjection({
      profile,
      mountSources: SYNTHETIC_MOUNT_SOURCES,
    }) as Record<string, unknown>;
    rawEnvironment.env = [
      ...(rawEnvironment.env as string[]),
      "UNEXPECTED=value",
    ];
    expect(() =>
      validateDockerInspectProjection({
        rawProjection: rawEnvironment,
        profile,
        manifest,
        expectedMountSources: SYNTHETIC_MOUNT_SOURCES,
        baseEnvironmentKeys: ["PATH"],
      }),
    ).toThrow(ProfileControlError);
  });
});
