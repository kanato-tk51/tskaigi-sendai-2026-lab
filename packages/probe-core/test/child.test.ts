import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  createProbeSession,
  validateProbeConfiguration,
  validateProbeManifest,
} from "../src/index.js";
import {
  baseManifest,
  baseRuntimeBindings,
  createTestConfiguration,
} from "./helpers.js";

async function runChildAttempt(timeoutMs: number, maxOutputBytes: number) {
  const fixture = await createTestConfiguration(
    [
      {
        targetId: "child-target",
        kind: "fixed-child",
        timeoutMs,
        maxOutputBytes,
      },
    ],
    [
      {
        attemptId: "child-attempt",
        type: "child-node-process",
        targetId: "child-target",
        enabled: true,
      },
    ],
    [{ targetId: "child-target", kind: "fixed-child" }],
  );
  const session = await createProbeSession(fixture.configuration);
  const event = await session.runAttempt("child-attempt");
  await session.close();
  return { event, fixture };
}

describe("fixed child Node.js attempt", () => {
  it("executes the package-owned child and verifies its fixed response", async () => {
    const { event, fixture } = await runChildAttempt(2_000, 1024);
    try {
      expect(event).toMatchObject({
        outcome: "success",
        normalizedErrorCode: null,
        details: {
          kind: "child",
          exitCode: 0,
          timedOut: false,
          responseVerified: true,
          stderrBytes: 0,
        },
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("rejects executable, script, and argument input", () => {
    for (const extra of [
      { executable: "/bin/sh" },
      { script: "other.js" },
      { arguments: ["--arbitrary"] },
    ]) {
      const manifest = baseManifest([
        {
          targetId: "child-target",
          kind: "fixed-child",
          timeoutMs: 100,
          maxOutputBytes: 100,
          ...extra,
        } as never,
      ]);
      expect(() => validateProbeManifest(manifest)).toThrowError(
        expect.objectContaining({ code: "INVALID_MANIFEST" }),
      );
    }

    const manifest = baseManifest([
      {
        targetId: "child-target",
        kind: "fixed-child",
        timeoutMs: 100,
        maxOutputBytes: 100,
      },
    ]);
    expect(() =>
      validateProbeConfiguration(
        manifest,
        baseRuntimeBindings("/tmp/probe-core-events-validation", [
          {
            targetId: "child-target",
            kind: "fixed-child",
            executable: "/bin/sh",
          } as never,
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "INVALID_TARGET" }));
  });

  it("kills a child that exceeds its timeout", async () => {
    const { event, fixture } = await runChildAttempt(1, 1024);
    try {
      expect(event).toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "CHILD_PROCESS_TIMEOUT",
        details: { timedOut: true, responseVerified: false },
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("enforces the stdout/stderr byte limit", async () => {
    const { event, fixture } = await runChildAttempt(2_000, 1);
    try {
      expect(event).toMatchObject({
        outcome: "failure",
        normalizedErrorCode: "CHILD_OUTPUT_TOO_LARGE",
        details: { responseVerified: false },
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it("uses process.execPath, shell false, fixed arguments, and an empty environment", async () => {
    const implementation = await readFile(
      new URL("../src/attempts/child.ts", import.meta.url),
      "utf8",
    );
    const validation = await readFile(
      new URL("../src/validation.ts", import.meta.url),
      "utf8",
    );
    const childScript = await readFile(
      new URL("../src/fixed-child.js", import.meta.url),
      "utf8",
    );
    expect(implementation).toContain("trustedRuntime.nodeExecutable");
    expect(implementation).toContain("trustedRuntime.fixedChildScriptPath");
    expect(implementation).not.toContain("process.execPath");
    expect(validation.match(/process\.execPath/gu)).toHaveLength(1);
    expect(validation).toContain(
      'new URL("./fixed-child.js", import.meta.url)',
    );
    expect(implementation).toContain("shell: false");
    expect(implementation).toContain("env: {}");
    expect(implementation).not.toContain("shell: true");
    expect(childScript).toBe(
      'import process from "node:process";\n\n' +
        'process.stdout.write(\'{"probeChild":"ok"}\\n\');\n',
    );
    expect(childScript).not.toContain("process.env");
  });
});
