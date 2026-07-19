import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  loadPresentationEvidence,
  renderEvidenceMap,
  validatePresentationEvidence,
} from "../scripts/presentation-evidence.mjs";

const evidenceMapPath = fileURLToPath(
  new URL("../docs/evidence-map.md", import.meta.url),
);

describe("presentation evidence map", () => {
  it("regenerates exactly from three bounded tracked projections", async () => {
    const evidence = await loadPresentationEvidence();

    expect(() => validatePresentationEvidence(evidence)).not.toThrow();
    expect(await readFile(evidenceMapPath, "utf8")).toBe(
      renderEvidenceMap(evidence),
    );
  });

  it("keeps seven claims, three talk tables, and the Vite gap visible", async () => {
    const rendered = renderEvidenceMap(await loadPresentationEvidence());

    expect(rendered.match(/^## Talk table /gm)).toHaveLength(3);
    expect(rendered.match(/^### C-0[1-7] /gm)).toHaveLength(7);
    expect(rendered).toContain("not-inspected");
    expect(rendered).toContain("missing");
    expect(rendered).toContain("Inconclusive");
    expect(rendered).not.toContain("results/runs/");
  });
});
