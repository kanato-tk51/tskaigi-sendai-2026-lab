import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  createFixedCodegenInvocation,
  resolveFixedCodegenScenario,
} from "../runner/codegen-runner.js";

describe("P2 fixed codegen runner", () => {
  it("accepts only the two selected codegen scenarios", () => {
    expect(resolveFixedCodegenScenario("codegen-observe-p")).toEqual({
      scenarioId: "codegen-observe-p",
      profileId: "permissive",
      runId: "p2-codegen-observe-p-20260719-01",
    });
    expect(resolveFixedCodegenScenario("codegen-observe-c")).toEqual({
      scenarioId: "codegen-observe-c",
      profileId: "constrained",
      runId: "p2-codegen-observe-c-20260719-01",
    });
    expect(() => resolveFixedCodegenScenario("vite-observe-p")).toThrow(
      "P2_SCENARIO_INVALID",
    );
    expect(() => resolveFixedCodegenScenario("codegen-observe-api")).toThrow(
      "P2_SCENARIO_INVALID",
    );
  });

  it("exposes the environment canary only to the permissive child", () => {
    const permissive = createFixedCodegenInvocation(
      resolveFixedCodegenScenario("codegen-observe-p"),
    );
    const constrained = createFixedCodegenInvocation(
      resolveFixedCodegenScenario("codegen-observe-c"),
    );
    expect(Object.keys(permissive.environment).sort()).toEqual([
      "PROBE_CANARY_M2E_ENVIRONMENT",
      "PROBE_CANARY_M2E_LOOPBACK_PORT",
      "PROBE_CANARY_M2E_RUN_ID",
      "PROBE_CANARY_M2E_RUN_ROOT",
      "PROBE_CANARY_M2E_SCENARIO_ID",
      "PROBE_CANARY_M2E_VARIANT",
    ]);
    expect(Object.keys(constrained.environment).sort()).toEqual([
      "PROBE_CANARY_M2E_LOOPBACK_PORT",
      "PROBE_CANARY_M2E_RUN_ID",
      "PROBE_CANARY_M2E_RUN_ROOT",
      "PROBE_CANARY_M2E_SCENARIO_ID",
      "PROBE_CANARY_M2E_VARIANT",
    ]);
    expect(constrained.environment).not.toHaveProperty(
      "PROBE_CANARY_M2E_ENVIRONMENT",
    );
  });

  it("uses only the fixed Node command and repeated constrained permissions", () => {
    const permissive = createFixedCodegenInvocation(
      resolveFixedCodegenScenario("codegen-observe-p"),
    );
    const constrained = createFixedCodegenInvocation(
      resolveFixedCodegenScenario("codegen-observe-c"),
    );
    expect(permissive).toMatchObject({
      executable: "/usr/local/bin/node",
      arguments: ["/opt/p2/input/codegen/dist/cli.js", "observe"],
      cwd: "/opt/p2/input/codegen",
      shell: false,
    });
    expect(constrained.arguments).toEqual([
      "--experimental-permission",
      "--allow-fs-read=/opt/p2/input",
      "--allow-fs-read=/tmp/p2-result",
      "--allow-fs-read=/tmp/p2-tool",
      "--allow-fs-read=/tmp/p2-direct-write",
      "--allow-fs-write=/tmp/p2-result",
      "--allow-fs-write=/tmp/p2-direct-write",
      "/opt/p2/input/codegen/dist/cli.js",
      "observe",
    ]);
    expect(constrained.arguments).not.toContain("--allow-child-process");
    expect(
      constrained.arguments.every((argument) => !argument.includes(",")),
    ).toBe(true);
  });

  it("has import-safe static boundaries and a fixed source snapshot", async () => {
    const [source, snapshot] = await Promise.all([
      readFile(new URL("../runner/codegen-runner.js", import.meta.url), "utf8"),
      readFile(
        new URL("../runner/codegen-input-snapshot.txt", import.meta.url),
        "utf8",
      ),
    ]);
    expect(snapshot).toBe("m2e input snapshot\n");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("docker.sock");
    expect(source).not.toContain("0.0.0.0");
    expect(source).not.toContain("https:");
    expect(source).toContain('const FIXED_LOOPBACK_ADDRESS = "127.0.0.1"');
    expect(source).toContain("import.meta.url ===");
    expect(source).toContain("shell: false");
    expect(source).toContain("await chmod(FIXED_EVENT_SEGMENT, 0o444)");
    expect(source).toContain("sourceBeforeHash");
    expect(source).toContain("sourceAfterHash");
  });
});
