# Goal

Perform a fresh independent Docker-free read-only review of only frozen-
research issue #47's bounded production codegen `observe` raw-to-derived
collector static/unit implementation. Decide M3-PC01 through M3-PC06 from the
actual source, tests, and independently reproduced verification. Do not repair
implementation or tests, activate or ingest the collector, or define a runtime
gate in this review session.

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
- `docs/reviews/m3-production-raw-to-derived-collector-contract.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract-remediation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md`
- `prompts/m3-production-raw-to-derived-collector-contract-remediation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-remediation-review.md`
- `prompts/m3-production-raw-to-derived-collector-implementation.md`
- every production and verification path in the approved M3-PC06 allowlist
- this prompt

# Review target

Review only the current issue #47 working-tree implementation within the exact
M3-PC06 production, scenario, and verification path allowlist. Also inspect the
implementation prompt, this review prompt, and the four minimal status records,
but do not confuse handoff/status text with implementation evidence. Identify
any implementation or verification change outside the approved allowlist.

The implementation handoff records a passing `npm run m3:verify` at 9 test
files / 52 tests, passing probe-core static verification, passing root
typecheck and 108 files / 801 tests, passing `git diff --check`, and a
non-green aggregate `npm run check` caused only by pre-existing out-of-scope M4
formatting/lint findings. Treat every recorded pass, failure attribution, and
summary as a claim to reproduce rather than an independent conclusion.

# Required finding decisions

1. **M3-PC01 — exact adapter, schema, and Expected closure:** confirm every v2
   synthetic byte and behavior remains compatible while v3 accepts only the
   two fixed codegen `observe` scenarios. Trace the complete one-producer
   manifest/runtime-context validator, exact 5/6/1 identities and order,
   profile-specific allowed outcomes/errors, identity-bearing Expected rows,
   before-only source hash, skipped tool change, complete/mismatch semantics,
   and absence of any P2 receipt inference or codegen runtime dependency.
2. **M3-PC02 — held raw content and filesystem identity closure:** trace the
   internal collector's exact raw-only inventory, canonical root/run ID,
   private modes and ownership, no-follow single opens, full BigInt identity,
   duplicate/link/type/size rejection, and held directory/file descriptors.
   Independently confirm initial capture, R1 post-render, and R2 precommit use
   positioned reads on the same originally held raw descriptors, prove exact
   byte count and immediate EOF, recompute the accepted SHA-256, and separately
   revalidate descriptor, logical-path, and ancestor identity without reopen.
3. **M3-PC03 — deterministic derivation and sole-rename publication:** confirm
   the exact two- or five-file inventory is fully rendered in memory with
   deterministic bytes before output creation. Trace exclusive private
   staging, exact writes/sync/read-back/identity and inventory checks, R2,
   serialization/classification/result preconstruction, complete close
   settlement, and final rename. Prove rename to previously absent `derived/`
   is the sole publication commit and last fallible operation, with only the
   preconstructed immutable result returned afterward.
4. **M3-PC04 — rejection preservation, sanitization, and negative closure:**
   map structured/byte/canonical-content failures to only the sanitized
   two-file Inconclusive inventory, and every filesystem/identity/close/rename
   failure to raw preservation plus published absence and at most exact
   staging retention. Confirm no prefix salvage, rejected digest, private
   identity, host path, raw content/output/error, cleanup, or retry. Reproduce
   focused coverage for R1/R2 same-size mutation, descriptor/path/ancestor and
   staging drift, every close gate, rename failure, mode/link/type/inventory
   rejection, raw byte preservation, and zero postcommit hook/branch.
5. **M3-PC05 — evidence and activation separation:** confirm scenario files are
   Expected input, the implementation is static/unit evidence only,
   `derived.staging/` is never evidence, and a future two- or five-file
   `adapter-run` derivation is not automatically selected-profile, profile,
   experiment-matrix, presentation, runtime-enforcement, or other `Observed`.
   Confirm no historical P2/M4 result access, backfill, runtime identity,
   collector activation, package-root filesystem entry, or evidence update was
   added.
6. **M3-PC06 — exact allowlist, static boundary, and test sufficiency:** compare
   every changed implementation/verification path with the approved 11 + 11
   allowlist and status/prompt exceptions. Confirm the package root exports
   only pure v3 validators/collectors, the filesystem collector is internal,
   no CLI/runner/fixture/package script/export/dist/adapter/probe/container or
   other activation edge changed, and the focused behavioral/static tests
   directly observe every contracted negative and publication boundary.

# Review method and safety boundary

- Inspect the complete working-tree diff and exact M3-PC06 allowlist. Preserve
  all unrelated M4, presentation, and user changes.
- Independently derive the v3 schema/Expected/manifest mapping from source and
  trace every filesystem operation and failure edge in the production
  collector. Do not accept status prose or a static name inventory without
  corresponding source and behavioral evidence.
- Inspect all focused tests and the static verifier, including package-root
  import safety and filesystem-activation non-reachability.
- Rerun `npm run m3:verify` and
  `npm run verify:static --workspace packages/probe-core`. Run focused tests or
  source assertions as needed. Reproduce root typecheck/test claims if useful,
  and check the recorded aggregate `npm run check` failure attribution without
  editing unrelated M4 files.
- Use only repository-owned in-memory values and disposable test roots. The
  approved M3 build/test path may refresh ignored compiled/test output but must
  not create or ingest an adapter raw bundle or invoke a production activation.
- Do not modify implementation or verification paths. If a finding remains,
  record `BLOCKED` with the smallest exact M3-PC finding remediation; do not
  repair it in this session.
- Do not run `npm run m3:run:fixture`, a codegen adapter/probe/lifecycle
  scenario, the production collector against a real result, Docker/container
  or runtime-socket operations, retained/historical/result-state access,
  cleanup, retry, repair, publication, deployment, or Remote Git.
- Do not use external network, credentials, host home/environment, or
  third-party communication.

# Decision boundary

The maximum positive decision is approval of issue #47 only at its Docker-free
static/unit implementation boundary and closure of M3-PC01 through M3-PC06 at
that evidence class. It does not approve ingestion, collector activation, a
runtime identity or command, any result review, Docker, or `Observed`
promotion. A positive review may name only the next item already ordered by
the authoritative frozen-research plan; it must not begin that item. A blocked
review names one smallest bounded issue #47 remediation.

# Deliverables

- `docs/reviews/m3-production-raw-to-derived-collector-implementation.md` with
  an `APPROVED` or `BLOCKED` decision, M3-PC01 through M3-PC06 finding-by-
  finding evidence, exact changed-path and transaction analysis, commands
  actually run, evidence classification, limitations, and the one permitted
  next boundary
- minimal status updates in
  `docs/m3-production-raw-to-derived-collector.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item naming the authoritative later boundary only if
  all findings close, otherwise the smallest bounded issue #47 remediation

# Completion report

- Decision and M3-PC01 through M3-PC06 status
- Independently reproduced schema/Expected, held-descriptor content/identity,
  sole-rename transaction, rejection/sanitization, evidence, allowlist, and
  focused/static verification evidence
- Changed files and commands actually run
- Commands intentionally not run, evidence classes, and remaining limitations
- Exact approved next or blocked-remediation boundary
- One concrete `Next:` task
