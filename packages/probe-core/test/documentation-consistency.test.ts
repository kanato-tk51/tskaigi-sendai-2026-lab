import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  NETWORK_CANARY_BODY,
  NETWORK_CANARY_HEADER_NAME,
  NETWORK_CANARY_HEADER_VALUE,
  NETWORK_CANARY_METHOD,
  NETWORK_CANARY_PATH,
  NETWORK_CANARY_STATUS,
  NORMALIZED_ERROR_CODES,
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MANIFEST_SCHEMA_VERSION,
  PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
  TRIGGER_TYPES,
} from "../src/constants.js";

async function document(name: string): Promise<string> {
  return readFile(new URL(`../../../docs/${name}`, import.meta.url), "utf8");
}

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

function section(
  contents: string,
  startHeading: string,
  endHeading: string,
): string {
  const start = contents.indexOf(startHeading);
  const end = contents.indexOf(endHeading, start + startHeading.length);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return contents.slice(start, end);
}

describe("implementation and design documentation consistency", () => {
  it("documents the active schema and trigger unions", async () => {
    const protocol = await document("experiment-protocol.md");
    const architecture = await document("architecture.md");
    for (const version of [
      PROBE_MANIFEST_SCHEMA_VERSION,
      PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
      PROBE_EVENT_SCHEMA_VERSION,
    ]) {
      expect(protocol).toContain(version);
      expect(architecture).toContain(version);
    }
    for (const triggerType of TRIGGER_TYPES) {
      expect(protocol).toContain(`\`${triggerType}\``);
    }
  });

  it("keeps normalized error codes aligned and removes obsolete expected names", async () => {
    const protocol = await document("experiment-protocol.md");
    const matrix = await document("experiment-matrix.md");
    for (const code of NORMALIZED_ERROR_CODES) {
      expect(protocol).toContain(code);
    }
    for (const obsolete of [
      "CANARY_NOT_PRESENT",
      "failure/NOT_FOUND",
      "failure/ACCESS_DENIED",
      "CONNECTION_REFUSED",
    ]) {
      expect(matrix).not.toContain(obsolete);
    }
  });

  it("documents the exact loopback protocol and bounded deadline", async () => {
    const protocol = await document("experiment-protocol.md");
    for (const value of [
      NETWORK_CANARY_METHOD,
      NETWORK_CANARY_PATH,
      String(NETWORK_CANARY_STATUS),
      NETWORK_CANARY_HEADER_NAME,
      NETWORK_CANARY_HEADER_VALUE,
      NETWORK_CANARY_BODY.replace("\n", "\\n"),
      "absolute monotonic deadline",
      "4,096",
    ]) {
      expect(protocol).toContain(value);
    }
  });

  it("states the implemented symlink guarantee and residual filesystem limits", async () => {
    const protocol = await document("experiment-protocol.md");
    for (const term of [
      "rootPath",
      "Dangling final symlink",
      "Parent symlink",
      "O_NOFOLLOW",
      "Hard link",
      "bind mount",
      "parent swap/rename",
      "cooperative",
    ]) {
      expect(protocol).toContain(term);
    }
  });

  it("defines every M2 adapter with actionable completion headings", async () => {
    const milestones = await document("milestones.md");
    const milestoneNames = ["M2-A", "M2-B", "M2-C", "M2-D", "M2-E"];
    const headings = [
      "### Goal",
      "### Prerequisites",
      "### Read first",
      "### In scope",
      "### Out of scope",
      "### Deliverables",
      "### Acceptance criteria",
      "### Verification commands",
      "### Risks",
      "### Human review points",
    ];
    for (const [index, milestoneName] of milestoneNames.entries()) {
      const start = milestones.indexOf(`## ${milestoneName}:`);
      const end =
        index + 1 < milestoneNames.length
          ? milestones.indexOf(`## ${milestoneNames[index + 1]}:`)
          : milestones.length;
      expect(start).toBeGreaterThanOrEqual(0);
      const section = milestones.slice(start, end);
      for (const heading of headings) {
        expect(section).toContain(heading);
      }
    }
    expect(milestones).toContain(
      "M1 independent review gate: **approved with non-blocking follow-ups**",
    );
  });

  it("checks only the documented M0 and probe-core static verifier command paths", async () => {
    const milestones = await document("milestones.md");
    const m0 = section(milestones, "## M0:", "## M1:");
    const m0StaticCommands = section(
      m0,
      "#### Static safety checks",
      "### Risks",
    );
    const m1 = section(milestones, "## M1:", "## M2-A:");
    const m1VerificationStart = m1.indexOf("### Verification");
    expect(m1VerificationStart).toBeGreaterThanOrEqual(0);
    const m1VerificationCommands = m1.slice(m1VerificationStart);
    const documentedScripts = [
      "experiments/npm12-install/scripts/verify-static.mjs",
      "packages/probe-core/scripts/verify-static.mjs",
    ] as const;

    expect(m0StaticCommands).toContain(`node ${documentedScripts[0]}`);
    expect(m1VerificationCommands).toContain(`node ${documentedScripts[1]}`);
    expect(milestones).not.toContain("verify-static-safety.mjs");
    for (const script of documentedScripts) {
      await expect(
        access(path.join(repositoryRoot, script)),
      ).resolves.toBeUndefined();
    }
  });

  it("records the M1 gate and distinguishes closed and accepted follow-ups", async () => {
    const review = await document("reviews/m1-independent-review.md");
    expect(review).toContain("`APPROVE WITH NON-BLOCKING FOLLOW-UPS`");
    expect(review).toContain("| L-05 | complete in this closure task |");
    expect(review).toContain("| L-06 | complete in this closure task |");
    expect(review).toContain("| I-04 | accepted non-blocking limitation |");
    expect(review).toContain("does not guarantee automatic rollback");
  });
});
