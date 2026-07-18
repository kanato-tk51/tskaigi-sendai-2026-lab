import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createFixedSelectedScenarioPlans,
  FIXED_CONTAINER_USER,
  FIXED_DOCKER_EXECUTABLE,
  FIXED_NODE_IMAGE,
} from "../src/plan.js";

function argumentValue(arguments_: readonly string[], option: string): string {
  const index = arguments_.indexOf(option);
  const value = arguments_[index + 1];
  if (index < 0 || value === undefined) {
    throw new Error(`missing fixed option: ${option}`);
  }
  return value;
}

describe("P2 selected profile plan", () => {
  it("fixes exactly four scenarios in presentation order", () => {
    const plans = createFixedSelectedScenarioPlans();
    expect(plans.map((plan) => plan.scenarioId)).toEqual([
      "vite-observe-p",
      "vite-observe-c",
      "codegen-observe-p",
      "codegen-observe-c",
    ]);
    expect(plans.map((plan) => plan.expectedCounts)).toEqual([
      { route: 6, capability: 6, toolApiChange: 3, total: 15 },
      { route: 6, capability: 6, toolApiChange: 3, total: 15 },
      { route: 5, capability: 6, toolApiChange: 1, total: 12 },
      { route: 5, capability: 6, toolApiChange: 1, total: 12 },
    ]);
  });

  it("keeps image, staging, and semantic command identical within each pair", () => {
    const [viteP, viteC, codegenP, codegenC] =
      createFixedSelectedScenarioPlans();
    expect(viteP).toBeDefined();
    expect(viteC).toBeDefined();
    expect(codegenP).toBeDefined();
    expect(codegenC).toBeDefined();
    expect(viteP?.image).toBe(FIXED_NODE_IMAGE);
    expect(viteC?.image).toBe(viteP?.image);
    expect(viteC?.stagingRoot).toBe(viteP?.stagingRoot);
    expect(viteC?.semanticCommand).toEqual(viteP?.semanticCommand);
    expect(codegenC?.image).toBe(codegenP?.image);
    expect(codegenC?.stagingRoot).toBe(codegenP?.stagingRoot);
    expect(codegenC?.semanticCommand).toEqual(codegenP?.semanticCommand);
    expect(viteP?.resultRoot).not.toBe(viteC?.resultRoot);
    expect(codegenP?.resultRoot).not.toBe(codegenC?.resultRoot);
  });

  it("creates only fixed offline non-root read-only Docker plans", () => {
    for (const plan of createFixedSelectedScenarioPlans()) {
      const command = plan.create;
      expect(command.executable).toBe(FIXED_DOCKER_EXECUTABLE);
      expect(command.shell).toBe(false);
      expect(command.arguments[0]).toBe("create");
      expect(argumentValue(command.arguments, "--pull")).toBe("never");
      expect(argumentValue(command.arguments, "--network")).toBe("none");
      expect(argumentValue(command.arguments, "--user")).toBe(
        FIXED_CONTAINER_USER,
      );
      expect(command.arguments).toContain("--read-only");
      expect(argumentValue(command.arguments, "--cap-drop")).toBe("ALL");
      expect(argumentValue(command.arguments, "--security-opt")).toBe(
        "no-new-privileges",
      );
      expect(command.arguments).toContain(FIXED_NODE_IMAGE);
      expect(command.arguments.at(-1)).toBe(plan.scenarioId);
      expect(Object.keys(command.environment)).toEqual(["DOCKER_CONFIG"]);
      expect(path.isAbsolute(command.environment.DOCKER_CONFIG)).toBe(true);
      expect(
        command.environment.DOCKER_CONFIG.startsWith(plan.resultRoot),
      ).toBe(true);
      expect(command.arguments.join(" ")).not.toContain("docker.sock");
      expect(command.arguments).not.toContain("--privileged");
      expect(command.arguments).not.toContain("--network=host");
    }
  });

  it("mounts only fixed staging and three separated run-owned outputs", () => {
    for (const plan of createFixedSelectedScenarioPlans()) {
      const mounts = plan.create.arguments.filter(
        (value, index, values) => index > 0 && values[index - 1] === "--mount",
      );
      expect(mounts).toHaveLength(4);
      expect(mounts[0]).toBe(
        `type=bind,src=${plan.stagingRoot},dst=/opt/p2/input,readonly`,
      );
      expect(mounts.slice(1)).toEqual([
        `type=bind,src=${path.join(plan.resultRoot, "result")},dst=/tmp/p2-result`,
        `type=bind,src=${path.join(plan.resultRoot, "tool")},dst=/tmp/p2-tool`,
        `type=bind,src=${path.join(plan.resultRoot, "direct-write")},dst=/tmp/p2-direct-write${plan.profileId === "constrained" ? ",readonly" : ""}`,
      ]);
    }
  });

  it("returns a closed API with no caller-provided runtime inputs", () => {
    expect(createFixedSelectedScenarioPlans.length).toBe(0);
    const plans = createFixedSelectedScenarioPlans();
    expect(Object.isFrozen(plans)).toBe(true);
    expect(plans.every(Object.isFrozen)).toBe(true);
    expect(plans.every((plan) => Object.isFrozen(plan.create.arguments))).toBe(
      true,
    );
  });
});
