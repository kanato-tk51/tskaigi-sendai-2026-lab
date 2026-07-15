import {
  createProbeSession,
  prepareProbeConfiguration,
  validateProbeConfiguration,
} from "@tskaigi-lab/probe-core";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  CANARY_FILE_CONTENT,
  CANARY_RELATIVE_PATH,
  DISPOSABLE_CANARY_VALUE,
  SEGMENT_RELATIVE_PATH,
  SOURCE_COPY_RELATIVE_PATH,
  SOURCE_TARGET_CONTENT,
} from "../src/constants.js";
import {
  createFixedProvidedContext,
  validateFixedProvidedContext,
} from "../src/context.js";
import {
  assertSingleProducer,
  parseAndValidateSegment,
  assertRawDataPolicy,
} from "../src/evidence.js";
import { AdapterError, preservePrimaryFailure } from "../src/errors.js";
import { runFixedVitestScenario } from "../src/scenario.js";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("M2-C failure coverage", () => {
  it("rejects missing setup context and invalid binding", () => {
    expect(() => validateFixedProvidedContext(undefined)).toThrowError(
      expect.objectContaining({ code: "M2C_CONTEXT_MISSING" }),
    );
    const context = createFixedProvidedContext(
      "m2c-vitest-33333333333333333333333333333333",
      "/tmp/tskaigi-vitest-m2c-invalid-binding",
      1,
    );
    const bindings = context.runtimeBindings.bindings.map((binding, index) =>
      index === 0 && binding.kind === "path"
        ? { ...binding, relativePath: "unexpected.jsonl" }
        : binding,
    );
    expect(() =>
      validateFixedProvidedContext({
        ...context,
        runtimeBindings: { ...context.runtimeBindings, bindings },
      }),
    ).toThrowError(expect.objectContaining({ code: "M2C_BINDING_INVALID" }));
  });

  it("does not convert pre-checkpoint bootstrap failures into a valid zero-route observation", async () => {
    const missingContextRoot = await mkdtemp(
      "/tmp/tskaigi-vitest-m2c-missing-context-",
    );
    temporaryRoots.push(missingContextRoot);
    expect(() => validateFixedProvidedContext(undefined)).toThrowError(
      expect.objectContaining({ code: "M2C_CONTEXT_MISSING" }),
    );
    await expect(
      access(path.join(missingContextRoot, SEGMENT_RELATIVE_PATH)),
    ).rejects.toBeDefined();

    const preparationRoot = await mkdtemp(
      "/tmp/tskaigi-vitest-m2c-preparation-failure-",
    );
    temporaryRoots.push(preparationRoot);
    await Promise.all([
      mkdir(path.join(preparationRoot, "fixture"), { recursive: true }),
      mkdir(path.join(preparationRoot, "output"), { recursive: true }),
    ]);
    await writeFile(
      path.join(preparationRoot, CANARY_RELATIVE_PATH),
      CANARY_FILE_CONTENT,
    );
    const preparationContext = createFixedProvidedContext(
      "m2c-vitest-55555555555555555555555555555555",
      preparationRoot,
      1,
    );
    await expect(
      prepareProbeConfiguration(
        validateProbeConfiguration(
          preparationContext.manifest,
          preparationContext.runtimeBindings,
        ),
      ),
    ).rejects.toMatchObject({ code: "FILE_NOT_FOUND" });
    await expect(
      access(path.join(preparationRoot, SEGMENT_RELATIVE_PATH)),
    ).rejects.toBeDefined();
    expect(() =>
      parseAndValidateSegment("", preparationContext.manifest, process.pid, []),
    ).toThrowError(expect.objectContaining({ code: "M2C_SEGMENT_INVALID" }));
  });

  it("treats an existing segment as a write failure", async () => {
    const root = await mkdtemp("/tmp/tskaigi-vitest-m2c-segment-failure-");
    temporaryRoots.push(root);
    await Promise.all([
      mkdir(path.join(root, "fixture"), { recursive: true }),
      mkdir(path.join(root, "output"), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(path.join(root, CANARY_RELATIVE_PATH), CANARY_FILE_CONTENT),
      writeFile(
        path.join(root, SOURCE_COPY_RELATIVE_PATH),
        SOURCE_TARGET_CONTENT,
      ),
      writeFile(path.join(root, SEGMENT_RELATIVE_PATH), "occupied\n"),
    ]);
    const context = createFixedProvidedContext(
      "m2c-vitest-44444444444444444444444444444444",
      root,
      1,
    );
    const prepared = await prepareProbeConfiguration(
      validateProbeConfiguration(context.manifest, context.runtimeBindings),
    );
    await expect(createProbeSession(prepared)).rejects.toMatchObject({
      code: "EVIDENCE_WRITE_FAILURE",
    });
    await expect(
      readFile(path.join(root, SEGMENT_RELATIVE_PATH), "utf8"),
    ).resolves.toBe("occupied\n");
  });

  it("keeps the first failure when cleanup also fails", () => {
    const combined = preservePrimaryFailure(
      new AdapterError("M2C_TOOL_TIMEOUT"),
      new AdapterError("M2C_CLEANUP_FAILED"),
    );
    expect(combined.code).toBe("M2C_TOOL_TIMEOUT");
    expect(combined.secondaryCodes).toEqual(["M2C_CLEANUP_FAILED"]);
  });

  it("rejects unexpected worker, count, gap, partial JSONL, and raw leaks", async () => {
    const result = await runFixedVitestScenario();
    expect(() => assertSingleProducer(2, result.events)).toThrowError(
      expect.objectContaining({ code: "M2C_PROCESS_MISMATCH" }),
    );
    expect(() =>
      parseAndValidateSegment(
        result.rawSegment,
        result.manifest,
        result.coordinatorPid + 1,
        [DISPOSABLE_CANARY_VALUE],
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_PROCESS_MISMATCH" }));

    const lines = result.rawSegment.trimEnd().split("\n");
    expect(() =>
      parseAndValidateSegment(
        `${lines.slice(0, -1).join("\n")}\n`,
        result.manifest,
        result.coordinatorPid,
        [DISPOSABLE_CANARY_VALUE],
      ),
    ).toThrowError(
      expect.objectContaining({ code: "M2C_EVENT_COUNT_MISMATCH" }),
    );
    const gap = lines.map((line, index) => {
      const event = JSON.parse(line) as Record<string, unknown>;
      if (index === 3) {
        event.producerSequence = 9;
      }
      return JSON.stringify(event);
    });
    expect(() =>
      parseAndValidateSegment(
        `${gap.join("\n")}\n`,
        result.manifest,
        result.coordinatorPid,
        [DISPOSABLE_CANARY_VALUE],
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_SEGMENT_INVALID" }));
    expect(() =>
      parseAndValidateSegment(
        result.rawSegment.slice(0, -1),
        result.manifest,
        result.coordinatorPid,
        [DISPOSABLE_CANARY_VALUE],
      ),
    ).toThrowError(expect.objectContaining({ code: "M2C_SEGMENT_INVALID" }));
    expect(() =>
      assertRawDataPolicy(result.rawSegment, [result.events[0]!.runId]),
    ).toThrowError(
      expect.objectContaining({ code: "M2C_DATA_POLICY_VIOLATION" }),
    );
  });
});
