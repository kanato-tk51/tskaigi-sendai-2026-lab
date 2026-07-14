import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function document(name: string): Promise<string> {
  return readFile(new URL(`../../../docs/${name}`, import.meta.url), "utf8");
}

describe("M2-B documentation consistency", () => {
  it("records the fixed package, tool, scenarios, phases, and M3 boundary", async () => {
    const [note, architecture, protocol, milestones] = await Promise.all([
      document("m2-b-eslint-adapter.md"),
      document("architecture.md"),
      document("experiment-protocol.md"),
      document("milestones.md"),
    ]);
    for (const value of [
      "packages/eslint-plugin-probe",
      "@tskaigi-lab/adapter-eslint",
      "9.39.5",
      "lint-only",
      "module-evaluation",
      "plugin-initialization",
      "rule-create",
      "visitor-callback",
      "fixer-callback",
      "official-api-change",
      "direct-filesystem-write",
      "source-fix",
      "global sequence",
      "M3",
    ]) {
      expect(note).toContain(value);
    }
    expect(architecture).toContain("@tskaigi-lab/adapter-eslint");
    expect(protocol).toContain("### M2-B ESLint adapter mapping");
    expect(milestones).toContain("## M2-B: ESLint adapter");
    expect(milestones).toContain(
      "Status: **implementation complete; independent review pending**",
    );
  });
});
