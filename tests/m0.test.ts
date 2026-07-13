import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertScenarioId,
  assertOutputFilePath,
  buildContainerCreateArgs,
  OUTPUT_BUNDLE_PREFIX,
  parseOutputBundle,
  resolveResultPath,
  sanitizeText,
  SCENARIO_IDS,
  validateContainerInspection,
  validateSummary,
} from "../experiments/npm12-install/scripts/lib.mjs";
import { verifyStaticSafety } from "../experiments/npm12-install/scripts/verify-static.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

function validInspection(): unknown[] {
  return [
    {
      Config: { User: "1000:1000" },
      HostConfig: {
        NetworkMode: "none",
        ReadonlyRootfs: true,
        Privileged: false,
        CapDrop: ["ALL"],
        CapAdd: [],
        SecurityOpt: ["no-new-privileges"],
        Binds: null,
        Tmpfs: {
          "/work": "rw,nosuid,nodev,noexec",
          "/tmp": "rw,nosuid,nodev,noexec",
          "/m0-output": "rw,nosuid,nodev,noexec",
        },
      },
      Mounts: [],
    },
  ];
}

describe("M0 marker-only fixture", () => {
  it("passes the complete static safety verification", async () => {
    const result = await verifyStaticSafety();
    expect(result).toMatchObject({ status: "success", failures: [] });
    expect(result.limitations).toContain(
      "A human must review the complete lifecycle script and Docker boundary before execution.",
    );
  });

  it("keeps the consumer outside the root workspace and root lifecycle", async () => {
    const rootPackage = JSON.parse(
      await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
    ) as {
      workspaces?: unknown;
      scripts?: Record<string, string>;
    };
    expect(rootPackage.workspaces).toEqual(["packages/*"]);
    for (const lifecycle of [
      "preinstall",
      "install",
      "postinstall",
      "prepare",
      "prepack",
      "postpack",
    ]) {
      expect(rootPackage.scripts?.[lifecycle]).toBeUndefined();
    }
  });

  it("uses the local tarball as the consumer's only dependency", async () => {
    const consumer = JSON.parse(
      await readFile(
        path.join(
          repositoryRoot,
          "experiments/npm12-install/consumer/package.json",
        ),
        "utf8",
      ),
    ) as { dependencies?: Record<string, string> };
    expect(consumer.dependencies).toEqual({
      "@tskaigi-lab/m0-install-marker":
        "file:../input/m0-install-marker-1.0.0.tgz",
    });
  });
});

describe("M0 input and path policy", () => {
  it("rejects invalid scenario IDs", () => {
    expect(() => assertScenarioId("../../escape")).toThrow(
      "Invalid M0 scenario ID",
    );
    expect(assertScenarioId("approved-ci")).toBe("approved-ci");
  });

  it("rejects result path traversal", () => {
    expect(() => resolveResultPath(repositoryRoot, "../../escape")).toThrow(
      "Unsafe M0 run ID",
    );
    expect(
      resolveResultPath(repositoryRoot, "m0-20260714t010203z-abcdef12"),
    ).toBe(
      path.join(repositoryRoot, "results/runs/m0/m0-20260714t010203z-abcdef12"),
    );
    expect(() => assertOutputFilePath("../escape.json")).toThrow(
      "Unsafe M0 output path",
    );
  });
});

