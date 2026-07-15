import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("M2-C documentation contract", () => {
  it("records the fixed command, mapping, N/A change policy, and pending review status", async () => {
    const note = await readFile(
      new URL("../../../docs/m2-c-vitest-setup-adapter.md", import.meta.url),
      "utf8",
    );
    const milestones = await readFile(
      new URL("../../../docs/milestones.md", import.meta.url),
      "utf8",
    );
    const rootReadme = await readFile(
      new URL("../../../README.md", import.meta.url),
      "utf8",
    );

    expect(note).toContain(
      "vitest run --config vitest.scenario.config.ts --configLoader runner fixture/designated.test.ts",
    );
    expect(note).toContain("`setup-file-late-module-checkpoint`");
    expect(note).toContain("`setup-file-body-checkpoint`");
    expect(note).toContain("same awaited top-level module import");
    expect(note).toContain("checkpoint 1 is not module-evaluation start");
    expect(note).toContain("zero events cannot prove");
    expect(note).toContain("`TMPDIR`, `TMP`, and `TEMP`");
    expect(note).toContain(
      "packages/vitest-setup-probe/node_modules/.vite-temp",
    );
    expect(note).toContain("only `ENOENT` means absent");
    expect(note).toContain("does not assume ownership or delete it");
    expect(note).toContain("Tool temp/cache writes are not");
    expect(note).toContain("dedicated process group");
    expect(note).toContain('{ code: null, signal: "SIGKILL" }');
    expect(note).toContain("production lifecycle suppresses loopback close");
    expect(note).toContain("Timeout/output-limit remains primary");
    expect(note).toContain("Tool API targets, changes, and events remain zero");
    expect(note).toContain("workerId` is therefore `null`");
    expect(note).toContain(
      "implementation complete; second blocker remediation implemented; clean-boundary verification blocked; independent re-review pending",
    );
    expect(note).toContain("must not be generalized");
    expect(milestones).toContain(
      "Status: **implementation complete; second blocker remediation implemented; clean-boundary verification blocked; independent re-review pending**",
    );
    expect(rootReadme).toContain("npm run m2c:verify");
    expect(rootReadme).toContain("npm run m2c:run");
  });
});
