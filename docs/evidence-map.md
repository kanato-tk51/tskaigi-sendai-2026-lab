# Presentation evidence map

Status: **complete; P4 baseline and selected Vite `20260723-01` result review approved**.

This document is generated from the three tracked, sanitized JSON projections
under [`results/examples/presentation-mvp`](../results/examples/presentation-mvp/README.md).
Run `npm run p4:generate` after an intentional projection change and
`npm run p4:verify` to check exact regeneration. These ordinary offline
documentation commands read no ignored run root and execute no probe, build,
Docker, network, or deployment operation.

The evidence classes below are deliberate. M0 remains overall **Inconclusive**
with scenario-level Observed marker counts; the four adapter rows are **reviewed
local adapter evidence**; the codegen and Vite pairs are selected-profile
**Observed** only at their exact one-local-pair scopes; the five earlier Vite
pair attempts remain immutable **Inconclusive attempts**; and P3 is **Observed**
only at one-local-run scope.

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
| Environment | success | failure (ENVIRONMENT_VARIABLE_ABSENT) | success | failure (ENVIRONMENT_VARIABLE_ABSENT) |
| File read | success | failure (READ_DENIED) | success | failure (READ_DENIED) |
| Direct write | success | failure (WRITE_DENIED) | success | failure (WRITE_DENIED) |
| Loopback | success | failure (NETWORK_FAILURE) | success | failure (NETWORK_FAILURE) |
| Fixed child | success | failure (CHILD_PROCESS_FAILURE) | success | success |

[`profiles.json`](../results/examples/presentation-mvp/profiles.json) preserves
five capabilities and keeps the separate source-hash integrity attempt out of
their denominator. Both tool columns come from independently accepted exact
same-image pairs. Vite constrained child execution remains successful because
the fixed tool requires it; this is displayed with its limitation rather than
rewritten as a denial.

All five immutable attempts remain side by side in the tracked projection:
`20260719-01` — not established; not recorded; progress not established; Inconclusive; partial permissive output; constrained missing | `20260719-02` — p2-vite-attempt/v1 / SHA-256 1dd63280f8d665547de613fe732f6205aceccfd92a9a4f3b156d36b3c47c70c6; not recorded by v1; progress not established; Inconclusive; permissive not-inspected; constrained missing | `20260719-03` — p2-vite-attempt/v2 / SHA-256 5f90a582664b1f5d068a01341dfb71fc029c9a5f445e64b930729dd6a4f398b6; attached-start / P2_EXECUTOR_DOCKER_TIMEOUT; progress not established; Inconclusive; permissive not-inspected; constrained missing | `20260720-01` — p2-vite-attempt/v3 / SHA-256 9175487c2ed92eb8265e9047c362bc1d0a42d79e1911ba951fcf235530f6eada; attached-start / P2_EXECUTOR_DOCKER_TIMEOUT; progress valid-prefix: runner-entered > inputs-prepared > service-ready > child-launched; Inconclusive; permissive not-inspected; constrained missing | `20260720-02` — p2-vite-attempt/v4 / SHA-256 842b914eeb1a92241787d718523d2d3c76eaeede164531ef20eb8314391cd201; container-wait / P2_EXECUTOR_DOCKER_TIMEOUT; progress invalid/P2_TRANSFER_SEQUENCE_INVALID; retained prefix: runner-entered > inputs-prepared > service-ready > child-launched > child-watch-armed > child-close-observed > child-residue-detected > child-force-sent; Inconclusive; permissive not-inspected; constrained missing.

Selected-profile limitations:

- Trigger labels describe causation, not process privilege.
- The codegen evidence is one local same-image pair, not repeated-run reproducibility or a general-purpose sandbox claim.
- The Vite evidence is one local same-image pair under a repository-cooperative progress writer; it does not establish repeated-run reproducibility, adversarial same-UID isolation, or a general-purpose sandbox.
- The constrained Vite child outcome is success because the fixed tool requires it; CONSTRAINED_CHILD_REQUIRED_BY_TOOL remains an explicit limitation rather than being hidden as a denial.
- The five earlier exhausted Vite attempts remain immutable Inconclusive history and are not repaired or reinterpreted by the accepted 20260723-01 pair.
- Configured init and successful settlement do not establish that init/reaping caused the result or that earlier residue was a zombie.
- No raw canary value, file content, host path, command output, or unsanitized error is included.

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
  plus the accepted codegen and Vite selected-profile pairs in
  [talk table 2](../results/examples/presentation-mvp/profiles.json).
- Limitation: both comparisons are single exact local pairs. Trigger labels do
  not imply privilege, and configured init does not establish that reaping
  caused the Vite result.

### C-03 — capabilities are separate outcomes

- Evidence: the five independent cells per profile in
  [talk table 2](../results/examples/presentation-mvp/profiles.json) and the
  [codegen receipt review](reviews/p2-selected-profile-codegen-receipts.md) and
  [Vite result review](reviews/p2-vite-init-reaper-result.md).
- Limitation: each source-hash attempt is integrity evidence, not a sixth
  capability. Raw canaries, contents, host paths, output, and unsanitized
  errors are omitted.

### C-04 — the same fixture can reach different capabilities

- Evidence: the accepted one-local-pair codegen and Vite `same-image` results
  in [talk table 2](../results/examples/presentation-mvp/profiles.json).
- Limitation: the exact bindings in the
  [codegen receipt review](reviews/p2-selected-profile-codegen-receipts.md) and
  [Vite result review](reviews/p2-vite-init-reaper-result.md) do not prove a
  general sandbox or repeated-run reproducibility. The Vite progress channel
  also retains its repository-cooperative-fixture limitation.

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
  and Vite `same-image` pairs, exact Vite outcomes, the ordered immutable
  five-attempt history, artifact build count 1, zero deployment builds,
  one-byte rejection, source-record boundaries, and exact document
  regeneration.
- P4 does not rerun P2 or P3, read ignored raw evidence, edit
  `experiment-matrix.md`, access Docker/runtime sockets, use external network
  or credentials, publish, or deploy.