describe("M0 Docker boundary", () => {
  it("constructs only the fixed create arguments", () => {
    const arguments_ = buildContainerCreateArgs({
      containerName: "m0-static-approved-ci",
      mode: "scenario",
      scenarioId: "approved-ci",
    });
    expect(arguments_.slice(0, 10)).toEqual([
      "create",
      "--name",
      "m0-static-approved-ci",
      "--network",
      "none",
      "--read-only",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
    ]);
    expect(arguments_).toContain("1000:1000");
    expect(arguments_).toContain("--pull");
    expect(arguments_).toContain("never");
    expect(arguments_).toContain("/opt/m0/container/run-scenario.mjs");
    expect(arguments_).not.toContain("--mount");
    expect(arguments_).not.toContain("--volume");
    expect(arguments_.join(" ")).not.toContain("docker.sock");
    expect(SCENARIO_IDS).toHaveLength(5);
  });

  it("validates inspection policy and rejects a bind mount", () => {
    expect(validateContainerInspection(validInspection())).toEqual([]);
    const invalid = validInspection() as Array<{
      HostConfig: { Binds: string[] | null };
      Mounts: Array<{ Type: string; Source: string; Destination: string }>;
    }>;
    invalid[0]!.HostConfig.Binds = ["/home/user:/work"];
    invalid[0]!.Mounts = [
      { Type: "bind", Source: "/home/user", Destination: "/work" },
    ];
    expect(validateContainerInspection(invalid)).toEqual(
      expect.arrayContaining([
        "runtime container must not have bind mounts",
        "host home must not be mounted",
      ]),
    );
  });

  it("uses a fixed, integrity-checked output bundle for tmpfs evidence", async () => {
    const containerRunner = await readFile(
      path.join(
        repositoryRoot,
        "experiments/npm12-install/container/run-scenario.mjs",
      ),
      "utf8",
    );
    const hostRunner = await readFile(
      path.join(repositoryRoot, "experiments/npm12-install/scripts/m0.mjs"),
      "utf8",
    );
    expect(containerRunner).toContain('path.join(OUTPUT_ROOT, ".ready.json")');
    expect(containerRunner).toContain("OUTPUT_BUNDLE_PREFIX");
    expect(containerRunner).toContain(
      'directory === OUTPUT_ROOT && entry.name === "marker.jsonl"',
    );
    expect(containerRunner).toContain(
      'path.join(OUTPUT_ROOT, ".command-state.json")',
    );
    expect(containerRunner).toContain('child.kill("SIGKILL")');
    expect(containerRunner).toContain("child.stdout.destroy()");
    expect(containerRunner).toContain('child.on("exit"');
    expect(containerRunner).toContain('"help-approve-scripts"');
    expect(hostRunner).toContain("parseOutputBundle(start.rawStdout");
    expect(hostRunner).toContain('["start", "--attach", containerName]');
    expect(hostRunner).not.toContain('arguments: ["cp"');

    const contents = Buffer.from("evidence\n", "utf8");
    const crypto = await import("node:crypto");
    const bundle = {
      schemaVersion: 1,
      mode: "scenario",
      scenarioId: "approved-ci",
      outputComplete: true,
      files: [
        {
          path: "scenarios/approved-ci/result.json",
          encoding: "base64",
          content: contents.toString("base64"),
          sha256: `sha256:${crypto.createHash("sha256").update(contents).digest("hex")}`,
        },
      ],
    };
    const framed = `${OUTPUT_BUNDLE_PREFIX}${Buffer.from(JSON.stringify(bundle)).toString("base64")}\n`;
    const parsed = parseOutputBundle(framed, {
      mode: "scenario",
      scenarioId: "approved-ci",
    });
    expect(parsed.decodedFiles[0]?.contents.toString("utf8")).toBe(
      "evidence\n",
    );
    bundle.files[0]!.path = ".unexpected.json";
    const unsafeFrame = `${OUTPUT_BUNDLE_PREFIX}${Buffer.from(JSON.stringify(bundle)).toString("base64")}\n`;
    expect(() =>
      parseOutputBundle(unsafeFrame, {
        mode: "scenario",
        scenarioId: "approved-ci",
      }),
    ).toThrow("outside its fixed mode path");
  });
});

describe("M0 result safety", () => {
  it("sanitizes host paths, ANSI, cache paths, and container IDs", () => {
    const containerId = "a".repeat(64);
    const raw = `\u001b[31m${repositoryRoot}/x /home/example/secret /work/npm-cache ${containerId}\u001b[0m`;
    const sanitized = sanitizeText(raw, { repositoryRoot });
    expect(sanitized).toContain("<repo>/x");
    expect(sanitized).toContain("<home>/secret");
    expect(sanitized).toContain("<npm-cache>");
    expect(sanitized).toContain("<container-id>");
    expect(sanitized).not.toContain("\u001b");
  });

  it("validates the M0 summary shape and schema revision", async () => {
    const schema = JSON.parse(
      await readFile(
        path.join(
          repositoryRoot,
          "experiments/npm12-install/schema/summary.schema.json",
        ),
        "utf8",
      ),
    ) as { properties?: { schemaVersion?: { const?: number } } };
    const summary = {
      schemaVersion: 1,
      runId: "example",
      status: "success",
      toolchain: {
        node: "v24.18.0",
        npm: "12.0.1",
        baseImage: "node:24.18.0-bookworm-slim",
        imageDigest: `sha256:${"b".repeat(64)}`,
        containerRuntime: "Docker 29.0.0",
      },
      scenarios: [
        {
          scenarioId: "approved-ci",
          status: "success",
          expected: "hypothesis",
          setupSteps: [],
          measuredCommand: null,
          exitCode: 0,
          markerPresent: true,
          markerCount: 1,
          approvalEntryBefore: null,
          approvalEntryAfter: { package: true },
          packageLockHashBefore: null,
          packageLockHashAfter: null,
          observedResult: "observation",
          limitations: [],
          evidencePaths: {},
        },
      ],
    };
    expect(schema.properties?.schemaVersion?.const).toBe(1);
    expect(validateSummary(summary)).toEqual([]);
    expect(validateSummary({ ...summary, schemaVersion: 2 })).toContain(
      "schemaVersion must be 1",
    );
  });
});
