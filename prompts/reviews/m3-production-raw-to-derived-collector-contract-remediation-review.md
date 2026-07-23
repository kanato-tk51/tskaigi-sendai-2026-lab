# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #47's M3-PC02 through M3-PC05 collector-contract remediation.
Decide whether the repeated raw-content identity and final publication terminal
now close those findings while M3-PC01 and M3-PC06 remain closed, and whether
at most one bounded Docker-free static/unit implementation may proceed. Do not
repair or implement the collector and do not ingest or activate an adapter run.

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
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md`
- `prompts/m3-production-raw-to-derived-collector-contract-remediation.md`
- this prompt

# Required decisions

1. **M3-PC02 — immutable raw content and filesystem identity:** confirm the
   initial accepted capture and exact R1 post-render/R2 precommit checkpoints
   use only the originally held no-follow descriptors; each repeated read
   proves exact byte count and EOF, reproduces SHA-256, and separately checks
   full descriptor, logical-path, and ancestor identity. Reject a reopen,
   path-derived digest, missing checkpoint, or metadata-as-content shortcut.
2. **M3-PC03 — deterministic transaction and sole commit:** trace the exact
   raw-only, in-memory, staged, precommit-settled, rename-failed, and committed
   states. Confirm every raw/derived check, serialization, classification,
   sync, result construction, and descriptor close settles while only
   `derived.staging/` exists, and that successful rename is the sole commit and
   last fallible operation.
3. **M3-PC04 — rejection preservation and negative matrix:** map same-size
   mutation at R1/R2, descriptor/path/ancestor drift, staged identity/read-back,
   every close failure, and rename failure to raw preservation, published
   absence, exact bounded staging retention, sanitized failure, no cleanup, and
   no retry. Confirm safely captured content rejection alone may commit exactly
   the sanitized two-file Inconclusive inventory and that no postcommit failure
   hook or branch is required or permitted.
4. **M3-PC05 — evidence eligibility:** confirm `derived.staging/` and every
   precommit failure are non-evidence; only exact successfully renamed two- or
   five-file inventories are derived evidence; the two-file inventory remains
   Inconclusive; and neither inventory auto-promotes adapter, profile, matrix,
   presentation, runtime-enforcement, or other `Observed` evidence.
5. **Preserved findings and next boundary:** independently confirm codegen
   `observe`, additive v3/v2 separation, manifest/Expected identities,
   unavailable source/tool deltas, historical P2 exclusion, and the exact
   M3-PC06 implementation/negative-test allowlist remain unchanged. If every
   finding closes with no new blocker, approve at most that one already bounded
   Docker-free static/unit implementation. Otherwise name exactly one bounded
   contract-only remediation.

# Review method

- Inspect the complete working-tree diff and preserve all unrelated M4,
  presentation, and user changes.
- Review the transaction as an explicit state machine and enumerate every
  fallible operation relative to the final rename. Reject any implicit
  postcommit validation, close, cleanup, serialization, result construction,
  callback, or classification edge.
- Trace raw content and filesystem identity separately at the initial capture,
  R1, and R2. Confirm positioned full-descriptor reads, exact EOF, and baseline
  digest comparison are complete and do not reopen input.
- Reconcile every required negative class with the unchanged exact later path
  allowlist and verify that the remediation introduced no source, test,
  scenario, package, runtime, result, or evidence change.
- Use only read-only source/reference assertions. Treat historical tests as
  recorded evidence; do not run broad checks merely to repeat them.

# Out of scope

- Editing the remediated contract or changing implementation, tests, scenarios,
  static verifier, package surface, compiled output, raw/results/evidence,
  matrix, Expected, or `Observed`
- Running M3 tests, typecheck, a filesystem-writing build/fixture, an adapter,
  probe, lifecycle scenario, production collector, Docker/container/runtime-
  socket operation, retained/result-state access, cleanup, retry, or repair
- Choosing a runtime identity, run ID, profile revision, image digest, result
  root, command, activation, or measurement generation
- Historical P2/M4 result-root access, issue #43, or any later backlog item
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m3-production-raw-to-derived-collector-contract-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M3-PC01 through M3-PC06 status,
  independently traced content/identity and transaction state machines,
  rejection/evidence decisions, limitations, and the one permitted next
  boundary
- minimal status updates in `docs/m3-production-raw-to-derived-collector.md`,
  `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`

# Verification

Use focused read-only contract/reference assertions, a focused formatter check
over changed review/status files, and `git diff --check`. Do not run M3 tests,
typecheck, a filesystem-writing build or fixture, an adapter, Docker, a
production collector, result-root inspection, or a broad verification command.

# Completion report

- Decision and M3-PC01 through M3-PC06 status
- Exact initial capture, R1/R2, precommit settlement, and sole-rename state
  machine
- Rejection, sanitization, staging, and evidence-class decisions
- Changed files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact approved implementation or blocked remediation boundary
- One concrete `Next:` task
