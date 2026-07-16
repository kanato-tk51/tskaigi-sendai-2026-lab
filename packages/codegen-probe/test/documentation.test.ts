import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function document(name: string): Promise<string> {
  return readFile(new URL(`../../../docs/${name}`, import.meta.url), "utf8");
}

describe("M2-E documentation consistency", () => {
  it("records the fixed explicit CLI and review boundary", async () => {
    const [note, architecture, milestones, index] = await Promise.all([
      document("m2-e-codegen-adapter.md"),
      document("architecture.md"),
      document("milestones.md"),
      document("index.md"),
    ]);
    for (const value of [
      "packages/codegen-probe",
      "@tskaigi-lab/adapter-codegen",
      "codegen-cli-startup",
      "codegen-generation-api-change",
      "dry-run",
      "explicit",
      "M3",
    ]) {
      expect(note).toContain(value);
    }
    expect(architecture).toContain("@tskaigi-lab/adapter-codegen");
    expect(milestones).toContain(
      "## M2-E: explicit code-generation CLI adapter",
    );
    expect(index).toContain("M2-E explicit code-generation CLI adapter");
  });
});
