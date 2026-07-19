# Presentation evidence map

Status: **complete; P4 baseline and selected Vite completion-addendum result reviews approved**.

This document is generated from the three tracked, sanitized JSON projections
under [`results/examples/presentation-mvp`](../results/examples/presentation-mvp/README.md).
Run `npm run p4:generate` after an intentional projection change and
`npm run p4:verify` to check exact regeneration. These ordinary offline
documentation commands read no ignored run root and execute no probe, build,
Docker, network, or deployment operation.

The evidence classes below are deliberate. M0 remains overall **Inconclusive**
with scenario-level Observed marker counts; the four adapter rows are **reviewed
local adapter evidence**; the codegen pair is selected-profile **Observed** only
at one-local-pair scope; all three Vite pair attempts are observed
**Inconclusive attempts**, not capability results; and P3 is **Observed** only
at one-local-run scope.

## Talk table 1 — five routes, phases, triggers, and counts

| Route / fixed input | Phase / trigger | Reviewed count | Direct / tool API | Class / limitation |
|---|---|---|---|---|
| npm lifecycle — npm 12.0.1; unapproved / approved rebuild / scripts-disabled / reinstall / npm ci | install lifecycle — automatic | marker 0 / 1 / 0 / 1 / 1 | marker only; no capability or official tool-API change measured | Inconclusive M0 run with scenario-level Observed marker counts. The required docker cp transfer failed and a bounded fallback preserved the marker observations; this is version-specific marker evidence, not capability or profile evidence. |
| ESLint plugin — ESLint 9.39.5; lint-only / fix | module, initialization, rule, visitor — configured; fixer change — explicit | lint 1 / 1 / 1 / 1 / 1; fix 1 / 1 / 2 / 2 / 1 | 6 capability attempts; fixer change skipped in lint-only and materialized once in fix | reviewed local adapter evidence. Counts are pinned to the fixed version, fixture, options, and retained second lint pass; direct marker, fixer return, and source materialization are distinct. |
| Vitest setupFiles — Vitest 3.2.7; one setup, one test, single fork | late setup-module checkpoint — configured; setup body — automatic | 2 checkpoints; 6 capability attempts; 0 tool changes; 8 total | direct capability attempts only; no official tool-API change | reviewed local adapter evidence. The two checkpoints occur in one awaited import and are not two separate Vitest callbacks; this is not profile evidence. |
| Vite plugin — Vite 6.4.3; observe / API | module and factory — configured; build hooks — automatic | 6 route + 6 capability + 3 tool-change = 15 per variant | 3 tool changes skipped/NOT_APPLICABLE in observe and successful in API | reviewed local adapter evidence. The local variants demonstrate route and API distinctions only; they are not selected-profile observations. |
| Codegen CLI — project codegen CLI; observe / API / dry-run | all route events — explicit | 5 route + 6 capability + 1 tool-change = 12 per mode | generator API event skipped or successful as fixed by mode; direct write stays separate | reviewed local adapter evidence. The fixed CLI has no automatic-start claim; these local variants are separate from the selected-profile pair. |

The table is the tracked projection in [`routes.json`](../results/examples/presentation-mvp/routes.json),
not a citation of ignored adapter run directories. Trigger labels describe why
code ran; they do not imply the privilege of the executing process.

## Talk table 2 — selected profile capability outcomes

| Capability | Codegen permissive | Codegen constrained | Vite permissive | Vite constrained |
|---|---|---|---|---|
| Environment | success | failure (ENVIRONMENT_VARIABLE_ABSENT) | not-inspected | missing |
| File read | success | failure (READ_DENIED) | not-inspected | missing |
| Direct write | success | failure (WRITE_DENIED) | not-inspected | missing |
| Loopback | success | failure (NETWORK_FAILURE) | not-inspected | missing |
| Fixed child | success | failure (CHILD_PROCESS_FAILURE) | not-inspected | missing |

[`profiles.json`](../results/examples/presentation-mvp/profiles.json) preserves
five capabilities and keeps the separate source-hash integrity attempt out of
their denominator. The codegen cells come from the independently accepted exact
same-image pair. The three exhausted Vite attempts have no receipt or
constrained run:
`not-inspected` and `missing` are displayed rather than converted to zero,
denial, or success.

All three immutable attempts remain side by side in the tracked projection:
`20260719-01` — not established; not recorded; Inconclusive; partial permissive output; constrained missing | `20260719-02` — p2-vite-attempt/v1 / SHA-256 1dd63280f8d665547de613fe732f6205aceccfd92a9a4f3b156d36b3c47c70c6; not recorded by v1; Inconclusive; permissive not-inspected; constrained missing | `20260719-03` — p2-vite-attempt/v2 / SHA-256 5f90a582664b1f5d068a01341dfb71fc029c9a5f445e64b930729dd6a4f398b6; attached-start / P2_EXECUTOR_DOCKER_TIMEOUT; Inconclusive; permissive not-inspected; constrained missing.

## Talk table 3 — build once, verify, copy, reject

| Stage | Observed disposition | Build evidence | Identity / boundary |
|---|---|---|---|
| Build | completed | build invocation count 1 | fixed source and lockfile recorded; canonical artifact SHA-256 emitted |
| Verify | verified | build count remained 1 | digest recomputed in a separate verification directory |
| Copy | copied | deployment build invocations 0 | handoff, verification, and deployment artifact bytes are identical |
| One-byte tamper | rejected-before-copy | no rebuild; deployStarted false | exactly 1 byte changed; P3_ARTIFACT_DIGEST_MISMATCH |

The exact tracked projection is [`artifact.json`](../results/examples/presentation-mvp/artifact.json).
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

- Evidence: the accepted one-local-pair codegen `same-image` result in
  [talk table 2](../results/examples/presentation-mvp/profiles.json).
- Limitation: same-image and pair-identical staging have the narrow bindings in
  the [codegen receipt review](reviews/p2-selected-profile-codegen-receipts.md);
  they do not prove a general sandbox or repeated-run reproducibility. The
  [latest Vite result review](reviews/p2-vite-diagnostic-result.md) accepts only
  three Inconclusive attempts, so the selected Vite comparison is explicitly
  missing.

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
  [`artifact.json`](../results/examples/presentation-mvp/artifact.json) and the
  [fresh result review](reviews/p3-artifact-demo-result.md).
- Limitation: digest/local provenance does not prove semantic harmlessness;
  the unsigned receipt does not prove authenticity against joint replacement;
  and this run has no OS-level egress-enforcement evidence or SLSA/in-toto
  compliance claim.

## Reproduction and safety boundary

- `npm run p4:generate` deterministically renders only this tracked document
  from the three tracked JSON files.
- `npm run p4:verify` validates fixed route/capability counts, codegen
  `same-image`, the ordered three-attempt Vite history and its
  `not-inspected` / `missing` boundary, artifact build count 1, zero
  deployment builds, one-byte rejection, source-record boundaries, and exact
  document regeneration.
- P4 does not rerun P2 or P3, read ignored raw evidence, edit
  `experiment-matrix.md`, access Docker/runtime sockets, use external network
  or credentials, publish, or deploy.
