# Goal

Perform a fresh independent Docker-free read-only review of frozen-research
issue #47's first production raw-to-derived collector contract. Decide M3-PC01
through M3-PC06 and whether exactly one bounded static/unit implementation may
proceed. Do not implement the collector, ingest an adapter run, or define a
runtime activation.

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M3 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `docs/reviews/m3-harness-and-reports.md`
- `docs/reviews/m3-harness-and-reports-remediation.md`
- `docs/m2-e-codegen-adapter.md`
- `docs/reviews/m2-e-codegen-adapter.md`
- `docs/reviews/p2-selected-profile-codegen-receipts.md`
- `docs/m3-production-raw-to-derived-collector.md`
- current `packages/lab-cli/**`, `scenarios/m3-synthetic-collector.json`,
  `results/runs/README.md`, and the fixed codegen manifest/event contract under
  `packages/codegen-probe/**`
- this prompt

# Required finding decisions

1. **M3-PC01 — exact adapter and schema boundary:** confirm codegen `observe` is
   exactly one adapter boundary; v3 is additive to the immutable v2 synthetic
   schemas; both scenario/profile mappings, the one-producer manifest, exact
   route/attempt/tool order, runtime-context shape, and identity-bearing
   Expected records are complete. Reproduce the exact permissive/constrained
   outcome/error alternatives. Confirm the before-only source hash and skipped
   tool change remain unavailable rather than borrowing the P2 receipt result.
2. **M3-PC02 — immutable raw input and filesystem identity:** review the exact
   raw-only inventory, owner/mode/link/type limits, held no-follow descriptor
   protocol, private BigInt identity, content hash, path/descriptor pre-use-
   publish-post checks, and raw non-mutation. Block any reopen, alias, extra
   inventory, serialized private identity, or unsupported-platform success.
3. **M3-PC03 — deterministic clean derivation and publication:** verify the
   complete five-file and Inconclusive two-file inventories, stable
   serialization/order, logical evidence paths, in-memory render-before-write,
   exclusive staging, sync/read-back, atomic publish, post-publish checks, and
   no overwrite/retry rule. Confirm two clean byte-identical raw roots can
   regenerate exact derived bytes while a partial publication is never treated
   as evidence.
4. **M3-PC04 — rejection preservation and sanitization:** map every structured,
   byte, filesystem, canonical JSON/JSONL, context, completion, sequence,
   outcome, and mutation rejection to raw byte preservation and either no
   derived output or the exact sanitized Inconclusive inventory. Confirm no
   prefix salvage, redaction-as-acceptance, forbidden raw data, rejected-input
   digest, path, output, or unsanitized error can enter derived bytes.
5. **M3-PC05 — evidence separation:** confirm `adapter-run`, complete,
   Expected-match, and deterministic regeneration do not auto-promote a run to
   experiment-matrix, selected-profile, presentation, M4, or other `Observed`.
   Confirm no historical P2 result is a permitted input/backfill and no new
   runtime identity or command was selected.
6. **M3-PC06 — exact allowlist:** decide whether the listed production,
   scenario, test, and static paths are sufficient and no broader than the
   first Docker-free implementation. Confirm the excluded CLI/runner/fixture,
   codegen/probe/container/package/runtime/result/evidence paths prevent an
   implementation task from creating or ingesting a real adapter occurrence.

# Review method

- Inspect the complete working-tree diff and preserve all existing M4,
  presentation, and user changes.
- Trace current v2 types, validators, collector, reducer, renderer,
  persistence, runner, static verifier, and tests. Treat their passing
  historical review as the baseline, not proof that v3 is complete.
- Derive the codegen manifest and event identities from source. Compare every
  current fixed M2-E ID, phase, target, attempt, route, tool change, version,
  size/timeout, and selected profile mapping with the proposal.
- Reproduce current reducer semantics for the single before-only file-hash and
  skipped tool event. Confirm the contract does not infer a second hash or
  receipt conclusion.
- Review the transaction as a state machine: raw-only, captured, rendered,
  staged, published, settled, rejected/uncertain. Identify every point where a
  raw or derived object could be replaced, partially published, reused, or
  mistaken for evidence.
- Reconcile each negative class with an exact allowlisted test/static path and
  every production path with a necessary contract responsibility.
- Use only read-only source assertions and bounded no-write in-memory
  assertions if needed. If blocked, record one contract-only remediation; do
  not fix it in this session.

# Out of scope

- Editing implementation, tests, schema source, scenario JSON, static verifier,
  package surface, codegen adapter, probe-core, profile/container code, result,
  evidence map, matrix, or tracked examples
- Running adapter/probe/lifecycle scenarios, TypeScript with filesystem emit,
  a production collector, Docker/container/runtime-socket operations, retained
  state, result-root inspection, cleanup, retry, repair, or publication
- Opening or enumerating historical P2/M4 result roots, choosing a run ID,
  profile revision, image digest, command, activation, or measurement
- External network, credentials, host home/environment, Remote Git,
  deployment, or third-party communication

# Deliverables

- `docs/reviews/m3-production-raw-to-derived-collector-contract.md` with an
  `APPROVED` or `BLOCKED` decision, M3-PC01 through M3-PC06 analysis,
  independently reproduced schema/manifest/transaction/rejection/evidence
  evidence, exact implementation or remediation boundary, and limitations
- minimal status updates in `docs/m3-production-raw-to-derived-collector.md`,
  `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`
- if approved, at most one later Docker-free static/unit implementation under
  the exact allowlist; if blocked, one contract-only remediation

# Verification

Use read-only TypeScript/source inventory assertions, bounded no-write
in-memory assertions when necessary, a focused formatter check over
review/status files, and `git diff --check`. Do not run M3 tests, typecheck,
build, a filesystem-writing fixture, an adapter, Docker, or a broad verification
command merely to repeat historical evidence.

# Completion report

- Decision and M3-PC01 through M3-PC06 status
- Independently reproduced adapter/schema, raw identity, transaction,
  rejection/sanitization, and evidence-class boundaries
- Exact approved implementation or blocked remediation
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
