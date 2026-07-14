import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("static safety invariants", () => {
  it("uses one named environment property access and no enumeration", async () => {
    const source = await readFile(
      new URL("../src/attempts/environment.ts", import.meta.url),
      "utf8",
    );
    expect(source.match(/process\.env\[/gu)).toHaveLength(1);
    expect(source).not.toMatch(/Object\.(keys|values|entries)\(process\.env/u);
    expect(source).not.toMatch(/\.\.\.process\.env/u);
    expect(source).not.toMatch(/JSON\.stringify\(process\.env/u);
    expect(source).not.toMatch(/for\s*\([^)]*\bin\s+process\.env/u);
  });
});
