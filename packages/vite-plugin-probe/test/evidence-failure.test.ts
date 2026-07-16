import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ASSET_OUTPUT_FILE,
  BUNDLE_MUTATION_LITERAL,
  EMITTED_ASSET_CONTENT,
  ENTRY_OUTPUT_FILE,
  TRANSFORMED_LITERAL,
} from "../src/constants.js";
import {
  assertRawDataPolicy,
  parseAndValidateSegment,
  validateMaterializedOutputs,
} from "../src/evidence.js";
import { getIntegrationRuns } from "./integration-fixture.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("fail-closed evidence validation", () => {
  it.each(["missing", "extra", "reordered"])(
    "rejects %s event sequence",
    async (mode) => {
      const result = (await getIntegrationRuns()).observe[0];
      const lines = result.rawSegment.trimEnd().split("\n");
      if (mode === "missing") {
        lines.pop();
      } else if (mode === "extra") {
        lines.push(lines[0] ?? "");
      } else {
        [lines[2], lines[3]] = [lines[3] ?? "", lines[2] ?? ""];
      }
      expect(() =>
        parseAndValidateSegment(
          `${lines.join("\n")}\n`,
          result.manifest,
          "observe",
          result.coordinatorPid,
          process.pid,
          [],
        ),
      ).toThrow();
    },
  );

  it("rejects raw path/source/code/output/error/reference data", () => {
    for (const forbidden of [
      "/tmp/private",
      "/home/private",
      '"stack"',
      '"stdout"',
      '"stderr"',
      '"moduleId"',
      '"referenceId"',
      EMITTED_ASSET_CONTENT,
    ]) {
      expect(() => assertRawDataPolicy(`${forbidden}\n`, [])).toThrowError(
        "M2D_DATA_POLICY_VIOLATION",
      );
    }
  });

  it("rejects API result and disk materialization mismatch", async () => {
    const result = (await getIntegrationRuns()).api[0];
    const runRoot = await mkdtemp("/tmp/tskaigi-m2d-output-test-");
    roots.push(runRoot);
    const outDir = path.join(runRoot, "out");
    await mkdir(outDir);
    await writeFile(
      path.join(outDir, ENTRY_OUTPUT_FILE),
      `${TRANSFORMED_LITERAL}\n${BUNDLE_MUTATION_LITERAL}\n`,
    );
    await writeFile(
      path.join(outDir, ASSET_OUTPUT_FILE),
      EMITTED_ASSET_CONTENT,
    );
    await expect(
      validateMaterializedOutputs(runRoot, outDir, "api", result.events),
    ).rejects.toThrowError("M2D_OUTPUT_INVALID");
  });

  it("rejects unexpected output inventory", async () => {
    const result = (await getIntegrationRuns()).observe[0];
    const runRoot = await mkdtemp("/tmp/tskaigi-m2d-output-test-");
    roots.push(runRoot);
    const outDir = path.join(runRoot, "out");
    await mkdir(outDir);
    await writeFile(path.join(outDir, ENTRY_OUTPUT_FILE), "fixed entry\n");
    await writeFile(path.join(outDir, "unexpected.js"), "unexpected\n");
    await expect(
      validateMaterializedOutputs(runRoot, outDir, "observe", result.events),
    ).rejects.toThrowError("M2D_OUTPUT_INVALID");
  });
});
