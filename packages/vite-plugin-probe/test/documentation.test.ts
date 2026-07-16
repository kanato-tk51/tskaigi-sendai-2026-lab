import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FIXED_REPOSITORY_ROOT } from "../src/paths.js";

async function repositoryText(relativePath: string): Promise<string> {
  return readFile(path.join(FIXED_REPOSITORY_ROOT, relativePath), "utf8");
}

describe("M2-D documentation status", () => {
  it("records implementation complete with independent review approved", async () => {
    const [readme, milestone, contract, index] = await Promise.all([
      repositoryText("README.md"),
      repositoryText("docs/milestones.md"),
      repositoryText("docs/m2-d-vite-plugin-adapter.md"),
      repositoryText("docs/index.md"),
    ]);
    for (const document of [milestone, contract]) {
      expect(document).toContain(
        "M2-D implementation complete; independent review approved with non-blocking follow-ups",
      );
      expect(document).toContain("experiment-matrix Observed unmeasured");
      expect(document).toContain(
        "Status: **M2-D implementation complete; independent review approved",
      );
    }
    expect(readme).toContain("npm run m2d:verify");
    expect(readme).toContain("npm run m2d:run:observe");
    expect(readme).toContain("npm run m2d:run:api");
    expect(index).toContain("independent read-only review");
  });

  it("keeps experiment-matrix Observed byte-identical to the approved docs snapshot", async () => {
    const matrix = await repositoryText("docs/experiment-matrix.md");
    expect(createHash("sha256").update(matrix).digest("hex")).toBe(
      "80ab99c890bc2eca2b5ade839e0195b032a702cc450ed3f7fecd8a5706e535b0",
    );
    expect(matrix).toContain("| 未実測 | 未実測 |");
  });
});
