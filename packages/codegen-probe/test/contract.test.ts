import { describe, expect, it } from "vitest";

import {
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_PRODUCER_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  ROUTE_IDS,
  TOOL_API_CHANGE_ID,
  VARIANTS,
} from "../src/constants.js";
import {
  createFixedManifest,
  createSelectedProfileRuntimeBindings,
  validateManifestContract,
} from "../src/manifest.js";

describe("M2-E fixed explicit CLI contract", () => {
  it("pins variants, route order, and counts", () => {
    expect(VARIANTS).toEqual(["observe", "api", "dry-run"]);
    expect(Object.values(ROUTE_IDS)).toHaveLength(5);
    expect(TOOL_API_CHANGE_ID).toBe("codegen-generation-api-change");
    expect({
      route: EXPECTED_ROUTE_COUNT,
      capability: EXPECTED_CAPABILITY_COUNT,
      tool: EXPECTED_TOOL_API_CHANGE_COUNT,
      total: EXPECTED_EVENT_COUNT,
      producer: EXPECTED_PRODUCER_COUNT,
    }).toEqual({ route: 5, capability: 6, tool: 1, total: 12, producer: 1 });
    expect(EXPECTED_EVENT_ORDER).toHaveLength(12);
  });

  it("keeps all route definitions explicit and toggles only direct write", () => {
    for (const variant of VARIANTS) {
      const manifest = createFixedManifest(
        variant,
        `m2e-codegen-${variant}-00000000000000000000000000000000`,
      );
      validateManifestContract(manifest, variant);
      expect(
        manifest.routeInvocations.every(
          (route) => route.triggerType === "explicit",
        ),
      ).toBe(true);
      expect(manifest.attempts[3]?.enabled).toBe(variant === "observe");
      expect(manifest.toolApiChanges[0]?.enabled).toBe(true);
    }
  });

  it("separates selected event, tool, source, and direct-write roots", () => {
    const bindings = createSelectedProfileRuntimeBindings(4321).bindings;
    expect(bindings).toEqual([
      {
        targetId: "codegen-event-segment",
        kind: "path",
        rootPath: "/tmp/p2-result",
        relativePath: "codegen-cli-producer.jsonl",
      },
      { targetId: "codegen-environment-canary", kind: "environment" },
      {
        targetId: "codegen-file-canary",
        kind: "path",
        rootPath: "/tmp/p2-tool",
        relativePath: "canary/input.txt",
      },
      {
        targetId: "codegen-input-snapshot",
        kind: "path",
        rootPath: "/opt/p2/input",
        relativePath: "input-snapshot.txt",
      },
      {
        targetId: "codegen-direct-output",
        kind: "path",
        rootPath: "/tmp/p2-direct-write",
        relativePath: "direct-write-marker.json",
      },
      {
        targetId: "codegen-loopback",
        kind: "loopback-http",
        address: "127.0.0.1",
        port: 4321,
      },
      { targetId: "codegen-fixed-child", kind: "fixed-child" },
    ]);
  });
});
