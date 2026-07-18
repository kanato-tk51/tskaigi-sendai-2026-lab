import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseCliArguments } from "../src/cli.js";
import { FIXED_SCENARIO_ID } from "../src/constants.js";
import {
  regenerateFixedScenarioInOwnedRoot,
  runFixedScenarioInOwnedRoot,
} from "../src/runner.js";
import { validateScenarioDefinition } from "../src/scenario.js";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("M3 fixed scenario dispatch", () => {
  it("loads the versioned fixed scenario and rejects command/path expansion", async () => {
    const source = await readFile(
      path.join(repositoryRoot, "scenarios", `${FIXED_SCENARIO_ID}.json`),
      "utf8",
    );
    expect(validateScenarioDefinition(JSON.parse(source))).toMatchObject({
      scenarioId: FIXED_SCENARIO_ID,
      evidenceClass: "contract-fixture",
      profileId: "not-applicable",
      expected: {
        attemptOutcomes: [],
        toolChangeOutcomes: [],
        hashDeltas: [],
      },
    });
    expect(parseCliArguments(["run", FIXED_SCENARIO_ID])).toEqual({
      command: "run",
      scenarioId: FIXED_SCENARIO_ID,
    });
    expect(() => parseCliArguments(["run", "../other"])).toThrow();
    expect(() =>
      parseCliArguments(["run", FIXED_SCENARIO_ID, "--output", "/tmp/out"]),
    ).toThrow();

    const expanded = JSON.parse(source) as Record<string, unknown>;
    expanded.command = "node";
    expect(() => validateScenarioDefinition(expanded)).toThrow();
  });

  it("persists only the fixed synthetic contract run under an owned root", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-runner-");
    try {
      const canonicalRoot = await realpath(temporaryRoot);
      const result = await runFixedScenarioInOwnedRoot(
        canonicalRoot,
        "m3-runner-test",
      );
      expect(result).toEqual({
        runId: "m3-runner-test",
        scenarioId: FIXED_SCENARIO_ID,
        validity: "complete",
        evidenceLocation: "results/runs/m3-harness/m3-runner-test",
      });
      const runRoot = path.join(canonicalRoot, "m3-runner-test");
      expect((await readdir(runRoot)).sort()).toEqual([
        "comparison.md",
        "events.jsonl",
        "hashes.json",
        "manifest.snapshot.json",
        "run-completion.snapshot.json",
        "run-metadata.json",
        "segments",
        "summary.json",
      ]);
      expect((await readdir(path.join(runRoot, "segments"))).sort()).toEqual([
        "producer-a.jsonl",
        "producer-b.jsonl",
      ]);
      const metadata = await readFile(
        path.join(runRoot, "run-metadata.json"),
        "utf8",
      );
      const summary = await readFile(
        path.join(runRoot, "summary.json"),
        "utf8",
      );
      const comparison = await readFile(
        path.join(runRoot, "comparison.md"),
        "utf8",
      );
      expect(`${metadata}${summary}${comparison}`).not.toContain(canonicalRoot);
      expect(metadata).toContain('"causalOrder": false');

      const derivedNames = [
        "events.jsonl",
        "run-metadata.json",
        "summary.json",
        "comparison.md",
        "hashes.json",
      ];
      const originalDerived = new Map(
        await Promise.all(
          derivedNames.map(
            async (name) =>
              [
                name,
                (await readFile(path.join(runRoot, name))).toString("hex"),
              ] as const,
          ),
        ),
      );
      const originalRaw = new Map(
        await Promise.all(
          ["producer-a.jsonl", "producer-b.jsonl"].map(
            async (name) =>
              [
                name,
                (await readFile(path.join(runRoot, "segments", name))).toString(
                  "hex",
                ),
              ] as const,
          ),
        ),
      );
      await Promise.all(
        derivedNames.map((name) => rm(path.join(runRoot, name))),
      );
      const regenerated = await regenerateFixedScenarioInOwnedRoot(
        canonicalRoot,
        "m3-runner-test",
      );
      expect(regenerated.validity).toBe("complete");
      for (const name of derivedNames) {
        expect((await readFile(path.join(runRoot, name))).toString("hex")).toBe(
          originalDerived.get(name),
        );
      }
      for (const name of ["producer-a.jsonl", "producer-b.jsonl"]) {
        expect(
          (await readFile(path.join(runRoot, "segments", name))).toString(
            "hex",
          ),
        ).toBe(originalRaw.get(name));
      }
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("fails closed when the immutable completion snapshot is tampered", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-completion-");
    try {
      const canonicalRoot = await realpath(temporaryRoot);
      await runFixedScenarioInOwnedRoot(canonicalRoot, "m3-completion-tamper");
      const runRoot = path.join(canonicalRoot, "m3-completion-tamper");
      await Promise.all(
        [
          "events.jsonl",
          "run-metadata.json",
          "summary.json",
          "comparison.md",
          "hashes.json",
        ].map((name) => rm(path.join(runRoot, name))),
      );
      const completionPath = path.join(runRoot, "run-completion.snapshot.json");
      const completion = JSON.parse(
        await readFile(completionPath, "utf8"),
      ) as Record<string, unknown>;
      completion.unexpected = true;
      await writeFile(
        completionPath,
        `${JSON.stringify(completion, null, 2)}\n`,
        "utf8",
      );
      await expect(
        regenerateFixedScenarioInOwnedRoot(
          canonicalRoot,
          "m3-completion-tamper",
        ),
      ).rejects.toMatchObject({ code: "INVALID_RUN_COMPLETION" });
      expect((await readdir(runRoot)).sort()).toEqual([
        "manifest.snapshot.json",
        "run-completion.snapshot.json",
        "segments",
      ]);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("regenerates an incomplete persisted run without success artifacts", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-incomplete-");
    try {
      const canonicalRoot = await realpath(temporaryRoot);
      await runFixedScenarioInOwnedRoot(canonicalRoot, "m3-incomplete-run");
      const runRoot = path.join(canonicalRoot, "m3-incomplete-run");
      await Promise.all(
        [
          "events.jsonl",
          "run-metadata.json",
          "summary.json",
          "comparison.md",
          "hashes.json",
        ].map((name) => rm(path.join(runRoot, name))),
      );
      const completionPath = path.join(runRoot, "run-completion.snapshot.json");
      const completion = JSON.parse(
        await readFile(completionPath, "utf8"),
      ) as Record<string, unknown>;
      completion.timedOut = true;
      await writeFile(
        completionPath,
        `${JSON.stringify(completion, null, 2)}\n`,
        "utf8",
      );
      const result = await regenerateFixedScenarioInOwnedRoot(
        canonicalRoot,
        "m3-incomplete-run",
      );
      expect(result.validity).toBe("inconclusive");
      const metadata = JSON.parse(
        await readFile(path.join(runRoot, "run-metadata.json"), "utf8"),
      ) as {
        readonly errorCodes: readonly string[];
        readonly timedOut: boolean;
      };
      expect(metadata.errorCodes).toEqual(["RUN_TIMEOUT"]);
      expect(metadata.timedOut).toBe(true);
      expect((await readdir(runRoot)).sort()).toEqual([
        "manifest.snapshot.json",
        "run-completion.snapshot.json",
        "run-metadata.json",
        "segments",
        "summary.json",
      ]);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("rejects symlinked raw input and unexpected run inventory", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-input-boundary-");
    const derivedNames = [
      "events.jsonl",
      "run-metadata.json",
      "summary.json",
      "comparison.md",
      "hashes.json",
    ];
    try {
      const canonicalRoot = await realpath(temporaryRoot);
      await runFixedScenarioInOwnedRoot(canonicalRoot, "m3-input-symlink");
      const symlinkRun = path.join(canonicalRoot, "m3-input-symlink");
      await Promise.all(
        derivedNames.map((name) => rm(path.join(symlinkRun, name))),
      );
      const completionPath = path.join(
        symlinkRun,
        "run-completion.snapshot.json",
      );
      await rm(completionPath);
      await symlink("manifest.snapshot.json", completionPath);
      await expect(
        regenerateFixedScenarioInOwnedRoot(canonicalRoot, "m3-input-symlink"),
      ).rejects.toMatchObject({ code: "INPUT_FILE_INVALID" });

      await runFixedScenarioInOwnedRoot(canonicalRoot, "m3-input-inventory");
      const inventoryRun = path.join(canonicalRoot, "m3-input-inventory");
      await Promise.all(
        derivedNames.map((name) => rm(path.join(inventoryRun, name))),
      );
      await writeFile(path.join(inventoryRun, "unexpected.txt"), "x", "utf8");
      await expect(
        regenerateFixedScenarioInOwnedRoot(canonicalRoot, "m3-input-inventory"),
      ).rejects.toMatchObject({ code: "INPUT_INVENTORY_INVALID" });
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("rejects a symlinked output boundary before creating a run", async () => {
    const temporaryRoot = await mkdtemp("/tmp/tskaigi-m3-symlink-");
    try {
      const actualRoot = path.join(temporaryRoot, "actual");
      const aliasRoot = path.join(temporaryRoot, "alias");
      await mkdir(actualRoot);
      await symlink(actualRoot, aliasRoot, "dir");
      await expect(
        runFixedScenarioInOwnedRoot(aliasRoot, "m3-symlink-test"),
      ).rejects.toMatchObject({ code: "OUTPUT_BOUNDARY_INVALID" });
      expect(await readdir(actualRoot)).toEqual([]);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
});
