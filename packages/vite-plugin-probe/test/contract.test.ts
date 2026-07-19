import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import * as publicApi from "../src/index.js";
import {
  ATTEMPT_IDS,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_PRODUCER_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  FIXED_VITE_ARGUMENTS,
  ROUTE_IDS,
  TOOL_CHANGE_IDS,
} from "../src/constants.js";
import {
  createFixedManifest,
  createSelectedProfileRuntimeBindings,
} from "../src/manifest.js";
import { FIXED_ADAPTER_ROOT } from "../src/paths.js";
import { assertFixedVersionValues } from "../src/version-contract.js";

describe("M2-D public and fixed contract", () => {
  it("exposes only no-argument fixed runners and contract metadata", () => {
    expect(publicApi.runFixedObserveScenario.length).toBe(0);
    expect(publicApi.runFixedApiScenario.length).toBe(0);
    expect(Object.keys(publicApi)).not.toContain("spawn");
    expect(Object.keys(publicApi)).not.toContain("runCommand");
    expect(Object.keys(publicApi)).not.toContain("createPlugin");
  });

  it("pins the fixed command and exact counts", () => {
    expect(FIXED_VITE_ARGUMENTS).toEqual([
      "build",
      "--config",
      "vite.scenario.config.ts",
      "--configLoader",
      "runner",
      "--mode",
      "production",
    ]);
    expect({
      route: EXPECTED_ROUTE_COUNT,
      capability: EXPECTED_CAPABILITY_COUNT,
      tool: EXPECTED_TOOL_API_CHANGE_COUNT,
      total: EXPECTED_EVENT_COUNT,
      producer: EXPECTED_PRODUCER_COUNT,
    }).toEqual({ route: 6, capability: 6, tool: 3, total: 15, producer: 1 });
  });

  it("fixes route, capability, tool-change, and producer order", () => {
    expect(Object.values(ROUTE_IDS)).toHaveLength(6);
    expect(Object.values(ATTEMPT_IDS)).toHaveLength(6);
    expect(Object.values(TOOL_CHANGE_IDS)).toHaveLength(3);
    expect(EXPECTED_EVENT_ORDER).toHaveLength(15);
    expect(EXPECTED_EVENT_ORDER[0]).toContain("late-plugin-module-checkpoint");
    expect(EXPECTED_EVENT_ORDER[14]).toContain("write-bundle");
  });

  it("declares the same 15-event manifest for both variants", () => {
    const manifest = createFixedManifest(
      "m2d-vite-00000000000000000000000000000000",
    );
    expect(
      manifest.routeInvocations.map((value) => value.routeInvocationId),
    ).toEqual(Object.values(ROUTE_IDS));
    expect(manifest.attempts.map((value) => value.attemptId)).toEqual(
      Object.values(ATTEMPT_IDS),
    );
    expect(
      manifest.toolApiChanges.map((value) => value.toolApiChangeId),
    ).toEqual(Object.values(TOOL_CHANGE_IDS));
    expect(manifest.toolApiChanges.every((value) => value.enabled)).toBe(true);
    expect(manifest.workerId).toBeNull();
  });

  it("separates selected event, tool, source, and direct-write roots", () => {
    const bindings = createSelectedProfileRuntimeBindings(4321).bindings;
    expect(bindings).toEqual([
      {
        targetId: "vite-event-segment",
        kind: "path",
        rootPath: "/tmp/p2-result",
        relativePath: "vite-coordinator.jsonl",
      },
      { targetId: "vite-environment-canary", kind: "environment" },
      {
        targetId: "vite-file-canary",
        kind: "path",
        rootPath: "/tmp/p2-tool",
        relativePath: "canary/input.txt",
      },
      {
        targetId: "vite-source-snapshot",
        kind: "path",
        rootPath: "/opt/p2/input/packages/vite-plugin-probe",
        relativePath: "fixture/designated.ts",
      },
      {
        targetId: "vite-direct-output",
        kind: "path",
        rootPath: "/tmp/p2-direct-write",
        relativePath: "direct-write-marker.json",
      },
      {
        targetId: "vite-loopback",
        kind: "loopback-http",
        address: "127.0.0.1",
        port: 4321,
      },
      { targetId: "vite-fixed-child", kind: "fixed-child" },
    ]);
  });

  it("rejects every exact version mismatch", () => {
    expect(() =>
      assertFixedVersionValues("v20.18.1", "6.4.3", "4.62.2", "0.25.12"),
    ).toThrowError("M2D_VERSION_MISMATCH");
    expect(() =>
      assertFixedVersionValues("v20.18.2", "6.4.2", "4.62.2", "0.25.12"),
    ).toThrowError("M2D_VERSION_MISMATCH");
    expect(() =>
      assertFixedVersionValues("v20.18.2", "6.4.3", "4.62.1", "0.25.12"),
    ).toThrowError("M2D_VERSION_MISMATCH");
    expect(() =>
      assertFixedVersionValues("v20.18.2", "6.4.3", "4.62.2", "0.25.11"),
    ).toThrowError("M2D_VERSION_MISMATCH");
  });

  it("uses strict ESM package metadata with a direct Vite pin", async () => {
    const packageJson = JSON.parse(
      await readFile(`${FIXED_ADAPTER_ROOT}/package.json`, "utf8"),
    ) as {
      type: string;
      private: boolean;
      dependencies: Record<string, string>;
    };
    expect(packageJson).toMatchObject({ type: "module", private: true });
    expect(packageJson.dependencies).toEqual({
      "@tskaigi-lab/probe-core": "0.0.0",
      vite: "6.4.3",
    });
  });
});
