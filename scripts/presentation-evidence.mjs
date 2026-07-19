import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exampleRoot = resolve(
  repositoryRoot,
  "results/examples/presentation-mvp",
);
const evidenceMapPath = resolve(repositoryRoot, "docs/evidence-map.md");

function assert(condition, message) {
  if (!condition) {
    throw new Error(`P4 evidence validation failed: ${message}`);
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadPresentationEvidence() {
  const [routes, profiles, artifact] = await Promise.all([
    readJson(resolve(exampleRoot, "routes.json")),
    readJson(resolve(exampleRoot, "profiles.json")),
    readJson(resolve(exampleRoot, "artifact.json")),
  ]);
  return { routes, profiles, artifact };
}

function assertSourceRecords(records, label) {
  assert(Array.isArray(records) && records.length > 0, `${label} sources`);
  for (const record of records) {
    assert(typeof record === "string" && record.length > 0, `${label} source`);
    assert(
      !record.startsWith("/"),
      `${label} source must be repository-relative`,
    );
    assert(
      !record.startsWith("results/runs/"),
      `${label} must not cite an ignored run root`,
    );
  }
}

function assertNonemptyStrings(values, label) {
  assert(Array.isArray(values) && values.length > 0, label);
  for (const value of values) {
    assert(typeof value === "string" && value.length > 0, label);
  }
}

export function validatePresentationEvidence({ routes, profiles, artifact }) {
  assert(
    routes.schemaVersion === "presentation-route-trigger-table/v1",
    "route schema",
  );
  assertSourceRecords(routes.sourceRecords, "route");
  assert(Array.isArray(routes.rows) && routes.rows.length === 5, "five routes");
  assert(
    routes.rows.map(({ routeId }) => routeId).join(",") ===
      "npm-lifecycle,eslint-plugin,vitest-setup,vite-plugin,codegen-cli",
    "fixed route order",
  );
  for (const row of routes.rows) {
    assertNonemptyStrings(
      [
        row.route,
        row.fixedInput,
        row.phaseAndTrigger,
        row.reviewedCounts,
        row.directAndToolApi,
        row.evidenceClass,
        row.limitation,
      ],
      `complete route row ${String(row.routeId)}`,
    );
  }

  assert(
    profiles.schemaVersion ===
      "presentation-selected-profile-capability-table/v1",
    "profile schema",
  );
  assertSourceRecords(profiles.sourceRecords, "profile");
  assert(
    profiles.pairs?.codegen?.validity === "same-image",
    "codegen same-image",
  );
  assert(
    profiles.pairs?.codegen?.evidenceClass ===
      "selected profile Observed at the exact one-local-pair scope",
    "codegen evidence scope",
  );
  assert(
    profiles.pairs?.vite?.validity === "inconclusive",
    "Vite Inconclusive",
  );
  assert(
    profiles.pairs?.vite?.permissiveEvidence === "not-inspected",
    "Vite permissive evidence must stay not-inspected",
  );
  assert(
    profiles.pairs?.vite?.constrainedEvidence === "missing",
    "Vite constrained evidence must stay missing",
  );
  assert(
    Array.isArray(profiles.capabilities) && profiles.capabilities.length === 5,
    "five capability rows",
  );
  assert(
    profiles.capabilities.map(({ capabilityId }) => capabilityId).join(",") ===
      "environment,file-read,direct-write,loopback,fixed-child",
    "fixed capability order",
  );
  for (const row of profiles.capabilities) {
    assert(
      row.codegenPermissive?.outcome === "success",
      `${row.capabilityId} permissive`,
    );
    assert(
      row.codegenConstrained?.outcome === "failure",
      `${row.capabilityId} constrained`,
    );
    assert(
      row.vitePermissive?.outcome === "not-inspected",
      `${row.capabilityId} Vite permissive`,
    );
    assert(
      row.viteConstrained?.outcome === "missing",
      `${row.capabilityId} Vite constrained`,
    );
  }
  assertNonemptyStrings(profiles.limitations, "profile limitations");

  assert(
    artifact.schemaVersion === "presentation-artifact-result-table/v1",
    "artifact schema",
  );
  assertSourceRecords(artifact.sourceRecords, "artifact");
  assert(
    artifact.evidenceClass === "Observed at the exact one-local-run scope",
    "artifact evidence scope",
  );
  assert(
    Array.isArray(artifact.steps) && artifact.steps.length === 4,
    "four artifact stages",
  );
  const steps = Object.fromEntries(
    artifact.steps.map((step) => [step.stepId, step]),
  );
  assert(
    steps.build?.buildEvidence === "build invocation count 1",
    "build count 1",
  );
  assert(steps.verify?.observedDisposition === "verified", "verified artifact");
  assert(
    steps.copy?.buildEvidence === "deployment build invocations 0",
    "copy without rebuild",
  );
  assert(
    steps.tamper?.observedDisposition === "rejected-before-copy" &&
      steps.tamper?.identityOrBoundary.startsWith("exactly 1 byte changed"),
    "one-byte rejection",
  );
  assert(
    Array.isArray(artifact.limitations) && artifact.limitations.length === 3,
    "three artifact limitations",
  );
  assertNonemptyStrings(artifact.limitations, "artifact limitations");
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers, rows) {
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

function outcomeCell(value) {
  return value.reason === null
    ? value.outcome
    : `${value.outcome} (${value.reason})`;
}

export function renderEvidenceMap(evidence) {
  validatePresentationEvidence(evidence);
  const { routes, profiles, artifact } = evidence;

  const routeTable = table(
    [
      "Route / fixed input",
      "Phase / trigger",
      "Reviewed count",
      "Direct / tool API",
      "Class / limitation",
    ],
    routes.rows.map((row) => [
      `${row.route} — ${row.fixedInput}`,
      row.phaseAndTrigger,
      row.reviewedCounts,
      row.directAndToolApi,
      `${row.evidenceClass}. ${row.limitation}`,
    ]),
  );
  const profileTable = table(
    [
      "Capability",
      "Codegen permissive",
      "Codegen constrained",
      "Vite permissive",
      "Vite constrained",
    ],
    profiles.capabilities.map((row) => [
      row.capability,
      outcomeCell(row.codegenPermissive),
      outcomeCell(row.codegenConstrained),
      outcomeCell(row.vitePermissive),
      outcomeCell(row.viteConstrained),
    ]),
  );
  const artifactTable = table(
    ["Stage", "Observed disposition", "Build evidence", "Identity / boundary"],
    artifact.steps.map((step) => [
      step.stage,
      step.observedDisposition,
      step.buildEvidence,
      step.identityOrBoundary,
    ]),
  );

  return `# Presentation evidence map

Status: **P4 focused final review approved; presentation MVP complete**.

This document is generated from the three tracked, sanitized JSON projections
under [\`results/examples/presentation-mvp\`](../results/examples/presentation-mvp/README.md).
Run \`npm run p4:generate\` after an intentional projection change and
\`npm run p4:verify\` to check exact regeneration. These ordinary offline
documentation commands read no ignored run root and execute no probe, build,
Docker, network, or deployment operation.

The evidence classes below are deliberate. M0 remains overall **Inconclusive**
with scenario-level Observed marker counts; the four adapter rows are **reviewed
local adapter evidence**; the codegen pair is selected-profile **Observed** only
at one-local-pair scope; Vite is an observed **Inconclusive attempt**, not a
capability result; and P3 is **Observed** only at one-local-run scope.

## Talk table 1 — five routes, phases, triggers, and counts

${routeTable}

The table is the tracked projection in [\`routes.json\`](../results/examples/presentation-mvp/routes.json),
not a citation of ignored adapter run directories. Trigger labels describe why
code ran; they do not imply the privilege of the executing process.

## Talk table 2 — selected profile capability outcomes

${profileTable}

[\`profiles.json\`](../results/examples/presentation-mvp/profiles.json) preserves
five capabilities and keeps the separate source-hash integrity attempt out of
their denominator. The codegen cells come from the independently accepted exact
same-image pair. The exhausted Vite attempt has no receipt or constrained run:
\`not-inspected\` and \`missing\` are displayed rather than converted to zero,
denial, or success.

## Talk table 3 — build once, verify, copy, reject

${artifactTable}

The exact tracked projection is [\`artifact.json\`](../results/examples/presentation-mvp/artifact.json).
It is one local run, not a cross-machine reproducibility result. SHA-256 and the
unsigned local receipt establish byte identity and recorded inputs only: they
do not prove semantic harmlessness or authenticity against coordinated
artifact/receipt replacement. The empty child environment and fixed code path
are not OS-level egress-enforcement evidence.

## Claim links and displayed limitations

### C-01 — five dependency execution routes

- Evidence: [talk table 1 projection](../results/examples/presentation-mvp/routes.json),
  [P1 inventory](presentation-evidence-inventory.md), and its
  [independent review](reviews/presentation-evidence-inventory.md).
- Limitation: npm is an overall Inconclusive, version-specific marker baseline;
  the other four rows are local adapter evidence, not profile or matrix
  Observed. Every count is fixed-input specific.

### C-02 — trigger label is not process privilege

- Evidence: trigger metadata in [talk table 1](../results/examples/presentation-mvp/routes.json)
  plus the accepted codegen and Inconclusive Vite state in
  [talk table 2](../results/examples/presentation-mvp/profiles.json).
- Limitation: only codegen has an accepted profile comparison. Vite produced no
  capability receipt or constrained attempt, and configuration intent is not
  runtime enforcement.

### C-03 — capabilities are separate outcomes

- Evidence: the five independent cells per profile in
  [talk table 2](../results/examples/presentation-mvp/profiles.json) and the
  [codegen receipt review](reviews/p2-selected-profile-codegen-receipts.md).
- Limitation: the codegen source-hash attempt is integrity evidence, not a sixth
  capability. Raw canaries, contents, host paths, output, and unsanitized errors
  are omitted; Vite capability outcomes are unmeasured.

### C-04 — the same fixture can reach different capabilities

- Evidence: the accepted one-local-pair codegen \`same-image\` result in
  [talk table 2](../results/examples/presentation-mvp/profiles.json).
- Limitation: same-image and pair-identical staging have the narrow bindings in
  the [codegen receipt review](reviews/p2-selected-profile-codegen-receipts.md);
  they do not prove a general sandbox or repeated-run reproducibility. The
  [Vite review](reviews/p2-selected-profile-vite-failure.md) accepts only an
  Inconclusive attempt, so the selected Vite comparison is explicitly missing.

### C-05 — direct writes differ from official tool API changes

- Evidence: the reviewed ESLint, Vite, and codegen local distinctions retained
  in [talk table 1](../results/examples/presentation-mvp/routes.json) and the
  [P1 inventory](presentation-evidence-inventory.md).
- Limitation: a direct marker, API return, in-memory/bundle change, disk
  materialization, and ordinary tool output are not interchangeable. These are
  fixed local adapter facts, not selected-profile outcomes.

### C-06 — build once, verify/copy, reject one byte

- Evidence: [talk table 3 projection](../results/examples/presentation-mvp/artifact.json)
  and the [fresh result review](reviews/p3-artifact-demo-result.md).
- Limitation: this is one exact local run. Verify/copy did not install or
  rebuild, but the result does not establish cross-machine reproducibility or
  arbitrary build isolation.

### C-07 — identity and provenance are not harmlessness

- Evidence: the limitations adjacent to talk table 3 in
  [\`artifact.json\`](../results/examples/presentation-mvp/artifact.json) and the
  [fresh result review](reviews/p3-artifact-demo-result.md).
- Limitation: digest/local provenance does not prove semantic harmlessness;
  the unsigned receipt does not prove authenticity against joint replacement;
  and this run has no OS-level egress-enforcement evidence or SLSA/in-toto
  compliance claim.

## Reproduction and safety boundary

- \`npm run p4:generate\` deterministically renders only this tracked document
  from the three tracked JSON files.
- \`npm run p4:verify\` validates fixed route/capability counts, codegen
  \`same-image\`, Vite \`not-inspected\` / \`missing\`, artifact build count 1,
  zero deployment builds, one-byte rejection, source-record boundaries, and
  exact document regeneration.
- P4 does not rerun P2 or P3, read ignored raw evidence, edit
  \`experiment-matrix.md\`, access Docker/runtime sockets, use external network
  or credentials, publish, or deploy.
`;
}

export async function checkEvidenceMap() {
  const evidence = await loadPresentationEvidence();
  const expected = renderEvidenceMap(evidence);
  const actual = await readFile(evidenceMapPath, "utf8");
  return actual === expected;
}

export async function writeEvidenceMap() {
  const evidence = await loadPresentationEvidence();
  await writeFile(evidenceMapPath, renderEvidenceMap(evidence), "utf8");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] ?? "--check";
  if (mode === "--write") {
    await writeEvidenceMap();
  } else if (mode === "--check") {
    if (!(await checkEvidenceMap())) {
      throw new Error(
        "docs/evidence-map.md is stale; run npm run p4:generate and review the diff",
      );
    }
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }
}
